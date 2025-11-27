# Reading Lists Integration Tests

## Overview

This test suite provides comprehensive integration testing for the reading lists server actions in `/src/utils/actions/reading-lists.ts`.

## Test File

- **Location**: `/test/integration/actions/reading-lists.test.ts`
- **Test Count**: 34 tests
- **Functions Tested**: 9 core functions

## Functions Covered

### 1. `createReadingList()`
- Happy path: Standard, public, and favorites lists
- Validation: Empty titles, length limits
- Business rules: FAVORITES uniqueness constraints
- Authorization: Authentication required

### 2. `fetchUserReadingLists()`
- Happy path: Fetch all lists, empty state
- Authorization: User isolation, authentication required

### 3. `fetchReadingList()`
- Happy path: Fetch single list with books, empty lists
- Authorization: Owner-only access

### 4. `updateReadingList()`
- Happy path: Update title, description, visibility
- Validation: Title and description constraints
- Authorization: Owner-only updates

### 5. `deleteReadingList()`
- Happy path: Delete list, cascade delete associations
- Authorization: Owner-only deletion

### 6. `addBookToReadingList()`
- Happy path: Add books, auto-position calculation
- Business rules: FAVORITES 6-book limit
- Validation: Duplicate detection
- Authorization: Book and list ownership

### 7. `removeBookFromReadingList()`
- Happy path: Remove books from lists
- Validation: Book membership verification

### 8. `reorderBooksInList()`
- Happy path: Reorder books, position assignment
- Validation: Complete reorder enforcement

### 9. `updateBookNotesInList()`
- Happy path: Update and clear notes
- Validation: Notes length limits

## Test Strategy

Following Kent C. Dodds' testing philosophy:
- Test behavior, not implementation
- Use realistic test data from factories
- Mock only at system boundaries (Clerk auth)
- Test happy paths, edge cases, and authorization

## Database Requirements

Tests require a PostgreSQL database connection. Set the `DEWEY_DB_DATABASE_URL` environment variable:

```bash
export DEWEY_DB_DATABASE_URL="postgresql://user:password@localhost:5432/dewey_test"
```

## Running Tests

```bash
# Run all reading lists integration tests
npm test -- --run test/integration/actions/reading-lists.test.ts

# Run with coverage
npm test -- --coverage test/integration/actions/reading-lists.test.ts

# Run specific test suite
npm test -- --run test/integration/actions/reading-lists.test.ts -t "createReadingList"
```

## Test Structure

Each function has organized test suites:

1. **Happy Path** - Successful operations with valid data
2. **Validation** - Input validation and constraints
3. **Business Rules** - Domain-specific logic (e.g., FAVORITES limits)
4. **Authorization** - Security and access control
5. **Edge Cases** - Boundary conditions and special scenarios

## Mocking Strategy

### Clerk Authentication
Tests use a simple mock at the module level:

```typescript
let mockAuthReturn: { userId: string | null } = { userId: null };

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => Promise.resolve(mockAuthReturn)),
}));

function setMockUser(userId: string) {
  mockAuthReturn = { userId };
}
```

### Database
Uses real Prisma client pointing to test database for integration testing.

## Test Data

Tests use factory functions from `/test/factories/`:
- `createUser()` - Create test users
- `createBook()` - Create test books
- `createReadingList()` - Create reading lists
- `createReadingListWithBooks()` - Create lists with books
- `createFavoritesAllList()` - Create all-time favorites list
- `createFavoritesYearList()` - Create year-specific favorites list

## Coverage

Tests cover:
- All 9 main server actions
- Happy paths for successful operations
- Input validation and error handling
- Business rule enforcement (FAVORITES limits, uniqueness)
- Authorization and security
- Edge cases (empty lists, not found, cascading deletes)
- Data integrity (whitespace trimming, null handling)

## Known Issues

The tests are fully written and ready to run. They require:
1. Database connection configured via `DEWEY_DB_DATABASE_URL`
2. Database schema migrated
3. Test database user with appropriate permissions

Once the database is configured, all 34 tests should pass.
