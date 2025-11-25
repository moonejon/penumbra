# Home Screen Design Updates

**Document Type:** Design Change Log
**Version:** 1.0 → 2.0
**Date:** November 11, 2025
**Designer:** UX Designer Agent

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Key Design Changes](#key-design-changes)
3. [Detailed Change Breakdown](#detailed-change-breakdown)
4. [Rationale for Changes](#rationale-for-changes)
5. [Implementation Impact](#implementation-impact)
6. [New User Flows](#new-user-flows)
7. [Technical Requirements](#technical-requirements)
8. [Migration Plan](#migration-plan)

---

## Executive Summary

The home screen design has been updated from v1.0 to v2.0 based on critical clarifications about the feature requirements. The primary shift is from **automatic curation** to **manual curation**, giving the owner complete control over what appears on their home screen.

### High-Level Changes

1. **Profile Picture:** Changed from portfolio integration to custom upload
2. **Favorites Logic:** Changed from automatic population to manual selection
3. **Year Filter:** Clarified to filter by read date (not published date)
4. **Owner Experience:** New edit UI with empty placeholders and modals
5. **Public Experience:** Clean view with no edit controls

### Impact Level

- **High Impact:** Database schema changes, new API endpoints, new UI components
- **Medium Impact:** Component architecture, state management
- **Low Impact:** Visual styling (minimal changes to aesthetic)

---

## Key Design Changes

### 1. Profile Picture Source

**v1.0 Design:**
```
Profile picture pulled from jonathanmooney.me portfolio
- Fixed URL
- No upload capability
- Static image
```

**v2.0 Design:**
```
Custom profile picture upload
- Owner can upload their own photo
- File picker UI (owner-only)
- Storage integration (S3/Cloudinary)
- Default placeholder if no upload
```

**Why Changed:**
- User wants personalization control
- Portfolio image may not be ideal for library
- Enables unique identity separate from portfolio

---

### 2. Favorites Population Logic

**v1.0 Design:**
```
Automatic favorites based on:
- Most recently added books
- Highest page count
- Specific subjects
- Owner's reading patterns
```

**v2.0 Design:**
```
Manual favorites with:
- 5-6 empty placeholder slots (owner view)
- Click placeholder → Opens book selection modal
- Owner manually picks each favorite
- Empty slots invisible to public
```

**Why Changed:**
- Owner wants intentional curation
- Automatic logic doesn't reflect true favorites
- Gives owner creative control

---

### 3. Year Filter Meaning

**v1.0 Design:**
```
"of {year}" filter:
- Books published in that year
- Based on datePublished field
```

**v2.0 Design:**
```
"of {year}" filter:
- Books the owner READ in that year
- Based on new readDate field
- Requires user input when adding books
```

**Why Changed:**
- More personally meaningful
- Aligns with "My 2025 Favorites" concept
- Enables temporal tracking of reading journey

---

### 4. Owner vs. Public View

**v1.0 Design:**
```
Single view for everyone:
- Public sees filled favorites
- Owner sees same view
- Edit controls mentioned but not designed
```

**v2.0 Design:**
```
Dual-mode experience:
- Owner sees empty placeholders + edit UI
- Public sees only filled slots (clean)
- Conditional rendering based on auth
```

**Why Changed:**
- Owner needs management interface
- Public should see polished, finished view
- Separation of concerns (edit vs. view)

---

### 5. Favorite Badge System

**v1.0 Design:**
```
No badge system mentioned
- Books don't show favorite status
- No visual indicator in library
```

**v2.0 Design:**
```
Badge on library book cards:
- Star icon (⭐) on favorited books
- Position number (#1-6) optional
- Clickable for owner (edit)
- Static for public (visual only)
```

**Why Changed:**
- Owner needs to see which books are favorited
- Helps prevent duplicate selections
- Visual feedback when browsing library

---

## Detailed Change Breakdown

### Component-Level Changes

#### 1. Hero Section

**Added:**
- `ProfileUpload.tsx` component (owner-only)
- Upload button UI (hover-visible on desktop)
- File picker integration
- Loading states for upload
- Error handling for file validation

**Changed:**
- Profile image source (URL field in User model)
- Placeholder design (User icon if no image)

**Removed:**
- Portfolio URL hardcoding
- Static image assumption

---

#### 2. Favorites Section

**Added:**
- `EmptyPlaceholder.tsx` component
- `AddFavoriteModal.tsx` component
- `EditFavoriteModal.tsx` component
- `FavoriteBadge.tsx` component (for library)
- Owner vs. public conditional rendering

**Changed:**
- `FavoriteSlot.tsx` now handles empty vs. filled states
- `FavoriteFilterDropdown.tsx` filters by readDate (not datePublished)
- Data fetching logic (no automatic selection)

**Removed:**
- Automatic favorites population logic
- "Smart" selection algorithms

---

#### 3. Data Layer

**Added:**
- `Favorite` model (junction table)
- `readDate` field on Book model
- `profileImageUrl` field on User model
- `bio` field on User model
- New API endpoints (upload, favorites CRUD)

**Changed:**
- GET /api/favorites now filters by readDate
- Book response includes isFavorited and favoritePosition

**Removed:**
- Automatic favorites API logic

---

### Visual Design Changes

**Minimal changes to visual aesthetic:**
- Empty placeholder style (dashed border, plus icon)
- Badge design (star icon, position number)
- Modal layouts (new components)
- Upload button styling (subtle, blends with existing)

**Consistent with v1.0:**
- Color palette (zinc-based)
- Typography scale
- Spacing system
- Animation philosophy
- Responsive behavior

---

## Rationale for Changes

### 1. Profile Picture Upload

**Problem:** Owner wants personalized profile picture, not portfolio image

**Solution:** Custom upload with file storage integration

**Benefits:**
- Owner control over identity
- Flexibility to change image anytime
- Better separation from portfolio site
- Enables future features (cover photos, galleries)

**Tradeoffs:**
- Requires file storage infrastructure
- Upload UI complexity
- File validation and error handling

---

### 2. Manual Favorites Selection

**Problem:** Automatic logic can't capture owner's true favorites

**Solution:** Empty placeholders invite manual curation

**Benefits:**
- Owner has intentional control
- Reflects genuine favorites, not algorithms
- Enables storytelling through selection
- No unexpected changes to favorites

**Tradeoffs:**
- Requires owner effort to populate
- Empty state if owner doesn't curate
- More complex UI (modals, badges)

---

### 3. Read Date Filtering

**Problem:** Published year doesn't reflect personal reading journey

**Solution:** New readDate field, filter by when owner read the book

**Benefits:**
- More personally meaningful ("My 2025 Favorites")
- Tracks reading history over time
- Enables temporal exploration
- Aligns with Goodreads-style tracking

**Tradeoffs:**
- Requires user input (nullable field)
- Existing books won't have read dates
- Additional data entry burden

---

### 4. Dual-Mode UI

**Problem:** Owner needs edit controls, public wants clean view

**Solution:** Conditional rendering based on authentication

**Benefits:**
- Clean public view (no clutter)
- Powerful owner tools (full control)
- Clear separation of roles
- Better UX for both audiences

**Tradeoffs:**
- More component complexity
- State management overhead
- Testing both modes

---

### 5. Badge System

**Problem:** No way to know which books are favorited when browsing library

**Solution:** Visual badge on book cards

**Benefits:**
- At-a-glance favorite status
- Prevents duplicate selections
- Quick access to edit (owner)
- Reinforces curation (public)

**Tradeoffs:**
- Visual noise on library cards
- Badge placement considerations
- Interaction design complexity

---

## Implementation Impact

### Database Changes

**High Impact:**

1. **User Model:**
   - Add `profileImageUrl` (String, nullable)
   - Add `bio` (String, nullable)

2. **Book Model:**
   - Add `readDate` (DateTime, nullable)

3. **Favorite Model (NEW):**
   - Create junction table
   - userId, bookId, position (1-6)
   - Unique constraints (one book per user, one book per position)

**Migration Required:**
- Prisma schema update
- Database migration script
- Seed data for testing

---

### API Changes

**New Endpoints:**

1. `POST /api/profile/upload`
   - Multipart form data
   - File validation
   - Storage integration
   - Update User record

2. `POST /api/favorites`
   - Create favorite (bookId, position)
   - Validate unique constraints
   - Return updated favorites

3. `DELETE /api/favorites/{bookId}`
   - Remove favorite
   - Return success status

4. `PATCH /api/favorites/{bookId}`
   - Update position
   - Swap positions if needed

**Updated Endpoints:**

1. `GET /api/favorites?year={year} | all_time`
   - Filter by readDate (not datePublished)
   - Return positions with books

2. `GET /api/books/owned?search={query}`
   - Include isFavorited field
   - Include favoritePosition field

---

### Component Architecture

**New Components:**

1. `ProfileUpload.tsx` (15-20 lines)
   - File input
   - Upload button
   - Loading indicator

2. `EmptyPlaceholder.tsx` (30-40 lines)
   - Dashed border container
   - Plus icon
   - "Add Favorite" text
   - Click handler

3. `AddFavoriteModal.tsx` (150-200 lines)
   - Modal wrapper
   - Search input
   - Book grid
   - Badge overlay
   - Confirmation dialog

4. `EditFavoriteModal.tsx` (80-100 lines)
   - Modal wrapper
   - Book preview
   - Action buttons (Change, Remove)

5. `FavoriteBadge.tsx` (40-50 lines)
   - Star icon
   - Position number
   - Hover/click states

**Updated Components:**

1. `HeroSection.tsx`
   - Add ProfileUpload (conditional)
   - Update profile image source

2. `FavoriteSlot.tsx`
   - Handle empty vs. filled states
   - Conditional rendering (owner vs. public)

3. `FavoriteFilterDropdown.tsx`
   - Filter by readDate

**Total New Code:** ~400-500 lines
**Total Updated Code:** ~200-300 lines

---

### State Management

**New State Variables:**

```typescript
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [selectedSlot, setSelectedSlot] = useState<number | undefined>();
const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
```

**New Server Actions:**

```typescript
// app/actions/favorites.ts
export async function addFavorite(bookId: number, position: number);
export async function removeFavorite(bookId: number);
export async function updateFavoritePosition(bookId: number, newPosition: number);

// app/actions/profile.ts
export async function uploadProfilePicture(formData: FormData);
```

---

### File Storage Infrastructure

**Requirements:**

1. **Storage Provider:** AWS S3, Cloudinary, or Vercel Blob
2. **Upload Flow:**
   - Client-side file validation
   - Multipart form upload
   - Server-side validation
   - Resize/optimize (320x320px, WebP)
   - Generate unique filename
   - Upload to storage
   - Return URL
   - Update database

3. **Security:**
   - Auth check (owner-only)
   - File type validation (JPEG, PNG, WebP)
   - File size limit (5MB)
   - Sanitize filename
   - Virus scanning (optional)

**Estimated Setup Time:** 4-6 hours

---

## New User Flows

### Flow 1: Owner Uploads Profile Picture

```
1. Owner visits home page
2. Sees profile section (placeholder or current image)
3. Hovers over profile → "Upload Photo" appears (desktop)
   OR taps profile area (mobile)
4. Clicks "Upload Photo"
5. File picker opens
6. Selects image file (JPG/PNG/WebP)
7. Optional: Crop/resize modal
8. Upload begins (loading spinner)
9. Image uploads to storage
10. Database updated
11. New image displays
12. Toast: "Profile picture updated"
```

**Error Paths:**
- File too large → Toast: "Image must be under 5MB"
- Invalid format → Toast: "Please upload JPG, PNG, or WebP"
- Upload failed → Toast: "Upload failed. Please try again."

---

### Flow 2: Owner Adds Favorite Book

```
1. Owner visits home page
2. Sees 6 favorite slots (some filled, some empty)
3. Clicks empty placeholder (e.g., Slot 2)
4. "Add Favorite" modal opens
5. Owner's library loads in grid
6. Search bar available (optional)
7. Owner browses/searches for book
8. Clicks book cover
9. Confirmation appears: "Set as Favorite?"
10. Preview: Book cover + "This will be added to slot 2"
11. Owner clicks "Confirm"
12. Modal closes
13. Slot 2 fills with book cover (animation)
14. Badge appears on book in library
15. Toast: "Added to favorites"
```

**Edge Cases:**
- Book already favorited → Badge shows current position
- No books in library → Empty state: "Add books first"
- All slots filled → Must remove a favorite first

---

### Flow 3: Owner Changes Favorite

```
1. Owner clicks filled favorite slot (e.g., Slot 3)
2. "Edit Favorite" modal opens
3. Shows: Book cover, title, author
4. Two buttons: "Change Book" and "Remove Favorite"
5. Owner clicks "Change Book"
6. "Add Favorite" modal opens (same as Flow 2)
7. Owner selects different book
8. Confirmation: "Replace favorite in slot 3?"
9. Owner confirms
10. Slot 3 updates with new book (transition animation)
11. Old book loses badge, new book gains badge
12. Toast: "Favorite updated"
```

**Alternative (Remove):**
- Step 5: Owner clicks "Remove Favorite"
- Confirmation: "Remove from favorites?"
- Owner confirms
- Slot 3 becomes empty placeholder
- Badge removed from book
- Toast: "Removed from favorites"

---

### Flow 4: Owner Filters by Year

```
1. Owner viewing favorites section
2. Current filter: "of 2025" (4 books shown)
3. Owner clicks dropdown
4. Options: "of 2025" ✓, "of all time"
5. Owner selects "of all time"
6. Favorites update (smooth transition)
7. Now shows all 6 favorited books
8. Empty slots disappear (all filled)
9. Dropdown updates: "of all time"
```

**Requires:**
- Books have readDate set
- Filter query: `WHERE readDate >= '2025-01-01' AND readDate < '2026-01-01'`

---

### Flow 5: Public Visitor Views Home

```
1. Public visitor navigates to `/`
2. Page loads with hero section
3. Sees owner's profile picture and bio
4. Scroll to favorites section
5. Sees "Favorite Books" header with "of 2025" dropdown
6. Sees 4 filled slots (no empty placeholders)
7. No "Upload Photo" button visible
8. Clicks book cover
9. Book details modal opens (read-only)
10. Views book info
11. Closes modal
12. Continues browsing (reading lists, library)
```

**Key Differences from Owner View:**
- No upload UI
- No empty placeholders
- No badges clickable
- Clean, polished view

---

## Technical Requirements

### Infrastructure

1. **File Storage:**
   - AWS S3 (recommended)
   - Cloudinary (alternative)
   - Vercel Blob (Next.js integration)

2. **Image Processing:**
   - Sharp (Node.js) or similar
   - Resize to 320x320px
   - Convert to WebP
   - Maintain aspect ratio (square)

3. **Database:**
   - Prisma migrations
   - Seed data for testing
   - Rollback plan

---

### Third-Party Dependencies

**New Dependencies:**

```json
{
  "@aws-sdk/client-s3": "^3.x" (if using S3),
  "sharp": "^0.32.x" (image processing),
  "react-dropzone": "^14.x" (file upload UI, optional)
}
```

---

### Environment Variables

**New Variables:**

```env
# File Storage (if using S3)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=penumbra-uploads
AWS_S3_REGION=us-east-1

# Or (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Max upload size
MAX_UPLOAD_SIZE=5242880 # 5MB
```

---

### Testing Requirements

**Unit Tests:**
- File validation logic
- Favorites CRUD operations
- Read date filtering

**Integration Tests:**
- Profile picture upload flow
- Add/remove favorite flow
- Year filter flow

**E2E Tests:**
- Owner adds favorite (full flow)
- Public visitor views home
- Owner uploads profile picture

**Visual Regression:**
- Empty placeholder design
- Filled slot design
- Badge design on library cards

---

## Migration Plan

### Phase 1: Database Migration

**Duration:** 1 day

1. Update Prisma schema
2. Generate migration
3. Test migration on dev database
4. Review migration SQL
5. Backup production database
6. Run migration on production
7. Verify data integrity

**Rollback Plan:**
- Revert migration
- Restore from backup
- Redeploy previous version

---

### Phase 2: File Storage Setup

**Duration:** 1 day

1. Set up S3 bucket (or Cloudinary)
2. Configure IAM permissions (S3)
3. Test upload from local dev
4. Implement image processing
5. Test resize/WebP conversion
6. Add error handling
7. Test upload limits

**Testing:**
- Upload various file types
- Upload large files (should fail)
- Upload corrupt files (should fail)
- Verify image optimization

---

### Phase 3: Component Implementation

**Duration:** 3-4 days

**Day 1:**
- ProfileUpload component
- HeroSection updates
- Upload API endpoint
- Test upload flow

**Day 2:**
- EmptyPlaceholder component
- FavoriteSlot updates
- Conditional rendering (owner vs. public)
- Test empty state

**Day 3:**
- AddFavoriteModal component
- Book search integration
- Badge overlay
- Test add flow

**Day 4:**
- EditFavoriteModal component
- FavoriteBadge component (library)
- Remove favorite flow
- Test edit flow

---

### Phase 4: API Implementation

**Duration:** 2 days

**Day 1:**
- POST /api/favorites
- DELETE /api/favorites/{bookId}
- Test CRUD operations

**Day 2:**
- PATCH /api/favorites/{bookId}
- Update GET /api/favorites (filter by readDate)
- Update GET /api/books/owned (add isFavorited)
- Test filtering

---

### Phase 5: Testing & QA

**Duration:** 2 days

**Day 1:**
- Unit tests
- Integration tests
- Owner flow testing

**Day 2:**
- Public view testing
- Accessibility audit
- Cross-browser testing
- Mobile testing

---

### Phase 6: Deployment

**Duration:** 1 day

1. Deploy to staging
2. Test all flows on staging
3. Review with stakeholders
4. Deploy to production
5. Monitor for errors
6. Hot-fix if needed

**Total Timeline:** 10-12 days

---

## Risk Assessment

### High Risk

1. **File Upload Security:**
   - Risk: Malicious file uploads
   - Mitigation: Strict validation, file type checks, size limits, virus scanning

2. **Database Migration:**
   - Risk: Data loss, migration failure
   - Mitigation: Backup before migration, test on staging, rollback plan

3. **Storage Costs:**
   - Risk: Unexpected S3/Cloudinary bills
   - Mitigation: Set budget alerts, monitor usage, optimize images

---

### Medium Risk

1. **Empty State (No Favorites):**
   - Risk: Owner doesn't populate favorites, section looks empty
   - Mitigation: Onboarding prompts, default recommendations

2. **Read Date Backfill:**
   - Risk: Existing books don't have read dates
   - Mitigation: Make field nullable, provide bulk import, manual entry

3. **Modal Complexity:**
   - Risk: Modals are too complex, confuse owner
   - Mitigation: Clear UI, progressive disclosure, tooltips

---

### Low Risk

1. **Badge Visual Noise:**
   - Risk: Badges clutter library view
   - Mitigation: Subtle design, position carefully, owner can toggle (future)

2. **Profile Picture Quality:**
   - Risk: Low-quality uploads look bad
   - Mitigation: Recommend dimensions, show preview before upload

---

## Success Metrics

### Design Success

1. **Owner Engagement:**
   - % of owners who upload profile picture (target: 70%)
   - % of owners who set favorites (target: 80%)
   - Average favorites per owner (target: 4+)

2. **User Satisfaction:**
   - Owner feedback on manual curation (qualitative)
   - Public visitor engagement (time on home page)

3. **Usability:**
   - Time to set first favorite (target: < 2 minutes)
   - Error rate on uploads (target: < 5%)

---

## Open Questions

1. **Slot Count:** Fixed at 6 or configurable by owner?
2. **Position Badges:** Show on home page or library only?
3. **Drag-and-Drop:** Enable reordering favorites by dragging?
4. **Read Date Import:** Support Goodreads CSV import?
5. **Profile Bio Editing:** Inline editing or separate modal?

---

## Conclusion

The v2.0 design represents a significant shift from automatic curation to manual curation, empowering the owner with full control over their home screen. While this adds complexity (modals, badges, upload UI), it delivers a more personalized, intentional experience that aligns with the owner's vision.

**Key Takeaways:**

1. Manual selection is more meaningful than automatic
2. Dual-mode UI serves both owner and public well
3. Read date tracking enables temporal exploration
4. File upload adds personalization depth
5. Badge system prevents confusion and duplicate selections

**Implementation Priority:**

1. Database migrations (foundational)
2. File upload infrastructure (enables profile picture)
3. Core components (empty placeholder, modals)
4. API endpoints (CRUD operations)
5. Badge system (enhances UX)
6. Testing and QA (ensures quality)

**Timeline:** 10-12 days for full implementation

---

**Document End**

For questions or feedback, contact the UX Designer agent or review the updated HOME_SCREEN_DESIGN_SPEC.md for full specifications.
