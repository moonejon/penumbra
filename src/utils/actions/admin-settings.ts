"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Admin Clerk ID - only this user can access admin settings
const ADMIN_CLERK_ID = process.env.ADMIN_CLERK_ID;

/**
 * Check if the current user is an admin
 * @returns boolean indicating if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId || !ADMIN_CLERK_ID) {
      return false;
    }
    return clerkId === ADMIN_CLERK_ID;
  } catch {
    return false;
  }
}

/**
 * Require admin access - throws error if not admin
 * Use this at the start of any admin-only action
 */
async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}

/**
 * Get all users for the admin dropdown
 * @returns List of users with id, clerkId, name, and email
 */
export async function getAllUsersForAdmin() {
  await requireAdmin();

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        profileImageUrl: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error("Get all users error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
      users: [],
    };
  }
}

/**
 * Get the current app settings
 * @returns Current AppSettings record
 */
export async function getAppSettings() {
  await requireAdmin();

  try {
    // Get or create the singleton settings record
    let settings = await prisma.appSettings.findUnique({
      where: { id: 1 },
    });

    // If no settings exist, create the singleton record
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          id: 1,
          defaultUserClerkId: null,
        },
      });
    }

    return {
      success: true,
      settings,
    };
  } catch (error) {
    console.error("Get app settings error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch settings",
      settings: null,
    };
  }
}

/**
 * Update the default user for the home page
 * @param clerkId - The Clerk ID of the user to set as default (or null to clear)
 * @returns Success status
 */
export async function updateDefaultUser(clerkId: string | null) {
  await requireAdmin();

  try {
    // Validate that the user exists if a clerkId is provided
    if (clerkId) {
      const userExists = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true },
      });

      if (!userExists) {
        return {
          success: false,
          error: "Selected user does not exist",
        };
      }
    }

    // Upsert the settings record
    await prisma.appSettings.upsert({
      where: { id: 1 },
      update: {
        defaultUserClerkId: clerkId,
      },
      create: {
        id: 1,
        defaultUserClerkId: clerkId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update default user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update settings",
    };
  }
}

/**
 * Get the default user Clerk ID from app settings
 * This is used by home-page.ts to determine which profile to show
 * Does NOT require admin access - this is a public read
 * @returns The default user's Clerk ID or null if not configured
 */
export async function getDefaultUserClerkId(): Promise<string | null> {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: 1 },
      select: { defaultUserClerkId: true },
    });

    return settings?.defaultUserClerkId || null;
  } catch (error) {
    console.error("Get default user clerk ID error:", error);
    return null;
  }
}
