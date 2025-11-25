/**
 * User Factory
 * 
 * Provides functions to generate test user data with realistic values.
 * Includes both build* functions (returns plain objects) and create* functions (persists to DB).
 */

import { faker } from '@faker-js/faker';
import { testPrisma } from '../helpers/db';
import type { User } from '@prisma/client';

/**
 * Configuration for building a user
 */
export interface BuildUserOptions {
  clerkId?: string;
  email?: string;
  name?: string;
  profileImageUrl?: string | null;
}

/**
 * Build a user object without persisting to database.
 * Useful for testing validation logic or preparing data for bulk operations.
 * 
 * @param options - Optional overrides for user properties
 * @returns User data object (not persisted)
 * 
 * @example
 * ```typescript
 * const userData = buildUser();
 * const customUser = buildUser({ 
 *   email: 'specific@example.com',
 *   name: 'John Doe' 
 * });
 * ```
 */
export function buildUser(options: BuildUserOptions = {}): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    clerkId: options.clerkId ?? `clerk_${faker.string.alphanumeric(24)}`,
    email: options.email ?? faker.internet.email(),
    name: options.name ?? faker.person.fullName(),
    profileImageUrl: options.profileImageUrl === undefined 
      ? (faker.datatype.boolean() ? faker.image.avatar() : null)
      : options.profileImageUrl,
  };
}

/**
 * Create a user in the database with realistic test data.
 * 
 * @param options - Optional overrides for user properties
 * @returns Created user record with all fields
 * 
 * @example
 * ```typescript
 * const user = await createUser();
 * const adminUser = await createUser({ 
 *   email: 'admin@example.com',
 *   name: 'Admin User' 
 * });
 * ```
 */
export async function createUser(options: BuildUserOptions = {}): Promise<User> {
  const userData = buildUser(options);
  
  return testPrisma.user.create({
    data: userData,
  });
}

/**
 * Create multiple users in the database.
 * More efficient than calling createUser repeatedly.
 * 
 * @param count - Number of users to create
 * @param baseOptions - Optional base configuration applied to all users
 * @returns Array of created user records
 * 
 * @example
 * ```typescript
 * const users = await createUsers(5);
 * const testUsers = await createUsers(3, { 
 *   profileImageUrl: null 
 * });
 * ```
 */
export async function createUsers(
  count: number,
  baseOptions: BuildUserOptions = {}
): Promise<User[]> {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    const user = await createUser(baseOptions);
    users.push(user);
  }
  
  return users;
}

/**
 * Build multiple user objects without persisting.
 * 
 * @param count - Number of user objects to build
 * @param baseOptions - Optional base configuration applied to all users
 * @returns Array of user data objects (not persisted)
 * 
 * @example
 * ```typescript
 * const userDataArray = buildUsers(5);
 * const customUsers = buildUsers(3, { name: 'Test User' });
 * ```
 */
export function buildUsers(
  count: number,
  baseOptions: BuildUserOptions = {}
): Array<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> {
  return Array.from({ length: count }, () => buildUser(baseOptions));
}

/**
 * Create a user with a profile image URL.
 * 
 * @param options - Optional overrides for user properties
 * @returns Created user record with profile image
 * 
 * @example
 * ```typescript
 * const userWithAvatar = await createUserWithProfileImage();
 * const customUser = await createUserWithProfileImage({ 
 *   profileImageUrl: 'https://example.com/avatar.jpg' 
 * });
 * ```
 */
export async function createUserWithProfileImage(
  options: BuildUserOptions = {}
): Promise<User> {
  return createUser({
    ...options,
    profileImageUrl: options.profileImageUrl ?? faker.image.avatar(),
  });
}

/**
 * Create a user without a profile image.
 * 
 * @param options - Optional overrides for user properties
 * @returns Created user record without profile image
 * 
 * @example
 * ```typescript
 * const basicUser = await createUserWithoutProfileImage();
 * ```
 */
export async function createUserWithoutProfileImage(
  options: BuildUserOptions = {}
): Promise<User> {
  return createUser({
    ...options,
    profileImageUrl: null,
  });
}

/**
 * Create a user with a specific Clerk ID pattern.
 * Useful for testing Clerk integration scenarios.
 * 
 * @param clerkIdPattern - Pattern or specific Clerk ID
 * @param options - Optional overrides for other user properties
 * @returns Created user record
 * 
 * @example
 * ```typescript
 * const user = await createUserWithClerkId('user_test_123');
 * ```
 */
export async function createUserWithClerkId(
  clerkIdPattern: string,
  options: Omit<BuildUserOptions, 'clerkId'> = {}
): Promise<User> {
  return createUser({
    ...options,
    clerkId: clerkIdPattern,
  });
}
