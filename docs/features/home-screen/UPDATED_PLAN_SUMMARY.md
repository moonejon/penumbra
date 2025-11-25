# Home Screen Feature - Updated Plan Summary (v2.0)

**Project:** Penumbra - Personal Library Management System
**Feature:** Home Screen with Profile Upload, Manual Favorites, and Reading Lists
**Date:** November 11, 2025
**Version:** 2.0 (Updated based on user feedback)

---

## What Changed? (v1.0 → v2.0)

Based on user feedback, the home screen design has been significantly updated to simplify the favorites experience and add profile customization:

### Major Changes:

| Feature | v1.0 (Original) | v2.0 (Updated) |
|---------|-----------------|----------------|
| **Profile Picture** | From portfolio (hardcoded) | Custom upload (user's photo) |
| **Favorites Logic** | Automatic population (algorithm) | Manual selection (empty placeholders) |
| **Year Definition** | Publication date | When user READ the book |
| **Edit UI** | Dropdown with automatic data | Click placeholders to select books |
| **Public View** | Same as owner view | Clean view (no edit UI) |

---

## Feature Overview (Updated)

### 1. Profile Section (UPDATED)

**What It Looks Like:**
- Profile picture (circular, 120px mobile → 160px desktop)
- Owner name (centered, Geist Sans Bold)
- Bio text (200-300 characters, centered)

**Owner-Only Features:**
- "Upload Photo" button (below/overlays picture)
- File picker for JPG/PNG/WebP (max 5MB)
- Image preview and upload progress
- Stored in Vercel Blob storage

**Public View:**
- Sees profile picture and bio
- No upload button

---

### 2. Favorite Books Section (COMPLETE REDESIGN)

**Owner View:**
```
[ Book 1 ] [ Book 2 ] [ +Add ] [ +Add ] [ +Add ] [ +Add ]
  #1        #2         #3       #4       #5       #6
```

- **Filled Slots**: Show book cover + position badge (#1-6)
- **Empty Placeholders**: Dashed border + "Add Favorite" text
- **Interaction**: Click empty → Opens book selection modal
- **Year Filter**: Dropdown ("of 2024", "of all time") filters by readDate

**Public View:**
```
[ Book 1 ] [ Book 2 ]
  #1        #2
```
- Only sees filled slots (no empty placeholders)
- Clean, polished presentation
- Click cover → Opens book details (read-only)

**Year Filter Logic:**
- "of all time" = All favorite books (max 6)
- "of 2024" = Favorite books user read in 2024 (max 6)
- Requires new `readDate` field on Book model

---

### 3. Favorite Badge System (NEW)

**Where Badges Appear:**
- On book cards in library view (grid and list)
- Small star icon (⭐) + position number (#1-6)
- Top-right corner overlay

**Behavior:**
- **Owner**: Clickable badge opens "Edit Favorite" modal
- **Public**: Static badge (visual indicator only)
- **Purpose**: Prevents duplicate selections, shows status

---

### 4. Reading Lists Section (UNCHANGED)

- Display custom reading lists
- List cards with title, description, cover previews
- Toggle list/cover view
- Navigate to detail page
- Owner can create/edit/delete

---

## New User Flows

### Flow 1: Owner Uploads Profile Picture
```
1. Visit home page
2. Hover/tap profile picture → "Upload Photo" appears
3. Click → File picker opens
4. Select JPG/PNG/WebP (max 5MB)
5. Optional: Crop/resize UI
6. Upload to Vercel Blob
7. Progress indicator shows upload
8. Image appears immediately
```

### Flow 2: Owner Adds Favorite Book
```
1. See 6 favorite slots (some filled, some empty)
2. Click empty placeholder (e.g., Slot 3)
3. "Add Favorite" modal opens
4. Search/browse owner's library
5. Click a book
6. Modal: "Set as Favorite at Position #3?"
7. Confirm
8. Slot fills with book cover (animation)
9. Badge appears on book in library view
```

### Flow 3: Owner Changes Favorite
```
1. Click filled favorite slot
2. "Edit Favorite" modal opens
3. Shows: Current book, position
4. Options: "Change Book" or "Remove Favorite"
5. Click "Change Book"
6. Book selection modal opens
7. Select different book
8. Confirm
9. Slot updates, old badge removed, new badge added
```

### Flow 4: Owner Filters Favorites by Year
```
1. Dropdown shows: "of 2024", "of 2023", "of all time"
2. Select "of 2024"
3. Favorites filter to books with readDate in 2024
4. Empty slots appear if < 6 books read in 2024
5. Can fill empty slots with books from 2024
```

### Flow 5: Owner Sets Read Date on Book
```
1. In library, click book → Details modal opens
2. "Edit" button → Edit form
3. "Read Date" field (date picker)
4. Select date (e.g., "July 15, 2024")
5. Save
6. Book now appears in "Favorites of 2024" filter
```

### Flow 6: Public User Visits Home Page
```
1. Sees profile picture and bio (no upload button)
2. Sees filled favorite slots only (no empty placeholders)
3. Clicks book cover → Book details modal (read-only)
4. Sees reading lists (public only)
5. Clean, polished, read-only experience
```

---

## Database Schema Changes

### User Model (UPDATED)
```prisma
model User {
  id              Int             @id @default(autoincrement())
  clerkId         String          @unique
  email           String          @unique
  name            String?
  profileImageUrl String?         // NEW: Custom uploaded photo URL
  bio             String?         // NEW: User bio text
  books           Book[]
  readingLists    ReadingList[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

### Book Model (UPDATED)
```prisma
model Book {
  id                  Int                   @id @default(autoincrement())
  // ... existing fields ...
  readDate            DateTime?             // NEW: When user read the book
  // ... rest of fields ...

  @@index([ownerId])
  @@index([visibility])
  @@index([title])
  @@index([readDate])                       // NEW: For year filtering
  @@index([ownerId, readDate])              // NEW: Composite index
}
```

### ReadingList Model (EXISTING - No Changes)
```prisma
model ReadingList {
  id          Int                    @id @default(autoincrement())
  type        ReadingListType        @default(STANDARD)
  year        String?                // Used for FAVORITES_YEAR
  // ... existing fields ...
}
```

**Note:** Favorites are just a special type of ReadingList:
- `type = FAVORITES_ALL` → All-time favorites (max 6 books)
- `type = FAVORITES_YEAR` + `year = "2024"` → Favorites of 2024 (max 6 books)

### Migration Command
```bash
npx prisma migrate dev --name add_profile_image_and_read_date
```

---

## File Storage Strategy

### Recommendation: Vercel Blob

**Why Vercel Blob?**
- Native Vercel integration (zero config)
- Simple API (`@vercel/blob` package)
- Built-in CDN with automatic edge caching
- Secure (signed URLs optional, public URLs default)
- FREE tier: 0-1,000 users = $0/month
- Cost scales gracefully ($2-30/month for 1,000-50,000 users)

**Setup Steps:**
1. Install package: `npm install @vercel/blob`
2. Enable Blob Storage in Vercel Dashboard
3. Add `BLOB_READ_WRITE_TOKEN` to environment variables
4. Implement server action for upload
5. Integrate with ProfileImageUpload component

**Image Processing:**
- Client-side resize to 320x320px before upload
- Format: Convert to WebP for optimal size
- File naming: `{userId}/profile.{ext}` (overwrites old image)
- Auto-delete old image before uploading new one

**Security:**
- Validate file type (JPEG/PNG/WebP only)
- Validate file size (max 5MB)
- Authentication check (Clerk userId required)
- Sanitize filename (use userId, not user input)

**Alternatives Considered:**
- AWS S3: More complex setup, better for scale (10,000+ users)
- Cloudinary: Overkill for profile images (advanced transformations not needed)
- Local Filesystem: NOT recommended for production (no redundancy)

---

## New Components

### 1. ProfileImageUpload
**Purpose:** Upload custom profile picture
**Location:** `src/app/components/home/ProfileImageUpload.tsx`
**Type:** Client Component

**Features:**
- Display current image or placeholder (user icon)
- "Upload Photo" button (owner-only)
- File picker integration (`<input type="file">`)
- Client-side validation (type, size)
- Preview before upload (optional)
- Upload progress indicator
- Calls `uploadProfileImage` server action
- Error handling (file too large, invalid type, upload failed)

**Props:**
```typescript
interface ProfileImageUploadProps {
  userId: number;
  currentImageUrl?: string;
  isOwner: boolean; // Only show upload button if true
}
```

---

### 2. FavoritePlaceholder
**Purpose:** Empty slot for adding favorites
**Location:** `src/app/components/home/FavoritePlaceholder.tsx`
**Type:** Client Component

**Features:**
- Dashed border (zinc-700 dark, zinc-300 light)
- Book-shaped aspect ratio (2:3)
- "+" icon (lucide-react Plus)
- "Add Favorite" text (small, zinc-400)
- Position number (#1-6)
- Hover effect (scale 1.02, shadow)
- Click opens FavoriteSelectionModal

**Props:**
```typescript
interface FavoritePlaceholderProps {
  position: number; // 1-6
  onClick: () => void; // Opens modal
}
```

---

### 3. FavoriteSelectionModal
**Purpose:** Search and select books for favorites
**Location:** `src/app/components/home/FavoriteSelectionModal.tsx`
**Type:** Client Component

**Features:**
- Modal overlay (backdrop blur)
- Header: "Add Favorite at Position #{position}"
- Search bar (reuse library search component)
- Book grid (owner's library only)
- Filter: Exclude already-favorited books
- Click book → Confirmation dialog
- Confirmation: "Set {book.title} as Favorite #{position}?"
- Confirm/Cancel buttons
- Loading state while saving
- Success feedback (close modal, animate slot)
- Error handling (network failure, retry)

**Props:**
```typescript
interface FavoriteSelectionModalProps {
  position: number; // Which slot (1-6)
  year?: number; // If filtering by year, only show books read that year
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bookId: number) => Promise<void>;
}
```

---

### 4. FavoriteBadge
**Purpose:** Show favorite status on book cards
**Location:** `src/components/ui/FavoriteBadge.tsx`
**Type:** Client Component

**Features:**
- Small badge overlay (top-right corner)
- Star icon (⭐ lucide-react Star, filled)
- Position number (#1-6)
- Background: semi-transparent dark (zinc-900/80)
- Text: white or zinc-100
- Size: 24x24px icon, 12px text
- Responsive: Scales on mobile

**Props:**
```typescript
interface FavoriteBadgeProps {
  position: number; // 1-6
  onClick?: () => void; // Optional: Opens edit modal (owner only)
  isInteractive: boolean; // Owner: true, Public: false
}
```

---

### 5. FavoriteBooksSection (UPDATED)
**Purpose:** Display favorites with owner/public views
**Location:** `src/app/components/home/FavoriteBooksSection.tsx`
**Type:** Client Component

**Changes from v1.0:**
- Conditional rendering: Owner sees 6 slots, public sees only filled
- Empty placeholders for owner (FavoritePlaceholder component)
- Modal state management (AddFavoriteModal, EditFavoriteModal)
- Badge integration on book cards
- Year filter updates both filled and empty slots

**Props:**
```typescript
interface FavoriteBooksSectionProps {
  userId: number;
  isOwner: boolean;
  favorites: FavoriteBook[]; // 0-6 books
  selectedYear?: number; // For year filter
  onYearChange: (year: number | null) => void;
}
```

---

## New Server Actions

### 1. uploadProfileImage
**Purpose:** Upload profile picture to Vercel Blob
**Location:** `src/utils/actions/profile.ts`
**Input:** File (FormData), userId
**Output:** { success: boolean, imageUrl?: string, error?: string }

**Logic:**
1. Authenticate user (Clerk)
2. Validate file type (JPEG/PNG/WebP)
3. Validate file size (max 5MB)
4. Delete old image if exists (Vercel Blob)
5. Upload new image to Blob (path: `{userId}/profile.{ext}`)
6. Update User.profileImageUrl in database
7. Return new image URL

**Error Handling:**
- Invalid file type → "Only JPEG, PNG, WebP allowed"
- File too large → "Max 5MB"
- Upload failed → "Upload failed, try again"
- Unauthorized → "Authentication required"

---

### 2. setFavorite
**Purpose:** Add book to favorites at specific position
**Location:** `src/utils/actions/favorites.ts`
**Input:** { bookId: number, position: number (1-6), year?: number }
**Output:** { success: boolean, error?: string }

**Logic:**
1. Authenticate user (Clerk)
2. Validate book ownership (book belongs to user)
3. Validate position (1-6)
4. Determine ReadingList type:
   - If year provided → FAVORITES_YEAR + year
   - Else → FAVORITES_ALL
5. Check if ReadingList exists for user + type + year
6. If not, create ReadingList
7. Check if book already in favorites
8. If yes, update position
9. If no, add BookInReadingList entry with position
10. Return success

**Business Rules:**
- Max 6 books per favorites list (enforced)
- Position 1-6 (enforced)
- Book must belong to user (ownership check)
- If year provided, book.readDate must match year

---

### 3. removeFavorite
**Purpose:** Remove book from favorites
**Location:** `src/utils/actions/favorites.ts`
**Input:** { bookId: number, year?: number }
**Output:** { success: boolean, error?: string }

**Logic:**
1. Authenticate user (Clerk)
2. Determine ReadingList type (based on year)
3. Find BookInReadingList entry
4. Delete entry
5. Return success

---

### 4. updateBookReadDate (BONUS)
**Purpose:** Set when user read the book
**Location:** `src/utils/actions/books.ts`
**Input:** { bookId: number, readDate: Date | null }
**Output:** { success: boolean, error?: string }

**Logic:**
1. Authenticate user (Clerk)
2. Validate book ownership
3. Update Book.readDate
4. Return success

---

## Updated Implementation Timeline

### Original Estimate: 224 hours (5.6 weeks)
### Updated Estimate: 294 hours (7.4 weeks)
### Added: 70 hours for new features

---

### Phase 1: Foundation (UPDATED)
**Duration:** 1.5 weeks (48 hours)
**Original:** 32 hours
**Added:** 16 hours

**Tasks:**
1. Database migration (add profileImageUrl, readDate) - 2 hours
2. Set up Vercel Blob storage - 3 hours
3. Update TypeScript types (shared.types.ts) - 2 hours
4. Shared UI components:
   - BookCoverCard - 4 hours
   - Modal - 4 hours
   - Dropdown - 3 hours
   - ViewModeToggle - 3 hours
   - EmptyState - 3 hours
   - BackButton - 2 hours
   - **FavoriteBadge (NEW)** - 4 hours
5. Write unit tests for shared components - 8 hours
6. File upload client utilities - 6 hours
7. Image processing utilities (resize, compress) - 4 hours

---

### Phase 2: API Layer (UPDATED)
**Duration:** 1.5 weeks (44 hours)
**Original:** 28 hours
**Added:** 16 hours

**Tasks:**
1. Favorites API:
   - fetchFavoritesByYear (updated with readDate filter) - 3 hours
   - **setFavorite (NEW)** - 5 hours
   - **removeFavorite (NEW)** - 3 hours
2. Reading Lists CRUD - 12 hours
3. Reading List Books management - 8 hours
4. **Profile image upload API (NEW)** - 6 hours
5. **updateBookReadDate API (NEW)** - 3 hours
6. Write API unit tests - 4 hours

---

### Phase 3: Home Screen (UPDATED)
**Duration:** 2 weeks (62 hours)
**Original:** 44 hours
**Added:** 18 hours

**Tasks:**
1. ProfileSection component - 4 hours
2. **ProfileImageUpload component (NEW)** - 8 hours
3. FavoriteBooksSection (updated with owner/public logic) - 8 hours
4. **FavoritePlaceholder component (NEW)** - 4 hours
5. FavoriteBookGrid (updated for 6-slot system) - 6 hours
6. **FavoriteSelectionModal (NEW)** - 10 hours
7. **EditFavoriteModal (NEW)** - 8 hours
8. YearFilterDropdown (updated) - 4 hours
9. ReadingListsSection - 6 hours
10. Home page integration (Server Component) - 4 hours

---

### Phase 4: Reading List Detail (UNCHANGED)
**Duration:** 2 weeks (64 hours)

**Tasks:**
1. Reading list detail page - 8 hours
2. BookListView with drag-and-drop - 12 hours
3. BookGridView - 6 hours
4. EditListModal - 8 hours
5. AddBooksModal - 10 hours
6. Owner-only management UI - 8 hours
7. Integration and testing - 12 hours

---

### Phase 5: Polish & Testing (UPDATED)
**Duration:** 2 weeks (76 hours)
**Original:** 56 hours
**Added:** 20 hours

**Tasks:**
1. Responsive testing - 8 hours
2. Accessibility audit (WCAG 2.1 AA) - 8 hours
3. Performance optimization (Lighthouse) - 8 hours
4. Unit tests (85%+ coverage) - 16 hours
5. Integration tests - 12 hours
6. E2E tests (Playwright) - 10 hours
7. **File upload edge cases testing (NEW)** - 6 hours
8. **Badge system testing across app (NEW)** - 4 hours
9. Storybook documentation - 4 hours

---

## Owner vs. Public Logic Patterns

### Pattern 1: Conditional Rendering
```typescript
// In FavoriteBooksSection
{isOwner && favorites.length < 6 && (
  <FavoritePlaceholder
    position={favorites.length + 1}
    onClick={() => setModalOpen(true)}
  />
)}
```

### Pattern 2: Component Props
```typescript
// Pass isOwner to child components
<FavoriteBooksSection
  userId={userId}
  isOwner={userId === currentUser?.id}
  favorites={favorites}
/>
```

### Pattern 3: Server Component Auth
```typescript
// In page.tsx (Server Component)
import { auth } from '@clerk/nextjs';

export default async function HomePage() {
  const { userId } = await auth();
  const profileUserId = 1; // From URL or hardcoded
  const isOwner = userId === profileUserId.toString();

  return <HomeScreen isOwner={isOwner} />;
}
```

---

## Integration Points

### 1. Library GridItem (Badge Integration)
**File:** `src/app/library/components/gridItem.tsx`
**Change:** Add FavoriteBadge overlay

```typescript
// Add to GridItem component
import { FavoriteBadge } from '@/components/ui/FavoriteBadge';

// Inside component
{book.isFavorite && (
  <FavoriteBadge
    position={book.favoritePosition}
    isInteractive={isOwner}
    onClick={isOwner ? handleEditFavorite : undefined}
  />
)}
```

### 2. Book Edit Form (Read Date Field)
**File:** `src/app/library/components/editBookModal.tsx` (or similar)
**Change:** Add read date picker

```typescript
<label>
  Read Date (Optional)
  <input
    type="date"
    value={readDate?.toISOString().split('T')[0] || ''}
    onChange={(e) => setReadDate(new Date(e.target.value))}
  />
</label>
```

### 3. Home Page Data Fetching
**File:** `src/app/page.tsx`
**Change:** Fetch favorites with 6-slot array

```typescript
// Server Component
const favorites = await fetchFavorites(userId, year);

// Transform to 6-slot array
const favoriteSlots = Array(6).fill(null);
favorites.forEach((fav) => {
  favoriteSlots[fav.position - 1] = fav.book;
});
```

---

## Testing Strategy

### Unit Tests (85%+ coverage)
- ProfileImageUpload component (upload flow, validation, errors)
- FavoritePlaceholder component (rendering, click handler)
- FavoriteSelectionModal component (search, selection, confirmation)
- FavoriteBadge component (rendering, click handler, responsive)
- Server actions (uploadProfileImage, setFavorite, removeFavorite)

### Integration Tests
- Owner adds profile picture → Image uploads → Appears on page
- Owner adds favorite → Modal opens → Selects book → Slot fills → Badge appears
- Owner changes favorite → Modal opens → Changes book → Slot updates → Badges update
- Owner removes favorite → Slot becomes empty → Badge removed
- Year filter changes → Favorites update → Empty slots appear

### E2E Tests (Playwright)
- Full workflow: Upload profile → Add 6 favorites → Toggle year filter → Edit favorite → Remove favorite
- Public view: Visit home page → See filled favorites only → Click cover → Book details
- Responsive: Mobile and desktop layouts work correctly
- Error scenarios: Upload fails → Shows error → Retry succeeds

### Accessibility Tests (WCAG 2.1 AA)
- Keyboard navigation (Tab through slots, Enter to open modal)
- Screen reader announcements (ARIA labels, live regions)
- Color contrast ratios (badges, placeholders, buttons)
- Focus indicators visible on all interactive elements
- Skip links for quick navigation

### Performance Tests
- Lighthouse audit (Performance, Accessibility, Best Practices, SEO > 90)
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Image optimization (WebP format, proper sizing, lazy loading)
- Bundle size analysis (watch for bloat from file upload libraries)

---

## Risk Assessment

### High Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Vercel Blob setup fails** | Blocks profile upload | Test in dev environment first, have S3 as backup |
| **File upload UX confusing** | Poor onboarding | User testing, clear error messages, progress feedback |
| **Badge system too intrusive** | Cluttered UI | Make badges subtle, test with real data, get user feedback |
| **Favorites modal slow** | Poor UX with 1,000+ books | Pagination or virtualization, debounce search |

### Medium Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Read date field forgotten** | Favorites filter incomplete | Add reminder in UI, default to "added date" fallback |
| **Year filter edge cases** | Confusion when no books for year | Clear empty states, helpful messaging |
| **Mobile upload UX** | Hard to use on phones | Native camera integration, optimize for touch |

### Low Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Empty placeholder design unclear** | Users don't know what to do | Add tooltip, onboarding hints |
| **Badge positioning on cards** | Visual inconsistency | Test across different card sizes, responsive |

---

## Success Criteria

### Must Have (MVP)

- ✅ Owner can upload custom profile picture (max 5MB, JPG/PNG/WebP)
- ✅ Profile picture displays correctly (responsive, fallback if none)
- ✅ Favorites section shows 6 slots (filled + empty for owner)
- ✅ Owner can click empty slot → Opens modal → Selects book → Slot fills
- ✅ Owner can click filled slot → Opens modal → Changes or removes book
- ✅ Year filter works ("of 2024" filters by readDate)
- ✅ Favorited books show badge in library view
- ✅ Public users see only filled slots (no edit UI)
- ✅ Reading lists section displays correctly
- ✅ All features responsive (mobile, tablet, desktop)
- ✅ Accessible (WCAG 2.1 AA, keyboard navigation)

### Quality Gates

- ✅ TypeScript strict mode, no `any` types
- ✅ 85%+ test coverage (unit + integration)
- ✅ WCAG 2.1 AA compliant (zero axe violations)
- ✅ Lighthouse score > 90 (all categories)
- ✅ File upload works reliably (success rate > 99%)
- ✅ Badge system works across app (library grid, list, detail)
- ✅ No console errors or warnings
- ✅ Build passes without errors

### Nice to Have (Post-MVP)

- Image cropping UI before upload
- Drag-and-drop to reorder favorites
- Bulk set read dates (import from CSV)
- Social features (share favorites, view friends' favorites)
- Export favorites (PDF, image collage)
- Favorite books history (archive old years)

---

## Migration Checklist

### Database Migration
- [ ] Run `npx prisma migrate dev --name add_profile_image_and_read_date`
- [ ] Verify migration applied to dev database
- [ ] Regenerate Prisma Client (`npx prisma generate`)
- [ ] Test queries with new fields

### Vercel Blob Setup
- [ ] Install `@vercel/blob` package
- [ ] Enable Blob Storage in Vercel Dashboard
- [ ] Add `BLOB_READ_WRITE_TOKEN` to `.env.local` and Vercel env vars
- [ ] Test upload in development
- [ ] Test upload in production (staging first)

### Component Migration
- [ ] Create new components (ProfileImageUpload, FavoritePlaceholder, etc.)
- [ ] Update existing components (FavoriteBooksSection, GridItem, etc.)
- [ ] Write unit tests for all new components
- [ ] Update Storybook stories (if applicable)

### API Migration
- [ ] Implement new server actions (uploadProfileImage, setFavorite, removeFavorite)
- [ ] Update existing server actions (fetchFavoritesByYear)
- [ ] Write API unit tests
- [ ] Test API endpoints with real data

### Integration
- [ ] Integrate ProfileImageUpload in home page
- [ ] Integrate FavoritePlaceholder in FavoriteBooksSection
- [ ] Integrate FavoriteBadge in library GridItem
- [ ] Add read date field to book edit form
- [ ] Test end-to-end flows

### Testing
- [ ] Run unit tests (target: 85%+ coverage)
- [ ] Run integration tests
- [ ] Run E2E tests (Playwright)
- [ ] Run accessibility audit (axe DevTools)
- [ ] Run Lighthouse audit (target: > 90)

### Deployment
- [ ] Merge feature branch to main
- [ ] Deploy to staging environment
- [ ] Test in staging (full QA)
- [ ] Deploy to production
- [ ] Monitor for errors (Vercel logs, Sentry)

---

## Next Steps (Immediate)

1. **Review Updated Documentation**
   - Read `HOME_SCREEN_DESIGN_SPEC.md` (v2.0)
   - Read `DESIGN_UPDATES.md` for detailed changes
   - Read `UPDATED_ARCHITECTURE.md` for component changes
   - Read `FILE_STORAGE_STRATEGY.md` for Vercel Blob setup

2. **Validate Design Decisions**
   - Review empty placeholder design (dashed border, "+ Add Favorite" text)
   - Review badge design (star icon, position number)
   - Review modal flows (Add Favorite, Edit Favorite)
   - Review year filter UX (dropdown, "of 2024" vs "of all time")

3. **Begin Implementation**
   - **Week 1**: Database migration + Vercel Blob setup + Shared UI components
   - **Week 2**: API layer (server actions)
   - **Week 3-4**: Home screen components (profile, favorites, modals)
   - **Week 5-6**: Reading list detail page
   - **Week 7**: Testing and polish

4. **Create GitHub Issues**
   - Break down 54 tasks into trackable issues
   - Assign to team members
   - Set milestones for each phase

---

## Documentation Files

All updated documentation is located in:
**`/Users/jonathan/github/penumbra/.conductor/monrovia/docs/features/`**

### Home Screen Feature (`home-screen/`)
- `README.md` - Quick reference guide
- `HOME_SCREEN_DESIGN_SPEC.md` (v2.0) - Complete visual design
- `DESIGN_UPDATES.md` - Changelog from v1.0 to v2.0
- `WIREFRAMES.md` - Visual wireframes and layouts
- `COMPONENT_ARCHITECTURE.md` (v2.0) - Technical component specs
- `UPDATED_ARCHITECTURE.md` - Architectural changes
- `ARCHITECTURAL_CHANGES_SUMMARY.md` - Integration guide
- `COMPONENT_HIERARCHY_DIAGRAM.md` - Visual component tree
- `IMPLEMENTATION_PLAN.md` (v2.0) - 54-task roadmap (updated)
- `PLANNING_SUMMARY.md` - Navigation guide
- `TEAM_COLLABORATION_SUMMARY.md` - Team collaboration doc
- `UPDATED_PLAN_SUMMARY.md` (this file) - v2.0 summary

### Reading Lists Backend (`reading-lists/`)
- `README.md` - Quick reference
- `DATABASE_SCHEMA.md` (v2.0) - Schema with new fields
- `API_ENDPOINTS.md` (v2.0) - 18 server actions
- `FILE_STORAGE_STRATEGY.md` - Vercel Blob implementation guide

**Total**: ~400+ KB of comprehensive, production-ready documentation

---

## Contributors

**UX Designer Agent**: Updated visual design specs, wireframes, owner/public flows
**Backend Developer Agent**: Schema updates, file storage strategy, API endpoints
**Frontend Developer Agent**: Component architecture updates, integration points
**Coordinated by**: Claude (Sonnet 4.5)

**Date**: November 11, 2025
**Project**: Penumbra - Personal Library Management System
**Status**: ✅ Planning Complete (v2.0) - Ready for Implementation

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| Nov 11, 2025 | v1.0 | Initial planning | Claude (3 agents) |
| Nov 11, 2025 | v2.0 | Updated based on user feedback | Claude (3 agents) |

---

**End of Updated Plan Summary (v2.0)**

This document supersedes v1.0. For detailed specifications, refer to individual documentation files in `/docs/features/home-screen/` and `/docs/features/reading-lists/`.

**Ready to implement! 🚀**
