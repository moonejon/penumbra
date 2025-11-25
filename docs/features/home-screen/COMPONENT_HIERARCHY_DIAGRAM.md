# Component Hierarchy Diagram - Updated Architecture

## Home Screen Component Tree

```
/app/page.tsx (Server Component)
└── HomeScreen (Client)
    ├── ProfileSection (Client) ← UPDATED
    │   └── ProfileImageUpload (Client) ← NEW
    │       ├── Avatar/Image Display
    │       ├── Upload Button (owner-only)
    │       ├── File Input (hidden)
    │       ├── Preview Modal
    │       └── Progress Indicator
    │
    ├── FavoriteBooksSection (Client) ← UPDATED
    │   ├── FavoriteBooksHeader (Client)
    │   │   ├── Title: "Favorite Books"
    │   │   └── YearFilterDropdown (Client)
    │   │       └── Dropdown (Shared)
    │   │
    │   ├── FavoriteBookGrid (Client) ← RENAMED from FavoriteBooksCarousel
    │   │   │
    │   │   ├── [Owner View - 6 slots always]
    │   │   │   ├── FavoriteBookCard (position 1) ← NEW
    │   │   │   ├── FavoritePlaceholder (position 2) ← NEW
    │   │   │   ├── FavoriteBookCard (position 3)
    │   │   │   ├── FavoritePlaceholder (position 4)
    │   │   │   ├── FavoritePlaceholder (position 5)
    │   │   │   └── FavoriteBookCard (position 6)
    │   │   │
    │   │   └── [Public View - filtered slots only]
    │   │       ├── FavoriteBookCard (position 1)
    │   │       ├── FavoriteBookCard (position 3)
    │   │       └── FavoriteBookCard (position 6)
    │   │
    │   └── FavoriteSelectionModal (Client, conditionally rendered) ← NEW
    │       ├── Modal (Shared)
    │       ├── Header (Title + Close)
    │       ├── AutocompleteSearch (Reused from /library)
    │       ├── GridView (Reused from /library)
    │       │   └── GridItem (Reused)
    │       │       └── FavoriteBadge (Shared) ← NEW
    │       └── Footer (Confirm/Cancel buttons)
    │
    └── ReadingListsSection (Client)
        ├── ReadingListsHeader (Client)
        ├── ViewModeToggle (Shared)
        └── ReadingListGrid (Client)
            └── ReadingListCard (Client)
                ├── ListCoverPreview
                └── ListMetadata
```

---

## New Component: FavoriteBookCard Detail

```
FavoriteBookCard (Client)
├── Container (aspect ratio 2:3)
│   ├── Book Image (Next.js Image)
│   ├── Position Badge (top-left)
│   │   └── Circle with number 1-6
│   │
│   ├── [Owner View]
│   │   └── Hover Overlay
│   │       ├── Semi-transparent background
│   │       ├── "Change" text
│   │       └── Click → Context Menu
│   │           ├── "Choose Different Book"
│   │           ├── "Remove from Favorites"
│   │           ├── "View Details"
│   │           └── "Cancel"
│   │
│   └── [Public View]
│       └── Hover Overlay
│           ├── Book Title
│           ├── Author
│           └── Click → Navigate to book detail
│
└── Loading State (skeleton)
```

---

## New Component: FavoritePlaceholder Detail

```
FavoritePlaceholder (Client)
├── Container (aspect ratio 2:3)
│   ├── Dashed Border (zinc-400)
│   ├── Background (transparent → zinc-900/30 on hover)
│   ├── Content (centered)
│   │   ├── Plus Icon (32px, zinc-500)
│   │   └── "Add Favorite" text (text-sm, zinc-500)
│   │
│   └── Position Indicator (bottom-right, subtle)
│       └── Small number (1-6)
│
└── Interactions
    ├── Click → Opens FavoriteSelectionModal at position
    ├── Hover → Border darkens, background appears
    └── Keyboard → Tab to focus, Enter/Space to activate
```

---

## New Component: FavoriteSelectionModal Detail

```
FavoriteSelectionModal (Client)
├── Modal (Shared base component)
│   ├── Backdrop (zinc-900/95, blur)
│   └── Card (zinc-800, rounded-xl, 80vw mobile, 60vw desktop)
│
├── Header
│   ├── Title: "Select Favorite Book (Position X)"
│   ├── Subtitle: "for 2024" (if year filter active)
│   └── Close Button (X icon)
│
├── Body (scrollable)
│   ├── Search Bar (full width)
│   │   └── AutocompleteSearch (reused from /library)
│   │       ├── Text Input
│   │       ├── Search Icon
│   │       └── Loading Spinner (when searching)
│   │
│   └── Results Area
│       ├── GridView (reused from /library)
│       │   └── GridItem (for each book)
│       │       ├── Book Cover
│       │       ├── Book Info
│       │       ├── Already Favorite indicator (if in another slot)
│       │       └── Click → Show confirmation
│       │
│       ├── Empty State (no results)
│       └── Loading State (skeletons)
│
├── Confirmation Dialog (conditionally rendered)
│   ├── "Set as Favorite #X?"
│   ├── Book Preview (title, author, cover thumbnail)
│   ├── Confirm Button
│   └── Cancel Button
│
└── Footer (sticky bottom, when book selected)
    ├── Selected Book Info (thumbnail + title)
    ├── Cancel Button
    └── Confirm Button (disabled when saving)
```

---

## New Component: ProfileImageUpload Detail

```
ProfileImageUpload (Client)
├── Avatar Display
│   ├── Current Image (if exists)
│   │   └── Next.js Image (circular, 120px mobile, 150px desktop)
│   │
│   ├── Placeholder (if no image)
│   │   ├── Circle with user initials
│   │   └── Background color based on name hash
│   │
│   └── [Owner View Only]
│       └── Hover Overlay (zinc-900/70)
│           ├── Camera Icon (white)
│           └── "Upload Photo" text
│
├── File Input (hidden)
│   └── accept="image/jpeg,image/png,image/webp,image/gif"
│
├── Upload Flow States
│   ├── Preview Modal (after file selected)
│   │   ├── Preview Image
│   │   ├── "Use this photo?" text
│   │   ├── Confirm Button
│   │   └── Cancel Button
│   │
│   ├── Uploading State
│   │   ├── Progress Ring (0-100%)
│   │   ├── Percentage text
│   │   └── "Uploading..." text
│   │
│   ├── Success State (brief)
│   │   ├── Check icon
│   │   └── Fade to new image
│   │
│   └── Error State
│       ├── Error icon
│       ├── Error message
│       └── Retry button
│
└── Interactions
    ├── Owner Click → Opens file picker
    ├── Owner Hover → Shows upload overlay
    └── Public View → No interaction (static)
```

---

## New Component: FavoriteBadge Detail

```
FavoriteBadge (Client, Shared UI)
├── Container (circular)
│   ├── Background (zinc-900/90)
│   ├── Border (1px, amber-500/50)
│   ├── Backdrop Blur (4px)
│   └── Box Shadow (0 2px 8px rgba(0,0,0,0.3))
│
├── Content (flex, centered)
│   ├── Star Icon (Lucide StarIcon, filled)
│   │   └── Color: amber-500
│   │
│   └── Position Number (1-6)
│       └── Color: zinc-100
│
├── Size Variants
│   ├── Small (28px) - for library grid
│   ├── Medium (32px) - for favorites section
│   └── Large (36px) - for book detail page
│
├── Positioning
│   ├── Absolute (top-right corner)
│   ├── top: 8px, right: 8px
│   └── z-index: 10
│
└── Tooltip (optional)
    └── "Favorite #X of 2024" (or "of all time")
```

---

## Library Integration - GridItem with Badge

```
GridItem (Client, /library) ← UPDATED
├── Container (book card)
│   ├── Book Cover Image
│   │
│   ├── FavoriteBadge (conditionally rendered) ← NEW
│   │   └── Shows if favoritePosition prop provided
│   │
│   ├── Book Info
│   │   ├── Title
│   │   ├── Author
│   │   └── Metadata
│   │
│   └── Interactions
│       ├── Click → View book details
│       └── Hover → Show info overlay
│
└── Props
    ├── book: BookType
    ├── favoritePosition?: number ← NEW
    └── favoriteYear?: 'all-time' | number ← NEW
```

---

## Data Flow Diagram

### Favorites Management Flow

```
User Action: Click "Add Favorite" Placeholder
    │
    ├─→ FavoritePlaceholder.onClick()
    │
    └─→ FavoriteBooksSection.handleAddFavorite(position)
        │
        ├─→ setSelectedPosition(position)
        ├─→ setIsModalOpen(true)
        │
        └─→ FavoriteSelectionModal renders
            │
            ├─→ User searches library
            │   └─→ AutocompleteSearch → API call → Results
            │
            ├─→ User clicks book
            │   └─→ setSelectedBook(book)
            │
            └─→ User clicks "Confirm"
                │
                ├─→ setIsSaving(true)
                │
                ├─→ Server Action: setFavorite({ bookId, position, year })
                │   │
                │   ├─→ Find/Create ReadingList (FAVORITES_YEAR/ALL)
                │   ├─→ Remove existing at position (if any)
                │   ├─→ Create BookInReadingList entry
                │   └─→ Return success/error
                │
                ├─→ Optimistic UI Update
                │   └─→ Update favorites[position - 1] = newBook
                │
                ├─→ Close modal
                │
                └─→ Revalidate page
```

### Profile Image Upload Flow

```
User Action: Click Upload Button
    │
    ├─→ ProfileImageUpload opens file picker
    │
    └─→ User selects image file
        │
        ├─→ Client-side validation (type, size)
        │   └─→ If invalid: Show error, stop
        │
        ├─→ Create preview (FileReader)
        │   └─→ Show preview modal
        │
        └─→ User confirms upload
            │
            ├─→ Optional: Compress image (browser-image-compression)
            │
            ├─→ Create FormData with file
            │
            ├─→ Server Action: uploadProfileImage(formData)
            │   │
            │   ├─→ Validate auth (Clerk)
            │   ├─→ Validate file (server-side)
            │   ├─→ Upload to Vercel Blob
            │   ├─→ Update User.profileImage in DB
            │   └─→ Return { success, imageUrl, error }
            │
            ├─→ On success:
            │   ├─→ Optimistic UI update (show new image)
            │   ├─→ Call onUploadSuccess callback
            │   └─→ Revalidate page
            │
            └─→ On error:
                ├─→ Show error message
                └─→ Offer retry button
```

### Badge Display Flow

```
Page Load: Library or Home Screen
    │
    ├─→ Server Component: Fetch user's favorites
    │   │
    │   └─→ Query ReadingList (type=FAVORITES_*)
    │       └─→ Include BookInReadingList with position
    │
    ├─→ Transform to Map<bookId, { position, year }>
    │   └─→ For O(1) lookup performance
    │
    ├─→ Pass favoritesMap to GridView/GridItem
    │
    └─→ GridItem renders each book
        │
        └─→ Check: favoritesMap.get(book.id)
            │
            ├─→ If found: Render FavoriteBadge
            │   └─→ <FavoriteBadge position={X} year={Y} />
            │
            └─→ If not found: No badge
```

---

## Conditional Rendering Patterns

### Owner vs. Public Pattern

```typescript
// Pattern 1: Conditional Component
{isOwner ? (
  <OwnerViewComponent />
) : (
  <PublicViewComponent />
)}

// Pattern 2: Props-based
<Component isOwner={isOwner} />
// Component internally renders different UI

// Pattern 3: Filter and Map
{isOwner
  ? slots.map(slot => /* all 6 slots */)
  : slots.filter(s => s !== null).map(slot => /* filled only */)
}
```

### Favorites Slots Rendering

```typescript
// Owner: Render all 6 slots (filled + placeholders)
{slots.map((favorite, index) =>
  favorite ? (
    <FavoriteBookCard
      key={favorite.id}
      book={favorite}
      position={index + 1}
      isOwner={true}
      onChangeFavorite={() => handleChange(index + 1)}
    />
  ) : (
    <FavoritePlaceholder
      key={`placeholder-${index}`}
      position={index + 1}
      onAddFavorite={() => handleAdd(index + 1)}
    />
  )
)}

// Public: Filter out nulls, render only filled
{slots
  .filter(favorite => favorite !== null)
  .map(favorite => (
    <FavoriteBookCard
      key={favorite.id}
      book={favorite}
      position={favorite.position}
      isOwner={false}
      onViewDetails={() => router.push(`/book/${favorite.id}`)}
    />
  ))
}
```

---

## State Management Flow

### Favorites Section State

```typescript
FavoriteBooksSection State:
├── yearFilter: 'all-time' | number
├── favorites: (FavoriteBook | null)[]  // Always length 6
├── isLoading: boolean
├── isModalOpen: boolean
├── selectedPosition: number | null
└── error: string | null

State Transitions:
├── Year Change → Fetch new favorites → Update slots
├── Add Favorite → Open modal → Select book → Save → Close
├── Change Favorite → Open modal → Select book → Replace → Close
└── Remove Favorite → Confirm → Remove → Update slot to null
```

### Profile Upload State

```typescript
ProfileImageUpload State:
├── uploadProgress: number (0-100)
├── isUploading: boolean
├── previewImage: string | null
├── error: string | null
└── showPreview: boolean

State Transitions:
├── File Selected → Show preview → previewImage set
├── Confirm Upload → isUploading true → uploadProgress 0-100
├── Upload Success → isUploading false → Update UI
└── Upload Error → isUploading false → error set
```

---

## Component Communication Patterns

### Parent → Child (Props)
```
FavoriteBooksSection
    ↓ (props)
FavoriteBookGrid
    ↓ (props)
FavoriteBookCard
```

### Child → Parent (Callbacks)
```
FavoritePlaceholder
    ↑ (onAddFavorite callback)
FavoriteBookGrid
    ↑ (onSlotClick callback)
FavoriteBooksSection
```

### Sibling Communication (via Parent State)
```
FavoritePlaceholder → FavoriteBooksSection (update state)
                              ↓
FavoriteSelectionModal (receives state via props)
```

### Server Actions (Client → Server)
```
Component (Client)
    ↓ (async function call)
Server Action (Server)
    ↓ (returns result)
Component (Client) - handle response
```

---

## File Structure (Updated)

```
/src
├── app
│   ├── page.tsx (Server)
│   │
│   ├── actions
│   │   ├── uploadProfileImage.ts ← NEW
│   │   ├── setFavorite.ts ← NEW
│   │   └── removeFavorite.ts ← NEW
│   │
│   ├── components
│   │   └── home
│   │       ├── HomeScreen.tsx
│   │       ├── ProfileSection.tsx ← UPDATED
│   │       ├── ProfileImageUpload.tsx ← NEW
│   │       ├── FavoriteBooksSection.tsx ← UPDATED
│   │       ├── FavoriteBooksHeader.tsx
│   │       ├── YearFilterDropdown.tsx
│   │       ├── FavoriteBookGrid.tsx ← RENAMED
│   │       ├── FavoriteBookCard.tsx ← NEW
│   │       ├── FavoritePlaceholder.tsx ← NEW
│   │       ├── FavoriteSelectionModal.tsx ← NEW
│   │       ├── ReadingListsSection.tsx
│   │       └── ... (other reading list components)
│   │
│   └── library
│       └── components
│           ├── gridItem.tsx ← UPDATED (badge props)
│           ├── autocompleteSearch.tsx (reused)
│           └── gridView.tsx (reused)
│
└── components
    └── ui
        ├── BookCoverCard.tsx ← UPDATED
        ├── FavoriteBadge.tsx ← NEW
        ├── Modal.tsx
        ├── Dropdown.tsx
        └── ... (other shared components)
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Author:** Frontend Developer (Penumbra)
**Purpose:** Visual reference for updated component hierarchy
