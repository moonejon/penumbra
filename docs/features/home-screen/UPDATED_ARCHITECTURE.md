# Updated Architecture - Home Screen Feature

## Document Purpose

This document tracks the architectural changes made in response to new requirements. It serves as a changelog and integration guide for the updated component structure.

**Changes Date:** 2025-11-11
**Updated Requirements:** Profile picture upload, favorites slots with owner/public views, read date tracking, badge system

---

## Summary of Changes

### Major Architectural Changes

1. **Profile Section Transformation**
   - Changed from static display to interactive upload system
   - Added file upload infrastructure requirement
   - New server action for profile image management

2. **Favorites Section Redesign**
   - Changed from simple carousel to slot-based system (6 slots)
   - Added owner vs. public view differentiation
   - Introduced placeholder components for empty slots
   - New modal system for favorites management
   - Badge system for marking favorites across the library

3. **Read Date Tracking**
   - Added temporal filtering capability
   - New field in book edit forms
   - Date-based filtering for favorites

4. **Owner vs. Public Experience**
   - Clear separation of capabilities
   - Conditional rendering throughout
   - Different interaction patterns

---

## Component Architecture Changes

### New Components Added

#### 1. ProfileImageUpload (New)
**File:** `/src/app/components/home/ProfileImageUpload.tsx`
**Type:** Client Component
**Purpose:** Handle profile picture upload and display

**Props Interface:**
```typescript
interface ProfileImageUploadProps {
  currentImage: string | null;
  userName: string | null;
  isOwner: boolean;
  onUploadSuccess?: (imageUrl: string) => void;
}
```

**Features:**
- Display current profile image or placeholder (initials)
- "Upload Photo" button (owner-only, hidden for public viewers)
- File picker integration (`<input type="file" accept="image/*">`)
- Client-side image preview before upload
- Compression/resize before upload (optional)
- Upload progress indicator (0-100%)
- Error handling (file size, type, upload failures)
- Optimistic UI update
- Integration with file storage (Vercel Blob, S3, etc.)

**Server Action Required:**
```typescript
// /src/app/actions/uploadProfileImage.ts
export async function uploadProfileImage(
  formData: FormData
): Promise<{ success: boolean; imageUrl?: string; error?: string }>;
```

**Styling:**
- Circular avatar display (120px mobile, 150px desktop)
- Upload button overlays on hover (owner view)
- Camera icon indicator
- Loading spinner during upload
- Zinc color palette

---

#### 2. FavoritePlaceholder (New)
**File:** `/src/app/components/home/FavoritePlaceholder.tsx`
**Type:** Client Component
**Purpose:** Display empty favorite slot with add functionality

**Props Interface:**
```typescript
interface FavoritePlaceholderProps {
  position: number; // 1-6
  year: 'all-time' | number;
  onAddFavorite: (position: number) => void;
}
```

**Features:**
- Dashed border book-shaped outline
- "+" icon and "Add Favorite" text
- Click handler opens FavoriteSelectionModal
- Position indicator (subtle, for owner reference)
- Same dimensions as FavoriteBookCard
- Hover effect (border color change)
- Keyboard accessible (Tab, Enter/Space)

**Layout:**
- Aspect ratio matches book covers (2:3)
- Responsive sizing (matches filled slots)
- Centered icon and text
- Semi-transparent background

**Styling:**
- Dashed border (2px, zinc-400)
- Icon size: 32px
- Text: "Add Favorite" (zinc-500)
- Hover: border color to zinc-600, background to zinc-900/50
- Transition: smooth (200ms)

---

#### 3. FavoriteSelectionModal (New)
**File:** `/src/app/components/home/FavoriteSelectionModal.tsx`
**Type:** Client Component
**Purpose:** Search and select book to set as favorite

**Props Interface:**
```typescript
interface FavoriteSelectionModalProps {
  isOpen: boolean;
  position: number; // 1-6
  year: 'all-time' | number;
  existingFavorites: number[]; // Book IDs already in favorites
  onClose: () => void;
  onSelectBook: (bookId: number, position: number) => Promise<void>;
}
```

**Features:**
- Modal overlay with backdrop
- Title: "Select Favorite Book (Position X)"
- Subtitle: Shows year if applicable ("for 2024")
- Reuse existing library search (AutocompleteSearch)
- Filter to show only owner's books
- Filter out books already in favorites (with option to replace)
- Book grid or list view (reuse GridView)
- Click book → Confirm dialog: "Set as Favorite #X?"
- Confirm/Cancel buttons
- Loading state during save
- Success feedback (toast or inline)
- Close on success
- Escape key to close

**State Management:**
- Search query
- Search results (filtered)
- Selected book (pending confirmation)
- Loading states (search, save)
- Error states

**Integration Points:**
- Reuse `/app/library/components/autocompleteSearch.tsx`
- Reuse `/app/library/components/gridView.tsx`
- Call server action to save favorite
- Update local state on success

**Server Action Required:**
```typescript
// /src/app/actions/setFavorite.ts
export async function setFavorite({
  bookId: number;
  position: number; // 1-6
  year: 'all-time' | number;
}): Promise<{ success: boolean; error?: string }>;
```

**Styling:**
- Large modal (80vw on mobile, 60vw on desktop, max 800px)
- Search bar at top
- Scrollable results area
- Fixed footer with actions
- Zinc color palette

---

#### 4. FavoriteBadge (New)
**File:** `/src/components/ui/FavoriteBadge.tsx`
**Type:** Client Component (Shared)
**Purpose:** Display favorite indicator on book cards

**Props Interface:**
```typescript
interface FavoriteBadgeProps {
  position: number; // 1-6
  year?: 'all-time' | number; // Optional, for tooltip
  size?: 'small' | 'medium' | 'large';
  className?: string;
}
```

**Features:**
- Small badge overlay on book cards
- Star icon (filled star from Lucide)
- Position number (1-6) displayed
- Optional year in tooltip (e.g., "Favorite #1 of 2024")
- Color: accent color (amber-500 for star, zinc-900 bg)
- Positioned top-right corner of book card
- Semi-transparent background
- Hover: tooltip shows details

**Styling:**
- Badge: 28px circle (small), 32px (medium), 36px (large)
- Background: zinc-900/90
- Border: 1px solid amber-500/50
- Star icon: amber-500
- Position number: text-xs, zinc-100
- Drop shadow for visibility
- Absolute positioning (top-2 right-2)

**Usage:**
- Applied to GridItem/BookCard components
- Conditionally rendered when book is in favorites
- Passed position and year data from favorites context

---

#### 5. FavoriteBookCard (Updated from BookCoverCard)
**File:** `/src/app/components/home/FavoriteBookCard.tsx`
**Type:** Client Component
**Purpose:** Display favorite book with owner-specific interactions

**Props Interface:**
```typescript
interface FavoriteBookCardProps {
  book: BookType;
  position: number; // 1-6
  year: 'all-time' | number;
  isOwner: boolean;
  onChangeFavorite?: (position: number) => void;
  onViewDetails: (bookId: number) => void;
}
```

**Features:**
- Display book cover (same as BookCoverCard)
- Position indicator badge (1-6)
- Different click handlers based on ownership:
  - **Owner:** Click opens change/remove modal
  - **Public:** Click opens book details
- Hover state shows action hint:
  - **Owner:** "Change" or "Remove" overlay
  - **Public:** Standard book info overlay
- Keyboard accessible
- Loading state during favorite changes
- Optimistic updates

**Owner Interactions:**
- Click → Open confirmation: "Change Favorite #X?" with options:
  - "Choose Different Book" (opens FavoriteSelectionModal)
  - "Remove from Favorites" (removes, creates empty slot)
  - "Cancel"
- Hover shows semi-transparent overlay with pencil icon

**Public View:**
- Click → Navigate to book detail page (existing functionality)
- Hover shows book metadata (title, author)

**Styling:**
- Same dimensions as FavoritePlaceholder
- Subtle border on hover (owner view)
- Transition effects
- Position badge in corner

---

### Modified Components

#### 1. FavoriteBooksSection (Significant Update)
**File:** `/src/app/components/home/FavoriteBooksSection.tsx`

**Changes:**
- **Props Added:**
  ```typescript
  interface FavoriteBooksSectionProps {
    initialFavorites: FavoriteBook[];
    isOwner: boolean; // NEW
    userId: string | null; // NEW
  }
  ```

- **New State:**
  ```typescript
  const [favorites, setFavorites] = useState<(FavoriteBook | null)[]>(
    initializeSlotsArray(initialFavorites) // [book, null, book, null, null, book]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  ```

- **New Logic:**
  - Initialize 6 slots (filled + nulls for empty)
  - Filter by year affects both filled and empty slots
  - Owner sees placeholders for empty slots
  - Public sees only filled slots (no placeholders)
  - Handle add/change/remove favorite actions
  - Optimistic updates with rollback on error

- **Rendering Logic:**
  ```typescript
  // Owner View
  {favorites.map((favorite, index) =>
    favorite ? (
      <FavoriteBookCard
        key={favorite.id}
        position={index + 1}
        isOwner={true}
        onChangeFavorite={handleChangeFavorite}
      />
    ) : (
      <FavoritePlaceholder
        key={`placeholder-${index}`}
        position={index + 1}
        onAddFavorite={handleAddFavorite}
      />
    )
  )}

  // Public View
  {favorites.filter(f => f !== null).map((favorite, index) => (
    <FavoriteBookCard
      key={favorite.id}
      position={index + 1}
      isOwner={false}
      onViewDetails={handleViewDetails}
    />
  ))}
  ```

---

#### 2. FavoriteBooksCarousel → FavoriteBookGrid (Renamed & Updated)
**File:** `/src/app/components/home/FavoriteBookGrid.tsx`

**Changes:**
- **Renamed** from FavoriteBooksCarousel to FavoriteBookGrid
- **Props Updated:**
  ```typescript
  interface FavoriteBookGridProps {
    slots: (FavoriteBook | null)[]; // Now accepts null for empty slots
    isOwner: boolean; // NEW
    isLoading?: boolean;
    onSlotClick: (position: number, book: BookType | null) => void; // NEW
  }
  ```

- **Layout Changes:**
  - Always 6 slots (not dynamic)
  - Grid layout on all sizes (2x3 on mobile, 6x1 or 3x2 on desktop)
  - Fixed dimensions for consistency
  - Owner view includes placeholders
  - Public view filters out nulls before rendering

- **Removed:**
  - Horizontal scroll behavior (replaced with fixed grid)

---

#### 3. ProfileBio → ProfileSection (Enhanced)
**File:** `/src/app/components/home/ProfileSection.tsx`

**Changes:**
- **Renamed** from ProfileBio to ProfileSection
- **Integrated ProfileImageUpload component**
- **Props Updated:**
  ```typescript
  interface ProfileSectionProps {
    profile: UserProfile | null;
    isOwner: boolean; // NEW
  }
  ```

- **New Features:**
  - Upload button for owners
  - Static image for public viewers
  - Optimistic image update
  - Error handling for upload failures

---

#### 4. GridItem (Library Component - Minor Update)
**File:** `/src/app/library/components/gridItem.tsx`

**Changes:**
- **Add FavoriteBadge overlay when book is in favorites**
- **Props Added:**
  ```typescript
  interface GridItemProps {
    // ... existing props
    favoritePosition?: number; // NEW - undefined if not favorite, 1-6 if favorite
    favoriteYear?: 'all-time' | number; // NEW - for badge tooltip
  }
  ```

- **Rendering Logic:**
  ```typescript
  {favoritePosition && (
    <FavoriteBadge
      position={favoritePosition}
      year={favoriteYear}
      size="small"
    />
  )}
  ```

- **Integration:**
  - Library page needs to fetch user's favorites
  - Match book IDs against favorites
  - Pass position data to GridItem

---

#### 5. Book Edit Form (To Be Updated)
**Files:**
- `/src/app/import/components/preview.tsx` (if book edits happen during import)
- Future: Book detail edit form

**Changes:**
- **Add "Read Date" field:**
  ```typescript
  interface BookFormData {
    // ... existing fields
    readDate?: string; // NEW - ISO date string or null
  }
  ```

- **Form Field:**
  - Label: "Read Date"
  - Input: Date picker (HTML5 date input or library like react-datepicker)
  - Optional field
  - Used for filtering favorites by year

- **Schema Update Required:**
  ```prisma
  model Book {
    // ... existing fields
    readDate DateTime? // NEW - when user read the book
  }
  ```

---

### Removed Components

None removed, but some renamed:
- `FavoriteBooksCarousel` → `FavoriteBookGrid`
- `ProfileBio` → `ProfileSection`

---

## State Management Changes

### New State Requirements

#### 1. Favorites Management State
```typescript
// In FavoriteBooksSection
const [favorites, setFavorites] = useState<(FavoriteBook | null)[]>([]);
const [yearFilter, setYearFilter] = useState<'all-time' | number>('all-time');
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
const [isLoading, setIsLoading] = useState(false);
```

#### 2. Profile Upload State
```typescript
// In ProfileImageUpload
const [uploadProgress, setUploadProgress] = useState(0);
const [isUploading, setIsUploading] = useState(false);
const [previewImage, setPreviewImage] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
```

#### 3. Favorites Context (Optional Enhancement)
```typescript
// Optional: Create context for favorites state across app
interface FavoritesContextValue {
  favorites: Map<number, { position: number; year: string }>;
  isFavorite: (bookId: number) => boolean;
  getFavoritePosition: (bookId: number) => number | undefined;
  setFavorite: (bookId: number, position: number, year: string) => Promise<void>;
  removeFavorite: (bookId: number) => Promise<void>;
}
```

---

## Database Schema Changes

### Updated Prisma Schema

**Already Exists** in the codebase:
- `ReadingList` model with `type` enum supporting `FAVORITES_YEAR` and `FAVORITES_ALL`
- `BookInReadingList` join table with `position` field
- No changes needed to existing schema structure

**New Field Required:**
```prisma
model Book {
  // ... existing fields
  readDate DateTime? // NEW - when user read the book

  // Add index for favorites queries
  @@index([ownerId, readDate])
}
```

**Migration Required:**
```bash
npx prisma migrate dev --name add_read_date_to_books
```

---

## API Changes

### New Server Actions

#### 1. uploadProfileImage
**File:** `/src/app/actions/uploadProfileImage.ts`

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function uploadProfileImage(
  formData: FormData
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("image") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File too large (max 5MB)" };
    }

    // Upload to Vercel Blob
    const blob = await put(`profile-images/${userId}-${Date.now()}.${file.type.split("/")[1]}`, file, {
      access: "public",
    });

    // Update user profile in database
    await prisma.user.update({
      where: { clerkId: userId },
      data: { profileImage: blob.url },
    });

    return { success: true, imageUrl: blob.url };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Upload failed" };
  }
}
```

#### 2. setFavorite
**File:** `/src/app/actions/setFavorite.ts`

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function setFavorite({
  bookId,
  position,
  year,
}: {
  bookId: number;
  position: number;
  year: 'all-time' | number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Determine list type and year string
    const listType = year === 'all-time' ? 'FAVORITES_ALL' : 'FAVORITES_YEAR';
    const yearString = year === 'all-time' ? null : year.toString();

    // Find or create favorites list
    let favoritesList = await prisma.readingList.findFirst({
      where: {
        ownerId: user.id,
        type: listType,
        year: yearString,
      },
    });

    if (!favoritesList) {
      favoritesList = await prisma.readingList.create({
        data: {
          ownerId: user.id,
          title: year === 'all-time' ? 'Favorites of All Time' : `Favorites of ${year}`,
          description: 'My favorite books',
          visibility: 'PUBLIC',
          type: listType,
          year: yearString,
        },
      });
    }

    // Check if position is already taken
    const existingAtPosition = await prisma.bookInReadingList.findFirst({
      where: {
        readingListId: favoritesList.id,
        position,
      },
    });

    // Remove existing entry at position if any
    if (existingAtPosition) {
      await prisma.bookInReadingList.delete({
        where: { id: existingAtPosition.id },
      });
    }

    // Add new favorite at position
    await prisma.bookInReadingList.create({
      data: {
        bookId,
        readingListId: favoritesList.id,
        position,
      },
    });

    revalidatePath('/');
    revalidatePath('/library');

    return { success: true };
  } catch (error) {
    console.error("Set favorite error:", error);
    return { success: false, error: "Failed to set favorite" };
  }
}
```

#### 3. removeFavorite
**File:** `/src/app/actions/removeFavorite.ts`

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function removeFavorite({
  position,
  year,
}: {
  position: number;
  year: 'all-time' | number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Determine list type and year string
    const listType = year === 'all-time' ? 'FAVORITES_ALL' : 'FAVORITES_YEAR';
    const yearString = year === 'all-time' ? null : year.toString();

    // Find favorites list
    const favoritesList = await prisma.readingList.findFirst({
      where: {
        ownerId: user.id,
        type: listType,
        year: yearString,
      },
    });

    if (!favoritesList) {
      return { success: false, error: "Favorites list not found" };
    }

    // Find and delete entry at position
    const entry = await prisma.bookInReadingList.findFirst({
      where: {
        readingListId: favoritesList.id,
        position,
      },
    });

    if (entry) {
      await prisma.bookInReadingList.delete({
        where: { id: entry.id },
      });
    }

    revalidatePath('/');
    revalidatePath('/library');

    return { success: true };
  } catch (error) {
    console.error("Remove favorite error:", error);
    return { success: false, error: "Failed to remove favorite" };
  }
}
```

### Modified API Routes

#### GET /api/favorites (Update)
**Changes:**
- Now returns array of 6 slots (books or nulls)
- Position field included in response
- Filter by year includes readDate

**Response Format:**
```typescript
{
  favorites: [
    { id: 1, title: "Book 1", ..., position: 1 },
    null, // Empty slot at position 2
    { id: 3, title: "Book 3", ..., position: 3 },
    null,
    null,
    { id: 6, title: "Book 6", ..., position: 6 }
  ],
  availableYears: [2024, 2023, 2022]
}
```

---

## File Upload Integration

### Storage Solution

**Recommended:** Vercel Blob Storage

**Setup:**
```bash
npm install @vercel/blob
```

**Environment Variables:**
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_token_here
```

**Alternative Solutions:**
- AWS S3 with presigned URLs
- Cloudinary
- Direct server storage (not recommended for production)

### File Validation

```typescript
// Client-side validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  return { valid: true };
}
```

### Image Processing (Optional)

```typescript
// Use browser-image-compression for client-side compression
import imageCompression from 'browser-image-compression';

async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 500,
    useWebWorker: true,
  };

  return await imageCompression(file, options);
}
```

---

## Integration Points

### 1. Library Integration
**File:** `/src/app/library/page.tsx` or `/src/app/library/components/library.tsx`

**Changes Required:**
```typescript
// Fetch user's favorites when loading library
const favorites = await getFavorites(userId);
const favoritesMap = new Map(
  favorites
    .filter(f => f !== null)
    .map(f => [f.id, { position: f.position, year: f.year }])
);

// Pass to GridView
<GridView
  books={books}
  favorites={favoritesMap} // NEW
/>

// GridItem checks map and renders badge
<GridItem
  book={book}
  favoritePosition={favorites.get(book.id)?.position}
  favoriteYear={favorites.get(book.id)?.year}
/>
```

### 2. Book Import/Edit Integration
**Files:**
- `/src/app/import/components/preview.tsx`
- Future book edit form

**Add Field:**
```typescript
<div>
  <label htmlFor="readDate">Read Date</label>
  <input
    type="date"
    id="readDate"
    value={readDate || ''}
    onChange={(e) => setReadDate(e.target.value)}
  />
</div>
```

### 3. Home Page Data Fetching
**File:** `/src/app/page.tsx`

**Updated Fetching:**
```typescript
// Fetch favorites with position data
const favorites = await prisma.readingList.findFirst({
  where: {
    ownerId: user.id,
    type: yearFilter === 'all-time' ? 'FAVORITES_ALL' : 'FAVORITES_YEAR',
    year: yearFilter === 'all-time' ? null : yearFilter.toString(),
  },
  include: {
    books: {
      include: { book: true },
      orderBy: { position: 'asc' },
    },
  },
});

// Transform to slots array (6 slots)
const favoritesSlots = initializeFavoritesSlots(favorites?.books || []);

// Pass isOwner flag
<HomeScreen
  profile={profile}
  initialFavorites={favoritesSlots}
  initialReadingLists={readingLists}
  isOwner={!!userId && userId === profile?.clerkId}
  userId={userId}
/>
```

---

## Migration Path

### Phase 1: Database & Types (Immediate)
1. Add `readDate` field to Book model
2. Run Prisma migration
3. Update `shared.types.ts` with new interfaces
4. Regenerate Prisma client

### Phase 2: Server Actions (Week 1)
1. Create `uploadProfileImage` action
2. Create `setFavorite` action
3. Create `removeFavorite` action
4. Update existing favorites API
5. Test server actions independently

### Phase 3: New Components (Week 1-2)
1. Build ProfileImageUpload component
2. Build FavoritePlaceholder component
3. Build FavoriteSelectionModal component
4. Build FavoriteBadge component
5. Unit test each component

### Phase 4: Component Updates (Week 2)
1. Update FavoriteBooksSection with slot logic
2. Rename and update FavoriteBooksCarousel → FavoriteBookGrid
3. Update ProfileBio → ProfileSection
4. Create FavoriteBookCard wrapper
5. Integration test updated components

### Phase 5: Integration (Week 2-3)
1. Integrate with library GridItem for badges
2. Add read date field to book forms
3. Update home page data fetching
4. E2E testing of full flow
5. Fix bugs and polish

### Phase 6: Polish (Week 3)
1. Responsive testing all breakpoints
2. Accessibility audit
3. Performance optimization
4. Visual regression testing
5. Documentation

---

## Updated Task Estimates

### New Tasks Added to Implementation Plan

**Before Phase 1:**
- Task 0.1: Database Migration (readDate field) - **1 hour**
- Task 0.2: File Upload Setup (Vercel Blob) - **2 hours**

**Phase 1 Additions:**
- Task 1.9: ProfileImageUpload Component - **6 hours**
- Task 1.10: FavoritePlaceholder Component - **3 hours**
- Task 1.11: FavoriteSelectionModal Component - **8 hours**
- Task 1.12: FavoriteBadge Component - **3 hours**

**Phase 2 Additions:**
- Task 2.10: uploadProfileImage Server Action - **3 hours**
- Task 2.11: setFavorite Server Action - **4 hours**
- Task 2.12: removeFavorite Server Action - **2 hours**
- Task 2.13: Update GET /api/favorites - **3 hours**

**Phase 3 Updates:**
- Task 3.1: ProfileBio → ProfileSection (updated) - **6 hours** (was 4)
- Task 3.4: FavoriteBooksCarousel → FavoriteBookGrid (updated) - **8 hours** (was 6)
- Task 3.5: FavoriteBooksSection (major update) - **10 hours** (was 5)

**New Phase 3 Tasks:**
- Task 3.15: FavoriteBookCard Component - **5 hours**
- Task 3.16: Library GridItem Integration (badges) - **4 hours**
- Task 3.17: Book Form Read Date Field - **2 hours**

**Total New Effort:** ~70 hours added
**Updated Total Estimate:** ~294 hours (7.4 weeks)

---

## Testing Strategy Updates

### New Test Cases

#### Unit Tests (Added)
- ProfileImageUpload component (file upload flow)
- FavoritePlaceholder component (click handling)
- FavoriteSelectionModal component (search and select)
- FavoriteBadge component (rendering variations)
- Server actions (uploadProfileImage, setFavorite, removeFavorite)

#### Integration Tests (Added)
- Add favorite flow (search → select → save)
- Change favorite flow (click → choose new → save)
- Remove favorite flow (click → confirm → remove)
- Upload profile picture flow (select → preview → upload)
- Badge display in library (favorites sync)

#### E2E Tests (Added)
- Owner adds favorite to empty slot
- Owner changes existing favorite
- Owner removes favorite
- Public user views favorites (no placeholders)
- Upload and change profile picture
- Filter favorites by year (including empty slots)

---

## New Risks & Considerations

### Technical Risks

**File Upload Complexity:**
- **Risk:** File upload can fail, leave orphaned files, or timeout
- **Mitigation:** Proper error handling, rollback on failure, use blob storage
- **Impact:** Medium - affects profile section only

**Favorites Slot Management:**
- **Risk:** Race conditions when multiple devices update favorites
- **Mitigation:** Optimistic updates with conflict resolution, use database transactions
- **Impact:** Low - single user scenario, unlikely concurrent edits

**Image Processing Performance:**
- **Risk:** Large images slow down client-side processing
- **Mitigation:** Client-side compression, size validation, progress indicators
- **Impact:** Low - only affects upload UX

**Badge Performance:**
- **Risk:** Checking every book against favorites could be slow in large libraries
- **Mitigation:** Use Map for O(1) lookups, pre-fetch favorites once
- **Impact:** Low - favorites list small (max 6), Map lookup fast

### UX Risks

**Empty Slot Confusion:**
- **Risk:** Users might not understand placeholder slots
- **Mitigation:** Clear "Add Favorite" text, onboarding tooltip, help text
- **Impact:** Medium - critical for first-time users

**Owner vs Public Visibility:**
- **Risk:** Owners might not realize public users see different view
- **Mitigation:** Preview mode, clear indicator, settings explanation
- **Impact:** Low - expected behavior for most users

**Position Numbers:**
- **Risk:** Users might want to rename/reorder positions after filling
- **Mitigation:** Drag-and-drop reorder (future enhancement), edit mode
- **Impact:** Low - can be addressed in future iteration

---

## Future Enhancements (Not in Updated Scope)

1. **Drag-and-Drop Reorder:** Allow reordering favorites by dragging
2. **Crop/Resize UI:** Advanced image editing before upload
3. **Multiple Profile Pictures:** Gallery of profile pictures to choose from
4. **Favorites Categories:** Tag favorites with themes (e.g., "Summer Reads")
5. **Read Date Bulk Edit:** Batch add read dates to multiple books
6. **Favorites Export:** Export favorites list as image or PDF
7. **Read Date Visualization:** Timeline or calendar view of read dates
8. **Badge Customization:** Different badge styles or colors
9. **Favorites Sharing:** Share specific favorites collection via link
10. **Reading Stats:** Analytics based on read dates (books per year, etc.)

---

## Documentation Updates Required

### 1. Component API Docs
- ProfileImageUpload usage and props
- FavoritePlaceholder usage and props
- FavoriteSelectionModal usage and props
- FavoriteBadge usage and props
- Updated FavoriteBooksSection props

### 2. Server Actions Docs
- uploadProfileImage parameters and responses
- setFavorite parameters and responses
- removeFavorite parameters and responses
- Error handling guide

### 3. Integration Guide
- How to use FavoriteBadge in book cards
- How to fetch and display favorites with positions
- How to handle owner vs. public rendering
- File upload setup instructions

### 4. Storybook Stories
- ProfileImageUpload states (empty, with image, uploading, error)
- FavoritePlaceholder interactions
- FavoriteSelectionModal search flow
- FavoriteBadge variants (all positions, sizes)
- Updated FavoriteBooksSection (owner vs. public)

---

## Success Metrics (Updated)

### Functional Requirements (Added)
- [ ] Owner can upload profile picture
- [ ] Owner sees 6 favorite slots (filled + empty)
- [ ] Public users see only filled favorite slots
- [ ] Owner can add book to empty favorite slot
- [ ] Owner can change existing favorite
- [ ] Owner can remove favorite
- [ ] Favorites can be filtered by read year
- [ ] Badge appears on favorited books in library
- [ ] Read date field available in book edit

### Technical Requirements (Added)
- [ ] File uploads work reliably
- [ ] Optimistic updates with rollback
- [ ] No orphaned files in storage
- [ ] Badge lookups performant (< 50ms)
- [ ] Image compression reduces file size

### User Experience Requirements (Added)
- [ ] Upload progress visible (0-100%)
- [ ] Clear owner vs. public differentiation
- [ ] Placeholder slots intuitive (add favorite)
- [ ] Selection modal search fast (< 300ms)
- [ ] Badge visible but not obtrusive

---

## Conclusion

These architectural changes significantly enhance the home screen feature with:

1. **Rich Profile Management:** Upload and manage profile pictures
2. **Interactive Favorites:** Slot-based system with clear owner/public views
3. **Temporal Filtering:** Read date tracking for year-based favorites
4. **Cross-Feature Integration:** Badges visible throughout the app

The changes maintain the existing architecture's principles while adding substantial new functionality. The implementation follows the established patterns in the Penumbra codebase (Next.js 15, React 19, Server Components, Tailwind, MUI) and extends them logically.

**Next Steps:**
1. Review this document with stakeholders
2. Update COMPONENT_ARCHITECTURE.md with new components
3. Update IMPLEMENTATION_PLAN.md with new tasks and revised estimates
4. Begin implementation starting with Phase 1 database migration

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Author:** Frontend Developer (Penumbra)
**Status:** Ready for Review
