# Phase 2: Home Screen Implementation - Parallel Task Breakdown

**Project:** Penumbra Home Screen Feature
**Phase:** 2 (Home Screen Components)
**Status:** Ready for Execution
**Duration Estimate:** 1.5-2 weeks (with parallel execution)

---

## Context: What's Already Done ✅

From Phase 1 completion:

1. ✅ **Database Migration** - Schema updated with ReadingList, BookInReadingList models
2. ✅ **TypeScript Types** - All types defined in shared.types.ts
3. ✅ **Server Actions** - 15 actions for profile, reading lists, and favorites
4. ✅ **Foundational UI Components**:
   - BookCoverCard.tsx
   - FavoriteBadge.tsx
   - FavoritePlaceholder.tsx
   - ViewModeToggle.tsx
   - EmptyState.tsx
   - BackButton.tsx

5. ✅ **Existing Infrastructure**:
   - Modal component (`src/components/ui/modal.tsx`)
   - Button component (`src/components/ui/button.tsx`)
   - Image upload infrastructure
   - Tailwind CSS fully configured
   - Motion v11 for animations

---

## What We're Building in Phase 2

### Home Screen Structure

```
/app/page.tsx (Server Component)
  └── HomeScreen
       ├── ProfileBio (profile image + name + bio)
       ├── FavoriteBooksSection
       │    ├── FavoriteBooksHeader (with YearFilterDropdown)
       │    └── FavoriteBooksCarousel (BookCoverCards with badges/placeholders)
       └── ReadingListsSection
            ├── ReadingListsHeader (with create button - owner only)
            ├── ViewModeToggle
            └── ReadingListGrid
                 └── ReadingListCard[]
```

### Key Features
- **Profile Section**: Custom uploaded image, name, bio
- **Favorites Section**: 5-6 book slots with badges (#1-6), empty placeholders, year filter
- **Reading Lists**: Grid/list view toggle, owner-only create button
- **Owner vs Public**: Conditional rendering based on authentication
- **Modals**: Add/edit favorites, create reading list

---

## Phase 2 Tasks - Broken Down for Parallel Execution

### Wave 1: Core Section Components (Start Immediately)

These components can be built in parallel with mock data:

---

#### Task Group A: Profile Section (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 4 hours
**Dependencies:** None (can start immediately with mock data)

**Deliverables:**
1. Create `/src/app/components/home/ProfileBio.tsx`
2. Component displays:
   - Profile image (rounded, fallback to initials if missing)
   - Name (heading)
   - Bio text (paragraph, max-width for readability)
3. Handle null profile (guest view - generic welcome message)
4. Responsive layout (centered on all sizes)
5. Use existing Button component for edit (owner only, future)

**Props Interface:**
```typescript
interface ProfileBioProps {
  profile: UserProfile | null;
  isOwner: boolean;
}
```

**Design Specs:**
- Profile image: 80x80px (mobile), 120x120px (desktop), rounded-full
- Fallback: First letter of name in colored circle (zinc-700 bg)
- Name: text-2xl font-semibold, zinc-100
- Bio: text-base, zinc-400, max-w-2xl, centered
- Guest message: "Welcome to Penumbra" + subtitle

**Files to Create:**
- `src/app/components/home/ProfileBio.tsx`

---

#### Task Group B: Year Filter Dropdown (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 5 hours
**Dependencies:** None (can start immediately)

**Deliverables:**
1. Create `/src/app/components/home/YearFilterDropdown.tsx`
2. Inline dropdown styled as text (not button)
3. Options: "all time", "2024", "2023", etc.
4. Keyboard navigation (Arrow keys, Enter, Escape)
5. Click outside to close
6. Fully accessible (ARIA labels, screen reader friendly)

**Props Interface:**
```typescript
interface YearFilterDropdownProps {
  value: 'all-time' | number;
  onChange: (year: 'all-time' | number) => void;
  availableYears: number[];
}
```

**Design Specs:**
- Trigger: Styled as underlined text, zinc-100, hover:zinc-300
- Popover: zinc-800 bg, rounded-lg, border zinc-700
- Options: Hover zinc-700 bg, selected zinc-600 bg with checkmark
- Animation: Motion fade-in with spring physics
- Position: Below trigger, aligned left

**Files to Create:**
- `src/app/components/home/YearFilterDropdown.tsx`

---

#### Task Group C: Favorites Header (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 2 hours
**Dependencies:** Task Group B (YearFilterDropdown)

**Deliverables:**
1. Create `/src/app/components/home/FavoriteBooksHeader.tsx`
2. Title: "Favorite Books"
3. Inline YearFilterDropdown: "of [dropdown]"
4. Responsive: stacked on mobile, inline on desktop

**Props Interface:**
```typescript
interface FavoriteBooksHeaderProps {
  yearFilter: 'all-time' | number;
  onYearChange: (year: 'all-time' | number) => void;
  availableYears: number[];
  isOwner: boolean;
}
```

**Design Specs:**
- Title: text-3xl font-bold, zinc-100
- Dropdown inline with title on desktop
- Mobile: title on top, dropdown below
- Spacing: gap-4

**Files to Create:**
- `src/app/components/home/FavoriteBooksHeader.tsx`

---

#### Task Group D: Favorites Carousel (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 6 hours
**Dependencies:** None (uses existing BookCoverCard, FavoriteBadge, FavoritePlaceholder)

**Deliverables:**
1. Create `/src/app/components/home/FavoriteBooksCarousel.tsx`
2. Display 5-6 book slots:
   - Filled slots: BookCoverCard with FavoriteBadge
   - Empty slots: FavoritePlaceholder
3. Mobile: horizontal scroll container
4. Desktop: grid layout (5-6 columns)
5. Click handler for empty slots (opens add modal)
6. Click handler for filled slots (opens edit modal)
7. Loading skeletons

**Props Interface:**
```typescript
interface FavoriteBooksCarouselProps {
  favorites: FavoriteBook[]; // 0-6 items
  isLoading: boolean;
  isOwner: boolean;
  onAddFavorite: (position: number) => void;
  onEditFavorite: (bookId: number, position: number) => void;
}
```

**Design Specs:**
- Mobile: horizontal scroll, snap-x, hide scrollbar
- Desktop: grid-cols-5 (5 books) or grid-cols-6 (6 books)
- Gap: gap-4
- Each slot: aspect-ratio-[2/3] (book cover standard)
- Owner: All slots clickable
- Public: Only show filled slots (no placeholders)

**Files to Create:**
- `src/app/components/home/FavoriteBooksCarousel.tsx`

---

#### Task Group E: Favorites Section Container (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 5 hours
**Dependencies:** Task Groups C and D

**Deliverables:**
1. Create `/src/app/components/home/FavoriteBooksSection.tsx`
2. Compose FavoriteBooksHeader and FavoriteBooksCarousel
3. State management:
   - yearFilter state
   - favorites state
   - isLoading state
   - availableYears state
4. Fetch favorites when yearFilter changes (useEffect)
5. Handle empty state (no favorites)
6. Modal integration for add/edit (Phase 2 Wave 2)

**Props Interface:**
```typescript
interface FavoriteBooksSectionProps {
  initialFavorites: FavoriteBook[];
  initialAvailableYears: number[];
  isOwner: boolean;
}
```

**Server Actions Used:**
- `fetchFavorites(year?)`
- `fetchAvailableFavoriteYears()`

**Files to Create:**
- `src/app/components/home/FavoriteBooksSection.tsx`

---

#### Task Group F: List Cover Preview (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 3 hours
**Dependencies:** None (can start immediately)

**Deliverables:**
1. Create `/src/app/components/home/ListCoverPreview.tsx`
2. Grid of book covers (max 4)
3. Layout variants:
   - 0 images: Empty state icon
   - 1 image: Single large cover
   - 2-3 images: Row layout
   - 4 images: 2x2 grid
4. Fallback for missing images
5. Responsive sizing

**Props Interface:**
```typescript
interface ListCoverPreviewProps {
  coverImages: string[]; // Max 4 URLs
}
```

**Design Specs:**
- Small book covers (64x96px)
- Gap: gap-1
- Border: border border-zinc-700 rounded
- Empty state: BookOpen icon, zinc-600

**Files to Create:**
- `src/app/components/home/ListCoverPreview.tsx`

---

#### Task Group G: List Metadata (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 2 hours
**Dependencies:** None (can start immediately)

**Deliverables:**
1. Create `/src/app/components/home/ListMetadata.tsx`
2. Display title, description, book count
3. Description: line-clamp-2 (truncate to 2 lines)
4. Responsive text sizing

**Props Interface:**
```typescript
interface ListMetadataProps {
  title: string;
  description?: string;
  bookCount: number;
}
```

**Design Specs:**
- Title: text-xl font-semibold, zinc-100
- Description: text-sm, zinc-400, line-clamp-2
- Book count: text-xs, zinc-500, "X books"

**Files to Create:**
- `src/app/components/home/ListMetadata.tsx`

---

#### Task Group H: Reading List Card (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 5 hours
**Dependencies:** Task Groups F and G

**Deliverables:**
1. Create `/src/app/components/home/ReadingListCard.tsx`
2. Two view modes:
   - List mode: Metadata prominent, preview on side
   - Covers mode: Preview prominent, metadata below
3. Hover effect (scale 1.02, border color change)
4. Click navigation to `/reading-lists/[id]`
5. Keyboard accessible (Tab, Enter, Space)

**Props Interface:**
```typescript
interface ReadingListCardProps {
  list: ReadingListWithBooks;
  viewMode: 'list' | 'grid';
  onClick: () => void;
}
```

**Design Specs:**
- Card: border border-zinc-800, rounded-lg, p-4
- Hover: border-zinc-600, scale-105, transition-all
- List mode: flex-row, metadata flex-1
- Covers mode: flex-col, preview larger
- Cursor: cursor-pointer
- Focus: ring-2 ring-zinc-500

**Files to Create:**
- `src/app/components/home/ReadingListCard.tsx`

---

#### Task Group I: Reading List Grid (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 3 hours
**Dependencies:** Task Group H

**Deliverables:**
1. Create `/src/app/components/home/ReadingListGrid.tsx`
2. Responsive grid layout
3. Each list uses ReadingListCard
4. Handle empty array gracefully

**Props Interface:**
```typescript
interface ReadingListGridProps {
  lists: ReadingListWithBooks[];
  viewMode: 'list' | 'grid';
}
```

**Design Specs:**
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Gap: gap-4
- Empty: Show EmptyState component

**Files to Create:**
- `src/app/components/home/ReadingListGrid.tsx`

---

#### Task Group J: Empty Reading Lists State (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 2 hours
**Dependencies:** None (uses existing EmptyState)

**Deliverables:**
1. Create `/src/app/components/home/EmptyReadingListsState.tsx`
2. Owner vs guest content
3. Owner action: Create list button
4. Guest: No action

**Props Interface:**
```typescript
interface EmptyReadingListsStateProps {
  isOwner: boolean;
  onCreateList: () => void;
}
```

**Design Specs:**
- Icon: Bookmark from lucide-react
- Owner title: "Create your first reading list"
- Owner description: "Organize your books into curated lists"
- Owner CTA: "Create Reading List" button
- Guest title: "No reading lists yet"
- Guest description: "Check back later"

**Files to Create:**
- `src/app/components/home/EmptyReadingListsState.tsx`

---

#### Task Group K: Reading Lists Header (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 2 hours
**Dependencies:** None (can start immediately)

**Deliverables:**
1. Create `/src/app/components/home/ReadingListsHeader.tsx`
2. Title: "Reading Lists"
3. Create button (owner only)
4. Responsive layout (space-between)

**Props Interface:**
```typescript
interface ReadingListsHeaderProps {
  isOwner: boolean;
  onCreateList: () => void;
}
```

**Design Specs:**
- Flex: justify-between items-center
- Title: text-3xl font-bold, zinc-100
- Button: Primary variant, "+ Create List"
- Mobile: Stack vertically if needed

**Files to Create:**
- `src/app/components/home/ReadingListsHeader.tsx`

---

#### Task Group L: Reading Lists Section (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 6 hours
**Dependencies:** Task Groups I, J, K

**Deliverables:**
1. Create `/src/app/components/home/ReadingListsSection.tsx`
2. Compose header, toggle, grid/empty state
3. State management:
   - lists state
   - viewMode state (persist to localStorage)
   - isCreating state (modal open/close)
4. Create list handler (opens modal)
5. Refresh lists after create

**Props Interface:**
```typescript
interface ReadingListsSectionProps {
  initialLists: ReadingListWithBooks[];
  isOwner: boolean;
}
```

**Server Actions Used:**
- `fetchUserReadingLists()`
- `createReadingList()`

**Files to Create:**
- `src/app/components/home/ReadingListsSection.tsx`

---

#### Task Group M: Home Screen Container (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 3 hours
**Dependencies:** Task Groups A, E, L

**Deliverables:**
1. Create `/src/app/components/home/HomeScreen.tsx`
2. Compose all three sections:
   - ProfileBio
   - FavoriteBooksSection
   - ReadingListsSection
3. Vertical spacing between sections
4. Responsive layout

**Props Interface:**
```typescript
interface HomeScreenProps {
  profile: UserProfile | null;
  initialFavorites: FavoriteBook[];
  initialAvailableYears: number[];
  initialReadingLists: ReadingListWithBooks[];
  isOwner: boolean;
}
```

**Design Specs:**
- Container: max-w-7xl mx-auto px-4
- Sections: space-y-16
- Each section: pt-8 border-t border-zinc-800

**Files to Create:**
- `src/app/components/home/HomeScreen.tsx`

---

### Wave 2: Modals & Interactions (After Wave 1 Core Components)

These depend on Wave 1 components being complete:

---

#### Task Group N: Add Favorite Modal (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 6 hours
**Dependencies:** Wave 1 complete

**Deliverables:**
1. Create `/src/app/components/home/AddFavoriteModal.tsx`
2. Modal with book search/selection
3. Shows user's library of books
4. Filter by read date (year)
5. Select book to add to position
6. Loading and error states

**Props Interface:**
```typescript
interface AddFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: number; // 1-6
  year: 'all-time' | number;
  onSuccess: () => void;
}
```

**Server Actions Used:**
- `fetchBooks()` (from existing books.ts)
- `setFavorite(bookId, position, year?)`

**Design Specs:**
- Modal: large size
- Search bar at top
- Grid of books (BookCoverCard)
- Pagination for large libraries
- Selected book: Highlight border
- Confirm button: "Add to Favorites #X"

**Files to Create:**
- `src/app/components/home/AddFavoriteModal.tsx`

---

#### Task Group O: Edit Favorite Modal (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 4 hours
**Dependencies:** Task Group N

**Deliverables:**
1. Create `/src/app/components/home/EditFavoriteModal.tsx`
2. Show current favorite book
3. Options:
   - Change position (dropdown 1-6)
   - Remove from favorites
4. Confirmation for remove action

**Props Interface:**
```typescript
interface EditFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorite: FavoriteBook;
  year: 'all-time' | number;
  onSuccess: () => void;
}
```

**Server Actions Used:**
- `setFavorite()` (for position change)
- `removeFavorite()`

**Design Specs:**
- Modal: medium size
- Book preview at top (large cover + metadata)
- Position dropdown: "Change position to #X"
- Remove button: Danger variant, "Remove from Favorites"
- Confirm remove: Secondary modal

**Files to Create:**
- `src/app/components/home/EditFavoriteModal.tsx`

---

#### Task Group P: Create Reading List Modal (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 5 hours
**Dependencies:** Wave 1 complete

**Deliverables:**
1. Create `/src/app/components/home/CreateReadingListModal.tsx`
2. Form fields:
   - Title (required)
   - Description (optional, textarea)
   - Visibility (dropdown: Public/Private)
3. Validation (title required, non-empty)
4. Loading state during create
5. Error handling

**Props Interface:**
```typescript
interface CreateReadingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (listId: number) => void;
}
```

**Server Actions Used:**
- `createReadingList(title, description, visibility, type, year?)`

**Design Specs:**
- Modal: medium size
- Form: vertical layout, gap-4
- Title: TextField component
- Description: TextArea component (3 rows)
- Visibility: Dropdown (Public/Private/Unlisted)
- Submit: Primary button, "Create Reading List"
- Cancel: Secondary button

**Files to Create:**
- `src/app/components/home/CreateReadingListModal.tsx`

---

### Wave 3: Page Integration (After Wave 2 Modals Complete)

---

#### Task Group Q: Home Page Server Component (Fullstack Dev)
**Agent:** `fullstack-dev`
**Duration:** 6 hours
**Dependencies:** Wave 1 and Wave 2 complete

**Deliverables:**
1. Update `/src/app/page.tsx` as Server Component
2. Data fetching:
   - Get current user from Clerk `auth()`
   - Fetch user profile (if authenticated)
   - Fetch favorite books (all-time)
   - Fetch available years
   - Fetch reading lists (user's + public)
   - Determine isOwner
3. Handle unauthenticated users (profile = null, public content only)
4. Pass data to HomeScreen component
5. Error handling (error boundary)
6. SEO metadata (title, description, OpenGraph)

**Server Actions Used:**
- `getUserProfile()`
- `fetchFavorites()`
- `fetchAvailableFavoriteYears()`
- `fetchUserReadingLists()`

**Design Specs:**
- Server Component: No "use client" directive
- Error boundary: Suspense with loading fallback
- Loading: Skeleton screens for each section
- SEO: metadata object with title, description, openGraph

**Files to Update:**
- `src/app/page.tsx`

**Files to Create:**
- `src/app/loading.tsx` (loading skeleton)
- `src/app/error.tsx` (error boundary)

---

## Parallel Execution Strategy

### Wave 1 (Start Immediately) - Core Components
**Duration:** 6 hours (parallelized)

Run these **13 tasks in parallel** (all frontend-dev):

1. **Task Group A**: ProfileBio - 4 hours
2. **Task Group B**: YearFilterDropdown - 5 hours
3. **Task Group C**: FavoriteBooksHeader - 2 hours (starts after B)
4. **Task Group D**: FavoriteBooksCarousel - 6 hours
5. **Task Group E**: FavoriteBooksSection - 5 hours (starts after C, D)
6. **Task Group F**: ListCoverPreview - 3 hours
7. **Task Group G**: ListMetadata - 2 hours
8. **Task Group H**: ReadingListCard - 5 hours (starts after F, G)
9. **Task Group I**: ReadingListGrid - 3 hours (starts after H)
10. **Task Group J**: EmptyReadingListsState - 2 hours
11. **Task Group K**: ReadingListsHeader - 2 hours
12. **Task Group L**: ReadingListsSection - 6 hours (starts after I, J, K)
13. **Task Group M**: HomeScreen - 3 hours (starts after A, E, L)

**Critical Path:** A → E → M (13 hours sequential, but parallelized to ~6-8 hours)

---

### Wave 2 (After Wave 1 Complete) - Modals
**Duration:** 6 hours (parallelized)

Run these **3 tasks in parallel** (all frontend-dev):

1. **Task Group N**: AddFavoriteModal - 6 hours
2. **Task Group O**: EditFavoriteModal - 4 hours (can start with N)
3. **Task Group P**: CreateReadingListModal - 5 hours

**Critical Path:** N → O (10 hours sequential, but parallelized to ~6 hours)

---

### Wave 3 (After Wave 2 Complete) - Integration
**Duration:** 6 hours

Run **1 task** (fullstack-dev):

1. **Task Group Q**: Home Page Integration - 6 hours

---

## Total Phase 2 Timeline

**Sequential Execution:** 63 hours (8 days)
**Parallel Execution:** 18-20 hours (2.5 days with multiple agents)

**Critical Path:**
- Wave 1: B → C → E → M (16 hours)
- Wave 2: N → O (10 hours)
- Wave 3: Q (6 hours)
- **Total Critical Path:** ~32 hours (4 days with 1 agent)

**With 3 Frontend Agents + 1 Fullstack:**
- Wave 1: ~6-8 hours
- Wave 2: ~6 hours
- Wave 3: ~6 hours
- **Total: 18-20 hours (2.5 days)**

---

## Agent Assignments

### Frontend Dev Agent 1 (Profile & Favorites)
**Wave 1:**
1. Task Group A (ProfileBio) - 4 hours
2. Task Group B (YearFilterDropdown) - 5 hours
3. Task Group C (FavoriteBooksHeader) - 2 hours
4. Task Group D (FavoriteBooksCarousel) - 6 hours
5. Task Group E (FavoriteBooksSection) - 5 hours

**Wave 2:**
6. Task Group N (AddFavoriteModal) - 6 hours
7. Task Group O (EditFavoriteModal) - 4 hours

**Total:** 32 hours

---

### Frontend Dev Agent 2 (Reading Lists)
**Wave 1:**
1. Task Group F (ListCoverPreview) - 3 hours
2. Task Group G (ListMetadata) - 2 hours
3. Task Group H (ReadingListCard) - 5 hours
4. Task Group I (ReadingListGrid) - 3 hours
5. Task Group J (EmptyReadingListsState) - 2 hours
6. Task Group K (ReadingListsHeader) - 2 hours
7. Task Group L (ReadingListsSection) - 6 hours

**Wave 2:**
8. Task Group P (CreateReadingListModal) - 5 hours

**Total:** 28 hours

---

### Frontend Dev Agent 3 (Integration)
**Wave 1:**
1. Task Group M (HomeScreen) - 3 hours

**Wave 2:**
2. Assist with modals if needed or start writing tests

**Total:** 3-6 hours

---

### Fullstack Dev Agent (Server Integration)
**Wave 3:**
1. Task Group Q (Home Page Server Component) - 6 hours
2. Create loading.tsx and error.tsx
3. SEO metadata configuration

**Total:** 6-8 hours

---

## Verification Checklist

After Phase 2 completes, verify:

- [ ] All 13 home screen components created
- [ ] All components have proper TypeScript props
- [ ] All components responsive (mobile + desktop)
- [ ] Profile section displays correctly (owner + guest)
- [ ] Favorites section shows 5-6 slots with badges/placeholders
- [ ] Year filter dropdown works (fetches new data)
- [ ] Reading lists section shows grid/list toggle
- [ ] Owner-only UI hidden from guests (create buttons, placeholders)
- [ ] Add favorite modal: search/select books from library
- [ ] Edit favorite modal: change position or remove
- [ ] Create reading list modal: form validation
- [ ] Home page (`/app/page.tsx`) fetches and passes data correctly
- [ ] Server Component: No client-side hooks in page.tsx
- [ ] Authentication: Clerk integration working
- [ ] Owner detection: `isOwner` prop calculated correctly
- [ ] Public view: Works for unauthenticated users
- [ ] Loading states: Skeletons show during data fetching
- [ ] Error handling: Error boundary catches failures
- [ ] SEO: Metadata configured (title, description, OG)
- [ ] Build passes: `npm run build`
- [ ] TypeScript: No compilation errors
- [ ] Accessibility: ARIA labels, keyboard navigation
- [ ] Components use lucide-react icons
- [ ] Components follow existing patterns (Button, Modal, etc.)
- [ ] No MUI dependencies used (Tailwind only)

---

## Next Steps After Phase 2

Once Phase 2 is complete, proceed to:
- **Phase 3**: Reading List Detail Page (5-6 days)
- **Phase 4**: Profile Edit & Settings (3-4 days)
- **Phase 5**: Polish, Testing & Documentation (5-6 days)

---

## Notes for Agents

### For Frontend Dev:
- Follow existing component patterns in `/src/components/ui/`
- Use Tailwind CSS classes only (no MUI)
- Use `cn()` helper from `/src/lib/utils`
- Use lucide-react for all icons
- Use Motion v11 for animations (spring physics)
- Ensure responsive (mobile-first)
- Match portfolio aesthetic (zinc palette)
- Server Actions: Import from `/src/utils/actions/`
- Forms: Use react-hook-form if needed
- Modals: Use existing Modal component from `/src/components/ui/modal.tsx`

### For Fullstack Dev:
- Server Components: No "use client" directive
- Clerk auth: Use `auth()` from `@clerk/nextjs/server`
- Prisma queries: Use server actions, not direct queries in page.tsx
- Error handling: Wrap in try-catch, return error responses
- SEO: Export metadata object from page.tsx
- Loading: Use loading.tsx for Suspense fallback
- Testing: E2E tests for full page flow

### Design Consistency:
- Refer to design specs in `/docs/features/home-screen/HOME_SCREEN_DESIGN_SPEC.md`
- Ensure WCAG 2.1 AA compliance
- Use Geist fonts (already configured)
- Match existing components' styling
- Spacing: Consistent gap-4, space-y-16 for sections
- Colors: zinc palette (zinc-100 text, zinc-800 borders, zinc-900 backgrounds)

---

**Status**: Ready for parallel execution
**Last Updated**: November 11, 2025
**Coordinator**: Claude (Sonnet 4.5)
