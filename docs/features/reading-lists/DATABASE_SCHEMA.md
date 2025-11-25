# Reading Lists Database Schema Design

## Overview

This document describes the database schema design for the Reading Lists feature in Penumbra, including support for user-created reading lists and special "favorite books" functionality.

## Schema Design Rationale

### Core Design Principles

1. **Flexibility**: Support both standard reading lists and special favorites lists with a single model
2. **Scalability**: Use proper indexing and relationships to support efficient queries
3. **Data Integrity**: Leverage cascading deletes and constraints to maintain consistency
4. **User Isolation**: All queries filter by authenticated user ID following existing patterns
5. **Extensibility**: Design allows for future features (sharing, collaboration, etc.)

### Key Design Decisions

#### 1. Many-to-Many Relationship Pattern

**Decision**: Use a junction table (`BookInReadingList`) for the many-to-many relationship between Books and ReadingLists.

**Rationale**:
- Books can appear in multiple reading lists
- Reading lists can contain multiple books
- Junction table allows additional metadata per relationship (position, notes, addedAt)
- Provides flexibility for future features (reading progress, ratings per list, etc.)

**Alternative Considered**: Array of book IDs in ReadingList model
- **Rejected**: Would not support ordering, notes, or efficient queries
- PostgreSQL array operations are less performant than proper joins

#### 2. Unified List Model with Type Discriminator

**Decision**: Use a single `ReadingList` model with `type` enum (STANDARD, FAVORITES_YEAR, FAVORITES_ALL) rather than separate tables.

**Rationale**:
- Reduces code duplication (CRUD operations work for all list types)
- Simplifies queries (single table to join)
- Allows favorites to leverage all reading list features (visibility, sharing, etc.)
- Type-specific behavior handled at application level

**Alternative Considered**: Separate `FavoriteBooks` table
- **Rejected**: Would duplicate most ReadingList fields and relationships
- Would complicate queries that need to show all lists together

#### 3. Position-Based Ordering

**Decision**: Use integer `position` field in junction table for ordering books within lists.

**Rationale**:
- Simple and performant
- Easy to reorder (update position values)
- Supports gaps for efficient insertion (position: 100, 200, 300)
- Standard pattern used in many applications

**Alternative Considered**: Linked list pattern (previousBookId, nextBookId)
- **Rejected**: More complex queries, harder to maintain consistency
- No significant performance benefit

#### 4. Separate Visibility Enum

**Decision**: Create `ReadingListVisibility` enum separate from `BookVisibility`.

**Rationale**:
- Follows existing pattern in codebase
- Allows independent evolution of visibility options
- Makes permissions logic explicit and type-safe
- Future-proof for list-specific visibility features

#### 5. Cascade Deletion Strategy

**Decision**: Use `onDelete: Cascade` for all foreign key relationships.

**Rationale**:
- **User deleted**: All reading lists and books should be deleted (data ownership)
- **Book deleted**: Remove from all reading lists automatically (referential integrity)
- **Reading list deleted**: Remove all junction table entries (cleanup)
- Prevents orphaned records and maintains data consistency

**Application-Level Consideration**: Before deleting a book, optionally notify user which lists it belongs to.

## Schema Components

### Enums

#### ReadingListVisibility
```prisma
enum ReadingListVisibility {
  PRIVATE  // Only owner can see
  PUBLIC   // Anyone can see in public library
  FRIENDS  // Future: only friends can see
  UNLISTED // Future: accessible via direct link only
}
```

**Usage**: Controls who can view a reading list. Follows same pattern as BookVisibility for consistency.

#### ReadingListType
```prisma
enum ReadingListType {
  STANDARD       // Regular user-created reading list
  FAVORITES_YEAR // Favorite books of a specific year (max 5-6 books)
  FAVORITES_ALL  // Favorite books of all time (max 5-6 books)
}
```

**Usage**: Discriminates between regular lists and special favorites lists.

**Business Rules** (enforced at application level):
- `FAVORITES_ALL`: Only one per user (validate before creation)
- `FAVORITES_YEAR`: Only one per user per year (validate with year field)
- Maximum 5-6 books in favorites lists (enforce when adding books)

### Models

#### ReadingList

Primary model representing a collection of books.

**Fields**:
- `id`: Auto-incrementing primary key
- `ownerId`: Foreign key to User (with cascade delete)
- `title`: Name of the reading list (e.g., "Summer Reading 2024")
- `description`: Optional long-form description
- `visibility`: Controls access permissions
- `type`: Discriminates list type (STANDARD, FAVORITES_YEAR, FAVORITES_ALL)
- `year`: For FAVORITES_YEAR, stores the year; optional for others
- `createdAt`: Timestamp of creation
- `updatedAt`: Auto-updated timestamp

**Relationships**:
- `owner`: Many-to-one with User
- `books`: One-to-many with BookInReadingList

**Indexes**:
- `[ownerId]`: Fast queries for user's lists
- `[visibility]`: Fast filtering by visibility
- `[type]`: Fast filtering by list type
- `[type, year]`: Efficient favorites queries

#### BookInReadingList

Junction table managing the many-to-many relationship.

**Fields**:
- `id`: Auto-incrementing primary key
- `bookId`: Foreign key to Book (with cascade delete)
- `readingListId`: Foreign key to ReadingList (with cascade delete)
- `position`: Integer for ordering within list (default: 0)
- `notes`: Optional text annotations for this book in this specific list
- `addedAt`: Timestamp when book was added to list

**Constraints**:
- `@@unique([bookId, readingListId])`: Prevents duplicate entries

**Indexes**:
- `[readingListId, position]`: Fast ordered retrieval of list contents
- `[bookId]`: Fast lookup of all lists containing a book

**Design Note**: The position field allows efficient reordering. Use gaps (e.g., 100, 200, 300) to enable insertion without updating many rows.

### Updated Models

#### User

**Added Fields**:
- `readingLists`: One-to-many relationship with ReadingList
- `profileImageUrl`: Text field storing URL to uploaded profile image (nullable)
  - Default: null (application provides default placeholder)
  - Storage: Vercel Blob recommended (see File Storage Strategy section)
  - Format: `https://[blob-url]/[user-id]/profile.[ext]`
  - Security: Private uploads, signed URLs for access
- `createdAt`: Timestamp for consistency
- `updatedAt`: Auto-updated timestamp

#### Book

**Added Fields**:
- `readingListEntries`: One-to-many relationship with BookInReadingList
- `readDate`: DateTime field tracking when user read the book (nullable)
  - **NOT** the publication date - this is when the user personally read it
  - Used for filtering: "Books I read in 2024", "Favorite Books I Read in 2023"
  - Nullable because user may not have set it yet
  - Format: ISO 8601 DateTime (YYYY-MM-DD or full timestamp)
  - Use case: Filter favorites by year user read them
- `createdAt`: Timestamp for consistency
- `updatedAt`: Auto-updated timestamp
- Cascade delete on owner relationship

**Added Indexes**:
- `[ownerId]`: Fast filtering by owner
- `[visibility]`: Fast visibility-based queries
- `[title]`: Fast title searches
- `[readDate]`: Fast filtering by read date
- `[ownerId, readDate]`: Composite index for user's books by read date

## Index Strategy

### Query Patterns and Index Selection

#### 1. Fetch User's Reading Lists
```sql
SELECT * FROM ReadingList WHERE ownerId = ? ORDER BY createdAt DESC
```
**Index**: `[ownerId]` - Primary access pattern for lists

#### 2. Fetch Books in Reading List (Ordered)
```sql
SELECT * FROM BookInReadingList
WHERE readingListId = ?
ORDER BY position ASC
```
**Index**: `[readingListId, position]` - Composite for efficient ordered retrieval

#### 3. Find Lists Containing a Book
```sql
SELECT * FROM BookInReadingList WHERE bookId = ?
```
**Index**: `[bookId]` - For "show all lists" feature per book

#### 4. Fetch User's Favorites
```sql
SELECT * FROM ReadingList
WHERE ownerId = ? AND type = 'FAVORITES_ALL'
```
**Index**: `[ownerId]` used, `[type]` provides additional filtering

#### 5. Fetch Year-Specific Favorites
```sql
SELECT * FROM ReadingList
WHERE ownerId = ? AND type = 'FAVORITES_YEAR' AND year = '2024'
```
**Index**: `[type, year]` - Composite for efficient year-based favorites

#### 6. Public Lists Discovery
```sql
SELECT * FROM ReadingList WHERE visibility = 'PUBLIC'
```
**Index**: `[visibility]` - For future public list browsing

### Index Performance Considerations

**Composite Index Order**: Most selective fields first
- `[readingListId, position]`: readingListId narrows results, position sorts
- `[type, year]`: type narrows, year provides specific match

**Covering Indexes**: Future optimization could add commonly selected fields to indexes to avoid table lookups.

**Trade-offs**: Each index adds ~10-20% write overhead but provides 10-100x read performance. Given that reading lists are read-heavy, this is acceptable.

## Performance Considerations

### N+1 Query Prevention

**Problem**: Fetching a reading list with books could trigger N+1 queries:
```typescript
// Bad: N+1 queries
const list = await prisma.readingList.findUnique({ where: { id } });
for (const entry of list.books) {
  const book = await prisma.book.findUnique({ where: { id: entry.bookId } });
}
```

**Solution**: Use Prisma's `include` or `select`:
```typescript
// Good: Single query with join
const list = await prisma.readingList.findUnique({
  where: { id },
  include: {
    books: {
      include: { book: true },
      orderBy: { position: 'asc' }
    }
  }
});
```

### Query Optimization Strategies

1. **Batch Operations**: Use `createMany` for bulk additions
2. **Selective Fields**: Use `select` to fetch only needed fields
3. **Pagination**: Implement cursor-based pagination for large lists
4. **Caching**: Cache frequently accessed public lists with Redis/Prisma Accelerate
5. **Connection Pooling**: Leverage Prisma Accelerate connection pooling

### Expected Performance

**Benchmarks** (estimated with proper indexing):
- Fetch user's lists: <10ms (p95)
- Fetch list with 50 books: <20ms (p95)
- Add book to list: <5ms (p95)
- Reorder books: <10ms per update (p95)

**Scaling**: Schema supports 10,000+ lists per user and 1,000+ books per list without performance degradation.

## Data Integrity & Constraints

### Database-Level Constraints

1. **Foreign Keys with Cascade Delete**:
   - User deleted → All reading lists deleted
   - Book deleted → Removed from all lists
   - Reading list deleted → All junction entries deleted

2. **Unique Constraints**:
   - `[bookId, readingListId]`: Book can only appear once per list
   - User.clerkId: Clerk authentication integration
   - Book.isbn10, Book.isbn13: Prevent duplicate books

3. **Not Null Constraints**:
   - All IDs, ownerId, title, type, visibility
   - Ensures required fields are always present

### Application-Level Validations

1. **Favorites Limits**:
   - Validate maximum 5-6 books in FAVORITES_YEAR and FAVORITES_ALL
   - Enforce before adding books to favorites lists

2. **Unique Favorites**:
   - Query before creation to ensure only one FAVORITES_ALL per user
   - Query to ensure only one FAVORITES_YEAR per user per year

3. **Position Management**:
   - Use gaps (100, 200, 300) for efficient insertion
   - Provide reorder operation that updates positions

4. **Book Deletion Handling**:
   - Optional: Show user which lists contain book before deletion
   - Cascade delete handles cleanup automatically

### Validation Examples

```typescript
// Ensure unique FAVORITES_ALL per user
async function createFavoritesAllList(userId: number) {
  const existing = await prisma.readingList.findFirst({
    where: { ownerId: userId, type: 'FAVORITES_ALL' }
  });

  if (existing) {
    throw new Error('User already has a favorites list');
  }

  // Create list...
}

// Enforce maximum books in favorites
async function addBookToFavorites(listId: number, bookId: number) {
  const list = await prisma.readingList.findUnique({
    where: { id: listId },
    include: { books: true }
  });

  if (list.type !== 'STANDARD' && list.books.length >= 6) {
    throw new Error('Favorites lists can only contain 5-6 books');
  }

  // Add book...
}
```

## Sample Queries

### Common Operations

#### 1. Create a Standard Reading List
```typescript
const list = await prisma.readingList.create({
  data: {
    ownerId: user.id,
    title: "Summer Reading 2024",
    description: "Books to read on vacation",
    visibility: "PRIVATE",
    type: "STANDARD"
  }
});
```

#### 2. Create Favorites List for 2024
```typescript
// First, check if already exists
const existing = await prisma.readingList.findFirst({
  where: {
    ownerId: user.id,
    type: "FAVORITES_YEAR",
    year: "2024"
  }
});

if (!existing) {
  const favorites = await prisma.readingList.create({
    data: {
      ownerId: user.id,
      title: "Favorite Books of 2024",
      visibility: "PUBLIC",
      type: "FAVORITES_YEAR",
      year: "2024"
    }
  });
}
```

#### 3. Add Book to Reading List
```typescript
// Get current max position
const maxPosition = await prisma.bookInReadingList.findFirst({
  where: { readingListId: listId },
  orderBy: { position: 'desc' },
  select: { position: true }
});

const nextPosition = (maxPosition?.position ?? 0) + 100;

const entry = await prisma.bookInReadingList.create({
  data: {
    bookId: bookId,
    readingListId: listId,
    position: nextPosition,
    notes: "Can't wait to read this!"
  }
});
```

#### 4. Fetch Reading List with Books (Ordered)
```typescript
const list = await prisma.readingList.findUnique({
  where: { id: listId },
  include: {
    owner: { select: { name: true, email: true } },
    books: {
      include: {
        book: {
          select: {
            id: true,
            title: true,
            authors: true,
            image: true,
            synopsis: true
          }
        }
      },
      orderBy: { position: 'asc' }
    }
  }
});
```

#### 5. Fetch User's All Reading Lists
```typescript
const lists = await prisma.readingList.findMany({
  where: { ownerId: user.id },
  include: {
    books: {
      select: { id: true },
      take: 1  // Just count
    }
  },
  orderBy: { updatedAt: 'desc' }
});

// Transform to include book count
const listsWithCount = lists.map(list => ({
  ...list,
  bookCount: list.books.length
}));
```

#### 6. Fetch User's Favorites (All Time)
```typescript
const favorites = await prisma.readingList.findFirst({
  where: {
    ownerId: user.id,
    type: "FAVORITES_ALL"
  },
  include: {
    books: {
      include: { book: true },
      orderBy: { position: 'asc' }
    }
  }
});
```

#### 7. Fetch All Lists Containing a Book
```typescript
const lists = await prisma.bookInReadingList.findMany({
  where: {
    bookId: bookId,
    readingList: { ownerId: user.id }  // Only user's lists
  },
  include: {
    readingList: {
      select: {
        id: true,
        title: true,
        type: true,
        visibility: true
      }
    }
  }
});
```

#### 8. Remove Book from Reading List
```typescript
await prisma.bookInReadingList.delete({
  where: {
    bookId_readingListId: {
      bookId: bookId,
      readingListId: listId
    }
  }
});
```

#### 9. Reorder Books in List
```typescript
// Update multiple positions in transaction
await prisma.$transaction([
  prisma.bookInReadingList.update({
    where: { id: entry1Id },
    data: { position: 100 }
  }),
  prisma.bookInReadingList.update({
    where: { id: entry2Id },
    data: { position: 200 }
  }),
  // ... more updates
]);
```

#### 10. Update Book Notes in List
```typescript
await prisma.bookInReadingList.update({
  where: {
    bookId_readingListId: {
      bookId: bookId,
      readingListId: listId
    }
  },
  data: {
    notes: "Started reading, really enjoying it!"
  }
});
```

#### 11. Delete Reading List
```typescript
// Cascade delete handles BookInReadingList cleanup
await prisma.readingList.delete({
  where: { id: listId }
});
```

#### 12. Fetch Public Reading Lists (Future Feature)
```typescript
const publicLists = await prisma.readingList.findMany({
  where: { visibility: "PUBLIC" },
  include: {
    owner: { select: { name: true } },
    books: {
      include: { book: true },
      orderBy: { position: 'asc' },
      take: 5  // Preview first 5 books
    }
  },
  orderBy: { updatedAt: 'desc' },
  take: 20
});
```

#### 13. Update Book Read Date
```typescript
await prisma.book.update({
  where: { id: bookId },
  data: {
    readDate: new Date('2024-06-15')  // When user read the book
  }
});
```

#### 14. Fetch Books Read in a Specific Year
```typescript
const year = 2024;
const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

const booksReadIn2024 = await prisma.book.findMany({
  where: {
    ownerId: user.id,
    readDate: {
      gte: startOfYear,
      lte: endOfYear
    }
  },
  orderBy: { readDate: 'desc' }
});
```

#### 15. Fetch Favorites with Books Read in Specific Year
```typescript
// Get user's favorites list for 2024, filtered by books read in 2024
const favorites2024 = await prisma.readingList.findFirst({
  where: {
    ownerId: user.id,
    type: "FAVORITES_YEAR",
    year: "2024"
  },
  include: {
    books: {
      where: {
        book: {
          readDate: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31')
          }
        }
      },
      include: { book: true },
      orderBy: { position: 'asc' }
    }
  }
});
```

#### 16. Update User Profile Image
```typescript
await prisma.user.update({
  where: { clerkId: user.clerkId },
  data: {
    profileImageUrl: "https://blob.vercel-storage.com/user-123/profile.jpg"
  }
});
```

## File Storage Strategy

### Profile Image Storage

Profile images require external file storage. The `profileImageUrl` field in the User model stores the URL to the uploaded image.

**Recommended Solution: Vercel Blob**

For Penumbra's deployment on Vercel, **Vercel Blob** is the recommended file storage solution:

**Advantages**:
- Native Vercel integration (zero configuration)
- Simple API (@vercel/blob package)
- Automatic CDN distribution
- Built-in signed URLs for security
- Pay-as-you-go pricing (free tier: 1GB storage, 10GB bandwidth/month)
- Image optimization support
- Private uploads with access control

**Implementation Pattern**:
```typescript
import { put, del } from '@vercel/blob';

// Upload profile image
const blob = await put(`users/${userId}/profile.jpg`, file, {
  access: 'public', // or 'private' with signed URLs
  addRandomSuffix: false
});

// Store URL in database
await prisma.user.update({
  where: { id: userId },
  data: { profileImageUrl: blob.url }
});

// Delete old image
await del(oldImageUrl);
```

**Alternative Options**:

1. **AWS S3** - More complex setup, better for large scale
   - Requires AWS account and configuration
   - More granular access control
   - Lower cost at scale
   - Recommended if already using AWS infrastructure

2. **Cloudinary** - Best for image transformation
   - Advanced image manipulation and optimization
   - Automatic responsive images
   - More expensive than Vercel Blob
   - Recommended if complex image processing needed

3. **Local Filesystem** - Development only
   - NOT recommended for production (Vercel serverless functions are stateless)
   - Use only for local development/testing

**Security Considerations**:
- Validate file type (JPEG, PNG, WebP only)
- Enforce file size limits (max 5MB for profile images)
- Use signed URLs for private images
- Sanitize filenames to prevent path traversal
- Delete old images when user uploads new one

**Image Optimization**:
- Resize to max 400x400px (profile image standard)
- Compress with quality 85%
- Convert to WebP for modern browsers with JPEG fallback
- Use Vercel's built-in image optimization via Next.js Image component

For detailed implementation guide, see FILE_STORAGE_STRATEGY.md.

## Migration Strategy

### Step 1: Create Migration

```bash
cd /Users/jonathan/github/penumbra/.conductor/monrovia
npx prisma migrate dev --name add_profile_image_and_read_date
```

This will:
1. Create new migration file in `prisma/migrations/`
2. Generate SQL for adding tables, enums, indexes, and constraints
3. Apply migration to development database
4. Regenerate Prisma Client

### Step 2: Review Generated Migration

Check `prisma/migrations/[timestamp]_add_reading_lists_and_favorites/migration.sql`:
- Verify enum creation (ReadingListVisibility, ReadingListType)
- Verify table creation (ReadingList, BookInReadingList)
- Verify indexes are created
- Verify foreign key constraints with CASCADE

### Step 3: Test Migration

```bash
# Test rollback works
npx prisma migrate reset

# Reapply all migrations
npx prisma migrate dev
```

### Step 4: Verify Schema

```bash
# Generate Prisma Client with new types
npx prisma generate

# Validate schema
npx prisma validate
```

### Step 5: Staging Deployment

```bash
# Apply to staging database
DATABASE_URL="$STAGING_DB_URL" npx prisma migrate deploy
```

### Step 6: Production Deployment

```bash
# Apply to production database (coordinate with downtime if needed)
DATABASE_URL="$PRODUCTION_DB_URL" npx prisma migrate deploy
```

### Rollback Plan

If issues arise:

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back [migration-name]

# Or reset and reapply up to specific migration
npx prisma migrate reset
```

**Data Safety**: Since this is a new feature (no existing data to migrate), rollback is safe. No data loss risk.

### Post-Migration Verification

```typescript
// Test script: scripts/verify-reading-lists.ts
import prisma from '@/lib/prisma';

async function verify() {
  // Test create reading list
  const testList = await prisma.readingList.create({
    data: {
      ownerId: 1,
      title: "Test List",
      type: "STANDARD",
      visibility: "PRIVATE"
    }
  });

  console.log('✓ Created reading list:', testList.id);

  // Test add book to list
  const testEntry = await prisma.bookInReadingList.create({
    data: {
      bookId: 1,
      readingListId: testList.id,
      position: 100
    }
  });

  console.log('✓ Added book to list:', testEntry.id);

  // Test fetch with relationships
  const fetchedList = await prisma.readingList.findUnique({
    where: { id: testList.id },
    include: { books: { include: { book: true } } }
  });

  console.log('✓ Fetched list with books:', fetchedList?.books.length);

  // Cleanup
  await prisma.bookInReadingList.delete({ where: { id: testEntry.id } });
  await prisma.readingList.delete({ where: { id: testList.id } });

  console.log('✓ All tests passed!');
}

verify().catch(console.error);
```

Run verification:
```bash
npx tsx scripts/verify-reading-lists.ts
```

## Future Enhancements

### Potential Schema Extensions

1. **Reading Progress**:
   - Add `currentPage: Int?` to BookInReadingList
   - Add `completedAt: DateTime?` to BookInReadingList
   - Calculate progress percentage

2. **List Collaboration**:
   - Add `ReadingListCollaborator` model
   - Support multiple editors per list
   - Add permission levels (viewer, editor, admin)

3. **List Tags/Categories**:
   - Add `tags: String[]` to ReadingList
   - Enable filtering and organization
   - Support tag-based search

4. **List Templates**:
   - Add `isTemplate: Boolean` to ReadingList
   - Allow users to create lists from templates
   - Share popular list structures

5. **Social Features**:
   - Add `likes: Int` counter
   - Add `ListLike` model for user likes
   - Add comments on lists
   - Follow users for list updates

6. **Reading Statistics**:
   - Track read dates per book per list
   - Calculate reading velocity
   - Genre distribution analytics

### Migration Path for Enhancements

All future enhancements are backward-compatible additions:
- New optional fields (nullable or with defaults)
- New tables (no schema changes to existing tables)
- New relationships (one-to-many additions)

No breaking changes required for core functionality.

## Security Considerations

### Authorization Rules

1. **Reading Lists**:
   - CREATE: Authenticated users only
   - READ: Owner always; others based on visibility
   - UPDATE: Owner only
   - DELETE: Owner only

2. **Books in Lists**:
   - ADD: List owner only
   - REMOVE: List owner only
   - REORDER: List owner only
   - UPDATE NOTES: List owner only

3. **Visibility Enforcement**:
   - PRIVATE: Owner only (even if URL is known)
   - PUBLIC: Anyone can view
   - UNLISTED: Anyone with URL (future)
   - FRIENDS: Owner and friends (future)

### Implementation Pattern

Follow existing `permissions.ts` pattern:

```typescript
// Example: src/utils/permissions.ts additions

export async function checkReadingListPermission(listId: number) {
  const { userId } = await auth();

  const list = await prisma.readingList.findUnique({
    where: { id: listId },
    include: { owner: true }
  });

  if (!list) {
    throw new Error("Reading list not found");
  }

  const isOwner = userId === list.owner.clerkId;

  const canView =
    isOwner ||
    list.visibility === "PUBLIC" ||
    list.visibility === "UNLISTED";

  return {
    userId,
    isOwner,
    canView,
    canEdit: isOwner,
    canDelete: isOwner
  };
}

export async function requireReadingListOwnership(listId: number) {
  const user = await getCurrentUser();

  const list = await prisma.readingList.findUnique({
    where: { id: listId }
  });

  if (!list) {
    throw new Error("Reading list not found");
  }

  if (list.ownerId !== user.id) {
    throw new Error("Unauthorized: You don't own this reading list");
  }

  return { user, list };
}

export async function getViewableReadingListFilter() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { visibility: "PUBLIC" };
  }

  return {
    OR: [
      { visibility: "PUBLIC" },
      { owner: { clerkId: userId } }
    ]
  };
}
```

### Input Validation

1. **Title**: Max 200 characters, required
2. **Description**: Max 5000 characters, optional
3. **Year**: Format YYYY, 1900-2100 range
4. **Position**: Positive integers only
5. **Notes**: Max 1000 characters per book
6. **Book Limit**: Enforce 5-6 for favorites lists

### SQL Injection Prevention

Prisma ORM provides automatic parameterization - no raw SQL needed for standard operations. If raw SQL is required, always use parameterized queries:

```typescript
// Safe: Prisma parameterizes automatically
const lists = await prisma.$queryRaw`
  SELECT * FROM ReadingList WHERE ownerId = ${userId}
`;
```

## Testing Strategy

### Unit Tests

1. **Model Creation**: Test creating lists, adding books
2. **Relationships**: Verify cascade deletes work
3. **Constraints**: Test unique constraints, validations
4. **Ordering**: Verify position-based ordering
5. **Favorites**: Test favorites-specific business rules

### Integration Tests

1. **CRUD Operations**: Full create, read, update, delete flows
2. **Permissions**: Test authorization at each endpoint
3. **N+1 Queries**: Verify optimized queries with includes
4. **Pagination**: Test cursor and offset pagination
5. **Concurrent Updates**: Test race conditions in position updates

### Performance Tests

1. **Load Testing**: 1000+ concurrent users creating/reading lists
2. **Query Performance**: Verify <100ms p95 response times
3. **Index Effectiveness**: Use EXPLAIN ANALYZE on queries
4. **Scalability**: Test with 10,000+ lists per user

### Test Data Setup

```typescript
// Example: tests/fixtures/reading-lists.ts
export async function createTestReadingList(userId: number) {
  return await prisma.readingList.create({
    data: {
      ownerId: userId,
      title: `Test List ${Date.now()}`,
      type: "STANDARD",
      visibility: "PRIVATE"
    }
  });
}

export async function addBooksToList(listId: number, bookIds: number[]) {
  return await prisma.$transaction(
    bookIds.map((bookId, index) =>
      prisma.bookInReadingList.create({
        data: {
          bookId,
          readingListId: listId,
          position: (index + 1) * 100
        }
      })
    )
  );
}
```

## Conclusion

This schema design provides a robust, scalable foundation for the Reading Lists feature with the following key strengths:

1. **Flexible**: Supports both standard lists and favorites with extensibility
2. **Performant**: Strategic indexing for common query patterns
3. **Consistent**: Follows existing Penumbra patterns and conventions
4. **Safe**: Proper constraints and cascade deletes maintain data integrity
5. **Scalable**: Supports thousands of lists and books without degradation
6. **Secure**: Clear authorization rules following existing patterns

The schema is ready for implementation with clear migration steps and comprehensive query examples to guide development.
