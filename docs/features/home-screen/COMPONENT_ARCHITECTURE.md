# Home Screen Component Architecture

## Overview

This document outlines the component architecture for Penumbra's home screen feature, which includes:
- User profile/bio section
- Favorite books browser with year filtering
- Reading lists display with multiple view modes
- Reading list detail pages
- Owner-only management features

## Component Hierarchy

```
/app/page.tsx (Root home page - Server Component)
├── /app/components/home/
│   ├── HomeScreen.tsx (Client Component - main container)
│   │   ├── ProfileSection.tsx (Client Component - user profile/bio + upload)
│   │   │   └── ProfileImageUpload.tsx (Client Component - profile picture upload)
│   │   ├── FavoriteBooksSection.tsx (Client Component - favorites browser)
│   │   │   ├── FavoriteBooksHeader.tsx (Client Component - title + year dropdown)
│   │   │   │   └── YearFilterDropdown.tsx (Client Component - custom dropdown)
│   │   │   ├── FavoriteBookGrid.tsx (Client Component - 6-slot display)
│   │   │   │   ├── FavoriteBookCard.tsx (Client Component - filled slot)
│   │   │   │   └── FavoritePlaceholder.tsx (Client Component - empty slot, owner-only)
│   │   │   └── FavoriteSelectionModal.tsx (Client Component - add/change favorites)
│   │   │       ├── BookSearch.tsx (Reused from library)
│   │   │       └── SearchResults.tsx (Reused from library)
│   │   │
│   │   └── ReadingListsSection.tsx (Client Component - lists overview)
│   │       ├── ReadingListsHeader.tsx (Client Component - title + create button)
│   │       ├── ViewModeToggle.tsx (Shared - reusable from /components/ui/)
│   │       ├── ReadingListGrid.tsx (Client Component - grid layout)
│   │       │   └── ReadingListCard.tsx (Client Component - list preview)
│   │       │       ├── ListCoverPreview.tsx (Client Component - 3-4 covers)
│   │       │       └── ListMetadata.tsx (Client Component - title, desc, count)
│   │       └── EmptyReadingListsState.tsx (Client Component - empty state)
│
├── /app/reading-lists/[id]/page.tsx (Reading List Detail Page - Server Component)
│   └── /app/reading-lists/components/
│       ├── ReadingListDetail.tsx (Client Component - main detail view)
│       │   ├── ReadingListHeader.tsx (Client Component - title, desc, actions)
│       │   │   ├── BackButton.tsx (Shared - from /components/ui/)
│       │   │   ├── ViewModeToggle.tsx (Shared - from /components/ui/)
│       │   │   └── EditListButton.tsx (Client Component - owner only)
│       │   │
│       │   ├── BookListView.tsx (Client Component - ordered book list)
│       │   │   └── BookListItem.tsx (Client Component - book row)
│       │   │       ├── RemoveFromListButton.tsx (Client Component - owner only)
│       │   │       └── DragHandle.tsx (Client Component - owner only reorder)
│       │   │
│       │   └── BookGridView.tsx (Client Component - grid of books)
│       │       └── BookCoverCard.tsx (Shared - from /components/ui/)
│       │           └── RemoveFromListButton.tsx (Client Component - owner only)
│       │
│       ├── EditListModal.tsx (Client Component - edit title/description)
│       ├── AddBooksModal.tsx (Client Component - search and add books)
│       │   ├── BookSearch.tsx (Client Component - autocomplete search)
│       │   └── SearchResults.tsx (Client Component - selectable results)
│       │
│       └── EmptyReadingListState.tsx (Client Component - no books yet)
│
└── /components/ui/ (Shared UI Components)
    ├── BookCoverCard.tsx (Reusable book cover display)
    ├── FavoriteBadge.tsx (NEW - badge overlay for favorite books)
    ├── ViewModeToggle.tsx (List/Grid toggle button)
    ├── BackButton.tsx (Navigation back button)
    ├── Modal.tsx (Base modal component)
    ├── Dropdown.tsx (Base dropdown component)
    └── EmptyState.tsx (Generic empty state component)
```

## File Structure

```
/Users/jonathan/github/penumbra/.conductor/monrovia/
├── src/
│   ├── app/
│   │   ├── page.tsx                                    # Root home page (Server Component)
│   │   │
│   │   ├── components/
│   │   │   └── home/                                   # Home screen feature components
│   │   │       ├── HomeScreen.tsx
│   │   │       ├── ProfileSection.tsx                   # UPDATED (was ProfileBio)
│   │   │       ├── ProfileImageUpload.tsx               # NEW
│   │   │       ├── FavoriteBooksSection.tsx             # UPDATED
│   │   │       ├── FavoriteBooksHeader.tsx
│   │   │       ├── YearFilterDropdown.tsx
│   │   │       ├── FavoriteBookGrid.tsx                 # UPDATED (was FavoriteBooksCarousel)
│   │   │       ├── FavoriteBookCard.tsx                 # NEW
│   │   │       ├── FavoritePlaceholder.tsx              # NEW
│   │   │       ├── FavoriteSelectionModal.tsx           # NEW
│   │   │       ├── ReadingListsSection.tsx
│   │   │       ├── ReadingListsHeader.tsx
│   │   │       ├── ReadingListGrid.tsx
│   │   │       ├── ReadingListCard.tsx
│   │   │       ├── ListCoverPreview.tsx
│   │   │       ├── ListMetadata.tsx
│   │   │       └── EmptyReadingListsState.tsx
│   │   │
│   │   ├── reading-lists/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx                           # Detail page (Server Component)
│   │   │   │
│   │   │   └── components/                            # Reading list feature components
│   │   │       ├── ReadingListDetail.tsx
│   │   │       ├── ReadingListHeader.tsx
│   │   │       ├── BookListView.tsx
│   │   │       ├── BookListItem.tsx
│   │   │       ├── BookGridView.tsx
│   │   │       ├── EditListButton.tsx
│   │   │       ├── RemoveFromListButton.tsx
│   │   │       ├── DragHandle.tsx
│   │   │       ├── EditListModal.tsx
│   │   │       ├── AddBooksModal.tsx
│   │   │       ├── BookSearch.tsx
│   │   │       ├── SearchResults.tsx
│   │   │       └── EmptyReadingListState.tsx
│   │   │
│   │   └── api/
│   │       ├── reading-lists/
│   │       │   ├── route.ts                           # GET (list), POST (create)
│   │       │   ├── [id]/
│   │       │   │   └── route.ts                       # GET, PATCH, DELETE
│   │       │   └── [id]/
│   │       │       └── books/
│   │       │           └── route.ts                   # POST (add), DELETE (remove), PATCH (reorder)
│   │       │
│   │       └── favorites/
│   │           └── route.ts                           # GET favorites with year filter
│   │
│   ├── components/
│   │   └── ui/                                        # Shared UI components
│   │       ├── BookCoverCard.tsx
│   │       ├── FavoriteBadge.tsx                       # NEW
│   │       ├── ViewModeToggle.tsx
│   │       ├── BackButton.tsx
│   │       ├── Modal.tsx
│   │       ├── Dropdown.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── actions/                                       # Server actions
│   │   ├── uploadProfileImage.ts                      # NEW
│   │   ├── setFavorite.ts                             # NEW
│   │   └── removeFavorite.ts                          # NEW
│   │
│   └── shared.types.ts                                # Extended with reading list types
```

## Component Specifications

### 1. Root Home Page

#### `/app/page.tsx`
**Type:** Server Component
**Responsibility:** Fetch initial data and render home screen

```typescript
// Server Component - fetches data at build/request time
export default async function HomePage() {
  const { userId } = await auth(); // Clerk auth

  // Fetch user profile data (if authenticated)
  const profile = userId ? await fetchUserProfile(userId) : null;

  // Fetch public data for guest view
  const favorites = await fetchFavoriteBooks();
  const readingLists = await fetchPublicReadingLists();

  return <HomeScreen
    profile={profile}
    initialFavorites={favorites}
    initialReadingLists={readingLists}
    isOwner={!!userId && userId === profile?.clerkId}
  />;
}
```

**Data Fetching:**
- User profile (if authenticated)
- Initial favorite books
- Public reading lists
- Owner status determination

---

### 2. Home Screen Components

#### `HomeScreen.tsx`
**Type:** Client Component
**Responsibility:** Main container for home screen sections

```typescript
interface HomeScreenProps {
  profile: UserProfile | null;
  initialFavorites: FavoriteBook[];
  initialReadingLists: ReadingList[];
  isOwner: boolean;
}

export default function HomeScreen({
  profile,
  initialFavorites,
  initialReadingLists,
  isOwner
}: HomeScreenProps) {
  // Client-side state management for interactive features
  return (
    <div className="space-y-16">
      <ProfileBio profile={profile} />
      <FavoriteBooksSection
        initialFavorites={initialFavorites}
      />
      <ReadingListsSection
        initialLists={initialReadingLists}
        isOwner={isOwner}
      />
    </div>
  );
}
```

**State Management:**
- None (delegates to child components)

**Props Interface:**
```typescript
interface HomeScreenProps {
  profile: UserProfile | null;
  initialFavorites: FavoriteBook[];
  initialReadingLists: ReadingList[];
  isOwner: boolean;
}
```

---

#### `ProfileSection.tsx` (Updated from ProfileBio)
**Type:** Client Component
**Responsibility:** Display user profile picture, bio, and upload functionality

```typescript
interface ProfileSectionProps {
  profile: UserProfile | null;
  isOwner: boolean;
}
```

**Layout:**
- Centered container
- ProfileImageUpload component (handles image and upload button)
- Name (heading)
- Bio text below (max-width for readability)
- Responsive: full width on mobile, constrained on desktop

**Features:**
- Displays profile picture or initials placeholder
- Upload button visible to owner only
- Static display for public viewers
- Optimistic image updates

**Styling:**
- Uses existing Tailwind zinc color palette
- Geist Sans font for bio text
- Responsive layout

**Components:**
- ProfileImageUpload (integrated)

---

#### `ProfileImageUpload.tsx` (New)
**Type:** Client Component
**Responsibility:** Handle profile picture upload and display

```typescript
interface ProfileImageUploadProps {
  currentImage: string | null;
  userName: string | null;
  isOwner: boolean;
  onUploadSuccess?: (imageUrl: string) => void;
}
```

**Features:**
- Display current profile image or initials placeholder
- "Upload Photo" button (owner-only)
- File picker integration (`<input type="file" accept="image/*">`)
- Client-side image preview before upload
- Compression/resize before upload (optional)
- Upload progress indicator (0-100%)
- Error handling (file size, type, upload failures)
- Optimistic UI update
- Integration with Vercel Blob storage

**Layout:**
- Circular avatar (120px mobile, 150px desktop)
- Upload button overlays on hover (owner view)
- Camera icon indicator
- Loading spinner during upload

**Interactions:**
- Owner: Hover shows upload button overlay
- Owner: Click opens file picker
- Public: No interaction (static display)
- Preview before upload with confirm/cancel

**State Management:**
```typescript
const [uploadProgress, setUploadProgress] = useState(0);
const [isUploading, setIsUploading] = useState(false);
const [previewImage, setPreviewImage] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
```

**Server Action Integration:**
```typescript
import { uploadProfileImage } from "@/app/actions/uploadProfileImage";

const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const result = await uploadProfileImage(formData);
  // Handle result
};
```

**File Validation:**
- Max size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF
- Client-side validation before upload

**Styling:**
- Circular border (zinc-300 border)
- Hover overlay: zinc-900/70 background
- Upload icon: white camera icon
- Progress: circular progress indicator
- Error: red text below avatar

---

#### `FavoriteBooksSection.tsx` (Updated)
**Type:** Client Component
**Responsibility:** Container for favorite books with year filtering and owner/public views

```typescript
interface FavoriteBooksSectionProps {
  initialFavorites: (FavoriteBook | null)[]; // 6-slot array
  isOwner: boolean;
  userId: string | null;
}

export default function FavoriteBooksSection({
  initialFavorites,
  isOwner,
  userId
}: FavoriteBooksSectionProps) {
  const [yearFilter, setYearFilter] = useState<'all-time' | number>('all-time');
  const [favorites, setFavorites] = useState<(FavoriteBook | null)[]>(initialFavorites);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  // Fetch favorites when year changes
  useEffect(() => {
    fetchFavorites(yearFilter);
  }, [yearFilter]);

  const handleAddFavorite = (position: number) => {
    setSelectedPosition(position);
    setIsModalOpen(true);
  };

  const handleChangeFavorite = (position: number) => {
    setSelectedPosition(position);
    setIsModalOpen(true);
  };

  const handleSelectBook = async (bookId: number, position: number) => {
    // Optimistic update
    // Call setFavorite server action
    // Close modal
  };

  return (
    <section>
      <FavoriteBooksHeader
        yearFilter={yearFilter}
        onYearChange={setYearFilter}
      />
      <FavoriteBookGrid
        slots={favorites}
        isOwner={isOwner}
        isLoading={isLoading}
        onSlotClick={isOwner ? handleAddFavorite : handleViewDetails}
      />
      {isModalOpen && (
        <FavoriteSelectionModal
          isOpen={isModalOpen}
          position={selectedPosition!}
          year={yearFilter}
          existingFavorites={favorites.filter(f => f !== null).map(f => f.id)}
          onClose={() => setIsModalOpen(false)}
          onSelectBook={handleSelectBook}
        />
      )}
    </section>
  );
}
```

**State Management:**
- Year filter selection
- Favorites data (6-slot array with nulls for empty slots)
- Loading state
- Modal open/close state
- Selected position for modal

**Props Interface:**
```typescript
interface FavoriteBook extends BookType {
  position: number; // 1-6
  favoritedAt: string;
}

interface FavoriteBooksSectionProps {
  initialFavorites: (FavoriteBook | null)[]; // Always 6 slots
  isOwner: boolean;
  userId: string | null;
}
```

**Owner vs. Public Logic:**
- **Owner:** Sees all 6 slots (filled + placeholders)
- **Public:** Sees only filled slots (filters out nulls)

**Child Components:**
- FavoriteBooksHeader (unchanged)
- FavoriteBookGrid (updated from FavoriteBooksCarousel)
- FavoriteSelectionModal (new)

---

#### `FavoriteBooksHeader.tsx`
**Type:** Client Component
**Responsibility:** Title and year filter dropdown

```typescript
interface FavoriteBooksHeaderProps {
  yearFilter: 'all-time' | number;
  onYearChange: (filter: 'all-time' | number) => void;
}
```

**Layout:**
- Flex container: "Favorite Books" title + YearFilterDropdown
- Responsive: stacked on mobile, inline on desktop

---

#### `YearFilterDropdown.tsx`
**Type:** Client Component
**Responsibility:** Custom dropdown for year selection

```typescript
interface YearFilterDropdownProps {
  value: 'all-time' | number;
  onChange: (value: 'all-time' | number) => void;
  availableYears: number[]; // Fetched from API or derived
}
```

**Features:**
- "of all time" option
- "of 2024", "of 2023", etc. options
- Keyboard navigation (arrow keys, Enter, Escape)
- Click outside to close
- Custom styling (not using native select)

**Styling:**
- Inline with title: "Favorite Books of [dropdown]"
- Dropdown button styled as part of the title
- Popover menu with year options

**State Management:**
- Open/closed state
- Selected value
- Focus management

---

#### `FavoriteBookGrid.tsx` (Updated from FavoriteBooksCarousel)
**Type:** Client Component
**Responsibility:** Display 6 favorite book slots with owner/public differentiation

```typescript
interface FavoriteBookGridProps {
  slots: (FavoriteBook | null)[]; // Always 6 slots
  isOwner: boolean;
  isLoading?: boolean;
  onSlotClick: (position: number, book: BookType | null) => void;
}
```

**Layout:**
- Fixed 6-slot grid layout
- Mobile: 2x3 grid
- Desktop: 6x1 or 3x2 grid (depending on design)
- Each slot uses FavoriteBookCard or FavoritePlaceholder

**Rendering Logic:**
```typescript
// Owner View: Render all 6 slots (filled + placeholders)
{slots.map((favorite, index) =>
  favorite ? (
    <FavoriteBookCard
      key={favorite.id}
      book={favorite}
      position={index + 1}
      isOwner={true}
      onChangeFavorite={() => onSlotClick(index + 1, favorite)}
    />
  ) : (
    <FavoritePlaceholder
      key={`placeholder-${index}`}
      position={index + 1}
      onAddFavorite={() => onSlotClick(index + 1, null)}
    />
  )
)}

// Public View: Render only filled slots
{slots.filter(f => f !== null).map((favorite, index) => (
  <FavoriteBookCard
    key={favorite.id}
    book={favorite}
    position={favorite.position}
    isOwner={false}
    onViewDetails={() => router.push(`/book/${favorite.id}`)}
  />
))}
```

**Styling:**
- Responsive grid (2 cols on mobile, 3-6 on desktop)
- Gap between slots
- Consistent slot dimensions (aspect ratio 2:3)
- Smooth transitions

**Loading State:**
- Skeleton cards matching slot dimensions

---

#### `FavoriteBookCard.tsx` (New)
**Type:** Client Component
**Responsibility:** Display favorite book with owner-specific interactions

```typescript
interface FavoriteBookCardProps {
  book: BookType;
  position: number; // 1-6
  year?: 'all-time' | number;
  isOwner: boolean;
  onChangeFavorite?: () => void;
  onRemoveFavorite?: () => void;
  onViewDetails?: () => void;
}
```

**Features:**
- Display book cover (Next.js Image)
- Position indicator badge (1-6)
- Different interactions based on ownership:
  - **Owner:** Click opens change/remove options
  - **Public:** Click opens book details
- Hover state shows action hint
- Keyboard accessible
- Loading state during operations

**Owner Interactions:**
- Click → Show context menu or modal:
  - "Choose Different Book" (opens FavoriteSelectionModal)
  - "Remove from Favorites" (removes, creates empty slot)
  - "View Details" (navigate to book page)
  - "Cancel"
- Hover shows semi-transparent overlay with "Change" text

**Public View:**
- Click → Navigate to book detail page
- Hover shows book metadata overlay (title, author)
- No edit controls visible

**Styling:**
- Same dimensions as FavoritePlaceholder (aspect ratio 2:3)
- Subtle border (zinc-300)
- Hover border color change (owner: zinc-400, public: zinc-500)
- Position badge: top-left corner, small circle with number
- Overlay transition: smooth fade in/out

---

#### `FavoritePlaceholder.tsx` (New)
**Type:** Client Component
**Responsibility:** Display empty favorite slot with add functionality (owner-only)

```typescript
interface FavoritePlaceholderProps {
  position: number; // 1-6
  year?: 'all-time' | number;
  onAddFavorite: () => void;
}
```

**Features:**
- Dashed border book-shaped outline
- "+" icon and "Add Favorite" text
- Click handler opens FavoriteSelectionModal
- Position indicator (subtle, bottom-right corner)
- Same dimensions as FavoriteBookCard
- Hover effect (border color change, background)
- Keyboard accessible (Tab, Enter/Space)

**Layout:**
- Aspect ratio 2:3 (matches book covers)
- Centered icon (32px +)
- Centered text below icon ("Add Favorite")
- Semi-transparent background
- Dashed border (2px)

**Interactions:**
- Click: Opens selection modal at this position
- Hover: Border color darkens, background appears
- Keyboard: Tab to focus, Enter/Space to activate

**Styling:**
- Dashed border: 2px, zinc-400, rounded-lg
- Background: transparent (hover: zinc-900/30)
- Icon: zinc-500, size 32px
- Text: text-sm, zinc-500
- Hover: border zinc-600, background zinc-900/50
- Transition: all 200ms ease
- Cursor: pointer

**Accessibility:**
- `role="button"`
- `aria-label="Add favorite book at position {position}"`
- `tabIndex={0}`
- Keyboard events (Enter, Space)

---

#### `FavoriteSelectionModal.tsx` (New)
**Type:** Client Component
**Responsibility:** Search and select book to set as favorite

```typescript
interface FavoriteSelectionModalProps {
  isOpen: boolean;
  position: number; // 1-6
  year: 'all-time' | number;
  existingFavorites: number[]; // Book IDs already in favorites
  onClose: () => void;
  onSelectBook: (bookId: number, position: number) => Promise<void>;
}
```

**Features:**
- Modal overlay with backdrop
- Title: "Select Favorite Book (Position {position})"
- Subtitle: Shows year if applicable ("for 2024")
- Reuse existing library search (AutocompleteSearch)
- Filter to show only owner's books
- Filter out books already in favorites (or show with "Replace" indicator)
- Book grid or list view (reuse GridView)
- Click book → Confirm dialog: "Set as Favorite #{position}?"
- Confirm/Cancel buttons
- Loading state during save
- Success feedback (toast or inline)
- Close on success
- Escape key to close

**State Management:**
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<BookType[]>([]);
const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
const [isSearching, setIsSearching] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);
```

**Layout:**
- Large modal (80vw on mobile, 60vw on desktop, max 800px)
- Header with title and close button
- Search bar at top (reuse AutocompleteSearch)
- Scrollable results area (reuse GridView)
- Fixed footer with confirm/cancel buttons (when book selected)

**Integration Points:**
- Reuse `/app/library/components/autocompleteSearch.tsx`
- Reuse `/app/library/components/gridView.tsx`
- Call `setFavorite` server action to save
- Update parent state on success

**Server Action Call:**
```typescript
import { setFavorite } from "@/app/actions/setFavorite";

const handleConfirm = async () => {
  setIsSaving(true);
  const result = await setFavorite({
    bookId: selectedBook.id,
    position,
    year,
  });

  if (result.success) {
    onSelectBook(selectedBook.id, position);
    onClose();
  } else {
    setError(result.error);
  }
  setIsSaving(false);
};
```

**Styling:**
- Modal background: zinc-900/95 backdrop blur
- Modal card: zinc-800 background, rounded-xl
- Search bar: full width, zinc-700 background
- Results: grid with gap, max-height with scroll
- Footer: sticky bottom, zinc-800 background, buttons right-aligned
- Confirm button: primary style, disabled when saving
- Cancel button: secondary style

**Accessibility:**
- Focus trap within modal
- Escape key closes modal
- First focusable element: search input
- ARIA labels for all buttons
- Keyboard navigation through results

---

### 3. Reading Lists Section

#### `ReadingListsSection.tsx`
**Type:** Client Component
**Responsibility:** Container for reading lists display

```typescript
interface ReadingListsSectionProps {
  initialLists: ReadingList[];
  isOwner: boolean;
}

export default function ReadingListsSection({
  initialLists,
  isOwner
}: ReadingListsSectionProps) {
  const [lists, setLists] = useState(initialLists);
  const [viewMode, setViewMode] = useState<'list' | 'covers'>('list');
  const [isCreating, setIsCreating] = useState(false);

  // Load view mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reading-lists-view-mode');
    if (saved === 'list' || saved === 'covers') {
      setViewMode(saved);
    }
  }, []);

  const handleCreateList = () => {
    // Open create list modal
    setIsCreating(true);
  };

  return (
    <section>
      <ReadingListsHeader
        isOwner={isOwner}
        onCreateList={handleCreateList}
      />
      <ViewModeToggle
        mode={viewMode}
        onChange={setViewMode}
      />
      {lists.length === 0 ? (
        <EmptyReadingListsState isOwner={isOwner} />
      ) : (
        <ReadingListGrid
          lists={lists}
          viewMode={viewMode}
        />
      )}
    </section>
  );
}
```

**State Management:**
- Reading lists data
- View mode (list vs covers)
- Create modal state

**Props Interface:**
```typescript
interface ReadingList {
  id: string;
  title: string;
  description: string;
  coverImages: string[]; // Top 3-4 book covers
  bookCount: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  ownerId: string;
}

interface ReadingListsSectionProps {
  initialLists: ReadingList[];
  isOwner: boolean;
}
```

---

#### `ReadingListsHeader.tsx`
**Type:** Client Component
**Responsibility:** Section title and create button (owner only)

```typescript
interface ReadingListsHeaderProps {
  isOwner: boolean;
  onCreateList: () => void;
}
```

**Layout:**
- Flex container: title on left, create button on right
- Create button only visible to owner

---

#### `ReadingListGrid.tsx`
**Type:** Client Component
**Responsibility:** Grid layout of reading list cards

```typescript
interface ReadingListGridProps {
  lists: ReadingList[];
  viewMode: 'list' | 'covers';
}
```

**Layout:**
- Grid with responsive columns (1 on mobile, 2-3 on desktop)
- Renders ReadingListCard for each list
- View mode determines card content emphasis

---

#### `ReadingListCard.tsx`
**Type:** Client Component
**Responsibility:** Preview card for a reading list

```typescript
interface ReadingListCardProps {
  list: ReadingList;
  viewMode: 'list' | 'covers';
  onClick: () => void;
}
```

**Layout:**
- List mode: More text emphasis (title, description, metadata)
- Covers mode: More visual emphasis (larger cover previews)
- Click navigates to `/reading-lists/[id]`

**Features:**
- Hover effects
- Keyboard navigation
- Loading state when navigating

**Components:**
- ListCoverPreview: Displays 3-4 book covers in grid
- ListMetadata: Shows title, description, book count

---

#### `EmptyReadingListsState.tsx`
**Type:** Client Component
**Responsibility:** Empty state when no reading lists exist

```typescript
interface EmptyReadingListsStateProps {
  isOwner: boolean;
}
```

**Content:**
- Icon (BookmarkIcon from Lucide)
- Message for owners: "Create your first reading list"
- Message for guests: "No reading lists yet"
- CTA button for owners to create list

---

### 4. Reading List Detail Page

#### `/app/reading-lists/[id]/page.tsx`
**Type:** Server Component
**Responsibility:** Fetch list data and render detail view

```typescript
export default async function ReadingListPage({
  params
}: {
  params: { id: string }
}) {
  const { userId } = await auth();

  const list = await fetchReadingList(params.id);
  const books = await fetchReadingListBooks(params.id);

  // Check ownership
  const isOwner = !!userId && userId === list.ownerId;

  // 404 if list not found or not public and not owner
  if (!list || (!list.isPublic && !isOwner)) {
    notFound();
  }

  return (
    <ReadingListDetail
      list={list}
      books={books}
      isOwner={isOwner}
    />
  );
}
```

**Data Fetching:**
- Reading list metadata
- Books in the list (ordered)
- Owner status check
- Access control (public vs private)

---

#### `ReadingListDetail.tsx`
**Type:** Client Component
**Responsibility:** Main container for reading list detail view

```typescript
interface ReadingListDetailProps {
  list: ReadingList;
  books: ReadingListBook[];
  isOwner: boolean;
}

export default function ReadingListDetail({
  list,
  books,
  isOwner
}: ReadingListDetailProps) {
  const [viewMode, setViewMode] = useState<'list' | 'covers'>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingBooks, setIsAddingBooks] = useState(false);

  // Load view mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reading-list-detail-view-mode');
    if (saved === 'list' || saved === 'covers') {
      setViewMode(saved);
    }
  }, []);

  return (
    <div>
      <ReadingListHeader
        list={list}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onEdit={() => setIsEditing(true)}
        onAddBooks={() => setIsAddingBooks(true)}
        isOwner={isOwner}
      />

      {books.length === 0 ? (
        <EmptyReadingListState
          isOwner={isOwner}
          onAddBooks={() => setIsAddingBooks(true)}
        />
      ) : (
        viewMode === 'list' ? (
          <BookListView
            books={books}
            isOwner={isOwner}
          />
        ) : (
          <BookGridView
            books={books}
            isOwner={isOwner}
          />
        )
      )}

      {isEditing && (
        <EditListModal
          list={list}
          onClose={() => setIsEditing(false)}
        />
      )}

      {isAddingBooks && (
        <AddBooksModal
          listId={list.id}
          onClose={() => setIsAddingBooks(false)}
        />
      )}
    </div>
  );
}
```

**State Management:**
- View mode (list vs covers)
- Edit modal state
- Add books modal state
- Books data (with optimistic updates)

**Props Interface:**
```typescript
interface ReadingListBook extends BookType {
  listPosition: number; // Order in the list
  addedAt: string;
}

interface ReadingListDetailProps {
  list: ReadingList;
  books: ReadingListBook[];
  isOwner: boolean;
}
```

---

#### `ReadingListHeader.tsx`
**Type:** Client Component
**Responsibility:** List title, description, and action buttons

```typescript
interface ReadingListHeaderProps {
  list: ReadingList;
  viewMode: 'list' | 'covers';
  onViewModeChange: (mode: 'list' | 'covers') => void;
  onEdit: () => void;
  onAddBooks: () => void;
  isOwner: boolean;
}
```

**Layout:**
- Back button (top left)
- Title and description (center)
- View mode toggle (top right)
- Edit and Add Books buttons (owner only)

**Responsive:**
- Mobile: Stacked layout
- Desktop: Horizontal layout

---

#### `BookListView.tsx`
**Type:** Client Component
**Responsibility:** Display books in ordered list format

```typescript
interface BookListViewProps {
  books: ReadingListBook[];
  isOwner: boolean;
}

export default function BookListView({
  books,
  isOwner
}: BookListViewProps) {
  const [orderedBooks, setOrderedBooks] = useState(books);

  // Drag and drop for owners
  const handleReorder = async (startIndex: number, endIndex: number) => {
    // Optimistic update
    const reordered = reorderArray(orderedBooks, startIndex, endIndex);
    setOrderedBooks(reordered);

    // API call
    await updateBookOrder(listId, reordered);
  };

  return (
    <div>
      {orderedBooks.map((book, index) => (
        <BookListItem
          key={book.id}
          book={book}
          index={index}
          isOwner={isOwner}
          onReorder={handleReorder}
        />
      ))}
    </div>
  );
}
```

**Features:**
- Ordered list display
- Drag-and-drop reordering (owner only)
- Remove button on each item (owner only)
- Click to view book detail

---

#### `BookListItem.tsx`
**Type:** Client Component
**Responsibility:** Single book row in list view

```typescript
interface BookListItemProps {
  book: ReadingListBook;
  index: number;
  isOwner: boolean;
  onReorder?: (startIndex: number, endIndex: number) => void;
}
```

**Layout:**
- Position number (1, 2, 3...)
- Book cover thumbnail
- Title and author
- Metadata (page count, year)
- Drag handle (owner only)
- Remove button (owner only)

**Interactions:**
- Drag handle for reordering
- Click to view book detail
- Remove button with confirmation

---

#### `BookGridView.tsx`
**Type:** Client Component
**Responsibility:** Display books in grid format

```typescript
interface BookGridViewProps {
  books: ReadingListBook[];
  isOwner: boolean;
}
```

**Layout:**
- Responsive grid (2 cols on mobile, 4-5 on desktop)
- Uses BookCoverCard component
- Remove button overlay on hover (owner only)

---

#### `EditListModal.tsx`
**Type:** Client Component
**Responsibility:** Modal to edit list title and description

```typescript
interface EditListModalProps {
  list: ReadingList;
  onClose: () => void;
}

export default function EditListModal({
  list,
  onClose
}: EditListModalProps) {
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateReadingList(list.id, { title, description });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSave}>
        <input value={title} onChange={e => setTitle(e.target.value)} />
        <textarea value={description} onChange={e => setDescription(e.target.value)} />
        <button type="submit" disabled={isSaving}>Save</button>
      </form>
    </Modal>
  );
}
```

**Features:**
- Form validation
- Save button with loading state
- Cancel button
- Keyboard shortcuts (Escape to close, Enter to save)

---

#### `AddBooksModal.tsx`
**Type:** Client Component
**Responsibility:** Search and add books to list

```typescript
interface AddBooksModalProps {
  listId: string;
  onClose: () => void;
}

export default function AddBooksModal({
  listId,
  onClose
}: AddBooksModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookType[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    await addBooksToList(listId, Array.from(selectedBooks));
    onClose();
  };

  return (
    <Modal onClose={onClose} size="large">
      <BookSearch
        query={searchQuery}
        onQueryChange={setSearchQuery}
      />
      <SearchResults
        results={searchResults}
        selectedBooks={selectedBooks}
        onToggleSelect={(bookId) => {
          const newSet = new Set(selectedBooks);
          if (newSet.has(bookId)) {
            newSet.delete(bookId);
          } else {
            newSet.add(bookId);
          }
          setSelectedBooks(newSet);
        }}
      />
      <button onClick={handleAdd} disabled={isAdding || selectedBooks.size === 0}>
        Add {selectedBooks.size} Book{selectedBooks.size !== 1 ? 's' : ''}
      </button>
    </Modal>
  );
}
```

**Features:**
- Autocomplete search (reuses existing library search)
- Multi-select books
- Add button with count
- Loading states

---

### 5. Shared UI Components

#### `BookCoverCard.tsx`
**Type:** Client Component (extends existing GridItem pattern)
**Responsibility:** Reusable book cover display

```typescript
interface BookCoverCardProps {
  book: BookType;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  onRemove?: () => void; // Optional remove button
  isSelected?: boolean;
  showOverlay?: boolean; // Show metadata on hover
  favoritePosition?: number; // NEW - for badge overlay
  favoriteYear?: 'all-time' | number; // NEW - for badge tooltip
  className?: string;
}
```

**Features:**
- Image loading states (skeleton)
- Error fallback
- Hover overlay with metadata (optional)
- Multiple size variants
- Optional remove button
- FavoriteBadge overlay (when favoritePosition provided)
- Click handler
- Responsive sizing

**Badge Integration:**
```typescript
{favoritePosition && (
  <FavoriteBadge
    position={favoritePosition}
    year={favoriteYear}
    size={size === 'small' ? 'small' : 'medium'}
  />
)}
```

**Reuse:**
- FavoriteBookGrid
- ReadingListCard cover previews
- BookGridView
- Library GridItem (with badge)
- AddBooksModal search results

---

#### `FavoriteBadge.tsx` (New)
**Type:** Client Component
**Responsibility:** Display favorite indicator badge on book cards

```typescript
interface FavoriteBadgeProps {
  position: number; // 1-6
  year?: 'all-time' | number; // For tooltip
  size?: 'small' | 'medium' | 'large';
  className?: string;
}
```

**Features:**
- Small badge overlay on book cards
- Star icon (filled star from Lucide)
- Position number (1-6) displayed prominently
- Optional year in tooltip (e.g., "Favorite #1 of 2024")
- Color: amber star with dark background
- Positioned top-right corner of book card
- Semi-transparent background with blur
- Hover: tooltip shows details
- Size variants for different contexts

**Layout:**
- Circular badge
- Star icon + position number
- Absolute positioning (top-right)
- Z-index to overlay on book cover

**Styling:**
```typescript
// Small (library grid)
{
  width: '28px',
  height: '28px',
  fontSize: '10px',
}

// Medium (favorites section)
{
  width: '32px',
  height: '32px',
  fontSize: '12px',
}

// Large (book detail page)
{
  width: '36px',
  height: '36px',
  fontSize: '14px',
}

// Common styles
{
  position: 'absolute',
  top: '8px',
  right: '8px',
  background: 'rgba(24, 24, 27, 0.9)', // zinc-900/90
  border: '1px solid rgba(251, 191, 36, 0.5)', // amber-500/50
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2px',
  backdropFilter: 'blur(4px)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
}
```

**Icon:**
- Star icon from Lucide React (StarIcon)
- Color: amber-500
- Size: 12px (small), 14px (medium), 16px (large)
- Filled variant

**Tooltip (Optional):**
```typescript
<Tooltip content={`Favorite #${position}${year ? ` of ${year}` : ' of all time'}`}>
  <div className="favorite-badge">...</div>
</Tooltip>
```

**Usage Examples:**
```typescript
// In library grid
<GridItem
  book={book}
  favoritePosition={favorites.get(book.id)?.position}
  favoriteYear={favorites.get(book.id)?.year}
/>

// In favorites section
<FavoriteBookCard
  book={book}
  position={1}
  year="2024"
/>
// Badge automatically included in FavoriteBookCard

// Standalone
<div className="relative">
  <img src={book.image} />
  <FavoriteBadge position={1} year="all-time" size="medium" />
</div>
```

**Accessibility:**
- `aria-label="Favorite number {position}${year ? ` of ${year}` : ''}"`
- Not focusable (purely decorative indicator)
- Semantic meaning conveyed through surrounding context

---

#### `ViewModeToggle.tsx`
**Type:** Client Component
**Responsibility:** Toggle between list and covers/grid view

```typescript
interface ViewModeToggleProps {
  mode: 'list' | 'covers' | 'grid';
  onChange: (mode: 'list' | 'covers' | 'grid') => void;
  options?: ('list' | 'covers' | 'grid')[]; // Allow customizing available modes
}
```

**Features:**
- Icon-based toggle (List icon, Grid icon)
- Active state styling
- Keyboard navigation
- Persist to localStorage

**Reuse:**
- ReadingListsSection
- ReadingListDetail
- Library (already exists, can be standardized)

---

#### `Modal.tsx`
**Type:** Client Component
**Responsibility:** Base modal component

```typescript
interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  size?: 'small' | 'medium' | 'large';
  title?: string;
}
```

**Features:**
- Backdrop with click-outside to close
- Escape key to close
- Focus trap
- Scroll lock on body
- Smooth animations (Motion Primitives)
- Responsive sizing

---

#### `Dropdown.tsx`
**Type:** Client Component
**Responsibility:** Base dropdown component

```typescript
interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

**Features:**
- Keyboard navigation
- Click outside to close
- Custom styling
- Search filter (optional)
- Loading state

**Reuse:**
- YearFilterDropdown (custom styled version)
- Future dropdowns throughout app

---

#### `EmptyState.tsx`
**Type:** Client Component
**Responsibility:** Generic empty state component

```typescript
interface EmptyStateProps {
  icon: React.ComponentType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Features:**
- Consistent styling
- Optional CTA button
- Responsive layout

**Reuse:**
- EmptyReadingListsState
- EmptyReadingListState
- Library empty states (already exists)

---

## Type Definitions

### Extended `shared.types.ts`

```typescript
// Existing
export type { BookType, BookImportDataType, SearchSuggestion };

// New types for home screen and reading lists
export interface UserProfile {
  id: number;
  clerkId: string;
  email: string;
  name: string | null;
  bio: string | null;
  profileImage: string | null; // NEW - URL to profile picture
}

export interface FavoriteBook extends BookType {
  position: number; // 1-6 (UPDATED from favoriteRank)
  favoritedAt: string;
  year?: 'all-time' | number; // NEW - year context for filtering
}

export interface ReadingList {
  id: string;
  title: string;
  description: string;
  coverImages: string[]; // Top 3-4 book covers
  bookCount: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  ownerId: string;
}

export interface ReadingListBook extends BookType {
  listPosition: number; // Order in the list
  addedAt: string;
}

export interface ReadingListWithBooks extends ReadingList {
  books: ReadingListBook[];
}

export type ViewMode = 'list' | 'covers' | 'grid';

export interface YearFilterOption {
  label: string;
  value: 'all-time' | number;
}

// NEW - For favorites context/state management
export interface FavoritesSlotArray {
  slots: (FavoriteBook | null)[]; // Always length 6
  year: 'all-time' | number;
}

// NEW - For file upload responses
export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// NEW - For server action responses
export interface ActionResponse {
  success: boolean;
  error?: string;
}
```

### Database Schema Changes

**New Field Required in Book Model:**
```prisma
model Book {
  // ... existing fields
  readDate DateTime? // NEW - when user read the book

  // Add index for favorites queries
  @@index([ownerId, readDate])
}
```

**User Model Update:**
```prisma
model User {
  // ... existing fields
  profileImage String? // NEW - URL to profile picture
}
```

**Existing Schema (No Changes Needed):**
- `ReadingList` model already supports favorites via `type` enum
- `ReadingListType.FAVORITES_YEAR` and `FAVORITES_ALL` already defined
- `BookInReadingList` junction table with `position` field exists
- All required relationships already in place

**Migration Required:**
```bash
# Add readDate to Book model and profileImage to User model
npx prisma migrate dev --name add_read_date_and_profile_image
```

---

## API Routes

### Favorites API

#### `GET /api/favorites`
**Purpose:** Fetch user's favorite books with optional year filter

**Query Parameters:**
- `year?: number | 'all-time'` - Filter by year (default: 'all-time')
- `limit?: number` - Max books to return (default: 6)

**Response:**
```typescript
{
  favorites: FavoriteBook[];
  availableYears: number[]; // Years with favorites
}
```

**Authentication:** Required

---

### Reading Lists API

#### `GET /api/reading-lists`
**Purpose:** Fetch reading lists (public lists or user's lists)

**Query Parameters:**
- `userId?: string` - Filter by user (default: current user if authenticated)
- `isPublic?: boolean` - Filter by public status

**Response:**
```typescript
{
  lists: ReadingList[];
}
```

**Authentication:** Optional (returns public lists for guests)

---

#### `POST /api/reading-lists`
**Purpose:** Create a new reading list

**Body:**
```typescript
{
  title: string;
  description: string;
  isPublic: boolean;
}
```

**Response:**
```typescript
{
  list: ReadingList;
}
```

**Authentication:** Required

---

#### `GET /api/reading-lists/[id]`
**Purpose:** Fetch a reading list by ID

**Response:**
```typescript
{
  list: ReadingListWithBooks;
}
```

**Authentication:** Optional (public lists only for guests)

---

#### `PATCH /api/reading-lists/[id]`
**Purpose:** Update reading list metadata

**Body:**
```typescript
{
  title?: string;
  description?: string;
  isPublic?: boolean;
}
```

**Response:**
```typescript
{
  list: ReadingList;
}
```

**Authentication:** Required (owner only)

---

#### `DELETE /api/reading-lists/[id]`
**Purpose:** Delete a reading list

**Response:**
```typescript
{
  success: boolean;
}
```

**Authentication:** Required (owner only)

---

#### `POST /api/reading-lists/[id]/books`
**Purpose:** Add books to a reading list

**Body:**
```typescript
{
  bookIds: number[];
}
```

**Response:**
```typescript
{
  success: boolean;
  addedCount: number;
}
```

**Authentication:** Required (owner only)

---

#### `DELETE /api/reading-lists/[id]/books`
**Purpose:** Remove a book from a reading list

**Body:**
```typescript
{
  bookId: number;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

**Authentication:** Required (owner only)

---

#### `PATCH /api/reading-lists/[id]/books/reorder`
**Purpose:** Reorder books in a reading list

**Body:**
```typescript
{
  bookIds: number[]; // Ordered array of book IDs
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

**Authentication:** Required (owner only)

---

## State Management Strategy

### Server Components (Data Fetching)
Use Server Components for:
- `/app/page.tsx` - Fetch initial home screen data
- `/app/reading-lists/[id]/page.tsx` - Fetch reading list detail

**Benefits:**
- SEO-friendly
- Fast initial load
- No client-side data fetching on mount

### Client Components (Interactivity)
Use Client Components for:
- User interactions (clicks, hovers, form inputs)
- Local state management (view mode, modals)
- Real-time updates (favorites, reading lists)

### State Synchronization
- Pass server-fetched data as initial props
- Client components manage local state
- Optimistic updates for owner actions
- Revalidate server data after mutations

### localStorage Usage
Persist user preferences:
- View mode (list vs covers)
- Year filter selection
- Page size preferences

**Pattern:**
```typescript
// Load from localStorage on mount
useEffect(() => {
  const saved = localStorage.getItem('key');
  if (saved) {
    setState(saved);
  }
}, []);

// Save to localStorage on change
useEffect(() => {
  localStorage.setItem('key', state);
}, [state]);
```

---

## Authentication & Authorization

### Owner Detection
```typescript
// Server Component
const { userId } = await auth();
const isOwner = userId === content.ownerId;

// Pass to Client Component
<Component isOwner={isOwner} />
```

### Access Control

**Reading Lists:**
- Public lists: Viewable by anyone
- Private lists: Owner only
- List management: Owner only (create, edit, delete, add/remove books)

**API Routes:**
- Use Clerk's `auth()` helper to get current user
- Check ownership before mutations
- Return 401 for unauthenticated requests (protected routes)
- Return 403 for unauthorized actions (non-owner trying to edit)

**Middleware:**
- Already configured for protected routes (`/dashboard`, `/import`)
- Public routes: `/`, `/library`, `/reading-lists/[id]` (if public)

---

## Responsive Design Strategy

### Breakpoints
Using existing Tailwind breakpoints:
- `xs` (mobile): < 640px
- `sm`: 640px
- `md`: 768px (desktop transition point)
- `lg`: 1024px
- `xl`: 1280px

### Mobile-First Approach

**Home Screen:**
- ProfileBio: Full width, centered
- FavoriteBooksCarousel: Horizontal scroll
- ReadingListsSection: Single column, stacked cards

**Reading List Detail:**
- BookListView: Full width list items
- BookGridView: 2 columns

**Modals:**
- Full screen on mobile
- Centered overlay on desktop

### Desktop Enhancements

**Home Screen:**
- FavoriteBooksCarousel: Grid layout (5-6 columns)
- ReadingListsSection: 2-3 column grid
- Hover effects and overlays

**Reading List Detail:**
- BookListView: Wider layout with more metadata
- BookGridView: 4-5 columns
- Side panel for book details (similar to library)

---

## Loading & Error States

### Loading Patterns

**Skeleton Loaders:**
- BookCoverCard: Gray rectangle with pulse animation
- ReadingListCard: Title/description placeholders
- BookListItem: Row placeholders

**Spinners:**
- Modal save buttons
- Add books button
- Page transitions

**Progressive Enhancement:**
- Show initial server data immediately
- Load additional data in background
- Indicate loading with spinners/skeletons

### Error Handling

**API Errors:**
- Toast notifications for mutations (create, edit, delete)
- Inline error messages in forms
- Retry mechanisms for failed fetches

**404 States:**
- Reading list not found
- Book not found
- User not found

**Empty States:**
- No reading lists yet
- No books in list
- No favorites yet
- No search results

---

## Performance Considerations

### Image Optimization
- Use Next.js `<Image>` component for book covers
- Lazy load images below the fold
- Blur placeholder for covers
- Cache images in client (Map cache in GridItem pattern)

### Code Splitting
- Lazy load modals (EditListModal, AddBooksModal)
- Route-based splitting (already handled by Next.js)

### Data Fetching
- Server Components for initial data
- Client-side caching with SWR or TanStack Query (future)
- Optimistic updates for owner actions

### Bundle Size
- Use Lucide icons (tree-shakeable)
- Avoid large dependencies
- Monitor bundle with `next/bundle-analyzer`

---

## Accessibility

### Keyboard Navigation
- Tab through interactive elements
- Arrow keys in dropdowns
- Enter/Space to activate buttons
- Escape to close modals/dropdowns

### ARIA Labels
- `aria-label` on icon-only buttons
- `aria-pressed` for toggle buttons
- `aria-expanded` for dropdowns
- `role="button"` on clickable divs

### Focus Management
- Focus trap in modals
- Return focus after modal close
- Visible focus indicators
- Skip links for main content

### Screen Readers
- Semantic HTML (nav, main, section, article)
- Alt text for images
- Live regions for dynamic updates
- Descriptive link text

### Color Contrast
- Maintain WCAG AA standards
- Test with existing zinc palette
- Avoid color-only indicators

---

## Testing Strategy

### Unit Tests
- Component rendering
- State management logic
- Utility functions
- API route handlers

### Integration Tests
- User flows (create list, add books, reorder)
- Form submissions
- API interactions
- Authentication checks

### E2E Tests (Playwright)
- Home screen navigation
- Reading list CRUD operations
- Book management in lists
- Owner vs guest experiences

### Visual Regression Tests
- Snapshot tests for UI components
- Responsive layout tests
- Dark mode consistency

---

## Migration Considerations

### Phase 2 Context
- Ongoing migration from Material-UI to Tailwind CSS v4
- Using Motion Primitives for animations
- Consistent with library components already migrated

### Styling Approach
- Tailwind utility classes (already in use)
- class-variance-authority for variants
- Avoid Material-UI components
- Use existing zinc color palette

### Component Consistency
- Follow patterns from library components
- Reuse existing GridItem/GridView patterns
- Maintain consistent spacing and typography
- Use Geist fonts (Sans and Mono)

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

**Priority:** Shared UI components and type definitions

1. **Type Definitions** (4 hours)
   - Extend `shared.types.ts` with reading list types
   - Define all component prop interfaces
   - Export types for API responses

2. **Shared UI Components** (8 hours)
   - BookCoverCard (extend GridItem)
   - ViewModeToggle (standardize existing)
   - Modal base component
   - Dropdown base component
   - EmptyState base component
   - BackButton component

3. **Database Schema** (4 hours)
   - Add ReadingList table to Prisma schema
   - Add ReadingListBook join table
   - Add Favorite table (if not exists)
   - Run migrations

**Dependencies:** None (can start immediately)
**Complexity:** Medium (standardizing existing patterns)

---

### Phase 2: API Layer (Week 1-2)

**Priority:** Backend routes for data fetching and mutations

4. **Favorites API** (4 hours)
   - `GET /api/favorites` with year filter
   - Return available years
   - Authentication and ownership checks

5. **Reading Lists API** (12 hours)
   - `GET /api/reading-lists` (list all)
   - `POST /api/reading-lists` (create)
   - `GET /api/reading-lists/[id]` (detail)
   - `PATCH /api/reading-lists/[id]` (update)
   - `DELETE /api/reading-lists/[id]` (delete)
   - Authentication and authorization

6. **Reading List Books API** (8 hours)
   - `POST /api/reading-lists/[id]/books` (add books)
   - `DELETE /api/reading-lists/[id]/books` (remove book)
   - `PATCH /api/reading-lists/[id]/books/reorder` (reorder)

**Dependencies:** Phase 1 (database schema)
**Complexity:** High (authentication, authorization, data relationships)

---

### Phase 3: Home Screen (Week 2-3)

**Priority:** Public-facing home screen components

7. **Profile Bio** (4 hours)
   - ProfileBio component
   - Fetch user profile data
   - Responsive layout

8. **Favorite Books Section** (12 hours)
   - FavoriteBooksSection container
   - FavoriteBooksHeader
   - YearFilterDropdown (custom dropdown)
   - FavoriteBooksCarousel
   - Horizontal scroll on mobile, grid on desktop
   - Integration with Favorites API

9. **Reading Lists Section** (16 hours)
   - ReadingListsSection container
   - ReadingListsHeader with create button
   - ViewModeToggle integration
   - ReadingListGrid
   - ReadingListCard (list and covers modes)
   - ListCoverPreview
   - ListMetadata
   - EmptyReadingListsState
   - Integration with Reading Lists API

10. **Home Page Integration** (4 hours)
    - Update `/app/page.tsx` as Server Component
    - Fetch initial data
    - Owner detection
    - HomeScreen component assembly

**Dependencies:** Phase 1 (shared components), Phase 2 (API routes)
**Complexity:** Medium-High (complex layouts, responsiveness)

---

### Phase 4: Reading List Detail (Week 3-4)

**Priority:** Detailed view and management

11. **Reading List Header** (8 hours)
    - ReadingListHeader component
    - BackButton integration
    - ViewModeToggle
    - Edit and Add Books buttons (owner only)

12. **Book Display Views** (16 hours)
    - BookListView with drag-and-drop
    - BookListItem with remove button
    - DragHandle component
    - BookGridView
    - Integration with BookCoverCard
    - Remove functionality in grid view

13. **Management Modals** (16 hours)
    - EditListModal (title, description)
    - AddBooksModal with search
    - BookSearch component
    - SearchResults component
    - Form validation and error handling
    - Optimistic updates

14. **Detail Page Integration** (4 hours)
    - Update `/app/reading-lists/[id]/page.tsx`
    - Fetch reading list and books
    - Access control (public vs private)
    - ReadingListDetail component assembly

**Dependencies:** Phase 1-3
**Complexity:** High (drag-and-drop, modals, complex interactions)

---

### Phase 5: Polish & Testing (Week 4-5)

**Priority:** Refinement and quality assurance

15. **Responsive Testing** (8 hours)
    - Test all breakpoints
    - Mobile interactions (scroll, touch)
    - Desktop hover states
    - Tablet layouts

16. **Accessibility Audit** (8 hours)
    - Keyboard navigation testing
    - Screen reader testing
    - ARIA labels and roles
    - Focus management
    - Color contrast verification

17. **Performance Optimization** (8 hours)
    - Image optimization
    - Bundle size analysis
    - Loading state improvements
    - Caching strategy

18. **Testing** (16 hours)
    - Unit tests for components
    - Integration tests for flows
    - E2E tests for critical paths
    - Visual regression tests

19. **Documentation** (4 hours)
    - Component API documentation
    - Storybook stories
    - Usage examples
    - Integration guide

**Dependencies:** Phase 1-4
**Complexity:** Medium (refinement and testing)

---

## Implementation Order Summary

**Can be built independently:**
- Shared UI components (Phase 1)
- API routes (Phase 2, after database)
- Individual home screen sections (Phase 3)

**Must be built sequentially:**
1. Database schema
2. API routes
3. UI components (depends on types and data)
4. Integration (depends on all pieces)

**Suggested Start Points:**
1. Database schema + type definitions (parallel)
2. Shared UI components (parallel with API)
3. API routes (after database)
4. Home screen components (after API + shared UI)
5. Reading list detail (after home screen)

---

## Integration Points

### With Existing Features

**Library Integration:**
- Reuse BookCoverCard (evolved from GridItem)
- Reuse ViewModeToggle pattern
- Share search functionality in AddBooksModal
- Link to book detail from cards

**Authentication:**
- Use Clerk's `auth()` for server components
- Use `useUser()` for client components
- Middleware already configured for protected routes

**Navigation:**
- Header links to home (`/`)
- Reading list cards link to detail (`/reading-lists/[id]`)
- Book cards link to detail (existing `/books/[id]` or library)

### Backend Requirements

**Database Schema:**
```prisma
model ReadingList {
  id          String   @id @default(cuid())
  title       String
  description String
  isPublic    Boolean  @default(true)
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [clerkId])
  books       ReadingListBook[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ReadingListBook {
  id            Int          @id @default(autoincrement())
  readingListId String
  bookId        Int
  listPosition  Int          // Order in the list
  addedAt       DateTime     @default(now())
  readingList   ReadingList  @relation(fields: [readingListId], references: [id], onDelete: Cascade)
  book          Book         @relation(fields: [bookId], references: [id])

  @@unique([readingListId, bookId])
  @@index([readingListId, listPosition])
}

model Favorite {
  id           Int      @id @default(autoincrement())
  userId       String
  bookId       Int
  favoriteRank Int      // 1-10 ranking
  year         Int?     // Year favorited (optional)
  favoritedAt  DateTime @default(now())
  user         User     @relation(fields: [userId], references: [clerkId])
  book         Book     @relation(fields: [bookId], references: [id])

  @@unique([userId, bookId])
  @@index([userId, year])
}
```

**API Authentication:**
- All mutation routes require authentication
- Read routes for public lists are open
- Owner-only routes check `userId === ownerId`

---

## Risks & Considerations

### Technical Risks

**Drag-and-Drop Complexity:**
- Implementing smooth drag-and-drop can be complex
- Consider using `@dnd-kit/core` library
- Ensure accessibility (keyboard reordering)

**Image Loading Performance:**
- Many book covers on home screen
- Use lazy loading and intersection observer
- Consider blur placeholders

**State Synchronization:**
- Optimistic updates can get out of sync
- Implement proper error handling and rollback
- Consider using SWR or TanStack Query for caching

### UX Considerations

**Empty States:**
- Critical for first-time users
- Must clearly guide to creating content
- Different messages for owners vs guests

**Mobile Experience:**
- Horizontal scroll must be smooth
- Touch targets must be large enough
- Modals should be full-screen

**Performance:**
- Home screen must load quickly
- Consider pagination for reading lists (if many)
- Skeleton loaders for perceived performance

### Future Enhancements

**Not in Scope (but considered):**
- Collaborative reading lists (shared editing)
- Comments on reading lists
- Following other users' lists
- Reading list categories/tags
- List visibility: FRIENDS and UNLISTED modes
- Reading list analytics (most popular books)
- Export reading list (PDF, CSV)

---

## Success Metrics

### Technical Metrics
- Home screen load time < 2s
- API response times < 500ms
- Zero accessibility violations (WCAG AA)
- 85%+ test coverage
- Mobile responsiveness at all breakpoints

### User Experience Metrics
- Clear owner vs guest experiences
- Smooth interactions (drag-and-drop, modals)
- Intuitive navigation
- Helpful empty states
- Fast perceived performance

---

## Conclusion

This component architecture provides:

1. **Clear Separation of Concerns:**
   - Server Components for data fetching
   - Client Components for interactivity
   - Shared UI components for consistency

2. **Scalability:**
   - Modular component design
   - Reusable patterns
   - Clear API contracts

3. **Maintainability:**
   - Type-safe interfaces
   - Consistent naming conventions
   - Well-documented responsibilities

4. **User Experience:**
   - Responsive design
   - Accessible interfaces
   - Smooth interactions
   - Clear owner/guest experiences

5. **Migration Compatibility:**
   - Consistent with Tailwind CSS v4 migration
   - Uses Motion Primitives
   - Follows existing patterns from library components

**Next Steps:**
1. Review and approve architecture plan
2. Create detailed task breakdown for each phase
3. Set up development environment
4. Begin Phase 1 implementation
5. Iterate based on feedback

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Author:** Frontend Developer (Penumbra)
**Status:** Planning Phase
