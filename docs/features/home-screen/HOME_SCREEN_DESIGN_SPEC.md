# Home Screen Design Specification

**Feature:** Home Screen (`/` route)
**Status:** Design Phase - Version 2.0
**Version:** 2.0
**Last Updated:** November 11, 2025
**Designer:** UX Designer Agent

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Layout Structure](#layout-structure)
4. [Component Specifications](#component-specifications)
5. [Visual Design System](#visual-design-system)
6. [Responsive Behavior](#responsive-behavior)
7. [Animation Strategy](#animation-strategy)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Data Requirements](#data-requirements)
10. [User Flows](#user-flows)
11. [Technical Implementation Notes](#technical-implementation-notes)

---

## Overview

### Purpose

The home screen serves as the public-facing entry point to Penumbra, showcasing:
- The owner's identity with custom profile picture and bio
- **Manually curated** favorite books (5-6 slots, editable by owner)
- Custom reading lists created by the owner

### Design Goals

1. **Dual-Mode Experience:** Clean public view for visitors, editable interface for owner
2. **Personal Connection:** Custom profile picture humanizes the library
3. **Manual Curation:** Owner has full control over favorite book selection
4. **Temporal Filtering:** Filter favorites by year read (requires readDate field)
5. **Portfolio Integration:** Match jonathanmooney.me aesthetic seamlessly
6. **Responsive:** Mobile-first approach with enhanced desktop layouts

### User Types

- **Public Visitors:** View owner's bio, filled favorite slots only, reading lists
- **Authenticated Owner:** See empty placeholders, "Add Favorite" UI, manage favorites, upload profile picture

---

## Design Principles

### Visual Hierarchy

1. **Hero First:** Profile with custom upload and bio anchor the experience
2. **Favorites Prominence:** Manual selection with visible empty slots (owner view)
3. **Lists Discovery:** Secondary content for deeper exploration
4. **Context-Aware UI:** Owner sees edit controls, public sees clean view

### Content Strategy

- **Owner Control:** Manual curation, not automatic
- **Empty State Design:** Empty placeholders invite interaction (owner only)
- **Badge System:** Favorited books show visual indicator in library
- **Temporal Context:** "of {year}" filters by read date

### Performance

- **Fast Load:** Prioritize above-the-fold content
- **Progressive Enhancement:** Load book covers asynchronously
- **Optimized Images:** Lazy loading for profile and book covers

---

## Layout Structure

### Section Hierarchy

```
┌────────────────────────────────────────┐
│ Header (fixed, backdrop blur)          │
├────────────────────────────────────────┤
│                                        │
│  Hero Section                          │
│  ┌──────────────────────────────────┐ │
│  │ Profile Picture (custom upload)   │ │
│  │ Upload Button (owner-only)        │ │
│  │ Bio Text                          │ │
│  └──────────────────────────────────┘ │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  Favorite Books Section                │
│  ┌──────────────────────────────────┐ │
│  │ Header + Year Dropdown            │ │
│  │ Favorite Slots (5-6 items)        │ │
│  │ - Empty placeholders (owner)      │ │
│  │ - Filled covers (owner + public)  │ │
│  └──────────────────────────────────┘ │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  Reading Lists Section                 │
│  ┌──────────────────────────────────┐ │
│  │ List 1: Title, Description, Cover │ │
│  │ List 2: Title, Description, Cover │ │
│  │ List 3: Title, Description, Cover │ │
│  └──────────────────────────────────┘ │
│                                        │
├────────────────────────────────────────┤
│ Footer                                 │
└────────────────────────────────────────┘
```

### Container Width

- **Mobile:** Full width minus padding (px-4)
- **Tablet/Desktop:** max-w-screen-sm (640px) centered
- **Consistency:** Match library page container width

### Vertical Spacing

- **Between Sections:** space-y-16 (4rem)
- **Within Sections:** space-y-6 to space-y-8
- **Top Padding:** pt-20 (5rem) - clears fixed header
- **Bottom Padding:** pb-12 (3rem) - breathing room before footer

---

## Component Specifications

### 1. Hero Section

**Purpose:** Establish personal connection with custom profile picture

#### Layout

```
┌─────────────────────────────────┐
│    [Profile Picture + Upload]   │  ← 120px x 120px, rounded-full
│                                 │     Upload button (owner-only)
│         Owner Name              │  ← text-2xl font-bold
│                                 │
│  Bio text goes here spanning   │  ← text-base text-zinc-400
│  up to 3-4 lines on mobile and │     max-w-prose
│  slightly wider on desktop.     │     leading-relaxed
│  Centered alignment.            │
│                                 │
└─────────────────────────────────┘
```

#### Profile Picture Specifications

**Display States:**

1. **No Image (Placeholder):**
   - Circle with User icon from lucide-react
   - Background: `bg-zinc-900`
   - Border: `ring-2 ring-zinc-800 ring-offset-4 ring-offset-zinc-950`
   - Icon: `text-zinc-600 w-12 h-12`

2. **Image Uploaded:**
   - Custom uploaded photo
   - Shape: `rounded-full`
   - Size: 120px x 120px (mobile), 160px x 160px (desktop)
   - Border: `ring-2 ring-zinc-800 ring-offset-4 ring-offset-zinc-950`
   - Object fit: `object-cover` (centered)

3. **Loading State:**
   - Skeleton circle with `animate-pulse`
   - Background: `bg-zinc-800`

**Upload UI (Owner-Only):**

```
┌─────────────────────┐
│   [Profile Pic]     │
│                     │
│  [Upload Photo]     │  ← Button appears on hover or always visible on mobile
└─────────────────────┘
```

**Upload Button Specifications:**
- Position: Below profile picture
- Typography: `text-sm font-medium`
- Style: `text-zinc-400 hover:text-zinc-100`
- Icon: Camera or Upload from lucide-react
- Transition: `transition-colors duration-200`
- Mobile: Always visible
- Desktop: Visible on hover over profile area

**Upload Flow:**
1. Click "Upload Photo" button
2. File picker opens (accept: image/jpeg, image/png, image/webp)
3. File size limit: 5MB
4. Optional: Crop/resize modal (square aspect ratio)
5. Upload to storage (S3, Cloudinary, or similar)
6. Update profile imageUrl in database
7. Display new image immediately

**Component Props:**
```typescript
interface HeroSectionProps {
  profileImageUrl?: string;
  ownerName: string;
  bio: string;
  isOwner: boolean; // Show upload button
  onUpload?: (file: File) => Promise<void>;
}
```

#### Bio Text Specifications

- **Typography:** text-base (16px) on mobile, text-lg (18px) on desktop
- **Color:** text-zinc-400 (neutral, readable)
- **Max Width:** max-w-prose (65ch) for optimal readability
- **Line Height:** leading-relaxed (1.625)
- **Alignment:** text-center
- **Max Length:** 200-300 characters (3-4 lines)

#### Spacing

- **Profile to Upload Button:** mb-2 (0.5rem)
- **Upload Button to Name:** mb-4 (1rem)
- **Name to Bio:** mb-3 (0.75rem)
- **Section Bottom Margin:** mb-16 (4rem)

---

### 2. Favorite Books Section

**Purpose:** Showcase manually curated favorite books (5-6 slots)

#### Key Design Change: Manual Selection

**Previous Design:** Favorites populated automatically based on logic
**New Design:** Owner manually selects favorites, sees empty placeholders

#### Header Component

```
┌─────────────────────────────────┐
│ Favorite Books     [of 2025 ▼] │
│                                 │
└─────────────────────────────────┘
```

**Layout:**
- Flexbox: `flex items-center justify-between mb-6`
- Header text: `text-xl font-semibold text-zinc-100`
- Dropdown: Custom component with chevron icon

#### Year Filter Dropdown

**Clarification:** "of {year}" means books **read** in that year, not published

**Data Requirement:** New `readDate` field on Book model (see Data Requirements)

**Dropdown Component:**
```typescript
interface FavoriteFilterDropdownProps {
  selectedOption: 'current_year' | 'all_time';
  currentYear: number;
  onSelect: (option: 'current_year' | 'all_time') => void;
}
```

**Options:**
1. "of {currentYear}" - Shows books read in current year
2. "of all time" - Shows all favorited books

**Behavior:**
- Filters displayed favorites by readDate
- Empty slots appear if < 6 favorites for selected year
- Owner can add favorites to fill empty slots

#### Favorite Slots Layout

**Owner View:**
```
┌──────┬──────┬──────┬──────┬──────┬──────┐
│ [1]  │ [+]  │ [3]  │ [+]  │ [+]  │ [6]  │
└──────┴──────┴──────┴──────┴──────┴──────┘
  Filled Empty  Filled Empty  Empty  Filled
```

**Public View:**
```
┌──────┬──────┬──────┐
│ [1]  │ [3]  │ [6]  │  ← Only filled slots visible
└──────┴──────┴──────┘
```

**Slot Count:** 5-6 slots (configurable by owner in future)

**Mobile Layout (< 768px):**
- Horizontal scroll container
- Scrollbar: Hidden but functional
- Snap: `scroll-snap-x-mandatory` with `snap-start` on items
- Gap: `gap-4` (1rem)

**Desktop Layout (≥ 768px):**
- Grid: `grid grid-cols-6 gap-4`
- Single row, max 6 slots

#### Empty Placeholder Specifications

**Purpose:** Invite owner to add a favorite book

**Visual Design:**

```
┌───────────────┐
│               │
│      ┌─┐      │
│      │+│      │  ← Plus icon
│      └─┘      │
│               │
│ Add Favorite  │  ← Text label
│               │
└───────────────┘
```

**Styling:**
- Container: `aspect-[2/3]` (portrait orientation)
- Border: `border-2 border-dashed border-zinc-700`
- Background: `bg-zinc-900/30`
- Rounded: `rounded-lg`
- Hover: `hover:border-zinc-600 hover:bg-zinc-900/50`
- Transition: `transition-all duration-200`
- Cursor: `cursor-pointer`

**Content:**
- Icon: Plus from lucide-react, `w-8 h-8 text-zinc-500`
- Text: "Add Favorite"
- Typography: `text-sm font-medium text-zinc-500`
- Layout: Centered vertically and horizontally

**Interaction:**
- Click → Opens "Add Favorite" modal
- Keyboard: Tab to focus, Enter/Space to activate
- Touch: Standard tap behavior

**Accessibility:**
- ARIA label: "Add favorite book to slot {position}"
- Role: button

#### Filled Slot Specifications

**Purpose:** Display selected favorite book cover

**Visual Design:**

```
┌───────────────┐
│               │
│  [Book Cover] │
│               │
│               │
└───────────────┘
     ↑
  Position badge
```

**Styling:**
- Container: `aspect-[2/3]`
- Border: `border border-zinc-800 rounded-lg`
- Hover (owner): `hover:border-zinc-700 hover:scale-105`
- Transition: `transition-all duration-200`
- Cursor: `cursor-pointer`

**Cover Image:**
- Fill container: `object-cover w-full h-full`
- Rounded: `rounded-lg`
- Loading: Skeleton with `animate-pulse`
- Error: Fallback with BookOpen icon

**Position Badge (Optional):**
- Display: Small number badge (1-6)
- Position: Top-left corner, absolute
- Background: `bg-zinc-950/90 backdrop-blur-sm`
- Size: `w-6 h-6 rounded-full`
- Typography: `text-xs font-semibold text-zinc-100`
- Purpose: Show slot order

**Owner Interactions:**
- Click → Opens "Edit Favorite" modal
- Options: Change Book, Remove Favorite

**Public Interactions:**
- Click → Opens book details modal (read-only)

**Component Props:**
```typescript
interface FavoriteSlotProps {
  position: number; // 1-6
  book?: {
    id: number;
    title: string;
    authors: string[];
    image?: string;
  };
  isOwner: boolean;
  onAdd?: () => void; // Empty slot clicked
  onChange?: (book: BookType) => void; // Filled slot clicked
}
```

---

### 3. Add Favorite Modal

**Purpose:** Allow owner to select a book from their library to favorite

**Trigger:** Click empty placeholder slot

#### Modal Layout

```
┌─────────────────────────────────────────┐
│  Add Favorite to Slot 2              [X]│
├─────────────────────────────────────────┤
│                                         │
│  [Search books in your library...]      │
│                                         │
│  ┌──────┬──────┬──────┬──────┐         │
│  │ [1]  │ [2]  │ [3]  │ [4]  │  ← Grid │
│  └──────┴──────┴──────┴──────┘         │
│  ┌──────┬──────┬──────┬──────┐         │
│  │ [5]  │ [6]⭐│ [7]  │ [8]  │  ← Badge│
│  └──────┴──────┴──────┴──────┘         │
│                                         │
│  [Pagination controls]                  │
│                                         │
└─────────────────────────────────────────┘
```

**Modal Specifications:**
- Width: `max-w-4xl` on desktop, full screen on mobile
- Height: `max-h-[80vh]` with scroll
- Background: `bg-zinc-950 border border-zinc-800 rounded-xl`
- Shadow: `shadow-2xl`
- Backdrop: `bg-zinc-950/80 backdrop-blur-sm`

**Header:**
- Title: "Add Favorite to Slot {position}"
- Close button: X icon, top-right
- Typography: `text-xl font-semibold text-zinc-100`

**Search Input:**
- Reuse library search component
- Placeholder: "Search books in your library..."
- Live filtering as user types

**Book Grid:**
- Layout: `grid grid-cols-2 md:grid-cols-4 gap-4`
- Display: Book covers from owner's library
- Badge: Books already favorited show ⭐ "Favorite" badge

**Book Card in Modal:**
- Cover image with hover effect
- Click → "Set as Favorite?" confirmation appears
- Badge overlay if already favorited (different slot)

**Favorite Badge Design:**

```
┌───────────────┐
│ ⭐ Favorite   │  ← Top-right corner badge
│  [Book Cover] │
│               │
│               │
└───────────────┘
```

**Badge Styling:**
- Position: Absolute, top-right, `top-2 right-2`
- Background: `bg-zinc-950/90 backdrop-blur-sm`
- Border: `border border-zinc-700 rounded-full`
- Padding: `px-2 py-1`
- Typography: `text-xs font-medium text-zinc-100`
- Icon: Star from lucide-react, `w-3 h-3`

**Confirmation State:**

When a book is clicked:
```
┌─────────────────────────────────┐
│  Set as Favorite?               │
│                                 │
│  [Book Cover + Title]           │
│                                 │
│  This will be added to slot 2   │
│                                 │
│  [Cancel]  [Confirm]            │
└─────────────────────────────────┘
```

**Component Props:**
```typescript
interface AddFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotPosition: number;
  onSelect: (book: BookType) => Promise<void>;
  currentFavorites: number[]; // Book IDs already favorited
  ownerBooks: BookType[]; // Owner's library
}
```

**Accessibility:**
- Focus trap: Tab cycles within modal
- ESC key: Close modal
- Click outside: Close modal (optional)
- ARIA: `role="dialog" aria-modal="true"`

---

### 4. Book Card Favorite Badge (Library View)

**Purpose:** Show that a book is favorited when browsing the library

**Context:** When viewing `/library`, favorited books display a badge

#### Badge Design

```
┌───────────────┐
│ ⭐ #2         │  ← Badge with position
│  [Book Cover] │
│               │
│  Book Title   │
└───────────────┘
```

**Badge Specifications:**
- Position: Absolute, top-right corner of book card
- Content: Star icon + position number (optional)
- Background: `bg-zinc-950/90 backdrop-blur-sm`
- Border: `border border-zinc-700 rounded-md`
- Padding: `px-2 py-1`
- Typography: `text-xs font-semibold text-zinc-100`
- Icon: Star from lucide-react, `w-3 h-3 text-yellow-500`

**Variants:**

1. **Simple Badge:** Just star icon
   ```
   ⭐
   ```

2. **Position Badge:** Star + number
   ```
   ⭐ #3
   ```

**Owner vs. Public:**
- Owner: Badge visible, clickable to edit
- Public: Badge visible, not interactive

**Interaction (Owner):**
- Click badge → Opens "Edit Favorite" modal
- Options: Change position, Remove from favorites

**Accessibility:**
- ARIA label: "Favorited, position {number}"

---

### 5. Edit Favorite Modal (Owner)

**Purpose:** Allow owner to change or remove a favorite

**Trigger:** Click filled favorite slot (owner-only)

#### Modal Layout

```
┌─────────────────────────────────────────┐
│  Edit Favorite - Slot 2              [X]│
├─────────────────────────────────────────┤
│                                         │
│     [Large Book Cover]                  │
│                                         │
│     Book Title                          │
│     by Author Name                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [Change Book]                   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  [Remove Favorite]               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancel]                               │
│                                         │
└─────────────────────────────────────────┘
```

**Modal Specifications:**
- Width: `max-w-md` centered
- Background: `bg-zinc-950 border border-zinc-800 rounded-xl`
- Shadow: `shadow-2xl`
- Padding: `p-6`

**Content:**
- Book cover: Large preview (200px width)
- Title and author: Centered below cover
- Action buttons: Full width, stacked

**Buttons:**

1. **Change Book:**
   - Opens "Add Favorite" modal
   - Replaces current book in slot

2. **Remove Favorite:**
   - Confirmation: "Are you sure?"
   - Removes book from slot
   - Slot becomes empty placeholder

3. **Cancel:**
   - Closes modal without changes

**Component Props:**
```typescript
interface EditFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: {
    position: number;
    book: BookType;
  };
  onChange: (newBook: BookType) => Promise<void>;
  onRemove: () => Promise<void>;
}
```

---

### 6. Reading Lists Section

**Purpose:** Display owner's curated reading lists with preview

*(No changes from v1.0 - see original spec for full details)*

#### Section Header

```
┌─────────────────────────────────┐
│ Reading Lists                   │  ← text-xl font-semibold
│                                 │
└─────────────────────────────────┘
```

#### Reading List Card

**Component:**
```typescript
interface ReadingListCardProps {
  list: {
    id: string;
    title: string;
    description?: string;
    books: Array<{
      id: number;
      title: string;
      image?: string;
    }>;
    bookCount: number;
  };
  onClick: () => void;
}
```

**Layout:** See v1.0 spec (no changes)

---

## Visual Design System

### Color Palette (Zinc-Based)

**Background Colors:**
- Primary background: `bg-zinc-950`
- Card backgrounds: `bg-zinc-900/50`
- Hover backgrounds: `hover:bg-zinc-800`
- Empty placeholder: `bg-zinc-900/30`

**Text Colors:**
- Primary: `text-zinc-100`
- Secondary: `text-zinc-400`
- Tertiary: `text-zinc-500`
- Muted: `text-zinc-600`

**Border Colors:**
- Solid: `border-zinc-800`
- Dashed (empty slots): `border-zinc-700`
- Hover: `hover:border-zinc-600`

**Accent Colors:**
- Favorite star: `text-yellow-500`
- Positive actions: `text-green-500` (optional)

### Typography Scale

*(Same as v1.0 - see original spec)*

### Spacing System

*(Same as v1.0 - see original spec)*

### Border Radius

- Small: `rounded` (0.25rem)
- Medium: `rounded-lg` (0.5rem)
- Large: `rounded-xl` (0.75rem)
- Full: `rounded-full` (circles, badges)

### Shadows

- Cards: `shadow-md`
- Hover: `shadow-lg`
- Modals: `shadow-2xl`

---

## Responsive Behavior

### Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 768px
- **Desktop:** ≥ 768px

### Favorite Slots Responsive Behavior

**Mobile (< 640px):**
- Horizontal scroll
- 5-6 slots visible (scroll to see all)
- Empty placeholders: Full visibility
- Tap to add/edit

**Desktop (≥ 768px):**
- Grid layout (6 columns)
- All slots visible at once
- Hover states on empty placeholders
- Click to add/edit

### Touch Targets

All interactive elements meet 44px × 44px minimum:
- Empty placeholders: Adequate size
- Filled slots: Entire card clickable
- Modal buttons: Minimum h-10 with padding

---

## Animation Strategy

### Philosophy

- **Subtle Motion:** Enhance without distracting
- **Spring Physics:** Natural, organic feel
- **Accessibility:** Respect `prefers-reduced-motion`

### Key Animations

**1. Empty Placeholder Hover:**
```css
.empty-placeholder {
  transition: border-color 200ms ease, background-color 200ms ease;
}
.empty-placeholder:hover {
  border-color: theme('colors.zinc.600');
  background-color: theme('colors.zinc.900/50');
}
```

**2. Modal Enter/Exit:**
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  {/* Modal content */}
</motion.div>
```

**3. Favorite Badge Appear:**
```typescript
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", stiffness: 200 }}
>
  {/* Badge */}
</motion.div>
```

**4. Slot Fill Animation:**
When a favorite is added, smooth transition from empty to filled:
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "spring", stiffness: 100, damping: 15 }}
>
  {/* Book cover */}
</motion.div>
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text: Minimum 4.5:1
- UI components: Minimum 3:1
- Empty placeholders: Border contrast meets standards

**Keyboard Navigation:**
- Tab order: Logical progression
- Empty placeholders: Tab-focusable, Enter/Space to activate
- Modals: Focus trap, ESC to close
- Dropdowns: Arrow keys, Enter to select

**Screen Reader Support:**

**Hero Section:**
```jsx
<section aria-label="Profile and bio">
  <div aria-label="Profile picture">
    <img alt={`${ownerName}'s profile picture`} />
    {isOwner && (
      <button aria-label="Upload new profile picture">
        Upload Photo
      </button>
    )}
  </div>
</section>
```

**Favorite Books:**
```jsx
<section aria-label="Favorite books">
  <h2>Favorite Books</h2>
  <div role="group" aria-label="Favorite book slots">
    {/* Empty slot */}
    <button
      aria-label={`Add favorite book to slot ${position}`}
      role="button"
    >
      Add Favorite
    </button>

    {/* Filled slot */}
    <button
      aria-label={`${book.title} by ${book.authors.join(', ')}, favorited in position ${position}`}
    >
      <img alt={`Cover of ${book.title}`} />
    </button>
  </div>
</section>
```

**Modals:**
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Add Favorite to Slot 2</h2>
  {/* Modal content */}
</div>
```

**ARIA Attributes:**
- `aria-label` on all interactive elements
- `aria-modal="true"` on modals
- `aria-expanded` on dropdowns
- `role="dialog"` on modals

**Focus Management:**
- Modal open: Focus first interactive element
- Modal close: Return focus to trigger element
- Tab trap within modals

---

## Data Requirements

### New Database Schema Requirements

#### Profile Picture Storage

**User Model Extension:**
```prisma
model User {
  id              Int     @id @default(autoincrement())
  clerkId         String  @unique
  email           String  @unique
  name            String?
  profileImageUrl String? // NEW: Custom profile picture URL
  bio             String? // NEW: Owner bio text
  books           Book[]
  favorites       Favorite[] // NEW: One-to-many
}
```

#### Read Date Field

**Book Model Extension:**
```prisma
model Book {
  id            Int            @id @default(autoincrement())
  owner         User           @relation(fields: [ownerId], references: [id])
  ownerId       Int
  isbn10        String         @unique @db.VarChar(10)
  isbn13        String         @unique @db.VarChar(13)
  title         String
  titleLong     String
  language      String
  synopsis      String
  image         String
  imageOriginal String
  publisher     String
  edition       String?
  pageCount     Int
  datePublished String
  readDate      DateTime?      // NEW: When the owner read this book
  subjects      String[]
  authors       String[]
  binding       String
  visibility    BookVisibility @default(PUBLIC)
  favoriteSlot  Favorite?      // NEW: One-to-one
}
```

#### Favorites Junction Model

**New Model:**
```prisma
model Favorite {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  bookId    Int      @unique // Each book can only be favorited once
  book      Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  position  Int      // 1-6, slot position
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, position]) // Each user can have only one favorite per position
  @@index([userId])
}
```

**Migration Notes:**
- `readDate` is nullable (existing books won't have it)
- `profileImageUrl` is nullable (default to placeholder)
- `Favorite` model enables manual curation with positions

### API Endpoints Needed

**1. Profile Data**

```
GET /api/profile
```

**Response:**
```typescript
{
  ownerName: string;
  bio?: string;
  profileImageUrl?: string;
}
```

**2. Upload Profile Picture (Owner)**

```
POST /api/profile/upload
Content-Type: multipart/form-data

{
  image: File
}
```

**Response:**
```typescript
{
  profileImageUrl: string;
}
```

**3. Favorite Books Data**

```
GET /api/favorites?year={year} | all_time
```

**Response:**
```typescript
{
  favorites: Array<{
    position: number; // 1-6
    book: {
      id: number;
      title: string;
      authors: string[];
      image?: string;
      readDate?: string;
    };
  }>;
  year?: number;
}
```

**Example:**
```json
{
  "favorites": [
    {
      "position": 1,
      "book": {
        "id": 123,
        "title": "The Name of the Wind",
        "authors": ["Patrick Rothfuss"],
        "image": "https://...",
        "readDate": "2025-03-15T00:00:00Z"
      }
    }
  ],
  "year": 2025
}
```

**4. Add Favorite (Owner)**

```
POST /api/favorites
Content-Type: application/json

{
  bookId: number;
  position: number; // 1-6
}
```

**Response:**
```typescript
{
  favorite: {
    id: number;
    position: number;
    book: BookType;
  };
}
```

**5. Remove Favorite (Owner)**

```
DELETE /api/favorites/{bookId}
```

**Response:**
```typescript
{
  success: boolean;
}
```

**6. Update Favorite Position (Owner)**

```
PATCH /api/favorites/{bookId}
Content-Type: application/json

{
  position: number; // New position 1-6
}
```

**7. Owner's Books (for modal)**

```
GET /api/books/owned?search={query}
```

**Response:**
```typescript
{
  books: Array<{
    id: number;
    title: string;
    authors: string[];
    image?: string;
    isFavorited: boolean; // NEW: Indicates if already favorited
    favoritePosition?: number; // If favorited, which slot
  }>;
}
```

### File Storage Integration

**Profile Picture Upload:**
- Service: AWS S3, Cloudinary, or Vercel Blob
- File types: JPEG, PNG, WebP
- Max size: 5MB
- Optimization: Resize to 320px × 320px (2x for retina)
- Format: Convert to WebP for performance

**Storage Structure:**
```
/users/{userId}/profile-picture.webp
```

### Caching Strategy

**Profile Data:**
- Cache: 1 hour
- Revalidate: On owner sign-in, after upload

**Favorites:**
- Cache: 1 minute (frequently updated)
- Revalidate: After add/remove/reorder

**Owner Books (Modal):**
- Cache: 5 minutes
- Revalidate: On-demand

---

## User Flows

### 1. Owner Uploads Profile Picture

**Entry:** Owner visits home page

**Steps:**
1. Owner sees profile section with current image or placeholder
2. Hover reveals "Upload Photo" button (or always visible on mobile)
3. Click "Upload Photo"
4. File picker opens (image/jpeg, image/png, image/webp)
5. Owner selects image file
6. Optional: Crop/resize modal appears
7. Confirm crop
8. Upload begins (loading indicator on profile picture)
9. Upload completes, new image displays
10. Success message (toast): "Profile picture updated"

**Error Handling:**
- File too large: "Image must be under 5MB"
- Invalid format: "Please upload JPG, PNG, or WebP"
- Upload failed: "Upload failed. Please try again."

**Exit:** New profile picture visible

---

### 2. Owner Sets Favorite Book

**Entry:** Owner visits home page, sees empty favorite slot

**Steps:**
1. Click empty placeholder slot (e.g., Slot 2)
2. "Add Favorite" modal opens
3. Owner's library loads in modal grid
4. Owner searches for book (optional)
5. Owner clicks desired book cover
6. Confirmation appears: "Set as Favorite?"
7. Preview shows: Book cover + "This will be added to slot 2"
8. Owner clicks "Confirm"
9. Modal closes
10. Slot 2 fills with book cover (smooth animation)
11. Badge appears on that book in library view
12. Success message: "Added to favorites"

**Edge Cases:**
- Book already favorited (different slot): Show current position in badge
- No books in library: Empty state: "Add books to your library first"
- All slots filled: Must remove a favorite first

**Exit:** Favorite slot filled, badge visible in library

---

### 3. Owner Changes Favorite

**Entry:** Owner clicks filled favorite slot

**Steps:**
1. Click filled slot (e.g., Slot 3 with "The Name of the Wind")
2. "Edit Favorite" modal opens
3. Shows: Large book cover, title, author
4. Two buttons: "Change Book" and "Remove Favorite"
5. Owner clicks "Change Book"
6. "Add Favorite" modal opens (same as Flow 2)
7. Owner selects different book
8. Confirmation: "Replace favorite in slot 3?"
9. Owner confirms
10. Slot 3 updates with new book (smooth transition)
11. Old book loses badge, new book gains badge
12. Success message: "Favorite updated"

**Alternative Path (Remove):**
- Step 4: Owner clicks "Remove Favorite"
- Confirmation: "Remove from favorites?"
- Owner confirms
- Slot 3 becomes empty placeholder
- Badge removed from book in library
- Success message: "Removed from favorites"

**Exit:** Favorite changed or removed

---

### 4. Owner Toggles Year Filter

**Entry:** Owner viewing favorites section

**Steps:**
1. Current filter: "of 2025" (shows 4 books read in 2025)
2. Owner clicks dropdown
3. Options appear: "of 2025" (current), "of all time"
4. Owner selects "of all time"
5. Favorites update to show all 6 favorited books
6. Empty slots disappear (all slots filled)
7. Dropdown updates to "of all time"

**Reverse Flow:**
1. Current filter: "of all time" (6 books)
2. Owner selects "of 2024"
3. Favorites filter to books read in 2024 (e.g., 2 books)
4. 4 empty slots appear
5. Owner can fill empty slots with books from 2024

**Data Requirement:**
- Books must have `readDate` set
- Filter: `readDate >= '2025-01-01' AND readDate < '2026-01-01'`

**Exit:** Filtered favorites displayed

---

### 5. Public Visitor Views Favorites

**Entry:** Public visitor navigates to `/`

**Steps:**
1. Page loads with hero section
2. Scroll to favorites section
3. See "Favorite Books" header with "of 2025" dropdown
4. See 4 filled slots (no empty placeholders)
5. Click book cover
6. Book details modal opens (read-only)
7. View book info
8. Close modal
9. Continue browsing

**No Edit UI:**
- No "Upload Photo" button
- No empty placeholders
- No "Add Favorite" modals
- No badges clickable

**Exit:** Browse library or reading lists

---

### 6. Owner Sets Read Date (New Flow)

**Context:** When adding/editing a book, owner sets when they read it

**Entry:** Owner viewing book details

**Steps:**
1. Open book details modal
2. See "Read Date" field (new)
3. Click date picker
4. Select date (e.g., "March 15, 2025")
5. Save book
6. Book now filterable in favorites by year

**Integration:**
- Add to "Add Book" flow
- Add to "Edit Book" flow
- Optional field (nullable)

**Exit:** Read date saved

---

## Technical Implementation Notes

### Component Structure

```
src/app/page.tsx (Home page route)
├── components/home/
│   ├── HeroSection.tsx
│   │   ├── ProfileImage.tsx
│   │   └── ProfileUpload.tsx (owner-only)
│   ├── FavoriteBooksSection.tsx
│   │   ├── FavoriteFilterDropdown.tsx
│   │   ├── FavoriteSlot.tsx
│   │   ├── EmptyPlaceholder.tsx
│   │   └── FilledSlot.tsx
│   ├── AddFavoriteModal.tsx
│   │   ├── BookSearchInput.tsx
│   │   └── BookGrid.tsx
│   ├── EditFavoriteModal.tsx
│   ├── FavoriteBadge.tsx (for library view)
│   └── ReadingListsSection.tsx (no changes)
```

### State Management

**Local State:**
```typescript
// In page.tsx or parent component
const [favoriteFilter, setFavoriteFilter] = useState<'current_year' | 'all_time'>('current_year');
const [selectedSlot, setSelectedSlot] = useState<number | undefined>();
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
```

**Server Actions (Next.js 15):**
```typescript
// app/actions/favorites.ts
export async function addFavorite(bookId: number, position: number) { ... }
export async function removeFavorite(bookId: number) { ... }
export async function updateFavoritePosition(bookId: number, newPosition: number) { ... }

// app/actions/profile.ts
export async function uploadProfilePicture(formData: FormData) { ... }
```

### File Upload Implementation

**Client-Side:**
```typescript
const handleUpload = async (file: File) => {
  setIsUploadingPhoto(true);

  const formData = new FormData();
  formData.append('image', file);

  try {
    const result = await uploadProfilePicture(formData);
    // Update UI with new image URL
    toast.success('Profile picture updated');
  } catch (error) {
    toast.error('Upload failed. Please try again.');
  } finally {
    setIsUploadingPhoto(false);
  }
};
```

**Server-Side (app/api/profile/upload/route.ts):**
```typescript
export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get('image') as File;

  // Validate file
  if (!image || image.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }

  // Upload to storage (S3, Cloudinary, etc.)
  const imageUrl = await uploadToStorage(image);

  // Update user profile in database
  await db.user.update({
    where: { clerkId: userId },
    data: { profileImageUrl: imageUrl }
  });

  return NextResponse.json({ profileImageUrl: imageUrl });
}
```

### Performance Optimizations

**Image Loading:**
- Profile picture: `priority` prop on Next.js Image
- Favorite covers: Lazy load with `loading="lazy"`
- Modal images: Dynamic import

**Data Fetching:**
- Parallel fetches: Profile + Favorites + Lists
- Optimistic updates: Add/remove favorites instantly
- SWR/React Query: Real-time updates

**Code Splitting:**
- Modals: Dynamic imports
- Upload component: Lazy load

### Accessibility Testing Checklist

- [ ] Keyboard: Tab through all slots, modals
- [ ] Focus trap: Modals contain focus
- [ ] Screen reader: All labels announce correctly
- [ ] Color contrast: Empty placeholders meet 3:1 ratio
- [ ] Touch targets: All elements 44x44px minimum
- [ ] Reduced motion: Respect user preference
- [ ] ARIA: All attributes correct
- [ ] Alt text: Profile picture, book covers

### Owner vs. Public View Logic

```typescript
const isOwner = session?.user?.id === ownerId;

// Conditional rendering
{isOwner && <ProfileUpload onUpload={handleUpload} />}
{isOwner && emptySlots.map(slot => <EmptyPlaceholder slot={slot} />)}
{!isOwner && filledSlots.map(slot => <FilledSlot slot={slot} readOnly />)}
```

### Error Handling

**Profile Picture Upload:**
- File too large → Toast error
- Invalid format → Toast error
- Network error → Retry button

**Favorites:**
- Failed to load → Empty state with retry
- Failed to add → Toast error, revert UI
- Duplicate position → Confirm replace

**Read Date:**
- Invalid date → Validation error
- Future date → Allow (for planning)

---

## Open Questions & Design Decisions

### Resolved in v2.0

1. **Profile Picture Source:** Custom upload (not portfolio)
2. **Favorites Logic:** Manual selection (not automatic)
3. **Year Filter:** Based on read date (not published date)
4. **Empty Slots:** Visible to owner only (public sees filled only)
5. **Slot Count:** 5-6 slots (fixed for now, configurable later)

### Future Enhancements (Phase 2)

1. **Reordering:** Drag-and-drop to reorder favorites
2. **Collections:** Multiple favorite collections (Top 6 of 2025, All-Time Favorites, etc.)
3. **Position Badges:** Show on home page (not just in library)
4. **Read Date Bulk Import:** Import read dates from Goodreads CSV
5. **Profile Cover Photo:** Banner image behind profile picture
6. **Bio Editing:** Inline editing for owner

### Design Validation Needed

- [ ] Empty placeholder design feels inviting?
- [ ] Badge design on library cards not too intrusive?
- [ ] Modal flows are intuitive?
- [ ] Year filter placement makes sense?
- [ ] Profile upload button discoverable?

---

## Appendix

### Component Props Reference

```typescript
// Hero Section
interface HeroSectionProps {
  profileImageUrl?: string;
  ownerName: string;
  bio?: string;
  isOwner: boolean;
  onUploadPhoto?: (file: File) => Promise<void>;
}

// Favorite Slot
interface FavoriteSlotProps {
  position: number;
  book?: BookType;
  isOwner: boolean;
  onAddClick?: () => void;
  onEditClick?: () => void;
}

// Empty Placeholder
interface EmptyPlaceholderProps {
  position: number;
  onClick: () => void;
}

// Filled Slot
interface FilledSlotProps {
  position: number;
  book: BookType;
  isOwner: boolean;
  onClick: () => void;
}

// Add Favorite Modal
interface AddFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotPosition: number;
  onSelectBook: (book: BookType) => Promise<void>;
  currentFavorites: BookType[];
  ownerBooks: BookType[];
}

// Edit Favorite Modal
interface EditFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorite: {
    position: number;
    book: BookType;
  };
  onChangeBook: () => void;
  onRemove: () => Promise<void>;
}

// Favorite Badge (Library View)
interface FavoriteBadgeProps {
  position: number;
  isOwner: boolean;
  onClick?: () => void;
}

// Book Type (Extended)
interface BookType {
  id: number;
  title: string;
  titleLong: string;
  authors: string[];
  image?: string;
  imageOriginal?: string;
  publisher: string;
  datePublished: string;
  readDate?: string; // NEW
  pageCount: number;
  synopsis: string;
  subjects: string[];
  binding: string;
  visibility: BookVisibility;
  isFavorited?: boolean; // NEW: For modal display
  favoritePosition?: number; // NEW: 1-6
}
```

### Migration Guide (v1.0 → v2.0)

**Database Migrations:**
```sql
-- Add profile picture to User
ALTER TABLE "User" ADD COLUMN "profileImageUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "bio" TEXT;

-- Add read date to Book
ALTER TABLE "Book" ADD COLUMN "readDate" TIMESTAMP;

-- Create Favorite model
CREATE TABLE "Favorite" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "bookId" INTEGER NOT NULL REFERENCES "Book"("id") ON DELETE CASCADE,
  "position" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Favorite_bookId_key" UNIQUE ("bookId"),
  CONSTRAINT "Favorite_userId_position_key" UNIQUE ("userId", "position")
);

CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");
```

**API Changes:**
- Add `POST /api/profile/upload`
- Add `POST /api/favorites`
- Add `DELETE /api/favorites/{bookId}`
- Add `PATCH /api/favorites/{bookId}`
- Update `GET /api/favorites` to filter by year
- Update `GET /api/books/owned` to include `isFavorited`

**Component Changes:**
- Add `ProfileUpload.tsx`
- Add `EmptyPlaceholder.tsx`
- Add `AddFavoriteModal.tsx`
- Add `EditFavoriteModal.tsx`
- Add `FavoriteBadge.tsx`
- Update `FavoriteSlot.tsx` (new logic)
- Update `FavoriteFilterDropdown.tsx` (filter by readDate)

---

**End of Design Specification v2.0**

**Summary of Changes:**
1. Profile picture: Custom upload (not portfolio)
2. Favorites: Manual selection with empty placeholders
3. Year filter: Based on read date (requires new field)
4. Owner vs. Public: Different UI states
5. Badge system: Show favorited books in library
6. New modals: Add/Edit favorite workflows

**Next Steps:**
1. Review v2.0 specification with stakeholders
2. Implement database migrations (User, Book, Favorite models)
3. Build file upload infrastructure (S3/Cloudinary)
4. Implement component tree (Hero → Favorites → Modals)
5. Test owner vs. public views
6. Accessibility audit
7. User testing with mock data
