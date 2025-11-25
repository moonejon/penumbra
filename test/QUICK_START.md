# Quick Start Guide - Testing Infrastructure

## Run Tests

```bash
# Watch mode (recommended for development)
npm test

# Run once (for CI)
npm run test:run

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

## Write a Unit Test

```typescript
// test/unit/utils/myutil.test.ts
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/utils/myutil'

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected')
  })
})
```

## Write a Component Test

```typescript
// src/app/components/MyComponent/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should handle clicks', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    await user.click(screen.getByRole('button', { name: /click me/i }))
    
    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

## Use Mocks

```typescript
import { mockClerkUser, mockUnauthenticated } from '@/test/mocks/clerk'

// In your test
mockClerkUser('user_123')  // Simulate authenticated user
mockUnauthenticated()      // Simulate logged out user
```

## Mock a Server Action

```typescript
import { vi } from 'vitest'
import { myServerAction } from '@/utils/actions/myactions'

vi.mock('@/utils/actions/myactions', () => ({
  myServerAction: vi.fn()
}))

// In test
const mockAction = myServerAction as ReturnType<typeof vi.fn>
mockAction.mockResolvedValue({ success: true, data: {} })
```

## Query Priorities (Testing Library)

1. `getByRole('button', { name: /submit/i })` - Best
2. `getByLabelText(/email/i)` - Forms
3. `getByPlaceholderText(/search/i)` - Inputs
4. `getByText(/hello/i)` - Content
5. `getByTestId('my-element')` - Last resort

## Common Matchers

```typescript
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toHaveTextContent('text')
expect(element).toHaveAttribute('href', '/path')
expect(element).toBeDisabled()
expect(element).toBeChecked()
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
```

## Async Testing

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Or use findBy (includes wait)
expect(await screen.findByText('Loaded')).toBeInTheDocument()
```

## Files & Directories

```
test/
├── setup.ts              - Global test config (already configured)
├── mocks/                - Mock utilities
│   ├── clerk.ts         - Auth mocks
│   └── isbndb.ts        - API mocks
├── helpers/             - Test utilities
├── factories/           - Test data builders
└── unit/                - Unit tests
    └── utils/           - Utility function tests
```

## Need Help?

- Full docs: `/docs/QA_TESTING_INFRASTRUCTURE.md`
- Testing strategy: `/docs/TESTING_STRATEGY.md`
- Test examples: Look at existing tests in `test/unit/utils/`

## Tips

- Test user behavior, not implementation
- Use `userEvent` over `fireEvent`
- Mock at system boundaries (APIs, not utils)
- Keep tests simple and focused
- If it's hard to test, the code might need refactoring
