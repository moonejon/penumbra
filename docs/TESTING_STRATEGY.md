# Penumbra Testing Strategy

> A comprehensive, practical testing plan following Kent C. Dodds' Testing Trophy approach

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Testing Philosophy](#testing-philosophy)
4. [Unit Testing Strategy](#unit-testing-strategy)
5. [Integration Testing Strategy](#integration-testing-strategy)
6. [Functional Testing Strategy](#functional-testing-strategy)
7. [End-to-End Testing Strategy](#end-to-end-testing-strategy)
8. [Test Organization](#test-organization)
9. [Build Integration](#build-integration)
10. [Test Data Management](#test-data-management)
11. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
12. [Implementation Roadmap](#implementation-roadmap)
13. [Maintainability Guidelines](#maintainability-guidelines)

---

## Executive Summary

This testing strategy is designed for **Penumbra**, a Next.js 15 personal library management application. The strategy follows Kent C. Dodds' **Testing Trophy** philosophy, which prioritizes:

- **Integration tests over unit tests** (~50% of testing effort)
- **Testing user behavior, not implementation details**
- **Confidence over coverage percentage**
- **Avoiding brittle tests that burden maintenance**

### Tech Stack Overview

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Server Actions, API Routes |
| Database | PostgreSQL with Prisma ORM + Prisma Accelerate |
| Auth | Clerk |
| Storage | Vercel Blob |
| External APIs | ISBNdb, Google Books |

### Current Testing State

- **Coverage**: ~1% (1 test file found: `CreateReadingListModal.test.tsx`)
- **Gap**: 99% of codebase untested
- **Opportunity**: Clean slate to implement best practices

---

## Testing Philosophy

### The Testing Trophy

```
        ▲
       /E2E\         ~10% - Critical user journeys only
      /─────\
     /Integ. \       ~50% - Server actions, component interactions
    /──────────\
   /   Unit     \    ~30% - Pure functions, utilities, algorithms
  /──────────────\
 /    Static      \  ~10% - TypeScript, ESLint
/──────────────────\
```

### Core Principles

1. **Write tests. Not too many. Mostly integration.**
   - Integration tests provide the best confidence-to-maintenance ratio
   - They test how components work together, which is where bugs actually live

2. **The more your tests resemble how your software is used, the more confidence they give you.**
   - Test user interactions, not implementation details
   - Use `userEvent` over `fireEvent`
   - Query by accessible roles, not CSS classes

3. **Avoid testing implementation details.**
   - If refactoring breaks your tests but doesn't break your app, your tests are testing implementation details
   - Tests should only fail when user-facing behavior changes

4. **Coverage is a tool, not a goal.**
   - 70-80% coverage with meaningful tests beats 100% coverage with shallow tests
   - Focus on critical paths that generate value

5. **Tests should be useful, not burdensome.**
   - A flaky test is worse than no test
   - Delete tests that don't provide confidence

---

## Unit Testing Strategy

### What to Unit Test

Focus on **pure functions** with complex logic or critical correctness requirements:

| File | Functions | Priority |
|------|-----------|----------|
| `src/utils/validation.ts` | ISBN checksum validation, date validation | HIGH |
| `src/utils/permissions.ts` | `isOwner()`, `canView()`, `canEdit()` | HIGH |
| `src/utils/helpers.ts` | Data transformations, formatting | MEDIUM |

### What NOT to Unit Test

- React components (test as integration)
- Server Actions (test as integration with database)
- Database models (covered by Prisma types)
- Simple pass-through functions
- Third-party library code

### Recommended Tools

| Tool | Purpose |
|------|---------|
| **Vitest** | Test runner (faster than Jest, native ESM) |
| `@testing-library/react` | Component testing |
| `@testing-library/user-event` | User interaction simulation |

### Example Unit Tests

```typescript
// src/utils/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest'
import { isValidIsbn10, isValidIsbn13 } from '../validation'

describe('ISBN Validation', () => {
  describe('isValidIsbn10', () => {
    it('validates correct ISBN-10', () => {
      expect(isValidIsbn10('0306406152')).toBe(true)
    })

    it('rejects invalid checksum', () => {
      expect(isValidIsbn10('0306406151')).toBe(false)
    })

    it('handles X as check digit', () => {
      expect(isValidIsbn10('080442957X')).toBe(true)
    })
  })
})
```

---

## Integration Testing Strategy

**Integration tests should represent ~50% of your testing effort.** They provide the highest confidence-to-cost ratio.

### Key Integration Points

#### 1. Server Actions + Database

Test the entire server action including database operations:

```typescript
// test/integration/actions/reading-lists.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createReadingList, addBookToReadingList } from '@/utils/actions/reading-lists'
import { resetDatabase, seedTestUser } from '@/test/helpers/db'
import { mockClerkUser } from '@/test/mocks/clerk'

describe('Reading List Actions', () => {
  let userId: string

  beforeEach(async () => {
    await resetDatabase()
    userId = 'test_user_1'
    mockClerkUser(userId)
    await seedTestUser(userId)
  })

  it('should create reading list with valid data', async () => {
    const result = await createReadingList(
      'Summer Reads',
      'Books for summer',
      'PUBLIC',
      'STANDARD'
    )

    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({
      title: 'Summer Reads',
      visibility: 'PUBLIC',
    })
  })

  it('should enforce max 6 books for FAVORITES lists', async () => {
    // Create favorites list and add 6 books...
    // Try to add 7th book, expect failure
  })
})
```

#### 2. Client Components + Server Actions

Test the complete interaction flow:

```typescript
// test/integration/components/CreateReadingListModal.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateReadingListModal } from '@/components/CreateReadingListModal'

describe('CreateReadingListModal Integration', () => {
  it('submits form and calls server action', async () => {
    const user = userEvent.setup()
    render(<CreateReadingListModal />)

    await user.type(screen.getByLabelText(/title/i), 'My Reading List')
    await user.click(screen.getByLabelText(/public/i))
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(screen.getByText(/created successfully/i)).toBeInTheDocument()
    })
  })
})
```

#### 3. API Routes + Request Handling

Test API routes as integration tests:

```typescript
// test/integration/api/search-suggestions.test.ts
import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/search/cover-images/route'
import { NextRequest } from 'next/server'

describe('GET /api/search/cover-images', () => {
  it('returns cover images for valid ISBN', async () => {
    const request = new NextRequest(
      'http://localhost/api/search/cover-images?isbn=9780743273565'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.images).toBeDefined()
  })
})
```

### Mocking Strategy

**Mock at the system boundary, not internally:**

| What | Mock? | Why |
|------|-------|-----|
| External APIs (ISBNdb, Clerk) | Yes | Unreliable, rate-limited, costly |
| Prisma database | Sometimes | Use test DB when possible |
| Internal utilities | No | Test the real implementation |
| Server Actions from components | No | Integration point we want to test |

---

## Functional Testing Strategy

### Critical User Journeys

Based on codebase analysis, these flows deserve comprehensive functional testing:

#### Journey 1: Book Import Flow
**User Story**: User searches for and imports books to their library

```
1. Navigate to /import
2. Search by ISBN or title (ISBNdb API)
3. Preview book metadata
4. Import to library
5. Verify book appears in /library
```

**Why Test**: Core value proposition, external API dependency, data persistence

#### Journey 2: Reading List Creation & Curation
**User Story**: User creates and manages reading lists

```
1. Create reading list (title, description, visibility)
2. Add books from library
3. Reorder books
4. Add notes to books
5. Share publicly
```

**Why Test**: Social feature, complex relationships, authorization

#### Journey 3: Favorites Management
**User Story**: User curates favorite books with constraints

```
1. Create favorites list (all-time or by year)
2. Add up to 6 books (enforce constraint)
3. Reorder by position
4. Upload custom cover
```

**Why Test**: Complex business rules, unique constraints

#### Journey 4: Public Profile Viewing
**User Story**: Unauthenticated user views public content

```
1. View default user's profile
2. See PUBLIC reading lists only
3. Cannot see PRIVATE/UNLISTED content
```

**Why Test**: Critical for privacy, authorization edge cases

### Testing User Behavior

```typescript
// Test what users do, not how code is structured
describe('Book Import Flow', () => {
  it('allows user to search and import a book', async () => {
    const user = userEvent.setup()
    render(<ImportPage />)

    // User searches for a book
    await user.type(screen.getByRole('searchbox'), '9780743273565')
    await user.click(screen.getByRole('button', { name: /search/i }))

    // User sees book preview
    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
    })

    // User imports the book
    await user.click(screen.getByRole('button', { name: /import/i }))

    // User sees success message
    await waitFor(() => {
      expect(screen.getByText(/imported successfully/i)).toBeInTheDocument()
    })
  })
})
```

---

## End-to-End Testing Strategy

**E2E tests should be ~10% of your test suite.** Reserve them for critical paths that can't be adequately tested otherwise.

### What to Test with E2E

- Critical user journeys (happy paths)
- Cross-browser compatibility
- Authentication flows (Clerk integration)
- JavaScript-dependent UI (modals, drag-and-drop)

### What NOT to Test with E2E

- Edge cases (use integration tests)
- Error states (mock failures in integration)
- Individual component states
- Permissions (covered by integration tests)

### Recommended Tool: Playwright

**Why Playwright over Cypress:**
- Better Next.js support (multi-page context)
- Faster execution (parallel isolation)
- Built-in test artifacts
- Better TypeScript support

### E2E Test Examples

```typescript
// test/e2e/reading-lists.spec.ts
import { test, expect } from '@playwright/test'
import { LibraryPage } from './pages/library.page'

test.describe('Reading Lists', () => {
  test('create public reading list', async ({ page }) => {
    const libraryPage = new LibraryPage(page)
    await libraryPage.goto()

    // Create list
    await page.click('[data-testid="create-reading-list"]')
    await page.fill('[name="title"]', 'Summer 2025 Reads')
    await page.click('[value="PUBLIC"]')
    await page.click('[data-testid="submit"]')

    // Verify creation
    await expect(page.locator('text=Summer 2025 Reads')).toBeVisible()
  })

  test('public list visible without auth', async ({ page, context }) => {
    // Create list as authenticated user, then verify
    // unauthenticated access
  })
})
```

### Handling Flakiness

| Strategy | Implementation |
|----------|----------------|
| Wait for network idle | `await page.waitForLoadState('networkidle')` |
| Explicit waits | `await page.waitForSelector('[data-testid="book-list"]')` |
| Retry assertions | `await expect(locator).toBeVisible({ timeout: 5000 })` |
| Stable selectors | Use `data-testid` attributes |
| Disable animations | `reducedMotion: 'reduce'` in config |

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Test Organization

### Directory Structure

```
/test
├── unit/                    # Pure function tests
│   └── utils/
│       ├── validation.test.ts
│       └── permissions.test.ts
├── integration/             # Component + Server Action tests
│   ├── actions/
│   │   ├── books.test.ts
│   │   └── reading-lists.test.ts
│   ├── components/
│   │   └── CreateReadingListModal.test.tsx
│   └── api/
│       └── search-suggestions.test.ts
├── e2e/                     # Playwright tests
│   ├── specs/
│   │   ├── book-import.spec.ts
│   │   └── reading-lists.spec.ts
│   └── pages/               # Page Object Models
│       ├── library.page.ts
│       └── import.page.ts
├── helpers/                 # Test utilities
│   ├── db.ts               # Database setup/teardown
│   └── auth.ts             # Auth mocking
├── factories/               # Test data builders
│   ├── book.factory.ts
│   └── user.factory.ts
├── mocks/                   # External service mocks
│   ├── isbndb.ts
│   └── clerk.ts
└── fixtures/                # Static test data
    └── books.json
```

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Unit test files | `*.test.ts` | `validation.test.ts` |
| Integration tests | `*.test.ts` or `*.test.tsx` | `reading-lists.test.ts` |
| E2E tests | `*.spec.ts` | `book-import.spec.ts` |
| Page objects | `*.page.ts` | `library.page.ts` |
| Factories | `*.factory.ts` | `book.factory.ts` |

### Test Categorization (Labels/Tags)

```typescript
// Use describe blocks for categorization
describe('[Unit] ISBN Validation', () => { ... })
describe('[Integration] Reading List Actions', () => { ... })
describe('[E2E] Book Import Flow', () => { ... })

// Or use Vitest's test.each for tagging
it.each([
  { isbn: '0306406152', expected: true },
  { isbn: '0306406151', expected: false },
])('validates $isbn as $expected', ({ isbn, expected }) => {
  expect(isValidIsbn10(isbn)).toBe(expected)
})
```

---

## Build Integration

### Pipeline Stages

```
┌─────────────────────────────────────────────────────────────────┐
│                     PR / Pre-commit                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │TypeScript│  │  Linting │  │Unit Tests│  │ Changed Files    │ │
│  │  Check   │  │          │  │          │  │ Integration      │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│                        < 2 minutes                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CI on PR                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Full Integration Test Suite                  │   │
│  │         (Server Actions, Components, API Routes)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                        5-10 minutes                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Merge to Main                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    E2E Test Suite                         │   │
│  │              (Critical paths, Multi-browser)              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                       10-15 minutes                              │
└─────────────────────────────────────────────────────────────────┘
```

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [pull_request]

jobs:
  static:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint

  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          CLERK_SECRET_KEY: ${{ secrets.CLERK_TEST_SECRET }}
```

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]

jobs:
  e2e:
    timeout-minutes: 20
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.40.0-jammy
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --config vitest.unit.config.ts",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Test Data Management

### Factory Pattern

```typescript
// test/factories/book.factory.ts
import { faker } from '@faker-js/faker'
import type { Book } from '@prisma/client'

export function buildBook(overrides?: Partial<Book>): Omit<Book, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    isbn10: faker.string.numeric(10),
    isbn13: faker.string.numeric(13),
    title: faker.lorem.words(3),
    titleLong: faker.lorem.sentence(),
    authors: [faker.person.fullName()],
    publisher: faker.company.name(),
    synopsis: faker.lorem.paragraph(),
    pageCount: faker.number.int({ min: 100, max: 800 }),
    datePublished: faker.date.past().toISOString(),
    subjects: faker.helpers.arrayElements(['Fiction', 'Science', 'History']),
    image: faker.image.url(),
    visibility: 'PRIVATE',
    ownerId: 1,
    ...overrides,
  }
}

export async function createBook(prisma: PrismaClient, overrides?: Partial<Book>) {
  return await prisma.book.create({
    data: buildBook(overrides),
  })
}
```

### Database Helpers

```typescript
// test/helpers/db.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function resetDatabase() {
  // Delete in order respecting foreign keys
  await prisma.bookInReadingList.deleteMany()
  await prisma.readingList.deleteMany()
  await prisma.book.deleteMany()
  await prisma.user.deleteMany()
}

export async function seedTestUser(clerkId: string) {
  return await prisma.user.create({
    data: {
      clerkId,
      email: `${clerkId}@test.com`,
      name: 'Test User',
    },
  })
}
```

### Auth Mocking

```typescript
// test/mocks/clerk.ts
import { vi } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  clerkMiddleware: vi.fn((handler) => handler),
}))

export function mockClerkUser(userId: string) {
  const { auth } = require('@clerk/nextjs/server')
  auth.mockResolvedValue({ userId })
}

export function mockUnauthenticated() {
  const { auth } = require('@clerk/nextjs/server')
  auth.mockResolvedValue({ userId: null })
}
```

### External API Mocking (MSW)

```typescript
// test/mocks/isbndb.ts
import { http, HttpResponse } from 'msw'

export const isbndbHandlers = [
  http.get('https://api2.isbndb.com/book/:isbn', ({ params }) => {
    return HttpResponse.json({
      book: {
        title: 'Mock Book Title',
        authors: ['Mock Author'],
        isbn13: params.isbn,
      },
    })
  }),
]
```

---

## Anti-Patterns to Avoid

### 1. Testing Implementation Details

```typescript
// BAD: Tests internal state
it('should set loading to true', () => {
  const { result } = renderHook(() => useBookSearch())
  act(() => result.current.search('gatsby'))
  expect(result.current.loading).toBe(true)
})

// GOOD: Tests user-visible behavior
it('should show loading indicator while searching', async () => {
  render(<BookSearch />)
  await userEvent.type(screen.getByRole('searchbox'), 'gatsby')
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

### 2. Over-Mocking

```typescript
// BAD: Mocks everything including what we're testing
jest.mock('@/utils/validation')
jest.mock('@/utils/permissions')
jest.mock('@/utils/actions/books')

// GOOD: Only mock system boundaries
jest.mock('@clerk/nextjs/server')  // External auth
// Let validation, permissions, and actions run with real code
```

### 3. Snapshot Testing Overuse

```typescript
// BAD: Snapshots of entire pages
it('should match snapshot', () => {
  const { container } = render(<LibraryPage />)
  expect(container).toMatchSnapshot()  // Will break on any change
})

// GOOD: Test specific behavior
it('should display book count', () => {
  render(<LibraryPage books={mockBooks} />)
  expect(screen.getByText('3 books')).toBeInTheDocument()
})
```

### 4. Testing CSS Classes

```typescript
// BAD: Brittle CSS testing
expect(button).toHaveClass('bg-blue-500')

// GOOD: Test accessible properties
expect(button).toBeEnabled()
expect(button).toHaveAccessibleName('Submit')
```

### 5. Test Interdependence

```typescript
// BAD: Tests depend on order
describe('Reading Lists', () => {
  it('creates a list', async () => {
    createdListId = await createList()  // Shared state!
  })
  it('adds book to list', async () => {
    await addBook(createdListId)  // Depends on previous test
  })
})

// GOOD: Each test is independent
describe('Reading Lists', () => {
  it('creates a list', async () => {
    const listId = await createList()
    expect(listId).toBeDefined()
  })
  it('adds book to list', async () => {
    const listId = await createList()  // Fresh list
    await addBook(listId)
    // assertions...
  })
})
```

### 6. Testing Third-Party Code

```typescript
// BAD: Testing Prisma behavior
it('should create record in database', async () => {
  await prisma.user.create({ data: { name: 'Test' } })
  const user = await prisma.user.findFirst()
  expect(user).toBeDefined()  // This tests Prisma, not our code
})

// GOOD: Test our abstraction over Prisma
it('should create user with default settings', async () => {
  const user = await createUserWithDefaults('clerk_123')
  expect(user.settings.theme).toBe('light')
  expect(user.settings.notifications).toBe(true)
})
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Setup:**
- [ ] Install Vitest, Testing Library, MSW
- [ ] Configure `vitest.config.ts`
- [ ] Create test database setup scripts
- [ ] Create helper utilities (`test/helpers/`)

**First Tests:**
- [ ] `src/utils/validation.ts` - ISBN validation
- [ ] `src/utils/permissions.ts` - Authorization functions

### Phase 2: Server Actions (Week 3-4)

**Integration Tests for Core Actions:**
- [ ] `src/utils/actions/books.ts`
  - `importBooks()`
  - `fetchBooksPaginated()`
  - `updateBook()`
- [ ] `src/utils/actions/reading-lists.ts`
  - `createReadingList()`
  - `addBookToReadingList()`
  - `reorderBooks()`

### Phase 3: Components (Week 5-6)

**Client Component Tests:**
- [ ] `CreateReadingListModal` (expand existing)
- [ ] Import flow components
- [ ] Library filters
- [ ] Book detail modals

### Phase 4: API Routes (Week 7)

- [ ] `/api/search/cover-images`
- [ ] `/api/webhooks/clerk`
- [ ] `/api/import`

### Phase 5: E2E Tests (Week 8-9)

**Setup:**
- [ ] Install Playwright
- [ ] Configure `playwright.config.ts`
- [ ] Create Page Object Models

**Critical Path Tests:**
- [ ] Book import flow
- [ ] Reading list creation
- [ ] Public profile viewing
- [ ] Authentication states

### Phase 6: CI/CD Integration (Week 10)

- [ ] GitHub Actions for unit/integration tests
- [ ] GitHub Actions for E2E tests
- [ ] Coverage reporting
- [ ] Pre-commit hooks

---

## Maintainability Guidelines

### Page Object Model for E2E

```typescript
// test/e2e/pages/library.page.ts
import { Page, Locator } from '@playwright/test'

export class LibraryPage {
  readonly page: Page
  readonly bookList: Locator
  readonly filters: Locator

  constructor(page: Page) {
    this.page = page
    this.bookList = page.locator('[data-testid="book-list"]')
    this.filters = page.locator('[data-testid="filters"]')
  }

  async goto() {
    await this.page.goto('/library')
  }

  async filterByTitle(title: string) {
    await this.filters.locator('[name="title"]').fill(title)
    await this.filters.locator('button[type="submit"]').click()
  }

  async getBookTitles(): Promise<string[]> {
    return this.bookList.locator('[data-testid="book-title"]').allTextContents()
  }
}
```

### When to Update vs Delete Tests

**Update when:**
- Feature behavior changes intentionally
- UI elements refactored (same behavior, different DOM)
- API response format evolves

**Delete when:**
- Feature removed entirely
- Test is flaky and low value
- Test duplicates coverage
- Test tests implementation details

### Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 70,
        functions: 65,
        branches: 60,
        statements: 70,
      },
    },
  },
})
```

---

## Vitest Configuration

```typescript
// vitest.config.ts
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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.config.*',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup File

```typescript
// test/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { isbndbHandlers } from './mocks/isbndb'

const server = setupServer(...isbndbHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))
```

---

## Resources

- [Kent C. Dodds - Testing JavaScript](https://testingjavascript.com/)
- [Kent C. Dodds - The Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Testing Library Docs](https://testing-library.com/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
