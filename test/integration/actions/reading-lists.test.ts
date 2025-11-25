/**
 * Integration tests for reading lists server actions
 * 
 * Tests all reading list CRUD operations, book management,
 * and authorization rules with realistic database interactions.
 */

import { describe, it, expect, beforeEach, afterAll, vi, beforeAll } from 'vitest';
import { resetDatabase, testPrisma } from '../../helpers/db';
import { 
  createUser, 
  createBook, 
  createBooks,
  createReadingList, 
  createReadingListWithBooks,
  createFavoritesYearList,
  createFavoritesAllList,
} from '../../factories';

// Mock Clerk at the top level
let mockAuthReturn: { userId: string | null } = { userId: null };

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => Promise.resolve(mockAuthReturn)),
  clerkMiddleware: vi.fn((handler: any) => handler),
  createRouteMatcher: vi.fn(() => vi.fn(() => false)),
}));

// Helper functions to set mock auth state
function setMockUser(userId: string) {
  mockAuthReturn = { userId };
}

function setMockUnauthenticated() {
  mockAuthReturn = { userId: null };
}

// Import actions AFTER mocking
import * as readingListActions from '../../../src/utils/actions/reading-lists';

describe('[Integration] Reading Lists Server Actions', () => {
  // Clean database before each test for isolation
  beforeEach(async () => {
    await resetDatabase();
    vi.clearAllMocks();
    // Reset to unauthenticated state
    setMockUnauthenticated();
  });

  // Disconnect from database after all tests
  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  describe('createReadingList()', () => {
    describe('Happy Path', () => {
      it('should create a STANDARD reading list with valid data', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const result = await readingListActions.createReadingList(
          'My Reading List',
          'A great collection',
          'PRIVATE',
          'STANDARD'
        );

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.title).toBe('My Reading List');
        expect(result.data?.description).toBe('A great collection');
        expect(result.data?.visibility).toBe('PRIVATE');
        expect(result.data?.type).toBe('STANDARD');
        expect(result.data?.ownerId).toBe(user.id);
      });

      it('should create list with default values when optional params omitted', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const result = await readingListActions.createReadingList('Simple List');

        expect(result.success).toBe(true);
        expect(result.data?.title).toBe('Simple List');
        expect(result.data?.description).toBeNull();
        expect(result.data?.visibility).toBe('PRIVATE');
        expect(result.data?.type).toBe('STANDARD');
      });

      it('should trim whitespace from title and description', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const result = await readingListActions.createReadingList(
          '  My List  ',
          '  Description with spaces  '
        );

        expect(result.success).toBe(true);
        expect(result.data?.title).toBe('My List');
        expect(result.data?.description).toBe('Description with spaces');
      });
    });

    describe('Validation', () => {
      it('should reject empty title', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const result = await readingListActions.createReadingList('');

        expect(result.success).toBe(false);
        expect(result.error).toContain('Title is required');
      });

      it('should reject title longer than 200 characters', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const longTitle = 'a'.repeat(201);
        const result = await readingListActions.createReadingList(longTitle);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Title must be 200 characters or less');
      });
    });

    describe('Business Rules - FAVORITES Lists', () => {
      it('should allow only one FAVORITES_ALL list per user', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const result1 = await readingListActions.createReadingList(
          'All-Time Favorites',
          'My all-time favorites',
          'PRIVATE',
          'FAVORITES_ALL'
        );
        expect(result1.success).toBe(true);

        const result2 = await readingListActions.createReadingList(
          'Another All-Time List',
          'Should fail',
          'PRIVATE',
          'FAVORITES_ALL'
        );

        expect(result2.success).toBe(false);
        expect(result2.error).toContain('already has an all-time favorites list');
      });

      it('should require year for FAVORITES_YEAR type', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const result = await readingListActions.createReadingList(
          'Best of Year',
          null,
          'PRIVATE',
          'FAVORITES_YEAR'
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('Year is required for FAVORITES_YEAR type');
      });
    });

    describe('Authorization', () => {
      it('should require authentication', async () => {
        setMockUnauthenticated();

        const result = await readingListActions.createReadingList('Test List');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('fetchUserReadingLists()', () => {
    describe('Happy Path', () => {
      it('should fetch all reading lists for authenticated user', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        await createReadingList({ ownerId: user.id, title: 'List 1' });
        await createReadingList({ ownerId: user.id, title: 'List 2' });
        await createReadingList({ ownerId: user.id, title: 'List 3' });

        const result = await readingListActions.fetchUserReadingLists();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
      });

      it('should return empty array when user has no lists', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const result = await readingListActions.fetchUserReadingLists();

        expect(result.success).toBe(true);
        expect(result.data).toEqual([]);
      });
    });

    describe('Authorization', () => {
      it('should only return lists owned by authenticated user', async () => {
        const user1 = await createUser({ clerkId: 'user_123' });
        const user2 = await createUser({ clerkId: 'user_456' });

        await createReadingList({ ownerId: user1.id, title: 'User 1 List' });
        await createReadingList({ ownerId: user2.id, title: 'User 2 List' });

        setMockUser('user_123');
        const result = await readingListActions.fetchUserReadingLists();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data?.[0].title).toBe('User 1 List');
      });

      it('should require authentication', async () => {
        setMockUnauthenticated();

        const result = await readingListActions.fetchUserReadingLists();

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('fetchReadingList()', () => {
    describe('Happy Path', () => {
      it('should fetch a single reading list with all books', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const { list } = await createReadingListWithBooks(
          { ownerId: user.id, title: 'Test List' },
          { count: 3 }
        );

        const result = await readingListActions.fetchReadingList(list.id);

        expect(result.success).toBe(true);
        expect(result.data?.id).toBe(list.id);
        expect(result.data?.title).toBe('Test List');
        expect(result.data?.books).toHaveLength(3);
      });

      it('should handle empty reading list', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const list = await createReadingList({ ownerId: user.id });

        const result = await readingListActions.fetchReadingList(list.id);

        expect(result.success).toBe(true);
        expect(result.data?.books).toEqual([]);
      });
    });

    describe('Authorization', () => {
      it('should reject access to another user\'s list', async () => {
        const user1 = await createUser({ clerkId: 'user_123' });
        const user2 = await createUser({ clerkId: 'user_456' });

        const list = await createReadingList({ 
          ownerId: user1.id, 
          title: 'User 1 List' 
        });

        setMockUser('user_456');
        const result = await readingListActions.fetchReadingList(list.id);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Unauthorized');
      });
    });
  });

  describe('updateReadingList()', () => {
    describe('Happy Path', () => {
      it('should update title', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const list = await createReadingList({ 
          ownerId: user.id, 
          title: 'Original Title' 
        });

        const result = await readingListActions.updateReadingList(list.id, {
          title: 'Updated Title',
        });

        expect(result.success).toBe(true);
        expect(result.data?.title).toBe('Updated Title');
      });

      it('should update visibility', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const list = await createReadingList({ 
          ownerId: user.id,
          visibility: 'PRIVATE'
        });

        const result = await readingListActions.updateReadingList(list.id, {
          visibility: 'PUBLIC',
        });

        expect(result.success).toBe(true);
        expect(result.data?.visibility).toBe('PUBLIC');
      });
    });

    describe('Validation', () => {
      it('should reject empty title', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const list = await createReadingList({ ownerId: user.id });

        const result = await readingListActions.updateReadingList(list.id, {
          title: '',
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Title cannot be empty');
      });
    });

    describe('Authorization', () => {
      it('should reject update of another user\'s list', async () => {
        const user1 = await createUser({ clerkId: 'user_123' });
        const user2 = await createUser({ clerkId: 'user_456' });

        const list = await createReadingList({ ownerId: user1.id });

        setMockUser('user_456');
        const result = await readingListActions.updateReadingList(list.id, {
          title: 'Hacked Title',
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Unauthorized');
      });
    });
  });

  describe('deleteReadingList()', () => {
    describe('Happy Path', () => {
      it('should delete an existing reading list', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const list = await createReadingList({ ownerId: user.id });

        const result = await readingListActions.deleteReadingList(list.id);

        expect(result.success).toBe(true);

        const deleted = await testPrisma.readingList.findUnique({
          where: { id: list.id },
        });
        expect(deleted).toBeNull();
      });

      it('should cascade delete book associations', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const { list } = await createReadingListWithBooks(
          { ownerId: user.id },
          { count: 3 }
        );

        const result = await readingListActions.deleteReadingList(list.id);

        expect(result.success).toBe(true);

        const associations = await testPrisma.bookInReadingList.findMany({
          where: { readingListId: list.id },
        });
        expect(associations).toHaveLength(0);
      });
    });

    describe('Authorization', () => {
      it('should reject deletion of another user\'s list', async () => {
        const user1 = await createUser({ clerkId: 'user_123' });
        const user2 = await createUser({ clerkId: 'user_456' });

        const list = await createReadingList({ ownerId: user1.id });

        setMockUser('user_456');
        const result = await readingListActions.deleteReadingList(list.id);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Unauthorized');
      });
    });
  });

  describe('addBookToReadingList()', () => {
    describe('Happy Path', () => {
      it('should add a book to a reading list', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const book = await createBook({ ownerId: user.id });
        const list = await createReadingList({ ownerId: user.id });

        const result = await readingListActions.addBookToReadingList(
          list.id,
          book.id
        );

        expect(result.success).toBe(true);
        expect(result.data?.bookId).toBe(book.id);
        expect(result.data?.readingListId).toBe(list.id);
      });

      it('should auto-calculate position when not provided', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const books = await createBooks(3, { ownerId: user.id });
        const list = await createReadingList({ ownerId: user.id });

        const result1 = await readingListActions.addBookToReadingList(
          list.id,
          books[0].id
        );
        expect(result1.data?.position).toBe(100);

        const result2 = await readingListActions.addBookToReadingList(
          list.id,
          books[1].id
        );
        expect(result2.data?.position).toBe(200);
      });
    });

    describe('Business Rules - FAVORITES Lists', () => {
      it('should enforce max 6 books for FAVORITES_ALL list', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const list = await createFavoritesAllList({ ownerId: user.id });
        const books = await createBooks(7, { ownerId: user.id });

        for (let i = 0; i < 6; i++) {
          const result = await readingListActions.addBookToReadingList(
            list.id,
            books[i].id
          );
          expect(result.success).toBe(true);
        }

        const result = await readingListActions.addBookToReadingList(
          list.id,
          books[6].id
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('maximum of 6 books');
      });
    });

    describe('Validation', () => {
      it('should reject duplicate book in same list', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const book = await createBook({ ownerId: user.id });
        const list = await createReadingList({ ownerId: user.id });

        const result1 = await readingListActions.addBookToReadingList(
          list.id,
          book.id
        );
        expect(result1.success).toBe(true);

        const result2 = await readingListActions.addBookToReadingList(
          list.id,
          book.id
        );

        expect(result2.success).toBe(false);
        expect(result2.error).toContain('already in this reading list');
      });
    });

    describe('Authorization', () => {
      it('should reject adding another user\'s book to own list', async () => {
        const user1 = await createUser({ clerkId: 'user_123' });
        const user2 = await createUser({ clerkId: 'user_456' });

        const book = await createBook({ ownerId: user2.id });
        const list = await createReadingList({ ownerId: user1.id });

        setMockUser('user_123');
        const result = await readingListActions.addBookToReadingList(
          list.id,
          book.id
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('Unauthorized');
      });
    });
  });

  describe('removeBookFromReadingList()', () => {
    describe('Happy Path', () => {
      it('should remove a book from a reading list', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const book = await createBook({ ownerId: user.id });
        const list = await createReadingList({ ownerId: user.id });

        await testPrisma.bookInReadingList.create({
          data: {
            bookId: book.id,
            readingListId: list.id,
            position: 100,
          },
        });

        const result = await readingListActions.removeBookFromReadingList(
          list.id,
          book.id
        );

        expect(result.success).toBe(true);

        const removed = await testPrisma.bookInReadingList.findUnique({
          where: {
            bookId_readingListId: {
              bookId: book.id,
              readingListId: list.id,
            },
          },
        });
        expect(removed).toBeNull();
      });
    });

    describe('Validation', () => {
      it('should return error when book is not in the list', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const book = await createBook({ ownerId: user.id });
        const list = await createReadingList({ ownerId: user.id });

        const result = await readingListActions.removeBookFromReadingList(
          list.id,
          book.id
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('Book is not in this reading list');
      });
    });
  });

  describe('reorderBooksInList()', () => {
    describe('Happy Path', () => {
      it('should reorder books in a list', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const books = await createBooks(3, { ownerId: user.id });
        const list = await createReadingList({ ownerId: user.id });

        for (const book of books) {
          await testPrisma.bookInReadingList.create({
            data: {
              bookId: book.id,
              readingListId: list.id,
              position: book.id * 100,
            },
          });
        }

        const newOrder = [books[2].id, books[1].id, books[0].id];
        const result = await readingListActions.reorderBooksInList(
          list.id,
          newOrder
        );

        expect(result.success).toBe(true);

        const updatedList = await testPrisma.readingList.findUnique({
          where: { id: list.id },
          include: {
            books: {
              orderBy: { position: 'asc' },
            },
          },
        });

        expect(updatedList?.books[0].bookId).toBe(books[2].id);
        expect(updatedList?.books[1].bookId).toBe(books[1].id);
        expect(updatedList?.books[2].bookId).toBe(books[0].id);
      });
    });

    describe('Validation', () => {
      it('should reject when not all books are included', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const books = await createBooks(3, { ownerId: user.id });
        const list = await createReadingList({ ownerId: user.id });

        for (const book of books) {
          await testPrisma.bookInReadingList.create({
            data: {
              bookId: book.id,
              readingListId: list.id,
              position: book.id * 100,
            },
          });
        }

        const result = await readingListActions.reorderBooksInList(
          list.id,
          [books[0].id, books[1].id]
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('Must provide all books in the list');
      });
    });
  });

  describe('updateBookNotesInList()', () => {
    describe('Happy Path', () => {
      it('should update notes for a book in a list', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const book = await createBook({ ownerId: user.id });
        const list = await createReadingList({ ownerId: user.id });

        await testPrisma.bookInReadingList.create({
          data: {
            bookId: book.id,
            readingListId: list.id,
            position: 100,
          },
        });

        const result = await readingListActions.updateBookNotesInList(
          list.id,
          book.id,
          'Great book! Highly recommend.'
        );

        expect(result.success).toBe(true);
        expect(result.data?.notes).toBe('Great book! Highly recommend.');
      });

      it('should clear notes when empty string provided', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const book = await createBook({ ownerId: user.id });
        const list = await createReadingList({ ownerId: user.id });

        await testPrisma.bookInReadingList.create({
          data: {
            bookId: book.id,
            readingListId: list.id,
            position: 100,
            notes: 'Some notes',
          },
        });

        const result = await readingListActions.updateBookNotesInList(
          list.id,
          book.id,
          ''
        );

        expect(result.success).toBe(true);
        expect(result.data?.notes).toBeNull();
      });
    });

    describe('Validation', () => {
      it('should reject notes longer than 2000 characters', async () => {
        const user = await createUser({ clerkId: 'user_123' });
        setMockUser('user_123');

        const book = await createBook({ ownerId: user.id });
        const list = await createReadingList({ ownerId: user.id });

        await testPrisma.bookInReadingList.create({
          data: {
            bookId: book.id,
            readingListId: list.id,
            position: 100,
          },
        });

        const longNotes = 'a'.repeat(2001);
        const result = await readingListActions.updateBookNotesInList(
          list.id,
          book.id,
          longNotes
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('Notes must be 2000 characters or less');
      });
    });
  });
});
