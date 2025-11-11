# Home Screen Implementation Plan

## Overview

This document provides a detailed, phase-by-phase implementation plan for the Penumbra home screen feature. It breaks down the architecture into actionable tasks with estimated complexity, dependencies, and suggested implementation order.

## Quick Reference

**Total Estimated Time:** 4-5 weeks (assuming 1 full-time developer)
**Total Task Complexity:** High
**Critical Path:** Database Schema → API Routes → Shared UI → Home Screen → Reading List Detail
**Can Start Immediately:** Database schema, type definitions, shared UI components

---

## Phase 1: Foundation (Week 1)

### Goal
Establish the foundational infrastructure for the home screen feature: shared components, type definitions, and database schema.

---

### Task 1.1: Type Definitions
**File:** `/src/shared.types.ts`
**Complexity:** Low
**Estimated Time:** 4 hours
**Dependencies:** None

**What to do:**
1. Add `UserProfile` interface
2. Add `FavoriteBook` interface (extends `BookType`)
3. Add `ReadingList` interface
4. Add `ReadingListBook` interface (extends `BookType`)
5. Add `ReadingListWithBooks` interface
6. Add `ViewMode` type
7. Add `YearFilterOption` interface
8. Export all new types

**Deliverables:**
- [ ] Type definitions added to `shared.types.ts`
- [ ] All types exported properly
- [ ] Types include JSDoc comments

**Testing:**
- TypeScript compilation passes
- No type errors in existing code

---

### Task 1.2: Database Schema Updates
**File:** `/prisma/schema.prisma`
**Complexity:** Medium
**Estimated Time:** 4 hours
**Dependencies:** None

**What to do:**
1. Add `ReadingList` model with fields:
   - `id` (String, cuid, primary key)
   - `title` (String)
   - `description` (String)
   - `isPublic` (Boolean, default true)
   - `ownerId` (String, foreign key to User.clerkId)
   - `createdAt` (DateTime)
   - `updatedAt` (DateTime)
   - Relation to `User` model
   - Relation to `ReadingListBook` model

2. Add `ReadingListBook` join model with fields:
   - `id` (Int, autoincrement, primary key)
   - `readingListId` (String, foreign key)
   - `bookId` (Int, foreign key)
   - `listPosition` (Int, for ordering)
   - `addedAt` (DateTime)
   - Relation to `ReadingList` model
   - Relation to `Book` model
   - Unique constraint on `[readingListId, bookId]`
   - Index on `[readingListId, listPosition]`

3. Add `Favorite` model with fields:
   - `id` (Int, autoincrement, primary key)
   - `userId` (String, foreign key to User.clerkId)
   - `bookId` (Int, foreign key)
   - `favoriteRank` (Int, 1-10 ranking)
   - `year` (Int, optional - year favorited)
   - `favoritedAt` (DateTime)
   - Relation to `User` model
   - Relation to `Book` model
   - Unique constraint on `[userId, bookId]`
   - Index on `[userId, year]`

4. Update `User` model to include relations:
   - `readingLists` (ReadingList[])
   - `favorites` (Favorite[])

5. Update `Book` model to include relations:
   - `readingListBooks` (ReadingListBook[])
   - `favorites` (Favorite[])

6. Generate Prisma client: `npx prisma generate`
7. Create migration: `npx prisma migrate dev --name add_reading_lists_favorites`

**Deliverables:**
- [ ] Prisma schema updated
- [ ] Migration created and applied
- [ ] Prisma client regenerated
- [ ] Database updated successfully

**Testing:**
- Migration runs without errors
- Can create test records in database
- Relations work correctly

---

### Task 1.3: BookCoverCard Component
**File:** `/src/components/ui/BookCoverCard.tsx`
**Complexity:** Medium
**Estimated Time:** 6 hours
**Dependencies:** Task 1.1 (types)

**What to do:**
1. Create component extending existing GridItem pattern
2. Add props:
   - `book` (BookType)
   - `size` ('small' | 'medium' | 'large')
   - `onClick` (optional)
   - `onRemove` (optional)
   - `isSelected` (boolean)
   - `showOverlay` (boolean)
   - `className` (string)

3. Implement features:
   - Image loading with skeleton
   - Error fallback with icon
   - Size variants using class-variance-authority
   - Hover overlay (optional, controlled by showOverlay)
   - Remove button (optional, when onRemove provided)
   - Click handler
   - Keyboard navigation (Enter/Space)
   - ARIA labels

4. Styling:
   - Tailwind utility classes
   - Zinc color palette
   - Responsive sizing
   - Smooth transitions
   - Focus indicators

**Deliverables:**
- [ ] BookCoverCard component created
- [ ] Props interface defined and typed
- [ ] Size variants implemented (small, medium, large)
- [ ] Loading and error states handled
- [ ] Hover overlay working
- [ ] Remove button integrated (when applicable)
- [ ] Keyboard accessible
- [ ] Responsive styling

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test all size variants
- [ ] Test with/without image
- [ ] Test loading state
- [ ] Test error state
- [ ] Test click handler
- [ ] Test remove handler
- [ ] Keyboard navigation works

---

### Task 1.4: ViewModeToggle Component
**File:** `/src/components/ui/ViewModeToggle.tsx`
**Complexity:** Low
**Estimated Time:** 3 hours
**Dependencies:** None

**What to do:**
1. Create standardized toggle component (refactor from library)
2. Add props:
   - `mode` ('list' | 'covers' | 'grid')
   - `onChange` (function)
   - `options` (optional array of modes to show)

3. Implement features:
   - Icon-based buttons (List, Grid from Lucide)
   - Active state styling
   - Keyboard navigation (Tab, Arrow keys)
   - ARIA labels (`aria-pressed`, `aria-label`)
   - Tooltip on hover (optional)

4. Styling:
   - Button group layout
   - Active/inactive states
   - Hover effects
   - Focus indicators

**Deliverables:**
- [ ] ViewModeToggle component created
- [ ] Props interface defined
- [ ] Icon buttons rendered
- [ ] Active state styling
- [ ] Keyboard accessible
- [ ] ARIA labels added

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test mode switching
- [ ] Test keyboard navigation
- [ ] Test custom options prop

---

### Task 1.5: Modal Component
**File:** `/src/components/ui/Modal.tsx`
**Complexity:** Medium
**Estimated Time:** 6 hours
**Dependencies:** None

**What to do:**
1. Create base modal component
2. Add props:
   - `children` (React.ReactNode)
   - `onClose` (function)
   - `size` ('small' | 'medium' | 'large')
   - `title` (optional string)
   - `isOpen` (boolean)

3. Implement features:
   - Backdrop with click-outside to close
   - Escape key to close
   - Focus trap (trap focus within modal)
   - Scroll lock on body when open
   - Smooth animations (Motion Primitives)
   - Close button (X icon)
   - Responsive sizing
   - Portal rendering (render outside DOM hierarchy)

4. Styling:
   - Backdrop with blur effect
   - Card-style modal
   - Responsive padding and margins
   - Zinc color palette
   - Smooth enter/exit animations

5. Accessibility:
   - `role="dialog"`
   - `aria-modal="true"`
   - `aria-labelledby` for title
   - Focus first interactive element on open
   - Return focus to trigger on close

**Deliverables:**
- [ ] Modal component created
- [ ] Props interface defined
- [ ] Portal rendering working
- [ ] Click-outside to close
- [ ] Escape key to close
- [ ] Focus trap implemented
- [ ] Scroll lock on body
- [ ] Animations smooth
- [ ] Fully accessible

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test open/close functionality
- [ ] Test click-outside behavior
- [ ] Test Escape key
- [ ] Test focus trap
- [ ] Test scroll lock
- [ ] Keyboard navigation works
- [ ] ARIA attributes correct

---

### Task 1.6: Dropdown Component
**File:** `/src/components/ui/Dropdown.tsx`
**Complexity:** Medium
**Estimated Time:** 5 hours
**Dependencies:** None

**What to do:**
1. Create base dropdown component
2. Add props:
   - `options` (array of `{ label: string, value: string | number }`)
   - `value` (string | number)
   - `onChange` (function)
   - `placeholder` (optional string)
   - `disabled` (boolean)

3. Implement features:
   - Trigger button shows selected option
   - Popover menu with options
   - Keyboard navigation (Arrow keys, Enter, Escape)
   - Click outside to close
   - Search filter (optional, for long lists)
   - Loading state (optional)
   - Custom option rendering (optional)

4. Styling:
   - Trigger button with chevron icon
   - Popover with max-height and scroll
   - Hover/focus states for options
   - Selected option indicator (checkmark)
   - Zinc color palette

5. Accessibility:
   - `role="combobox"`
   - `aria-expanded`
   - `aria-controls`
   - `aria-activedescendant`
   - Keyboard navigation
   - Screen reader announcements

**Deliverables:**
- [ ] Dropdown component created
- [ ] Props interface defined
- [ ] Trigger button working
- [ ] Popover menu rendering
- [ ] Keyboard navigation implemented
- [ ] Click-outside to close
- [ ] Fully accessible

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test option selection
- [ ] Test keyboard navigation
- [ ] Test disabled state
- [ ] Test with many options (scroll)
- [ ] ARIA attributes correct

---

### Task 1.7: EmptyState Component
**File:** `/src/components/ui/EmptyState.tsx`
**Complexity:** Low
**Estimated Time:** 2 hours
**Dependencies:** None

**What to do:**
1. Create generic empty state component
2. Add props:
   - `icon` (React.ComponentType - Lucide icon)
   - `title` (string)
   - `description` (string)
   - `action` (optional: `{ label: string, onClick: () => void }`)

3. Implement features:
   - Centered layout
   - Icon at top
   - Title and description
   - Optional CTA button
   - Responsive sizing

4. Styling:
   - Centered text
   - Icon with reduced opacity
   - Zinc color palette
   - Max-width for readability

**Deliverables:**
- [ ] EmptyState component created
- [ ] Props interface defined
- [ ] Layout responsive
- [ ] CTA button working (if provided)

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test with and without action button
- [ ] Test different icons

---

### Task 1.8: BackButton Component
**File:** `/src/components/ui/BackButton.tsx`
**Complexity:** Low
**Estimated Time:** 2 hours
**Dependencies:** None

**What to do:**
1. Create back navigation button
2. Add props:
   - `href` (optional string - custom back URL)
   - `label` (optional string - default "Back")
   - `onClick` (optional function - custom handler)

3. Implement features:
   - Arrow left icon (Lucide)
   - Uses Next.js router.back() by default
   - Can navigate to custom href
   - Keyboard accessible

4. Styling:
   - Simple button with icon + text
   - Hover effect
   - Zinc color palette

**Deliverables:**
- [ ] BackButton component created
- [ ] Props interface defined
- [ ] Default back behavior working
- [ ] Custom href working
- [ ] Keyboard accessible

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test default back navigation
- [ ] Test custom href
- [ ] Test custom onClick handler

---

## Phase 2: API Layer (Week 1-2)

### Goal
Implement all backend API routes for reading lists and favorites with proper authentication and authorization.

---

### Task 2.1: Favorites API - GET /api/favorites
**File:** `/src/app/api/favorites/route.ts`
**Complexity:** Medium
**Estimated Time:** 4 hours
**Dependencies:** Task 1.1 (types), Task 1.2 (database)

**What to do:**
1. Create API route file
2. Implement GET handler:
   - Get current user from Clerk `auth()`
   - Parse query parameters (`year`, `limit`)
   - Fetch user's favorites from database
   - Filter by year if provided
   - Limit results (default 6)
   - Calculate available years (distinct years with favorites)
   - Return JSON response

3. Authentication:
   - Require authentication (return 401 if not authenticated)
   - Only fetch current user's favorites

4. Error handling:
   - Handle database errors
   - Return appropriate status codes
   - Log errors

**Deliverables:**
- [ ] `/api/favorites/route.ts` created
- [ ] GET handler implemented
- [ ] Year filtering working
- [ ] Limit parameter working
- [ ] Available years returned
- [ ] Authentication enforced
- [ ] Error handling implemented

**Testing:**
- [ ] Integration tests for API route
- [ ] Test with year filter
- [ ] Test with limit parameter
- [ ] Test unauthenticated request (401)
- [ ] Test with no favorites (empty array)

**Example Response:**
```json
{
  "favorites": [
    {
      "id": 1,
      "title": "Book Title",
      "authors": ["Author"],
      "image": "url",
      "favoriteRank": 1,
      "favoritedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "availableYears": [2024, 2023, 2022]
}
```

---

### Task 2.2: Reading Lists API - GET /api/reading-lists
**File:** `/src/app/api/reading-lists/route.ts`
**Complexity:** Medium
**Estimated Time:** 4 hours
**Dependencies:** Task 1.1 (types), Task 1.2 (database)

**What to do:**
1. Create API route file
2. Implement GET handler:
   - Get current user from Clerk `auth()` (optional)
   - Parse query parameters (`userId`, `isPublic`)
   - Fetch reading lists from database:
     - If authenticated: user's lists + public lists
     - If not authenticated: only public lists
   - Include cover images (first 3-4 book covers from each list)
   - Include book count for each list
   - Return JSON response

3. Authorization:
   - Public lists visible to all
   - Private lists only visible to owner

4. Error handling:
   - Handle database errors
   - Return appropriate status codes

**Deliverables:**
- [ ] `/api/reading-lists/route.ts` created
- [ ] GET handler implemented
- [ ] Public/private filtering working
- [ ] Cover images included
- [ ] Book count included
- [ ] Works for authenticated and guest users

**Testing:**
- [ ] Integration tests for API route
- [ ] Test as authenticated user (see own + public)
- [ ] Test as guest (only public)
- [ ] Test with no lists (empty array)
- [ ] Test with isPublic filter

**Example Response:**
```json
{
  "lists": [
    {
      "id": "cuid123",
      "title": "Summer Reading",
      "description": "Books for summer",
      "coverImages": ["url1", "url2", "url3"],
      "bookCount": 10,
      "isPublic": true,
      "ownerId": "user_123",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Task 2.3: Reading Lists API - POST /api/reading-lists
**File:** `/src/app/api/reading-lists/route.ts`
**Complexity:** Medium
**Estimated Time:** 3 hours
**Dependencies:** Task 1.1 (types), Task 1.2 (database)

**What to do:**
1. Implement POST handler in existing route file:
   - Get current user from Clerk `auth()`
   - Parse request body (`title`, `description`, `isPublic`)
   - Validate input (title required, non-empty)
   - Create new reading list in database
   - Set ownerId to current user
   - Return created list

2. Authentication:
   - Require authentication (return 401 if not authenticated)

3. Validation:
   - Title required and non-empty
   - Description optional
   - isPublic defaults to true

4. Error handling:
   - Handle validation errors (400)
   - Handle database errors (500)

**Deliverables:**
- [ ] POST handler implemented
- [ ] Input validation working
- [ ] Authentication enforced
- [ ] Error handling implemented

**Testing:**
- [ ] Integration tests for API route
- [ ] Test successful creation
- [ ] Test without title (validation error)
- [ ] Test unauthenticated request (401)
- [ ] Test database error handling

---

### Task 2.4: Reading Lists API - GET /api/reading-lists/[id]
**File:** `/src/app/api/reading-lists/[id]/route.ts`
**Complexity:** Medium
**Estimated Time:** 4 hours
**Dependencies:** Task 1.1 (types), Task 1.2 (database)

**What to do:**
1. Create API route file with dynamic [id]
2. Implement GET handler:
   - Get current user from Clerk `auth()` (optional)
   - Parse id from params
   - Fetch reading list from database
   - Check access control:
     - If public: allow all
     - If private: only owner
   - Fetch books in list (ordered by listPosition)
   - Return list with books

3. Authorization:
   - Public lists visible to all
   - Private lists only visible to owner (403 if not owner)

4. Error handling:
   - Handle list not found (404)
   - Handle access denied (403)
   - Handle database errors (500)

**Deliverables:**
- [ ] `/api/reading-lists/[id]/route.ts` created
- [ ] GET handler implemented
- [ ] Access control working
- [ ] Books included and ordered
- [ ] 404 for missing lists
- [ ] 403 for unauthorized access

**Testing:**
- [ ] Integration tests for API route
- [ ] Test fetching public list (as guest)
- [ ] Test fetching private list (as owner)
- [ ] Test fetching private list (as non-owner, 403)
- [ ] Test non-existent list (404)

**Example Response:**
```json
{
  "list": {
    "id": "cuid123",
    "title": "Summer Reading",
    "description": "Books for summer",
    "isPublic": true,
    "ownerId": "user_123",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "books": [
      {
        "id": 1,
        "title": "Book Title",
        "authors": ["Author"],
        "image": "url",
        "listPosition": 0,
        "addedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### Task 2.5: Reading Lists API - PATCH /api/reading-lists/[id]
**File:** `/src/app/api/reading-lists/[id]/route.ts`
**Complexity:** Medium
**Estimated Time:** 3 hours
**Dependencies:** Task 2.4

**What to do:**
1. Implement PATCH handler in existing route file:
   - Get current user from Clerk `auth()`
   - Parse id from params
   - Parse request body (`title`, `description`, `isPublic`)
   - Fetch existing list
   - Check ownership (403 if not owner)
   - Update list in database
   - Return updated list

2. Authentication & Authorization:
   - Require authentication (401)
   - Require ownership (403)

3. Validation:
   - Title must be non-empty if provided
   - Only update provided fields

4. Error handling:
   - Handle list not found (404)
   - Handle not owner (403)
   - Handle validation errors (400)
   - Handle database errors (500)

**Deliverables:**
- [ ] PATCH handler implemented
- [ ] Ownership check working
- [ ] Partial updates working
- [ ] Validation implemented
- [ ] Error handling implemented

**Testing:**
- [ ] Integration tests for API route
- [ ] Test successful update (as owner)
- [ ] Test update as non-owner (403)
- [ ] Test unauthenticated request (401)
- [ ] Test partial updates
- [ ] Test non-existent list (404)

---

### Task 2.6: Reading Lists API - DELETE /api/reading-lists/[id]
**File:** `/src/app/api/reading-lists/[id]/route.ts`
**Complexity:** Low
**Estimated Time:** 2 hours
**Dependencies:** Task 2.4

**What to do:**
1. Implement DELETE handler in existing route file:
   - Get current user from Clerk `auth()`
   - Parse id from params
   - Fetch existing list
   - Check ownership (403 if not owner)
   - Delete list from database (cascade delete books)
   - Return success response

2. Authentication & Authorization:
   - Require authentication (401)
   - Require ownership (403)

3. Database:
   - Cascade delete ReadingListBook entries

4. Error handling:
   - Handle list not found (404)
   - Handle not owner (403)
   - Handle database errors (500)

**Deliverables:**
- [ ] DELETE handler implemented
- [ ] Ownership check working
- [ ] Cascade deletion working
- [ ] Error handling implemented

**Testing:**
- [ ] Integration tests for API route
- [ ] Test successful deletion (as owner)
- [ ] Test delete as non-owner (403)
- [ ] Test unauthenticated request (401)
- [ ] Test non-existent list (404)
- [ ] Verify books in list are deleted

---

### Task 2.7: Reading List Books API - POST /api/reading-lists/[id]/books
**File:** `/src/app/api/reading-lists/[id]/books/route.ts`
**Complexity:** Medium
**Estimated Time:** 4 hours
**Dependencies:** Task 2.4

**What to do:**
1. Create API route file
2. Implement POST handler:
   - Get current user from Clerk `auth()`
   - Parse id from params
   - Parse request body (`bookIds` - array of book IDs)
   - Fetch reading list
   - Check ownership (403 if not owner)
   - For each bookId:
     - Check if book exists
     - Check if already in list (skip if so)
     - Determine listPosition (max + 1)
     - Create ReadingListBook entry
   - Return success with count of added books

3. Authentication & Authorization:
   - Require authentication (401)
   - Require ownership (403)

4. Validation:
   - bookIds must be array
   - Books must exist
   - Skip duplicates

5. Error handling:
   - Handle list not found (404)
   - Handle book not found (skip or error)
   - Handle not owner (403)
   - Handle database errors (500)

**Deliverables:**
- [ ] `/api/reading-lists/[id]/books/route.ts` created
- [ ] POST handler implemented
- [ ] Ownership check working
- [ ] Duplicate detection working
- [ ] Position calculation working
- [ ] Error handling implemented

**Testing:**
- [ ] Integration tests for API route
- [ ] Test adding single book
- [ ] Test adding multiple books
- [ ] Test adding duplicate (should skip)
- [ ] Test as non-owner (403)
- [ ] Test with non-existent book

**Example Request:**
```json
{
  "bookIds": [1, 2, 3]
}
```

**Example Response:**
```json
{
  "success": true,
  "addedCount": 3
}
```

---

### Task 2.8: Reading List Books API - DELETE /api/reading-lists/[id]/books
**File:** `/src/app/api/reading-lists/[id]/books/route.ts`
**Complexity:** Medium
**Estimated Time:** 3 hours
**Dependencies:** Task 2.7

**What to do:**
1. Implement DELETE handler in existing route file:
   - Get current user from Clerk `auth()`
   - Parse id from params
   - Parse request body (`bookId` - single book ID)
   - Fetch reading list
   - Check ownership (403 if not owner)
   - Delete ReadingListBook entry
   - Reorder remaining books (adjust listPosition)
   - Return success response

2. Authentication & Authorization:
   - Require authentication (401)
   - Require ownership (403)

3. Validation:
   - bookId must be provided
   - Book must be in list

4. Reordering:
   - After deletion, decrement listPosition for all books after deleted book

5. Error handling:
   - Handle list not found (404)
   - Handle book not in list (404)
   - Handle not owner (403)
   - Handle database errors (500)

**Deliverables:**
- [ ] DELETE handler implemented
- [ ] Ownership check working
- [ ] Deletion working
- [ ] Reordering after deletion working
- [ ] Error handling implemented

**Testing:**
- [ ] Integration tests for API route
- [ ] Test removing book
- [ ] Test positions reordered after removal
- [ ] Test as non-owner (403)
- [ ] Test removing non-existent book (404)

---

### Task 2.9: Reading List Books API - PATCH /api/reading-lists/[id]/books/reorder
**File:** `/src/app/api/reading-lists/[id]/books/reorder/route.ts`
**Complexity:** Medium
**Estimated Time:** 4 hours
**Dependencies:** Task 2.7

**What to do:**
1. Create API route file
2. Implement PATCH handler:
   - Get current user from Clerk `auth()`
   - Parse id from params
   - Parse request body (`bookIds` - ordered array of book IDs)
   - Fetch reading list
   - Check ownership (403 if not owner)
   - Validate all bookIds are in list
   - Update listPosition for each book based on array index
   - Return success response

3. Authentication & Authorization:
   - Require authentication (401)
   - Require ownership (403)

4. Validation:
   - bookIds must match all books in list
   - All bookIds must exist in list

5. Database:
   - Update listPosition for each book in transaction

6. Error handling:
   - Handle list not found (404)
   - Handle invalid bookIds (400)
   - Handle not owner (403)
   - Handle database errors (500)

**Deliverables:**
- [ ] `/api/reading-lists/[id]/books/reorder/route.ts` created
- [ ] PATCH handler implemented
- [ ] Ownership check working
- [ ] Reordering working
- [ ] Transaction implemented (all or nothing)
- [ ] Error handling implemented

**Testing:**
- [ ] Integration tests for API route
- [ ] Test reordering books
- [ ] Test with missing bookIds (400)
- [ ] Test with extra bookIds (400)
- [ ] Test as non-owner (403)
- [ ] Test transaction rollback on error

**Example Request:**
```json
{
  "bookIds": [3, 1, 2]
}
```

**Example Response:**
```json
{
  "success": true
}
```

---

## Phase 3: Home Screen (Week 2-3)

### Goal
Implement all home screen components: profile bio, favorite books section, and reading lists section.

---

### Task 3.1: ProfileBio Component
**File:** `/src/app/components/home/ProfileBio.tsx`
**Complexity:** Low
**Estimated Time:** 4 hours
**Dependencies:** Task 1.1 (types)

**What to do:**
1. Create component
2. Add props:
   - `profile` (UserProfile | null)

3. Implement layout:
   - Centered container
   - Profile image (rounded, fallback to initials)
   - Name (heading)
   - Bio text (paragraph, max-width for readability)

4. Styling:
   - Responsive layout (centered on all sizes)
   - Zinc color palette
   - Geist Sans font
   - Graceful handling of missing data

5. Handle null profile (guest view):
   - Show generic welcome message
   - No profile image

**Deliverables:**
- [ ] ProfileBio component created
- [ ] Props interface defined
- [ ] Layout responsive
- [ ] Profile image rendering
- [ ] Fallback for missing profile
- [ ] Guest view handled

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test with full profile
- [ ] Test with null profile (guest)
- [ ] Test with missing bio
- [ ] Test image fallback

---

### Task 3.2: YearFilterDropdown Component
**File:** `/src/app/components/home/YearFilterDropdown.tsx`
**Complexity:** Medium
**Estimated Time:** 5 hours
**Dependencies:** Task 1.6 (Dropdown base)

**What to do:**
1. Create component extending base Dropdown
2. Add props:
   - `value` ('all-time' | number)
   - `onChange` (function)
   - `availableYears` (number[])

3. Implement features:
   - Render as part of title: "of [dropdown]"
   - Options: "all time", "2024", "2023", etc.
   - Custom styling (inline with title)
   - Keyboard navigation
   - Click outside to close

4. Styling:
   - Dropdown trigger styled as text (not button)
   - Underline or subtle indicator
   - Popover menu below trigger
   - Zinc color palette

5. Accessibility:
   - Full keyboard navigation
   - ARIA labels
   - Screen reader friendly

**Deliverables:**
- [ ] YearFilterDropdown component created
- [ ] Props interface defined
- [ ] Options rendering ("all time" + years)
- [ ] Inline styling with title
- [ ] Keyboard navigation working
- [ ] Fully accessible

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test year selection
- [ ] Test "all time" selection
- [ ] Test keyboard navigation
- [ ] Test with many years (scroll)

---

### Task 3.3: FavoriteBooksHeader Component
**File:** `/src/app/components/home/FavoriteBooksHeader.tsx`
**Complexity:** Low
**Estimated Time:** 2 hours
**Dependencies:** Task 3.2

**What to do:**
1. Create component
2. Add props:
   - `yearFilter` ('all-time' | number)
   - `onYearChange` (function)
   - `availableYears` (number[])

3. Implement layout:
   - Flex container (responsive)
   - Title: "Favorite Books"
   - YearFilterDropdown inline: "of [dropdown]"
   - Mobile: stacked, Desktop: inline

4. Styling:
   - Zinc color palette
   - Geist Sans font
   - Responsive spacing

**Deliverables:**
- [ ] FavoriteBooksHeader component created
- [ ] Props interface defined
- [ ] Layout responsive
- [ ] YearFilterDropdown integrated

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test year filter integration
- [ ] Test responsive layout

---

### Task 3.4: FavoriteBooksCarousel Component
**File:** `/src/app/components/home/FavoriteBooksCarousel.tsx`
**Complexity:** Medium
**Estimated Time:** 6 hours
**Dependencies:** Task 1.3 (BookCoverCard)

**What to do:**
1. Create component
2. Add props:
   - `books` (FavoriteBook[])
   - `isLoading` (boolean)

3. Implement layout:
   - Mobile: horizontal scroll container
   - Desktop: grid layout (5-6 columns)
   - Each book uses BookCoverCard
   - Gap between cards

4. Features:
   - Smooth horizontal scroll on mobile
   - Touch gestures on mobile
   - Hover effects on desktop
   - Click to navigate to book detail
   - Loading skeletons (when isLoading)

5. Styling:
   - Responsive grid (1 row on mobile, grid on desktop)
   - Hide scrollbar on mobile (but keep scrollable)
   - Zinc color palette
   - Smooth transitions

6. Interactions:
   - Click book to view details
   - Keyboard navigation (Tab through books)

**Deliverables:**
- [ ] FavoriteBooksCarousel component created
- [ ] Props interface defined
- [ ] Horizontal scroll on mobile working
- [ ] Grid layout on desktop
- [ ] BookCoverCard integration
- [ ] Loading skeletons implemented
- [ ] Click navigation working
- [ ] Responsive layout

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test with multiple books
- [ ] Test with loading state
- [ ] Test with empty array
- [ ] Test mobile scroll
- [ ] Test desktop grid
- [ ] Test click navigation

---

### Task 3.5: FavoriteBooksSection Component
**File:** `/src/app/components/home/FavoriteBooksSection.tsx`
**Complexity:** Medium
**Estimated Time:** 5 hours
**Dependencies:** Task 3.3, Task 3.4

**What to do:**
1. Create component
2. Add props:
   - `initialFavorites` (FavoriteBook[])

3. Implement state management:
   - `yearFilter` state ('all-time' | number)
   - `favorites` state (FavoriteBook[])
   - `isLoading` state (boolean)
   - `availableYears` state (number[])

4. Implement data fetching:
   - useEffect to fetch favorites when yearFilter changes
   - Call `/api/favorites` with year parameter
   - Update favorites and isLoading state
   - Handle errors (show toast or inline error)

5. Compose child components:
   - FavoriteBooksHeader (pass year filter props)
   - FavoriteBooksCarousel (pass books and loading)

6. Handle empty state:
   - Show message when no favorites
   - Different message for "no favorites this year" vs "no favorites ever"

**Deliverables:**
- [ ] FavoriteBooksSection component created
- [ ] Props interface defined
- [ ] State management working
- [ ] Data fetching on year change
- [ ] Child components composed
- [ ] Empty state handled
- [ ] Error handling implemented

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test initial render with initialFavorites
- [ ] Test year filter change
- [ ] Test loading state
- [ ] Test API call on year change
- [ ] Test empty state
- [ ] Test error state

---

### Task 3.6: ListCoverPreview Component
**File:** `/src/app/components/home/ListCoverPreview.tsx`
**Complexity:** Low
**Estimated Time:** 3 hours
**Dependencies:** None

**What to do:**
1. Create component
2. Add props:
   - `coverImages` (string[] - max 4 URLs)

3. Implement layout:
   - Grid of book covers (2x2 for 4, 1x3 for 3, etc.)
   - Responsive sizing
   - Fallback for missing images

4. Styling:
   - Small book covers
   - Gap between covers
   - Rounded corners
   - Zinc border

5. Handle edge cases:
   - 0 images: show empty state icon
   - 1 image: show single large cover
   - 2-3 images: show in row
   - 4 images: show in 2x2 grid

**Deliverables:**
- [ ] ListCoverPreview component created
- [ ] Props interface defined
- [ ] Layout responsive
- [ ] Grid layout for multiple images
- [ ] Fallback for missing images
- [ ] Edge cases handled

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test with 0 images
- [ ] Test with 1 image
- [ ] Test with 2-3 images
- [ ] Test with 4 images
- [ ] Test with missing images (404)

---

### Task 3.7: ListMetadata Component
**File:** `/src/app/components/home/ListMetadata.tsx`
**Complexity:** Low
**Estimated Time:** 2 hours
**Dependencies:** None

**What to do:**
1. Create component
2. Add props:
   - `title` (string)
   - `description` (string)
   - `bookCount` (number)

3. Implement layout:
   - Title (heading)
   - Description (paragraph, line-clamp 2 lines)
   - Book count (small text, "X books")

4. Styling:
   - Zinc color palette
   - Geist Sans font
   - Responsive sizing

**Deliverables:**
- [ ] ListMetadata component created
- [ ] Props interface defined
- [ ] Layout implemented
- [ ] Text truncation working

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test with long description (truncation)
- [ ] Test with various book counts

---

### Task 3.8: ReadingListCard Component
**File:** `/src/app/components/home/ReadingListCard.tsx`
**Complexity:** Medium
**Estimated Time:** 5 hours
**Dependencies:** Task 3.6, Task 3.7

**What to do:**
1. Create component
2. Add props:
   - `list` (ReadingList)
   - `viewMode` ('list' | 'covers')
   - `onClick` (function)

3. Implement layout:
   - List mode:
     - ListMetadata prominent (title, description, count)
     - ListCoverPreview smaller on side
   - Covers mode:
     - ListCoverPreview prominent (larger)
     - ListMetadata smaller below

4. Features:
   - Hover effect (scale, border color change)
   - Click navigates to `/reading-lists/[id]`
   - Keyboard navigation (Tab, Enter)
   - Focus indicator

5. Styling:
   - Card container with border
   - Responsive layout (different on mobile/desktop)
   - Zinc color palette
   - Smooth transitions

6. Accessibility:
   - `role="button"`
   - `tabIndex={0}`
   - `aria-label` with list title
   - Keyboard events (Enter/Space)

**Deliverables:**
- [ ] ReadingListCard component created
- [ ] Props interface defined
- [ ] List and covers modes implemented
- [ ] Hover effects working
- [ ] Click navigation working
- [ ] Keyboard accessible
- [ ] Responsive layout

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test list mode
- [ ] Test covers mode
- [ ] Test click navigation
- [ ] Test keyboard navigation
- [ ] Test hover effects

---

### Task 3.9: ReadingListGrid Component
**File:** `/src/app/components/home/ReadingListGrid.tsx`
**Complexity:** Low
**Estimated Time:** 3 hours
**Dependencies:** Task 3.8

**What to do:**
1. Create component
2. Add props:
   - `lists` (ReadingList[])
   - `viewMode` ('list' | 'covers')

3. Implement layout:
   - Responsive grid (1 col on mobile, 2-3 on desktop)
   - Gap between cards
   - Each list uses ReadingListCard

4. Styling:
   - Responsive columns
   - Consistent spacing
   - Zinc color palette

**Deliverables:**
- [ ] ReadingListGrid component created
- [ ] Props interface defined
- [ ] Grid layout responsive
- [ ] ReadingListCard integration

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test with multiple lists
- [ ] Test with single list
- [ ] Test responsive layout

---

### Task 3.10: EmptyReadingListsState Component
**File:** `/src/app/components/home/EmptyReadingListsState.tsx`
**Complexity:** Low
**Estimated Time:** 2 hours
**Dependencies:** Task 1.7 (EmptyState base)

**What to do:**
1. Create component using EmptyState base
2. Add props:
   - `isOwner` (boolean)

3. Implement content:
   - Icon: Bookmark (Lucide)
   - Owner title: "Create your first reading list"
   - Owner description: "Organize your books into curated lists"
   - Owner action: Button to create list
   - Guest title: "No reading lists yet"
   - Guest description: "Check back later"
   - Guest action: None

4. Handle create list action:
   - Pass onClick handler from parent
   - Opens create list modal

**Deliverables:**
- [ ] EmptyReadingListsState component created
- [ ] Props interface defined
- [ ] Owner vs guest content
- [ ] EmptyState integration
- [ ] Create action working

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test as owner
- [ ] Test as guest
- [ ] Test create action

---

### Task 3.11: ReadingListsHeader Component
**File:** `/src/app/components/home/ReadingListsHeader.tsx`
**Complexity:** Low
**Estimated Time:** 2 hours
**Dependencies:** None

**What to do:**
1. Create component
2. Add props:
   - `isOwner` (boolean)
   - `onCreateList` (function)

3. Implement layout:
   - Flex container (space-between)
   - Title: "Reading Lists" (left)
   - Create button (right, owner only)

4. Features:
   - Create button shows only for owner
   - Button triggers onCreateList handler

5. Styling:
   - Responsive layout
   - Zinc color palette
   - Button hover effects

**Deliverables:**
- [ ] ReadingListsHeader component created
- [ ] Props interface defined
- [ ] Layout responsive
- [ ] Owner-only button working

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test as owner (button visible)
- [ ] Test as guest (button hidden)
- [ ] Test create action

---

### Task 3.12: ReadingListsSection Component
**File:** `/src/app/components/home/ReadingListsSection.tsx`
**Complexity:** Medium
**Estimated Time:** 6 hours
**Dependencies:** Task 3.9, Task 3.10, Task 3.11

**What to do:**
1. Create component
2. Add props:
   - `initialLists` (ReadingList[])
   - `isOwner` (boolean)

3. Implement state management:
   - `lists` state (ReadingList[])
   - `viewMode` state ('list' | 'covers')
   - `isCreating` state (boolean)

4. Implement features:
   - Load view mode from localStorage
   - Save view mode to localStorage on change
   - Create list handler (opens modal)
   - Refresh lists after create

5. Compose child components:
   - ReadingListsHeader (pass isOwner, onCreateList)
   - ViewModeToggle (pass mode, onChange)
   - Conditional: EmptyReadingListsState or ReadingListGrid

6. Handle create modal:
   - Show modal when isCreating
   - Close modal after success
   - Refresh lists after create

**Deliverables:**
- [ ] ReadingListsSection component created
- [ ] Props interface defined
- [ ] State management working
- [ ] View mode persistence (localStorage)
- [ ] Child components composed
- [ ] Create modal integration
- [ ] Empty state handling

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test with lists
- [ ] Test empty state
- [ ] Test view mode toggle
- [ ] Test create modal flow
- [ ] Test localStorage persistence

---

### Task 3.13: HomeScreen Component
**File:** `/src/app/components/home/HomeScreen.tsx`
**Complexity:** Low
**Estimated Time:** 3 hours
**Dependencies:** Task 3.1, Task 3.5, Task 3.12

**What to do:**
1. Create component
2. Add props:
   - `profile` (UserProfile | null)
   - `initialFavorites` (FavoriteBook[])
   - `initialReadingLists` (ReadingList[])
   - `isOwner` (boolean)

3. Implement layout:
   - Container with vertical spacing
   - ProfileBio section
   - FavoriteBooksSection
   - ReadingListsSection

4. Styling:
   - Vertical spacing between sections
   - Responsive layout
   - Zinc color palette

**Deliverables:**
- [ ] HomeScreen component created
- [ ] Props interface defined
- [ ] Sections composed
- [ ] Layout responsive

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test with all sections
- [ ] Test as owner
- [ ] Test as guest

---

### Task 3.14: Home Page Integration
**File:** `/src/app/page.tsx`
**Complexity:** Medium
**Estimated Time:** 4 hours
**Dependencies:** Task 3.13, Phase 2 (API routes)

**What to do:**
1. Update page.tsx as Server Component
2. Implement data fetching:
   - Get current user from Clerk `auth()`
   - Fetch user profile (if authenticated)
   - Fetch favorite books (initial, all-time)
   - Fetch public reading lists
   - Determine isOwner (userId === profile?.clerkId)

3. Handle unauthenticated users:
   - profile = null
   - Still show public content

4. Pass data to HomeScreen component

5. Error handling:
   - Handle failed fetches
   - Show error boundary or fallback

6. SEO:
   - Add metadata (title, description)
   - OpenGraph tags

**Deliverables:**
- [ ] `/app/page.tsx` updated as Server Component
- [ ] Data fetching implemented
- [ ] Owner detection working
- [ ] HomeScreen integration
- [ ] Error handling implemented
- [ ] SEO metadata added

**Testing:**
- [ ] E2E tests for home page
- [ ] Test as authenticated user
- [ ] Test as guest
- [ ] Test with no favorites
- [ ] Test with no reading lists
- [ ] Test data fetching errors

---

## Phase 4: Reading List Detail (Week 3-4)

### Goal
Implement reading list detail page with book management and owner-only features.

---

### Task 4.1: DragHandle Component
**File:** `/src/app/reading-lists/components/DragHandle.tsx`
**Complexity:** Low
**Estimated Time:** 2 hours
**Dependencies:** None

**What to do:**
1. Create component
2. Add props:
   - `onDragStart` (function)
   - `onDragEnd` (function)

3. Implement features:
   - Visual drag handle (GripVertical icon from Lucide)
   - Cursor change on hover
   - Drag events (HTML5 drag and drop)

4. Styling:
   - Icon with hover effect
   - Cursor grab/grabbing
   - Zinc color palette

5. Accessibility:
   - Also support keyboard reordering (Alt+Up/Down)

**Deliverables:**
- [ ] DragHandle component created
- [ ] Props interface defined
- [ ] Drag events working
- [ ] Keyboard alternative implemented

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test drag events
- [ ] Test keyboard events

---

### Task 4.2: RemoveFromListButton Component
**File:** `/src/app/reading-lists/components/RemoveFromListButton.tsx`
**Complexity:** Low
**Estimated Time:** 2 hours
**Dependencies:** None

**What to do:**
1. Create component
2. Add props:
   - `onRemove` (function)
   - `bookTitle` (string - for confirmation)

3. Implement features:
   - Button with X icon or "Remove" text
   - Confirmation dialog before removal
   - Loading state during removal

4. Styling:
   - Icon button or text button
   - Hover effect (color change)
   - Zinc color palette

5. Accessibility:
   - aria-label describing action
   - Focus states
   - Keyboard activation

**Deliverables:**
- [ ] RemoveFromListButton component created
- [ ] Props interface defined
- [ ] Confirmation dialog implemented
- [ ] Loading state handled
- [ ] Fully accessible

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test confirmation dialog
- [ ] Test removal action
- [ ] Test loading state

---

### Task 4.3: BookListItem Component
**File:** `/src/app/reading-lists/components/BookListItem.tsx`
**Complexity:** Medium
**Estimated Time:** 6 hours
**Dependencies:** Task 4.1, Task 4.2

**What to do:**
1. Create component
2. Add props:
   - `book` (ReadingListBook)
   - `index` (number - position)
   - `isOwner` (boolean)
   - `onReorder` (function)
   - `onRemove` (function)

3. Implement layout:
   - Row layout (flex)
   - Position number (1, 2, 3...)
   - Book cover thumbnail (small)
   - Book metadata (title, author, pages, year)
   - DragHandle (owner only, left side)
   - RemoveFromListButton (owner only, right side)

4. Features:
   - Drag and drop (owner only)
   - Click book to view detail
   - Hover effect
   - Keyboard navigation

5. Styling:
   - Full width row
   - Border bottom (divider)
   - Hover background color change
   - Zinc color palette

6. Accessibility:
   - Keyboard dragging (Alt+Up/Down)
   - Focus states
   - ARIA labels

**Deliverables:**
- [ ] BookListItem component created
- [ ] Props interface defined
- [ ] Layout responsive
- [ ] Drag and drop working
- [ ] Owner-only elements conditional
- [ ] Click navigation working
- [ ] Fully accessible

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test as owner (drag handle visible)
- [ ] Test as guest (drag handle hidden)
- [ ] Test drag and drop
- [ ] Test remove action
- [ ] Test click navigation
- [ ] Test keyboard navigation

---

### Task 4.4: BookListView Component
**File:** `/src/app/reading-lists/components/BookListView.tsx`
**Complexity:** High
**Estimated Time:** 10 hours
**Dependencies:** Task 4.3

**What to do:**
1. Create component
2. Add props:
   - `books` (ReadingListBook[])
   - `listId` (string)
   - `isOwner` (boolean)

3. Implement state management:
   - `orderedBooks` state (local, for optimistic updates)

4. Implement drag-and-drop:
   - Use HTML5 drag and drop API or library like @dnd-kit
   - Handle dragStart, dragOver, drop events
   - Visual feedback during drag (placeholder)
   - Optimistic update (reorder locally)
   - Call API to persist order

5. Implement remove:
   - Call API to remove book
   - Optimistic update (remove locally)
   - Reorder remaining books

6. Implement keyboard reordering (owner only):
   - Alt+Up to move up
   - Alt+Down to move down
   - Update order in state and API

7. Error handling:
   - Rollback on API failure
   - Show error message (toast)

8. Styling:
   - List container
   - Dividers between items
   - Zinc color palette

**Deliverables:**
- [ ] BookListView component created
- [ ] Props interface defined
- [ ] Drag and drop fully working
- [ ] Optimistic updates implemented
- [ ] API integration for reorder
- [ ] API integration for remove
- [ ] Keyboard reordering working
- [ ] Error handling with rollback
- [ ] Fully accessible

**Testing:**
- [ ] Unit tests for rendering
- [ ] Integration tests for drag and drop
- [ ] Test optimistic updates
- [ ] Test API failure rollback
- [ ] Test remove action
- [ ] Test keyboard reordering
- [ ] Test as owner vs guest

---

### Task 4.5: BookGridView Component
**File:** `/src/app/reading-lists/components/BookGridView.tsx`
**Complexity:** Medium
**Estimated Time:** 5 hours
**Dependencies:** Task 1.3 (BookCoverCard), Task 4.2 (RemoveFromListButton)

**What to do:**
1. Create component
2. Add props:
   - `books` (ReadingListBook[])
   - `listId` (string)
   - `isOwner` (boolean)

3. Implement layout:
   - Responsive grid (2 cols on mobile, 4-5 on desktop)
   - Each book uses BookCoverCard
   - RemoveFromListButton overlay on hover (owner only)

4. Features:
   - Click book to view detail
   - Hover shows remove button (owner only)
   - Remove book (with confirmation)
   - Optimistic update

5. API integration:
   - Call API to remove book
   - Update local state

6. Error handling:
   - Rollback on failure
   - Show error message (toast)

7. Styling:
   - Responsive grid
   - Gap between cards
   - Zinc color palette

**Deliverables:**
- [ ] BookGridView component created
- [ ] Props interface defined
- [ ] Grid layout responsive
- [ ] BookCoverCard integration
- [ ] Remove button on hover (owner only)
- [ ] API integration for remove
- [ ] Optimistic updates
- [ ] Error handling

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test grid layout
- [ ] Test remove action
- [ ] Test as owner vs guest
- [ ] Test optimistic update
- [ ] Test API failure rollback

---

### Task 4.6: EmptyReadingListState Component
**File:** `/src/app/reading-lists/components/EmptyReadingListState.tsx`
**Complexity:** Low
**Estimated Time:** 2 hours
**Dependencies:** Task 1.7 (EmptyState base)

**What to do:**
1. Create component using EmptyState base
2. Add props:
   - `isOwner` (boolean)
   - `onAddBooks` (function)

3. Implement content:
   - Icon: BookOpen (Lucide)
   - Owner title: "No books in this list yet"
   - Owner description: "Add books to get started"
   - Owner action: Button to add books
   - Guest title: "This list is empty"
   - Guest description: "Check back later"
   - Guest action: None

**Deliverables:**
- [ ] EmptyReadingListState component created
- [ ] Props interface defined
- [ ] Owner vs guest content
- [ ] Add books action working

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test as owner
- [ ] Test as guest
- [ ] Test add books action

---

### Task 4.7: EditListButton Component
**File:** `/src/app/reading-lists/components/EditListButton.tsx`
**Complexity:** Low
**Estimated Time:** 1 hour
**Dependencies:** None

**What to do:**
1. Create component
2. Add props:
   - `onEdit` (function)

3. Implement features:
   - Button with edit icon or text
   - Click triggers onEdit handler

4. Styling:
   - Icon button or text button
   - Hover effect
   - Zinc color palette

**Deliverables:**
- [ ] EditListButton component created
- [ ] Props interface defined
- [ ] Click action working

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test click action

---

### Task 4.8: ReadingListHeader Component
**File:** `/src/app/reading-lists/components/ReadingListHeader.tsx`
**Complexity:** Low
**Estimated Time:** 4 hours
**Dependencies:** Task 1.4 (ViewModeToggle), Task 1.8 (BackButton), Task 4.7

**What to do:**
1. Create component
2. Add props:
   - `list` (ReadingList)
   - `viewMode` ('list' | 'covers')
   - `onViewModeChange` (function)
   - `onEdit` (function)
   - `onAddBooks` (function)
   - `isOwner` (boolean)

3. Implement layout:
   - BackButton (top left)
   - Title and description (center/left)
   - Controls (top right):
     - ViewModeToggle
     - EditListButton (owner only)
     - Add Books button (owner only)

4. Responsive:
   - Mobile: Stacked layout
   - Desktop: Horizontal layout

5. Styling:
   - Zinc color palette
   - Geist Sans font
   - Consistent spacing

**Deliverables:**
- [ ] ReadingListHeader component created
- [ ] Props interface defined
- [ ] Layout responsive
- [ ] All child components integrated
- [ ] Owner-only elements conditional

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test as owner (edit/add buttons visible)
- [ ] Test as guest (buttons hidden)
- [ ] Test responsive layout

---

### Task 4.9: BookSearch Component
**File:** `/src/app/reading-lists/components/BookSearch.tsx`
**Complexity:** Medium
**Estimated Time:** 5 hours
**Dependencies:** None

**What to do:**
1. Create component
2. Add props:
   - `query` (string)
   - `onQueryChange` (function)
   - `onSearch` (function)

3. Implement features:
   - Text input with search icon
   - Debounced search (300ms delay)
   - Clear button
   - Loading indicator

4. Reuse existing search patterns:
   - Similar to library search components
   - Autocomplete suggestions (optional)

5. Styling:
   - Full width input
   - Zinc color palette
   - Focus states

6. Accessibility:
   - Label for input
   - aria-live for results count

**Deliverables:**
- [ ] BookSearch component created
- [ ] Props interface defined
- [ ] Debounced search implemented
- [ ] Clear button working
- [ ] Fully accessible

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test search input
- [ ] Test debouncing
- [ ] Test clear button

---

### Task 4.10: SearchResults Component
**File:** `/src/app/reading-lists/components/SearchResults.tsx`
**Complexity:** Medium
**Estimated Time:** 5 hours
**Dependencies:** Task 1.3 (BookCoverCard)

**What to do:**
1. Create component
2. Add props:
   - `results` (BookType[])
   - `selectedBooks` (Set<number>)
   - `onToggleSelect` (function)
   - `isLoading` (boolean)

3. Implement layout:
   - Grid of books (BookCoverCard)
   - Checkbox on each book (selected state)
   - Click to toggle selection

4. Features:
   - Multi-select books
   - Visual indicator for selected (checkmark, border)
   - Loading state (skeletons)
   - Empty state (no results)

5. Styling:
   - Responsive grid
   - Selected state styling
   - Zinc color palette

6. Accessibility:
   - Checkbox labels
   - Keyboard selection (Space to toggle)

**Deliverables:**
- [ ] SearchResults component created
- [ ] Props interface defined
- [ ] Multi-select working
- [ ] Loading state handled
- [ ] Empty state handled
- [ ] Fully accessible

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test selection toggle
- [ ] Test multi-select
- [ ] Test loading state
- [ ] Test empty state

---

### Task 4.11: AddBooksModal Component
**File:** `/src/app/reading-lists/components/AddBooksModal.tsx`
**Complexity:** High
**Estimated Time:** 10 hours
**Dependencies:** Task 1.5 (Modal), Task 4.9, Task 4.10

**What to do:**
1. Create component
2. Add props:
   - `listId` (string)
   - `onClose` (function)

3. Implement state management:
   - `searchQuery` state
   - `searchResults` state (BookType[])
   - `selectedBooks` state (Set<number>)
   - `isSearching` state
   - `isAdding` state

4. Implement search:
   - Fetch books from library API
   - Filter out books already in list
   - Debounced search

5. Implement add books:
   - Call POST /api/reading-lists/[id]/books
   - Pass selected bookIds
   - Show loading state
   - Close modal on success
   - Handle errors

6. Compose child components:
   - Modal wrapper
   - BookSearch
   - SearchResults
   - Footer with "Add X Books" button

7. Features:
   - Search and select multiple books
   - Add button shows count
   - Disable add button if no selection
   - Loading states

8. Error handling:
   - Show error message on failure
   - Don't close modal on error

**Deliverables:**
- [ ] AddBooksModal component created
- [ ] Props interface defined
- [ ] Search working
- [ ] Multi-select working
- [ ] Add books API integration
- [ ] Loading states handled
- [ ] Error handling implemented
- [ ] Modal integration

**Testing:**
- [ ] Unit tests for rendering
- [ ] Integration tests for search
- [ ] Test adding books
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test modal close

---

### Task 4.12: EditListModal Component
**File:** `/src/app/reading-lists/components/EditListModal.tsx`
**Complexity:** Medium
**Estimated Time:** 6 hours
**Dependencies:** Task 1.5 (Modal)

**What to do:**
1. Create component
2. Add props:
   - `list` (ReadingList)
   - `onClose` (function)
   - `onSave` (function - callback to refresh list)

3. Implement state management:
   - `title` state (initialized from list.title)
   - `description` state (initialized from list.description)
   - `isPublic` state (initialized from list.isPublic)
   - `isSaving` state

4. Implement form:
   - Title input (required)
   - Description textarea (optional)
   - isPublic toggle (checkbox or switch)
   - Cancel button
   - Save button

5. Implement save:
   - Validate title (non-empty)
   - Call PATCH /api/reading-lists/[id]
   - Show loading state
   - Close modal on success
   - Call onSave callback
   - Handle errors

6. Keyboard shortcuts:
   - Escape to close
   - Enter to save (if not in textarea)

7. Styling:
   - Form layout
   - Input/textarea styling
   - Button styling
   - Zinc color palette

8. Accessibility:
   - Labels for inputs
   - Focus first input on open
   - Return focus on close

**Deliverables:**
- [ ] EditListModal component created
- [ ] Props interface defined
- [ ] Form working
- [ ] Validation implemented
- [ ] Save API integration
- [ ] Loading state handled
- [ ] Error handling implemented
- [ ] Keyboard shortcuts working
- [ ] Fully accessible

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test form inputs
- [ ] Test validation
- [ ] Test save action
- [ ] Test cancel action
- [ ] Test loading state
- [ ] Test error handling
- [ ] Test keyboard shortcuts

---

### Task 4.13: ReadingListDetail Component
**File:** `/src/app/reading-lists/components/ReadingListDetail.tsx`
**Complexity:** Medium
**Estimated Time:** 6 hours
**Dependencies:** Task 4.8, Task 4.4, Task 4.5, Task 4.6, Task 4.11, Task 4.12

**What to do:**
1. Create component
2. Add props:
   - `list` (ReadingList)
   - `books` (ReadingListBook[])
   - `isOwner` (boolean)

3. Implement state management:
   - `viewMode` state ('list' | 'covers')
   - `isEditing` state (boolean)
   - `isAddingBooks` state (boolean)
   - `localBooks` state (for optimistic updates)

4. Implement features:
   - Load view mode from localStorage
   - Save view mode to localStorage on change
   - Open edit modal
   - Open add books modal
   - Refresh books after actions

5. Compose child components:
   - ReadingListHeader (pass all props)
   - Conditional: EmptyReadingListState or BookListView/BookGridView
   - EditListModal (when isEditing)
   - AddBooksModal (when isAddingBooks)

6. Handle modals:
   - Open/close edit modal
   - Open/close add books modal
   - Refresh data after modal actions

**Deliverables:**
- [ ] ReadingListDetail component created
- [ ] Props interface defined
- [ ] State management working
- [ ] View mode persistence
- [ ] Child components composed
- [ ] Modals integrated
- [ ] Data refresh after actions

**Testing:**
- [ ] Unit tests for rendering
- [ ] Test view mode toggle
- [ ] Test edit modal flow
- [ ] Test add books modal flow
- [ ] Test empty state
- [ ] Test as owner vs guest

---

### Task 4.14: Reading List Detail Page Integration
**File:** `/src/app/reading-lists/[id]/page.tsx`
**Complexity:** Medium
**Estimated Time:** 4 hours
**Dependencies:** Task 4.13, Phase 2 (API routes)

**What to do:**
1. Create dynamic route page
2. Implement as Server Component:
   - Get current user from Clerk `auth()`
   - Parse id from params
   - Fetch reading list from API/database
   - Fetch books in list (ordered)
   - Determine isOwner (userId === list.ownerId)

3. Access control:
   - If list not found: return notFound()
   - If list private and not owner: return notFound()
   - Allow public lists for all users

4. Pass data to ReadingListDetail component

5. Error handling:
   - Handle failed fetches
   - Show error boundary

6. SEO:
   - Add metadata (title, description from list)
   - OpenGraph tags

**Deliverables:**
- [ ] `/app/reading-lists/[id]/page.tsx` created as Server Component
- [ ] Data fetching implemented
- [ ] Access control working
- [ ] Owner detection working
- [ ] ReadingListDetail integration
- [ ] Error handling implemented
- [ ] SEO metadata added

**Testing:**
- [ ] E2E tests for detail page
- [ ] Test as owner
- [ ] Test as guest (public list)
- [ ] Test as non-owner (private list, 404)
- [ ] Test non-existent list (404)

---

## Phase 5: Polish & Testing (Week 4-5)

### Goal
Refine all components, ensure accessibility, optimize performance, and complete comprehensive testing.

---

### Task 5.1: Responsive Testing
**Complexity:** Medium
**Estimated Time:** 8 hours
**Dependencies:** All previous phases

**What to do:**
1. Test all breakpoints:
   - Mobile (< 640px)
   - Tablet (640-1024px)
   - Desktop (> 1024px)

2. Test interactions:
   - Touch gestures (mobile)
   - Hover states (desktop)
   - Click targets (minimum 44x44px)

3. Test layouts:
   - Home screen sections
   - Reading list cards
   - Book displays
   - Modals

4. Fix issues:
   - Overlapping elements
   - Text overflow
   - Image sizing
   - Spacing inconsistencies

5. Browser testing:
   - Chrome
   - Firefox
   - Safari (desktop and iOS)
   - Edge

**Deliverables:**
- [ ] All breakpoints tested
- [ ] All interactions tested
- [ ] All browsers tested
- [ ] Issues documented and fixed

---

### Task 5.2: Accessibility Audit
**Complexity:** Medium
**Estimated Time:** 8 hours
**Dependencies:** All previous phases

**What to do:**
1. Keyboard navigation testing:
   - Tab through all interactive elements
   - Test dropdowns, modals, toggles
   - Test drag-and-drop keyboard alternative
   - Verify focus indicators visible

2. Screen reader testing:
   - VoiceOver (macOS/iOS)
   - NVDA (Windows)
   - Test all components
   - Verify announcements clear

3. ARIA audit:
   - Verify all ARIA labels present
   - Check roles and states
   - Test live regions
   - Use axe DevTools

4. Color contrast:
   - Test all text on backgrounds
   - Verify WCAG AA compliance
   - Test focus indicators

5. Fix issues:
   - Add missing labels
   - Fix incorrect roles
   - Improve announcements
   - Enhance focus indicators

**Deliverables:**
- [ ] Keyboard navigation fully working
- [ ] Screen reader testing complete
- [ ] ARIA attributes correct
- [ ] Color contrast verified
- [ ] Zero accessibility violations

---

### Task 5.3: Performance Optimization
**Complexity:** Medium
**Estimated Time:** 8 hours
**Dependencies:** All previous phases

**What to do:**
1. Image optimization:
   - Implement Next.js Image component
   - Add blur placeholders
   - Lazy load images below fold
   - Optimize image sizes

2. Bundle analysis:
   - Run next/bundle-analyzer
   - Identify large dependencies
   - Code split where possible
   - Remove unused imports

3. Loading states:
   - Improve skeleton loaders
   - Add loading indicators
   - Implement optimistic updates
   - Test perceived performance

4. Caching:
   - Implement client-side caching (consider SWR or TanStack Query)
   - Cache API responses
   - Invalidate on mutations

5. Measure performance:
   - Lighthouse scores
   - Core Web Vitals
   - Time to Interactive
   - First Contentful Paint

**Deliverables:**
- [ ] Images optimized
- [ ] Bundle size reduced
- [ ] Loading states improved
- [ ] Caching implemented
- [ ] Performance metrics meet targets

---

### Task 5.4: Unit Testing
**Complexity:** Medium
**Estimated Time:** 8 hours
**Dependencies:** All component tasks

**What to do:**
1. Test all components:
   - Rendering tests
   - Props validation
   - State management
   - Event handlers
   - Edge cases

2. Test utilities and hooks:
   - Custom hooks (if any)
   - Helper functions
   - Type guards

3. Aim for 85%+ coverage

4. Use React Testing Library

5. Mock dependencies:
   - API calls
   - Next.js router
   - Clerk auth

**Deliverables:**
- [ ] All components have unit tests
- [ ] Coverage 85%+
- [ ] Tests passing
- [ ] CI integration

---

### Task 5.5: Integration Testing
**Complexity:** Medium
**Estimated Time:** 8 hours
**Dependencies:** All component tasks

**What to do:**
1. Test user flows:
   - Create reading list
   - Add books to list
   - Reorder books
   - Remove books
   - Edit list details
   - Delete list

2. Test interactions:
   - Search and filter
   - View mode toggle
   - Modal flows
   - Navigation

3. Test authentication:
   - Owner vs guest experiences
   - Protected routes
   - API authorization

4. Use React Testing Library + MSW (Mock Service Worker)

**Deliverables:**
- [ ] All flows tested
- [ ] Interactions tested
- [ ] Authentication scenarios covered
- [ ] Tests passing

---

### Task 5.6: E2E Testing
**Complexity:** High
**Estimated Time:** 10 hours
**Dependencies:** All previous phases

**What to do:**
1. Set up Playwright

2. Write E2E tests:
   - Home screen navigation
   - View favorites (different years)
   - Browse reading lists
   - Create reading list (owner)
   - Add books to list (owner)
   - Reorder books (owner)
   - Remove books (owner)
   - Edit list details (owner)
   - Delete list (owner)
   - Guest experience (view only)

3. Test across browsers:
   - Chromium
   - Firefox
   - WebKit (Safari)

4. Test responsive:
   - Mobile viewport
   - Desktop viewport

5. CI integration:
   - Run on pull requests
   - Screenshot on failure

**Deliverables:**
- [ ] Playwright configured
- [ ] E2E tests written
- [ ] Tests passing in all browsers
- [ ] CI integration complete

---

### Task 5.7: Visual Regression Testing
**Complexity:** Low
**Estimated Time:** 4 hours
**Dependencies:** All component tasks

**What to do:**
1. Set up visual regression tool:
   - Playwright screenshots
   - Or Percy/Chromatic

2. Capture screenshots:
   - All components in Storybook
   - All pages in different states
   - Different viewports

3. Establish baseline

4. CI integration:
   - Compare on PRs
   - Flag visual changes

**Deliverables:**
- [ ] Visual regression tool set up
- [ ] Baseline screenshots captured
- [ ] CI integration complete

---

### Task 5.8: Component Documentation
**Complexity:** Low
**Estimated Time:** 4 hours
**Dependencies:** All component tasks

**What to do:**
1. Document all components:
   - Props interfaces
   - Usage examples
   - Edge cases
   - A11y notes

2. Create Storybook stories:
   - Default state
   - All variants
   - Loading state
   - Error state
   - Empty state

3. Add JSDoc comments:
   - Component descriptions
   - Prop descriptions
   - Examples

**Deliverables:**
- [ ] All components documented
- [ ] Storybook stories complete
- [ ] JSDoc comments added

---

## Summary of Phases

### Phase 1: Foundation (Week 1)
**Focus:** Infrastructure, shared components, database
**Time:** ~32 hours
**Key Tasks:** Types, database schema, shared UI components

### Phase 2: API Layer (Week 1-2)
**Focus:** Backend routes with auth/authz
**Time:** ~28 hours
**Key Tasks:** Favorites API, Reading Lists API, Books API

### Phase 3: Home Screen (Week 2-3)
**Focus:** Public-facing home screen
**Time:** ~44 hours
**Key Tasks:** Profile, favorites section, reading lists section

### Phase 4: Reading List Detail (Week 3-4)
**Focus:** Detailed view and management
**Time:** ~64 hours
**Key Tasks:** Book displays, drag-and-drop, modals, owner features

### Phase 5: Polish & Testing (Week 4-5)
**Focus:** Quality assurance and refinement
**Time:** ~56 hours
**Key Tasks:** Responsive, accessibility, performance, testing

**Total Estimated Time:** ~224 hours (5.6 weeks at 40 hours/week)

---

## Critical Path

1. Database Schema (Task 1.2) - **Required first**
2. Type Definitions (Task 1.1) - **Parallel with database**
3. API Routes (Phase 2) - **After database**
4. Shared UI Components (Phase 1) - **Parallel with API**
5. Home Screen Components (Phase 3) - **After API + Shared UI**
6. Reading List Detail (Phase 4) - **After Home Screen**
7. Polish & Testing (Phase 5) - **After all features**

---

## Risk Mitigation

### Technical Risks

**Drag-and-Drop Complexity:**
- **Risk:** HTML5 drag-and-drop can be complex and buggy
- **Mitigation:** Use proven library like @dnd-kit/core
- **Fallback:** Implement keyboard alternative (Alt+Up/Down)

**Performance with Many Books:**
- **Risk:** Rendering many book covers could be slow
- **Mitigation:** Implement virtual scrolling or pagination
- **Fallback:** Limit display, add "Load More" button

**Image Loading:**
- **Risk:** Slow image loading affects UX
- **Mitigation:** Use Next.js Image, blur placeholders, lazy loading
- **Fallback:** Show fallback icons immediately

**State Synchronization:**
- **Risk:** Optimistic updates can get out of sync with server
- **Mitigation:** Proper error handling and rollback
- **Fallback:** Refresh data from server on error

### Schedule Risks

**Scope Creep:**
- **Risk:** Feature requests during development
- **Mitigation:** Strict phase boundaries, "future enhancements" list
- **Fallback:** Move non-critical features to Phase 6

**Blocked on Dependencies:**
- **Risk:** Waiting for API routes before building UI
- **Mitigation:** Use mocked data for UI development
- **Fallback:** Build UI in isolation, integrate later

**Testing Takes Longer:**
- **Risk:** Phase 5 testing reveals major issues
- **Mitigation:** Write tests during development, not at end
- **Fallback:** Prioritize critical path testing

---

## Success Criteria

### Functional Requirements
- [ ] Home screen displays profile, favorites, and reading lists
- [ ] Favorites can be filtered by year
- [ ] Reading lists can be created (owner only)
- [ ] Books can be added to lists (owner only)
- [ ] Books can be reordered in lists (owner only)
- [ ] Books can be removed from lists (owner only)
- [ ] Lists can be edited (owner only)
- [ ] Lists can be deleted (owner only)
- [ ] Public lists visible to all users
- [ ] Private lists only visible to owner
- [ ] Responsive on mobile and desktop

### Technical Requirements
- [ ] All components TypeScript strict mode compliant
- [ ] 85%+ test coverage
- [ ] WCAG 2.1 Level AA accessible
- [ ] Lighthouse score > 90
- [ ] No console errors or warnings
- [ ] Zero accessibility violations (axe)

### User Experience Requirements
- [ ] Home screen loads in < 2s
- [ ] API responses < 500ms
- [ ] Smooth drag-and-drop interactions
- [ ] Clear owner vs guest experiences
- [ ] Helpful empty states
- [ ] Loading states for all async operations
- [ ] Error messages clear and actionable

---

## Future Enhancements (Not in Scope)

These features are considered but not included in the initial implementation:

1. **Collaborative Lists:** Share editing with other users
2. **Comments:** Add comments to reading lists
3. **Following:** Follow other users' public lists
4. **Categories/Tags:** Organize lists into categories
5. **FRIENDS Visibility:** Share lists with friends only
6. **UNLISTED Visibility:** Access via direct link only
7. **Analytics:** Most popular books in lists
8. **Export:** Download list as PDF or CSV
9. **Reading Progress:** Track progress through list books
10. **List Templates:** Create lists from templates
11. **Recommendations:** Suggest books for lists based on existing books
12. **Social Sharing:** Share lists on social media

---

## Conclusion

This implementation plan provides:

1. **Clear Task Breakdown:** Every component and feature as actionable task
2. **Time Estimates:** Realistic effort estimates for planning
3. **Dependencies:** Clear order of implementation
4. **Complexity Ratings:** Help prioritize and assign work
5. **Testing Strategy:** Comprehensive quality assurance
6. **Risk Management:** Identified risks with mitigation strategies

**Next Steps:**
1. Review and approve plan with stakeholders
2. Set up project management (GitHub Projects, Linear, etc.)
3. Create issues/tickets for each task
4. Assign tasks to developers
5. Begin Phase 1 implementation
6. Hold daily standups to track progress
7. Review completed phases before moving to next

**Questions or Clarifications:**
- Reach out to project lead or team lead
- Refer to COMPONENT_ARCHITECTURE.md for technical details
- Check existing patterns in codebase for consistency

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Author:** Frontend Developer (Penumbra)
**Status:** Ready for Implementation
