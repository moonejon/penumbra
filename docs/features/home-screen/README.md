# Home Screen - Quick Reference

**Feature:** Home Screen (Landing Page)
**Route:** `/`
**Status:** Design Phase - Ready for Implementation
**Version:** 1.0

---

## Overview

The home screen serves as the public-facing entry point to Penumbra, showcasing the owner's profile, favorite books, and curated reading lists.

## Key Sections

### 1. Hero Section
- **Owner's profile picture** (120px mobile, 160px desktop)
- **Name** (text-2xl, centered)
- **Bio** (200-300 characters, text-center, max-w-prose)

### 2. Favorite Books
- **Header** with year filter dropdown ("of 2025" / "of all time")
- **5-6 book covers** in responsive layout:
  - Mobile: Horizontal scroll
  - Tablet: 4-column grid
  - Desktop: 6-column grid (single row)
- Click cover opens book details modal

### 3. Reading Lists
- **Curated reading lists** created by owner
- **Card layout** with:
  - 3 book cover previews
  - List title and description
  - Book count
- Click navigates to list detail page (future)

---

## Design System

### Colors (Zinc Palette)
- Background: `bg-zinc-950`
- Text: `text-zinc-100` (primary), `text-zinc-400` (secondary)
- Borders: `border-zinc-800`
- Hover: `hover:border-zinc-700`, `hover:bg-zinc-900/50`

### Typography (Geist Fonts)
- Hero name: `text-2xl sm:text-3xl font-bold`
- Section headers: `text-xl font-semibold`
- Body: `text-base sm:text-lg text-zinc-400`
- Small: `text-sm`, `text-xs`

### Spacing
- Container: `max-w-screen-sm mx-auto px-4`
- Top padding: `pt-20` (clears header)
- Section spacing: `space-y-16`
- Card padding: `p-5`

### Border Radius
- Cards: `rounded-lg`
- Profile: `rounded-full`
- Images: `rounded`

---

## Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 768px
- **Desktop:** ≥ 768px

### Layout Changes

**Hero:**
- Mobile: 120px profile, text-base
- Desktop: 160px profile, text-lg

**Favorite Books:**
- Mobile: Horizontal scroll with snap
- Tablet: 4-column grid
- Desktop: 6-column grid

**Reading Lists:**
- Mobile: Single column
- Tablet/Desktop: 2-column grid

---

## Components to Build

### Page-Specific
1. `HeroSection.tsx` - Profile picture, name, bio
2. `FavoriteBooksSection.tsx` - Header, dropdown, cover browser
3. `ReadingListsSection.tsx` - List cards grid

### Reusable
1. `FavoriteFilterDropdown.tsx` - Year filter dropdown
2. `FavoriteBookCard.tsx` - Book cover with hover overlay
3. `ReadingListCard.tsx` - List preview card
4. `ReadingListEmpty.tsx` - Empty state

### Reuse Existing
- `Details` component from `/library` (book modal)
- `Button` from `/components/ui/button.tsx`
- Skeleton components

---

## API Endpoints Needed

### 1. Profile Data
```
GET /api/profile
```
Response: `{ ownerName, bio, profileImageUrl? }`

### 2. Favorite Books
```
GET /api/favorites?filter=current_year|all_time
```
Response: `{ books: BookType[], year?: number }`

**Note:** Limit to 5-6 books max

### 3. Reading Lists (NEW FEATURE)
```
GET /api/reading-lists
```
Response: `{ lists: ReadingList[] }`

**Note:** Preview shows first 3 book covers per list

---

## Database Schema (NEW)

Reading lists require new tables:

```prisma
model ReadingList {
  id          String   @id @default(cuid())
  ownerId     Int
  owner       User     @relation(fields: [ownerId], references: [id])
  title       String
  description String?
  visibility  ListVisibility @default(PUBLIC)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  books       ReadingListBook[]
}

model ReadingListBook {
  id            Int         @id @default(autoincrement())
  readingListId String
  readingList   ReadingList @relation(fields: [readingListId], references: [id])
  bookId        Int
  book          Book        @relation(fields: [bookId], references: [id])
  order         Int         @default(0)
  addedAt       DateTime    @default(now())

  @@unique([readingListId, bookId])
}

enum ListVisibility {
  PRIVATE
  PUBLIC
  UNLISTED
}
```

**Out of Scope for Phase 1:** Can use mock data for design implementation

---

## Animations (Motion v11)

### Hero Section
- Fade in + slide up on page load
- Spring transition (400ms)

### Favorite Books
- Staggered fade + scale (50ms delay per book)
- Hover: scale(1.05) on covers

### Reading Lists
- Sequential fade + slide from left
- Delay after favorites load

### Dropdown
- Fade + slide down (150ms)

**Accessibility:** All animations respect `prefers-reduced-motion`

---

## User Flows

### Public Visitor
1. Land on home page
2. View profile and bio
3. Browse favorites (switch year filter)
4. Click cover → Book details modal
5. Scroll to reading lists
6. Click list → Navigate to list page (future)

### Authenticated Owner (Future)
- Edit bio
- Manage favorites
- Create/edit reading lists

---

## Accessibility (WCAG 2.1 AA)

### Requirements
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Keyboard navigation (Tab, Enter, Space, ESC, Arrows)
- [ ] Focus indicators visible (ring-2 ring-zinc-600)
- [ ] Screen reader support (ARIA labels)
- [ ] Touch targets ≥ 44x44px
- [ ] Reduced motion support

### Key ARIA Attributes
- `aria-label` on sections
- `aria-haspopup="true"` on dropdown
- `aria-expanded` on dropdown toggle
- `alt` text on all images
- Semantic HTML (section, h1, h2, article)

---

## Implementation Phases

### Phase 1: Core Layout (MVP)
1. Hero section with static profile data
2. Favorite books with mock data
3. Basic responsive layout
4. Book details modal integration

### Phase 2: Interactive Features
1. Year filter dropdown (functional)
2. Animations (spring transitions)
3. API integration for profile + favorites
4. Loading and error states

### Phase 3: Reading Lists (Future)
1. Backend: Database schema migration
2. API: CRUD endpoints for lists
3. Frontend: List cards and detail page
4. Owner controls: Create/edit lists

---

## Out of Scope (Phase 1)

The following are NOT included in initial implementation:

1. **Reading Lists Backend**
   - Database schema changes
   - API endpoints
   - List detail page (`/lists/[listId]`)

2. **Owner Edit Controls**
   - Edit bio
   - Manage favorites
   - Create/edit/delete lists

3. **Advanced Features**
   - Share lists
   - Export lists
   - Privacy settings
   - Collaborative lists

---

## Performance Optimizations

### Images
- Next.js `Image` component with lazy loading
- WebP format with fallback
- Blur placeholders

### Code Splitting
- Dynamic import for Details modal
- Lazy load reading lists section

### Data Fetching
- Parallel fetches (profile + favorites + lists)
- ISR with 5-minute revalidation
- Client-side caching

---

## Testing Checklist

### Visual
- [ ] Matches portfolio aesthetic
- [ ] Responsive on mobile, tablet, desktop
- [ ] Consistent spacing and typography
- [ ] Smooth animations

### Functional
- [ ] Dropdown opens/closes correctly
- [ ] Book modal opens on cover click
- [ ] Year filter updates favorites
- [ ] Keyboard navigation works
- [ ] Touch scrolling smooth on mobile

### Accessibility
- [ ] Screen reader announces all content
- [ ] Focus indicators visible
- [ ] ARIA attributes correct
- [ ] Color contrast passes axe DevTools
- [ ] Reduced motion respected

### Performance
- [ ] Lighthouse score ≥ 90
- [ ] Images optimized
- [ ] No layout shift (CLS)
- [ ] Fast Time to Interactive (TTI)

---

## Key Files

### Design Documentation
- `HOME_SCREEN_DESIGN_SPEC.md` - Comprehensive design spec (this folder)

### Implementation Files (To Create)
- `src/app/page.tsx` - Main home page route
- `src/app/components/HeroSection.tsx`
- `src/app/components/FavoriteBooksSection.tsx`
- `src/app/components/FavoriteFilterDropdown.tsx`
- `src/app/components/FavoriteBookCard.tsx`
- `src/app/components/ReadingListsSection.tsx`
- `src/app/components/ReadingListCard.tsx`

### API Routes (To Create)
- `src/app/api/profile/route.ts`
- `src/app/api/favorites/route.ts`
- `src/app/api/reading-lists/route.ts` (future)

---

## Design Decisions

### Profile Image Source
- **Option 1:** Pull from portfolio (jonathanmooney.me)
- **Option 2:** Pull from Clerk user profile
- **Option 3:** Custom upload (database field)
- **Recommended:** Portfolio (consistency across sites)

### Favorite Book Count
- **Current:** 5-6 books
- **Configurable:** Allow owner to set count (future)
- **Default:** 6 books on desktop, 5 on mobile

### Reading List Preview
- **Current:** 3 book covers
- **Alternative:** 4-5 covers with overlap effect
- **Recommended:** 3 covers (clean, not cluttered)

---

## Questions for Stakeholder

1. **Profile Image:** Where should we source the owner's profile picture?
2. **Favorites Logic:** How do we determine "of 2025" vs "of all time"?
   - Date added to library?
   - Manual curation by owner?
   - Most viewed/opened?
3. **Reading Lists:** Should this be included in Phase 1 (with mock data) or deferred?
4. **Edit Controls:** When should owner edit features be prioritized?

---

## Related Documentation

- [CLAUDE_PROGRESS.md](/Users/jonathan/github/penumbra/CLAUDE_PROGRESS.md) - Project progress
- [Portfolio Styling Migration](/Users/jonathan/github/penumbra/docs/migration/portfolio-styling/README.md)
- [Visual Design Plan](/Users/jonathan/github/penumbra/docs/migration/portfolio-styling/VISUAL_DESIGN_PLAN.md)

---

## Next Steps

1. **Review:** Stakeholder review of design specification
2. **Mock Data:** Create sample profile, favorites, and lists for development
3. **Implement Hero:** Build and style hero section first
4. **Implement Favorites:** Add cover browser with dropdown
5. **Integrate API:** Connect to real data endpoints
6. **Test:** Accessibility, performance, cross-browser
7. **Deploy:** Merge to main and deploy to production

---

**For detailed specifications, see:** [HOME_SCREEN_DESIGN_SPEC.md](./HOME_SCREEN_DESIGN_SPEC.md)

**Questions?** Contact UX Designer agent or project lead.
