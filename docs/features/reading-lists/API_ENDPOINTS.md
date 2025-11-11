# Reading Lists API Endpoints Specification

## Overview

This document specifies all API endpoints required for Reading Lists and Favorites functionality in Penumbra. Following the existing pattern of Server Actions in Next.js, these will be implemented in `/src/utils/actions/reading-lists.ts`.

## Architecture Pattern

Penumbra uses **Next.js Server Actions** rather than traditional REST API routes. Server Actions are:
- Marked with `"use server"` directive
- Called directly from React components
- Automatically handle serialization
- Type-safe with TypeScript
- Integrated with Clerk authentication

**File Structure**:
```
/src/utils/actions/
├── books.ts              # Existing book operations
├── filters.ts            # Existing filter operations
└── reading-lists.ts      # NEW: Reading list operations
```

## Authentication & Authorization

### Standard Pattern (from existing codebase)

All operations use Clerk authentication via `getCurrentUser()` and `getCurrentUserId()`:

```typescript
import { getCurrentUser, requireAuth } from "@/utils/permissions";

export async function someAction() {
  const user = await getCurrentUser(); // Throws if not authenticated
  // ... operation with user.id
}
```

### Authorization Rules

| Operation | Rule |
|-----------|------|
| Create list | Authenticated user only |
| Read own list | Owner always |
| Read public list | Anyone (future feature) |
| Update list | Owner only |
| Delete list | Owner only |
| Add book to list | List owner only |
| Remove book from list | List owner only |
| Reorder books | List owner only |

## Data Types & Validation

### TypeScript Types (add to `src/shared.types.ts`)

```typescript
import { ReadingListVisibility, ReadingListType } from "@prisma/client";

// Full reading list with books
export type ReadingListWithBooksType = {
  id: number;
  title: string;
  description: string | null;
  visibility: ReadingListVisibility;
  type: ReadingListType;
  year: string | null;
  createdAt: Date;
  updatedAt: Date;
  bookCount: number;
  books: BookInListType[];
};

// Book entry within a reading list
export type BookInListType = {
  id: number;
  position: number;
  notes: string | null;
  addedAt: Date;
  book: {
    id: number;
    title: string;
    authors: string[];
    image: string;
    synopsis: string;
    isbn13: string;
  };
};

// Summary of a reading list (without books)
export type ReadingListSummaryType = {
  id: number;
  title: string;
  description: string | null;
  visibility: ReadingListVisibility;
  type: ReadingListType;
  year: string | null;
  bookCount: number;
  createdAt: Date;
  updatedAt: Date;
};

// Input for creating a reading list
export type CreateReadingListInput = {
  title: string;
  description?: string;
  visibility?: ReadingListVisibility;
  type?: ReadingListType;
  year?: string;
};

// Input for updating a reading list
export type UpdateReadingListInput = {
  title?: string;
  description?: string;
  visibility?: ReadingListVisibility;
};

// Input for adding a book to a list
export type AddBookToListInput = {
  readingListId: number;
  bookId: number;
  notes?: string;
  position?: number; // Optional: specify position, otherwise appends
};

// Input for reordering books
export type ReorderBooksInput = {
  readingListId: number;
  bookOrders: Array<{
    bookInListId: number;
    position: number;
  }>;
};
```

### Validation Rules

```typescript
// Validation constants
export const READING_LIST_VALIDATION = {
  TITLE_MAX_LENGTH: 200,
  TITLE_MIN_LENGTH: 1,
  DESCRIPTION_MAX_LENGTH: 5000,
  NOTES_MAX_LENGTH: 1000,
  FAVORITES_MAX_BOOKS: 6,
  YEAR_MIN: 1900,
  YEAR_MAX: 2100,
  YEAR_REGEX: /^\d{4}$/,
};
```

## Server Actions

### Reading List CRUD Operations

#### 1. Create Reading List

**Action**: `createReadingList`

**Purpose**: Create a new reading list (standard or favorites)

**Input**:
```typescript
{
  title: string;        // Required, 1-200 chars
  description?: string; // Optional, max 5000 chars
  visibility?: ReadingListVisibility; // Default: PRIVATE
  type?: ReadingListType;            // Default: STANDARD
  year?: string;        // Required if type is FAVORITES_YEAR
}
```

**Output**:
```typescript
{
  success: boolean;
  list?: ReadingListSummaryType;
  error?: string;
}
```

**Validation**:
- Title: Required, 1-200 characters
- Description: Max 5000 characters if provided
- Year: Required for FAVORITES_YEAR, format YYYY, 1900-2100
- FAVORITES_ALL: Only one per user (check before creation)
- FAVORITES_YEAR: Only one per user per year (check before creation)

**Authorization**: Authenticated user only

**Implementation Notes**:
```typescript
export async function createReadingList(input: CreateReadingListInput) {
  const user = await getCurrentUser();

  // Validate title
  if (!input.title || input.title.length > 200) {
    return { success: false, error: "Invalid title" };
  }

  // If FAVORITES_ALL, check uniqueness
  if (input.type === "FAVORITES_ALL") {
    const existing = await prisma.readingList.findFirst({
      where: { ownerId: user.id, type: "FAVORITES_ALL" }
    });
    if (existing) {
      return { success: false, error: "You already have a favorites list" };
    }
  }

  // If FAVORITES_YEAR, check year and uniqueness
  if (input.type === "FAVORITES_YEAR") {
    if (!input.year || !/^\d{4}$/.test(input.year)) {
      return { success: false, error: "Invalid year format" };
    }
    const existing = await prisma.readingList.findFirst({
      where: {
        ownerId: user.id,
        type: "FAVORITES_YEAR",
        year: input.year
      }
    });
    if (existing) {
      return {
        success: false,
        error: `You already have a favorites list for ${input.year}`
      };
    }
  }

  // Create list
  const list = await prisma.readingList.create({
    data: {
      ownerId: user.id,
      title: input.title,
      description: input.description,
      visibility: input.visibility ?? "PRIVATE",
      type: input.type ?? "STANDARD",
      year: input.year
    }
  });

  return { success: true, list };
}
```

---

#### 2. Fetch User's Reading Lists

**Action**: `fetchUserReadingLists`

**Purpose**: Get all reading lists for the current user

**Input**: None (uses authenticated user)

**Output**:
```typescript
{
  success: boolean;
  lists?: ReadingListSummaryType[];
  error?: string;
}
```

**Features**:
- Returns lists ordered by most recently updated
- Includes book count for each list
- Includes all list types (STANDARD, FAVORITES_YEAR, FAVORITES_ALL)

**Authorization**: Authenticated user only (returns own lists)

**Implementation Notes**:
```typescript
export async function fetchUserReadingLists() {
  const user = await getCurrentUser();

  const lists = await prisma.readingList.findMany({
    where: { ownerId: user.id },
    include: {
      books: {
        select: { id: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  // Transform to include book count
  const listsWithCount = lists.map(list => ({
    id: list.id,
    title: list.title,
    description: list.description,
    visibility: list.visibility,
    type: list.type,
    year: list.year,
    bookCount: list.books.length,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt
  }));

  return { success: true, lists: listsWithCount };
}
```

---

#### 3. Fetch Single Reading List

**Action**: `fetchReadingList`

**Purpose**: Get a specific reading list with all books (ordered)

**Input**:
```typescript
{
  listId: number;
}
```

**Output**:
```typescript
{
  success: boolean;
  list?: ReadingListWithBooksType;
  error?: string;
}
```

**Features**:
- Returns list with all books ordered by position
- Includes book metadata (title, authors, image, synopsis)
- Includes notes and addedAt for each book

**Authorization**: List owner only (future: public lists visible to all)

**Implementation Notes**:
```typescript
export async function fetchReadingList(listId: number) {
  const user = await getCurrentUser();

  const list = await prisma.readingList.findUnique({
    where: { id: listId },
    include: {
      books: {
        include: {
          book: {
            select: {
              id: true,
              title: true,
              authors: true,
              image: true,
              synopsis: true,
              isbn13: true
            }
          }
        },
        orderBy: { position: "asc" }
      }
    }
  });

  if (!list) {
    return { success: false, error: "Reading list not found" };
  }

  // Authorization check
  if (list.ownerId !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Transform to expected format
  const listWithBooks = {
    ...list,
    bookCount: list.books.length,
    books: list.books.map(entry => ({
      id: entry.id,
      position: entry.position,
      notes: entry.notes,
      addedAt: entry.addedAt,
      book: entry.book
    }))
  };

  return { success: true, list: listWithBooks };
}
```

---

#### 4. Update Reading List

**Action**: `updateReadingList`

**Purpose**: Update reading list metadata (title, description, visibility)

**Input**:
```typescript
{
  listId: number;
  title?: string;
  description?: string;
  visibility?: ReadingListVisibility;
}
```

**Output**:
```typescript
{
  success: boolean;
  list?: ReadingListSummaryType;
  error?: string;
}
```

**Validation**:
- Title: 1-200 characters if provided
- Description: Max 5000 characters if provided
- Cannot change type or year (immutable after creation)

**Authorization**: List owner only

**Implementation Notes**:
```typescript
export async function updateReadingList(
  listId: number,
  input: UpdateReadingListInput
) {
  const user = await getCurrentUser();

  // Verify ownership
  const existing = await prisma.readingList.findUnique({
    where: { id: listId }
  });

  if (!existing) {
    return { success: false, error: "Reading list not found" };
  }

  if (existing.ownerId !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate input
  if (input.title && (input.title.length === 0 || input.title.length > 200)) {
    return { success: false, error: "Invalid title" };
  }

  // Update list
  const updated = await prisma.readingList.update({
    where: { id: listId },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.visibility && { visibility: input.visibility })
    }
  });

  return { success: true, list: updated };
}
```

---

#### 5. Delete Reading List

**Action**: `deleteReadingList`

**Purpose**: Delete a reading list (cascade deletes all book entries)

**Input**:
```typescript
{
  listId: number;
}
```

**Output**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**Authorization**: List owner only

**Implementation Notes**:
```typescript
export async function deleteReadingList(listId: number) {
  const user = await getCurrentUser();

  // Verify ownership
  const existing = await prisma.readingList.findUnique({
    where: { id: listId }
  });

  if (!existing) {
    return { success: false, error: "Reading list not found" };
  }

  if (existing.ownerId !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Delete list (cascade deletes BookInReadingList entries)
  await prisma.readingList.delete({
    where: { id: listId }
  });

  return { success: true };
}
```

---

### Book Management in Lists

#### 6. Add Book to Reading List

**Action**: `addBookToReadingList`

**Purpose**: Add a book to a reading list with optional notes and position

**Input**:
```typescript
{
  readingListId: number;
  bookId: number;
  notes?: string;      // Optional, max 1000 chars
  position?: number;   // Optional, defaults to end of list
}
```

**Output**:
```typescript
{
  success: boolean;
  entry?: BookInListType;
  error?: string;
}
```

**Validation**:
- Book must exist and belong to user
- Book cannot already be in the list (enforced by unique constraint)
- Notes: Max 1000 characters if provided
- Favorites lists: Max 6 books
- Position: Must be positive integer if provided

**Authorization**: List owner only

**Implementation Notes**:
```typescript
export async function addBookToReadingList(input: AddBookToListInput) {
  const user = await getCurrentUser();

  // Verify list ownership
  const list = await prisma.readingList.findUnique({
    where: { id: input.readingListId },
    include: { books: true }
  });

  if (!list) {
    return { success: false, error: "Reading list not found" };
  }

  if (list.ownerId !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify book ownership
  const book = await prisma.book.findUnique({
    where: { id: input.bookId }
  });

  if (!book || book.ownerId !== user.id) {
    return { success: false, error: "Book not found" };
  }

  // Check favorites limit
  if (list.type !== "STANDARD" && list.books.length >= 6) {
    return {
      success: false,
      error: "Favorites lists can only contain 5-6 books"
    };
  }

  // Determine position
  let position = input.position;
  if (!position) {
    const maxPosition = await prisma.bookInReadingList.findFirst({
      where: { readingListId: input.readingListId },
      orderBy: { position: "desc" },
      select: { position: true }
    });
    position = (maxPosition?.position ?? 0) + 100;
  }

  // Add book to list
  try {
    const entry = await prisma.bookInReadingList.create({
      data: {
        bookId: input.bookId,
        readingListId: input.readingListId,
        position: position,
        notes: input.notes
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            authors: true,
            image: true,
            synopsis: true,
            isbn13: true
          }
        }
      }
    });

    return { success: true, entry };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "Book already in this list" };
    }
    throw error;
  }
}
```

---

#### 7. Remove Book from Reading List

**Action**: `removeBookFromReadingList`

**Purpose**: Remove a book from a reading list

**Input**:
```typescript
{
  readingListId: number;
  bookId: number;
}
```

**Output**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**Authorization**: List owner only

**Implementation Notes**:
```typescript
export async function removeBookFromReadingList(
  readingListId: number,
  bookId: number
) {
  const user = await getCurrentUser();

  // Verify list ownership
  const list = await prisma.readingList.findUnique({
    where: { id: readingListId }
  });

  if (!list) {
    return { success: false, error: "Reading list not found" };
  }

  if (list.ownerId !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Remove book from list
  try {
    await prisma.bookInReadingList.delete({
      where: {
        bookId_readingListId: {
          bookId: bookId,
          readingListId: readingListId
        }
      }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Book not found in list" };
  }
}
```

---

#### 8. Update Book Notes in List

**Action**: `updateBookNotesInList`

**Purpose**: Update or set notes for a book in a specific list

**Input**:
```typescript
{
  readingListId: number;
  bookId: number;
  notes: string | null; // null to clear notes
}
```

**Output**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**Validation**:
- Notes: Max 1000 characters if provided

**Authorization**: List owner only

**Implementation Notes**:
```typescript
export async function updateBookNotesInList(
  readingListId: number,
  bookId: number,
  notes: string | null
) {
  const user = await getCurrentUser();

  // Verify list ownership
  const list = await prisma.readingList.findUnique({
    where: { id: readingListId }
  });

  if (!list) {
    return { success: false, error: "Reading list not found" };
  }

  if (list.ownerId !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate notes length
  if (notes && notes.length > 1000) {
    return { success: false, error: "Notes too long (max 1000 characters)" };
  }

  // Update notes
  try {
    await prisma.bookInReadingList.update({
      where: {
        bookId_readingListId: {
          bookId: bookId,
          readingListId: readingListId
        }
      },
      data: { notes }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Book not found in list" };
  }
}
```

---

#### 9. Reorder Books in List

**Action**: `reorderBooksInList`

**Purpose**: Update positions of multiple books in a list (drag-and-drop support)

**Input**:
```typescript
{
  readingListId: number;
  bookOrders: Array<{
    bookInListId: number;
    position: number;
  }>;
}
```

**Output**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**Validation**:
- All bookInListId must belong to the specified list
- All positions must be positive integers

**Authorization**: List owner only

**Implementation Notes**:
```typescript
export async function reorderBooksInList(input: ReorderBooksInput) {
  const user = await getCurrentUser();

  // Verify list ownership
  const list = await prisma.readingList.findUnique({
    where: { id: input.readingListId }
  });

  if (!list) {
    return { success: false, error: "Reading list not found" };
  }

  if (list.ownerId !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Update positions in transaction
  try {
    await prisma.$transaction(
      input.bookOrders.map(order =>
        prisma.bookInReadingList.update({
          where: { id: order.bookInListId },
          data: { position: order.position }
        })
      )
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to reorder books" };
  }
}
```

---

### Favorites-Specific Operations

#### 10. Fetch Favorites (All Time)

**Action**: `fetchFavoritesAllTime`

**Purpose**: Get user's all-time favorites list

**Input**: None (uses authenticated user)

**Output**:
```typescript
{
  success: boolean;
  list?: ReadingListWithBooksType | null;
  error?: string;
}
```

**Features**:
- Returns null if user hasn't created favorites list yet
- Auto-creates if `createIfNotExists: true` parameter passed

**Authorization**: Authenticated user only (returns own favorites)

**Implementation Notes**:
```typescript
export async function fetchFavoritesAllTime(createIfNotExists = false) {
  const user = await getCurrentUser();

  let list = await prisma.readingList.findFirst({
    where: {
      ownerId: user.id,
      type: "FAVORITES_ALL"
    },
    include: {
      books: {
        include: {
          book: {
            select: {
              id: true,
              title: true,
              authors: true,
              image: true,
              synopsis: true,
              isbn13: true
            }
          }
        },
        orderBy: { position: "asc" }
      }
    }
  });

  // Auto-create if requested and doesn't exist
  if (!list && createIfNotExists) {
    list = await prisma.readingList.create({
      data: {
        ownerId: user.id,
        title: "Favorite Books of All Time",
        visibility: "PUBLIC",
        type: "FAVORITES_ALL"
      },
      include: {
        books: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                authors: true,
                image: true,
                synopsis: true,
                isbn13: true
              }
            }
          },
          orderBy: { position: "asc" }
        }
      }
    });
  }

  return { success: true, list };
}
```

---

#### 11. Fetch Favorites by Year

**Action**: `fetchFavoritesByYear`

**Purpose**: Get user's favorites for a specific year (optionally filtered by read date)

**Input**:
```typescript
{
  year: string; // Format: "2024"
  filterByReadDate?: boolean; // If true, only include books read in that year
}
```

**Output**:
```typescript
{
  success: boolean;
  list?: ReadingListWithBooksType | null;
  error?: string;
}
```

**Features**:
- Returns null if user hasn't created favorites for that year
- Auto-creates if `createIfNotExists: true` parameter passed
- Can filter to only show books with readDate in specified year

**Validation**:
- Year: Format YYYY, 1900-2100

**Authorization**: Authenticated user only (returns own favorites)

**Implementation Notes**:
```typescript
export async function fetchFavoritesByYear(
  year: string,
  createIfNotExists = false,
  filterByReadDate = false
) {
  const user = await getCurrentUser();

  // Validate year format
  if (!/^\d{4}$/.test(year)) {
    return { success: false, error: "Invalid year format" };
  }

  // Build filter for read date if requested
  const bookFilter = filterByReadDate ? {
    book: {
      readDate: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`)
      }
    }
  } : {};

  let list = await prisma.readingList.findFirst({
    where: {
      ownerId: user.id,
      type: "FAVORITES_YEAR",
      year: year
    },
    include: {
      books: {
        where: bookFilter,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              authors: true,
              image: true,
              synopsis: true,
              isbn13: true,
              readDate: true
            }
          }
        },
        orderBy: { position: "asc" }
      }
    }
  });

  // Auto-create if requested and doesn't exist
  if (!list && createIfNotExists) {
    list = await prisma.readingList.create({
      data: {
        ownerId: user.id,
        title: `Favorite Books of ${year}`,
        visibility: "PUBLIC",
        type: "FAVORITES_YEAR",
        year: year
      },
      include: {
        books: {
          where: bookFilter,
          include: {
            book: {
              select: {
                id: true,
                title: true,
                authors: true,
                image: true,
                synopsis: true,
                isbn13: true,
                readDate: true
              }
            }
          },
          orderBy: { position: "asc" }
        }
      }
    });
  }

  return { success: true, list };
}
```

---

#### 12. Fetch All Favorites Years

**Action**: `fetchAllFavoritesYears`

**Purpose**: Get all years for which user has created favorites lists

**Input**: None (uses authenticated user)

**Output**:
```typescript
{
  success: boolean;
  years?: string[];
  error?: string;
}
```

**Features**:
- Returns array of years in descending order
- Used for UI navigation (year picker dropdown)

**Authorization**: Authenticated user only

**Implementation Notes**:
```typescript
export async function fetchAllFavoritesYears() {
  const user = await getCurrentUser();

  const lists = await prisma.readingList.findMany({
    where: {
      ownerId: user.id,
      type: "FAVORITES_YEAR"
    },
    select: { year: true },
    orderBy: { year: "desc" }
  });

  const years = lists
    .map(list => list.year)
    .filter((year): year is string => year !== null);

  return { success: true, years };
}
```

---

### Book Read Date Operations

#### 15. Update Book Read Date

**Action**: `updateBookReadDate`

**Purpose**: Set or update when the user read a book

**Input**:
```typescript
{
  bookId: number;
  readDate: Date | null; // null to clear read date
}
```

**Output**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**Validation**:
- Read date must be in the past (cannot be future date)
- Read date must be after January 1, 1900
- Book must belong to authenticated user

**Authorization**: Book owner only

**Implementation Notes**:
```typescript
export async function updateBookReadDate(
  bookId: number,
  readDate: Date | null
) {
  const user = await getCurrentUser();

  // Verify book ownership
  const book = await prisma.book.findUnique({
    where: { id: bookId }
  });

  if (!book) {
    return { success: false, error: "Book not found" };
  }

  if (book.ownerId !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate read date
  if (readDate) {
    const now = new Date();
    const minDate = new Date('1900-01-01');

    if (readDate > now) {
      return { success: false, error: "Read date cannot be in the future" };
    }

    if (readDate < minDate) {
      return { success: false, error: "Read date must be after 1900" };
    }
  }

  // Update read date
  await prisma.book.update({
    where: { id: bookId },
    data: { readDate }
  });

  return { success: true };
}
```

---

#### 16. Fetch Books Read in Year

**Action**: `fetchBooksReadInYear`

**Purpose**: Get all books user read in a specific year

**Input**:
```typescript
{
  year: string; // Format: "2024"
}
```

**Output**:
```typescript
{
  success: boolean;
  books?: Array<{
    id: number;
    title: string;
    authors: string[];
    image: string;
    readDate: Date;
    synopsis: string;
  }>;
  error?: string;
}
```

**Validation**:
- Year: Format YYYY, 1900-2100

**Authorization**: Authenticated user only (returns own books)

**Implementation Notes**:
```typescript
export async function fetchBooksReadInYear(year: string) {
  const user = await getCurrentUser();

  // Validate year format
  if (!/^\d{4}$/.test(year)) {
    return { success: false, error: "Invalid year format" };
  }

  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

  const books = await prisma.book.findMany({
    where: {
      ownerId: user.id,
      readDate: {
        gte: startOfYear,
        lte: endOfYear
      }
    },
    select: {
      id: true,
      title: true,
      authors: true,
      image: true,
      readDate: true,
      synopsis: true,
      isbn13: true
    },
    orderBy: { readDate: 'desc' }
  });

  return { success: true, books };
}
```

---

### Profile Operations

#### 17. Upload Profile Image

**Action**: `uploadProfileImage`

**Purpose**: Upload and set user's profile picture

**Input**:
```typescript
{
  file: File; // Image file (JPEG, PNG, WebP)
}
```

**Output**:
```typescript
{
  success: boolean;
  profileImageUrl?: string;
  error?: string;
}
```

**Validation**:
- File type: JPEG, PNG, or WebP only
- File size: Max 5MB
- Image dimensions: Recommended 400x400px (will be resized if larger)

**Authorization**: Authenticated user only

**Implementation Notes**:
```typescript
import { put, del } from '@vercel/blob';

export async function uploadProfileImage(formData: FormData) {
  const user = await getCurrentUser();
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed"
    };
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { success: false, error: "File too large. Maximum size is 5MB" };
  }

  try {
    // Delete old profile image if exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { profileImageUrl: true }
    });

    if (existingUser?.profileImageUrl) {
      try {
        await del(existingUser.profileImageUrl);
      } catch (err) {
        // Log error but continue (old file might not exist)
        console.warn("Failed to delete old profile image:", err);
      }
    }

    // Upload new image to Vercel Blob
    const blob = await put(`users/${user.id}/profile.${file.type.split('/')[1]}`, file, {
      access: 'public',
      addRandomSuffix: false
    });

    // Update user's profile image URL
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrl: blob.url }
    });

    return { success: true, profileImageUrl: blob.url };
  } catch (error) {
    console.error("Profile image upload error:", error);
    return { success: false, error: "Failed to upload profile image" };
  }
}
```

---

#### 18. Delete Profile Image

**Action**: `deleteProfileImage`

**Purpose**: Remove user's profile picture and revert to default

**Input**: None (uses authenticated user)

**Output**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**Authorization**: Authenticated user only

**Implementation Notes**:
```typescript
import { del } from '@vercel/blob';

export async function deleteProfileImage() {
  const user = await getCurrentUser();

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { profileImageUrl: true }
  });

  if (!existingUser?.profileImageUrl) {
    return { success: false, error: "No profile image to delete" };
  }

  try {
    // Delete from Vercel Blob
    await del(existingUser.profileImageUrl);

    // Clear profile image URL in database
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrl: null }
    });

    return { success: true };
  } catch (error) {
    console.error("Profile image deletion error:", error);
    return { success: false, error: "Failed to delete profile image" };
  }
}
```

---

### Utility Operations

#### 19. Fetch Lists Containing Book

**Action**: `fetchListsContainingBook`

**Purpose**: Get all reading lists that contain a specific book

**Input**:
```typescript
{
  bookId: number;
}
```

**Output**:
```typescript
{
  success: boolean;
  lists?: Array<{
    id: number;
    title: string;
    type: ReadingListType;
    visibility: ReadingListVisibility;
  }>;
  error?: string;
}
```

**Features**:
- Used in book detail view to show which lists contain the book
- Used before deleting a book to warn user

**Authorization**: Authenticated user only (returns own lists)

**Implementation Notes**:
```typescript
export async function fetchListsContainingBook(bookId: number) {
  const user = await getCurrentUser();

  const entries = await prisma.bookInReadingList.findMany({
    where: {
      bookId: bookId,
      readingList: { ownerId: user.id }
    },
    include: {
      readingList: {
        select: {
          id: true,
          title: true,
          type: true,
          visibility: true
        }
      }
    }
  });

  const lists = entries.map(entry => entry.readingList);

  return { success: true, lists };
}
```

---

#### 20. Check Book in List

**Action**: `checkBookInList`

**Purpose**: Check if a book is already in a specific reading list

**Input**:
```typescript
{
  readingListId: number;
  bookId: number;
}
```

**Output**:
```typescript
{
  success: boolean;
  inList: boolean;
  error?: string;
}
```

**Features**:
- Used for UI state (disable "Add to list" button if already added)
- Fast query using unique index

**Authorization**: No authorization check (read-only, returns boolean)

**Implementation Notes**:
```typescript
export async function checkBookInList(readingListId: number, bookId: number) {
  const exists = await prisma.bookInReadingList.findUnique({
    where: {
      bookId_readingListId: {
        bookId: bookId,
        readingListId: readingListId
      }
    }
  });

  return { success: true, inList: !!exists };
}
```

---

## Error Handling

### Standard Error Response Format

All actions return a consistent response shape:

```typescript
type ActionResponse<T> = {
  success: boolean;
  data?: T;         // Present if success: true
  error?: string;   // Present if success: false
};
```

### Error Types

1. **Authentication Errors**:
   - `User not authenticated` - No active session
   - `User not found in database` - Clerk user not synced

2. **Authorization Errors**:
   - `Unauthorized` - User doesn't own the resource
   - `Unauthorized: You don't own this reading list`
   - `Unauthorized: You don't own this book`

3. **Validation Errors**:
   - `Invalid title` - Title length validation failed
   - `Invalid year format` - Year doesn't match YYYY pattern
   - `Notes too long (max 1000 characters)`
   - `Favorites lists can only contain 5-6 books`

4. **Constraint Errors**:
   - `Book already in this list` - Unique constraint violation
   - `You already have a favorites list` - FAVORITES_ALL exists
   - `You already have a favorites list for {year}` - FAVORITES_YEAR exists

5. **Not Found Errors**:
   - `Reading list not found`
   - `Book not found`
   - `Book not found in list`

### Error Handling Pattern

```typescript
try {
  // ... operation
  return { success: true, data: result };
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return { success: false, error: "Unique constraint violation" };
    }
    if (error.code === "P2025") {
      return { success: false, error: "Record not found" };
    }
  }

  console.error("Unexpected error:", error);
  return { success: false, error: "An unexpected error occurred" };
}
```

## Performance Optimization

### Query Optimization Strategies

1. **Use `include` for Related Data**:
   ```typescript
   // Good: Single query with join
   const list = await prisma.readingList.findUnique({
     where: { id },
     include: { books: { include: { book: true } } }
   });
   ```

2. **Select Only Needed Fields**:
   ```typescript
   // Good: Reduce data transfer
   const lists = await prisma.readingList.findMany({
     select: {
       id: true,
       title: true,
       bookCount: true
     }
   });
   ```

3. **Batch Operations**:
   ```typescript
   // Good: Single transaction
   await prisma.$transaction([
     prisma.bookInReadingList.update({ ... }),
     prisma.bookInReadingList.update({ ... })
   ]);
   ```

4. **Index Usage**:
   - All queries leverage indexes defined in schema
   - Composite indexes used for multi-field queries
   - Query planning validates index usage

### Caching Strategy (Future Enhancement)

1. **User's Lists**: Cache for 5 minutes (frequently accessed)
2. **Public Lists**: Cache for 1 hour (less frequently updated)
3. **Favorites**: Cache for 1 hour (infrequently updated)
4. **Book Count**: Computed on-demand, can be cached per list

**Implementation**: Use Prisma Accelerate or Redis for caching.

## Testing Strategy

### Unit Tests (Vitest)

Test each action in isolation:

```typescript
describe("createReadingList", () => {
  it("should create a standard reading list", async () => {
    const result = await createReadingList({
      title: "Test List",
      type: "STANDARD"
    });

    expect(result.success).toBe(true);
    expect(result.list?.title).toBe("Test List");
  });

  it("should prevent duplicate FAVORITES_ALL", async () => {
    await createReadingList({ title: "Fav 1", type: "FAVORITES_ALL" });
    const result = await createReadingList({
      title: "Fav 2",
      type: "FAVORITES_ALL"
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("already have");
  });
});
```

### Integration Tests

Test full workflows:

```typescript
describe("Reading List Workflow", () => {
  it("should create list, add books, reorder, and delete", async () => {
    // Create list
    const createResult = await createReadingList({ title: "Test" });
    const listId = createResult.list!.id;

    // Add books
    await addBookToReadingList({ readingListId: listId, bookId: 1 });
    await addBookToReadingList({ readingListId: listId, bookId: 2 });

    // Fetch and verify order
    const fetchResult = await fetchReadingList(listId);
    expect(fetchResult.list!.books).toHaveLength(2);

    // Reorder books
    const reorderResult = await reorderBooksInList({
      readingListId: listId,
      bookOrders: [
        { bookInListId: entry2.id, position: 100 },
        { bookInListId: entry1.id, position: 200 }
      ]
    });

    expect(reorderResult.success).toBe(true);

    // Delete list
    const deleteResult = await deleteReadingList(listId);
    expect(deleteResult.success).toBe(true);
  });
});
```

## API Usage Examples

### Frontend Integration (React Components)

#### Example 1: Create Reading List Form

```typescript
"use client";

import { useState } from "react";
import { createReadingList } from "@/utils/actions/reading-lists";
import { ReadingListType, ReadingListVisibility } from "@prisma/client";

export function CreateListForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await createReadingList({
      title,
      description,
      visibility: "PRIVATE" as ReadingListVisibility,
      type: "STANDARD" as ReadingListType
    });

    if (result.success) {
      alert("List created!");
      // Redirect or refresh
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="List title"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
      />
      <button type="submit">Create List</button>
    </form>
  );
}
```

#### Example 2: Display User's Lists

```typescript
"use client";

import { useEffect, useState } from "react";
import { fetchUserReadingLists } from "@/utils/actions/reading-lists";
import { ReadingListSummaryType } from "@/shared.types";

export function MyLists() {
  const [lists, setLists] = useState<ReadingListSummaryType[]>([]);

  useEffect(() => {
    async function loadLists() {
      const result = await fetchUserReadingLists();
      if (result.success) {
        setLists(result.lists || []);
      }
    }
    loadLists();
  }, []);

  return (
    <div>
      <h2>My Reading Lists</h2>
      {lists.map(list => (
        <div key={list.id}>
          <h3>{list.title}</h3>
          <p>{list.bookCount} books</p>
          <span>{list.visibility}</span>
        </div>
      ))}
    </div>
  );
}
```

#### Example 3: Add Book to List (Modal)

```typescript
"use client";

import { useState } from "react";
import {
  fetchUserReadingLists,
  addBookToReadingList
} from "@/utils/actions/reading-lists";

export function AddToListModal({ bookId }: { bookId: number }) {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState<number>();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadLists() {
      const result = await fetchUserReadingLists();
      if (result.success) {
        setLists(result.lists || []);
      }
    }
    loadLists();
  }, []);

  async function handleAdd() {
    if (!selectedListId) return;

    const result = await addBookToReadingList({
      readingListId: selectedListId,
      bookId: bookId,
      notes: notes || undefined
    });

    if (result.success) {
      alert("Book added to list!");
      // Close modal
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  return (
    <div>
      <select onChange={(e) => setSelectedListId(Number(e.target.value))}>
        <option value="">Select a list...</option>
        {lists.map(list => (
          <option key={list.id} value={list.id}>
            {list.title}
          </option>
        ))}
      </select>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes (optional)"
      />

      <button onClick={handleAdd}>Add to List</button>
    </div>
  );
}
```

## Migration Path

### Phase 1: Database Schema
1. Update `prisma/schema.prisma` with new models
2. Run `npx prisma migrate dev --name add_reading_lists_and_favorites`
3. Run `npx prisma generate` to update Prisma Client

### Phase 2: Server Actions
1. Create `/src/utils/actions/reading-lists.ts`
2. Add TypeScript types to `/src/shared.types.ts`
3. Add permission helpers to `/src/utils/permissions.ts`
4. Write unit tests for each action

### Phase 3: Frontend Integration (handled by UI team)
1. Create UI components for reading lists
2. Integrate server actions into components
3. Add drag-and-drop for reordering
4. Create favorites UI

### Phase 4: Testing & Deployment
1. Run full test suite
2. Deploy to staging
3. Perform manual QA
4. Deploy to production

## Appendix: Complete Action Summary

| Action | Purpose | Auth Required | Owner Only |
|--------|---------|---------------|------------|
| `createReadingList` | Create new list | Yes | N/A |
| `fetchUserReadingLists` | Get user's lists | Yes | Yes |
| `fetchReadingList` | Get list with books | Yes | Yes |
| `updateReadingList` | Update list metadata | Yes | Yes |
| `deleteReadingList` | Delete list | Yes | Yes |
| `addBookToReadingList` | Add book to list | Yes | Yes |
| `removeBookFromReadingList` | Remove book from list | Yes | Yes |
| `updateBookNotesInList` | Update book notes | Yes | Yes |
| `reorderBooksInList` | Reorder books | Yes | Yes |
| `fetchFavoritesAllTime` | Get all-time favorites | Yes | Yes |
| `fetchFavoritesByYear` | Get year favorites (with read date filter) | Yes | Yes |
| `fetchAllFavoritesYears` | Get available years | Yes | Yes |
| `updateBookReadDate` | Set when user read book | Yes | Yes |
| `fetchBooksReadInYear` | Get books read in year | Yes | Yes |
| `uploadProfileImage` | Upload profile picture | Yes | Yes |
| `deleteProfileImage` | Remove profile picture | Yes | Yes |
| `fetchListsContainingBook` | Check lists for book | Yes | Yes |
| `checkBookInList` | Check if book in list | No | No |

**Total Actions**: 18

**New Actions Summary**:
- **Profile Operations** (2): Upload and delete profile images
- **Read Date Operations** (2): Update read date, fetch books read in year
- **Enhanced Favorites** (1): Filter by read date in year-specific favorites

**Estimated Development Time**:
- Server actions implementation: 12-16 hours (original 8-12 + 4 new)
- Unit tests: 6-8 hours (original 4-6 + 2 new)
- Integration tests: 3-5 hours (original 2-4 + 1 new)
- File storage setup (Vercel Blob): 2-3 hours
- Documentation: 2 hours
- **Total**: 25-34 hours

## Conclusion

This API specification provides a complete, production-ready implementation plan for Reading Lists and Favorites functionality in Penumbra. All endpoints follow existing patterns, include proper validation and authorization, and are optimized for performance and scalability.
