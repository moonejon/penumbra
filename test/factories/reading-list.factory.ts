/**
 * Reading List Factory
 * 
 * Provides functions to generate test reading list data with realistic values.
 * Includes both build* functions (returns plain objects) and create* functions (persists to DB).
 */

import { faker } from '@faker-js/faker';
import { testPrisma } from '../helpers/db';
import type { ReadingList, ReadingListType, ReadingListVisibility, Book, BookInReadingList } from '@prisma/client';
import { createUser } from './user.factory';
import { createBook, createBooks } from './book.factory';

/**
 * Configuration for building a reading list
 */
export interface BuildReadingListOptions {
  ownerId?: number;
  title?: string;
  description?: string | null;
  visibility?: ReadingListVisibility;
  type?: ReadingListType;
  year?: string | null;
  coverImage?: string | null;
}

/**
 * Configuration for adding books to a reading list
 */
export interface AddBooksToListOptions {
  books?: Book[];
  bookIds?: number[];
  count?: number;
  withNotes?: boolean;
}

/**
 * Build a reading list object without persisting to database.
 * Note: ownerId must be provided for database operations.
 * 
 * @param options - Optional overrides for reading list properties
 * @returns Reading list data object (not persisted)
 * 
 * @example
 * ```typescript
 * const listData = buildReadingList({ ownerId: 1 });
 * const favoritesList = buildReadingList({ 
 *   ownerId: 1,
 *   type: 'FAVORITES_YEAR',
 *   year: '2024'
 * });
 * ```
 */
export function buildReadingList(options: BuildReadingListOptions = {}): Omit<ReadingList, 'id' | 'createdAt' | 'updatedAt'> {
  const type = options.type ?? 'STANDARD';
  
  return {
    ownerId: options.ownerId ?? 0, // Will need to be set for DB operations
    title: options.title ?? faker.lorem.words(3),
    description: options.description === undefined 
      ? (faker.datatype.boolean() ? faker.lorem.paragraph() : null)
      : options.description,
    visibility: options.visibility ?? 'PRIVATE',
    type,
    year: options.year === undefined
      ? (type === 'FAVORITES_YEAR' ? new Date().getFullYear().toString() : null)
      : options.year,
    coverImage: options.coverImage === undefined
      ? (faker.datatype.boolean() ? faker.image.url() : null)
      : options.coverImage,
  };
}

/**
 * Create a reading list in the database with realistic test data.
 * If no ownerId is provided, a new user will be created.
 * 
 * @param options - Optional overrides for reading list properties
 * @returns Created reading list record with all fields
 * 
 * @example
 * ```typescript
 * const list = await createReadingList({ ownerId: 1 });
 * const publicList = await createReadingList({ 
 *   ownerId: 1,
 *   title: 'Summer Reading',
 *   visibility: 'PUBLIC'
 * });
 * ```
 */
export async function createReadingList(options: BuildReadingListOptions = {}): Promise<ReadingList> {
  let ownerId = options.ownerId;
  
  // Create a user if no ownerId provided
  if (!ownerId) {
    const user = await createUser();
    ownerId = user.id;
  }
  
  const listData = buildReadingList({ ...options, ownerId });
  
  return testPrisma.readingList.create({
    data: listData,
  });
}

/**
 * Create multiple reading lists in the database.
 * If no ownerId is provided, a new user will be created for all lists.
 * 
 * @param count - Number of reading lists to create
 * @param baseOptions - Optional base configuration applied to all lists
 * @returns Array of created reading list records
 * 
 * @example
 * ```typescript
 * const lists = await createReadingLists(5, { ownerId: 1 });
 * const publicLists = await createReadingLists(3, { 
 *   ownerId: 1,
 *   visibility: 'PUBLIC' 
 * });
 * ```
 */
export async function createReadingLists(
  count: number,
  baseOptions: BuildReadingListOptions = {}
): Promise<ReadingList[]> {
  let ownerId = baseOptions.ownerId;
  
  // Create a user if no ownerId provided
  if (!ownerId) {
    const user = await createUser();
    ownerId = user.id;
  }
  
  const lists: ReadingList[] = [];
  
  for (let i = 0; i < count; i++) {
    const list = await createReadingList({ ...baseOptions, ownerId });
    lists.push(list);
  }
  
  return lists;
}

/**
 * Build multiple reading list objects without persisting.
 * 
 * @param count - Number of reading list objects to build
 * @param baseOptions - Optional base configuration applied to all lists
 * @returns Array of reading list data objects (not persisted)
 * 
 * @example
 * ```typescript
 * const listDataArray = buildReadingLists(5, { ownerId: 1 });
 * ```
 */
export function buildReadingLists(
  count: number,
  baseOptions: BuildReadingListOptions = {}
): Array<Omit<ReadingList, 'id' | 'createdAt' | 'updatedAt'>> {
  return Array.from({ length: count }, () => buildReadingList(baseOptions));
}

/**
 * Add books to an existing reading list.
 * Can provide existing books, book IDs, or create new books.
 * 
 * @param readingListId - ID of the reading list
 * @param options - Configuration for books to add
 * @returns Array of created BookInReadingList entries
 * 
 * @example
 * ```typescript
 * // Add existing books
 * await addBooksToReadingList(listId, { bookIds: [1, 2, 3] });
 * 
 * // Add new books
 * await addBooksToReadingList(listId, { count: 5 });
 * 
 * // Add books with notes
 * await addBooksToReadingList(listId, { books, withNotes: true });
 * ```
 */
export async function addBooksToReadingList(
  readingListId: number,
  options: AddBooksToListOptions = {}
): Promise<BookInReadingList[]> {
  let books: Book[];
  
  if (options.books) {
    books = options.books;
  } else if (options.bookIds) {
    // Fetch books by IDs
    books = await testPrisma.book.findMany({
      where: { id: { in: options.bookIds } },
    });
  } else {
    // Create new books
    const count = options.count ?? 3;
    const readingList = await testPrisma.readingList.findUnique({
      where: { id: readingListId },
    });
    
    if (!readingList) {
      throw new Error(`Reading list with ID ${readingListId} not found`);
    }
    
    books = await createBooks(count, { ownerId: readingList.ownerId });
  }
  
  const entries: BookInReadingList[] = [];
  
  for (let i = 0; i < books.length; i++) {
    const entry = await testPrisma.bookInReadingList.create({
      data: {
        bookId: books[i].id,
        readingListId,
        position: i,
        notes: options.withNotes ? faker.lorem.sentence() : null,
      },
    });
    entries.push(entry);
  }
  
  return entries;
}

/**
 * Create a reading list with books already added.
 * 
 * @param listOptions - Options for the reading list
 * @param booksOptions - Options for books to add
 * @returns Object with the created list and book entries
 * 
 * @example
 * ```typescript
 * const { list, entries } = await createReadingListWithBooks(
 *   { ownerId: 1, title: 'Favorites' },
 *   { count: 5, withNotes: true }
 * );
 * ```
 */
export async function createReadingListWithBooks(
  listOptions: BuildReadingListOptions = {},
  booksOptions: AddBooksToListOptions = {}
): Promise<{
  list: ReadingList;
  entries: BookInReadingList[];
}> {
  const list = await createReadingList(listOptions);
  const entries = await addBooksToReadingList(list.id, booksOptions);
  
  return { list, entries };
}

/**
 * Create a favorites list for a specific year.
 * 
 * @param year - Year for the favorites list
 * @param options - Optional overrides for other list properties
 * @returns Created reading list record
 * 
 * @example
 * ```typescript
 * const favorites2024 = await createFavoritesYearList('2024', { ownerId: 1 });
 * ```
 */
export async function createFavoritesYearList(
  year: string,
  options: Omit<BuildReadingListOptions, 'type' | 'year'> = {}
): Promise<ReadingList> {
  return createReadingList({
    ...options,
    type: 'FAVORITES_YEAR',
    year,
    title: options.title ?? `Favorite Books of ${year}`,
  });
}

/**
 * Create an all-time favorites list.
 * 
 * @param options - Optional overrides for other list properties
 * @returns Created reading list record
 * 
 * @example
 * ```typescript
 * const allTimeFavorites = await createFavoritesAllList({ ownerId: 1 });
 * ```
 */
export async function createFavoritesAllList(
  options: Omit<BuildReadingListOptions, 'type' | 'year'> = {}
): Promise<ReadingList> {
  return createReadingList({
    ...options,
    type: 'FAVORITES_ALL',
    year: null,
    title: options.title ?? 'All-Time Favorites',
  });
}

/**
 * Create a standard (non-favorites) reading list.
 * 
 * @param options - Optional overrides for list properties
 * @returns Created reading list record
 * 
 * @example
 * ```typescript
 * const readingList = await createStandardList({ 
 *   ownerId: 1,
 *   title: 'To Read in 2024'
 * });
 * ```
 */
export async function createStandardList(
  options: Omit<BuildReadingListOptions, 'type'> = {}
): Promise<ReadingList> {
  return createReadingList({
    ...options,
    type: 'STANDARD',
  });
}

/**
 * Create a reading list with specific visibility.
 * 
 * @param visibility - Visibility setting for the list
 * @param options - Optional overrides for other list properties
 * @returns Created reading list record
 * 
 * @example
 * ```typescript
 * const publicList = await createReadingListWithVisibility('PUBLIC', { ownerId: 1 });
 * const privateList = await createReadingListWithVisibility('PRIVATE', { ownerId: 1 });
 * ```
 */
export async function createReadingListWithVisibility(
  visibility: ReadingListVisibility,
  options: Omit<BuildReadingListOptions, 'visibility'> = {}
): Promise<ReadingList> {
  return createReadingList({
    ...options,
    visibility,
  });
}

/**
 * Create a favorites year list with books already added.
 * Books will have readDate set to the specified year.
 * 
 * @param year - Year for the favorites list
 * @param bookCount - Number of books to add (typically 5-6 for favorites)
 * @param options - Optional overrides for list properties
 * @returns Object with the created list and book entries
 * 
 * @example
 * ```typescript
 * const { list, entries } = await createFavoritesYearListWithBooks(
 *   '2024',
 *   5,
 *   { ownerId: 1 }
 * );
 * ```
 */
export async function createFavoritesYearListWithBooks(
  year: string,
  bookCount: number = 5,
  options: Omit<BuildReadingListOptions, 'type' | 'year'> = {}
): Promise<{
  list: ReadingList;
  entries: BookInReadingList[];
  books: Book[];
}> {
  let ownerId = options.ownerId;
  if (!ownerId) {
    const user = await createUser();
    ownerId = user.id;
  }
  
  const list = await createFavoritesYearList(year, { ...options, ownerId });
  
  // Create books with readDate in the specified year
  const books: Book[] = [];
  const yearNum = parseInt(year);
  
  for (let i = 0; i < bookCount; i++) {
    const readDate = new Date(yearNum, faker.number.int({ min: 0, max: 11 }), faker.number.int({ min: 1, max: 28 }));
    const book = await createBook({ ownerId, readDate });
    books.push(book);
  }
  
  const entries = await addBooksToReadingList(list.id, { books });
  
  return { list, entries, books };
}

/**
 * Get a reading list with all its books populated.
 * Useful for testing queries that include book data.
 * 
 * @param readingListId - ID of the reading list
 * @returns Reading list with books included
 * 
 * @example
 * ```typescript
 * const listWithBooks = await getReadingListWithBooks(listId);
 * console.log(`List has ${listWithBooks.books.length} books`);
 * ```
 */
export async function getReadingListWithBooks(readingListId: number) {
  return testPrisma.readingList.findUnique({
    where: { id: readingListId },
    include: {
      books: {
        include: {
          book: true,
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  });
}
