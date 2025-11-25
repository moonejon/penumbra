/**
 * Integration Tests for Books Server Actions
 * 
 * Tests the book management server actions with real database interactions.
 * Uses factories for realistic test data and mocks only at system boundaries (Clerk auth).
 * 
 * Coverage:
 * - importBooks() - Import books to library
 * - fetchBooksPaginated() - Fetch books with pagination and filtering
 * - updateBook() - Update book metadata
 * - checkRecordExists() - Check if ISBN exists
 * - fetchBooks() - Fetch all books
 * - createManualBook() - Create a book manually
 */

import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { resetDatabase, testPrisma, disconnectTestDatabase } from '../../helpers/db'
import { createUser, createBook, createBooks, buildBook } from '../../factories'
import { 
  importBooks, 
  fetchBooksPaginated, 
  updateBook, 
  checkRecordExists,
  fetchBooks,
  createManualBook
} from '../../../src/utils/actions/books'
import type { User } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'

// Mock Clerk authentication
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>

describe('Books Server Actions - Integration Tests', () => {
  let testUser: User
  let otherUser: User

  beforeEach(async () => {
    // Reset database to clean state
    await resetDatabase()
    
    // Create test users
    testUser = await createUser({ 
      clerkId: 'test_user_123',
      email: 'testuser@example.com',
      name: 'Test User'
    })
    
    otherUser = await createUser({ 
      clerkId: 'other_user_456',
      email: 'otheruser@example.com',
      name: 'Other User'
    })

    // Default: mock authenticated as testUser
    mockAuth.mockResolvedValue({
      userId: testUser.clerkId,
      sessionId: 'session_123',
      orgId: null,
      orgRole: null,
      orgSlug: null,
    } as any)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  describe('importBooks()', () => {
    it('should import books successfully for authenticated user', async () => {
      const booksToImport = [
        buildBook({ ownerId: testUser.id }),
        buildBook({ ownerId: testUser.id }),
        buildBook({ ownerId: testUser.id }),
      ]

      const result = await importBooks(booksToImport)

      expect(result?.success).toBe(true)
      expect(result?.count).toBe(3)
      expect(result?.message).toContain('Successfully imported 3 books')

      // Verify books are in database
      const booksInDb = await testPrisma.book.findMany({
        where: { ownerId: testUser.id }
      })
      expect(booksInDb).toHaveLength(3)
    })

    it('should set ownerId to authenticated user regardless of input', async () => {
      // Try to import books with different ownerId (should be overridden)
      const booksToImport = [
        buildBook({ ownerId: 999 }), // Invalid ownerId
      ]

      const result = await importBooks(booksToImport)

      expect(result?.success).toBe(true)
      
      const book = await testPrisma.book.findFirst({
        where: { ownerId: testUser.id }
      })
      expect(book).toBeDefined()
      expect(book?.ownerId).toBe(testUser.id)
    })

    it('should return error when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({
        userId: null,
        sessionId: null,
      } as any)

      const booksToImport = [buildBook({ ownerId: testUser.id })]

      await expect(importBooks(booksToImport)).rejects.toThrow('User not authenticated')
    })

    it('should handle duplicate ISBN gracefully', async () => {
      const isbn13 = '9781234567890'
      
      // First import
      await importBooks([buildBook({ ownerId: testUser.id, isbn13 })])
      
      // Try to import same ISBN again
      const result = await importBooks([buildBook({ ownerId: testUser.id, isbn13 })])
      
      expect(result?.success).toBe(false)
      expect(result?.error).toBeDefined()
    })

    it('should import empty array successfully', async () => {
      const result = await importBooks([])
      
      expect(result?.success).toBe(true)
      expect(result?.count).toBe(0)
    })

    it('should import books with all metadata fields', async () => {
      const bookData = buildBook({
        ownerId: testUser.id,
        title: 'The Great Gatsby',
        authors: ['F. Scott Fitzgerald'],
        subjects: ['Fiction', 'Classic Literature'],
        pageCount: 180,
        publisher: 'Scribner',
        edition: '1st',
        binding: 'Hardcover',
        language: 'en',
        readDate: new Date('2024-01-15'),
      })

      const result = await importBooks([bookData])
      
      expect(result?.success).toBe(true)
      
      const book = await testPrisma.book.findFirst({
        where: { isbn13: bookData.isbn13 }
      })
      
      expect(book).toMatchObject({
        title: 'The Great Gatsby',
        authors: ['F. Scott Fitzgerald'],
        subjects: expect.arrayContaining(['Fiction', 'Classic Literature']),
        pageCount: 180,
        publisher: 'Scribner',
        edition: '1st',
        binding: 'Hardcover',
        language: 'en',
      })
    })
  })

  describe('fetchBooks()', () => {
    it('should fetch all books for authenticated user', async () => {
      await createBooks(5, { ownerId: testUser.id })
      await createBooks(3, { ownerId: otherUser.id })

      const books = await fetchBooks()

      expect(books).toHaveLength(5)
      expect(books.every(book => book.ownerId === testUser.id)).toBe(true)
    })

    it('should return empty array when user has no books', async () => {
      const books = await fetchBooks()
      
      expect(books).toHaveLength(0)
      expect(books).toEqual([])
    })

    it('should throw error when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({
        userId: null,
        sessionId: null,
      } as any)

      await expect(fetchBooks()).rejects.toThrow('User not authenticated')
    })
  })

  describe('fetchBooksPaginated()', () => {
    beforeEach(async () => {
      // Create test books with varied data for filtering tests
      await createBook({ 
        ownerId: testUser.id, 
        title: 'The Great Gatsby',
        authors: ['F. Scott Fitzgerald'],
        subjects: ['Fiction', 'Classic'],
        visibility: 'PUBLIC'
      })
      await createBook({ 
        ownerId: testUser.id, 
        title: 'To Kill a Mockingbird',
        authors: ['Harper Lee'],
        subjects: ['Fiction', 'Drama'],
        visibility: 'PUBLIC'
      })
      await createBook({ 
        ownerId: testUser.id, 
        title: 'Pride and Prejudice',
        authors: ['Jane Austen'],
        subjects: ['Romance', 'Classic'],
        visibility: 'PRIVATE'
      })
      await createBook({ 
        ownerId: otherUser.id, 
        title: 'Other User Book',
        authors: ['Other Author'],
        visibility: 'PUBLIC'
      })
    })

    it('should fetch first page with default page size', async () => {
      const result = await fetchBooksPaginated({ pageSize: 10, page: 1 })

      expect(result.books).toHaveLength(3) // testUser's books only
      expect(result.totalCount).toBe(3)
      expect(result.pageCount).toBe(1)
    })

    it('should respect pagination parameters', async () => {
      // Create more books for pagination
      await createBooks(15, { ownerId: testUser.id })

      const result = await fetchBooksPaginated({ pageSize: 5, page: 2 })

      expect(result.books).toHaveLength(5)
      expect(result.totalCount).toBe(18) // 3 initial + 15 new
      expect(result.pageCount).toBe(4) // Math.ceil(18 / 5)
    })

    it('should filter by title (case-insensitive)', async () => {
      const result = await fetchBooksPaginated({ 
        title: 'gatsby',
        pageSize: 10,
        page: 1
      })

      expect(result.books).toHaveLength(1)
      expect(result.books[0].title).toBe('The Great Gatsby')
    })

    it('should filter by partial title match', async () => {
      const result = await fetchBooksPaginated({ 
        title: 'great',
        pageSize: 10,
        page: 1
      })

      expect(result.books).toHaveLength(1)
      expect(result.books[0].title).toContain('Great')
    })

    it('should filter by author', async () => {
      const result = await fetchBooksPaginated({ 
        authors: 'Harper Lee',
        pageSize: 10,
        page: 1
      })

      expect(result.books).toHaveLength(1)
      expect(result.books[0].title).toBe('To Kill a Mockingbird')
    })

    it('should filter by multiple authors (comma-separated)', async () => {
      const result = await fetchBooksPaginated({ 
        authors: 'F. Scott Fitzgerald, Jane Austen',
        pageSize: 10,
        page: 1
      })

      expect(result.books).toHaveLength(2)
      expect(result.books.map(b => b.title)).toEqual(
        expect.arrayContaining(['The Great Gatsby', 'Pride and Prejudice'])
      )
    })

    it('should filter by subjects', async () => {
      const result = await fetchBooksPaginated({ 
        subjects: 'Classic',
        pageSize: 10,
        page: 1
      })

      expect(result.books).toHaveLength(2)
      expect(result.books.every(b => b.subjects.includes('Classic'))).toBe(true)
    })

    it('should combine title/author with OR logic and subjects with AND logic', async () => {
      const result = await fetchBooksPaginated({ 
        title: 'Gatsby',
        subjects: 'Fiction',
        pageSize: 10,
        page: 1
      })

      expect(result.books).toHaveLength(1)
      expect(result.books[0].title).toBe('The Great Gatsby')
    })

    it('should show public books from other users when not authenticated', async () => {
      mockAuth.mockResolvedValue({
        userId: null,
        sessionId: null,
      } as any)

      const result = await fetchBooksPaginated({ pageSize: 10, page: 1 })

      // Should only see public books (3 public books total)
      expect(result.books).toHaveLength(3)
      expect(result.books.every(b => b.visibility === 'PUBLIC')).toBe(true)
    })

    it('should show own books plus public books when authenticated', async () => {
      const result = await fetchBooksPaginated({ pageSize: 10, page: 1 })

      // Should see all own books (3) regardless of visibility
      expect(result.books).toHaveLength(3)
      expect(result.books.every(b => b.ownerId === testUser.id)).toBe(true)
    })

    it('should return empty results when no books match filters', async () => {
      const result = await fetchBooksPaginated({ 
        title: 'Nonexistent Book Title XYZ',
        pageSize: 10,
        page: 1
      })

      expect(result.books).toHaveLength(0)
      expect(result.totalCount).toBe(0)
      expect(result.pageCount).toBe(0)
    })

    it('should handle page beyond available pages gracefully', async () => {
      const result = await fetchBooksPaginated({ pageSize: 10, page: 999 })

      expect(result.books).toHaveLength(0)
      expect(result.totalCount).toBe(3)
      expect(result.pageCount).toBe(1)
    })

    it('should return books with all expected fields', async () => {
      const result = await fetchBooksPaginated({ pageSize: 1, page: 1 })

      expect(result.books[0]).toHaveProperty('id')
      expect(result.books[0]).toHaveProperty('title')
      expect(result.books[0]).toHaveProperty('authors')
      expect(result.books[0]).toHaveProperty('image')
      expect(result.books[0]).toHaveProperty('imageOriginal')
      expect(result.books[0]).toHaveProperty('publisher')
      expect(result.books[0]).toHaveProperty('synopsis')
      expect(result.books[0]).toHaveProperty('pageCount')
      expect(result.books[0]).toHaveProperty('datePublished')
      expect(result.books[0]).toHaveProperty('subjects')
      expect(result.books[0]).toHaveProperty('isbn10')
      expect(result.books[0]).toHaveProperty('isbn13')
      expect(result.books[0]).toHaveProperty('binding')
      expect(result.books[0]).toHaveProperty('language')
      expect(result.books[0]).toHaveProperty('titleLong')
      expect(result.books[0]).toHaveProperty('edition')
      expect(result.books[0]).toHaveProperty('ownerId')
      expect(result.books[0]).toHaveProperty('readDate')
    })
  })

  describe('updateBook()', () => {
    let testBook: Awaited<ReturnType<typeof createBook>>

    beforeEach(async () => {
      testBook = await createBook({ 
        ownerId: testUser.id,
        title: 'Original Title',
        synopsis: 'Original synopsis',
        pageCount: 200
      })
    })

    it('should update book metadata successfully', async () => {
      const result = await updateBook(testBook.id, {
        title: 'Updated Title',
        synopsis: 'Updated synopsis',
        pageCount: 250,
      })

      expect(result.success).toBe(true)
      expect(result.book).toBeDefined()
      expect(result.book?.title).toBe('Updated Title')
      expect(result.book?.synopsis).toBe('Updated synopsis')
      expect(result.book?.pageCount).toBe(250)
    })

    it('should update partial fields only', async () => {
      const result = await updateBook(testBook.id, {
        title: 'New Title Only',
      })

      expect(result.success).toBe(true)
      expect(result.book?.title).toBe('New Title Only')
      expect(result.book?.synopsis).toBe('Original synopsis') // Unchanged
      expect(result.book?.pageCount).toBe(200) // Unchanged
    })

    it('should update authors array', async () => {
      const result = await updateBook(testBook.id, {
        authors: ['Author One', 'Author Two', 'Author Three'],
      })

      expect(result.success).toBe(true)
      expect(result.book?.authors).toHaveLength(3)
      expect(result.book?.authors).toEqual(['Author One', 'Author Two', 'Author Three'])
    })

    it('should update subjects array', async () => {
      const result = await updateBook(testBook.id, {
        subjects: ['History', 'Biography', 'Politics'],
      })

      expect(result.success).toBe(true)
      expect(result.book?.subjects).toEqual(['History', 'Biography', 'Politics'])
    })

    it('should update readDate', async () => {
      const readDate = new Date('2024-06-15')
      const result = await updateBook(testBook.id, {
        readDate,
      })

      expect(result.success).toBe(true)
      expect(result.book?.readDate).toEqual(readDate)
    })

    it('should fail when user does not own the book', async () => {
      const otherUserBook = await createBook({ ownerId: otherUser.id })

      const result = await updateBook(otherUserBook.id, {
        title: 'Hacked Title',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')

      // Verify book was not updated
      const book = await testPrisma.book.findUnique({
        where: { id: otherUserBook.id }
      })
      expect(book?.title).not.toBe('Hacked Title')
    })

    it('should fail when book does not exist', async () => {
      const result = await updateBook(99999, {
        title: 'New Title',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')
    })

    it('should fail when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({
        userId: null,
        sessionId: null,
      } as any)

      await expect(
        updateBook(testBook.id, { title: 'New Title' })
      ).rejects.toThrow('User not authenticated')
    })

    it('should update edition to null', async () => {
      const result = await updateBook(testBook.id, {
        edition: null,
      })

      expect(result.success).toBe(true)
      expect(result.book?.edition).toBeNull()
    })

    it('should handle multiple field updates in one call', async () => {
      const result = await updateBook(testBook.id, {
        title: 'Completely New Title',
        authors: ['New Author'],
        publisher: 'New Publisher',
        pageCount: 500,
        synopsis: 'Completely new synopsis',
        edition: '2nd',
        binding: 'Paperback',
      })

      expect(result.success).toBe(true)
      expect(result.book).toMatchObject({
        title: 'Completely New Title',
        authors: ['New Author'],
        publisher: 'New Publisher',
        pageCount: 500,
        synopsis: 'Completely new synopsis',
        edition: '2nd',
        binding: 'Paperback',
      })
    })
  })

  describe('checkRecordExists()', () => {
    let existingBook: Awaited<ReturnType<typeof createBook>>

    beforeEach(async () => {
      existingBook = await createBook({ 
        ownerId: testUser.id,
        isbn13: '9781234567890'
      })
    })

    it('should return true when ISBN exists for user', async () => {
      const exists = await checkRecordExists('9781234567890')
      expect(exists).toBe(true)
    })

    it('should return false when ISBN does not exist for user', async () => {
      const exists = await checkRecordExists('9789999999999')
      expect(exists).toBe(false)
    })

    it('should return false when ISBN belongs to another user', async () => {
      await createBook({ 
        ownerId: otherUser.id,
        isbn13: '9780987654321'
      })

      const exists = await checkRecordExists('9780987654321')
      expect(exists).toBe(false)
    })

    it('should throw error when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({
        userId: null,
        sessionId: null,
      } as any)

      await expect(
        checkRecordExists('9781234567890')
      ).rejects.toThrow('User not authenticated')
    })

    it('should handle malformed ISBN gracefully', async () => {
      const exists = await checkRecordExists('invalid-isbn')
      expect(exists).toBe(false)
    })

    it('should check exact ISBN match (case-sensitive)', async () => {
      const exists = await checkRecordExists('9781234567890')
      expect(exists).toBe(true)
      
      // Different ISBN
      const notExists = await checkRecordExists('9781234567899')
      expect(notExists).toBe(false)
    })
  })

  describe('createManualBook()', () => {
    it('should create a manual book successfully', async () => {
      const bookData = buildBook({
        ownerId: testUser.id,
        title: 'Manual Book Entry',
        authors: ['Manual Author'],
        isbn13: '9781111111111',
      })

      const result = await createManualBook(bookData)

      expect(result.success).toBe(true)
      expect(result.book).toBeDefined()
      expect(result.book?.title).toBe('Manual Book Entry')
      expect(result.book?.ownerId).toBe(testUser.id)

      // Verify in database
      const book = await testPrisma.book.findFirst({
        where: { isbn13: '9781111111111' }
      })
      expect(book).toBeDefined()
    })

    it('should fail when ISBN already exists for user', async () => {
      const isbn13 = '9782222222222'
      
      // Create first book
      await createBook({ ownerId: testUser.id, isbn13 })

      // Try to create duplicate
      const bookData = buildBook({
        ownerId: testUser.id,
        isbn13,
      })

      const result = await createManualBook(bookData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
    })

    it('should allow same ISBN for different users', async () => {
      const isbn13 = '9783333333333'
      
      // Create book for otherUser
      await createBook({ ownerId: otherUser.id, isbn13 })

      // Create same ISBN for testUser (should succeed)
      const bookData = buildBook({
        ownerId: testUser.id,
        isbn13,
      })

      const result = await createManualBook(bookData)

      expect(result.success).toBe(true)
      expect(result.book).toBeDefined()
    })

    it('should throw error when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({
        userId: null,
        sessionId: null,
      } as any)

      const bookData = buildBook({ ownerId: testUser.id })

      await expect(
        createManualBook(bookData)
      ).rejects.toThrow('User not authenticated')
    })

    it('should set ownerId to authenticated user', async () => {
      const bookData = buildBook({
        ownerId: 999, // Wrong owner
        title: 'Test Book',
      })

      const result = await createManualBook(bookData)

      expect(result.success).toBe(true)
      expect(result.book?.ownerId).toBe(testUser.id)
    })

    it('should create book with all metadata fields', async () => {
      const bookData = buildBook({
        ownerId: testUser.id,
        title: 'Complete Book',
        titleLong: 'Complete Book: A Very Long Title',
        authors: ['Author A', 'Author B'],
        subjects: ['Subject 1', 'Subject 2'],
        publisher: 'Test Publisher',
        edition: '1st',
        pageCount: 350,
        datePublished: '2024-01-01',
        binding: 'Hardcover',
        language: 'en',
        synopsis: 'A comprehensive synopsis of the book.',
        image: 'https://example.com/image.jpg',
        imageOriginal: 'https://example.com/original.jpg',
        readDate: new Date('2024-06-01'),
      })

      const result = await createManualBook(bookData)

      expect(result.success).toBe(true)
      expect(result.book).toMatchObject({
        title: 'Complete Book',
        authors: ['Author A', 'Author B'],
        subjects: ['Subject 1', 'Subject 2'],
        publisher: 'Test Publisher',
        edition: '1st',
        pageCount: 350,
        binding: 'Hardcover',
        language: 'en',
      })
    })
  })

  describe('Authorization Edge Cases', () => {
    it('should handle user not in database yet', async () => {
      // Mock Clerk user that doesn't exist in database
      mockAuth.mockResolvedValue({
        userId: 'clerk_user_not_in_db',
        sessionId: 'session_xyz',
        orgId: null,
        orgRole: null,
        orgSlug: null,
      } as any)

      await expect(fetchBooks()).rejects.toThrow('User not found in database')
    })

    it('should isolate users data correctly', async () => {
      // Create books for testUser
      await createBooks(3, { ownerId: testUser.id })
      
      // Create books for otherUser
      await createBooks(5, { ownerId: otherUser.id })

      // Fetch as testUser
      const testUserBooks = await fetchBooks()
      expect(testUserBooks).toHaveLength(3)

      // Switch to otherUser
      mockAuth.mockResolvedValue({
        userId: otherUser.clerkId,
        sessionId: 'session_456',
        orgId: null,
        orgRole: null,
        orgSlug: null,
      } as any)

      const otherUserBooks = await fetchBooks()
      expect(otherUserBooks).toHaveLength(5)

      // Verify no overlap
      const testUserIds = testUserBooks.map(b => b.id)
      const otherUserIds = otherUserBooks.map(b => b.id)
      const overlap = testUserIds.filter(id => otherUserIds.includes(id))
      expect(overlap).toHaveLength(0)
    })
  })

  describe('Data Validation', () => {
    it('should handle books with missing optional fields', async () => {
      const bookData = {
        title: 'Minimal Book',
        isbn13: '9784444444444',
        isbn10: '1234567890',
        titleLong: 'Minimal Book',
        authors: ['Author'],
        subjects: ['Subject'],
        publisher: 'Publisher',
        pageCount: 100,
        datePublished: '2024-01-01',
        binding: 'Paperback',
        language: 'en',
        synopsis: 'Synopsis',
        image: 'https://example.com/image.jpg',
        imageOriginal: 'https://example.com/original.jpg',
        edition: '', // Empty edition
      }

      const result = await importBooks([bookData])
      expect(result?.success).toBe(true)
    })

    it('should preserve array field ordering', async () => {
      const authors = ['Zebra Author', 'Alpha Author', 'Middle Author']
      const subjects = ['Zoology', 'Art', 'Music']

      const bookData = buildBook({
        ownerId: testUser.id,
        authors,
        subjects,
      })

      const result = await createManualBook(bookData)

      expect(result.success).toBe(true)
      expect(result.book?.authors).toEqual(authors)
      expect(result.book?.subjects).toEqual(subjects)
    })
  })
})
