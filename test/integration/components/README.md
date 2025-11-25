# Component Integration Tests

This directory contains component integration tests that test component + server action interactions.

## Test Files

### 1. TextSearch.test.tsx
Tests the library title search component (`src/app/library/components/textSearch.tsx`)

**Coverage:**
- ✅ Input rendering and accessibility
- ✅ User input handling
- ✅ Debounced search (500ms)
- ✅ URL parameter updates
- ✅ Preserving existing filters
- ✅ Page parameter reset on search
- ✅ Special character and unicode handling
- ✅ Performance optimization (single navigation after debounce)
- ✅ Keyboard navigation

**Results:** 20/21 tests passing (95% pass rate)
- 1 minor failure: Component doesn't have visible label (uses id only)

### 2. AutoCompleteSearch.test.tsx
Tests the library author/subject filter component (`src/app/library/components/autocompleteSearch.tsx`)

**Coverage:**
- ✅ Dropdown opening/closing
- ✅ Option filtering
- ✅ Multi-select functionality
- ✅ Selected pill display
- ✅ Remove button functionality
- ✅ URL parameter updates
- ✅ Debounced updates (500ms)
- ✅ Keyboard navigation (Escape to close)
- ✅ Click outside to close
- ✅ Empty state handling
- ✅ Dropdown mode (inDropdown prop)

**Results:** Memory issues during test run (complex component with many event handlers)
- Recommendation: Simplify test suite or increase Node memory limit
- Core functionality tests pass individually

### 3. ISBNSearch.test.tsx
Tests the ISBN search component (`src/app/import/components/search.tsx`)

**Coverage:**
- ✅ Form rendering
- ✅ ISBN validation (10 and 13 digits)
- ✅ Input sanitization (hyphens, spaces)
- ✅ Error handling (not found, network, timeout, rate limit)
- ✅ Loading states
- ✅ Success callbacks
- ✅ Duplicate checking
- ✅ Incomplete data detection
- ✅ Form clearing after success
- ✅ Multiple submission prevention
- ✅ Timeout handling (10 seconds)

**Results:** 24/31 tests passing (77% pass rate)
- 7 failures: Error display expectations not matching implementation
  - Component shows errors in Alert component, not on input
  - Tests expect immediate error display, but errors show after API call

## Running Tests

Run all component tests:
```bash
npm test -- test/integration/components/
```

Run specific test file:
```bash
npm test -- test/integration/components/TextSearch.test.tsx
npm test -- test/integration/components/AutoCompleteSearch.test.tsx
npm test -- test/integration/components/ISBNSearch.test.tsx
```

Run in watch mode:
```bash
npm test -- --watch test/integration/components/
```

## Test Patterns Used

### 1. User Event Setup
```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
await user.type(input, 'text')
await user.click(button)
```

### 2. Async Testing with waitFor
```typescript
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled()
}, { timeout: 600 })
```

### 3. Mocking Server Actions
```typescript
vi.mock('@/utils/actions/books', () => ({
  checkRecordExists: vi.fn()
}))

mockCheckRecordExists.mockResolvedValue(true)
```

### 4. Mocking Next.js Navigation
```typescript
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  useSearchParams: vi.fn(() => new URLSearchParams())
}))
```

## Key Testing Principles

1. **Test User Behavior:** Query by accessible roles, labels, and placeholders
2. **Realistic Interactions:** Use userEvent for realistic typing and clicking
3. **Async Handling:** Use waitFor for debounced and async operations
4. **Mock External Dependencies:** Mock server actions and navigation
5. **Test Edge Cases:** Special characters, unicode, empty states, errors

## Known Issues

1. **AutoCompleteSearch Memory**: Complex component causes memory issues when running full test suite
   - Solution: Run tests individually or increase Node memory
   
2. **Error Display Timing**: Some tests expect synchronous error display, but component uses async validation
   - Solution: Update tests to match actual error display behavior

3. **Missing Labels**: Some components use IDs without visible labels
   - Solution: Update tests to use getById instead of getByLabelText

## Future Improvements

1. Add tests for Preview component (book import preview)
2. Add tests for Filters component (combined filter UI)
3. Add tests for Library list/grid views
4. Add integration tests with real database (using test helpers)
5. Add tests for book edit modals
6. Increase test coverage for error recovery flows
