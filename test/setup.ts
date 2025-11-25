import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import React from 'react'

// Import MSW handlers
import { handlers } from './mocks/handlers'

// Setup MSW server for API mocking
const server = setupServer(...handlers)

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

// Reset handlers and cleanup after each test
afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.clearAllMocks()
})

// Clean up after all tests are done
afterAll(() => {
  server.close()
})

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
    toString: vi.fn(),
  }),
  usePathname: () => '/',
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// Mock next/image to avoid image optimization issues in tests
vi.mock('next/image', () => ({
  default: (props: any) => {
    return React.createElement('img', props)
  },
}))

// Mock Clerk authentication (will be expanded by other team members)
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({
    userId: 'test_user_id',
    sessionId: 'test_session_id',
  })),
  currentUser: vi.fn(() => ({
    id: 'test_user_id',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  })),
  clerkMiddleware: vi.fn((handler) => handler),
}))

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    userId: 'test_user_id',
    isLoaded: true,
    isSignedIn: true,
  }),
  useUser: () => ({
    user: {
      id: 'test_user_id',
      firstName: 'Test',
      lastName: 'User',
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  SignInButton: ({ children }: any) => React.createElement('button', {}, children),
  SignUpButton: ({ children }: any) => React.createElement('button', {}, children),
  SignOutButton: ({ children }: any) => React.createElement('button', {}, children),
  UserButton: () => React.createElement('button', {}, 'User Menu'),
}))

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_test'
process.env.CLERK_SECRET_KEY = 'sk_test_test'

// Export server for use in individual tests if needed
export { server }
