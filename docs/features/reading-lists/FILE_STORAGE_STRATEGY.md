# File Storage Strategy for Penumbra

## Overview

This document outlines the file storage strategy for Penumbra's profile image upload feature, including solution evaluation, recommended implementation, security considerations, and optimization techniques.

## Requirements

### Functional Requirements
- Users can upload custom profile pictures
- Support JPEG, PNG, and WebP formats
- Store and serve images via URL
- Delete old images when user uploads new one
- Provide default placeholder for users without profile image

### Non-Functional Requirements
- **Performance**: Fast upload and retrieval (< 2s upload, < 100ms retrieval)
- **Security**: Prevent unauthorized access, validate file types and sizes
- **Scalability**: Handle growing number of users and images
- **Cost**: Minimize storage and bandwidth costs
- **Simplicity**: Easy integration with existing Next.js/Vercel stack

### Technical Constraints
- Deployed on Vercel (serverless functions, no persistent filesystem)
- Next.js 14+ with Server Actions
- TypeScript for type safety
- Prisma for database ORM

## Solution Evaluation

### Option 1: Vercel Blob (RECOMMENDED)

**Overview**: Vercel's native file storage solution, built for serverless deployments.

**Advantages**:
- **Zero Configuration**: Native Vercel integration, no external accounts needed
- **Simple API**: `@vercel/blob` package with put/del operations
- **CDN Distribution**: Automatic global CDN for fast delivery
- **Signed URLs**: Built-in private file access with time-limited URLs
- **Vercel Dashboard**: Easy file management and monitoring
- **Serverless-Friendly**: Designed for Vercel's edge network
- **Free Tier**: 1GB storage, 10GB bandwidth/month (sufficient for MVP)

**Disadvantages**:
- **Vendor Lock-In**: Tied to Vercel platform
- **Limited Customization**: Less control than S3
- **Cost at Scale**: More expensive than S3 for large volumes (after free tier)

**Pricing** (as of 2025):
- Free: 1GB storage, 10GB bandwidth/month
- Pro: $0.15/GB storage, $0.10/GB bandwidth
- **Estimate**: For 1,000 users with 100KB profile images = 100MB storage + ~1GB bandwidth/month = FREE

**Integration Complexity**: LOW (2-3 hours)

**Best For**: New projects, Vercel deployments, simple file storage needs

---

### Option 2: AWS S3

**Overview**: Industry-standard object storage with comprehensive features.

**Advantages**:
- **Cost-Effective at Scale**: $0.023/GB storage, $0.09/GB bandwidth (lower than Vercel Blob)
- **Granular Control**: IAM policies, bucket policies, fine-grained permissions
- **Feature-Rich**: Versioning, lifecycle policies, cross-region replication
- **No Vendor Lock-In**: Can migrate to other S3-compatible services (Cloudflare R2, Backblaze B2)
- **Integration Ecosystem**: Works with CloudFront CDN, Lambda@Edge

**Disadvantages**:
- **Complex Setup**: Requires AWS account, IAM configuration, bucket setup
- **More Code**: Need AWS SDK, presigned URL generation, error handling
- **Configuration Overhead**: CORS, bucket policies, access keys management
- **Security Risks**: Misconfigured buckets can expose files publicly

**Pricing** (as of 2025):
- Storage: $0.023/GB
- Bandwidth: $0.09/GB (first 10TB)
- Requests: $0.005 per 1,000 PUT requests
- **Estimate**: For 1,000 users = $2-3/month (storage + bandwidth)

**Integration Complexity**: MEDIUM (6-8 hours)

**Best For**: Large-scale applications, existing AWS infrastructure, cost optimization at scale

---

### Option 3: Cloudinary

**Overview**: Media management platform with advanced image transformation.

**Advantages**:
- **Advanced Image Processing**: On-the-fly resize, crop, format conversion, quality optimization
- **Responsive Images**: Automatic responsive image generation for different devices
- **AI Features**: Auto-cropping, background removal, content-aware transformations
- **CDN Built-In**: Global CDN with automatic optimization
- **Easy API**: Simple upload and transformation APIs
- **Free Tier**: 25GB storage, 25GB bandwidth/month

**Disadvantages**:
- **Overkill**: Most features unnecessary for simple profile images
- **More Expensive**: $89/month after free tier (vs. Vercel Blob $15/month)
- **Complexity**: More features = more complexity
- **External Dependency**: Another third-party service to manage

**Pricing** (as of 2025):
- Free: 25GB storage, 25GB bandwidth/month
- Plus: $89/month for 100GB storage, 100GB bandwidth
- **Estimate**: Free tier sufficient for MVP

**Integration Complexity**: MEDIUM (4-5 hours)

**Best For**: Image-heavy applications, complex image transformations, rich media platforms

---

### Option 4: Local Filesystem (NOT RECOMMENDED)

**Overview**: Store files on server filesystem.

**Advantages**:
- **Simple Development**: Easy local testing
- **No External Dependencies**: No third-party services
- **Zero Cost**: No storage fees

**Disadvantages**:
- **Not Compatible with Vercel**: Serverless functions are stateless (ephemeral filesystem)
- **No Scalability**: Cannot scale horizontally
- **No CDN**: Slow global access
- **Data Loss Risk**: Files lost when server restarts

**Pricing**: FREE

**Integration Complexity**: LOW (1-2 hours) - but NOT PRODUCTION-READY

**Best For**: Local development only, NOT for production

---

## Recommendation: Vercel Blob

**Winner: Vercel Blob** is the recommended solution for Penumbra because:

1. **Native Integration**: Zero configuration, works seamlessly with Vercel deployment
2. **Simplicity**: Minimal code, easy to implement and maintain
3. **Cost-Effective for MVP**: Free tier covers initial users, reasonable pricing at scale
4. **Serverless-Friendly**: Built for Vercel's architecture
5. **Fast Implementation**: 2-3 hours to implement vs. 6-8 hours for S3
6. **Sufficient Features**: Profile images don't need advanced transformations

**When to Reconsider**: If Penumbra scales to 10,000+ users or needs complex image transformations, reevaluate AWS S3 or Cloudinary.

---

## Implementation Guide: Vercel Blob

### Step 1: Install Dependencies

```bash
cd /Users/jonathan/github/penumbra/.conductor/monrovia
npm install @vercel/blob
```

### Step 2: Configure Environment Variables

Add to `.env.local` (local development):
```bash
# Vercel Blob (automatically set in Vercel deployments)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_XXXXXXXXXXXXX"
```

**Note**: In production, Vercel automatically sets `BLOB_READ_WRITE_TOKEN` when you enable Blob Storage in your project settings.

### Step 3: Enable Vercel Blob in Dashboard

1. Go to Vercel Dashboard → Your Project → Settings → Storage
2. Click "Create Store" → Select "Blob"
3. Name: "penumbra-profile-images"
4. Click "Create"
5. Token automatically added to environment variables

### Step 4: Create Upload Server Action

Create `/src/utils/actions/profile.ts`:

```typescript
"use server";

import { put, del } from "@vercel/blob";
import { getCurrentUser } from "@/utils/permissions";
import prisma from "@/lib/prisma";

// Validation constants
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload user's profile image to Vercel Blob
 * Deletes old image if exists
 */
export async function uploadProfileImage(formData: FormData) {
  try {
    const user = await getCurrentUser();
    const file = formData.get("file") as File;

    // Validate file exists
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "File too large. Maximum size is 5MB.",
      };
    }

    // Get existing profile image URL
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { profileImageUrl: true },
    });

    // Delete old image if exists
    if (existingUser?.profileImageUrl) {
      try {
        await del(existingUser.profileImageUrl);
      } catch (error) {
        // Log but don't fail (old file might not exist)
        console.warn("Failed to delete old profile image:", error);
      }
    }

    // Upload new image to Vercel Blob
    const fileExtension = file.type.split("/")[1];
    const blob = await put(`users/${user.id}/profile.${fileExtension}`, file, {
      access: "public", // Public access for profile images
      addRandomSuffix: false, // Use consistent filename
    });

    // Update user's profile image URL in database
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrl: blob.url },
    });

    return {
      success: true,
      profileImageUrl: blob.url,
    };
  } catch (error) {
    console.error("Profile image upload error:", error);
    return {
      success: false,
      error: "Failed to upload profile image. Please try again.",
    };
  }
}

/**
 * Delete user's profile image
 * Sets profileImageUrl to null (app will show default)
 */
export async function deleteProfileImage() {
  try {
    const user = await getCurrentUser();

    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { profileImageUrl: true },
    });

    if (!existingUser?.profileImageUrl) {
      return {
        success: false,
        error: "No profile image to delete",
      };
    }

    // Delete from Vercel Blob
    await del(existingUser.profileImageUrl);

    // Clear profile image URL in database
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrl: null },
    });

    return { success: true };
  } catch (error) {
    console.error("Profile image deletion error:", error);
    return {
      success: false,
      error: "Failed to delete profile image. Please try again.",
    };
  }
}
```

### Step 5: Create Upload UI Component

Create `/src/components/ProfileImageUpload.tsx`:

```typescript
"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadProfileImage, deleteProfileImage } from "@/utils/actions/profile";

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  userName?: string;
}

export function ProfileImageUpload({
  currentImageUrl,
  userName,
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadProfileImage(formData);

    if (result.success) {
      setImageUrl(result.profileImageUrl);
    } else {
      setError(result.error || "Upload failed");
    }

    setUploading(false);
  }

  async function handleDelete() {
    if (!confirm("Delete profile image?")) return;

    setUploading(true);
    setError(null);

    const result = await deleteProfileImage();

    if (result.success) {
      setImageUrl(null);
    } else {
      setError(result.error || "Deletion failed");
    }

    setUploading(false);
  }

  // Default avatar if no image
  const avatarUrl = imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&size=400&background=random`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
        <Image
          src={avatarUrl}
          alt="Profile"
          fill
          className="object-cover"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {uploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {imageUrl && (
          <button
            onClick={handleDelete}
            disabled={uploading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        JPEG, PNG, or WebP. Max 5MB.
      </p>
    </div>
  );
}
```

### Step 6: Integrate into Profile Page

Update `/src/app/profile/page.tsx`:

```typescript
import { getCurrentUser } from "@/utils/permissions";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Image</h2>

        <ProfileImageUpload
          currentImageUrl={user.profileImageUrl}
          userName={user.name || user.email}
        />
      </div>

      {/* Other profile settings... */}
    </div>
  );
}
```

---

## Security Considerations

### 1. File Type Validation

**Server-Side Validation** (REQUIRED):
```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

if (!ALLOWED_TYPES.includes(file.type)) {
  return { success: false, error: "Invalid file type" };
}
```

**Client-Side Validation** (user experience):
```html
<input type="file" accept="image/jpeg,image/png,image/webp" />
```

**Magic Bytes Validation** (advanced, optional):
```typescript
// Verify actual file content, not just MIME type
import { fileTypeFromBuffer } from "file-type";

const buffer = await file.arrayBuffer();
const fileType = await fileTypeFromBuffer(Buffer.from(buffer));

if (!["jpg", "png", "webp"].includes(fileType?.ext || "")) {
  return { success: false, error: "Invalid file format" };
}
```

### 2. File Size Limits

**Hard Limit**: 5MB (prevents abuse and storage costs)
```typescript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (file.size > MAX_SIZE) {
  return { success: false, error: "File too large" };
}
```

### 3. Filename Sanitization

**Use User ID in Path** (prevents path traversal):
```typescript
// Good: User cannot control path
`users/${user.id}/profile.jpg`

// Bad: User could inject path
`users/${userInput}/profile.jpg` // Never do this!
```

### 4. Access Control

**Public vs. Private Images**:

For **public profiles** (recommended):
```typescript
const blob = await put(path, file, {
  access: "public", // Anyone can view via URL
  addRandomSuffix: false,
});
```

For **private profiles**:
```typescript
// Upload as private
const blob = await put(path, file, {
  access: "private", // Requires signed URL
  addRandomSuffix: true,
});

// Generate signed URL (expires in 1 hour)
import { generateSignedUrl } from "@vercel/blob";

const signedUrl = await generateSignedUrl(blob.url, {
  expiresIn: 3600, // 1 hour
});
```

**Recommendation**: Use **public** access for profile images (simpler, faster, better caching).

### 5. Rate Limiting

**Prevent Upload Spam**:
```typescript
// Track uploads per user per hour
import { ratelimit } from "@/lib/ratelimit"; // Use Upstash Redis

const { success } = await ratelimit.limit(`upload:${user.id}`);

if (!success) {
  return { success: false, error: "Too many uploads. Try again later." };
}
```

### 6. Authentication Check

**Always verify user is authenticated**:
```typescript
export async function uploadProfileImage(formData: FormData) {
  const user = await getCurrentUser(); // Throws if not authenticated
  // ... rest of logic
}
```

---

## Image Optimization

### 1. Client-Side Resize (Before Upload)

**Use Browser Canvas API** to resize before upload:

```typescript
async function resizeImage(file: File, maxSize: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Resize to max 400x400
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        resolve(blob!);
      }, "image/jpeg", 0.85); // 85% quality
    };
  });
}

// Usage
async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  // Resize to 400x400 before upload
  const resizedBlob = await resizeImage(file, 400);

  const formData = new FormData();
  formData.append("file", resizedBlob, "profile.jpg");

  await uploadProfileImage(formData);
}
```

### 2. Server-Side Optimization (Optional)

**Use Sharp library** for server-side processing:

```bash
npm install sharp
```

```typescript
import sharp from "sharp";

export async function uploadProfileImage(formData: FormData) {
  const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Optimize image
  const optimizedBuffer = await sharp(buffer)
    .resize(400, 400, { fit: "cover" }) // Resize to 400x400
    .jpeg({ quality: 85 }) // Compress to 85% quality
    .toBuffer();

  // Upload optimized buffer
  const blob = await put(`users/${user.id}/profile.jpg`, optimizedBuffer, {
    access: "public",
    contentType: "image/jpeg",
  });

  // ... rest of logic
}
```

### 3. Next.js Image Component

**Use Next.js Image for Optimized Display**:

```typescript
import Image from "next/image";

<Image
  src={profileImageUrl}
  alt="Profile"
  width={400}
  height={400}
  className="rounded-full"
  priority={false} // Lazy load
/>
```

Next.js automatically:
- Serves WebP for supported browsers
- Generates responsive sizes
- Lazy loads images
- Uses CDN caching

### 4. Cache-Control Headers

Vercel Blob automatically sets optimal cache headers:
```
Cache-Control: public, max-age=31536000, immutable
```

This caches images for 1 year. When user uploads new image, filename changes (or use `addRandomSuffix: true`).

---

## Cost Analysis

### Scenario 1: MVP (0-1,000 users)

**Assumptions**:
- 500 users with profile images
- 100KB average image size
- 2 views per user per day

**Vercel Blob Costs**:
- Storage: 500 × 100KB = 50MB (FREE - under 1GB)
- Bandwidth: 500 users × 2 views/day × 100KB × 30 days = 3GB/month (FREE - under 10GB)
- **Total: $0/month**

### Scenario 2: Growth (1,000-10,000 users)

**Assumptions**:
- 5,000 users with profile images
- 100KB average image size
- 2 views per user per day

**Vercel Blob Costs**:
- Storage: 5,000 × 100KB = 500MB = 0.5GB (FREE - under 1GB)
- Bandwidth: 5,000 users × 2 views/day × 100KB × 30 days = 30GB/month
  - 10GB FREE + 20GB paid × $0.10/GB = $2/month
- **Total: $2/month**

**AWS S3 Costs** (for comparison):
- Storage: 0.5GB × $0.023/GB = $0.01/month
- Bandwidth: 30GB × $0.09/GB = $2.70/month
- **Total: $2.71/month**

**Verdict**: Vercel Blob is **comparable** in cost to S3 at this scale.

### Scenario 3: Scale (10,000+ users)

**Assumptions**:
- 50,000 users with profile images
- 100KB average image size
- 2 views per user per day

**Vercel Blob Costs**:
- Storage: 50,000 × 100KB = 5GB
  - 1GB FREE + 4GB paid × $0.15/GB = $0.60/month
- Bandwidth: 50,000 users × 2 views/day × 100KB × 30 days = 300GB/month
  - 10GB FREE + 290GB paid × $0.10/GB = $29/month
- **Total: $29.60/month**

**AWS S3 + CloudFront Costs** (for comparison):
- Storage: 5GB × $0.023/GB = $0.12/month
- Bandwidth (CloudFront): 300GB × $0.085/GB = $25.50/month
- **Total: $25.62/month**

**Verdict**: AWS S3 becomes **slightly cheaper** at very large scale ($4/month savings), but requires more complex setup.

**Recommendation**: Start with Vercel Blob, migrate to S3 if needed at 50,000+ users.

---

## Monitoring and Maintenance

### 1. Vercel Dashboard Monitoring

Monitor in Vercel Dashboard → Storage → Blob:
- Total storage used
- Bandwidth consumption
- Number of files
- Cost breakdown

### 2. Application Logging

**Log Upload Events**:
```typescript
console.log(`Profile image uploaded: user=${user.id}, size=${file.size}, url=${blob.url}`);
```

**Log Errors**:
```typescript
console.error(`Profile upload failed: user=${user.id}, error=${error.message}`);
```

### 3. Analytics

**Track Usage Metrics**:
- Number of profile images uploaded per day/week/month
- Average file size
- Upload success/failure rate
- Storage growth trend

**Use Vercel Analytics or Custom Events**:
```typescript
import { track } from "@vercel/analytics";

track("profile_image_uploaded", {
  userId: user.id,
  fileSize: file.size,
  fileType: file.type,
});
```

### 4. Cleanup Orphaned Files

**Scheduled Task** (run weekly):
```typescript
// Delete images for deleted users
import { list, del } from "@vercel/blob";

async function cleanupOrphanedImages() {
  const allUsers = await prisma.user.findMany({ select: { id: true } });
  const userIds = new Set(allUsers.map((u) => u.id));

  const { blobs } = await list({ prefix: "users/" });

  for (const blob of blobs) {
    const userId = parseInt(blob.pathname.split("/")[1]);
    if (!userIds.has(userId)) {
      console.log(`Deleting orphaned image: ${blob.url}`);
      await del(blob.url);
    }
  }
}
```

---

## Testing Strategy

### 1. Unit Tests

Test server actions in isolation:

```typescript
// __tests__/actions/profile.test.ts
import { uploadProfileImage, deleteProfileImage } from "@/utils/actions/profile";

describe("uploadProfileImage", () => {
  it("should reject invalid file types", async () => {
    const formData = new FormData();
    formData.append("file", new File([""], "test.pdf", { type: "application/pdf" }));

    const result = await uploadProfileImage(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid file type");
  });

  it("should reject files over 5MB", async () => {
    const largeFile = new File([new Uint8Array(6 * 1024 * 1024)], "large.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", largeFile);

    const result = await uploadProfileImage(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("too large");
  });

  it("should successfully upload valid image", async () => {
    const file = new File(["fake image data"], "profile.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadProfileImage(formData);

    expect(result.success).toBe(true);
    expect(result.profileImageUrl).toMatch(/^https:\/\//);
  });
});
```

### 2. Integration Tests

Test full upload flow with UI:

```typescript
// Use Playwright for E2E testing
test("user can upload profile image", async ({ page }) => {
  await page.goto("/profile");

  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles("fixtures/profile.jpg");

  // Wait for upload to complete
  await page.waitForSelector('img[alt="Profile"]');

  // Verify image is displayed
  const img = page.locator('img[alt="Profile"]');
  await expect(img).toBeVisible();
});
```

### 3. Load Testing

Test upload performance under load:

```bash
# Use k6 for load testing
k6 run upload-test.js
```

```javascript
// upload-test.js
import http from "k6/http";
import { check } from "k6";

export let options = {
  vus: 10, // 10 virtual users
  duration: "30s",
};

export default function () {
  const url = "https://your-app.vercel.app/api/upload";
  const file = open("./profile.jpg", "b");

  const data = {
    file: http.file(file, "profile.jpg"),
  };

  const res = http.post(url, data);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "upload successful": (r) => JSON.parse(r.body).success === true,
  });
}
```

---

## Migration Path (If Switching to S3 Later)

If Penumbra grows and needs to migrate to AWS S3:

### Step 1: Parallel Storage

```typescript
// Store in both Vercel Blob and S3
const vercelBlob = await put(path, file, { access: "public" });
const s3Url = await uploadToS3(file, user.id);

// Save both URLs
await prisma.user.update({
  where: { id: user.id },
  data: {
    profileImageUrl: vercelBlob.url,
    profileImageUrlS3: s3Url, // New field
  },
});
```

### Step 2: Gradual Migration

```typescript
// Migrate old images to S3 in batches
async function migrateToS3(batchSize = 100) {
  const users = await prisma.user.findMany({
    where: {
      profileImageUrl: { not: null },
      profileImageUrlS3: null,
    },
    take: batchSize,
  });

  for (const user of users) {
    // Download from Vercel Blob
    const response = await fetch(user.profileImageUrl!);
    const blob = await response.blob();

    // Upload to S3
    const s3Url = await uploadToS3(blob, user.id);

    // Update database
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrlS3: s3Url },
    });

    // Optionally delete from Vercel Blob
    await del(user.profileImageUrl!);
  }
}
```

### Step 3: Switch Primary Storage

```typescript
// Update code to use S3 URL
const imageUrl = user.profileImageUrlS3 || user.profileImageUrl;
```

### Step 4: Cleanup

```typescript
// Delete old Vercel Blob files
await prisma.user.updateMany({
  data: { profileImageUrl: null },
});
```

---

## Troubleshooting

### Issue 1: "BLOB_READ_WRITE_TOKEN not found"

**Cause**: Environment variable not set.

**Solution**:
1. Check Vercel Dashboard → Project → Settings → Environment Variables
2. Ensure `BLOB_READ_WRITE_TOKEN` is set
3. Redeploy application

### Issue 2: Upload Fails with "413 Payload Too Large"

**Cause**: File exceeds server limits.

**Solution**:
1. Check Next.js config (`next.config.js`):
   ```javascript
   module.exports = {
     api: {
       bodyParser: {
         sizeLimit: "10mb", // Increase if needed
       },
     },
   };
   ```
2. Check Vercel limits (10MB default for serverless functions)

### Issue 3: Image Not Displaying After Upload

**Cause**: URL not updated in database or CORS issue.

**Solution**:
1. Verify URL saved to database:
   ```typescript
   const user = await prisma.user.findUnique({
     where: { id: userId },
     select: { profileImageUrl: true },
   });
   console.log(user.profileImageUrl);
   ```
2. Check browser console for CORS errors
3. Verify image URL is accessible (open in new tab)

### Issue 4: Old Images Not Deleted

**Cause**: Delete operation failed or URL changed.

**Solution**:
1. Add error handling:
   ```typescript
   try {
     await del(oldImageUrl);
   } catch (error) {
     console.error("Delete failed:", error);
     // Continue anyway (cleanup can happen later)
   }
   ```
2. Run cleanup script (see Monitoring section)

---

## Conclusion

**Recommended Implementation**: Vercel Blob

- **Cost**: FREE for MVP, $2-30/month at scale
- **Complexity**: LOW (2-3 hours to implement)
- **Performance**: Excellent (CDN, < 100ms retrieval)
- **Security**: Built-in signed URLs, validation at app level
- **Scalability**: Handles 10,000+ users easily

**Implementation Checklist**:
- [ ] Install `@vercel/blob` package
- [ ] Enable Blob Storage in Vercel Dashboard
- [ ] Create `uploadProfileImage` and `deleteProfileImage` server actions
- [ ] Build `ProfileImageUpload` UI component
- [ ] Add validation (file type, size)
- [ ] Implement image optimization (resize, compress)
- [ ] Add error handling and logging
- [ ] Write unit and integration tests
- [ ] Deploy and monitor usage

**Next Steps**: Proceed with Prisma migration to add `profileImageUrl` field, then implement upload functionality following this guide.
