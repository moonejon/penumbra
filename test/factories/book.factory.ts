/**
 * Book Factory
 * 
 * Provides functions to generate test book data with realistic values.
 * Includes both build* functions (returns plain objects) and create* functions (persists to DB).
 */

import { faker } from '@faker-js/faker';
import { testPrisma } from '../helpers/db';
import type { Book, BookVisibility } from '@prisma/client';
import { createUser } from './user.factory';

/**
 * Configuration for building a book
 */
export interface BuildBookOptions {
  ownerId?: number;
  isbn10?: string;
  isbn13?: string;
  title?: string;
  titleLong?: string;
  language?: string;
  synopsis?: string;
  image?: string;
  imageOriginal?: string;
  publisher?: string;
  edition?: string | null;
  pageCount?: number;
  datePublished?: string;
  subjects?: string[];
  authors?: string[];
  binding?: string;
  visibility?: BookVisibility;
  readDate?: Date | null;
}

/**
 * Generate a valid ISBN-10
 */
function generateISBN10(): string {
  // Generate 9 random digits
  const digits = Array.from({ length: 9 }, () => faker.number.int({ min: 0, max: 9 }));
  
  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 11;
  const checkChar = checkDigit === 10 ? 'X' : checkDigit.toString();
  
  return digits.join('') + checkChar;
}

/**
 * Generate a valid ISBN-13
 */
function generateISBN13(): string {
  // ISBN-13 starts with 978 or 979
  const prefix = faker.helpers.arrayElement(['978', '979']);
  
  // Generate 9 random digits
  const digits = [
    ...prefix.split('').map(Number),
    ...Array.from({ length: 9 }, () => faker.number.int({ min: 0, max: 9 }))
  ];
  
  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return digits.join('') + checkDigit;
}

/**
 * Build a book object without persisting to database.
 * Note: ownerId must be provided for database operations.
 * 
 * @param options - Optional overrides for book properties
 * @returns Book data object (not persisted)
 * 
 * @example
 * ```typescript
 * const bookData = buildBook({ ownerId: 1 });
 * const customBook = buildBook({ 
 *   ownerId: 1,
 *   title: 'The Great Gatsby',
 *   authors: ['F. Scott Fitzgerald']
 * });
 * ```
 */
export function buildBook(options: BuildBookOptions = {}): Omit<Book, 'id' | 'createdAt' | 'updatedAt'> {
  const isbn10 = options.isbn10 ?? generateISBN10();
  const isbn13 = options.isbn13 ?? generateISBN13();
  const title = options.title ?? faker.book.title();
  const authors = options.authors ?? [faker.book.author()];
  
  return {
    ownerId: options.ownerId ?? 0, // Will need to be set for DB operations
    isbn10,
    isbn13,
    title,
    titleLong: options.titleLong ?? `${title}: ${faker.lorem.sentence()}`,
    language: options.language ?? 'en',
    synopsis: options.synopsis ?? faker.lorem.paragraphs(3),
    image: options.image ?? `https://images.example.com/${isbn13}.jpg`,
    imageOriginal: options.imageOriginal ?? `https://images.example.com/${isbn13}_original.jpg`,
    publisher: options.publisher ?? faker.book.publisher(),
    edition: options.edition === undefined ? (faker.datatype.boolean() ? faker.number.int({ min: 1, max: 10 }).toString() : null) : options.edition,
    pageCount: options.pageCount ?? faker.number.int({ min: 100, max: 1200 }),
    datePublished: options.datePublished ?? faker.date.past({ years: 50 }).toISOString().split('T')[0],
    subjects: options.subjects ?? faker.helpers.arrayElements(
      ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Technology', 'Philosophy', 'Art'],
      faker.number.int({ min: 1, max: 4 })
    ),
    authors,
    binding: options.binding ?? faker.helpers.arrayElement(['Hardcover', 'Paperback', 'Mass Market Paperback', 'eBook', 'Audiobook']),
    visibility: options.visibility ?? 'PUBLIC',
    readDate: options.readDate === undefined ? (faker.datatype.boolean() ? faker.date.past({ years: 5 }) : null) : options.readDate,
  };
}

/**
 * Create a book in the database with realistic test data.
 * If no ownerId is provided, a new user will be created.
 * 
 * @param options - Optional overrides for book properties
 * @returns Created book record with all fields
 * 
 * @example
 * ```typescript
 * const book = await createBook({ ownerId: 1 });
 * const publicBook = await createBook({ 
 *   ownerId: 1,
 *   title: '1984',
 *   authors: ['George Orwell'],
 *   visibility: 'PUBLIC'
 * });
 * ```
 */
export async function createBook(options: BuildBookOptions = {}): Promise<Book> {
  let ownerId = options.ownerId;
  
  // Create a user if no ownerId provided
  if (!ownerId) {
    const user = await createUser();
    ownerId = user.id;
  }
  
  const bookData = buildBook({ ...options, ownerId });
  
  return testPrisma.book.create({
    data: bookData,
  });
}

/**
 * Create multiple books in the database.
 * If no ownerId is provided, a new user will be created for all books.
 * 
 * @param count - Number of books to create
 * @param baseOptions - Optional base configuration applied to all books
 * @returns Array of created book records
 * 
 * @example
 * ```typescript
 * const books = await createBooks(5, { ownerId: 1 });
 * const publicBooks = await createBooks(3, { 
 *   ownerId: 1,
 *   visibility: 'PUBLIC' 
 * });
 * ```
 */
export async function createBooks(
  count: number,
  baseOptions: BuildBookOptions = {}
): Promise<Book[]> {
  let ownerId = baseOptions.ownerId;
  
  // Create a user if no ownerId provided
  if (!ownerId) {
    const user = await createUser();
    ownerId = user.id;
  }
  
  const books: Book[] = [];
  
  for (let i = 0; i < count; i++) {
    const book = await createBook({ ...baseOptions, ownerId });
    books.push(book);
  }
  
  return books;
}

/**
 * Build multiple book objects without persisting.
 * 
 * @param count - Number of book objects to build
 * @param baseOptions - Optional base configuration applied to all books
 * @returns Array of book data objects (not persisted)
 * 
 * @example
 * ```typescript
 * const bookDataArray = buildBooks(5, { ownerId: 1 });
 * ```
 */
export function buildBooks(
  count: number,
  baseOptions: BuildBookOptions = {}
): Array<Omit<Book, 'id' | 'createdAt' | 'updatedAt'>> {
  return Array.from({ length: count }, () => buildBook(baseOptions));
}

/**
 * Create a book with specific visibility setting.
 * 
 * @param visibility - Visibility setting for the book
 * @param options - Optional overrides for other book properties
 * @returns Created book record
 * 
 * @example
 * ```typescript
 * const privateBook = await createBookWithVisibility('PRIVATE', { ownerId: 1 });
 * const publicBook = await createBookWithVisibility('PUBLIC', { ownerId: 1 });
 * ```
 */
export async function createBookWithVisibility(
  visibility: BookVisibility,
  options: Omit<BuildBookOptions, 'visibility'> = {}
): Promise<Book> {
  return createBook({
    ...options,
    visibility,
  });
}

/**
 * Create a book that the user has read (with readDate set).
 * 
 * @param options - Optional overrides for book properties
 * @returns Created book record with readDate
 * 
 * @example
 * ```typescript
 * const readBook = await createReadBook({ ownerId: 1 });
 * const recentlyRead = await createReadBook({ 
 *   ownerId: 1,
 *   readDate: new Date('2024-01-15')
 * });
 * ```
 */
export async function createReadBook(options: BuildBookOptions = {}): Promise<Book> {
  return createBook({
    ...options,
    readDate: options.readDate ?? faker.date.past({ years: 2 }),
  });
}

/**
 * Create a book that the user hasn't read yet (readDate is null).
 * 
 * @param options - Optional overrides for book properties
 * @returns Created book record without readDate
 * 
 * @example
 * ```typescript
 * const unreadBook = await createUnreadBook({ ownerId: 1 });
 * ```
 */
export async function createUnreadBook(options: BuildBookOptions = {}): Promise<Book> {
  return createBook({
    ...options,
    readDate: null,
  });
}

/**
 * Create books read in a specific year.
 * Useful for testing favorites by year functionality.
 * 
 * @param year - Year the books were read
 * @param count - Number of books to create
 * @param baseOptions - Optional base configuration applied to all books
 * @returns Array of created book records
 * 
 * @example
 * ```typescript
 * const books2024 = await createBooksReadInYear(2024, 5, { ownerId: 1 });
 * ```
 */
export async function createBooksReadInYear(
  year: number,
  count: number,
  baseOptions: BuildBookOptions = {}
): Promise<Book[]> {
  const books: Book[] = [];
  
  let ownerId = baseOptions.ownerId;
  if (!ownerId) {
    const user = await createUser();
    ownerId = user.id;
  }
  
  for (let i = 0; i < count; i++) {
    // Generate a random date within the specified year
    const readDate = new Date(year, faker.number.int({ min: 0, max: 11 }), faker.number.int({ min: 1, max: 28 }));
    
    const book = await createBook({
      ...baseOptions,
      ownerId,
      readDate,
    });
    books.push(book);
  }
  
  return books;
}

/**
 * Create a book by a specific author.
 * 
 * @param author - Author name
 * @param options - Optional overrides for other book properties
 * @returns Created book record
 * 
 * @example
 * ```typescript
 * const book = await createBookByAuthor('Jane Austen', { ownerId: 1 });
 * ```
 */
export async function createBookByAuthor(
  author: string,
  options: Omit<BuildBookOptions, 'authors'> = {}
): Promise<Book> {
  return createBook({
    ...options,
    authors: [author],
  });
}

/**
 * Create a book with multiple authors.
 * 
 * @param authors - Array of author names
 * @param options - Optional overrides for other book properties
 * @returns Created book record
 * 
 * @example
 * ```typescript
 * const book = await createBookWithMultipleAuthors(
 *   ['Author One', 'Author Two'],
 *   { ownerId: 1 }
 * );
 * ```
 */
export async function createBookWithMultipleAuthors(
  authors: string[],
  options: Omit<BuildBookOptions, 'authors'> = {}
): Promise<Book> {
  return createBook({
    ...options,
    authors,
  });
}
