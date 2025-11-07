"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { BookVisibility } from "@prisma/client";

export type BookPermissionContext = {
  userId: string | null;
  isOwner: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

/**
 * Get the current authenticated user from the database
 * @throws {Error} If user is not authenticated or not found in database
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  return user;
}

/**
 * Get current user ID from Clerk (optional - returns null if not authenticated)
 * Use this for operations that work both authenticated and unauthenticated
 */
export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId;
}

/**
 * Require authentication - throws if not authenticated
 * Use this for operations that require authentication
 * @throws {Error} If user is not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
}

/**
 * Check if current user can view a specific book
 * Rules:
 * - Owner can always view
 * - PUBLIC books can be viewed by anyone
 * - PRIVATE books only by owner
 * - FRIENDS books only by owner and friends (future)
 * - UNLISTED books by anyone with direct link (future)
 */
export async function checkBookViewPermission(
  bookId: number
): Promise<BookPermissionContext> {
  const { userId } = await auth();

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { owner: true },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  const isOwner = userId === book.owner.clerkId;

  // Permission rules
  const canView =
    isOwner ||
    book.visibility === BookVisibility.PUBLIC ||
    book.visibility === BookVisibility.UNLISTED; // Future: accessible via direct link

  return {
    userId,
    isOwner,
    canView,
    canEdit: isOwner,
    canDelete: isOwner,
  };
}

/**
 * Check if current user owns a book
 * @throws {Error} If user is not authenticated or doesn't own the book
 */
export async function requireBookOwnership(bookId: number) {
  const user = await getCurrentUser();

  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  if (book.ownerId !== user.id) {
    throw new Error("Unauthorized: You don't own this book");
  }

  return { user, book };
}

/**
 * Build Prisma filter for books that current user can view
 * Returns filter that shows:
 * - PUBLIC books (visible to everyone)
 * - User's own books (all visibility levels) if authenticated
 */
export async function getViewableBookFilter() {
  const userId = await getCurrentUserId();

  if (!userId) {
    // Not authenticated - only show public books
    return { visibility: BookVisibility.PUBLIC };
  }

  // Authenticated - show public books OR user's own books
  return {
    OR: [
      { visibility: BookVisibility.PUBLIC },
      {
        owner: {
          clerkId: userId,
        },
      },
    ],
  };
}

/**
 * Update book visibility
 * @throws {Error} If user is not authenticated or doesn't own the book
 */
export async function updateBookVisibility(
  bookId: number,
  visibility: BookVisibility
) {
  const { user } = await requireBookOwnership(bookId);

  return await prisma.book.update({
    where: { id: bookId },
    data: { visibility },
  });
}
