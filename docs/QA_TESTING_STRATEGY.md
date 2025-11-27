# QA Testing Strategy: Penumbra Book Library Application

## 1. Codebase Analysis

### Tech Stack Overview
- **Framework**: Next.js 15.3.2 (App Router with React 19)
- **Language**: TypeScript 5.8.3
- **Database**: PostgreSQL with Prisma ORM 6.8.2
- **Authentication**: Clerk (@clerk/nextjs 6.19.5)
- **Storage**: Vercel Blob Storage
- **Styling**: Tailwind CSS 4.1.17
- **UI Components**: Custom components with class-variance-authority
- **Forms**: React Hook Form 7.60.0
- **State Management**: React Server Components + Client Components
- **Animation**: Motion (Framer Motion) 11.18.2

### Architecture Overview

**Application Type**: Full-stack Next.js application with server-side rendering

**Key Architectural Patterns**:
- **Server Actions**: Business logic in `/src/utils/actions/*` (books.ts, reading-lists.ts, profile.ts, filters.ts)
- **API Routes**: RESTful endpoints in `/src/app/api/*` for search suggestions, cover images, webhooks
- **Database Layer**: Prisma Client with connection pooling
- **Authentication Layer**: Clerk middleware with role-based permissions
- **Component Architecture**: React Server Components (RSC) for data fetching, Client Components for interactivity

**Directory Structure**:
```
src/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API route handlers
│   ├── components/               # Feature-specific components
│   │   ├── home/                 # Home page components + __tests__
│   │   └── reading-list-detail/  # Reading list detail components
│   ├── dashboard/                # Dashboard page + components
│   ├── library/                  # Library page + components
│   ├── reading-lists/[id]/       # Dynamic reading list pages
│   └── page.tsx                  # Home page (authenticated/public view)
├── components/                   # Shared UI components
│   ├── forms/                    # Form components (BookForm, ImageManager)
│   └── ui/                       # Base UI components (Button, Modal, Input)
├── lib/                          # Core utilities
│   ├── prisma.ts                 # Prisma client singleton
│   └── utils.ts                  # Tailwind class utilities
├── utils/                        # Business logic utilities
│   ├── actions/                  # Server actions
│   ├── functions.ts              # Generic utilities
│   ├── permissions.ts            # Authorization logic
│   └── validation.ts             # Input validation
└── shared.types.ts              # Shared TypeScript types
```

**Core Business Entities**:
- **User**: Clerk-authenticated users with profile data
- **Book**: User-owned books with metadata (ISBN, title, authors, subjects, visibility)
- **ReadingList**: User-created collections of books (standard, favorites)
- **BookInReadingList**: Junction table managing book-to-list relationships with position/notes

### Current Testing State

**Existing Tests**:
- **Single test file found**: `/src/app/components/home/__tests__/CreateReadingListModal.test.tsx`
- **Test framework**: Jest with React Testing Library (@testing-library/react, @testing-library/user-event)
- **Test coverage**: ~1% (1 component out of 99+ TypeScript files)
- **Test quality**: Excellent - comprehensive unit/integration test covering:
  - Rendering states
  - Form validation (client-side)
  - User interactions
  - Server action integration (mocked)
  - Error handling
  - Accessibility (ARIA attributes)
  - Character counts

**Test Configuration**: No Jest/Vitest config files found - likely using default Next.js Jest setup or tests were just added

**Critical Gap**: 99% of codebase untested, including:
- Server actions (business logic layer)
- API routes
- Validation utilities
- Permission/authorization logic
- Database operations
- Form components
- UI components
- Critical user flows

---

## 2. Testing Philosophy: Kent C. Dodds' Testing Trophy Applied

### The Testing Trophy for Penumbra

```
         /\
        /  \
       / E2E\     (10% - Critical user journeys)
      /______\
     /        \
    /Integration\  (50% - Component + Server Actions)
   /____________\
  /              \
 /  Unit Tests    \  (30% - Pure functions, utilities)
/__________________\
/                    \
/   Static Analysis   \  (10% - TypeScript, ESLint)
/______________________\
```

### Core Principles for This Project

1. **Write Tests That Give You Confidence**
   - Test user workflows, not implementation details
   - Focus on "Can users accomplish their goals?"
   - Avoid testing framework internals or library code

2. **Integration Over Isolation**
   - Test components with their dependencies (Server Actions, React Hook Form)
   - Mock at network boundaries (Prisma, Clerk, Vercel Blob) not internal functions
   - Test realistic scenarios users encounter

3. **Avoid Testing Implementation Details**
   - Don't test: component state variables, function names, CSS classes
   - Do test: rendered output, user interactions, API responses
   - Refactoring should not break tests

4. **Test Behavior, Not Structure**
   - Test "when user clicks 'Create List', list appears in dashboard"
   - Don't test "when createReadingList function called, state updates"

5. **Prioritize Test Value Over Coverage**
   - 80% meaningful coverage > 100% meaningless coverage
   - One integration test > five unit tests testing the same flow in isolation
   - Test critical paths first (auth, book management, reading lists)

### Application to Penumbra's Architecture

**Server Actions = Perfect Integration Test Candidates**
- Server actions encapsulate business logic, validation, and database operations
- Testing them provides high confidence without mocking internal details
- Example: `createReadingList()` can be tested with real validation logic, mocked Prisma

**React Server Components Require Different Strategy**
- RSCs run on server, can't use standard React Testing Library
- Test indirectly through integration tests or E2E tests
- Unit test the Server Actions they call instead

**Client Components = Integration Test Targets**
- Test with real form libraries (React Hook Form), not mocked
- Test with mocked Server Actions (network boundary)
- Existing `CreateReadingListModal.test.tsx` is excellent example

---

## 3. Unit Testing Strategy

### What Truly Needs Unit Testing

**1. Pure Utility Functions** (`/src/utils/validation.ts`)
- **Functions**: `validateISBN13()`, `validateISBN10()`, `validateDate()`, `isValidUrl()`, `sanitizeString()`, `validateRequired()`, `validateLength()`, `validateNumberRange()`
- **Why**: Pure functions with clear inputs/outputs, complex logic (ISBN checksums)
- **Test cases**: Valid inputs, invalid inputs, edge cases (empty, null, boundary values)
- **Example test**:
```typescript
describe('validateISBN13', () => {
  it('accepts valid ISBN-13 with correct checksum', () => {
    expect(validateISBN13('978-0-13-468599-1')).toBeNull()
  })
  
  it('rejects ISBN-13 with invalid checksum', () => {
    expect(validateISBN13('978-0-13-468599-2')).toBe('Invalid ISBN-13 checksum')
  })
  
  it('rejects ISBN-13 not starting with 978/979', () => {
    expect(validateISBN13('123-4-56-789012-3')).toBe('ISBN-13 must start with 978 or 979')
  })
})
```

**2. Utility Helper Functions** (`/src/lib/utils.ts`)
- **Functions**: `cn()` (classname merging)
- **Why**: Used throughout app, edge cases with conflicting Tailwind classes
- **Test cases**: Single class, multiple classes, conditional classes, Tailwind conflicts

**3. Complex Permission Logic** (`/src/utils/permissions.ts`)
- **Functions**: Permission calculation logic (e.g., determining canView/canEdit based on visibility)
- **Why**: Security-critical, complex conditional logic
- **Note**: Many functions here require Clerk/Prisma - these become integration tests
- **Unit test only**: Pure logic functions that calculate permissions from inputs

**4. Data Transformation Functions** (`/src/utils/functions.ts`)
- **Functions**: Any pure data transformation (if exists)
- **Why**: Predictable I/O, no side effects

### What to AVOID Unit Testing

**1. React Components** - Use integration tests instead
- Components are meant to render UI and respond to interactions
- Testing internal state/methods is implementation detail
- Exception: Pure presentational components with complex rendering logic

**2. Server Actions** - Use integration tests instead
- Server actions have dependencies (Prisma, Clerk, file system)
- Unit testing requires heavy mocking, defeats purpose
- Better tested as integration tests with real validation, mocked DB

**3. API Routes** - Use integration tests instead
- Same reasoning as server actions
- Test with supertest or Next.js route handlers with mocked dependencies

**4. Database Models/Prisma Schema** - Not testable at unit level
- Prisma handles validation
- Test via integration tests with database

**5. Hooks/Context** - Integration test with component
- Testing hooks in isolation is implementation detail
- Test through components that use them

**6. Type Definitions** - TypeScript validates these
- Don't write tests that duplicate TypeScript's job

### Recommended Tools/Frameworks

**Primary Framework**: **Vitest** (preferred over Jest for Next.js)
- Faster than Jest (10x+ for large codebases)
- Better TypeScript support
- Compatible with Jest API (easy migration)
- Native ESM support

**Alternative**: **Jest** (if already configured)
- Existing test uses Jest
- More mature ecosystem
- Better Next.js integration docs

**Assertion Library**: Built-in (Vitest/Jest)
- `expect()` API is sufficient
- Consider `@vitest/expect` or `jest-extended` for advanced matchers

**Test File Naming**:
```
src/utils/__tests__/validation.test.ts
src/utils/__tests__/validation.spec.ts
src/lib/__tests__/utils.test.ts
```

**Recommended Structure**:
```typescript
// src/utils/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest' // or 'jest'
import { validateISBN13, validateISBN10 } from '../validation'

describe('validateISBN13', () => {
  describe('valid inputs', () => {
    it('returns null for valid ISBN-13', () => {
      expect(validateISBN13('9780134685991')).toBeNull()
    })
    
    it('handles hyphens and spaces', () => {
      expect(validateISBN13('978-0-13-468599-1')).toBeNull()
    })
  })
  
  describe('invalid inputs', () => {
    it('rejects wrong length', () => {
      expect(validateISBN13('12345')).toBe('ISBN-13 must be 13 digits')
    })
    
    it('rejects invalid checksum', () => {
      expect(validateISBN13('9780134685999')).toBe('Invalid ISBN-13 checksum')
    })
  })
  
  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(validateISBN13('')).toBeNull()
    })
    
    it('handles null', () => {
      expect(validateISBN13(null as any)).toBeNull()
    })
  })
})
```

---

## 4. Integration Testing Strategy

Integration tests are the **heart of the testing strategy** for Penumbra (50% of test effort).

### Key Integration Points to Test

#### **1. Client Components + Server Actions**

**Target Components**:
- `CreateReadingListModal` ✅ (already tested - use as template)
- `EditProfileModal`
- `AddFavoriteModal`
- `EditFavoriteModal`
- `BookForm` (complex form with image upload)
- `YearFilterDropdown`
- Library components (filters, search, pagination)

**Testing Pattern** (from existing test):
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateReadingListModal } from '../CreateReadingListModal'
import { createReadingList } from '@/utils/actions/reading-lists'

// Mock Server Action at network boundary
jest.mock('@/utils/actions/reading-lists', () => ({
  createReadingList: jest.fn()
}))

describe('CreateReadingListModal', () => {
  it('submits form and calls server action', async () => {
    mockCreateReadingList.mockResolvedValue({ success: true, data: {...} })
    
    render(<CreateReadingListModal isOpen={true} onClose={...} />)
    
    // User interaction
    await userEvent.type(screen.getByLabelText('Title'), 'My List')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    
    // Verify server action called with correct data
    await waitFor(() => {
      expect(createReadingList).toHaveBeenCalledWith('My List', undefined, 'PUBLIC', 'STANDARD')
    })
  })
})
```

**What to Test**:
- Form validation (client-side)
- User interactions (typing, clicking, selecting)
- Server action calls with correct parameters
- Success/error state handling
- Loading states
- Accessibility (ARIA attributes, keyboard navigation)

**What NOT to Mock**:
- React Hook Form (use real library)
- React state management
- UI component internals

**What TO Mock**:
- Server Actions (network boundary)
- Next.js router (use `next-router-mock`)
- Clerk auth (use Clerk test utilities)

#### **2. Server Actions + Validation + Authorization**

**Target Server Actions**:
- Reading list operations: `createReadingList()`, `updateReadingList()`, `deleteReadingList()`, `addBookToReadingList()`
- Book operations: `createBook()`, `updateBook()`, `deleteBook()`
- Favorites: `setFavorite()`, `removeFavorite()`
- Profile: `updateProfile()`, `uploadProfileImage()`

**Testing Pattern**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createReadingList } from '../reading-lists'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/utils/permissions'

// Mock at infrastructure boundaries
vi.mock('@/lib/prisma', () => ({
  default: {
    readingList: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}))

vi.mock('@/utils/permissions', () => ({
  getCurrentUser: vi.fn(),
}))

describe('createReadingList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, clerkId: 'user_123', email: 'test@example.com' })
  })
  
  it('creates reading list with valid data', async () => {
    vi.mocked(prisma.readingList.findFirst).mockResolvedValue(null) // No existing favorites
    vi.mocked(prisma.readingList.create).mockResolvedValue({
      id: 1,
      title: 'Summer Reading',
      ownerId: 1,
      visibility: 'PRIVATE',
      type: 'STANDARD',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    
    const result = await createReadingList('Summer Reading')
    
    expect(result.success).toBe(true)
    expect(result.data?.title).toBe('Summer Reading')
    expect(prisma.readingList.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: 1,
        title: 'Summer Reading',
        visibility: 'PRIVATE',
      }),
    })
  })
  
  it('validates title length', async () => {
    const longTitle = 'a'.repeat(201)
    const result = await createReadingList(longTitle)
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('Title must be 200 characters or less')
    expect(prisma.readingList.create).not.toHaveBeenCalled()
  })
  
  it('enforces FAVORITES_ALL uniqueness', async () => {
    vi.mocked(prisma.readingList.findFirst).mockResolvedValue({
      id: 1,
      type: 'FAVORITES_ALL',
      ownerId: 1,
      title: 'All-Time Favorites',
    } as any)
    
    const result = await createReadingList('New Favorites', undefined, 'PRIVATE', 'FAVORITES_ALL')
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('User already has an all-time favorites list')
  })
})
```

**What to Test**:
- Business logic validation
- Authorization (user ownership checks)
- Database operations (mocked Prisma calls)
- Error handling (network errors, validation failures)
- Edge cases (empty inputs, boundary values)
- Constraint enforcement (uniqueness, max items)

**What to Mock**:
- Prisma client (mock at module level, not individual queries)
- Clerk auth (`getCurrentUser()`)
- Vercel Blob Storage (`put()`, `del()`)
- External APIs (ISBN database)

**What NOT to Mock**:
- Validation functions (use real implementations)
- Permission calculation logic
- Data transformation

#### **3. API Routes + Request Handling**

**Target API Routes**:
- `/api/library/search-suggestions` - Autocomplete search
- `/api/search/cover-images` - Cover image search
- `/api/upload/cover-image` - Image upload
- `/api/webhooks/clerk` - Clerk user sync

**Testing Pattern**:
```typescript
import { GET } from '../route'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma')
vi.mock('@/utils/permissions')

describe('/api/library/search-suggestions', () => {
  it('returns suggestions for valid query', async () => {
    vi.mocked(prisma.book.findMany).mockResolvedValue([
      { id: 1, title: 'Clean Code', authors: ['Robert Martin'], subjects: ['Programming'] },
      { id: 2, title: 'The Clean Coder', authors: ['Robert Martin'], subjects: ['Career'] },
    ] as any)
    
    const request = new NextRequest('http://localhost/api/library/search-suggestions?q=clean')
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.titles).toContain('Clean Code')
    expect(data.authors).toContain('Robert Martin')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })
  
  it('returns empty suggestions for short query', async () => {
    const request = new NextRequest('http://localhost/api/library/search-suggestions?q=a')
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.titles).toEqual([])
    expect(data.authors).toEqual([])
    expect(prisma.book.findMany).not.toHaveBeenCalled()
  })
})
```

#### **4. Database Integration Tests (Optional - if using test database)**

**Use Separate Test Database**:
- Run Prisma migrations on test DB
- Seed with test data
- Test real database queries
- Clean up after each test

**Example**:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.TEST_DATABASE_URL }
  }
})

beforeEach(async () => {
  // Clean database
  await prisma.bookInReadingList.deleteMany()
  await prisma.book.deleteMany()
  await prisma.readingList.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Reading List Database Operations', () => {
  it('creates reading list and adds books', async () => {
    const user = await prisma.user.create({
      data: { clerkId: 'user_test', email: 'test@example.com' }
    })
    
    const book = await prisma.book.create({
      data: { ownerId: user.id, title: 'Test Book', isbn13: '9780134685991', /* ... */ }
    })
    
    const list = await prisma.readingList.create({
      data: { ownerId: user.id, title: 'My List', visibility: 'PRIVATE', type: 'STANDARD' }
    })
    
    const entry = await prisma.bookInReadingList.create({
      data: { bookId: book.id, readingListId: list.id, position: 100 }
    })
    
    expect(entry.position).toBe(100)
    
    const listWithBooks = await prisma.readingList.findUnique({
      where: { id: list.id },
      include: { books: { include: { book: true } } }
    })
    
    expect(listWithBooks?.books).toHaveLength(1)
    expect(listWithBooks?.books[0].book.title).toBe('Test Book')
  })
})
```

**When to Use Database Integration Tests**:
- Complex queries with joins/filters
- Cascade delete behavior
- Unique constraint enforcement
- Transaction handling

**When to Skip**:
- Simple CRUD operations (trust Prisma)
- Operations already covered by Server Action tests
- Time/resource constraints

### Recommended Tools/Frameworks

**Component Testing**:
- **React Testing Library** (already in use)
- **@testing-library/user-event** (already in use)
- **@testing-library/jest-dom** (custom matchers)

**Server Action/API Testing**:
- **Vitest** or **Jest**
- **msw** (Mock Service Worker) - for intercepting network requests
- **next-router-mock** - for mocking Next.js router

**Mocking**:
- **Vitest vi.mock()** or **Jest jest.mock()**
- **@clerk/testing** - Clerk test utilities
- **Prismock** - Mock Prisma client (alternative to vi.mock)

**Database Testing** (optional):
- **@testcontainers/postgresql** - Spin up PostgreSQL in Docker
- **jest-prisma** - Prisma test utilities

---

## 5. Test Organization

### Directory Structure

**Option 1: Co-located Tests (Recommended)**
```
src/
├── utils/
│   ├── __tests__/
│   │   ├── validation.test.ts          # Unit tests
│   │   └── permissions.test.ts         # Unit tests
│   ├── actions/
│   │   ├── __tests__/
│   │   │   ├── reading-lists.test.ts   # Integration tests
│   │   │   ├── books.test.ts           # Integration tests
│   │   │   └── profile.test.ts         # Integration tests
│   │   ├── reading-lists.ts
│   │   └── books.ts
│   ├── validation.ts
│   └── permissions.ts
├── app/
│   ├── components/
│   │   ├── home/
│   │   │   ├── __tests__/
│   │   │   │   ├── CreateReadingListModal.test.tsx  # Integration test
│   │   │   │   ├── EditProfileModal.test.tsx        # Integration test
│   │   │   │   └── AddFavoriteModal.test.tsx        # Integration test
│   │   │   ├── CreateReadingListModal.tsx
│   │   │   └── EditProfileModal.tsx
│   ├── api/
│   │   ├── library/
│   │   │   ├── search-suggestions/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── route.test.ts    # Integration test
│   │   │   │   └── route.ts
├── components/
│   ├── forms/
│   │   ├── __tests__/
│   │   │   └── BookForm.test.tsx        # Integration test
│   │   └── BookForm.tsx
│   ├── ui/
│   │   ├── __tests__/
│   │   │   ├── button.test.tsx          # Unit test (if complex logic)
│   │   │   └── modal.test.tsx           # Unit test (if complex logic)
│   │   ├── button.tsx
│   │   └── modal.tsx
```

**Option 2: Separate Test Directory**
```
tests/
├── unit/
│   ├── utils/
│   │   ├── validation.test.ts
│   │   └── permissions.test.ts
├── integration/
│   ├── server-actions/
│   │   ├── reading-lists.test.ts
│   │   └── books.test.ts
│   ├── components/
│   │   ├── CreateReadingListModal.test.tsx
│   │   └── BookForm.test.tsx
│   ├── api/
│   │   └── search-suggestions.test.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── book-management.spec.ts
│   └── reading-lists.spec.ts
├── fixtures/
│   ├── books.ts
│   └── users.ts
└── setup/
    ├── test-db.ts
    └── global-setup.ts
```

**Recommendation**: Use **Option 1 (co-located)** because:
- Tests live near code they test
- Easier to find and maintain
- Follows Next.js conventions
- Existing test already uses this pattern

### Naming Conventions

**Test Files**:
```
ComponentName.test.tsx       # Component integration test
route.test.ts                # API route test
validation.test.ts           # Unit test
reading-lists.test.ts        # Server action integration test
```

**Alternative** (if using Vitest):
```
ComponentName.spec.tsx
validation.spec.ts
```

**Test Suites** (describe blocks):
```typescript
describe('ComponentName', () => {
  describe('rendering', () => {})
  describe('user interactions', () => {})
  describe('form validation', () => {})
  describe('error handling', () => {})
  describe('accessibility', () => {})
})

describe('functionName', () => {
  describe('valid inputs', () => {})
  describe('invalid inputs', () => {})
  describe('edge cases', () => {})
})
```

**Test Cases** (it blocks):
```typescript
// Good: Describes user behavior
it('displays error when title is empty', () => {})
it('creates reading list when form is submitted', () => {})
it('prevents duplicate favorites', () => {})

// Avoid: Implementation details
it('updates state when setTitle is called', () => {})
it('calls handleSubmit on button click', () => {})
```

### Labels/Tags for Test Categorization

**Use Vitest/Jest describe.skip, describe.only**:
```typescript
describe.skip('slow database tests', () => {})
describe.only('debugging this test', () => {})
```

**Use Custom Test Tags** (via test name prefixes):
```typescript
describe('[unit] validateISBN13', () => {})
describe('[integration] CreateReadingListModal', () => {})
describe('[e2e] Book Management Flow', () => {})
describe('[db] Reading List Database Operations', () => {})
```

**Run Specific Tests**:
```bash
# Run unit tests only
npm test -- --testPathPattern="__tests__" --testNamePattern="unit"

# Run integration tests only
npm test -- --testNamePattern="integration"

# Run component tests only
npm test -- --testPathPattern="components/__tests__"
```

### How to Make Tests Easy to Maintain

**1. Use Test Utilities/Factories**
```typescript
// tests/utils/factories.ts
export const createMockUser = (overrides = {}) => ({
  id: 1,
  clerkId: 'user_test123',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
})

export const createMockBook = (overrides = {}) => ({
  id: 1,
  ownerId: 1,
  title: 'Test Book',
  isbn13: '9780134685991',
  authors: ['Test Author'],
  ...overrides,
})
```

**2. DRY Setup with beforeEach**
```typescript
describe('Reading List Operations', () => {
  let mockUser: User
  
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = createMockUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
  })
  
  it('test 1', () => {})
  it('test 2', () => {})
})
```

**3. Custom Render Function for Components**
```typescript
// tests/utils/test-utils.tsx
import { render } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  )
}

// Usage
renderWithProviders(<CreateReadingListModal isOpen={true} />)
```

**4. Shared Test Data Fixtures**
```typescript
// tests/fixtures/books.ts
export const VALID_ISBN13 = '9780134685991'
export const INVALID_ISBN13 = '9780134685999'

export const SAMPLE_BOOKS = [
  { id: 1, title: 'Clean Code', authors: ['Robert Martin'] },
  { id: 2, title: 'Refactoring', authors: ['Martin Fowler'] },
]
```

**5. Descriptive Assertion Messages**
```typescript
expect(result.success).toBe(true)
// vs
expect(result.success, 'Expected server action to succeed').toBe(true)
```

**6. Avoid Brittle Selectors**
```typescript
// Good: Semantic queries
screen.getByRole('button', { name: 'Create List' })
screen.getByLabelText('Title')
screen.getByText('Reading list created successfully')

// Avoid: Implementation-dependent
screen.getByClassName('submit-button')
screen.getByTestId('list-title-input')
```

---

## 6. Anti-patterns to Avoid

### 1. Testing Implementation Details

**Anti-pattern**:
```typescript
// DON'T: Testing internal state
it('sets loading state when submitting', () => {
  const { result } = renderHook(() => useForm())
  act(() => result.current.handleSubmit())
  expect(result.current.isLoading).toBe(true)
})

// DON'T: Testing function calls
it('calls setTitle when input changes', () => {
  const setTitle = jest.fn()
  render(<TitleInput setTitle={setTitle} />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New' } })
  expect(setTitle).toHaveBeenCalledWith('New')
})
```

**Better Approach**:
```typescript
// DO: Test user-visible behavior
it('shows loading indicator while submitting', async () => {
  render(<CreateReadingListModal isOpen={true} />)
  await userEvent.click(screen.getByRole('button', { name: 'Create' }))
  expect(screen.getByText('Creating...')).toBeInTheDocument()
})

// DO: Test outcome
it('displays entered title in preview', async () => {
  render(<TitleInput />)
  await userEvent.type(screen.getByLabelText('Title'), 'New Title')
  expect(screen.getByText('New Title')).toBeInTheDocument()
})
```

**Why**: Implementation details change frequently. Testing them makes tests brittle and requires updates even when behavior is unchanged.

### 2. Over-Mocking

**Anti-pattern**:
```typescript
// DON'T: Mock everything, including internal functions
jest.mock('../validation')
jest.mock('../permissions')
jest.mock('../utils')
jest.mock('react-hook-form')

it('creates reading list', async () => {
  mockValidation.mockReturnValue(true)
  mockPermissions.mockReturnValue(true)
  mockUtils.mockReturnValue('formatted')
  // Test is now meaningless - not testing real behavior
})
```

**Better Approach**:
```typescript
// DO: Mock only at architectural boundaries
jest.mock('@/lib/prisma')
jest.mock('@clerk/nextjs/server')

it('creates reading list with validation', async () => {
  // Use REAL validation logic
  // Use REAL permission checks (with mocked Clerk auth)
  // Use REAL utility functions
  const result = await createReadingList('My List')
  expect(result.success).toBe(true)
})
```

**Why**: Over-mocking defeats the purpose of integration tests. You're testing mocks, not real code behavior.

**When to Mock**:
- External services (Vercel Blob, Clerk, external APIs)
- Database (Prisma)
- File system
- Network requests
- Time-dependent functions (Date.now())

**When NOT to Mock**:
- Utility functions in your codebase
- Validation logic
- Pure functions
- React hooks (use real ones)
- UI libraries (React Hook Form, Motion)

### 3. Testing Library Code

**Anti-pattern**:
```typescript
// DON'T: Test that React Hook Form validates
it('validates form fields', () => {
  const { result } = renderHook(() => useForm({ mode: 'onChange' }))
  expect(result.current.formState.isValid).toBe(false)
})

// DON'T: Test that Prisma queries work
it('finds user by email', async () => {
  const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } })
  expect(user?.email).toBe('test@example.com')
})
```

**Better Approach**:
```typescript
// DO: Test YOUR validation rules
it('shows error for invalid ISBN', async () => {
  render(<BookForm />)
  await userEvent.type(screen.getByLabelText('ISBN-13'), 'invalid')
  expect(screen.getByText('Invalid ISBN-13 checksum')).toBeInTheDocument()
})

// DO: Test YOUR business logic that uses Prisma
it('prevents duplicate books', async () => {
  vi.mocked(prisma.book.findUnique).mockResolvedValue({ id: 1, /* ... */ } as any)
  const result = await createBook({ isbn13: '9780134685991', /* ... */ })
  expect(result.error).toBe('Book with this ISBN already exists')
})
```

**Why**: You don't need to test that third-party libraries work. Trust them. Test YOUR code that uses them.

### 4. Snapshot Testing Overuse

**Anti-pattern**:
```typescript
// DON'T: Snapshot entire component tree
it('renders correctly', () => {
  const { container } = render(<ComplexComponent />)
  expect(container).toMatchSnapshot()
})
// Result: 500-line snapshot that breaks on every CSS change
```

**Better Approach**:
```typescript
// DO: Test specific rendered content
it('displays user profile information', () => {
  render(<ProfileBio user={mockUser} />)
  expect(screen.getByText(mockUser.name)).toBeInTheDocument()
  expect(screen.getByAltText('Profile picture')).toHaveAttribute('src', mockUser.profileImageUrl)
})

// DO: Snapshot small, stable structures
it('renders error message with correct styling', () => {
  render(<ErrorAlert message="Something went wrong" />)
  expect(screen.getByRole('alert')).toMatchInlineSnapshot(`
    <div role="alert" class="error">
      Something went wrong
    </div>
  `)
})
```

**Why**: Large snapshots are hard to review, break frequently, and provide false confidence. Test specific behaviors instead.

### 5. Ignoring Accessibility

**Anti-pattern**:
```typescript
// DON'T: Use non-semantic selectors
screen.getByTestId('submit-button')
screen.getByClassName('modal-title')
```

**Better Approach**:
```typescript
// DO: Use semantic queries (encourages accessible markup)
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Email address')
screen.getByRole('dialog', { name: 'Create Reading List' })

// DO: Test accessibility
it('has accessible form fields', () => {
  render(<CreateReadingListModal isOpen={true} />)
  const titleInput = screen.getByLabelText(/title/i)
  expect(titleInput).toHaveAttribute('aria-required', 'true')
  expect(titleInput).toHaveAttribute('aria-describedby')
})
```

**Why**: Using semantic queries forces you to write accessible markup. Bonus: tests are more resilient to refactoring.

### 6. Test Interdependence

**Anti-pattern**:
```typescript
// DON'T: Tests depend on each other
describe('Reading List Flow', () => {
  let listId: number
  
  it('creates list', async () => {
    const result = await createReadingList('My List')
    listId = result.data.id  // Shared state!
  })
  
  it('adds book to list', async () => {
    await addBookToReadingList(listId, 1)  // Depends on previous test
  })
})
```

**Better Approach**:
```typescript
// DO: Each test is independent
describe('Reading List Operations', () => {
  it('creates list', async () => {
    const result = await createReadingList('My List')
    expect(result.success).toBe(true)
  })
  
  it('adds book to existing list', async () => {
    const list = await setupReadingList()  // Create fresh list
    const result = await addBookToReadingList(list.id, 1)
    expect(result.success).toBe(true)
  })
})
```

**Why**: Interdependent tests are brittle. If one fails, all subsequent tests fail. Tests should be runnable in any order.

### 7. Testing Too Many Things at Once

**Anti-pattern**:
```typescript
// DON'T: One mega test that tests everything
it('handles entire reading list workflow', async () => {
  render(<App />)
  await userEvent.click(screen.getByText('Create List'))
  await userEvent.type(screen.getByLabelText('Title'), 'My List')
  await userEvent.click(screen.getByText('Create'))
  expect(screen.getByText('My List')).toBeInTheDocument()
  await userEvent.click(screen.getByText('Add Book'))
  await userEvent.type(screen.getByLabelText('Search'), 'Clean Code')
  await userEvent.click(screen.getByText('Add to List'))
  expect(screen.getByText('Book added')).toBeInTheDocument()
  // ... 50 more lines
})
```

**Better Approach**:
```typescript
// DO: Break into focused tests
describe('Reading List Creation', () => {
  it('opens modal when Create button clicked', async () => {
    render(<ReadingListsSection />)
    await userEvent.click(screen.getByRole('button', { name: 'Create List' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
  
  it('creates list with valid data', async () => {
    render(<CreateReadingListModal isOpen={true} />)
    await userEvent.type(screen.getByLabelText('Title'), 'My List')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(mockCreateReadingList).toHaveBeenCalled())
  })
})

describe('Adding Books to List', () => {
  it('searches for books', async () => {
    // Focused test
  })
  
  it('adds selected book to list', async () => {
    // Focused test
  })
})
```

**Why**: Focused tests are easier to understand, debug, and maintain. When they fail, you know exactly what broke.

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up testing infrastructure and test critical utilities

**Tasks**:
1. Install testing dependencies:
   ```bash
   npm install -D vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
   ```

2. Create Vitest config:
   ```typescript
   // vitest.config.ts
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'
   import path from 'path'
   
   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       setupFiles: ['./tests/setup.ts'],
       globals: true,
       coverage: {
         provider: 'v8',
         reporter: ['text', 'json', 'html'],
         exclude: ['node_modules/', 'tests/', '*.config.*'],
       },
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   })
   ```

3. Create test setup file:
   ```typescript
   // tests/setup.ts
   import '@testing-library/jest-dom'
   import { cleanup } from '@testing-library/react'
   import { afterEach, vi } from 'vitest'
   
   afterEach(() => {
     cleanup()
     vi.clearAllMocks()
   })
   ```

4. Write unit tests for validation utilities:
   - `src/utils/__tests__/validation.test.ts`
   - Target: 100% coverage of validation.ts

5. Write unit tests for lib utilities:
   - `src/lib/__tests__/utils.test.ts`

6. Update package.json scripts:
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest --coverage",
       "test:unit": "vitest --testPathPattern='__tests__.*\\.test\\.ts$'",
       "test:integration": "vitest --testPathPattern='__tests__.*\\.test\\.tsx$'"
     }
   }
   ```

**Success Criteria**:
- All validation functions have 100% test coverage
- Tests run successfully in CI/CD
- Team comfortable with Vitest/RTL

### Phase 2: Server Actions (Week 3-5)
**Goal**: Test business logic layer

**Tasks**:
1. Create test utilities:
   ```typescript
   // tests/utils/factories.ts
   export const createMockUser = () => ({ ... })
   export const createMockBook = () => ({ ... })
   export const createMockReadingList = () => ({ ... })
   ```

2. Write integration tests for reading-lists.ts:
   - `src/utils/actions/__tests__/reading-lists.test.ts`
   - Test: createReadingList, updateReadingList, deleteReadingList
   - Test: addBookToReadingList, removeBookFromReadingList, reorderBooksInList
   - Test: setFavorite, removeFavorite, fetchFavorites
   - Target: 80%+ coverage

3. Write integration tests for books.ts:
   - `src/utils/actions/__tests__/books.test.ts`
   - Test: createBook, updateBook, deleteBook, fetchBooks

4. Write integration tests for profile.ts:
   - `src/utils/actions/__tests__/profile.test.ts`
   - Test: updateProfile, uploadProfileImage

**Success Criteria**:
- All critical server actions tested
- Authorization logic validated
- Error handling tested

### Phase 3: Components (Week 6-8)
**Goal**: Test user-facing components

**Tasks**:
1. Test home components:
   - ✅ CreateReadingListModal.test.tsx (already done)
   - EditProfileModal.test.tsx
   - AddFavoriteModal.test.tsx
   - EditFavoriteModal.test.tsx

2. Test forms:
   - `src/components/forms/__tests__/BookForm.test.tsx`
   - `src/components/forms/__tests__/ImageManager.test.tsx`

3. Test library components:
   - `src/app/library/components/__tests__/filters.test.tsx`
   - `src/app/library/components/__tests__/intelligentSearch.test.tsx`
   - `src/app/library/components/__tests__/pagination.test.tsx`

4. Test UI components (if complex logic):
   - `src/components/ui/__tests__/modal.test.tsx`
   - `src/components/ui/__tests__/button.test.tsx`

**Success Criteria**:
- All critical user flows testable
- Forms validated properly
- Accessibility tested

### Phase 4: API Routes (Week 9)
**Goal**: Test API endpoints

**Tasks**:
1. Test search API:
   - `src/app/api/library/search-suggestions/__tests__/route.test.ts`

2. Test upload API:
   - `src/app/api/upload/cover-image/__tests__/route.test.ts`

3. Test webhooks:
   - `src/app/api/webhooks/clerk/__tests__/route.test.ts`

**Success Criteria**:
- All API routes tested
- Error handling validated
- Response formats verified

### Phase 5: E2E Tests (Week 10-12) [Optional]
**Goal**: Test critical user journeys end-to-end

**Tools**: Playwright or Cypress

**Critical Flows**:
1. Authentication flow (sign up, sign in, sign out)
2. Book management (add book, edit book, delete book)
3. Reading list management (create, edit, delete, add books)
4. Library search and filtering
5. Profile management

**E2E Test Example**:
```typescript
// tests/e2e/reading-lists.spec.ts
import { test, expect } from '@playwright/test'

test('user can create and manage reading list', async ({ page }) => {
  // Sign in
  await page.goto('http://localhost:3000')
  await page.click('text=Sign In')
  // ... Clerk authentication flow
  
  // Create reading list
  await page.click('button:has-text("Create List")')
  await page.fill('input[name="title"]', 'Summer Reading 2024')
  await page.fill('textarea[name="description"]', 'Books to read this summer')
  await page.click('button:has-text("Create")')
  
  // Verify list appears
  await expect(page.locator('text=Summer Reading 2024')).toBeVisible()
  
  // Add book to list
  await page.click('text=Summer Reading 2024')
  await page.click('button:has-text("Add Book")')
  // ... select book from library
  
  // Verify book added
  await expect(page.locator('text=Clean Code')).toBeVisible()
})
```

### Phase 6: CI/CD Integration (Week 13)
**Goal**: Automate testing in deployment pipeline

**Tasks**:
1. Configure GitHub Actions:
   ```yaml
   # .github/workflows/test.yml
   name: Tests
   
   on: [push, pull_request]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '20'
             cache: 'npm'
         
         - run: npm ci
         - run: npm run test:coverage
         
         - name: Upload coverage to Codecov
           uses: codecov/codecov-action@v3
   ```

2. Configure test database for integration tests (optional)

3. Set up pre-commit hooks:
   ```bash
   npm install -D husky lint-staged
   npx husky install
   npx husky add .husky/pre-commit "npm test"
   ```

4. Configure quality gates:
   - Minimum 70% code coverage for new files
   - All tests must pass before merge
   - No skipped tests in main branch

**Success Criteria**:
- Tests run automatically on every PR
- Coverage reports generated
- Failed tests block deployment

---

## 8. Testing Metrics & Quality Gates

### Key Metrics to Track

**1. Code Coverage**
- **Target**: 70-80% overall (don't obsess over 100%)
- **Critical areas**: 90%+ for server actions, validation, permissions
- **Less critical**: 50%+ for UI components

**Track by type**:
```bash
npm run test:coverage
```

**Coverage Goals**:
```
utils/validation.ts         -> 100%
utils/permissions.ts         -> 90%+
utils/actions/*.ts           -> 80%+
components/forms/*.tsx       -> 70%+
components/ui/*.tsx          -> 50%+
app/api/**/*.ts              -> 70%+
```

**2. Test Distribution**
- Unit tests: 30%
- Integration tests: 50%
- E2E tests: 10%
- Static analysis: 10%

**3. Test Performance**
- Unit tests: < 1 second per test
- Integration tests: < 5 seconds per test
- E2E tests: < 30 seconds per test
- Full suite: < 5 minutes

**4. Test Quality Metrics**
- Flaky test rate: < 1%
- Test maintainability: No skipped tests in main branch
- Mutation testing score: > 70% (if using Stryker)

### Quality Gates for Pull Requests

**Requirements before merge**:
1. All tests pass (zero failures)
2. No skipped tests (use .only/.skip only for debugging)
3. Code coverage does not decrease
4. New code has 70%+ coverage
5. No ESLint/TypeScript errors
6. Accessibility tests pass (using jest-axe)

**Example PR Check Configuration**:
```yaml
# .github/workflows/pr-checks.yml
name: PR Quality Checks

on: pull_request

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - name: Check coverage
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 70" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 70%"
            exit 1
          fi
```

---

## 9. Recommended Next Steps

### Immediate Actions (This Sprint)

1. **Install Vitest and dependencies** (1 hour)
   ```bash
   npm install -D vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
   ```

2. **Create vitest.config.ts** (30 min)

3. **Write tests for validation.ts** (2-3 hours)
   - Start with `validateISBN13()` and `validateISBN10()`
   - Expand to other validation functions
   - Target: 100% coverage

4. **Document testing patterns** (1 hour)
   - Add examples to README
   - Create CONTRIBUTING.md with testing guidelines

### Short-term (Next 2 Sprints)

1. **Test critical server actions** (1 week)
   - reading-lists.ts operations
   - books.ts operations
   - Focus on happy paths and error cases

2. **Test modal components** (1 week)
   - Use existing CreateReadingListModal.test.tsx as template
   - Test EditProfileModal, AddFavoriteModal, EditFavoriteModal

3. **Set up CI/CD integration** (2 days)
   - GitHub Actions workflow
   - Coverage reporting

### Long-term (Next Quarter)

1. **Achieve 70% code coverage** (ongoing)
   - Prioritize untested business logic
   - Add tests for new features

2. **Add E2E tests for critical flows** (2 weeks)
   - Set up Playwright
   - Test authentication, book management, reading lists

3. **Implement mutation testing** (1 week)
   - Install Stryker.js
   - Identify weak tests that don't catch bugs

4. **Developer training** (ongoing)
   - Pair programming on test-writing
   - Code review focus on test quality
   - Brown bag sessions on testing best practices

---

## 10. Resources & References

### Kent C. Dodds Resources
- **Testing Trophy**: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- **Common Testing Mistakes**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **Static vs Unit vs Integration vs E2E Testing**: https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests
- **Testing Implementation Details**: https://kentcdodds.com/blog/testing-implementation-details

### Testing Library
- **React Testing Library Docs**: https://testing-library.com/docs/react-testing-library/intro/
- **Queries Cheatsheet**: https://testing-library.com/docs/queries/about
- **User Event**: https://testing-library.com/docs/user-event/intro

### Vitest
- **Vitest Guide**: https://vitest.dev/guide/
- **API Reference**: https://vitest.dev/api/
- **Mocking Guide**: https://vitest.dev/guide/mocking

### Next.js Testing
- **Next.js Testing Guide**: https://nextjs.org/docs/app/building-your-application/testing/vitest
- **Testing Server Actions**: https://nextjs.org/docs/app/building-your-application/testing/vitest#testing-server-actions
- **Testing API Routes**: https://nextjs.org/docs/app/building-your-application/testing/vitest#testing-api-routes

### Prisma Testing
- **Prisma Testing Guide**: https://www.prisma.io/docs/guides/testing/unit-testing
- **Prismock (Mocking Library)**: https://github.com/morintd/prismock

### Accessibility Testing
- **jest-axe**: https://github.com/nickcolley/jest-axe
- **Testing Accessibility**: https://testing-library.com/docs/guide-accessibility

### E2E Testing
- **Playwright**: https://playwright.dev/
- **Cypress**: https://www.cypress.io/

---

## Conclusion

This testing strategy prioritizes **integration tests** following Kent C. Dodds' Testing Trophy approach. The focus is on:

1. **High-value tests**: Testing user behavior and critical business logic
2. **Maintainable tests**: Avoiding brittle tests tied to implementation details
3. **Confidence over coverage**: Meaningful tests that catch real bugs
4. **Pragmatic approach**: 70-80% coverage goal, not 100%

**Key Success Metrics**:
- 70%+ overall code coverage within 3 months
- All critical user flows tested (auth, books, reading lists)
- Tests run in < 5 minutes
- Zero flaky tests in CI/CD

**Philosophy Summary**:
- **More integration tests, fewer unit tests**
- **Mock at architectural boundaries (Prisma, Clerk), not internal code**
- **Test user behavior, not implementation details**
- **Make tests resilient to refactoring**

The existing `CreateReadingListModal.test.tsx` serves as an excellent template for component integration tests. Replicate its patterns across the codebase for consistent, high-quality test coverage.
