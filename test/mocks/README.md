# Test Mocking Utilities

This directory contains mock utilities for external services and authentication used in the Penumbra application. These mocks enable fast, reliable, and deterministic testing without depending on external APIs.

## Table of Contents

1. [Overview](#overview)
2. [Clerk Authentication Mocks](#clerk-authentication-mocks)
3. [ISBNdb API Mocks](#isbndb-api-mocks)
4. [Handler Aggregation](#handler-aggregation)
5. [Examples](#examples)
6. [Best Practices](#best-practices)

## Overview

The mock utilities are organized into three main files:

- **`clerk.ts`** - Clerk authentication mocking for both server and client components
- **`isbndb.ts`** - MSW handlers for ISBNdb API requests
- **`handlers.ts`** - Aggregates all handlers and provides testing utilities

## Clerk Authentication Mocks

### Server-Side Mocking

For testing server actions, API routes, and server components that use `auth()` from `@clerk/nextjs/server`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { mockClerkUser, mockUnauthenticated } from '@/test/mocks/clerk'
import { getCurrentUser, requireAuth } from '@/utils/permissions'

describe('Permission utilities', () => {
  describe('when authenticated', () => {
    beforeEach(() => {
      mockClerkUser('user_123')
    })

    it('should return current user', async () => {
      const userId = await requireAuth()
      expect(userId).toBe('user_123')
    })
  })

  describe('when unauthenticated', () => {
    beforeEach(() => {
      mockUnauthenticated()
    })

    it('should throw authentication error', async () => {
      await expect(requireAuth()).rejects.toThrow('Authentication required')
    })
  })
})
```

### Client-Side Mocking

For testing React components that use `useUser()` or `useAuth()` hooks:

```typescript
import { render, screen } from '@testing-library/react'
import { mockClerkClientUser, mockClerkClientUnauthenticated } from '@/test/mocks/clerk'
import { Header } from '@/app/components/header'

describe('Header component', () => {
  it('should show sign in button when unauthenticated', () => {
    mockClerkClientUnauthenticated()
    render(<Header />)
    expect(screen.getByText('sign in')).toBeInTheDocument()
  })

  it('should show user button when authenticated', () => {
    mockClerkClientUser('user_123', {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    })
    render(<Header />)
    expect(screen.queryByText('sign in')).not.toBeInTheDocument()
  })
})
```

### Available Functions

#### Server-Side

- **`mockClerkUser(userId, options?)`** - Mock an authenticated user
  - `userId`: Clerk user ID (e.g., 'user_123')
  - `options`: Optional session/org data

- **`mockUnauthenticated()`** - Mock unauthenticated state

#### Client-Side

- **`mockClerkClientUser(userId, userData?)`** - Mock authenticated user for client components
  - `userId`: Clerk user ID
  - `userData`: Optional user profile data (email, firstName, lastName, imageUrl)

- **`mockClerkClientUnauthenticated()`** - Mock unauthenticated state for client

- **`mockClerkClientLoading()`** - Mock loading state (useful for testing loading indicators)

#### Utilities

- **`resetClerkMocks()`** - Clear all mock state (use in `afterEach` hooks)

## ISBNdb API Mocks

### Basic Usage

The ISBNdb mocks use MSW (Mock Service Worker) to intercept HTTP requests:

```typescript
import { setupServer } from 'msw/node'
import { isbndbHandlers } from '@/test/mocks/isbndb'

const server = setupServer(...isbndbHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Default Mock Books

Three pre-configured books are available:

1. **The Great Gatsby** - ISBN: 9780743273565
2. **Mockery** - ISBN: 9781234567890
3. **To Kill a Mockingbird** - ISBN: 9780061120084

```typescript
import { fetchMetadata } from '@/utils/actions/isbndb/fetchMetadata'

it('should fetch book metadata', async () => {
  const result = await fetchMetadata('9780743273565')
  expect(result.book.title).toBe('The Great Gatsby')
  expect(result.book.authors).toContain('F. Scott Fitzgerald')
})
```

### Error Scenarios

Test error handling with pre-configured error handlers:

```typescript
import { server } from '@/test/setup'
import { isbndbErrorHandlers } from '@/test/mocks/isbndb'

it('should handle 404 errors', async () => {
  server.use(isbndbErrorHandlers.notFound)
  
  await expect(fetchMetadata('9999999999999'))
    .rejects.toThrow('Book not found')
})

it('should handle rate limiting', async () => {
  server.use(isbndbErrorHandlers.rateLimitExceeded)
  
  await expect(fetchMetadata('9780743273565'))
    .rejects.toThrow('Rate limit exceeded')
})
```

### Available Error Handlers

- **`notFound`** - 404 Not Found
- **`unauthorized`** - 401 Unauthorized (invalid API key)
- **`rateLimitExceeded`** - 429 Rate Limit Exceeded
- **`serverError`** - 500 Internal Server Error
- **`timeout`** - Network timeout simulation
- **`malformedResponse`** - Invalid response format
- **`emptyResponse`** - Empty book data

### Custom Mock Books

Create custom book data for specific test scenarios:

```typescript
import { createMockBook } from '@/test/mocks/isbndb'
import { http, HttpResponse } from 'msw'

const customBook = createMockBook({
  isbn13: '9999999999999',
  title: 'Custom Test Book',
  authors: ['Test Author'],
  pages: 500
})

server.use(
  http.get('https://api2.isbndb.com/book/9999999999999', () => {
    return HttpResponse.json({ book: customBook })
  })
)
```

### Testing Slow Responses

Simulate slow API responses to test loading states:

```typescript
import { createSlowResponseHandler } from '@/test/mocks/isbndb'

it('should show loading indicator during fetch', async () => {
  server.use(createSlowResponseHandler('9780743273565', 2000)) // 2 second delay
  
  render(<BookSearch />)
  // Test loading state...
})
```

### Testing Retry Logic

Simulate flaky network conditions:

```typescript
import { createFlakeyHandler } from '@/test/mocks/isbndb'

it('should retry failed requests', async () => {
  server.use(createFlakeyHandler('9780743273565', 2)) // Fails twice, then succeeds
  
  const result = await fetchMetadataWithRetry('9780743273565')
  expect(result.book).toBeDefined()
})
```

## Handler Aggregation

### Setup in Test Configuration

Create a test setup file that configures MSW globally:

```typescript
// test/setup.ts
import { setupServer } from 'msw/node'
import { handlers } from '@/test/mocks/handlers'
import { beforeAll, afterEach, afterAll } from 'vitest'

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Pre-configured Scenarios

Use scenario handlers for common testing patterns:

```typescript
import { scenarioHandlers } from '@/test/mocks/handlers'

describe('Error handling', () => {
  it('should handle all services being down', () => {
    server.use(...scenarioHandlers.allDown)
    // Test error states...
  })

  it('should handle rate limiting', () => {
    server.use(...scenarioHandlers.rateLimited)
    // Test rate limit behavior...
  })
})
```

### Network Condition Simulation

Test offline scenarios and slow connections:

```typescript
import { networkConditions } from '@/test/mocks/handlers'

it('should show offline message when network is unavailable', () => {
  server.use(...networkConditions.offline())
  // Test offline state...
})

it('should handle slow connections gracefully', () => {
  server.use(...networkConditions.slow3G(750))
  // Test with 750ms delay...
})
```

## Examples

### Complete Integration Test Example

```typescript
// test/integration/actions/books.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from '@/test/mocks/handlers'
import { mockClerkUser } from '@/test/mocks/clerk'
import { importBooks } from '@/utils/actions/books'
import { resetDatabase, seedTestUser } from '@/test/helpers/db'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  resetClerkMocks()
})
afterAll(() => server.close())

describe('Book import integration', () => {
  let userId: string

  beforeEach(async () => {
    await resetDatabase()
    userId = 'user_123'
    mockClerkUser(userId)
    await seedTestUser(userId)
  })

  it('should import books successfully', async () => {
    const importQueue = [{
      isbn13: '9780743273565',
      title: 'The Great Gatsby',
      authors: ['F. Scott Fitzgerald'],
      // ... other fields
    }]

    const result = await importBooks(importQueue)

    expect(result.success).toBe(true)
    expect(result.count).toBe(1)
  })

  it('should handle import errors gracefully', async () => {
    mockUnauthenticated()

    const result = await importBooks([])
    expect(result.success).toBe(false)
    expect(result.error).toContain('not authenticated')
  })
})
```

### Component Test Example with Multiple Mocks

```typescript
// test/integration/components/BookImport.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockClerkClientUser } from '@/test/mocks/clerk'
import { setupServer } from 'msw/node'
import { isbndbHandlers } from '@/test/mocks/isbndb'
import { BookImportForm } from '@/app/import/components/search'

const server = setupServer(...isbndbHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('BookImportForm', () => {
  beforeEach(() => {
    mockClerkClientUser('user_123')
  })

  it('should search and preview book', async () => {
    const user = userEvent.setup()
    render(<BookImportForm />)

    // Search for book
    await user.type(screen.getByRole('searchbox'), '9780743273565')
    await user.click(screen.getByRole('button', { name: /search/i }))

    // Verify book preview
    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
      expect(screen.getByText('F. Scott Fitzgerald')).toBeInTheDocument()
    })
  })

  it('should handle search errors', async () => {
    server.use(isbndbErrorHandlers.notFound)
    
    const user = userEvent.setup()
    render(<BookImportForm />)

    await user.type(screen.getByRole('searchbox'), '9999999999999')
    await user.click(screen.getByRole('button', { name: /search/i }))

    await waitFor(() => {
      expect(screen.getByText(/book not found/i)).toBeInTheDocument()
    })
  })
})
```

## Best Practices

### 1. Mock at System Boundaries

Mock external services (APIs, authentication) but test internal code with real implementations:

```typescript
// GOOD - Mock external API
server.use(...isbndbHandlers)

// BAD - Don't mock internal utilities
vi.mock('@/utils/validation') // Test these for real!
```

### 2. Reset State Between Tests

Always reset mocks in `afterEach` to prevent test pollution:

```typescript
afterEach(() => {
  server.resetHandlers()
  resetClerkMocks()
  vi.clearAllMocks()
})
```

### 3. Test Both Success and Error Cases

Don't just test happy paths:

```typescript
describe('fetchMetadata', () => {
  it('should fetch successfully', async () => {
    // Test success...
  })

  it('should handle 404 errors', async () => {
    server.use(isbndbErrorHandlers.notFound)
    // Test error handling...
  })

  it('should handle rate limiting', async () => {
    server.use(isbndbErrorHandlers.rateLimitExceeded)
    // Test retry logic...
  })
})
```

### 4. Use Realistic Mock Data

Keep mock data realistic to catch real-world issues:

```typescript
// GOOD - Realistic data
const book = createMockBook({
  title: 'The Great Gatsby',
  authors: ['F. Scott Fitzgerald'],
  pages: 180,
  date_published: '2004-09-30'
})

// BAD - Unrealistic data
const book = {
  title: 'Test',
  authors: ['Test']
}
```

### 5. Document Test Scenarios

Make test intent clear with descriptive names:

```typescript
describe('Book import with authentication', () => {
  describe('when user is authenticated', () => {
    // Tests...
  })

  describe('when user is not authenticated', () => {
    // Tests...
  })

  describe('when API is rate limited', () => {
    // Tests...
  })
})
```

### 6. Avoid Over-Mocking

Don't mock things you don't need to:

```typescript
// GOOD - Only mock Clerk
mockClerkUser('user_123')
// Let Prisma, validation, etc. run normally

// BAD - Over-mocking
mockClerkUser('user_123')
vi.mock('@/lib/prisma')
vi.mock('@/utils/validation')
vi.mock('@/utils/permissions')
```

### 7. Keep Mocks Simple

Mocks should be simpler than the real implementation:

```typescript
// GOOD - Simple mock
export const mockBooks = {
  gatsby: {
    title: 'The Great Gatsby',
    authors: ['F. Scott Fitzgerald']
  }
}

// BAD - Complex mock that duplicates business logic
export const mockBooks = {
  gatsby: {
    // 50 fields with complex validation...
  }
}
```

## Troubleshooting

### Mock not being used

Ensure MSW server is started before tests run:

```typescript
beforeAll(() => server.listen())
```

### Tests affecting each other

Reset handlers and mocks between tests:

```typescript
afterEach(() => {
  server.resetHandlers()
  resetClerkMocks()
})
```

### Type errors with mocks

Ensure you're using the correct import paths and types:

```typescript
import { mockClerkUser } from '@/test/mocks/clerk' // Correct
import { mockClerkUser } from '@/mocks/clerk' // Wrong path
```

### Clerk hooks not working

For client components, use the client-specific mocks:

```typescript
// Server component/action
mockClerkUser('user_123')

// Client component
mockClerkClientUser('user_123')
```

## Contributing

When adding new external services:

1. Create a new file in `test/mocks/` (e.g., `google-books.ts`)
2. Export handlers and error handlers
3. Add handlers to `handlers.ts`
4. Document usage in this README
5. Add example tests

## Resources

- [MSW Documentation](https://mswjs.io/)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Clerk Testing Docs](https://clerk.com/docs/testing)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)
