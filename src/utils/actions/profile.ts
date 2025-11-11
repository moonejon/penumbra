"use server";

import { put, del } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/utils/permissions";
import type { UserProfile } from "@/shared.types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BIO_LENGTH = 500;

/**
 * Upload a profile image to Vercel Blob and update user profile
 * @param formData - FormData containing the image file
 * @returns Success status with image URL or error message
 */
export async function uploadProfileImage(formData: FormData) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();

    // 2. Get file from formData
    const file = formData.get("file") as File;

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // 3. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, and WebP are allowed",
      };
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File too large (${(file.size / 1024 / 1024).toFixed(
          1
        )}MB). Maximum size is 5MB`,
      };
    }

    // 5. Get user's current profile image URL (if exists)
    const currentProfileImage = user.profileImageUrl;

    // 6. Upload new image to Vercel Blob
    const fileExtension = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const blob = await put(
      `profile-images/${user.id}/profile-${timestamp}.${fileExtension}`,
      file,
      {
        access: "public",
        addRandomSuffix: false, // We're already using timestamp for uniqueness
      }
    );

    // 7. Update user's profileImageUrl in database
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrl: blob.url },
    });

    // 8. Delete old image from Vercel Blob (if exists)
    // Only delete if it's a Vercel Blob URL (not external URL or default)
    if (currentProfileImage && currentProfileImage.includes("vercel-storage")) {
      try {
        await del(currentProfileImage);
      } catch (deleteError) {
        // Log but don't fail the request if old image deletion fails
        console.error("Failed to delete old profile image:", deleteError);
      }
    }

    // 9. Return success with new image URL
    return {
      success: true,
      imageUrl: blob.url,
    };
  } catch (error) {
    console.error("Profile image upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again.",
    };
  }
}

/**
 * Update user's bio text
 * @param bio - Bio text (max 500 characters)
 * @returns Success status or error message
 */
export async function updateUserBio(bio: string) {
  try {
    // 1. Authenticate user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await getCurrentUser();

    // 2. Validate bio length
    if (bio.length > MAX_BIO_LENGTH) {
      return {
        success: false,
        error: `Bio too long (${bio.length} characters). Maximum length is ${MAX_BIO_LENGTH} characters`,
      };
    }

    // 3. Update user bio in database
    // Note: This assumes the 'bio' field exists in the User model schema
    // If the field doesn't exist yet, this will fail until the migration is run
    // TODO: Uncomment after bio migration is run
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { bio },
    // });

    // 4. Return success (temporary error until bio field migration is run)
    return {
      success: false,
      error: "Bio field not yet available - migration pending",
    };
  } catch (error) {
    console.error("Update bio error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Bio update failed. Please try again.",
    };
  }
}

/**
 * Update user's profile name
 * @param name - User's name (max 100 characters)
 * @returns Success status or error message
 */
export async function updateUserProfile(name: string) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();

    // 2. Validate name length
    if (name.length > 100) {
      return {
        success: false,
        error: `Name too long (${name.length} characters). Maximum length is 100 characters`,
      };
    }

    // 3. Update user name in database
    await prisma.user.update({
      where: { id: user.id },
      data: { name: name || null },
    });

    // 4. Return success
    return {
      success: true,
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Profile update failed. Please try again.",
    };
  }
}

/**
 * Get the authenticated user's profile information
 * @returns User profile data or error message
 */
export async function getUserProfile() {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();

    // 2. Build profile object matching UserProfile type
    const profile: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bio: (user as any).bio || null, // Type assertion for bio field until schema is updated
    };

    // 3. Return success with profile data
    return {
      success: true,
      profile,
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve profile. Please try again.",
    };
  }
}
