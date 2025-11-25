"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { UserProfile, ReadingListWithBooks } from "@/shared.types";

// Define clear result types
export type HomePageStatus =
  | "success"
  | "not_configured" // DEFAULT_USER_ID not set
  | "user_not_found" // User doesn't exist in database
  | "error";

export interface HomePagePermissions {
  canView: boolean;
  canEdit: boolean;
  canViewPrivateLists: boolean;
  canViewPrivateBooks: boolean;
}

export interface HomePageResult {
  status: HomePageStatus;
  error?: string;
  profile: UserProfile | null;
  readingLists: ReadingListWithBooks[];
  permissions: HomePagePermissions;
  isOwner: boolean;
}

/**
 * Unified function to get all home page data
 * Handles both authenticated and public views with ONE code path
 *
 * Logic:
 * 1. Check if user is authenticated (get Clerk userId)
 * 2. If authenticated -> show their own profile and all their lists
 * 3. If NOT authenticated -> check for DEFAULT_USER_ID and show public profile/lists
 * 4. Calculate permissions based on ownership
 * 5. Return unified result with status, data, and permissions
 */
export async function getHomePageData(): Promise<HomePageResult> {
  try {
    // 1. Check authentication
    const { userId: clerkId } = await auth();

    // 2. Determine which user's profile to show
    let targetClerkId: string | null = null;
    let isOwner = false;

    if (clerkId) {
      // Authenticated: show own profile
      targetClerkId = clerkId;
      isOwner = true;
    } else {
      // Not authenticated: check for default user
      const defaultUserId = process.env.DEFAULT_USER_ID?.trim();

      if (!defaultUserId) {
        // No default user configured - return error state
        return {
          status: "not_configured",
          error: "DEFAULT_USER_ID environment variable is not configured",
          profile: null,
          readingLists: [],
          permissions: {
            canView: false,
            canEdit: false,
            canViewPrivateLists: false,
            canViewPrivateBooks: false,
          },
          isOwner: false,
        };
      }

      targetClerkId = defaultUserId;
      isOwner = false;
    }

    // 3. Calculate permissions based on ownership
    const permissions: HomePagePermissions = {
      canView: true,
      canEdit: isOwner,
      canViewPrivateLists: isOwner,
      canViewPrivateBooks: isOwner,
    };

    // 4. Fetch user profile (ONE code path)
    const profile = await fetchUserProfile(targetClerkId);

    if (!profile) {
      // User doesn't exist in database
      return {
        status: "user_not_found",
        error: `User with ID ${targetClerkId} not found in database`,
        profile: null,
        readingLists: [],
        permissions,
        isOwner,
      };
    }

    // 5. Fetch reading lists (ONE code path with permission-aware filtering)
    const readingLists = await fetchReadingLists(targetClerkId, permissions);

    // 6. Return success result
    return {
      status: "success",
      profile,
      readingLists,
      permissions,
      isOwner,
    };
  } catch (error) {
    console.error("Get home page data error:", error);
    return {
      status: "error",
      error:
        error instanceof Error
          ? error.message
          : "Failed to load home page data",
      profile: null,
      readingLists: [],
      permissions: {
        canView: false,
        canEdit: false,
        canViewPrivateLists: false,
        canViewPrivateBooks: false,
      },
      isOwner: false,
    };
  }
}

/**
 * Unified profile fetch - ONE function for all cases
 * Fetches user by Clerk ID and returns consistent UserProfile structure
 *
 * @param clerkId - The Clerk ID of the user to fetch
 * @returns UserProfile or null if not found
 */
async function fetchUserProfile(clerkId: string): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        profileImageUrl: true,
        githubUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
        letterboxdUrl: true,
        spotifyUrl: true,
      },
    });

    if (!user) {
      return null;
    }

    // Build consistent UserProfile object
    return {
      id: user.clerkId,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      bio: null, // Bio field doesn't exist in schema yet
      githubUrl: user.githubUrl || null,
      instagramUrl: user.instagramUrl || null,
      linkedinUrl: user.linkedinUrl || null,
      letterboxdUrl: user.letterboxdUrl || null,
      spotifyUrl: user.spotifyUrl || null,
    };
  } catch (error) {
    console.error("Fetch user profile error:", error);
    return null;
  }
}

/**
 * Unified reading lists fetch with permission-aware filtering
 * ONE function that handles both owner and public views
 *
 * @param ownerClerkId - Clerk ID of the user whose lists to fetch
 * @param permissions - Permissions object determining visibility
 * @returns Array of reading lists with books (filtered by permissions)
 */
async function fetchReadingLists(
  ownerClerkId: string,
  permissions: HomePagePermissions
): Promise<ReadingListWithBooks[]> {
  try {
    // First, get the user's internal ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: ownerClerkId },
      select: { id: true },
    });

    if (!user) {
      return [];
    }

    // Build where clause based on permissions
    const whereClause: {
      ownerId: number;
      visibility?: "PUBLIC";
    } = {
      ownerId: user.id,
    };

    // If not owner, only show PUBLIC lists
    if (!permissions.canViewPrivateLists) {
      whereClause.visibility = "PUBLIC";
    }

    // Fetch lists with books
    const lists = await prisma.readingList.findMany({
      where: whereClause,
      include: {
        books: {
          take: 4, // Only fetch first 4 books for cover preview
          orderBy: {
            position: "asc",
          },
          include: {
            book: true, // Fetch all book fields
          },
        },
        _count: {
          select: { books: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Filter books based on permissions
    if (!permissions.canViewPrivateBooks) {
      // Filter out PRIVATE books from each list
      return lists.map((list) => ({
        ...list,
        books: list.books.filter((entry) => entry.book.visibility === "PUBLIC"),
      })) as ReadingListWithBooks[];
    }

    // Owner can see all books - cast to ensure type compatibility
    return lists as ReadingListWithBooks[];
  } catch (error) {
    console.error("Fetch reading lists error:", error);
    return [];
  }
}
