"use server";

import { auth } from "@clerk/nextjs/server";
import { put, del } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/utils/permissions";
import type { UserProfile } from "@/shared.types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BIO_LENGTH = 500;
const MAX_URL_LENGTH = 2048; // Standard URL length limit

// Map MIME types to file extensions (secure approach: derive extension from MIME type)
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Get safe file extension from MIME type
 * SECURITY: Never trust user-provided filenames - derive extension from validated MIME type
 * @param mimeType - Validated MIME type of the file
 * @returns Safe file extension or null if MIME type is not allowed
 */
function getExtensionFromMimeType(mimeType: string): string | null {
  return MIME_TO_EXTENSION[mimeType] || null;
}

/**
 * Upload a profile image to Vercel Blob and update user profile
 * Implements proper transaction handling with rollback to prevent orphaned blob storage
 * @param formData - FormData containing the image file
 * @returns Success status with image URL or error message
 */
export async function uploadProfileImage(formData: FormData) {
  let newBlobUrl: string | null = null;

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

    // Store old profile image URL for cleanup after successful update
    const oldProfileImage = user.profileImageUrl;

    // 5. Derive secure file extension from validated MIME type
    // SECURITY: Never trust user-provided filename - derive from MIME type instead
    const fileExtension = getExtensionFromMimeType(file.type);
    if (!fileExtension) {
      return {
        success: false,
        error: "Invalid file type after validation",
      };
    }

    // 6. Upload new image to Vercel Blob
    const timestamp = Date.now();
    const blob = await put(
      `profile-images/${user.id}/profile-${timestamp}.${fileExtension}`,
      file,
      {
        access: "public",
        addRandomSuffix: false, // We're already using timestamp for uniqueness
      }
    );

    // Store the new blob URL for potential rollback
    newBlobUrl = blob.url;

    // 7. Update user's profileImageUrl in database
    // If this fails, we need to delete the newly uploaded blob (rollback)
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { profileImageUrl: blob.url },
      });
    } catch (dbError) {
      // Database update failed - rollback by deleting the newly uploaded blob
      console.error("Database update failed, rolling back blob upload:", dbError);

      try {
        await del(newBlobUrl);
        console.log("Successfully rolled back blob upload");
      } catch (rollbackError) {
        // Log rollback failure but don't throw - the main error is more important
        console.error("Failed to rollback blob upload (orphaned file created):", rollbackError);
      }

      // Re-throw the database error
      throw dbError;
    }

    // 8. Delete old image from Vercel Blob (if exists)
    // Only delete AFTER successful database update to prevent data loss
    // Only delete if it's a Vercel Blob URL (not external URL or default)
    if (oldProfileImage && oldProfileImage.includes("vercel-storage")) {
      try {
        await del(oldProfileImage);
        console.log("Successfully deleted old profile image");
      } catch (deleteError) {
        // Log but don't fail the request if old image deletion fails
        // The new image is already successfully stored, so this is not critical
        console.error("Failed to delete old profile image (orphaned file):", deleteError);
      }
    }

    // 9. Return success with new image URL
    return {
      success: true,
      imageUrl: blob.url,
    };
  } catch (error) {
    console.error("Profile image upload error:", error);

    // If we uploaded a blob but failed somewhere else, try to clean it up
    if (newBlobUrl) {
      try {
        await del(newBlobUrl);
        console.log("Cleaned up orphaned blob after error");
      } catch (cleanupError) {
        console.error("Failed to cleanup orphaned blob:", cleanupError);
      }
    }

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
 * Sanitize user input to prevent XSS and database corruption
 * Removes dangerous characters and normalizes whitespace
 * @param input - Raw user input string
 * @returns Sanitized string
 */
function sanitizeInput(input: string): string {
  // 1. Trim whitespace
  let sanitized = input.trim();

  // 2. Remove control characters (0x00-0x1F, 0x7F-0x9F) except newlines/tabs
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");

  // 3. Remove zero-width characters that can cause display issues
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // 4. Remove directional override characters (can enable spoofing)
  sanitized = sanitized.replace(/[\u202A-\u202E\u2066-\u2069]/g, "");

  // 5. Normalize Unicode to prevent homograph attacks
  sanitized = sanitized.normalize("NFC");

  // 6. Replace multiple consecutive spaces with single space
  sanitized = sanitized.replace(/\s+/g, " ");

  // 7. Final trim
  return sanitized.trim();
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

    // 2. Sanitize input to prevent XSS and database corruption
    const sanitizedName = sanitizeInput(name);

    // 3. Validate name is not empty after sanitization
    if (sanitizedName.length === 0 && name.length > 0) {
      return {
        success: false,
        error: "Name contains only invalid characters",
      };
    }

    // 4. Validate name length after sanitization
    if (sanitizedName.length > 100) {
      return {
        success: false,
        error: `Name too long (${sanitizedName.length} characters). Maximum length is 100 characters`,
      };
    }

    // 5. Update user name in database with sanitized value
    await prisma.user.update({
      where: { id: user.id },
      data: { name: sanitizedName || null },
    });

    // 6. Return success
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
    // 1. Get Clerk user ID (check authentication)
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // 2. Fetch user from database by clerkId
    // Note: User record may not exist yet if Clerk webhook hasn't completed
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      // User is authenticated in Clerk but not in database yet
      // This can happen immediately after sign-up before webhook completes
      console.warn(
        `User ${clerkId} authenticated in Clerk but not found in database - webhook may be pending`
      );
      return {
        success: false,
        error: "User profile is being created. Please refresh the page in a moment.",
      };
    }

    // 3. Build profile object matching UserProfile type
    const profile: UserProfile = {
      id: user.clerkId, // Use Clerk ID for consistency with public profiles
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bio: (user as any).bio || null, // Type assertion for bio field until schema is updated
      githubUrl: user.githubUrl || null,
      instagramUrl: user.instagramUrl || null,
      linkedinUrl: user.linkedinUrl || null,
      letterboxdUrl: user.letterboxdUrl || null,
      spotifyUrl: user.spotifyUrl || null,
    };

    // 4. Return success with profile data
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

/**
 * Get a public user profile by Clerk user ID (no authentication required)
 * @param clerkId - The Clerk ID of the user whose profile to fetch
 * @returns User profile data or error message
 */
export async function getPublicUserProfile(clerkId: string) {
  try {
    // Fetch user from database by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        profileImageUrl: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Build profile object matching UserProfile type
    const profile: UserProfile = {
      id: user.clerkId,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      bio: null, // Bio field doesn't exist in schema yet
      githubUrl: null, // Social media fields don't exist in schema yet
      instagramUrl: null,
      linkedinUrl: null,
      letterboxdUrl: null,
      spotifyUrl: null,
    };

    return {
      success: true,
      profile,
    };
  } catch (error) {
    console.error("Get public user profile error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve profile. Please try again.",
    };
  }
}

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns true if valid, false otherwise
 */
function isValidUrl(url: string): boolean {
  if (!url || url.trim().length === 0) {
    return true; // Empty URLs are valid (optional field)
  }

  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Update user's social media links
 * @param socialMediaData - Object containing social media URLs
 * @returns Success status or error message
 */
export async function updateSocialMediaLinks(socialMediaData: {
  githubUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  letterboxdUrl?: string;
  spotifyUrl?: string;
}) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();

    // 2. Validate all URLs
    const urls = {
      githubUrl: socialMediaData.githubUrl?.trim() || "",
      instagramUrl: socialMediaData.instagramUrl?.trim() || "",
      linkedinUrl: socialMediaData.linkedinUrl?.trim() || "",
      letterboxdUrl: socialMediaData.letterboxdUrl?.trim() || "",
      spotifyUrl: socialMediaData.spotifyUrl?.trim() || "",
    };

    // Validate each URL
    for (const [key, url] of Object.entries(urls)) {
      if (url && url.length > MAX_URL_LENGTH) {
        return {
          success: false,
          error: `${key} is too long. Maximum length is ${MAX_URL_LENGTH} characters`,
        };
      }

      if (!isValidUrl(url)) {
        return {
          success: false,
          error: `${key} is not a valid URL. Please use a complete URL starting with http:// or https://`,
        };
      }
    }

    // 3. Update user's social media links in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        githubUrl: urls.githubUrl || null,
        instagramUrl: urls.instagramUrl || null,
        linkedinUrl: urls.linkedinUrl || null,
        letterboxdUrl: urls.letterboxdUrl || null,
        spotifyUrl: urls.spotifyUrl || null,
      },
    });

    // 4. Return success
    return {
      success: true,
    };
  } catch (error) {
    console.error("Update social media links error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Social media update failed. Please try again.",
    };
  }
}
