# Home Screen Feature - Team Collaboration Summary

**Project:** Penumbra - Personal Library Management System
**Feature:** Home Screen with Profile, Favorite Books, and Reading Lists
**Date:** November 11, 2025
**Team:** UX Designer, Backend Developer, Frontend Developer (coordinated by Claude)

---

## Executive Summary

The specialized agent team has successfully completed comprehensive planning and design for the Penumbra home screen feature. This document integrates deliverables from three specialized agents working in parallel:

- **UX Designer**: Visual design specifications and user experience
- **Backend Developer**: Database schema and API architecture
- **Frontend Developer**: Component architecture and implementation planning

**Status**: ✅ Planning Complete - Ready for Implementation

---

## Feature Overview

### What We're Building

A public-facing home screen (`/`) that serves as the landing page for Penumbra, showcasing:

1. **Profile/Bio Section**
   - User's profile picture (sourced from portfolio)
   - Owner name
   - Short bio (200-300 characters)

2. **Favorite Books Browser**
   - Display 5-6 favorite books with cover images
   - Custom dropdown filter: "of {year}" vs "of all time"
   - Responsive layouts (horizontal scroll on mobile, grid on desktop)
   - Click to open book details modal

3. **Reading Lists Section**
   - Display custom reading lists created by owner
   - Each list shows: title, description, cover previews (3 books), count
   - Toggle between list and cover view
   - Click to navigate to reading list detail page

4. **Owner-Only Management** (authenticated users)
   - Create, edit, and delete reading lists
   - Add/remove books from lists
   - Reorder books within lists
   - Edit list titles and descriptions

### Design Philosophy

- **Public-First**: Anyone can browse, only owner can edit
- **Portfolio Integration**: Matches jonathanmooney.me aesthetic
- **Minimal Navigation**: Clean, focused experience
- **Responsive Design**: Mobile-first with desktop enhancements
- **Accessibility**: WCAG 2.1 AA compliant

---

## Documentation Deliverables

All documentation is organized in structured directories:

### Home Screen Feature
**Location**: `/docs/features/home-screen/`

| File | Size | Purpose |
|------|------|---------|
| `README.md` | 10 KB | Quick reference guide |
| `HOME_SCREEN_DESIGN_SPEC.md` | 36 KB | Complete visual design specification |
| `COMPONENT_ARCHITECTURE.md` | 46 KB | Technical component architecture |
| `IMPLEMENTATION_PLAN.md` | 69 KB | 54-task implementation roadmap |
| `PLANNING_SUMMARY.md` | - | High-level navigation guide |
| `TEAM_COLLABORATION_SUMMARY.md` | - | This integration document |

### Reading Lists Backend
**Location**: `/docs/features/reading-lists/`

| File | Size | Purpose |
|------|------|---------|
| `README.md` | 15 KB | Quick reference for database and API |
| `DATABASE_SCHEMA.md` | 45 KB | Complete schema design and rationale |
| `API_ENDPOINTS.md` | 50 KB | 14 server action specifications |

**Total Documentation**: ~280 KB across 9 comprehensive files

---

## Design Specifications Summary

### Visual Design (UX Designer)

**Color Palette** (Zinc-based, matching portfolio):
- Background: `zinc-950` (dark mode), `white` (light mode)
- Text: `zinc-100/400` (dark), `zinc-900/600` (light)
- Borders: `zinc-800` (dark), `zinc-200` (light)
- Accents: `zinc-500` for interactive elements

**Typography** (Geist fonts):
- Headings: Geist Sans Bold (24-32px desktop, 20-24px mobile)
- Body: Geist Sans Regular (16-18px desktop, 14-16px mobile)
- Monospace: Geist Mono for counts/metadata

**Layout**:
- Container: `max-w-screen-sm` (640px max width)
- Spacing: Consistent 24-32px gaps between sections
- Padding: 16px mobile, 24px desktop

**Responsive Breakpoints**:
- Mobile: < 640px (sm)
- Tablet: 640-1024px (md)
- Desktop: > 1024px (lg)

**Animations** (Motion Primitives):
- Spring physics (`type: "spring", bounce: 0.25, duration: 0.5`)
- Hover effects: Scale 1.02, subtle shadow
- Page transitions: Fade in/slide up
- Respects `prefers-reduced-motion`

**Accessibility**:
- WCAG 2.1 AA color contrast ratios
- Full keyboard navigation
- ARIA labels and roles
- Screen reader friendly
- Focus indicators on all interactive elements

### Data Requirements (UX Designer)

**API Endpoints Needed**:
1. `GET /api/profile` - Owner profile (name, bio, image URL)
2. `GET /api/favorites?filter=current_year|all_time` - 5-6 favorite books
3. `GET /api/reading-lists` - All reading lists with previews

**Data Structures**:
```typescript
// Profile
{ name: string; bio: string; imageUrl: string }

// Favorites
{
  filter: 'current_year' | 'all_time';
  year?: number;
  books: Book[]; // max 5-6
}

// Reading Lists
{
  id: string;
  title: string;
  description: string;
  bookCount: number;
  coverPreviews: string[]; // max 3 URLs
  isPublic: boolean;
}
```

---

## Database Architecture Summary

### Schema Design (Backend Developer)

**New Models**:

1. **ReadingList**
   ```prisma
   model ReadingList {
     id          Int      @id @default(autoincrement())
     title       String
     description String?
     visibility  ReadingListVisibility @default(PRIVATE)
     type        ReadingListType @default(STANDARD)
     year        Int?
     owner       User @relation(fields: [ownerId], references: [id], onDelete: Cascade)
     ownerId     Int
     books       BookInReadingList[]
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
   }
   ```

2. **BookInReadingList** (junction table)
   ```prisma
   model BookInReadingList {
     id            Int @id @default(autoincrement())
     book          Book @relation(fields: [bookId], references: [id], onDelete: Cascade)
     bookId        Int
     readingList   ReadingList @relation(fields: [readingListId], references: [id], onDelete: Cascade)
     readingListId Int
     position      Int
     notes         String?
     addedAt       DateTime @default(now())
   }
   ```

3. **Enums**
   ```prisma
   enum ReadingListVisibility {
     PRIVATE
     PUBLIC
     FRIENDS
     UNLISTED
   }

   enum ReadingListType {
     STANDARD
     FAVORITES_YEAR
     FAVORITES_ALL
   }
   ```

**Key Design Decisions**:

- **Many-to-Many**: Books can be in multiple lists, lists can have multiple books
- **Position-Based Ordering**: Integer field with gaps (100, 200, 300) for efficient insertion
- **Unified Model**: Single ReadingList with type discriminator (not separate tables)
- **Cascade Deletes**: User deleted → lists deleted → book entries deleted
- **Strategic Indexing**: 8 indexes optimized for common queries

**Performance Characteristics**:
- Fetch user's 100 lists: < 10ms (p95)
- Fetch list with 50 books: < 20ms (p95)
- Add book to list: < 5ms (p95)
- Reorder 10 books: < 10ms per update (p95)

### API Architecture (Backend Developer)

**14 Server Actions Designed**:

| Action | Purpose | Input | Output |
|--------|---------|-------|--------|
| `createReadingList` | Create new list | title, desc, visibility | ReadingList |
| `fetchUserReadingLists` | Get all user lists | - | ReadingList[] |
| `fetchReadingList` | Get single list | listId | ReadingListWithBooks |
| `updateReadingList` | Update metadata | listId, updates | ReadingList |
| `deleteReadingList` | Delete list | listId | success |
| `addBookToReadingList` | Add book | listId, bookId | success |
| `removeBookFromReadingList` | Remove book | listId, bookId | success |
| `updateBookNotesInList` | Update notes | listId, bookId, notes | success |
| `reorderBooksInList` | Reorder books | listId, bookIds[] | success |
| `fetchFavoritesAllTime` | Get all-time favs | - | Book[] |
| `fetchFavoritesByYear` | Get year favs | year | Book[] |
| `fetchAllFavoritesYears` | List available years | - | number[] |
| `fetchListsContainingBook` | Find lists with book | bookId | ReadingList[] |
| `checkBookInList` | Check if in list | listId, bookId | boolean |

**Authorization Pattern** (follows existing Penumbra pattern):
```typescript
// All server actions:
1. Get authenticated user from Clerk
2. Filter queries by ownerId
3. Validate ownership for mutations
4. Return { success, data?, error? }
```

**Validation Rules**:
- Title: 1-100 characters, required
- Description: 0-500 characters, optional
- Year: 1900-2100 (for favorites)
- Max 5-6 books per favorites list (enforced at app level)
- Unique favorites per user per type (FAVORITES_ALL, FAVORITES_YEAR by year)

---

## Component Architecture Summary

### Component Hierarchy (Frontend Developer)

```
/app/page.tsx (Server Component)
└── HomeScreen (Client Component)
    ├── ProfileBio (Server Component)
    │   └── Fetches profile data
    │
    ├── FavoriteBooksSection (Client Component)
    │   ├── FavoriteBooksHeader
    │   ├── YearFilterDropdown (custom dropdown)
    │   └── FavoriteBooksCarousel
    │       └── BookCoverCard[] (reusable)
    │
    └── ReadingListsSection (Client Component)
        ├── ReadingListsHeader
        ├── ViewModeToggle (list/cover)
        └── ReadingListGrid
            └── ReadingListCard[]

/app/reading-lists/[id]/page.tsx (Server Component)
└── ReadingListDetail (Client Component)
    ├── ReadingListHeader
    │   ├── BackButton
    │   ├── Title & Description
    │   └── ViewModeToggle
    │
    ├── OwnerControls (if isOwner)
    │   ├── EditListModal
    │   │   └── Form (title, description, visibility)
    │   ├── AddBooksModal
    │   │   └── BookSearch (reuse library search)
    │   └── DeleteListButton
    │
    └── BookDisplay (conditional)
        ├── BookListView (drag-and-drop reordering)
        │   └── BookListItem[]
        └── BookGridView
            └── BookCoverCard[]

/components/ui/ (Shared Components)
├── BookCoverCard.tsx (reusable book display)
├── Modal.tsx (base modal component)
├── Dropdown.tsx (base dropdown component)
├── ViewModeToggle.tsx (list/cover toggle)
├── EmptyState.tsx (generic empty states)
└── BackButton.tsx (navigation back)
```

### File Structure (Frontend Developer)

**New Files to Create**:
```
src/
├── app/
│   ├── page.tsx                               # Home page (UPDATE)
│   ├── components/home/                       # NEW FOLDER
│   │   ├── HomeScreen.tsx
│   │   ├── ProfileBio.tsx
│   │   ├── FavoriteBooksSection.tsx
│   │   ├── FavoriteBooksHeader.tsx
│   │   ├── YearFilterDropdown.tsx
│   │   ├── FavoriteBooksCarousel.tsx
│   │   ├── ReadingListsSection.tsx
│   │   ├── ReadingListsHeader.tsx
│   │   ├── ReadingListGrid.tsx
│   │   └── ReadingListCard.tsx
│   │
│   └── reading-lists/                         # NEW FOLDER
│       ├── [id]/
│       │   └── page.tsx                       # Detail page
│       └── components/                        # NEW FOLDER
│           ├── ReadingListDetail.tsx
│           ├── ReadingListHeader.tsx
│           ├── BookListView.tsx
│           ├── BookGridView.tsx
│           ├── BookListItem.tsx
│           ├── OwnerControls.tsx
│           ├── EditListModal.tsx
│           ├── AddBooksModal.tsx
│           └── DeleteListButton.tsx
│
├── components/ui/                             # NEW SHARED COMPONENTS
│   ├── BookCoverCard.tsx
│   ├── Modal.tsx
│   ├── Dropdown.tsx
│   ├── ViewModeToggle.tsx
│   ├── EmptyState.tsx
│   └── BackButton.tsx
│
├── utils/actions/
│   └── reading-lists.ts                       # NEW (14 server actions)
│
└── shared.types.ts                            # UPDATE (new types)
```

**Total New Files**: 30+ components and pages

### Technical Decisions (Frontend Developer)

**Server vs Client Components**:
- **Server**: Home page, reading list detail page (data fetching, SEO)
- **Client**: Interactive sections (modals, dropdowns, drag-and-drop)
- **Pattern**: Server Components pass initial data to Client Components

**State Management**:
- Server state: Initial data from Prisma queries
- Client state: UI state (modals, filters, optimistic updates)
- No global state needed (feature is self-contained)

**Data Fetching**:
- **Server-side**: Initial page load (home page, detail page)
- **Client-side**: Filter changes (favorites year dropdown)
- **Optimistic updates**: Owner actions update UI immediately, rollback on failure

**Authentication**:
- Clerk `auth()` in Server Components
- Owner detection: `userId === content.ownerId`
- Conditional rendering of owner-only features

**Responsive Strategy**:
- Mobile-first CSS (Tailwind)
- Horizontal scrolling for favorites on mobile
- Grid layouts on desktop
- Hamburger menu integration (existing header)

**Loading & Error States**:
- Skeleton loaders matching final layout
- Inline error messages with retry
- Empty states with helpful CTAs (owner only)

---

## Implementation Roadmap

### 5-Phase Plan (Frontend Developer)

| Phase | Duration | Tasks | Hours | Deliverables |
|-------|----------|-------|-------|--------------|
| **1. Foundation** | Week 1 | 8 | 32 | Database schema, types, shared UI |
| **2. API Layer** | Week 1-2 | 9 | 28 | All server actions with auth |
| **3. Home Screen** | Week 2-3 | 14 | 44 | Profile, favorites, reading lists |
| **4. Detail Page** | Week 3-4 | 14 | 64 | List detail, drag-and-drop, modals |
| **5. Polish** | Week 4-5 | 9 | 56 | Testing, accessibility, performance |
| **TOTAL** | 5-6 weeks | **54** | **224** | Complete feature |

**Recommended Approach**:
1. Start with Phase 1 (Foundation) - can begin immediately
2. Parallelize where possible (database + types, API + shared UI)
3. Incremental releases (home screen first, then detail page)
4. Test continuously (unit, integration, E2E)

### Critical Path

```
Database Schema
    ↓
Type Definitions
    ↓
Server Actions (API) ← Shared UI Components (parallel)
    ↓
Home Screen Components
    ↓
Reading List Detail Components
    ↓
Testing & Polish
```

---

## Data Flow & Integration Points

### How It All Connects

**1. Home Page Load** (`/`)
```
User visits /
    ↓
Server Component (page.tsx) fetches:
    - Profile data (GET /api/profile)
    - Favorites (GET /api/favorites?filter=all_time)
    - Reading lists (GET /api/reading-lists)
    ↓
Passes data as props to Client Component
    ↓
HomeScreen renders:
    - ProfileBio (server component, no re-fetch)
    - FavoriteBooksSection (client component with initial data)
    - ReadingListsSection (client component with initial data)
```

**2. Favorites Filter Change**
```
User selects "of 2025" from dropdown
    ↓
Client component calls: fetchFavoritesByYear(2025)
    ↓
Server action queries:
    - ReadingList where type=FAVORITES_YEAR and year=2025
    - Joins BookInReadingList and Book
    ↓
Returns 5-6 books ordered by position
    ↓
Component updates UI with new books
```

**3. Reading List Detail** (`/reading-lists/[id]`)
```
User clicks reading list card
    ↓
Navigate to /reading-lists/[id]
    ↓
Server Component fetches:
    - Reading list metadata (fetchReadingList)
    - All books in list (via BookInReadingList join)
    - Ownership check (userId === ownerId)
    ↓
Passes data to Client Component
    ↓
ReadingListDetail renders:
    - Header with title/description
    - Owner controls (if isOwner)
    - BookListView or BookGridView (based on view mode)
```

**4. Owner Adds Book to List**
```
Owner clicks "Add Books" button
    ↓
AddBooksModal opens (reuses library search)
    ↓
Owner searches and selects books
    ↓
Client calls: addBookToReadingList(listId, bookId)
    ↓
Server action:
    - Validates ownership
    - Checks if book already in list
    - Calculates next position (max + 100)
    - Creates BookInReadingList entry
    ↓
Returns success
    ↓
Component optimistically updates UI
    ↓
Re-fetches list to confirm
```

**5. Owner Reorders Books**
```
Owner drags book from position 3 to position 1
    ↓
Client calculates new positions for all affected books
    ↓
Calls: reorderBooksInList(listId, [bookId1, bookId2, bookId3...])
    ↓
Server action:
    - Validates ownership
    - Updates position field for each book
    - Uses transaction for atomicity
    ↓
Returns success
    ↓
Component updates UI with new order
```

### Database Query Patterns

**Efficient List Fetching** (N+1 prevention):
```typescript
// Single query with includes (no N+1)
const readingList = await prisma.readingList.findUnique({
  where: { id: listId },
  include: {
    books: {
      include: { book: true },
      orderBy: { position: 'asc' }
    }
  }
});
```

**Favorites Query**:
```typescript
// All-time favorites
const favorites = await prisma.readingList.findUnique({
  where: {
    ownerId_type: {
      ownerId: userId,
      type: 'FAVORITES_ALL'
    }
  },
  include: {
    books: {
      include: { book: true },
      orderBy: { position: 'asc' },
      take: 6
    }
  }
});

// Year favorites
const favorites = await prisma.readingList.findUnique({
  where: {
    ownerId_type_year: {
      ownerId: userId,
      type: 'FAVORITES_YEAR',
      year: 2025
    }
  },
  include: {
    books: {
      include: { book: true },
      orderBy: { position: 'asc' },
      take: 6
    }
  }
});
```

**Public Lists Query** (for non-owners):
```typescript
const publicLists = await prisma.readingList.findMany({
  where: {
    OR: [
      { visibility: 'PUBLIC' },
      { ownerId: userId } // Owner sees all their lists
    ]
  },
  include: {
    books: {
      include: { book: true },
      orderBy: { position: 'asc' },
      take: 3 // Preview only
    }
  }
});
```

---

## Testing Strategy

### Coverage Targets

- **Unit Tests**: 85%+ coverage (React Testing Library)
- **Integration Tests**: Critical user flows (create, edit, delete lists)
- **E2E Tests**: Full workflows (Playwright)
- **Accessibility**: WCAG 2.1 AA (axe DevTools)
- **Performance**: Lighthouse score > 90

### Test Scenarios

**Unit Tests** (Components):
- ProfileBio renders correctly with data
- YearFilterDropdown changes filter state
- BookCoverCard displays image, title, author
- EmptyState shows correct message and CTA
- Modal opens/closes correctly
- Drag-and-drop reordering updates positions

**Integration Tests** (User Flows):
- Owner creates reading list
- Owner adds books to list
- Owner reorders books in list
- Owner edits list title/description
- Owner deletes reading list
- Non-owner views public list (no edit controls)

**E2E Tests** (Critical Paths):
- Full workflow: Create list → Add books → Reorder → View detail → Delete
- Favorites filter: Toggle between "all time" and "of {year}"
- Responsive: Mobile and desktop layouts work correctly
- Error handling: Network failures show retry options

**Accessibility Tests**:
- Keyboard navigation (Tab, Enter, Arrow keys)
- Screen reader announcements (ARIA labels)
- Color contrast ratios (WCAG AA)
- Focus indicators visible
- Skip links and landmarks

**Performance Tests**:
- Lighthouse audit (Performance, Accessibility, Best Practices, SEO)
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Bundle size analysis (watch for bloat)

---

## Risk Assessment

### High Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Profile image source unclear** | Blocks hero section | Clarify with stakeholder (portfolio, Clerk, custom upload?) |
| **Favorites logic undefined** | Blocks API implementation | Define criteria: manual selection? rating threshold? |
| **Drag-and-drop complexity** | Delays Phase 4 | Use battle-tested library (dnd-kit, react-beautiful-dnd) |
| **Database migration failure** | Blocks all development | Dry-run migration, backup database, rollback plan ready |

### Medium Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Portfolio styling mismatch** | Requires redesign | Review portfolio side-by-side, iterate on design |
| **Performance on large lists** | Poor UX with 100+ books | Implement pagination or virtualization |
| **Mobile dropdown UX** | Poor mobile experience | Use native select on mobile, custom on desktop |

### Low Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Year filter edge cases** | Minor UX issue | Handle no books for selected year gracefully |
| **Empty state wording** | Minor UX issue | Iterate based on user feedback |

---

## Open Questions for Stakeholder

**Critical** (Must answer before starting):
1. **Profile Image Source**: Where does the profile picture come from?
   - Option A: Pull from jonathanmooney.me portfolio
   - Option B: Use Clerk user profile image
   - Option C: Allow custom upload (requires file storage)

2. **Favorites Logic**: How are "favorite books" determined?
   - Option A: Owner manually marks books as favorites
   - Option B: Highest-rated books (requires rating system)
   - Option C: Most recently added books
   - Option D: Specific reading list designated as "favorites"

3. **Year Filter**: "of 2025" favorites - what defines the year?
   - Option A: Year book was added to library
   - Option B: Year book was published
   - Option C: Year book was marked as favorite

**Nice to Have** (Can decide later):
4. **Book Count**: Keep 5-6 favorites or make it configurable?
5. **Reading Lists in Phase 1**: Include with mock data or defer to Phase 2?
6. **Bio Character Limit**: 200-300 characters sufficient?

---

## Success Criteria

### Must Have (MVP)

- ✅ Home screen displays profile picture, name, bio
- ✅ Favorites section shows 5-6 books with year filter
- ✅ Reading lists section displays all user lists
- ✅ Reading list detail page shows all books in order
- ✅ Owner can create, edit, and delete reading lists
- ✅ Owner can add, remove, and reorder books in lists
- ✅ Public lists visible to all users, private only to owner
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessible (keyboard navigation, screen readers)

### Quality Gates

- ✅ TypeScript strict mode, no `any` types
- ✅ 85%+ test coverage (unit + integration)
- ✅ WCAG 2.1 AA compliant (zero axe violations)
- ✅ Lighthouse score > 90 (all categories)
- ✅ No console errors or warnings
- ✅ Build passes without errors

### Nice to Have (Post-MVP)

- Drag-and-drop to add books from library to lists
- Bulk operations (add multiple books, delete multiple lists)
- List templates or suggestions
- Social features (share reading lists, view friends' lists)
- Export reading lists (CSV, PDF)

---

## Next Steps

### Immediate Actions

1. ✅ **Planning Complete** - All documentation reviewed
2. ⏳ **Stakeholder Review** - Answer open questions above
3. ⏳ **Create Issues** - Break down 54 tasks into GitHub issues
4. ⏳ **Assign Phase 1** - Database schema, types, shared UI
5. ⏳ **Kickoff Meeting** - Review architecture with team

### Week 1 Goals

- Complete database migration (ReadingList, BookInReadingList)
- Define all TypeScript types in shared.types.ts
- Build 6 shared UI components (BookCoverCard, Modal, Dropdown, etc.)
- Write unit tests for shared components

### Week 2-3 Goals

- Implement all 14 server actions with authentication
- Build home screen components (Profile, Favorites, Reading Lists)
- Integrate with Server Component pages
- Write integration tests for server actions

### Week 4-5 Goals

- Build reading list detail page with drag-and-drop
- Implement owner controls (modals, delete, edit)
- Polish animations and transitions
- Comprehensive testing (unit, integration, E2E, accessibility)
- Performance optimization (Lighthouse audit)

### Week 6 (Buffer)

- Bug fixes from testing
- Documentation updates
- Production deployment preparation
- Final review and QA

---

## Team Communication Plan

### Daily Standup Topics

- Progress on assigned tasks
- Blockers or dependencies
- Design/implementation questions
- Testing results

### Weekly Review

- Demo completed components
- Review test coverage and quality metrics
- Adjust timeline if needed
- Plan next week's priorities

### Collaboration Channels

- **GitHub Issues**: Task tracking and assignments
- **Pull Requests**: Code review and discussion
- **Design Feedback**: Stakeholder approvals on visual design
- **Technical Decisions**: Document in this file or ADRs (Architecture Decision Records)

---

## Appendix: File Inventory

### Documentation Files Created

**Home Screen**:
- `/docs/features/home-screen/README.md` (10 KB)
- `/docs/features/home-screen/HOME_SCREEN_DESIGN_SPEC.md` (36 KB)
- `/docs/features/home-screen/COMPONENT_ARCHITECTURE.md` (46 KB)
- `/docs/features/home-screen/IMPLEMENTATION_PLAN.md` (69 KB)
- `/docs/features/home-screen/PLANNING_SUMMARY.md` (planning guide)
- `/docs/features/home-screen/TEAM_COLLABORATION_SUMMARY.md` (this file)

**Reading Lists Backend**:
- `/docs/features/reading-lists/README.md` (15 KB)
- `/docs/features/reading-lists/DATABASE_SCHEMA.md` (45 KB)
- `/docs/features/reading-lists/API_ENDPOINTS.md` (50 KB)

**Total**: ~280 KB of comprehensive documentation

### Code Files to Create

**Database**:
- `prisma/schema.prisma` (UPDATE: add 3 new models)

**Types**:
- `src/shared.types.ts` (UPDATE: add ReadingList types)

**Server Actions**:
- `src/utils/actions/reading-lists.ts` (NEW: 14 server actions)

**Shared UI Components** (6 new):
- `src/components/ui/BookCoverCard.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/Dropdown.tsx`
- `src/components/ui/ViewModeToggle.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/BackButton.tsx`

**Home Screen Components** (10 new):
- `src/app/components/home/HomeScreen.tsx`
- `src/app/components/home/ProfileBio.tsx`
- `src/app/components/home/FavoriteBooksSection.tsx`
- `src/app/components/home/FavoriteBooksHeader.tsx`
- `src/app/components/home/YearFilterDropdown.tsx`
- `src/app/components/home/FavoriteBooksCarousel.tsx`
- `src/app/components/home/ReadingListsSection.tsx`
- `src/app/components/home/ReadingListsHeader.tsx`
- `src/app/components/home/ReadingListGrid.tsx`
- `src/app/components/home/ReadingListCard.tsx`

**Reading List Detail Components** (9 new):
- `src/app/reading-lists/[id]/page.tsx`
- `src/app/reading-lists/components/ReadingListDetail.tsx`
- `src/app/reading-lists/components/ReadingListHeader.tsx`
- `src/app/reading-lists/components/BookListView.tsx`
- `src/app/reading-lists/components/BookGridView.tsx`
- `src/app/reading-lists/components/BookListItem.tsx`
- `src/app/reading-lists/components/OwnerControls.tsx`
- `src/app/reading-lists/components/EditListModal.tsx`
- `src/app/reading-lists/components/AddBooksModal.tsx`

**Total**: 30+ new files to create

---

## Contributors

**UX Designer Agent**: Visual design specifications, user experience, accessibility
**Backend Developer Agent**: Database schema, API architecture, performance optimization
**Frontend Developer Agent**: Component architecture, implementation planning, integration
**Coordinated by**: Claude (Sonnet 4.5)

**Date**: November 11, 2025
**Project**: Penumbra - Personal Library Management System
**Status**: ✅ Planning Complete - Ready for Implementation

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| Nov 11, 2025 | Initial planning and design | Claude (coordinating 3 agents) |

---

**End of Team Collaboration Summary**

For detailed specifications, refer to individual documentation files in `/docs/features/home-screen/` and `/docs/features/reading-lists/`.
