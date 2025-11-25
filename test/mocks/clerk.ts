/**
 * Clerk Authentication Mocking Utilities
 * 
 * This module provides comprehensive mocking for Clerk authentication
 * in both server-side (auth()) and client-side (useUser(), useAuth()) contexts.
 * 
 * Usage in tests:
 * 
 * Server-side tests:
 *   import { mockClerkUser, mockUnauthenticated } from '@/test/mocks/clerk'
 *   
 *   beforeEach(() => {
 *     mockClerkUser('user_123') // Mock authenticated user
 *   })
 * 
 * Client-side tests:
 *   import { mockClerkClientUser, mockClerkClientUnauthenticated } from '@/test/mocks/clerk'
 *   
 *   render(<Component />, {
 *     wrapper: ({ children }) => (
 *       <ClerkProvider>
 *         {children}
 *       </ClerkProvider>
 *     )
 *   })
 */

import { vi } from 'vitest'

// Type definitions for Clerk auth responses
export interface MockAuthReturn {
  userId: string | null
  sessionId?: string | null
  orgId?: string | null
  orgRole?: string | null
  orgSlug?: string | null
  protect?: () => Promise<void>
}

export interface MockUserReturn {
  isSignedIn: boolean
  isLoaded: boolean
  user: {
    id: string
    emailAddresses: Array<{ emailAddress: string }>
    firstName: string | null
    lastName: string | null
    fullName: string | null
    imageUrl: string
  } | null
}

/**
 * Mock the Clerk auth() function for server-side authentication
 * Used in server actions, API routes, and server components
 * 
 * @param userId - The Clerk user ID to mock (e.g., 'user_123')
 * @param options - Additional auth context options
 * 
 * @example
 * mockClerkUser('user_123')
 * const result = await createReadingList('My List')
 */
export function mockClerkUser(
  userId: string,
  options: {
    sessionId?: string
    orgId?: string
    orgRole?: string
    orgSlug?: string
  } = {}
): void {
  const authMock = {
    userId,
    sessionId: options.sessionId ?? 'session_' + userId,
    orgId: options.orgId ?? null,
    orgRole: options.orgRole ?? null,
    orgSlug: options.orgSlug ?? null,
    protect: vi.fn().mockResolvedValue(undefined),
  }

  vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn().mockResolvedValue(authMock),
    clerkMiddleware: vi.fn((handler) => handler),
    createRouteMatcher: vi.fn(() => vi.fn(() => false)),
  }))
}

/**
 * Mock unauthenticated state for server-side code
 * Sets userId to null, simulating a logged-out user
 * 
 * @example
 * mockUnauthenticated()
 * const filter = await getViewableBookFilter() // Returns only PUBLIC books
 */
export function mockUnauthenticated(): void {
  const authMock = {
    userId: null,
    sessionId: null,
    protect: vi.fn().mockRejectedValue(new Error('Unauthenticated')),
  }

  vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn().mockResolvedValue(authMock),
    clerkMiddleware: vi.fn((handler) => handler),
    createRouteMatcher: vi.fn(() => vi.fn(() => false)),
  }))
}

/**
 * Mock authenticated user for client-side components
 * Used with useUser() and useAuth() hooks
 * 
 * @param userId - The Clerk user ID to mock
 * @param userData - Optional user profile data
 * 
 * @example
 * mockClerkClientUser('user_123', {
 *   email: 'test@example.com',
 *   firstName: 'Test',
 *   lastName: 'User'
 * })
 */
export function mockClerkClientUser(
  userId: string,
  userData: {
    email?: string
    firstName?: string | null
    lastName?: string | null
    imageUrl?: string
  } = {}
): void {
  const firstName = userData.firstName ?? 'Test'
  const lastName = userData.lastName ?? 'User'
  const email = userData.email ?? userId + '@test.com'
  const imageUrl = userData.imageUrl ?? 'https://img.clerk.com/' + userId
  
  const mockUser = {
    id: userId,
    emailAddresses: [{ emailAddress: email }],
    firstName,
    lastName,
    fullName: firstName + ' ' + lastName,
    imageUrl,
  }

  const mockUserReturn = {
    isSignedIn: true,
    isLoaded: true,
    user: mockUser,
  }

  const mockAuthReturn = {
    isSignedIn: true,
    isLoaded: true,
    userId,
    sessionId: 'session_' + userId,
    orgId: null,
    orgRole: null,
    orgSlug: null,
  }

  vi.mock('@clerk/nextjs', () => ({
    useUser: vi.fn().mockReturnValue(mockUserReturn),
    useAuth: vi.fn().mockReturnValue(mockAuthReturn),
    ClerkProvider: vi.fn(({ children }) => children),
    UserButton: vi.fn(() => null),
    SignIn: vi.fn(() => null),
    SignUp: vi.fn(() => null),
  }))
}

/**
 * Mock unauthenticated state for client-side components
 * Sets isSignedIn to false and user to null
 * 
 * @example
 * mockClerkClientUnauthenticated()
 * render(<Header />)
 * expect(screen.getByText('sign in')).toBeInTheDocument()
 */
export function mockClerkClientUnauthenticated(): void {
  const mockUserReturn = {
    isSignedIn: false,
    isLoaded: true,
    user: null,
  }

  const mockAuthReturn = {
    isSignedIn: false,
    isLoaded: true,
    userId: null,
    sessionId: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
  }

  vi.mock('@clerk/nextjs', () => ({
    useUser: vi.fn().mockReturnValue(mockUserReturn),
    useAuth: vi.fn().mockReturnValue(mockAuthReturn),
    ClerkProvider: vi.fn(({ children }) => children),
    UserButton: vi.fn(() => null),
    SignIn: vi.fn(() => null),
    SignUp: vi.fn(() => null),
  }))
}

/**
 * Mock loading state for client-side components
 * Useful for testing loading states in authentication flows
 * 
 * @example
 * mockClerkClientLoading()
 * render(<Header />)
 * expect(screen.queryByText('sign in')).not.toBeInTheDocument()
 */
export function mockClerkClientLoading(): void {
  const mockUserReturn = {
    isSignedIn: false,
    isLoaded: false,
    user: null,
  }

  const mockAuthReturn = {
    isSignedIn: false,
    isLoaded: false,
    userId: null,
    sessionId: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
  }

  vi.mock('@clerk/nextjs', () => ({
    useUser: vi.fn().mockReturnValue(mockUserReturn),
    useAuth: vi.fn().mockReturnValue(mockAuthReturn),
    ClerkProvider: vi.fn(({ children }) => children),
    UserButton: vi.fn(() => null),
    SignIn: vi.fn(() => null),
    SignUp: vi.fn(() => null),
  }))
}

/**
 * Reset all Clerk mocks to their default state
 * Useful in afterEach hooks to clean up between tests
 * 
 * @example
 * afterEach(() => {
 *   resetClerkMocks()
 * })
 */
export function resetClerkMocks(): void {
  vi.clearAllMocks()
}
