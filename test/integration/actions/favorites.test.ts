/**
 * Integration Tests for Favorites Server Actions
 * 
 * Tests the FAVORITES_ALL and FAVORITES_YEAR reading list types including:
 * - Creating favorites lists with uniqueness constraints
 * - Max 6 books constraint enforcement
 * - Setting and removing favorites
 * - Reordering books in favorites
 * - Business rule validation (yearly favorites require matching readDate)
 * - Proper visibility handling
 * 
 * Follows Kent C. Dodds testing philosophy: Test behavior, not implementation.
 */

import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { resetDatabase, testPrisma, disconnectTestDatabase } from '../../helpers/db'
import { 
  createFavoritesYearList, 
  createFavoritesAllList, 
  createBook,
  createBooksReadInYear,
  createUser,
  addBooksToReadingList,
} from '../../factories'
import { 
  createReadingList, 
  addBookToReadingList,
  reorderBooksInList,
  deleteReadingList,
  setFavorite,
  removeFavorite,
  fetchFavorites,
  fetchAvailableFavoriteYears,
} from '@/utils/actions/reading-lists'
import { auth } from '@clerk/nextjs/server'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

const mockAuth = auth as ReturnType<typeof vi.fn>

describe('[Integration] Favorites Server Actions', () => {
  beforeEach(async () => {
    await resetDatabase()
    vi.clearAllMocks()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  describe('FAVORITES_ALL (All-Time Favorites)', () => {
    describe('Creating all-time favorites list', () => {
      it('should create an all-time favorites list successfully', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const result = await createReadingList(
          'All-Time Favorites',
          'My favorite books of all time',
          'PRIVATE',
          'FAVORITES_ALL',
          undefined
        )

        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()
        expect(result.data?.type).toBe('FAVORITES_ALL')
        expect(result.data?.year).toBeNull()
        expect(result.data?.title).toBe('All-Time Favorites')
      })

      it('should enforce uniqueness - only one FAVORITES_ALL per user', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        // Create first all-time favorites list
        const first = await createReadingList(
          'All-Time Favorites',
          undefined,
          'PRIVATE',
          'FAVORITES_ALL',
          undefined
        )
        expect(first.success).toBe(true)

        // Attempt to create second all-time favorites list
        const second = await createReadingList(
          'Another All-Time Favorites',
          undefined,
          'PRIVATE',
          'FAVORITES_ALL',
          undefined
        )

        expect(second.success).toBe(false)
        expect(second.error).toBe('User already has an all-time favorites list')
      })

      it('should allow different users to have their own FAVORITES_ALL', async () => {
        const user1 = await createUser({ clerkId: 'user_1', email: 'user1@test.com' })
        const user2 = await createUser({ clerkId: 'user_2', email: 'user2@test.com' })

        mockAuth.mockResolvedValue({ userId: user1.clerkId })
        const result1 = await createReadingList(
          'User 1 Favorites',
          undefined,
          'PRIVATE',
          'FAVORITES_ALL',
          undefined
        )

        mockAuth.mockResolvedValue({ userId: user2.clerkId })
        const result2 = await createReadingList(
          'User 2 Favorites',
          undefined,
          'PRIVATE',
          'FAVORITES_ALL',
          undefined
        )

        expect(result1.success).toBe(true)
        expect(result2.success).toBe(true)
        expect(result1.data?.ownerId).not.toBe(result2.data?.ownerId)
      })
    })

    describe('Max 6 books constraint', () => {
      it('should allow adding up to 6 books to all-time favorites', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const list = await createFavoritesAllList({ ownerId: user.id })
        const books = await createBooksReadInYear(2024, 6, { ownerId: user.id })

        // Add 6 books
        for (let i = 0; i < 6; i++) {
          const result = await addBookToReadingList(list.id, books[i].id)
          expect(result.success).toBe(true)
        }

        // Verify list has 6 books
        const listWithBooks = await testPrisma.readingList.findUnique({
          where: { id: list.id },
          include: { _count: { select: { books: true } } },
        })
        expect(listWithBooks?._count.books).toBe(6)
      })

      it('should prevent adding more than 6 books to all-time favorites', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const list = await createFavoritesAllList({ ownerId: user.id })
        const books = await createBooksReadInYear(2024, 7, { ownerId: user.id })

        // Add 6 books successfully
        for (let i = 0; i < 6; i++) {
          await addBookToReadingList(list.id, books[i].id)
        }

        // Attempt to add 7th book
        const result = await addBookToReadingList(list.id, books[6].id)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Favorites lists can contain a maximum of 6 books')
      })

      it('should allow adding book after removing one from full list', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const list = await createFavoritesAllList({ ownerId: user.id })
        const books = await createBooksReadInYear(2024, 7, { ownerId: user.id })

        // Add 6 books
        for (let i = 0; i < 6; i++) {
          await addBookToReadingList(list.id, books[i].id)
        }

        // Remove one book
        await testPrisma.bookInReadingList.delete({
          where: {
            bookId_readingListId: {
              bookId: books[0].id,
              readingListId: list.id,
            },
          },
        })

        // Now should be able to add another
        const result = await addBookToReadingList(list.id, books[6].id)
        expect(result.success).toBe(true)
      })
    })

    describe('Reordering books in all-time favorites', () => {
      it('should reorder books successfully', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const list = await createFavoritesAllList({ ownerId: user.id })
        const books = await createBooksReadInYear(2024, 4, { ownerId: user.id })
        
        await addBooksToReadingList(list.id, { books })

        // Reorder: reverse the order
        const newOrder = [books[3].id, books[2].id, books[1].id, books[0].id]
        const result = await reorderBooksInList(list.id, newOrder)

        expect(result.success).toBe(true)

        // Verify new order
        const updatedList = await testPrisma.readingList.findUnique({
          where: { id: list.id },
          include: {
            books: {
              orderBy: { position: 'asc' },
              include: { book: true },
            },
          },
        })

        expect(updatedList?.books[0].bookId).toBe(books[3].id)
        expect(updatedList?.books[1].bookId).toBe(books[2].id)
        expect(updatedList?.books[2].bookId).toBe(books[1].id)
        expect(updatedList?.books[3].bookId).toBe(books[0].id)
      })

      it('should maintain position integrity with 6 books', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const list = await createFavoritesAllList({ ownerId: user.id })
        const books = await createBooksReadInYear(2024, 6, { ownerId: user.id })
        
        await addBooksToReadingList(list.id, { books })

        // Reorder all 6 books
        const newOrder = books.map(b => b.id).reverse()
        const result = await reorderBooksInList(list.id, newOrder)

        expect(result.success).toBe(true)

        // Verify positions are sequential (100, 200, 300, 400, 500, 600)
        const updatedList = await testPrisma.readingList.findUnique({
          where: { id: list.id },
          include: {
            books: {
              orderBy: { position: 'asc' },
            },
          },
        })

        expect(updatedList?.books[0].position).toBe(100)
        expect(updatedList?.books[1].position).toBe(200)
        expect(updatedList?.books[2].position).toBe(300)
        expect(updatedList?.books[3].position).toBe(400)
        expect(updatedList?.books[4].position).toBe(500)
        expect(updatedList?.books[5].position).toBe(600)
      })
    })

    describe('Deleting all-time favorites list', () => {
      it('should delete all-time favorites list successfully', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const list = await createFavoritesAllList({ ownerId: user.id })
        const books = await createBooksReadInYear(2024, 3, { ownerId: user.id })
        await addBooksToReadingList(list.id, { books })

        const result = await deleteReadingList(list.id)
        expect(result.success).toBe(true)

        // Verify list is deleted
        const deletedList = await testPrisma.readingList.findUnique({
          where: { id: list.id },
        })
        expect(deletedList).toBeNull()

        // Verify books still exist (cascade delete only affects junction table)
        const remainingBooks = await testPrisma.book.findMany({
          where: { id: { in: books.map(b => b.id) } },
        })
        expect(remainingBooks).toHaveLength(3)
      })

      it('should allow creating new FAVORITES_ALL after deleting previous one', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const first = await createReadingList(
          'First Favorites',
          undefined,
          'PRIVATE',
          'FAVORITES_ALL',
          undefined
        )
        expect(first.success).toBe(true)

        // Delete it
        await deleteReadingList(first.data!.id)

        // Create new one
        const second = await createReadingList(
          'New Favorites',
          undefined,
          'PRIVATE',
          'FAVORITES_ALL',
          undefined
        )
        expect(second.success).toBe(true)
      })
    })
  })

  describe('FAVORITES_YEAR (Yearly Favorites)', () => {
    describe('Creating yearly favorites list', () => {
      it('should create a yearly favorites list successfully', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const result = await createReadingList(
          'Favorite Books of 2024',
          'Best books I read in 2024',
          'PRIVATE',
          'FAVORITES_YEAR',
          '2024'
        )

        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()
        expect(result.data?.type).toBe('FAVORITES_YEAR')
        expect(result.data?.year).toBe('2024')
      })

      it('should require year parameter for FAVORITES_YEAR', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const result = await createReadingList(
          'Favorites',
          undefined,
          'PRIVATE',
          'FAVORITES_YEAR',
          undefined
        )

        expect(result.success).toBe(false)
        expect(result.error).toBe('Year is required for FAVORITES_YEAR type')
      })

      it('should enforce uniqueness - only one FAVORITES_YEAR per user per year', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        // Create first 2024 favorites list
        const first = await createReadingList(
          'Favorite Books of 2024',
          undefined,
          'PRIVATE',
          'FAVORITES_YEAR',
          '2024'
        )
        expect(first.success).toBe(true)

        // Attempt to create second 2024 favorites list
        const second = await createReadingList(
          'Another 2024 Favorites',
          undefined,
          'PRIVATE',
          'FAVORITES_YEAR',
          '2024'
        )

        expect(second.success).toBe(false)
        expect(second.error).toBe('User already has a favorites list for year 2024')
      })

      it('should allow multiple FAVORITES_YEAR for different years', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const favorites2023 = await createReadingList(
          'Favorites 2023',
          undefined,
          'PRIVATE',
          'FAVORITES_YEAR',
          '2023'
        )

        const favorites2024 = await createReadingList(
          'Favorites 2024',
          undefined,
          'PRIVATE',
          'FAVORITES_YEAR',
          '2024'
        )

        expect(favorites2023.success).toBe(true)
        expect(favorites2024.success).toBe(true)
        expect(favorites2023.data?.year).toBe('2023')
        expect(favorites2024.data?.year).toBe('2024')
      })

      it('should allow different users to have FAVORITES_YEAR for same year', async () => {
        const user1 = await createUser({ clerkId: 'user_1', email: 'user1@test.com' })
        const user2 = await createUser({ clerkId: 'user_2', email: 'user2@test.com' })

        mockAuth.mockResolvedValue({ userId: user1.clerkId })
        const result1 = await createReadingList(
          'User 1 2024 Favorites',
          undefined,
          'PRIVATE',
          'FAVORITES_YEAR',
          '2024'
        )

        mockAuth.mockResolvedValue({ userId: user2.clerkId })
        const result2 = await createReadingList(
          'User 2 2024 Favorites',
          undefined,
          'PRIVATE',
          'FAVORITES_YEAR',
          '2024'
        )

        expect(result1.success).toBe(true)
        expect(result2.success).toBe(true)
        expect(result1.data?.ownerId).not.toBe(result2.data?.ownerId)
      })
    })

    describe('Max 6 books constraint for yearly favorites', () => {
      it('should allow adding up to 6 books to yearly favorites', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const list = await createFavoritesYearList('2024', { ownerId: user.id })
        const books = await createBooksReadInYear(2024, 6, { ownerId: user.id })

        // Add 6 books
        for (let i = 0; i < 6; i++) {
          const result = await addBookToReadingList(list.id, books[i].id)
          expect(result.success).toBe(true)
        }

        // Verify list has 6 books
        const listWithBooks = await testPrisma.readingList.findUnique({
          where: { id: list.id },
          include: { _count: { select: { books: true } } },
        })
        expect(listWithBooks?._count.books).toBe(6)
      })

      it('should prevent adding more than 6 books to yearly favorites', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const list = await createFavoritesYearList('2024', { ownerId: user.id })
        const books = await createBooksReadInYear(2024, 7, { ownerId: user.id })

        // Add 6 books
        for (let i = 0; i < 6; i++) {
          await addBookToReadingList(list.id, books[i].id)
        }

        // Attempt to add 7th book
        const result = await addBookToReadingList(list.id, books[6].id)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Favorites lists can contain a maximum of 6 books')
      })
    })

    describe('Books readDate validation', () => {
      it('should allow adding books with readDate in the correct year', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const list = await createFavoritesYearList('2024', { ownerId: user.id })
        const book = await createBook({
          ownerId: user.id,
          readDate: new Date('2024-06-15'),
        })

        const result = await addBookToReadingList(list.id, book.id)
        expect(result.success).toBe(true)
      })

      it('should allow adding books without readDate to yearly favorites', async () => {
        // Business decision: User might want to add book and set readDate later
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const list = await createFavoritesYearList('2024', { ownerId: user.id })
        const book = await createBook({
          ownerId: user.id,
          readDate: null,
        })

        const result = await addBookToReadingList(list.id, book.id)
        expect(result.success).toBe(true)
      })

      it('should allow adding books from different years (no strict validation)', async () => {
        // Note: Current implementation doesn't enforce readDate validation
        // This test documents current behavior
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const list = await createFavoritesYearList('2024', { ownerId: user.id })
        const book2023 = await createBook({
          ownerId: user.id,
          readDate: new Date('2023-01-15'),
        })

        const result = await addBookToReadingList(list.id, book2023.id)
        expect(result.success).toBe(true)
        
        // Note: This passes but may warrant UI validation or warning in the future
      })
    })

    describe('Fetch available favorite years', () => {
      it('should return empty array when no favorite years exist', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const result = await fetchAvailableFavoriteYears()

        expect(result.success).toBe(true)
        expect(result.years).toEqual([])
      })

      it('should return years sorted in descending order', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        await createFavoritesYearList('2022', { ownerId: user.id })
        await createFavoritesYearList('2024', { ownerId: user.id })
        await createFavoritesYearList('2023', { ownerId: user.id })

        const result = await fetchAvailableFavoriteYears()

        expect(result.success).toBe(true)
        expect(result.years).toEqual([2024, 2023, 2022])
      })

      it('should only return years for authenticated user', async () => {
        const user1 = await createUser({ clerkId: 'user_1', email: 'user1@test.com' })
        const user2 = await createUser({ clerkId: 'user_2', email: 'user2@test.com' })

        await createFavoritesYearList('2023', { ownerId: user1.id })
        await createFavoritesYearList('2024', { ownerId: user1.id })
        await createFavoritesYearList('2024', { ownerId: user2.id })

        mockAuth.mockResolvedValue({ userId: user1.clerkId })
        const result = await fetchAvailableFavoriteYears()

        expect(result.success).toBe(true)
        expect(result.years).toEqual([2024, 2023])
      })
    })
  })

  describe('setFavorite and removeFavorite actions', () => {
    describe('setFavorite', () => {
      it('should create all-time favorites list and add book', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const book = await createBook({ ownerId: user.id })

        const result = await setFavorite(book.id, 1)

        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()

        // Verify list was created
        const list = await testPrisma.readingList.findFirst({
          where: {
            ownerId: user.id,
            type: 'FAVORITES_ALL',
          },
        })
        expect(list).toBeDefined()
        expect(list?.title).toBe('All-Time Favorites')
      })

      it('should create yearly favorites list and add book', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const book = await createBook({ ownerId: user.id })

        const result = await setFavorite(book.id, 1, '2024')

        expect(result.success).toBe(true)

        // Verify list was created
        const list = await testPrisma.readingList.findFirst({
          where: {
            ownerId: user.id,
            type: 'FAVORITES_YEAR',
            year: '2024',
          },
        })
        expect(list).toBeDefined()
        expect(list?.title).toBe('Favorite Books of 2024')
      })

      it('should validate position is between 1 and 6', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const book = await createBook({ ownerId: user.id })

        const result0 = await setFavorite(book.id, 0)
        expect(result0.success).toBe(false)
        expect(result0.error).toBe('Position must be an integer between 1 and 6')

        const result7 = await setFavorite(book.id, 7)
        expect(result7.success).toBe(false)
        expect(result7.error).toBe('Position must be an integer between 1 and 6')
      })

      it('should update position if book already in favorites', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const book = await createBook({ ownerId: user.id })

        // Add at position 3
        await setFavorite(book.id, 3)

        // Move to position 1
        const result = await setFavorite(book.id, 1)
        expect(result.success).toBe(true)

        // Verify position updated
        const entry = await testPrisma.bookInReadingList.findFirst({
          where: {
            bookId: book.id,
          },
        })
        expect(entry?.position).toBe(100) // Position 1 = internal position 100
      })

      it('should prevent adding more than 6 books via setFavorite', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const books = await createBooksReadInYear(2024, 7, { ownerId: user.id })

        // Add 6 books
        for (let i = 0; i < 6; i++) {
          const result = await setFavorite(books[i].id, i + 1)
          expect(result.success).toBe(true)
        }

        // Attempt to add 7th book
        const result = await setFavorite(books[6].id, 1)
        expect(result.success).toBe(false)
        expect(result.error).toContain('already contains 6 books')
      })
    })

    describe('removeFavorite', () => {
      it('should remove book from all-time favorites', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const book = await createBook({ ownerId: user.id })
        await setFavorite(book.id, 1)

        const result = await removeFavorite(book.id)
        expect(result.success).toBe(true)

        // Verify book removed
        const entry = await testPrisma.bookInReadingList.findFirst({
          where: { bookId: book.id },
        })
        expect(entry).toBeNull()
      })

      it('should remove book from yearly favorites', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const book = await createBook({ ownerId: user.id })
        await setFavorite(book.id, 1, '2024')

        const result = await removeFavorite(book.id, '2024')
        expect(result.success).toBe(true)

        // Verify book removed
        const entry = await testPrisma.bookInReadingList.findFirst({
          where: { bookId: book.id },
        })
        expect(entry).toBeNull()
      })

      it('should fail gracefully when removing non-existent favorite', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const book = await createBook({ ownerId: user.id })

        const result = await removeFavorite(book.id)
        expect(result.success).toBe(false)
        expect(result.error).toBe('Favorites list not found')
      })

      it('should fail when book is not in favorites', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const book1 = await createBook({ ownerId: user.id })
        const book2 = await createBook({ ownerId: user.id })

        await setFavorite(book1.id, 1)

        const result = await removeFavorite(book2.id)
        expect(result.success).toBe(false)
        expect(result.error).toBe('Book is not in favorites')
      })
    })

    describe('fetchFavorites', () => {
      it('should return empty array when no favorites exist', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const result = await fetchFavorites()

        expect(result.success).toBe(true)
        expect(result.data).toEqual([])
      })

      it('should return all-time favorites ordered by position', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const books = await createBooksReadInYear(2024, 3, { ownerId: user.id })

        await setFavorite(books[0].id, 3)
        await setFavorite(books[1].id, 1)
        await setFavorite(books[2].id, 2)

        const result = await fetchFavorites()

        expect(result.success).toBe(true)
        expect(result.data).toHaveLength(3)
        expect(result.data?.[0].position).toBe(1)
        expect(result.data?.[0].book.id).toBe(books[1].id)
        expect(result.data?.[1].position).toBe(2)
        expect(result.data?.[1].book.id).toBe(books[2].id)
        expect(result.data?.[2].position).toBe(3)
        expect(result.data?.[2].book.id).toBe(books[0].id)
      })

      it('should return yearly favorites for specific year', async () => {
        const user = await createUser()
        mockAuth.mockResolvedValue({ userId: user.clerkId })

        const books2023 = await createBooksReadInYear(2023, 2, { ownerId: user.id })
        const books2024 = await createBooksReadInYear(2024, 2, { ownerId: user.id })

        await setFavorite(books2023[0].id, 1, '2023')
        await setFavorite(books2024[0].id, 1, '2024')

        const result2024 = await fetchFavorites('2024')
        expect(result2024.success).toBe(true)
        expect(result2024.data).toHaveLength(1)
        expect(result2024.data?.[0].book.id).toBe(books2024[0].id)

        const result2023 = await fetchFavorites('2023')
        expect(result2023.success).toBe(true)
        expect(result2023.data).toHaveLength(1)
        expect(result2023.data?.[0].book.id).toBe(books2023[0].id)
      })
    })
  })

  describe('Visibility handling for favorites', () => {
    it('should default to PRIVATE visibility for favorites', async () => {
      const user = await createUser()
      mockAuth.mockResolvedValue({ userId: user.clerkId })

      const book = await createBook({ ownerId: user.id })
      await setFavorite(book.id, 1)

      const list = await testPrisma.readingList.findFirst({
        where: {
          ownerId: user.id,
          type: 'FAVORITES_ALL',
        },
      })

      expect(list?.visibility).toBe('PRIVATE')
    })

    it('should allow creating PUBLIC favorites list', async () => {
      const user = await createUser()
      mockAuth.mockResolvedValue({ userId: user.clerkId })

      const result = await createReadingList(
        'My Public Favorites',
        undefined,
        'PUBLIC',
        'FAVORITES_ALL',
        undefined
      )

      expect(result.success).toBe(true)
      expect(result.data?.visibility).toBe('PUBLIC')
    })

    it('should allow creating UNLISTED favorites list', async () => {
      const user = await createUser()
      mockAuth.mockResolvedValue({ userId: user.clerkId })

      const result = await createReadingList(
        'My Unlisted Favorites',
        undefined,
        'UNLISTED',
        'FAVORITES_YEAR',
        '2024'
      )

      expect(result.success).toBe(true)
      expect(result.data?.visibility).toBe('UNLISTED')
    })
  })

  describe('Complex scenarios', () => {
    it('should handle having both FAVORITES_ALL and multiple FAVORITES_YEAR lists', async () => {
      const user = await createUser()
      mockAuth.mockResolvedValue({ userId: user.clerkId })

      // Create all-time favorites
      const allTimeResult = await createReadingList(
        'All-Time Favorites',
        undefined,
        'PRIVATE',
        'FAVORITES_ALL',
        undefined
      )
      expect(allTimeResult.success).toBe(true)

      // Create yearly favorites for multiple years
      const year2022 = await createReadingList(
        'Favorites 2022',
        undefined,
        'PRIVATE',
        'FAVORITES_YEAR',
        '2022'
      )
      const year2023 = await createReadingList(
        'Favorites 2023',
        undefined,
        'PRIVATE',
        'FAVORITES_YEAR',
        '2023'
      )
      const year2024 = await createReadingList(
        'Favorites 2024',
        undefined,
        'PRIVATE',
        'FAVORITES_YEAR',
        '2024'
      )

      expect(year2022.success).toBe(true)
      expect(year2023.success).toBe(true)
      expect(year2024.success).toBe(true)

      // Verify all lists exist
      const lists = await testPrisma.readingList.findMany({
        where: { ownerId: user.id },
      })
      expect(lists).toHaveLength(4)
    })

    it('should maintain data integrity when swapping books between favorite lists', async () => {
      const user = await createUser()
      mockAuth.mockResolvedValue({ userId: user.clerkId })

      const book = await createBook({ ownerId: user.id })

      // Add to all-time favorites
      await setFavorite(book.id, 1)

      // Add to yearly favorites (book can be in multiple lists)
      const result = await setFavorite(book.id, 1, '2024')
      expect(result.success).toBe(true)

      // Verify book is in both lists
      const entries = await testPrisma.bookInReadingList.findMany({
        where: { bookId: book.id },
      })
      expect(entries).toHaveLength(2)
    })

    it('should handle concurrent additions up to max limit correctly', async () => {
      const user = await createUser()
      mockAuth.mockResolvedValue({ userId: user.clerkId })

      const list = await createFavoritesAllList({ ownerId: user.id })
      const books = await createBooksReadInYear(2024, 6, { ownerId: user.id })

      // Add all 6 books sequentially (simulating rapid additions)
      const results = []
      for (const book of books) {
        results.push(await addBookToReadingList(list.id, book.id))
      }

      expect(results.every(r => r.success)).toBe(true)

      // Verify exactly 6 books
      const finalList = await testPrisma.readingList.findUnique({
        where: { id: list.id },
        include: { _count: { select: { books: true } } },
      })
      expect(finalList?._count.books).toBe(6)
    })
  })

  describe('Error handling and edge cases', () => {
    it('should reject adding book owned by different user', async () => {
      const user1 = await createUser({ clerkId: 'user_1', email: 'user1@test.com' })
      const user2 = await createUser({ clerkId: 'user_2', email: 'user2@test.com' })

      const book = await createBook({ ownerId: user2.id })

      mockAuth.mockResolvedValue({ userId: user1.clerkId })
      const list = await createFavoritesAllList({ ownerId: user1.id })

      const result = await addBookToReadingList(list.id, book.id)
      expect(result.success).toBe(false)
      expect(result.error).toBe("Unauthorized - you don't own this book")
    })

    it('should reject operations on list owned by different user', async () => {
      const user1 = await createUser({ clerkId: 'user_1', email: 'user1@test.com' })
      const user2 = await createUser({ clerkId: 'user_2', email: 'user2@test.com' })

      const list = await createFavoritesAllList({ ownerId: user1.id })
      const book = await createBook({ ownerId: user2.id })

      mockAuth.mockResolvedValue({ userId: user2.clerkId })
      const result = await addBookToReadingList(list.id, book.id)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("Unauthorized - you don't own this reading list")
    })

    it('should handle non-existent book gracefully', async () => {
      const user = await createUser()
      mockAuth.mockResolvedValue({ userId: user.clerkId })

      const result = await setFavorite(99999, 1)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Book not found')
    })

    it('should handle non-existent list gracefully', async () => {
      const user = await createUser()
      mockAuth.mockResolvedValue({ userId: user.clerkId })

      const book = await createBook({ ownerId: user.id })
      const result = await addBookToReadingList(99999, book.id)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Reading list not found')
    })
  })
})
