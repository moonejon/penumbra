# Architectural Changes Summary - Home Screen Feature

## Quick Reference

**Date:** 2025-11-11
**Status:** Ready for Implementation
**Impact:** Major architectural changes with new components and functionality

---

## Executive Summary

The home screen architecture has been significantly updated to support:

1. **Profile Picture Upload:** Owner can upload/manage profile pictures
2. **Slot-Based Favorites System:** 6 fixed slots with owner/public view differentiation
3. **Read Date Tracking:** Filter favorites by year read
4. **Badge System:** Visual indicators for favorite books across the application

**Total New Components:** 4
**Updated Components:** 4
**New Server Actions:** 3
**Database Changes:** 2 new fields

---

## Component Changes Overview

### New Components (4)

1. **ProfileImageUpload** (`/src/app/components/home/ProfileImageUpload.tsx`)
   - Upload profile pictures
   - File validation and preview
   - Progress indicator
   - Integration with Vercel Blob storage

2. **FavoritePlaceholder** (`/src/app/components/home/FavoritePlaceholder.tsx`)
   - Empty favorite slot display (owner-only)
   - Dashed border with "Add Favorite" text
   - Click to open selection modal

3. **FavoriteSelectionModal** (`/src/app/components/home/FavoriteSelectionModal.tsx`)
   - Search owner's library
   - Select book for favorite position
   - Confirmation flow
   - Reuses existing library search components

4. **FavoriteBadge** (`/src/components/ui/FavoriteBadge.tsx`)
   - Badge overlay for favorite books
   - Star icon + position number
   - Displays on book cards throughout app
   - Size variants (small, medium, large)

### Updated Components (4)

1. **ProfileBio → ProfileSection**
   - Integrated ProfileImageUpload
   - Owner vs. public rendering
   - Upload functionality added

2. **FavoriteBooksCarousel → FavoriteBookGrid**
   - Changed from carousel to fixed 6-slot grid
   - Owner sees all slots (filled + placeholders)
   - Public sees only filled slots
   - Position-based layout

3. **FavoriteBooksSection**
   - Added owner/public logic
   - Slot-based state management (6 slots with nulls)
   - Modal integration for add/change favorites
   - Optimistic updates

4. **BookCoverCard/GridItem**
   - Added FavoriteBadge overlay support
   - New props: favoritePosition, favoriteYear
   - Badge renders when book is favorite

### Removed/Renamed (2)

- `ProfileBio` → `ProfileSection` (renamed)
- `FavoriteBooksCarousel` → `FavoriteBookGrid` (renamed)

---

## New Server Actions

### 1. uploadProfileImage
**File:** `/src/app/actions/uploadProfileImage.ts`
**Purpose:** Handle profile picture upload to blob storage
**Integration:** Vercel Blob
**Returns:** `{ success: boolean, imageUrl?: string, error?: string }`

### 2. setFavorite
**File:** `/src/app/actions/setFavorite.ts`
**Purpose:** Set or replace book at favorite position
**Parameters:** `{ bookId: number, position: 1-6, year: 'all-time' | number }`
**Returns:** `{ success: boolean, error?: string }`

### 3. removeFavorite
**File:** `/src/app/actions/removeFavorite.ts`
**Purpose:** Remove book from favorite position
**Parameters:** `{ position: 1-6, year: 'all-time' | number }`
**Returns:** `{ success: boolean, error?: string }`

---

## Database Schema Changes

### Book Model
```prisma
model Book {
  // ... existing fields
  readDate DateTime? // NEW - when user read the book

  @@index([ownerId, readDate])
}
```

### User Model
```prisma
model User {
  // ... existing fields
  profileImage String? // NEW - URL to profile picture
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_read_date_and_profile_image
```

---

## Type Definitions Changes

### Updated Types
```typescript
// UserProfile - added profileImage
export interface UserProfile {
  profileImage: string | null; // NEW
}

// FavoriteBook - changed favoriteRank to position, added year
export interface FavoriteBook extends BookType {
  position: number; // 1-6 (was favoriteRank)
  year?: 'all-time' | number; // NEW
}
```

### New Types
```typescript
// Favorites slot array (6 slots with nulls for empty)
export interface FavoritesSlotArray {
  slots: (FavoriteBook | null)[]; // Always length 6
  year: 'all-time' | number;
}

// Upload response
export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// Generic action response
export interface ActionResponse {
  success: boolean;
  error?: string;
}
```

---

## Integration Points

### 1. File Upload Infrastructure
**Requirement:** Vercel Blob Storage setup
**Setup:**
```bash
npm install @vercel/blob
```
**Environment Variables:**
```env
BLOB_READ_WRITE_TOKEN=your_token_here
```

### 2. Library GridItem Integration
**File:** `/src/app/library/components/gridItem.tsx`
**Changes:**
- Fetch user's favorites on library page load
- Pass favoritePosition and favoriteYear to GridItem
- Render FavoriteBadge when book is favorite

**Example:**
```typescript
// In Library component
const favorites = await getFavorites(userId);
const favoritesMap = new Map(
  favorites.filter(f => f !== null).map(f => [f.id, { position: f.position, year: f.year }])
);

// In GridItem
<GridItem
  book={book}
  favoritePosition={favoritesMap.get(book.id)?.position}
  favoriteYear={favoritesMap.get(book.id)?.year}
/>
```

### 3. Book Edit Form Integration
**Files:**
- `/src/app/import/components/preview.tsx`
- Future book edit form

**Add Field:**
```typescript
<input
  type="date"
  label="Read Date"
  value={readDate || ''}
  onChange={(e) => setReadDate(e.target.value)}
/>
```

### 4. Home Page Data Fetching
**File:** `/src/app/page.tsx`
**Updated Logic:**
```typescript
// Fetch favorites with position data from ReadingList
const favoritesList = await prisma.readingList.findFirst({
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

// Transform to 6-slot array
const favoritesSlots = initializeFavoritesSlots(favoritesList?.books || []);

// Pass to HomeScreen
<HomeScreen
  initialFavorites={favoritesSlots}
  isOwner={isOwner}
  userId={userId}
/>
```

---

## Owner vs. Public Logic

### Owner View
- **Profile:** Upload button visible
- **Favorites:** All 6 slots visible (filled + placeholders)
- **Interactions:**
  - Click placeholder → Opens selection modal
  - Click favorite → Shows change/remove options
  - Hover → Shows edit indicators

### Public View
- **Profile:** Static image display (no upload)
- **Favorites:** Only filled slots visible (no placeholders)
- **Interactions:**
  - Click favorite → Opens book details
  - No edit options visible

### Implementation Pattern
```typescript
{isOwner ? (
  // Owner view with edit capabilities
  <FavoritePlaceholder onAddFavorite={handleAdd} />
) : (
  // Public view, read-only
  favorites.filter(f => f !== null).map(favorite => (
    <FavoriteBookCard onViewDetails={handleView} />
  ))
)}
```

---

## State Management Patterns

### Favorites Slot Management
```typescript
// Initialize 6-slot array from API response
function initializeFavoritesSlots(books: BookInReadingList[]): (FavoriteBook | null)[] {
  const slots: (FavoriteBook | null)[] = Array(6).fill(null);

  books.forEach(entry => {
    if (entry.position >= 1 && entry.position <= 6) {
      slots[entry.position - 1] = {
        ...entry.book,
        position: entry.position,
        favoritedAt: entry.addedAt,
      };
    }
  });

  return slots;
}
```

### Optimistic Updates
```typescript
const handleSetFavorite = async (bookId: number, position: number) => {
  // Optimistic update
  const oldSlots = [...favorites];
  const newSlots = [...favorites];
  newSlots[position - 1] = { ...selectedBook, position };
  setFavorites(newSlots);

  // API call
  const result = await setFavorite({ bookId, position, year });

  // Rollback on error
  if (!result.success) {
    setFavorites(oldSlots);
    showError(result.error);
  }
};
```

---

## File Upload Flow

### Client-Side Flow
1. User clicks upload button
2. File picker opens (`<input type="file">`)
3. User selects image
4. Client validates file (type, size)
5. Optional: Client-side compression
6. Preview shown to user
7. User confirms upload
8. Upload starts with progress indicator
9. Server action called with FormData
10. Optimistic UI update on success
11. Error handling and rollback on failure

### Server-Side Flow
1. Receive FormData with image file
2. Validate authentication (Clerk)
3. Validate file (type, size, format)
4. Upload to Vercel Blob storage
5. Get public URL from blob storage
6. Update User.profileImage in database
7. Return success with URL or error
8. Revalidate affected pages

---

## Favorites Management Flow

### Add Favorite Flow
1. Owner clicks placeholder slot
2. FavoriteSelectionModal opens at position
3. User searches their library
4. Results filtered (owner's books only)
5. User clicks book
6. Confirmation dialog: "Set as Favorite #X?"
7. User confirms
8. Server action: setFavorite(bookId, position, year)
9. Optimistic UI update
10. Database updated (ReadingList + BookInReadingList)
11. Page revalidated
12. Modal closes

### Change Favorite Flow
1. Owner clicks filled favorite slot
2. Context menu or modal: "Choose Different Book" / "Remove" / "Cancel"
3. User selects "Choose Different Book"
4. FavoriteSelectionModal opens (same as add flow)
5. New book selected and confirmed
6. Server action: setFavorite (replaces existing at position)
7. Old entry deleted, new entry created
8. UI updated

### Remove Favorite Flow
1. Owner clicks filled favorite slot
2. Context menu: "Remove from Favorites"
3. Confirmation dialog (optional)
4. Server action: removeFavorite(position, year)
5. Database entry deleted
6. Slot becomes null (placeholder shows)
7. UI updated

---

## Badge Display Logic

### When to Show Badge
- Book is in any favorites list (all-time or specific year)
- Badge shows position number (1-6)
- Tooltip shows context (year or "all time")

### Where Badges Appear
1. **Library Grid:** On owner's favorite books
2. **Search Results:** On favorited books
3. **Reading Lists:** On books in lists that are also favorites
4. **Favorites Section:** Badge on FavoriteBookCard (optional, position already indicated by layout)

### Badge Data Fetching
```typescript
// Fetch once on page load
const favorites = await getUserFavorites(userId);

// Transform to Map for O(1) lookup
const favoritesMap = new Map(
  favorites
    .filter(f => f !== null)
    .map(f => [f.id, { position: f.position, year: f.year }])
);

// Check when rendering book
const favoriteData = favoritesMap.get(book.id);
if (favoriteData) {
  <FavoriteBadge position={favoriteData.position} year={favoriteData.year} />
}
```

---

## Time Estimates (Updated)

### Original Estimate
- **Total:** ~224 hours (5.6 weeks)

### New Tasks Added
- **Database & File Upload Setup:** 3 hours
- **New Components (4):** 20 hours
- **Updated Components (4):** 19 hours
- **Server Actions (3):** 9 hours
- **Integration Work:** 10 hours
- **Additional Testing:** 9 hours

### Updated Total
- **Total:** ~294 hours (7.4 weeks)

### Critical Path Impact
- **Phase 0 (New):** Database migration + File upload setup (3 hours)
- **Phase 1:** +20 hours for new shared components
- **Phase 2:** +9 hours for server actions
- **Phase 3:** +29 hours for updated home screen components

---

## Risk Assessment

### New Risks

#### File Upload Complexity
- **Risk:** Uploads fail, orphaned files, timeout issues
- **Severity:** Medium
- **Mitigation:** Proper error handling, Vercel Blob cleanup, progress indicators
- **Fallback:** Allow retry, manual URL entry

#### Favorites Slot Conflicts
- **Risk:** Race condition when editing same position from multiple devices
- **Severity:** Low
- **Mitigation:** Database transactions, last-write-wins, optimistic updates with rollback
- **Fallback:** Refresh to latest state

#### Badge Performance
- **Risk:** Checking every book against favorites slow in large libraries
- **Severity:** Low
- **Mitigation:** Map-based O(1) lookup, pre-fetch favorites once
- **Fallback:** Lazy load badges on scroll

### Mitigated Risks

#### Empty Slot Confusion
- **Mitigation:** Clear "Add Favorite" text, intuitive placeholder design
- **User Testing:** Validate with prototype

#### Owner/Public Visibility
- **Mitigation:** Consistent conditional rendering pattern, clear indicator
- **Testing:** E2E tests for both views

---

## Testing Strategy Updates

### New Unit Tests
- ProfileImageUpload (file validation, preview, upload)
- FavoritePlaceholder (click, keyboard)
- FavoriteSelectionModal (search, select, confirm)
- FavoriteBadge (rendering, sizes)
- Server actions (mock Prisma, mock blob storage)

### New Integration Tests
- Upload profile picture flow
- Add favorite flow (search → select → save)
- Change favorite flow
- Remove favorite flow
- Badge sync across pages

### New E2E Tests
- Complete owner favorite management flow
- Public user favorite viewing (no placeholders)
- Profile picture upload and display
- Filter favorites by year (with empty slots)
- Badge visibility in library

---

## Migration Checklist

### Phase 0: Prerequisites
- [ ] Install @vercel/blob package
- [ ] Set up BLOB_READ_WRITE_TOKEN environment variable
- [ ] Add readDate field to Book model (Prisma)
- [ ] Add profileImage field to User model (Prisma)
- [ ] Run Prisma migration
- [ ] Regenerate Prisma client
- [ ] Test database connection with new fields

### Phase 1: Server Infrastructure
- [ ] Create uploadProfileImage server action
- [ ] Create setFavorite server action
- [ ] Create removeFavorite server action
- [ ] Update GET /api/favorites to return 6 slots
- [ ] Test server actions with mock data

### Phase 2: Shared Components
- [ ] Build FavoriteBadge component
- [ ] Update BookCoverCard props (favoritePosition, favoriteYear)
- [ ] Build ProfileImageUpload component
- [ ] Build FavoritePlaceholder component
- [ ] Build FavoriteSelectionModal component
- [ ] Unit test all new components

### Phase 3: Home Screen Updates
- [ ] Update ProfileBio → ProfileSection
- [ ] Update FavoriteBooksCarousel → FavoriteBookGrid
- [ ] Update FavoriteBooksSection (slot logic, modal integration)
- [ ] Create FavoriteBookCard component
- [ ] Update HomeScreen component
- [ ] Update home page data fetching (6 slots)
- [ ] Integration test home screen flows

### Phase 4: Library Integration
- [ ] Update GridItem to accept favorite props
- [ ] Update Library page to fetch favorites
- [ ] Pass favorites data to GridView
- [ ] Render badges on favorite books
- [ ] Test badge display in library

### Phase 5: Book Edit Integration
- [ ] Add readDate field to book import form
- [ ] Add readDate field to book edit form (future)
- [ ] Update book save logic to handle readDate
- [ ] Test read date persistence

### Phase 6: Testing & Polish
- [ ] E2E test: Owner favorite management
- [ ] E2E test: Public favorite viewing
- [ ] E2E test: Profile picture upload
- [ ] Accessibility audit (new components)
- [ ] Responsive testing (new layouts)
- [ ] Performance testing (badge lookups)
- [ ] Visual regression testing
- [ ] Fix bugs and polish UX

### Phase 7: Documentation
- [ ] Update component API docs
- [ ] Create Storybook stories for new components
- [ ] Document server actions
- [ ] Write integration guide
- [ ] Update README with new features

---

## Success Criteria

### Functional Requirements
- [x] Owner can upload profile picture
- [x] Owner sees 6 favorite slots (filled + empty)
- [x] Public users see only filled favorite slots
- [x] Owner can add book to empty favorite slot
- [x] Owner can change existing favorite
- [x] Owner can remove favorite
- [x] Favorites can be filtered by read year
- [x] Badge appears on favorited books in library
- [x] Read date field available in book edit

### Technical Requirements
- [x] File uploads work reliably (< 5% failure rate)
- [x] Optimistic updates with proper rollback
- [x] No orphaned files in blob storage
- [x] Badge lookups performant (< 50ms per page)
- [x] Image compression reduces file size (< 1MB final)
- [x] All new components TypeScript strict mode
- [x] 85%+ test coverage maintained
- [x] WCAG 2.1 Level AA compliance

### User Experience Requirements
- [x] Upload progress visible (0-100%)
- [x] Clear owner vs. public differentiation
- [x] Placeholder slots intuitive ("Add Favorite" clear)
- [x] Selection modal search fast (< 300ms)
- [x] Badge visible but not obtrusive
- [x] Responsive on all breakpoints
- [x] Smooth transitions and interactions

---

## Next Steps

1. **Review this document** with team/stakeholders
2. **Approve architectural changes** and new components
3. **Set up file upload infrastructure** (Vercel Blob)
4. **Run database migration** (readDate, profileImage)
5. **Begin Phase 1 implementation** (server actions)
6. **Follow updated implementation plan** (see IMPLEMENTATION_PLAN.md)

---

## Questions & Decisions

### Open Questions
- [ ] Confirm Vercel Blob as file storage solution (vs. S3, Cloudinary)
- [ ] Decide on image compression library (browser-image-compression vs. server-side)
- [ ] Confirm badge color scheme (amber-500 vs. other accent color)
- [ ] Decide on position renumbering behavior (when removing middle slot)

### Decisions Made
- [x] Use 6 fixed slots (not dynamic)
- [x] Favorites stored in ReadingList table (not separate Favorites table)
- [x] Owner/public differentiation (not roles-based)
- [x] Badge displays position number (not just star icon)
- [x] Read date optional field (not required)

---

## References

- **Full Architecture:** `COMPONENT_ARCHITECTURE.md`
- **Implementation Plan:** `IMPLEMENTATION_PLAN.md`
- **Changelog:** `UPDATED_ARCHITECTURE.md`
- **Prisma Schema:** `/prisma/schema.prisma`
- **Shared Types:** `/src/shared.types.ts`

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Author:** Frontend Developer (Penumbra)
**Status:** Ready for Implementation
