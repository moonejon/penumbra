# Error Handling Implementation Roadmap
## Import Page - Penumbra Library Management

**Quick-start guide for developers implementing the error handling specification**

---

## Overview

This roadmap breaks down the error handling implementation into manageable tasks with clear priorities, estimated effort, and dependencies.

---

## Phase Overview

```
Phase 1: Foundation (8 hours)
  └─→ Reusable error components
      └─→ Error utility functions

Phase 2: Search Enhancement (4 hours)
  └─→ Validation & error handling
      └─→ Retry mechanisms

Phase 3: Preview Enhancement (3 hours)
  └─→ Error state display
      └─→ Recovery actions

Phase 4: Queue Enhancement (5 hours)
  └─→ Import error handling
      └─→ Partial import support

Phase 5: Polish & Accessibility (6 hours)
  └─→ Focus management
      └─→ Screen reader testing
      └─→ Final QA

Total Estimated Time: 26 hours (~3-4 days)
```

---

## Phase 1: Foundation Components

**Goal**: Create reusable error components and utilities

### Task 1.1: Error Utility Functions (2 hours)

**File**: `/src/utils/error-handling.ts`

**Create**:
```typescript
export type ErrorType =
  | 'validation'
  | 'network'
  | 'notfound'
  | 'api'
  | 'database'
  | 'timeout';

export interface ErrorState {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
}

export function getErrorTitle(type: ErrorType): string;
export function getSeverity(type: ErrorType): 'critical' | 'warning' | 'info';
export function isRetryable(type: ErrorType): boolean;
export function parseApiError(error: unknown): ErrorState;
```

**Testing**:
- [ ] Unit tests for parseApiError with different error types
- [ ] Test severity mapping
- [ ] Test error title generation

**Dependencies**: None

---

### Task 1.2: ErrorAlert Component (3 hours)

**File**: `/src/components/ui/error-alert.tsx`

**Create**:
```typescript
interface ErrorAlertProps {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function ErrorAlert(props: ErrorAlertProps);
```

**Features**:
- Collapsible technical details
- Conditional action buttons
- Icon mapping for severity
- Color scheme mapping
- Proper ARIA attributes

**Testing**:
- [ ] Visual test for all severity levels
- [ ] Test collapsible details
- [ ] Test with/without retry button
- [ ] Test with/without dismiss button
- [ ] Test custom actions

**Dependencies**: None

---

### Task 1.3: ToastNotification Component (2 hours)

**File**: `/src/components/ui/toast-notification.tsx`

**Create**:
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number; // 0 for persistent
  onDismiss?: () => void;
  show: boolean;
}

export function ToastNotification(props: ToastProps);
```

**Features**:
- Auto-dismiss with configurable duration
- Slide up + fade in animation
- Manual dismiss button
- Bottom center positioning
- Proper ARIA live region

**Testing**:
- [ ] Test auto-dismiss timing
- [ ] Test manual dismiss
- [ ] Test persistent toast (duration=0)
- [ ] Test animation
- [ ] Test screen reader announcement

**Dependencies**: None

---

### Task 1.4: InlineValidation Component (1 hour)

**File**: `/src/components/ui/inline-validation.tsx`

**Create**:
```typescript
interface InlineValidationProps {
  message: string;
  type: 'error' | 'success' | 'hint';
  show: boolean;
  className?: string;
}

export function InlineValidation(props: InlineValidationProps);
```

**Features**:
- Conditional rendering
- Icon mapping
- Fade in animation
- Proper spacing

**Testing**:
- [ ] Test show/hide transition
- [ ] Test all types (error, success, hint)
- [ ] Test custom className

**Dependencies**: None

---

## Phase 2: Search Component Enhancement

**Goal**: Add comprehensive error handling to search flow

### Task 2.1: ISBN Validation (1 hour)

**File**: `/src/app/import/components/search.tsx`

**Add**:
```typescript
// Validation function
const validateISBN = (isbn: string): boolean => {
  const cleaned = isbn.replace(/[-\s]/g, '');
  return /^[0-9]{10,13}$/.test(cleaned);
};

// Validation state
const [validationError, setValidationError] = useState<string | null>(null);

// Real-time validation (debounced)
useEffect(() => {
  const timer = setTimeout(() => {
    if (isbn && !validateISBN(isbn)) {
      setValidationError('Please enter a valid 10 or 13-digit ISBN number');
    } else {
      setValidationError(null);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [isbn]);
```

**Update JSX**:
```tsx
<input
  {...field}
  aria-invalid={!!validationError}
  aria-describedby={validationError ? "isbn-error" : undefined}
  className={cn(
    'original-classes',
    validationError && 'border-amber-500'
  )}
/>
{validationError && (
  <InlineValidation
    type="error"
    message={validationError}
    show={true}
  />
)}
```

**Testing**:
- [ ] Test with valid ISBN-10
- [ ] Test with valid ISBN-13
- [ ] Test with invalid format
- [ ] Test with letters/special chars
- [ ] Test debounce behavior

**Dependencies**: Task 1.4 (InlineValidation)

---

### Task 2.2: Search Error Handling (2 hours)

**File**: `/src/app/import/components/search.tsx`

**Add**:
```typescript
const [searchError, setSearchError] = useState<ErrorState | null>(null);

const onSubmit: SubmitHandler<Inputs> = async (data) => {
  setLoading(true);
  setSearchError(null);

  // Validate format first
  if (!validateISBN(data.isbn)) {
    setSearchError({
      type: 'validation',
      message: 'Please enter a valid 10 or 13-digit ISBN number',
    });
    setLoading(false);
    return;
  }

  try {
    const value = await fetchMetadata(data.isbn);
    const { book } = value;

    if (!book) {
      setSearchError({
        type: 'notfound',
        message: `We couldn't find a book with ISBN: ${data.isbn}`,
      });
      setLoading(false);
      return;
    }

    // ... existing book processing ...

  } catch (error) {
    const parsedError = parseApiError(error);
    setSearchError(parsedError);
  } finally {
    setLoading(false);
  }
};
```

**Pass to Preview**:
```tsx
<Preview
  book={bookData}
  setBookData={setBookData}
  loading={loading}
  error={searchError}  // NEW
  onRetry={() => handleSubmit(onSubmit)()}  // NEW
  importQueue={importQueue}
  setImportQueue={setImportQueue}
/>
```

**Testing**:
- [ ] Test network error
- [ ] Test 404 not found
- [ ] Test 401/403 auth error
- [ ] Test timeout
- [ ] Test successful search after error

**Dependencies**: Task 1.1 (error-handling utils)

---

### Task 2.3: Retry Mechanism (1 hour)

**File**: `/src/app/import/components/search.tsx`

**Add**:
```typescript
const [retryCount, setRetryCount] = useState(0);
const lastSearchRef = useRef<string>('');

const handleRetry = () => {
  setRetryCount(prev => prev + 1);

  if (lastSearchRef.current) {
    // Re-submit with last ISBN
    setValue('isbn', lastSearchRef.current);
    handleSubmit(onSubmit)();
  }
};

const onSubmit: SubmitHandler<Inputs> = async (data) => {
  lastSearchRef.current = data.isbn;
  // ... existing submit logic ...
};
```

**Testing**:
- [ ] Test retry preserves ISBN value
- [ ] Test retry count increments
- [ ] Test retry after network error
- [ ] Test retry after not found

**Dependencies**: Task 2.2

---

## Phase 3: Preview Component Enhancement

**Goal**: Display errors in preview panel with recovery options

### Task 3.1: Add Error Props (1 hour)

**File**: `/src/app/import/components/preview.tsx`

**Update Interface**:
```typescript
interface BookProps {
  book: BookImportDataType;
  setBookData: Dispatch<SetStateAction<BookImportDataType>>;
  loading: boolean;
  error: ErrorState | null;  // NEW
  onRetry?: () => void;       // NEW
  importQueue: BookImportDataType[];
  setImportQueue: Dispatch<SetStateAction<BookImportDataType[]>>;
}
```

**Add Display States**:
```typescript
const showEmpty = book === initialBookImportData && !loading && !error;
const showLoading = loading && !error;
const showError = !!error;
const showContent = book !== initialBookImportData && !loading && !error;
```

**Testing**:
- [ ] Test state transitions
- [ ] Test props are passed correctly

**Dependencies**: None

---

### Task 3.2: Render Error States (2 hours)

**File**: `/src/app/import/components/preview.tsx`

**Add JSX**:
```tsx
{/* Error State */}
{showError && error && (
  <ErrorAlert
    severity={getSeverity(error.type)}
    title={getErrorTitle(error.type)}
    message={error.message}
    details={error.details}
    onRetry={isRetryable(error.type) ? onRetry : undefined}
    onDismiss={() => {
      // Clear error in parent
      setBookData(initialBookImportData);
    }}
  />
)}
```

**Add Error-Specific Content**:
```tsx
// For 404 Not Found
{error?.type === 'notfound' && (
  <div className="mt-4 space-y-2">
    <p className="text-sm text-blue-200">Try these steps:</p>
    <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-blue-300/80">
      <li>Check if the ISBN is correct</li>
      <li>Use the ISBN from the book's copyright page</li>
      <li>Try the other ISBN if both are listed (ISBN-10/ISBN-13)</li>
    </ul>
  </div>
)}
```

**Testing**:
- [ ] Test network error display
- [ ] Test 404 display with tips
- [ ] Test API error display
- [ ] Test retry button functionality
- [ ] Test dismiss functionality

**Dependencies**: Task 1.1, Task 1.2

---

## Phase 4: Queue Component Enhancement

**Goal**: Robust import error handling with partial success support

### Task 4.1: Enhanced Error State (1 hour)

**File**: `/src/app/import/components/queue.tsx`

**Update State**:
```typescript
interface ImportError {
  type: 'import' | 'network' | 'partial';
  message: string;
  failedBooks?: Array<{
    index: number;
    title: string;
    reason: string;
  }>;
}

const [error, setError] = useState<ImportError | null>(null);
const [retryCount, setRetryCount] = useState(0);
```

**Testing**:
- [ ] Test error state updates
- [ ] Test failed books tracking

**Dependencies**: None

---

### Task 4.2: Import Error Handling (2 hours)

**File**: `/src/app/import/components/queue.tsx`

**Update handleSubmit**:
```typescript
const handleSubmit = async () => {
  setIsImporting(true);
  setError(null);

  try {
    const cleanedBooks = books.map((book) => {
      const { isIncomplete, isDuplicate, ...bookData } = book;
      return bookData;
    });

    const result = await importBooks(cleanedBooks);

    if (result?.success) {
      setBooks([]);
      setShowSuccess(true);
      setRetryCount(0); // Reset on success
      setTimeout(() => setShowSuccess(false), 4000);
    } else {
      // Check if partial success
      if (result?.count && result.count > 0 && result.count < books.length) {
        setError({
          type: 'partial',
          message: `${result.count} of ${books.length} books were added successfully`,
          failedBooks: identifyFailedBooks(books, result),
        });
        // Remove successful books from queue
        setBooks(prev => removeSuccessfulBooks(prev, result));
      } else {
        setError({
          type: 'import',
          message: retryCount >= 2
            ? "We've tried several times but can't complete the import."
            : "We couldn't add these books to your library. Try again in a moment.",
        });
      }
    }
  } catch (err) {
    const isNetworkError = err instanceof TypeError && err.message.includes('fetch');

    setError({
      type: isNetworkError ? 'network' : 'import',
      message: isNetworkError
        ? 'Connection lost during import. Check your library to see what was saved.'
        : 'An unexpected error occurred. Your queue has been preserved.',
    });

    console.error('Import error:', err);
  } finally {
    setIsImporting(false);
  }
};

const handleRetry = () => {
  setRetryCount(prev => prev + 1);
  handleSubmit();
};
```

**Testing**:
- [ ] Test complete import failure
- [ ] Test network error during import
- [ ] Test retry functionality
- [ ] Test retry count escalation
- [ ] Test queue preservation

**Dependencies**: None

---

### Task 4.3: Partial Import Support (2 hours)

**File**: `/src/app/import/components/queue.tsx`

**Add Helper Functions**:
```typescript
function identifyFailedBooks(
  originalBooks: BookImportDataType[],
  result: ImportResult
): Array<{ index: number; title: string; reason: string }> {
  // Logic to identify which books failed
  // This requires backend to return detailed error info
  return [];
}

function removeSuccessfulBooks(
  books: BookImportDataType[],
  result: ImportResult
): BookImportDataType[] {
  // Remove successfully imported books from queue
  return books; // Implementation depends on result structure
}
```

**Update Item Component**:
```typescript
// Add error prop to Item component
interface ItemProps {
  title: string;
  authors: string[];
  isIncomplete: boolean;
  itemKey: number;
  handleDelete: (key: number) => void;
  error?: string;  // NEW
}

// In Item JSX, add error indicator
{error && (
  <div className="text-red-400 text-xs mt-1">
    ❌ {error}
  </div>
)}
```

**Render Partial Error**:
```tsx
{error?.type === 'partial' && error.failedBooks && (
  <ErrorAlert
    severity="warning"
    title="Partial Import"
    message={error.message}
    actions={
      <>
        <Button variant="outline" size="sm" onClick={handleRetry}>
          Retry Failed Books
        </Button>
        <Button variant="ghost" size="sm" onClick={handleRemoveFailed}>
          Remove Failed from Queue
        </Button>
      </>
    }
  >
    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
      {error.failedBooks.map((book) => (
        <li key={book.index}>
          {book.title} - {book.reason}
        </li>
      ))}
    </ul>
  </ErrorAlert>
)}
```

**Testing**:
- [ ] Test partial import display
- [ ] Test failed book indicators
- [ ] Test retry failed books only
- [ ] Test remove failed books
- [ ] Test successful books removed from queue

**Dependencies**: Task 1.2 (ErrorAlert)

**Note**: This task may require backend changes to return detailed import results.

---

## Phase 5: Polish & Accessibility

**Goal**: Ensure excellent accessibility and user experience

### Task 5.1: Focus Management (2 hours)

**Files**: All components with errors

**Implement**:
```typescript
// In ErrorAlert component
const closeButtonRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  if (show) {
    closeButtonRef.current?.focus();
  }
}, [show]);

// In Search component
const retryButtonRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  if (searchError && isRetryable(searchError.type)) {
    retryButtonRef.current?.focus();
  }
}, [searchError]);
```

**Add Keyboard Support**:
```typescript
// ESC to dismiss non-critical errors
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && error && error.type !== 'api') {
      handleDismissError();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [error]);
```

**Testing**:
- [ ] Tab through all interactive elements
- [ ] Test focus when error appears
- [ ] Test ESC to dismiss
- [ ] Test focus return after dismiss
- [ ] Test keyboard activation of all buttons

**Dependencies**: All previous tasks

---

### Task 5.2: Screen Reader Support (2 hours)

**Files**: All error components

**Add ARIA Attributes**:
```tsx
// ErrorAlert
<Alert
  role="alert"
  aria-live={severity === 'critical' ? 'assertive' : 'polite'}
  aria-atomic="true"
  className="..."
>

// ToastNotification
<div
  role="status"
  aria-live={type === 'error' ? 'assertive' : 'polite'}
  aria-atomic="true"
>

// Form validation
<input
  aria-invalid={!!error}
  aria-describedby={error ? "error-id" : undefined}
  aria-required="true"
/>
<div id="error-id" role="alert">
  {error}
</div>
```

**Add Screen Reader Only Text**:
```tsx
<button aria-label="Retry search for this ISBN">
  <RefreshCw className="h-4 w-4" />
  <span className="sr-only">Retry</span>
</button>
```

**Testing**:
- [ ] Test with VoiceOver (macOS)
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Verify announcements are clear
- [ ] Verify all interactive elements labeled

**Dependencies**: All previous tasks

---

### Task 5.3: Visual Polish (1 hour)

**Files**: All components

**Verify**:
- [ ] All colors meet WCAG AA contrast (4.5:1 text, 3:1 UI)
- [ ] Animations respect prefers-reduced-motion
- [ ] Focus indicators are visible (2px ring)
- [ ] Spacing is consistent with design system
- [ ] Mobile responsive layouts work
- [ ] Icons are appropriately sized

**Add Reduced Motion Support**:
```tsx
<div className={cn(
  'transition-all duration-300',
  'motion-reduce:transition-none',
  // other classes
)}>
```

**Testing**:
- [ ] Test on mobile devices
- [ ] Test with reduced motion enabled
- [ ] Test in different browsers
- [ ] Verify color contrast in tools

**Dependencies**: All previous tasks

---

### Task 5.4: Error Simulator (Development Tool) (1 hour)

**File**: `/src/app/import/components/error-simulator.tsx`

**Create**:
```typescript
'use client';

export function ErrorSimulator({
  onSimulate
}: {
  onSimulate: (type: string) => void
}) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700 z-50">
      <p className="text-xs text-zinc-400 mb-2">Error Simulator</p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onSimulate('network')}
          className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          Network Error
        </button>
        <button
          onClick={() => onSimulate('notfound')}
          className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          404 Not Found
        </button>
        <button
          onClick={() => onSimulate('timeout')}
          className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          Timeout
        </button>
        <button
          onClick={() => onSimulate('import-fail')}
          className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          Import Failure
        </button>
        <button
          onClick={() => onSimulate('partial')}
          className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          Partial Import
        </button>
      </div>
    </div>
  );
}
```

**Usage in Import Component**:
```tsx
const handleSimulateError = (type: string) => {
  switch (type) {
    case 'network':
      setBookData(initialBookImportData);
      setError({
        type: 'network',
        message: 'Simulated network error',
      });
      break;
    // ... other cases
  }
};

return (
  <div>
    {/* existing content */}
    <ErrorSimulator onSimulate={handleSimulateError} />
  </div>
);
```

**Testing**:
- [ ] Test all error simulations
- [ ] Verify only shows in development
- [ ] Test each error type renders correctly

**Dependencies**: All previous tasks

---

## Final QA Checklist

### Functional Testing
- [ ] All error types render correctly
- [ ] Retry mechanisms work
- [ ] Toast notifications auto-dismiss
- [ ] Validation provides real-time feedback
- [ ] Errors clear when appropriate
- [ ] Queue preserves on error
- [ ] Partial imports handled correctly

### Accessibility Testing
- [ ] Keyboard navigation works throughout
- [ ] Screen readers announce errors
- [ ] Focus management is logical
- [ ] Color contrast meets WCAG AA
- [ ] All interactive elements have labels
- [ ] ARIA attributes are correct

### Visual Testing
- [ ] Desktop layout looks good
- [ ] Mobile layout is responsive
- [ ] Tablet layout works
- [ ] Dark theme colors are correct
- [ ] Animations are smooth
- [ ] Icons are properly sized
- [ ] Spacing is consistent

### Edge Case Testing
- [ ] Multiple errors don't overlap
- [ ] Rapid searches don't break state
- [ ] Offline detection works
- [ ] Empty queue blocks import
- [ ] Error during loading transitions smoothly
- [ ] Technical details collapsible works

### Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Migration Notes

### Breaking Changes
None - this is purely additive

### Backward Compatibility
- Existing error handling in Queue component will be replaced
- Current incomplete/duplicate warnings will be enhanced (not removed)
- No API changes required (but recommended for partial import support)

### Optional Enhancements
1. **Backend**: Return detailed import results for partial success tracking
2. **Analytics**: Log error occurrences for monitoring
3. **Offline Support**: Add service worker for offline detection
4. **Error Recovery**: Persist queue in localStorage to survive crashes

---

## Dependencies & Prerequisites

### Required Packages
All dependencies already installed:
- `lucide-react` (icons)
- `class-variance-authority` (component variants)
- `tailwindcss` (styling)
- `@/lib/utils` (cn function)

### No New Dependencies Required

### Environment Requirements
- Node.js 18+
- Next.js 14+
- TypeScript 5+
- React 18+

---

## Estimated Timeline

### Sprint Planning (3-4 day sprint)

**Day 1**: Foundation (8 hours)
- Morning: Error utilities + ErrorAlert component
- Afternoon: Toast + InlineValidation components

**Day 2**: Core Features (7 hours)
- Morning: Search component enhancement
- Afternoon: Preview component enhancement

**Day 3**: Import Handling (5 hours)
- Morning: Queue error handling
- Afternoon: Partial import support

**Day 4**: Polish (6 hours)
- Morning: Accessibility implementation
- Afternoon: Testing + QA + Error simulator

### Parallel Work Opportunities
- Tasks 1.1-1.4 can be done simultaneously by different developers
- Tasks 2.1 and 3.1 can be done in parallel
- Testing can start as soon as components are complete

---

## Testing Strategy

### Unit Tests
```bash
# Test error utilities
npm test src/utils/error-handling.test.ts

# Test components
npm test src/components/ui/error-alert.test.tsx
npm test src/components/ui/toast-notification.test.tsx
```

### Integration Tests
```bash
# Test search flow
npm test src/app/import/components/search.test.tsx

# Test import flow
npm test src/app/import/components/queue.test.tsx
```

### E2E Tests (Playwright/Cypress)
```typescript
describe('Error Handling', () => {
  it('shows validation error for invalid ISBN', () => {
    // Test implementation
  });

  it('retries search on network error', () => {
    // Test implementation
  });

  it('handles partial import correctly', () => {
    // Test implementation
  });
});
```

### Accessibility Tests
```bash
# Run axe-core accessibility tests
npm run test:a11y

# Or manually test with:
# - VoiceOver (macOS): Cmd + F5
# - NVDA (Windows): Download and run
# - WAVE browser extension
```

---

## Rollout Plan

### Phase 1: Development Environment
1. Implement all components
2. Test with error simulator
3. Internal QA

### Phase 2: Staging Environment
1. Deploy to staging
2. Test with real API
3. Load testing for error scenarios
4. Accessibility audit

### Phase 3: Production Rollout
1. Deploy behind feature flag (optional)
2. Monitor error rates
3. Gather user feedback
4. Iterate on messaging if needed

### Monitoring
```typescript
// Add error tracking
if (error) {
  analytics.track('import_error', {
    type: error.type,
    message: error.message,
    code: error.code,
  });
}
```

---

## Success Metrics

### Technical Metrics
- [ ] 100% of error scenarios handled
- [ ] 0 unhandled promise rejections
- [ ] WCAG AA compliance score
- [ ] < 300ms error display time

### User Experience Metrics
- [ ] Reduced error-related support tickets
- [ ] Increased successful imports after retry
- [ ] User feedback on error clarity
- [ ] Reduced import abandonment rate

### Accessibility Metrics
- [ ] 100% keyboard navigable
- [ ] No screen reader errors
- [ ] All ARIA landmarks correct
- [ ] Color contrast passes automated tools

---

## Troubleshooting Guide

### Common Issues

**Issue**: Errors not clearing properly
```typescript
// Solution: Ensure error is cleared in all code paths
setError(null); // Always reset before retry
```

**Issue**: Toast notifications stacking
```typescript
// Solution: Use single toast state, replace instead of stack
const [activeToast, setActiveToast] = useState<Toast | null>(null);
```

**Issue**: Focus not moving to error
```typescript
// Solution: Add ref and focus in useEffect
useEffect(() => {
  if (error) {
    errorRef.current?.focus();
  }
}, [error]);
```

**Issue**: Screen reader not announcing errors
```typescript
// Solution: Verify aria-live and role attributes
<div role="alert" aria-live="assertive">
  {error.message}
</div>
```

---

## Resources

### Documentation References
- Main spec: `/docs/error-handling-specification.md`
- Visual examples: `/docs/error-handling-visual-examples.md`
- This roadmap: `/docs/error-handling-implementation-roadmap.md`

### Design System
- Alert component: `/src/components/ui/alert.tsx`
- Button component: `/src/components/ui/button.tsx`
- Utils: `/src/lib/utils.ts`

### External Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [React Error Handling Best Practices](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

## Questions & Support

### Design Questions
Refer to error-handling-specification.md for detailed design decisions and rationale.

### Technical Implementation
See code examples in this document and visual-examples.md.

### Accessibility
Consult WCAG 2.1 AA guidelines and test with actual assistive technologies.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-11
**Author**: UI Designer
**Related Documents**:
- `/docs/error-handling-specification.md`
- `/docs/error-handling-visual-examples.md`
