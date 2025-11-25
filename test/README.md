# Penumbra Testing Guide

Comprehensive test utilities for the Penumbra project, including database helpers, data factories, and integration tests.

## Quick Start

### 1. Database Setup (Required for Integration Tests)

Integration tests require a PostgreSQL database. Choose one of these options:

#### Option A: Local PostgreSQL (Recommended)

```bash
# Install PostgreSQL
brew install postgresql@15  # macOS
brew services start postgresql@15

# Create test database
psql postgres -c "CREATE USER test WITH PASSWORD 'test';"
psql postgres -c "CREATE DATABASE penumbra_test OWNER test;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE penumbra_test TO test;"

# Run migrations
export DEWEY_DB_DATABASE_URL="postgresql://test:test@localhost:5432/penumbra_test"
npx prisma migrate deploy
npx prisma generate
```

#### Option B: Docker

```bash
docker run --name penumbra-test-db \
  -e POSTGRES_USER=test \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=penumbra_test \
  -p 5432:5432 \
  -d postgres:15

# Run migrations
export DEWEY_DB_DATABASE_URL="postgresql://test:test@localhost:5432/penumbra_test"
npx prisma migrate deploy
npx prisma generate
```

### 2. Install Dependencies

```bash
npm install --save-dev @faker-js/faker @types/node
```

### 3. Run Tests

```bash
# All tests
npm test

# With coverage
npm test:coverage

# Watch mode
npm test:watch
```

## Overview

This test suite provides:

- **Database Helpers** (`test/helpers/db.ts`): Utilities for database setup, teardown, and management
- **User Factory** (`test/factories/user.factory.ts`): Generate test user data
- **Book Factory** (`test/factories/book.factory.ts`): Generate test book data
- **Reading List Factory** (`test/factories/reading-list.factory.ts`): Generate test reading list data

## Database Helpers

### resetDatabase()

Clears all data from the database in proper order to respect foreign key constraints.

```typescript
import { resetDatabase } from './test/helpers/db';

beforeEach(async () => {
  await resetDatabase();
});
```

### seedTestUser(overrides?)

Creates a standard test user with predictable data.

```typescript
import { seedTestUser } from './test/helpers/db';

const user = await seedTestUser();
const customUser = await seedTestUser({ 
  email: 'custom@example.com',
  name: 'Custom User' 
});
```

### withTransaction(fn)

Execute operations within a transaction that will be rolled back.

```typescript
import { withTransaction } from './test/helpers/db';

await withTransaction(async (tx) => {
  const user = await tx.user.create({ data: { ... } });
  // Test operations...
  // Transaction will rollback automatically
});
```

### cleanupTables(tables)

Clean specific tables while maintaining referential integrity.

```typescript
import { cleanupTables } from './test/helpers/db';

// Clean only books and their relationships
await cleanupTables(['bookInReadingList', 'book']);
```

### isDatabaseReady()

Check if database is accessible and ready for testing.

```typescript
import { isDatabaseReady } from './test/helpers/db';

beforeAll(async () => {
  const isReady = await isDatabaseReady();
  if (!isReady) {
    throw new Error('Database not ready for testing');
  }
});
```

### getTableCounts()

Get count of records in each table for debugging.

```typescript
import { getTableCounts } from './test/helpers/db';

const counts = await getTableCounts();
console.log(`Users: ${counts.users}, Books: ${counts.books}`);
```

### disconnectTestDatabase()

Disconnect the test Prisma client.

```typescript
import { disconnectTestDatabase } from './test/helpers/db';

afterAll(async () => {
  await disconnectTestDatabase();
});
```

## User Factory

### buildUser(options?)

Build a user object without persisting to database.

```typescript
import { buildUser } from './test/factories/user.factory';

const userData = buildUser();
const customUser = buildUser({ 
  email: 'specific@example.com',
  name: 'John Doe' 
});
```

### createUser(options?)

Create a user in the database with realistic test data.

```typescript
import { createUser } from './test/factories/user.factory';

const user = await createUser();
const adminUser = await createUser({ 
  email: 'admin@example.com',
  name: 'Admin User' 
});
```

### createUsers(count, baseOptions?)

Create multiple users in the database.

```typescript
import { createUsers } from './test/factories/user.factory';

const users = await createUsers(5);
const testUsers = await createUsers(3, { 
  profileImageUrl: null 
});
```

### createUserWithProfileImage(options?)

Create a user with a profile image URL.

```typescript
import { createUserWithProfileImage } from './test/factories/user.factory';

const userWithAvatar = await createUserWithProfileImage();
```

### createUserWithClerkId(clerkIdPattern, options?)

Create a user with a specific Clerk ID pattern.

```typescript
import { createUserWithClerkId } from './test/factories/user.factory';

const user = await createUserWithClerkId('user_test_123');
```

## Book Factory

### buildBook(options?)

Build a book object without persisting to database.

```typescript
import { buildBook } from './test/factories/book.factory';

const bookData = buildBook({ ownerId: 1 });
const customBook = buildBook({ 
  ownerId: 1,
  title: 'The Great Gatsby',
  authors: ['F. Scott Fitzgerald']
});
```

### createBook(options?)

Create a book in the database. Creates a user if no ownerId provided.

```typescript
import { createBook } from './test/factories/book.factory';

const book = await createBook({ ownerId: 1 });
const publicBook = await createBook({ 
  ownerId: 1,
  title: '1984',
  authors: ['George Orwell'],
  visibility: 'PUBLIC'
});
```

### createBooks(count, baseOptions?)

Create multiple books in the database.

```typescript
import { createBooks } from './test/factories/book.factory';

const books = await createBooks(5, { ownerId: 1 });
const publicBooks = await createBooks(3, { 
  ownerId: 1,
  visibility: 'PUBLIC' 
});
```

### createBookWithVisibility(visibility, options?)

Create a book with specific visibility setting.

```typescript
import { createBookWithVisibility } from './test/factories/book.factory';

const privateBook = await createBookWithVisibility('PRIVATE', { ownerId: 1 });
const publicBook = await createBookWithVisibility('PUBLIC', { ownerId: 1 });
```

### createReadBook(options?)

Create a book that the user has read (with readDate set).

```typescript
import { createReadBook } from './test/factories/book.factory';

const readBook = await createReadBook({ ownerId: 1 });
const recentlyRead = await createReadBook({ 
  ownerId: 1,
  readDate: new Date('2024-01-15')
});
```

### createUnreadBook(options?)

Create a book that the user hasn't read yet (readDate is null).

```typescript
import { createUnreadBook } from './test/factories/book.factory';

const unreadBook = await createUnreadBook({ ownerId: 1 });
```

### createBooksReadInYear(year, count, baseOptions?)

Create books read in a specific year.

```typescript
import { createBooksReadInYear } from './test/factories/book.factory';

const books2024 = await createBooksReadInYear(2024, 5, { ownerId: 1 });
```

### createBookByAuthor(author, options?)

Create a book by a specific author.

```typescript
import { createBookByAuthor } from './test/factories/book.factory';

const book = await createBookByAuthor('Jane Austen', { ownerId: 1 });
```

### createBookWithMultipleAuthors(authors, options?)

Create a book with multiple authors.

```typescript
import { createBookWithMultipleAuthors } from './test/factories/book.factory';

const book = await createBookWithMultipleAuthors(
  ['Author One', 'Author Two'],
  { ownerId: 1 }
);
```

## Reading List Factory

### buildReadingList(options?)

Build a reading list object without persisting to database.

```typescript
import { buildReadingList } from './test/factories/reading-list.factory';

const listData = buildReadingList({ ownerId: 1 });
const favoritesList = buildReadingList({ 
  ownerId: 1,
  type: 'FAVORITES_YEAR',
  year: '2024'
});
```

### createReadingList(options?)

Create a reading list in the database. Creates a user if no ownerId provided.

```typescript
import { createReadingList } from './test/factories/reading-list.factory';

const list = await createReadingList({ ownerId: 1 });
const publicList = await createReadingList({ 
  ownerId: 1,
  title: 'Summer Reading',
  visibility: 'PUBLIC'
});
```

### createReadingLists(count, baseOptions?)

Create multiple reading lists in the database.

```typescript
import { createReadingLists } from './test/factories/reading-list.factory';

const lists = await createReadingLists(5, { ownerId: 1 });
```

### addBooksToReadingList(readingListId, options?)

Add books to an existing reading list.

```typescript
import { addBooksToReadingList } from './test/factories/reading-list.factory';

// Add existing books
await addBooksToReadingList(listId, { bookIds: [1, 2, 3] });

// Create and add new books
await addBooksToReadingList(listId, { count: 5 });

// Add books with notes
await addBooksToReadingList(listId, { books, withNotes: true });
```

### createReadingListWithBooks(listOptions?, booksOptions?)

Create a reading list with books already added.

```typescript
import { createReadingListWithBooks } from './test/factories/reading-list.factory';

const { list, entries } = await createReadingListWithBooks(
  { ownerId: 1, title: 'Favorites' },
  { count: 5, withNotes: true }
);
```

### createFavoritesYearList(year, options?)

Create a favorites list for a specific year.

```typescript
import { createFavoritesYearList } from './test/factories/reading-list.factory';

const favorites2024 = await createFavoritesYearList('2024', { ownerId: 1 });
```

### createFavoritesAllList(options?)

Create an all-time favorites list.

```typescript
import { createFavoritesAllList } from './test/factories/reading-list.factory';

const allTimeFavorites = await createFavoritesAllList({ ownerId: 1 });
```

### createStandardList(options?)

Create a standard (non-favorites) reading list.

```typescript
import { createStandardList } from './test/factories/reading-list.factory';

const readingList = await createStandardList({ 
  ownerId: 1,
  title: 'To Read in 2024'
});
```

### createReadingListWithVisibility(visibility, options?)

Create a reading list with specific visibility.

```typescript
import { createReadingListWithVisibility } from './test/factories/reading-list.factory';

const publicList = await createReadingListWithVisibility('PUBLIC', { ownerId: 1 });
```

### createFavoritesYearListWithBooks(year, bookCount?, options?)

Create a favorites year list with books already added.

```typescript
import { createFavoritesYearListWithBooks } from './test/factories/reading-list.factory';

const { list, entries, books } = await createFavoritesYearListWithBooks(
  '2024',
  5,
  { ownerId: 1 }
);
```

### getReadingListWithBooks(readingListId)

Get a reading list with all its books populated.

```typescript
import { getReadingListWithBooks } from './test/factories/reading-list.factory';

const listWithBooks = await getReadingListWithBooks(listId);
console.log(`List has ${listWithBooks.books.length} books`);
```

## Complete Test Example

Here's a complete example showing how to use all the helpers and factories together:

```typescript
import { 
  resetDatabase, 
  disconnectTestDatabase, 
  getTableCounts 
} from './test/helpers/db';

import { 
  createUser, 
  createUsers 
} from './test/factories/user.factory';

import { 
  createBook, 
  createBooksReadInYear 
} from './test/factories/book.factory';

import { 
  createFavoritesYearListWithBooks,
  createReadingListWithBooks,
  getReadingListWithBooks
} from './test/factories/reading-list.factory';

describe('Reading Lists', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it('should create a user with books and reading lists', async () => {
    // Create a user
    const user = await createUser({ 
      name: 'Test User',
      email: 'test@example.com'
    });

    // Create books for the user
    const books = await createBooksReadInYear(2024, 6, { 
      ownerId: user.id 
    });

    // Create a favorites list with those books
    const { list, entries } = await createFavoritesYearListWithBooks(
      '2024',
      5,
      { ownerId: user.id }
    );

    // Create a standard reading list
    const { list: readingList } = await createReadingListWithBooks(
      { 
        ownerId: user.id, 
        title: 'Summer Reading',
        visibility: 'PUBLIC'
      },
      { count: 3, withNotes: true }
    );

    // Verify data
    const counts = await getTableCounts();
    expect(counts.users).toBe(1);
    expect(counts.readingLists).toBe(2);
    
    // Get list with books
    const fullList = await getReadingListWithBooks(list.id);
    expect(fullList?.books.length).toBe(5);
  });

  it('should handle multiple users with their own libraries', async () => {
    // Create multiple users
    const users = await createUsers(3);

    // Each user gets their own books and lists
    for (const user of users) {
      await createBook({ 
        ownerId: user.id,
        visibility: 'PUBLIC'
      });
      
      await createReadingListWithBooks(
        { ownerId: user.id, visibility: 'PRIVATE' },
        { count: 2 }
      );
    }

    const counts = await getTableCounts();
    expect(counts.users).toBe(3);
    expect(counts.books).toBeGreaterThanOrEqual(3);
    expect(counts.readingLists).toBe(3);
  });
});
```

## Best Practices

1. **Always clean up between tests**: Use `resetDatabase()` in `beforeEach` hooks
2. **Disconnect after tests**: Call `disconnectTestDatabase()` in `afterAll` hooks
3. **Use factories for realistic data**: Factories generate valid ISBNs and realistic test data
4. **Handle foreign keys properly**: Factories automatically create related records when needed
5. **Use build functions for validation tests**: Test validation logic without database operations
6. **Leverage specific factory functions**: Use `createReadBook`, `createFavoritesYearList`, etc. for clearer test intent

## Environment Variables

Ensure your test environment has the database URL configured:

```bash
DEWEY_DB_DATABASE_URL=postgresql://user:password@localhost:5432/penumbra_test
```

## Notes

- All factories use `@faker-js/faker` for realistic test data
- ISBN generation follows proper checksum algorithms
- Foreign key relationships are handled automatically
- Factories create parent records (like users) when not provided
- All date fields use appropriate faker methods for realistic dates
