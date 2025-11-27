/**
 * Database Test Helpers
 * 
 * Provides utilities for setting up and tearing down test database state.
 * Includes functions for database cleanup, seeding common test data, and 
 * transaction management for isolated tests.
 */

import { PrismaClient } from "@prisma/client";

// Create a dedicated test Prisma client
// Uses the same database URL but can be configured differently for tests
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DEWEY_DB_DATABASE_URL,
    },
  },
});

export { testPrisma };

/**
 * Reset the entire database by deleting all records in proper order
 * to respect foreign key constraints.
 * 
 * Order matters:
 * 1. BookInReadingList (junction table, depends on Book and ReadingList)
 * 2. Book (depends on User)
 * 3. ReadingList (depends on User)
 * 4. User (no dependencies)
 * 
 * @example
 * ```typescript
 * beforeEach(async () => {
 *   await resetDatabase();
 * });
 * ```
 */
export async function resetDatabase(): Promise<void> {
  try {
    // Delete in order of foreign key dependencies (children first)
    await testPrisma.bookInReadingList.deleteMany({});
    await testPrisma.book.deleteMany({});
    await testPrisma.readingList.deleteMany({});
    await testPrisma.user.deleteMany({});
    
    console.log('Database reset complete');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

/**
 * Seed a standard test user with predictable data.
 * Useful for tests that need a user but don't care about specific attributes.
 * 
 * @param overrides - Optional properties to override defaults
 * @returns Created user record
 * 
 * @example
 * ```typescript
 * const user = await seedTestUser();
 * const customUser = await seedTestUser({ 
 *   email: 'custom@example.com',
 *   name: 'Custom User' 
 * });
 * ```
 */
export async function seedTestUser(overrides?: {
  clerkId?: string;
  email?: string;
  name?: string;
  profileImageUrl?: string;
}): Promise<{
  id: number;
  clerkId: string;
  email: string;
  name: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}> {
  const defaultData = {
    clerkId: 'test_clerk_id_123',
    email: 'testuser@example.com',
    name: 'Test User',
    profileImageUrl: null,
  };

  return testPrisma.user.create({
    data: {
      ...defaultData,
      ...overrides,
    },
  });
}

/**
 * Execute a function within a database transaction that will be rolled back.
 * Useful for tests that need to verify behavior without persisting changes.
 * 
 * Note: This uses Prisma's interactive transactions which have a default timeout.
 * For long-running operations, consider using explicit cleanup instead.
 * 
 * @param fn - Async function to execute within transaction
 * @returns Result of the function
 * 
 * @example
 * ```typescript
 * await withTransaction(async (tx) => {
 *   const user = await tx.user.create({ data: { ... } });
 *   // Test operations...
 *   // Transaction will rollback automatically
 * });
 * ```
 */
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, "$extends" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use">) => Promise<T>
): Promise<T> {
  return testPrisma.$transaction(async (tx) => {
    return fn(tx);
  });
}

/**
 * Clean up specific tables while maintaining referential integrity.
 * More targeted than resetDatabase when you only need to clean certain data.
 * 
 * @param tables - Array of table names to clean
 * 
 * @example
 * ```typescript
 * // Clean only books and their relationships
 * await cleanupTables(['bookInReadingList', 'book']);
 * ```
 */
export async function cleanupTables(
  tables: Array<'bookInReadingList' | 'book' | 'readingList' | 'user'>
): Promise<void> {
  // Always delete in correct order to respect foreign keys
  const orderedTables: Array<'bookInReadingList' | 'book' | 'readingList' | 'user'> = [
    'bookInReadingList',
    'book', 
    'readingList',
    'user'
  ];

  for (const table of orderedTables) {
    if (tables.includes(table)) {
      await testPrisma[table].deleteMany({});
    }
  }
}

/**
 * Disconnect the test Prisma client.
 * Should be called after all tests complete to clean up database connections.
 * 
 * @example
 * ```typescript
 * afterAll(async () => {
 *   await disconnectTestDatabase();
 * });
 * ```
 */
export async function disconnectTestDatabase(): Promise<void> {
  await testPrisma.$disconnect();
}

/**
 * Check if the database is accessible and ready for testing.
 * Useful for setup validation or debugging connection issues.
 * 
 * @returns true if database is accessible, false otherwise
 * 
 * @example
 * ```typescript
 * beforeAll(async () => {
 *   const isReady = await isDatabaseReady();
 *   if (!isReady) {
 *     throw new Error('Database not ready for testing');
 *   }
 * });
 * ```
 */
export async function isDatabaseReady(): Promise<boolean> {
  try {
    await testPrisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database not ready:', error);
    return false;
  }
}

/**
 * Get count of records in each table.
 * Useful for debugging tests and verifying cleanup.
 * 
 * @returns Object with counts for each table
 * 
 * @example
 * ```typescript
 * const counts = await getTableCounts();
 * console.log(`Users: ${counts.users}, Books: ${counts.books}`);
 * ```
 */
export async function getTableCounts(): Promise<{
  users: number;
  books: number;
  readingLists: number;
  bookInReadingLists: number;
}> {
  const [users, books, readingLists, bookInReadingLists] = await Promise.all([
    testPrisma.user.count(),
    testPrisma.book.count(),
    testPrisma.readingList.count(),
    testPrisma.bookInReadingList.count(),
  ]);

  return { users, books, readingLists, bookInReadingLists };
}
