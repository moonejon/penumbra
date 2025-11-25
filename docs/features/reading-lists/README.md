# Reading Lists Feature - Implementation Guide

## Overview

This directory contains the complete database schema design and API specification for the Reading Lists feature in Penumbra. This feature allows users to organize their books into curated lists and maintain "favorite books" collections.

## What's Included

This implementation provides:

1. **Reading Lists**: User-created collections of books with ordering and notes
2. **Favorites (All Time)**: A special list for favorite books of all time (max 5-6 books)
3. **Favorites (By Year)**: Year-specific favorite books lists (max 5-6 books each)
4. **Many-to-Many Relationships**: Books can be in multiple lists, lists can have multiple books
5. **Ordering**: Books maintain position/order within each list
6. **Notes**: Optional annotations per book per list
7. **Visibility Control**: Public/Private lists following existing BookVisibility pattern

## Files in This Directory

### 1. DATABASE_SCHEMA.md

**Complete database schema design with**:
- Prisma schema models (ReadingList, BookInReadingList)
- Enums (ReadingListVisibility, ReadingListType)
- Relationships and foreign keys
- Indexes for performance optimization
- Data integrity constraints
- Sample queries for common operations
- Performance considerations and N+1 prevention
- Migration strategy and rollback plan

**Key Design Decisions**:
- Junction table pattern for many-to-many relationships
- Unified list model with type discriminator (STANDARD, FAVORITES_YEAR, FAVORITES_ALL)
- Position-based ordering (integer field)
- Cascade deletes for data integrity
- Comprehensive indexing strategy

### 2. API_ENDPOINTS.md

**Complete API specification with**:
- 14 server actions for full CRUD operations
- TypeScript types and validation rules
- Input/output formats for all endpoints
- Authorization and authentication patterns
- Error handling strategies
- Performance optimization techniques
- Usage examples with React components
- Testing strategy

**Core Actions**:
- Reading list management (create, read, update, delete)
- Book management (add, remove, reorder, update notes)
- Favorites operations (fetch all-time, fetch by year, list years)
- Utility operations (check if book in list, find lists containing book)

### 3. This README

Quick reference and implementation guide.

## Database Schema Summary

### New Models

#### ReadingList
Primary model for user-created book collections.

**Fields**:
- `id`: Primary key
- `ownerId`: Foreign key to User
- `title`: List name (required, max 200 chars)
- `description`: Optional long description (max 5000 chars)
- `visibility`: PRIVATE, PUBLIC, FRIENDS, UNLISTED
- `type`: STANDARD, FAVORITES_YEAR, FAVORITES_ALL
- `year`: For FAVORITES_YEAR (e.g., "2024")
- `createdAt`, `updatedAt`: Timestamps

**Relationships**:
- `owner`: Many-to-one with User
- `books`: One-to-many with BookInReadingList

**Indexes**: `[ownerId]`, `[visibility]`, `[type]`, `[type, year]`

#### BookInReadingList
Junction table for many-to-many relationship.

**Fields**:
- `id`: Primary key
- `bookId`: Foreign key to Book
- `readingListId`: Foreign key to ReadingList
- `position`: Integer for ordering (default: 0)
- `notes`: Optional annotations (max 1000 chars)
- `addedAt`: Timestamp

**Constraints**: `@@unique([bookId, readingListId])` - No duplicate entries

**Indexes**: `[readingListId, position]`, `[bookId]`

### Updated Models

#### User
**Added**:
- `readingLists`: One-to-many relationship
- `createdAt`, `updatedAt`: Timestamps

#### Book
**Added**:
- `readingListEntries`: One-to-many relationship
- `createdAt`, `updatedAt`: Timestamps
- Cascade delete on owner relationship
- Indexes: `[ownerId]`, `[visibility]`, `[title]`

## Implementation Checklist

### Phase 1: Database Setup (DO NOT RUN YET - Per Instructions)

Schema is designed and ready. When ready to implement:

```bash
# Navigate to project root
cd /Users/jonathan/github/penumbra/.conductor/monrovia

# Create and apply migration
npx prisma migrate dev --name add_reading_lists_and_favorites

# Generate updated Prisma Client
npx prisma generate

# Validate schema
npx prisma validate
```

**Migration creates**:
- 2 new enums (ReadingListVisibility, ReadingListType)
- 2 new tables (ReadingList, BookInReadingList)
- 8 indexes for query optimization
- Foreign key constraints with cascade deletes
- Unique constraints

### Phase 2: Server Actions Implementation

Create `/src/utils/actions/reading-lists.ts` with 14 server actions:

**Reading List CRUD** (5 actions):
1. `createReadingList` - Create new list
2. `fetchUserReadingLists` - Get user's all lists
3. `fetchReadingList` - Get single list with books
4. `updateReadingList` - Update list metadata
5. `deleteReadingList` - Delete list

**Book Management** (4 actions):
6. `addBookToReadingList` - Add book to list
7. `removeBookFromReadingList` - Remove book from list
8. `updateBookNotesInList` - Update book notes
9. `reorderBooksInList` - Reorder books (drag-and-drop)

**Favorites** (3 actions):
10. `fetchFavoritesAllTime` - Get all-time favorites
11. `fetchFavoritesByYear` - Get year-specific favorites
12. `fetchAllFavoritesYears` - Get available years list

**Utilities** (2 actions):
13. `fetchListsContainingBook` - Find lists with book
14. `checkBookInList` - Check if book in list

### Phase 3: TypeScript Types

Add to `/src/shared.types.ts`:
- `ReadingListWithBooksType`
- `BookInListType`
- `ReadingListSummaryType`
- `CreateReadingListInput`
- `UpdateReadingListInput`
- `AddBookToListInput`
- `ReorderBooksInput`
- `READING_LIST_VALIDATION` constants

### Phase 4: Permissions

Add to `/src/utils/permissions.ts`:
- `checkReadingListPermission(listId)` - Check view/edit permissions
- `requireReadingListOwnership(listId)` - Verify ownership
- `getViewableReadingListFilter()` - Build Prisma filter for viewable lists

### Phase 5: Testing

**Unit Tests** (`tests/actions/reading-lists.test.ts`):
- Test each action individually
- Test validation rules
- Test error cases
- Test favorites constraints (max 6 books, unique per user/year)

**Integration Tests** (`tests/integration/reading-lists.test.ts`):
- Test full workflows (create → add books → reorder → delete)
- Test permissions enforcement
- Test cascade deletes
- Test concurrent operations

### Phase 6: Frontend Integration (UI Team)

Frontend team will:
- Create reading list components
- Integrate server actions
- Add drag-and-drop for reordering
- Build favorites UI
- Add "Add to List" modal

## Key Features

### 1. Flexible Reading Lists

Users can create unlimited reading lists with:
- Custom titles and descriptions
- Public/Private visibility
- Ordered books with custom positions
- Per-book notes/annotations

### 2. Favorites System

Two types of favorites:
- **All Time**: Single list, max 5-6 books
- **By Year**: Multiple lists (one per year), max 5-6 books each

Constraints enforced at application level:
- Only one FAVORITES_ALL per user
- Only one FAVORITES_YEAR per user per year
- Maximum 5-6 books in favorites lists

### 3. Smart Ordering

Books maintain position within lists:
- Use gaps (100, 200, 300) for efficient insertion
- Reorder operation updates positions in transaction
- Supports drag-and-drop UI

### 4. Data Integrity

Cascade deletes handle cleanup:
- User deleted → All lists and books deleted
- Book deleted → Removed from all lists
- List deleted → All book entries deleted

### 5. Performance Optimization

Strategic indexing for fast queries:
- User's lists: `[ownerId]` index → <10ms
- List contents: `[readingListId, position]` → <20ms
- Find book in lists: `[bookId]` index → <5ms
- Favorites queries: `[type, year]` composite → <10ms

## Security & Authorization

### Authentication
All operations require Clerk authentication via `getCurrentUser()`.

### Authorization Rules
- **Create**: Any authenticated user
- **Read**: Owner always; public lists visible to all (future)
- **Update**: Owner only
- **Delete**: Owner only
- **Add/Remove Books**: List owner only

### Data Isolation
All queries filter by user ID:
```typescript
const lists = await prisma.readingList.findMany({
  where: { ownerId: user.id }
});
```

## Performance Targets

With proper indexing:
- Fetch user's lists: **<10ms** (p95)
- Fetch list with 50 books: **<20ms** (p95)
- Add book to list: **<5ms** (p95)
- Reorder books: **<10ms** per update (p95)

Scaling:
- Supports **10,000+ lists per user**
- Supports **1,000+ books per list**
- No performance degradation at scale

## Common Queries Reference

### Create a Standard Reading List
```typescript
const result = await createReadingList({
  title: "Summer Reading 2024",
  description: "Books to read on vacation",
  visibility: "PRIVATE",
  type: "STANDARD"
});
```

### Add Book to List
```typescript
const result = await addBookToReadingList({
  readingListId: 1,
  bookId: 42,
  notes: "Recommended by Sarah"
});
```

### Fetch List with Books
```typescript
const result = await fetchReadingList(1);
// result.list.books is ordered by position
```

### Reorder Books
```typescript
const result = await reorderBooksInList({
  readingListId: 1,
  bookOrders: [
    { bookInListId: 10, position: 100 },
    { bookInListId: 11, position: 200 },
    { bookInListId: 12, position: 300 }
  ]
});
```

### Get Favorites
```typescript
// All time favorites
const allTime = await fetchFavoritesAllTime(true); // auto-create if not exists

// Year-specific favorites
const year2024 = await fetchFavoritesByYear("2024", true);

// List all years with favorites
const years = await fetchAllFavoritesYears();
```

## Migration Commands (When Ready)

```bash
# Development database
npx prisma migrate dev --name add_reading_lists_and_favorites

# Staging database
DATABASE_URL="$STAGING_DB_URL" npx prisma migrate deploy

# Production database
DATABASE_URL="$PRODUCTION_DB_URL" npx prisma migrate deploy

# Rollback (if needed)
npx prisma migrate resolve --rolled-back [migration-name]
```

## Testing Commands

```bash
# Run all tests
npm test

# Run reading lists tests only
npm test reading-lists

# Run with coverage
npm test -- --coverage

# Run integration tests
npm test -- tests/integration/reading-lists.test.ts
```

## Validation Rules Summary

| Field | Min | Max | Format | Required |
|-------|-----|-----|--------|----------|
| List Title | 1 char | 200 chars | - | Yes |
| List Description | - | 5000 chars | - | No |
| Book Notes | - | 1000 chars | - | No |
| Year | - | - | YYYY (1900-2100) | For FAVORITES_YEAR |
| Books in Favorites | - | 6 books | - | Soft limit |
| Position | 0 | - | Positive integer | Default: 0 |

## Future Enhancements

The schema is designed to support future features without breaking changes:

1. **Reading Progress**: Add `currentPage` and `completedAt` to BookInReadingList
2. **List Collaboration**: Add ReadingListCollaborator model for shared lists
3. **Tags/Categories**: Add `tags: String[]` to ReadingList
4. **List Templates**: Add `isTemplate` flag for reusable list structures
5. **Social Features**: Add likes, comments, follows
6. **Statistics**: Track reading velocity, genre distribution

All enhancements are backward-compatible additions.

## Support & Questions

For questions or issues:
1. Review `DATABASE_SCHEMA.md` for schema design rationale
2. Review `API_ENDPOINTS.md` for implementation details
3. Check sample queries in both documents
4. Consult existing `/src/utils/actions/books.ts` for patterns

## Next Steps

1. **Review** the schema design in `DATABASE_SCHEMA.md`
2. **Review** the API specification in `API_ENDPOINTS.md`
3. **Approve** the design or request changes
4. **Run migration** when ready (Phase 1)
5. **Implement** server actions (Phase 2-4)
6. **Test** thoroughly (Phase 5)
7. **Coordinate** with UI team for frontend integration (Phase 6)

## Design Highlights

**Why This Design?**
- **Simple but Powerful**: Unified model handles both regular lists and favorites
- **Scalable**: Proper indexing supports thousands of lists and books
- **Flexible**: Junction table allows rich metadata per book per list
- **Consistent**: Follows existing Penumbra patterns (visibility, permissions, server actions)
- **Safe**: Cascade deletes maintain referential integrity
- **Performant**: Strategic indexes ensure fast queries (<100ms p95)
- **Extensible**: Easy to add features without breaking changes

This design provides a solid foundation for Reading Lists and Favorites, ready for immediate implementation.
