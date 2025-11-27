# Test Helpers & Factories Quick Reference

## Installation

```bash
npm install --save-dev @faker-js/faker
```

## Import Everything

```typescript
// Import all helpers
import { 
  resetDatabase, 
  seedTestUser, 
  disconnectTestDatabase 
} from './test/helpers';

// Import all factories
import { 
  createUser,
  createBook,
  createReadingList,
  createReadingListWithBooks
} from './test/factories';
```

## Common Patterns

### Test Setup

```typescript
describe('My Tests', () => {
  beforeEach(async () => {
    await resetDatabase(); // Clean database before each test
  });

  afterAll(async () => {
    await disconnectTestDatabase(); // Clean up connections
  });
});
```

### Create a User

```typescript
const user = await createUser();
const customUser = await createUser({ 
  email: 'custom@example.com',
  name: 'Custom Name'
});
```

### Create Books

```typescript
// Single book (auto-creates user)
const book = await createBook();

// Single book with owner
const book = await createBook({ ownerId: user.id });

// Multiple books
const books = await createBooks(5, { ownerId: user.id });

// Read book (with readDate)
const readBook = await createReadBook({ ownerId: user.id });

// Unread book (no readDate)
const unreadBook = await createUnreadBook({ ownerId: user.id });

// Books read in specific year
const books2024 = await createBooksReadInYear(2024, 5, { ownerId: user.id });
```

### Create Reading Lists

```typescript
// Standard list (auto-creates user)
const list = await createReadingList();

// Standard list with owner
const list = await createReadingList({ ownerId: user.id });

// List with books
const { list, entries } = await createReadingListWithBooks(
  { ownerId: user.id, title: 'My List' },
  { count: 5 }
);

// Favorites year list
const favorites2024 = await createFavoritesYearList('2024', { ownerId: user.id });

// All-time favorites
const allTime = await createFavoritesAllList({ ownerId: user.id });

// Favorites with books (auto-sets readDate to year)
const { list, entries, books } = await createFavoritesYearListWithBooks(
  '2024',
  5,
  { ownerId: user.id }
);
```

### Add Books to Existing List

```typescript
// Create new books and add them
await addBooksToReadingList(listId, { count: 3 });

// Add existing books
await addBooksToReadingList(listId, { bookIds: [1, 2, 3] });

// Add books with notes
await addBooksToReadingList(listId, { count: 3, withNotes: true });
```

### Get List with Books

```typescript
const listWithBooks = await getReadingListWithBooks(listId);
console.log(listWithBooks.books.length); // Array of books with position
```

### Debugging

```typescript
// Check database health
const isReady = await isDatabaseReady();

// Get record counts
const counts = await getTableCounts();
console.log(counts); // { users: 5, books: 20, readingLists: 3, bookInReadingLists: 15 }

// Clean specific tables
await cleanupTables(['book', 'bookInReadingList']);
```

## Build vs Create

```typescript
// build* returns plain object (doesn't persist)
const userData = buildUser({ email: 'test@example.com' });

// create* persists to database (returns with id, timestamps)
const user = await createUser({ email: 'test@example.com' });
```

## Complete Example

```typescript
import { 
  resetDatabase, 
  disconnectTestDatabase 
} from './test/helpers';
import { 
  createUser,
  createBooksReadInYear,
  createFavoritesYearListWithBooks 
} from './test/factories';

describe('User Library', () => {
  beforeEach(async () => await resetDatabase());
  afterAll(async () => await disconnectTestDatabase());

  it('should setup user library', async () => {
    // Create user
    const user = await createUser({ name: 'Reader' });

    // User read 20 books in 2024
    await createBooksReadInYear(2024, 20, { ownerId: user.id });

    // Create favorites list with 5 books
    const { list, entries, books } = await createFavoritesYearListWithBooks(
      '2024',
      5,
      { ownerId: user.id }
    );

    expect(list.type).toBe('FAVORITES_YEAR');
    expect(entries.length).toBe(5);
    expect(books.every(b => b.readDate?.getFullYear() === 2024)).toBe(true);
  });
});
```

## Cheat Sheet

| Function | What It Does |
|----------|--------------|
| `resetDatabase()` | Deletes all data from all tables |
| `seedTestUser()` | Creates user with predictable data |
| `createUser()` | Creates user with random data |
| `createUsers(n)` | Creates n users |
| `createBook()` | Creates book (+ user if needed) |
| `createBooks(n)` | Creates n books |
| `createReadBook()` | Creates book with readDate |
| `createBooksReadInYear(year, n)` | Creates n books read in year |
| `createReadingList()` | Creates empty list (+ user if needed) |
| `createReadingListWithBooks()` | Creates list with books |
| `createFavoritesYearList(year)` | Creates favorites list for year |
| `createFavoritesYearListWithBooks(year, n)` | Creates favorites + n books |
| `addBooksToReadingList(listId, opts)` | Adds books to existing list |
| `getReadingListWithBooks(listId)` | Fetches list with books populated |
| `getTableCounts()` | Returns count of records in each table |
| `disconnectTestDatabase()` | Closes database connection |

## Visibility Options

```typescript
// For books
{ visibility: 'PUBLIC' }  // Anyone can see
{ visibility: 'PRIVATE' } // Only owner
{ visibility: 'FRIENDS' } // Future feature
{ visibility: 'UNLISTED' } // Future feature

// For reading lists
{ visibility: 'PUBLIC' }  // Anyone can see
{ visibility: 'PRIVATE' } // Only owner
{ visibility: 'FRIENDS' } // Future feature
{ visibility: 'UNLISTED' } // Future feature
```

## List Types

```typescript
{ type: 'STANDARD' }       // Regular user list
{ type: 'FAVORITES_YEAR' } // Favorites for a year
{ type: 'FAVORITES_ALL' }  // All-time favorites
```

## Tips

1. Always use `resetDatabase()` in `beforeEach`
2. Always use `disconnectTestDatabase()` in `afterAll`
3. Use specific functions for clarity: `createReadBook()` vs `createBook({ readDate: ... })`
4. Let factories auto-create users when testing book/list logic
5. Provide ownerId when testing user-specific logic
6. Use `getTableCounts()` to debug unexpected test state
