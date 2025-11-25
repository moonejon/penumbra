type BookType = {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  imageOriginal: string;
  publisher: string;
  synopsis: string;
  pageCount: number;
  datePublished: string;
  authors: Array<string>;
  subjects: Array<string>;
  isbn10: string;
  isbn13: string;
  binding: string;
  language: string;
  titleLong: string;
  edition: string | null;
  ownerId: number;
  readDate?: Date | null;
  createdAt?: Date; // Optional for backward compatibility with existing queries
  updatedAt?: Date; // Optional for backward compatibility with existing queries
};

type BookImportDataType = {
  title: string;
  subtitle?: string;
  image: string;
  imageOriginal: string;
  publisher: string;
  synopsis: string;
  pageCount: number;
  datePublished: string;
  authors: Array<string>;
  subjects: Array<string>;
  isbn10: string;
  isbn13: string;
  binding: string;
  language: string;
  titleLong: string;
  edition: string;
  isIncomplete?: boolean;
  isDuplicate?: boolean;
};

type SearchSuggestion = {
  authors: string[];
  titles: { id: number; title: string }[];
  subjects: string[];
};

/**
 * Enum types matching Prisma schema
 */

// Types of reading lists - determines special behavior and constraints
export type ReadingListTypeEnum = "STANDARD" | "FAVORITES_YEAR" | "FAVORITES_ALL";

// Visibility levels for reading lists
export type ReadingListVisibilityEnum = "PRIVATE" | "PUBLIC" | "FRIENDS" | "UNLISTED";

/**
 * Reading List - A collection of books organized by the user
 * Can be a standard list or a special favorites list (by year or all-time)
 */
export interface ReadingList {
  id: number;
  ownerId: number;
  title: string;
  description?: string | null;
  visibility: ReadingListVisibilityEnum;
  type: ReadingListTypeEnum;
  year?: string | null; // For FAVORITES_YEAR type, stores the year (e.g., "2024")
  coverImage?: string | null; // Custom cover image URL (optional, falls back to book collage)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Junction table entry linking a book to a reading list
 * Includes position for ordering and optional notes
 */
export interface BookInReadingListEntry {
  id: number;
  bookId: number;
  readingListId: number;
  position: number; // Order within the list (lower numbers appear first)
  notes?: string | null; // Optional notes/annotations for this book in this list
  addedAt: Date;
  book: BookType; // Reference to the full book data
}

/**
 * Reading list with its associated books (populated via join table)
 * Used when fetching a reading list with all its books
 */
export interface ReadingListWithBooks extends ReadingList {
  books: BookInReadingListEntry[];
}

/**
 * Favorite book entry for display in favorites section
 * Includes position for ordered display (1-6)
 */
export interface FavoriteBook {
  book: BookType;
  position: number; // 1-6 for display order
}

/**
 * User profile information
 * Subset of User model for display purposes
 */
export interface UserProfile {
  id: number;
  name?: string | null;
  email: string;
  profileImageUrl?: string | null;
  bio?: string | null; // Future field for user biography
}

export type { BookType, BookImportDataType, SearchSuggestion };
