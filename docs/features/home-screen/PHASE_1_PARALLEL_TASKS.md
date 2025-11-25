# Phase 1: Foundation - Parallel Task Breakdown

**Project:** Penumbra Home Screen Feature
**Phase:** 1 (Foundation)
**Status:** Ready for Execution
**Duration Estimate:** 1-1.5 weeks (with parallel execution)

---

## Context: What's Already Done ✅

After merging `origin/main` (Phase 4 complete), we now have:

1. ✅ **Vercel Blob Integration** - `@vercel/blob` package installed
2. ✅ **Image Upload Infrastructure** - `/api/upload/cover-image` route exists
3. ✅ **Image Upload Component** - `ImageUpload.tsx` with drag-and-drop
4. ✅ **Form Components** - `TextField`, `TextArea`, `NumberField`, `ArrayField`
5. ✅ **Modal Component** - `src/components/ui/modal.tsx`
6. ✅ **Validation Utilities** - `src/utils/validation.ts`
7. ✅ **Button Component** - `src/components/ui/button.tsx`
8. ✅ **Tailwind Migration Complete** - No MUI dependencies remaining
9. ✅ **Schema Updates Made** - `profileImageUrl` and `readDate` already in schema (from user edits)

---

## What Still Needs to Be Done

### Database & Backend
- [ ] Run Prisma migration for schema changes
- [ ] Create server actions for reading lists and favorites
- [ ] Create server action for profile image upload (user profile)

### Shared UI Components
- [ ] BookCoverCard component (reusable)
- [ ] FavoriteBadge component (star + position)
- [ ] FavoritePlaceholder component (empty slot)
- [ ] ViewModeToggle component (list/cover toggle)
- [ ] EmptyState component (generic empty states)

### Type Definitions
- [ ] Add ReadingList types to shared.types.ts
- [ ] Add Favorite types to shared.types.ts
- [ ] Add Profile types to shared.types.ts

---

## Phase 1 Tasks - Broken Down for Parallel Execution

### Task Group A: Database & Schema (Backend Dev)
**Agent:** `backend-dev`
**Duration:** 4-6 hours
**Dependencies:** None (can start immediately)

**Deliverables:**
1. Run Prisma migration to apply schema changes
2. Verify migration successful and schema matches plan
3. Test database queries for new fields
4. Create database seeding script for development (optional)

**Commands to Run:**
```bash
npx prisma migrate dev --name add_profile_and_reading_lists
npx prisma generate
npx prisma validate
```

**Verification:**
- Schema includes `User.profileImageUrl`
- Schema includes `Book.readDate`
- Schema includes `ReadingList`, `BookInReadingList` models
- All indexes created
- Migration reversible

---

### Task Group B: Type Definitions (Backend Dev)
**Agent:** `backend-dev`
**Duration:** 2-3 hours
**Dependencies:** Task Group A (migration complete)

**Deliverables:**
1. Update `src/shared.types.ts` with new types:
   - `ReadingListType` enum
   - `ReadingListVisibility` enum
   - `ReadingList` interface
   - `ReadingListWithBooks` interface
   - `BookInReadingList` interface
   - `FavoriteBook` interface
   - `UserProfile` interface

**Files to Update:**
- `src/shared.types.ts`

**Example Types:**
```typescript
// Reading List types
export type ReadingListType = "STANDARD" | "FAVORITES_YEAR" | "FAVORITES_ALL";
export type ReadingListVisibility = "PRIVATE" | "PUBLIC" | "FRIENDS" | "UNLISTED";

export interface ReadingList {
  id: number;
  ownerId: number;
  title: string;
  description?: string;
  visibility: ReadingListVisibility;
  type: ReadingListType;
  year?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingListWithBooks extends ReadingList {
  books: BookInReadingListEntry[];
}

export interface BookInReadingListEntry {
  id: number;
  bookId: number;
  position: number;
  notes?: string;
  addedAt: Date;
  book: Book;
}

export interface FavoriteBook {
  book: Book;
  position: number; // 1-6
}

export interface UserProfile {
  id: number;
  name?: string;
  email: string;
  profileImageUrl?: string;
  bio?: string;
}
```

---

### Task Group C: Profile Image Upload Server Action (Backend Dev)
**Agent:** `backend-dev`
**Duration:** 3-4 hours
**Dependencies:** Task Group B (types defined)

**Deliverables:**
1. Create `/src/utils/actions/profile.ts`
2. Implement `uploadProfileImage(file: File)` server action
3. Implement `updateUserBio(bio: string)` server action
4. Implement `getUserProfile(userId: number)` server action

**Note:** Reuse existing `/api/upload/cover-image` pattern but store URL in `User.profileImageUrl`

**Files to Create/Update:**
- `src/utils/actions/profile.ts` (NEW)

**Server Actions to Implement:**
```typescript
// Upload profile image to Vercel Blob and update User.profileImageUrl
export async function uploadProfileImage(formData: FormData): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
}>;

// Update user bio
export async function updateUserBio(bio: string): Promise<{
  success: boolean;
  error?: string;
}>;

// Get user profile
export async function getUserProfile(): Promise<{
  success: boolean;
  profile?: UserProfile;
  error?: string;
}>;
```

---

### Task Group D: Reading List Server Actions (Backend Dev)
**Agent:** `backend-dev`
**Duration:** 6-8 hours
**Dependencies:** Task Group B (types defined)

**Deliverables:**
1. Create `/src/utils/actions/reading-lists.ts`
2. Implement server actions for reading lists CRUD
3. Implement server actions for favorites management

**Files to Create:**
- `src/utils/actions/reading-lists.ts` (NEW)

**Server Actions to Implement:**
1. `createReadingList(title, description, visibility, type, year?)`
2. `fetchUserReadingLists()` - Get all user's lists
3. `fetchReadingList(listId)` - Get single list with books
4. `updateReadingList(listId, updates)`
5. `deleteReadingList(listId)`
6. `addBookToReadingList(listId, bookId, position?)`
7. `removeBookFromReadingList(listId, bookId)`
8. `reorderBooksInList(listId, bookIds[])`
9. `setFavorite(bookId, position, year?)`
10. `removeFavorite(bookId, year?)`
11. `fetchFavorites(year?)`
12. `fetchAvailableFavoriteYears()`

---

### Task Group E: Shared UI - BookCoverCard (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 4-5 hours
**Dependencies:** None (can start immediately with mock data)

**Deliverables:**
1. Create `/src/components/ui/BookCoverCard.tsx`
2. Component displays book cover image, title, author
3. Responsive sizing (mobile/desktop)
4. Hover states with Motion animations
5. Click handler prop
6. Loading skeleton state
7. Error/fallback image state
8. Optional badge slot for FavoriteBadge

**Files to Create:**
- `src/components/ui/BookCoverCard.tsx` (NEW)

**Props Interface:**
```typescript
interface BookCoverCardProps {
  book: Book;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  badgePosition?: number; // 1-6 for favorites
  loading?: boolean;
  className?: string;
}
```

**Design Specs:**
- Aspect ratio: 2:3 (book cover standard)
- Image: `next/image` with lazy loading
- Fallback: Book icon if image fails to load
- Hover: Scale 1.02, subtle shadow (Motion spring animation)
- Badge slot: Top-right corner overlay

---

### Task Group F: Shared UI - FavoriteBadge (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 2-3 hours
**Dependencies:** None (can start immediately)

**Deliverables:**
1. Create `/src/components/ui/FavoriteBadge.tsx`
2. Small badge with star icon + position number
3. Two modes: interactive (owner) and static (public)
4. Responsive sizing
5. Accessible (ARIA labels)

**Files to Create:**
- `src/components/ui/FavoriteBadge.tsx` (NEW)

**Props Interface:**
```typescript
interface FavoriteBadgeProps {
  position: number; // 1-6
  isInteractive?: boolean; // Owner can click to edit
  onClick?: () => void;
  className?: string;
}
```

**Design Specs:**
- Size: 28x28px (mobile), 32x32px (desktop)
- Background: zinc-900/80 with backdrop blur
- Icon: Star (filled) from lucide-react
- Text: Position number (#1-6), 12px font
- Position: Top-right corner (absolute positioning)
- Interaction: Hover scale 1.05 if interactive

---

### Task Group G: Shared UI - FavoritePlaceholder (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 2-3 hours
**Dependencies:** None (can start immediately)

**Deliverables:**
1. Create `/src/components/ui/FavoritePlaceholder.tsx`
2. Empty slot with dashed border
3. "+ Add Favorite" text and icon
4. Click handler to open modal
5. Hover states
6. Position number display

**Files to Create:**
- `src/components/ui/FavoritePlaceholder.tsx` (NEW)

**Props Interface:**
```typescript
interface FavoritePlaceholderProps {
  position: number; // 1-6
  onClick: () => void;
  className?: string;
}
```

**Design Specs:**
- Aspect ratio: 2:3 (matches BookCoverCard)
- Border: 2px dashed zinc-700 (dark), zinc-300 (light)
- Icon: Plus icon from lucide-react
- Text: "Add Favorite", 14px, zinc-400
- Position badge: Small zinc-600 badge with number
- Hover: Border color zinc-500, scale 1.02

---

### Task Group H: Shared UI - ViewModeToggle (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 2-3 hours
**Dependencies:** None (can start immediately)

**Deliverables:**
1. Create `/src/components/ui/ViewModeToggle.tsx`
2. Toggle between list and cover/grid views
3. Icon buttons with active state
4. Accessible (keyboard navigation, ARIA)

**Files to Create:**
- `src/components/ui/ViewModeToggle.tsx` (NEW)

**Props Interface:**
```typescript
interface ViewModeToggleProps {
  mode: "list" | "grid";
  onChange: (mode: "list" | "grid") => void;
  className?: string;
}
```

**Design Specs:**
- Two buttons: List icon, Grid icon (lucide-react)
- Active: zinc-100 text, zinc-800 background
- Inactive: zinc-500 text, transparent background
- Size: 32x32px buttons, 16px icons
- Group: Rounded border, zinc-800 border
- Transition: Smooth color transitions

---

### Task Group I: Shared UI - EmptyState (Frontend Dev)
**Agent:** `frontend-dev`
**Duration:** 2-3 hours
**Dependencies:** None (can start immediately)

**Deliverables:**
1. Create `/src/components/ui/EmptyState.tsx`
2. Generic empty state component
3. Icon, title, description, optional CTA button
4. Variants for different contexts

**Files to Create:**
- `src/components/ui/EmptyState.tsx` (NEW)

**Props Interface:**
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}
```

**Design Specs:**
- Icon: 48x48px, zinc-600 color
- Title: 18px font, zinc-300
- Description: 14px font, zinc-500
- CTA: Button component (primary variant)
- Layout: Centered, flexbox column
- Spacing: 16px gaps between elements

---

### Task Group J: Shared UI - BackButton (UX Designer)
**Agent:** `ux-designer`
**Duration:** 1-2 hours
**Dependencies:** None (can start immediately)

**Deliverables:**
1. Create `/src/components/ui/BackButton.tsx`
2. Navigation back button with arrow icon
3. Router integration (Next.js router.back())
4. Optional custom onClick handler

**Files to Create:**
- `src/components/ui/BackButton.tsx` (NEW)

**Props Interface:**
```typescript
interface BackButtonProps {
  label?: string; // Default: "Back"
  onClick?: () => void; // Override default router.back()
  className?: string;
}
```

**Design Specs:**
- Icon: ChevronLeft from lucide-react
- Text: "Back" (or custom label), 14px
- Color: zinc-500, hover zinc-300
- Transition: Smooth color transition
- Padding: 8px horizontal, 6px vertical

---

## Parallel Execution Strategy

### Wave 1 (Start Immediately)
Run these tasks in parallel - no dependencies:

1. **Backend Dev**: Task Group A (Database Migration) - 4-6 hours
2. **Frontend Dev**: Task Group E (BookCoverCard) - 4-5 hours
3. **Frontend Dev**: Task Group F (FavoriteBadge) - 2-3 hours
4. **Frontend Dev**: Task Group G (FavoritePlaceholder) - 2-3 hours
5. **Frontend Dev**: Task Group H (ViewModeToggle) - 2-3 hours
6. **Frontend Dev**: Task Group I (EmptyState) - 2-3 hours
7. **UX Designer**: Task Group J (BackButton) - 1-2 hours

**Estimated Duration**: 4-6 hours (parallelized)

---

### Wave 2 (After Migration Complete)
Depends on Task Group A completing:

1. **Backend Dev**: Task Group B (Type Definitions) - 2-3 hours
2. Continue frontend components from Wave 1 if needed

**Estimated Duration**: 2-3 hours

---

### Wave 3 (After Types Defined)
Depends on Task Group B completing:

1. **Backend Dev**: Task Group C (Profile Server Actions) - 3-4 hours
2. **Backend Dev**: Task Group D (Reading List Server Actions) - 6-8 hours

Note: Tasks C and D can run in parallel if you have 2 backend agents.

**Estimated Duration**: 6-8 hours (if parallelized)

---

## Total Phase 1 Timeline

**Sequential Execution**: 36-48 hours (4.5-6 days)
**Parallel Execution**: 12-17 hours (1.5-2 days with 3-4 agents)

**Critical Path**: Backend Dev tasks (A → B → C/D)
**Can Parallelize**: All frontend UI components (E, F, G, H, I, J)

---

## Agent Assignments

### Backend Dev Agent (Critical Path)
1. Wave 1: Task Group A (Database Migration)
2. Wave 2: Task Group B (Type Definitions)
3. Wave 3: Task Group C (Profile Server Actions)
4. Wave 3: Task Group D (Reading List Server Actions)

**Total**: 15-21 hours

---

### Frontend Dev Agent 1 (UI Components)
1. Wave 1: Task Group E (BookCoverCard)
2. Wave 1: Task Group F (FavoriteBadge)
3. Wave 1: Task Group G (FavoritePlaceholder)

**Total**: 8-11 hours

---

### Frontend Dev Agent 2 (UI Components)
1. Wave 1: Task Group H (ViewModeToggle)
2. Wave 1: Task Group I (EmptyState)

**Total**: 4-6 hours

---

### UX Designer Agent (Simple UI)
1. Wave 1: Task Group J (BackButton)

**Total**: 1-2 hours

---

## Verification Checklist

After Phase 1 completes, verify:

- [ ] Database migration successful (run `npx prisma studio` to inspect)
- [ ] All types defined in `shared.types.ts`
- [ ] All server actions implemented and tested
- [ ] All 6 shared UI components created
- [ ] Each component has proper TypeScript props
- [ ] Each component matches design specs (Tailwind, responsive)
- [ ] Components use lucide-react icons
- [ ] Components follow existing patterns (Button, Modal, etc.)
- [ ] No MUI dependencies used (Tailwind only)
- [ ] Accessibility: ARIA labels, keyboard navigation
- [ ] Build passes: `npm run build`

---

## Next Steps After Phase 1

Once Phase 1 is complete, proceed to:
- **Phase 2**: API Layer Testing & Integration (2-3 days)
- **Phase 3**: Home Screen Implementation (4-5 days)
- **Phase 4**: Reading List Detail Page (5-6 days)
- **Phase 5**: Polish & Testing (5-6 days)

---

## Notes for Agents

### For Backend Dev:
- Reuse existing patterns from `/src/utils/actions/books.ts`
- Follow Clerk authentication pattern (check `userId`)
- Use Prisma Client for all database queries
- Return `{ success, data?, error? }` response format
- Test with existing development database (357 books)

### For Frontend Dev:
- Follow existing component patterns in `/src/components/ui/`
- Use Tailwind CSS classes only (no MUI)
- Use `cn()` helper from `/src/lib/utils`
- Use lucide-react for all icons
- Use Motion v11 for animations (spring physics)
- Ensure responsive (mobile-first)
- Match portfolio aesthetic (zinc palette)

### For UX Designer:
- Refer to design specs in `/docs/features/home-screen/HOME_SCREEN_DESIGN_SPEC.md`
- Ensure WCAG 2.1 AA compliance
- Use Geist fonts (already configured)
- Match existing components' styling

---

**Status**: Ready for parallel execution
**Last Updated**: November 11, 2025
**Coordinator**: Claude (Sonnet 4.5)
