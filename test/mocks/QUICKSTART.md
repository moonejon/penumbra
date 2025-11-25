# Quick Start Guide - Authentication Mocking Utilities

## Installation

First, ensure you have the required testing dependencies:

\`\`\`bash
npm install -D vitest @vitest/ui msw @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
\`\`\`

## Basic Setup

### 1. Create Test Setup File

Create \`test/setup.ts\`:

\`\`\`typescript
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from '@/test/mocks/handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
\`\`\`

### 2. Configure Vitest

Create \`vitest.config.ts\`:

\`\`\`typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
\`\`\`

### 3. Add Test Scripts

Add to \`package.json\`:

\`\`\`json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
\`\`\`

## Usage Examples

### Testing Server Actions

\`\`\`typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { mockClerkUser, mockUnauthenticated } from '@/test/mocks/clerk'
import { requireAuth } from '@/utils/permissions'

describe('Authentication', () => {
  it('should authenticate user', async () => {
    mockClerkUser('user_123')
    const userId = await requireAuth()
    expect(userId).toBe('user_123')
  })

  it('should reject unauthenticated', async () => {
    mockUnauthenticated()
    await expect(requireAuth()).rejects.toThrow()
  })
})
\`\`\`

### Testing React Components

\`\`\`typescript
import { render, screen } from '@testing-library/react'
import { mockClerkClientUser } from '@/test/mocks/clerk'
import { Header } from '@/app/components/header'

describe('Header', () => {
  it('should show user when authenticated', () => {
    mockClerkClientUser('user_123')
    render(<Header />)
    // Assertions...
  })
})
\`\`\`

### Testing API Calls

\`\`\`typescript
import { fetchMetadata } from '@/utils/actions/isbndb/fetchMetadata'

describe('ISBNdb API', () => {
  it('should fetch book data', async () => {
    const result = await fetchMetadata('9780743273565')
    expect(result.book.title).toBe('The Great Gatsby')
  })
})
\`\`\`

## Available Mocks

### Clerk Authentication

- \`mockClerkUser(userId)\` - Mock authenticated user (server)
- \`mockUnauthenticated()\` - Mock logged out state (server)
- \`mockClerkClientUser(userId, data)\` - Mock authenticated user (client)
- \`mockClerkClientUnauthenticated()\` - Mock logged out state (client)

### ISBNdb API

Pre-configured books:
- ISBN 9780743273565 - The Great Gatsby
- ISBN 9780061120084 - To Kill a Mockingbird  
- ISBN 9781234567890 - Mockery (test book)

Error handlers:
- \`isbndbErrorHandlers.notFound\` - 404 error
- \`isbndbErrorHandlers.rateLimitExceeded\` - 429 error
- \`isbndbErrorHandlers.unauthorized\` - 401 error
- \`isbndbErrorHandlers.serverError\` - 500 error

## Testing Error Scenarios

\`\`\`typescript
import { server } from '@/test/setup'
import { isbndbErrorHandlers } from '@/test/mocks/isbndb'

it('should handle 404', async () => {
  server.use(isbndbErrorHandlers.notFound)
  await expect(fetchMetadata('9999999999999')).rejects.toThrow()
})
\`\`\`

## Running Tests

\`\`\`bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific file
npm test permissions.test.ts

# Watch mode
npm test -- --watch
\`\`\`

## Next Steps

1. See \`test/mocks/README.md\` for comprehensive documentation
2. Check \`test/examples/\` for complete test examples
3. Review \`test/mocks/IMPLEMENTATION_SUMMARY.md\` for full details

## Common Patterns

### Reset mocks between tests

\`\`\`typescript
import { resetClerkMocks } from '@/test/mocks/clerk'

afterEach(() => {
  resetClerkMocks()
  server.resetHandlers()
})
\`\`\`

### Test authenticated + unauthenticated

\`\`\`typescript
describe('Feature', () => {
  describe('when authenticated', () => {
    beforeEach(() => mockClerkUser('user_123'))
    // Tests...
  })

  describe('when not authenticated', () => {
    beforeEach(() => mockUnauthenticated())
    // Tests...
  })
})
\`\`\`

### Override default handlers

\`\`\`typescript
it('should handle errors', () => {
  server.use(isbndbErrorHandlers.serverError)
  // Test error handling...
})
\`\`\`

## Troubleshooting

**Mocks not working?**
- Ensure \`test/setup.ts\` is configured in \`vitest.config.ts\`
- Check that MSW server is started in \`beforeAll\`

**Type errors?**
- Verify \`@/\` alias is configured correctly
- Ensure all dependencies are installed

**Tests affecting each other?**
- Add \`resetClerkMocks()\` to \`afterEach\`
- Add \`server.resetHandlers()\` to \`afterEach\`

For more help, see the full README.md in this directory.
