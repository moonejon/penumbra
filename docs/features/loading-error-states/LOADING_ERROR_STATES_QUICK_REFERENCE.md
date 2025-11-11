# Loading & Error States - Quick Reference Guide

**Quick reference for implementing feedback states in Penumbra**

---

## Quick Copy-Paste Components

### 1. Book List Skeleton (Most Common)

```typescript
// /src/app/components/feedback/loading/BookListSkeleton.tsx
import { Card, CardContent, Stack, Skeleton, Container } from '@mui/material';

export default function BookListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} sx={{ maxHeight: 200 }}>
            <CardContent sx={{ paddingLeft: { xs: 1, md: 2 } }}>
              <Stack direction="row" spacing={4}>
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={160}
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    borderRadius: 1,
                  }}
                />
                <Stack spacing={2} sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Stack spacing={1} sx={{ mt: 'auto' }}>
                    <Skeleton variant="text" width="80%" height={16} />
                    <Skeleton variant="text" width="70%" height={16} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
```

---

### 2. Network Error (Most Common Error)

```typescript
// /src/app/components/feedback/errors/NetworkError.tsx
import { Box, Typography, Button, Stack } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';

interface NetworkErrorProps {
  onRetry: () => void;
}

export default function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        px: 3,
        textAlign: 'center',
      }}
    >
      <WifiOffIcon sx={{ fontSize: 80, color: 'error.main', mb: 3, opacity: 0.8 }} />

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Connection Lost
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        Unable to connect to the server. Please check your internet connection and try again.
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onRetry} sx={{ minWidth: 120 }}>
          Retry
        </Button>
        <Button variant="outlined" onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
      </Stack>
    </Box>
  );
}
```

---

### 3. Empty Library State

```typescript
// /src/app/components/feedback/empty/EmptyLibrary.tsx
import { Box, Typography, Button } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';

interface EmptyLibraryProps {
  hasFilters: boolean;
}

export default function EmptyLibrary({ hasFilters }: EmptyLibraryProps) {
  const router = useRouter();

  if (hasFilters) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          px: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" gutterBottom>
          No Books Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          No books match your current filters.
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/library')}>
          Clear Filters
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        px: 3,
        textAlign: 'center',
      }}
    >
      <MenuBookIcon sx={{ fontSize: 120, color: 'primary.main', mb: 3, opacity: 0.6 }} />
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Your Library is Empty
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
        Start building your personal library by importing books.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => router.push('/import')}
        startIcon={<AddIcon />}
        sx={{ minWidth: 180 }}
      >
        Import Your First Book
      </Button>
    </Box>
  );
}
```

---

### 4. Loading Button State

```typescript
// Inline pattern - use in any component
import { Button, CircularProgress } from '@mui/material';

// In your component:
const [isLoading, setIsLoading] = useState(false);

<Button
  variant="contained"
  disabled={isLoading}
  onClick={handleAction}
  startIcon={
    isLoading ? (
      <CircularProgress size={16} sx={{ color: 'inherit' }} />
    ) : (
      <SaveIcon />
    )
  }
  sx={{ minWidth: 120 }}
>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

---

### 5. Progressive Image Loading

```typescript
// /src/app/components/feedback/loading/BookCoverImage.tsx
import { useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

interface BookCoverImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
}

export default function BookCoverImage({
  src,
  alt,
  width = 100,
  height = 160,
}: BookCoverImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <Box
        sx={{
          width,
          height,
          bgcolor: 'action.hover',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ImageNotSupportedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width, height }}>
      {!loaded && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          sx={{ position: 'absolute', borderRadius: 1 }}
        />
      )}

      <Box
        component="img"
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        sx={{
          width,
          maxHeight: height,
          objectFit: 'cover',
          borderRadius: 1,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </Box>
  );
}
```

---

### 6. Search Loading Indicator

```typescript
// Inline in search input
import { CircularProgress, TextField } from '@mui/material';

<TextField
  value={searchQuery}
  onChange={handleChange}
  placeholder="Search..."
  InputProps={{
    endAdornment: isSearching && (
      <CircularProgress
        size={20}
        sx={{ mr: 1, color: 'primary.main' }}
        aria-label="Searching"
      />
    ),
  }}
/>
```

---

### 7. API Error with Context

```typescript
// /src/app/components/feedback/errors/APIError.tsx
import { Card, CardContent, Stack, Typography, Button, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface APIErrorProps {
  error: string;
  isbn?: string;
  onRetry: () => void;
}

export default function APIError({ error, isbn, onRetry }: APIErrorProps) {
  const isRateLimit = error.toLowerCase().includes('rate limit');
  const isNotFound = error.toLowerCase().includes('not found');

  return (
    <Card sx={{ margin: { xs: '25px', md: '50px' } }}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <ErrorOutlineIcon sx={{ color: 'warning.main', fontSize: 32 }} />
            <Typography variant="h6">
              {isRateLimit ? 'Rate Limit Exceeded' :
               isNotFound ? 'Book Not Found' :
               'Search Error'}
            </Typography>
          </Stack>

          {isRateLimit ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Too many searches in a short time. Please wait a moment before trying again.
              </Typography>
              <Alert severity="info" variant="outlined">
                The ISBNdb API limits search requests. This helps keep the service available for everyone.
              </Alert>
            </>
          ) : isNotFound && isbn ? (
            <>
              <Typography variant="body2" color="text.secondary">
                No book found for ISBN: <strong>{isbn}</strong>
              </Typography>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Try these tips:
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
                  • Check the ISBN number is correct
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
                  • Try the ISBN from the title page
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
                  • Use the 13-digit ISBN if available
                </Typography>
              </Stack>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {error}
            </Typography>
          )}

          <Stack direction="row" spacing={2}>
            {!isNotFound && (
              <Button variant="contained" onClick={onRetry} disabled={isRateLimit}>
                {isRateLimit ? 'Please Wait...' : 'Try Again'}
              </Button>
            )}
            <Button variant="outlined" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
```

---

## Quick Implementation Patterns

### Pattern 1: Page with Loading State

```typescript
// Server component with Suspense
import { Suspense } from 'react';
import { BookListSkeleton } from '@/components/feedback';

export default async function LibraryPage() {
  return (
    <Suspense fallback={<BookListSkeleton count={10} />}>
      <LibraryContent />
    </Suspense>
  );
}
```

---

### Pattern 2: Client Component with Loading

```typescript
'use client';

import { useState, useEffect } from 'react';
import { BookListSkeleton, NetworkError } from '@/components/feedback';

export default function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <BookListSkeleton />;
  if (error) return <NetworkError onRetry={fetchData} />;
  if (!data) return <EmptyLibrary hasFilters={false} />;

  return <div>{/* Render data */}</div>;
}
```

---

### Pattern 3: Form with Button Loading

```typescript
'use client';

import { useState } from 'react';
import { Button, CircularProgress, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';

export default function MyForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      await saveData();
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      {status === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={status === 'loading' || status === 'success'}
        startIcon={
          status === 'loading' ? (
            <CircularProgress size={16} sx={{ color: 'inherit' }} />
          ) : status === 'success' ? (
            <CheckIcon />
          ) : (
            <SaveIcon />
          )
        }
        sx={{
          minWidth: 140,
          bgcolor: status === 'success' ? 'success.main' : undefined,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {status === 'loading' ? 'Saving...' :
         status === 'success' ? 'Saved!' :
         'Save'}
      </Button>
    </form>
  );
}
```

---

## File Structure Checklist

Create these files in your project:

```
/src/app/components/feedback/
├── loading/
│   ├── BookListSkeleton.tsx          ✓ Copy from above
│   ├── BookCoverImage.tsx            ✓ Copy from above
│   └── PageSkeleton.tsx              (optional)
├── errors/
│   ├── NetworkError.tsx              ✓ Copy from above
│   ├── APIError.tsx                  ✓ Copy from above
│   └── ErrorBoundary.tsx             (see full spec)
├── empty/
│   ├── EmptyLibrary.tsx              ✓ Copy from above
│   └── EmptySearch.tsx               (see full spec)
└── index.ts                          ✓ Barrel exports
```

**Barrel Export (index.ts):**
```typescript
// Loading components
export { default as BookListSkeleton } from './loading/BookListSkeleton';
export { default as BookCoverImage } from './loading/BookCoverImage';

// Error components
export { default as NetworkError } from './errors/NetworkError';
export { default as APIError } from './errors/APIError';

// Empty state components
export { default as EmptyLibrary } from './empty/EmptyLibrary';
```

---

## Priority Implementation Order

### Phase 1: Essential Components (30 minutes)
1. ✓ BookListSkeleton - Most visible improvement
2. ✓ NetworkError - Most common error
3. ✓ EmptyLibrary - Important first-user experience

### Phase 2: Enhanced Feedback (30 minutes)
4. ✓ BookCoverImage - Progressive image loading
5. ✓ APIError - ISBN search errors
6. ✓ Button loading states - Form feedback

### Phase 3: Polish (30 minutes)
7. Error boundary for crash recovery
8. Empty search results
9. Loading states for all buttons
10. Accessibility audit

---

## Common Scenarios

### Scenario 1: Library Page Loading
**Before:**
```typescript
export default async function LibraryPage() {
  const books = await getBooks();
  return <Library books={books} />;
}
```

**After:**
```typescript
import { Suspense } from 'react';
import { BookListSkeleton, EmptyLibrary } from '@/components/feedback';

export default async function LibraryPage() {
  return (
    <Suspense fallback={<BookListSkeleton count={10} />}>
      <LibraryContent />
    </Suspense>
  );
}

async function LibraryContent() {
  const books = await getBooks();

  if (books.length === 0) {
    return <EmptyLibrary hasFilters={false} />;
  }

  return <Library books={books} />;
}
```

---

### Scenario 2: Book Import Search
**Before:**
```typescript
const [loading, setLoading] = useState(false);

const handleSearch = async () => {
  setLoading(true);
  const data = await fetch(`/api/isbn/${isbn}`);
  setBookData(data);
  setLoading(false);
};

return loading ? <CircularProgress /> : <Preview book={bookData} />;
```

**After:**
```typescript
import { APIError } from '@/components/feedback';

const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSearch = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch(`/api/isbn/${isbn}`);
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    setBookData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

if (error) {
  return <APIError error={error} isbn={isbn} onRetry={handleSearch} />;
}

return loading ? (
  <LinearProgress sx={{ my: 2 }} />
) : (
  <Preview book={bookData} />
);
```

---

### Scenario 3: Image Loading in Cards
**Before:**
```typescript
{book.image ? (
  <img src={book.image} />
) : (
  <Skeleton variant="rectangular" width={100} height={160} />
)}
```

**After:**
```typescript
import { BookCoverImage } from '@/components/feedback';

<BookCoverImage
  src={book.image}
  alt={book.title}
  width={100}
  height={160}
/>
```

---

## Accessibility Quick Checks

### Screen Reader Announcements
```typescript
// Add to loading states
<div role="status" aria-live="polite" className="sr-only">
  {isLoading ? 'Loading library' : 'Library loaded'}
</div>

// Add to error states
<div role="alert" aria-live="assertive" className="sr-only">
  {error && `Error: ${error}`}
</div>
```

### Focus Management
```typescript
// Return focus to retry button on error
const retryButtonRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  if (error) {
    retryButtonRef.current?.focus();
  }
}, [error]);

<Button ref={retryButtonRef} onClick={handleRetry}>
  Retry
</Button>
```

### Keyboard Navigation
All buttons and interactive elements automatically support:
- `Enter` key activation
- `Space` key activation
- `Tab` navigation
- `Escape` to close modals

---

## Testing Checklist

### Visual Testing
- [ ] Loading states appear immediately on action
- [ ] Skeleton screens match real content layout
- [ ] Images fade in smoothly
- [ ] Button states don't cause layout shift
- [ ] Error messages are clear and actionable

### Functional Testing
- [ ] Retry buttons work correctly
- [ ] Loading states prevent duplicate submissions
- [ ] Error states clear on retry
- [ ] Empty states show correct call-to-action
- [ ] Navigation works from error states

### Accessibility Testing
- [ ] Screen reader announces loading states
- [ ] Screen reader announces errors
- [ ] All buttons keyboard accessible
- [ ] Focus returns to appropriate element
- [ ] Color contrast meets WCAG AA

### Performance Testing
- [ ] No unnecessary re-renders
- [ ] Debounced search works (300ms)
- [ ] Images lazy load
- [ ] Skeleton screens prevent layout shift

---

## Common Pitfalls to Avoid

### 1. Layout Shift
**Bad:**
```typescript
// Button changes size when loading
<Button>{isLoading ? <CircularProgress size={16} /> : 'Save'}</Button>
```

**Good:**
```typescript
// Button maintains consistent width
<Button sx={{ minWidth: 120 }}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

---

### 2. No Error Recovery
**Bad:**
```typescript
// Error with no way to retry
{error && <Typography>Error occurred</Typography>}
```

**Good:**
```typescript
// Error with retry option
{error && (
  <Alert severity="error">
    {error}
    <Button onClick={handleRetry}>Try Again</Button>
  </Alert>
)}
```

---

### 3. Generic Error Messages
**Bad:**
```typescript
// Unhelpful message
<Typography>Something went wrong</Typography>
```

**Good:**
```typescript
// Specific, actionable message
<Typography>
  Unable to load books. Check your connection and try again.
</Typography>
```

---

### 4. Spinners Without Context
**Bad:**
```typescript
// User doesn't know what's loading
<CircularProgress />
```

**Good:**
```typescript
// Clear context
<Stack spacing={2} alignItems="center">
  <CircularProgress />
  <Typography>Loading your library...</Typography>
</Stack>
```

---

### 5. Missing Accessibility
**Bad:**
```typescript
// Screen readers don't know status
<CircularProgress />
```

**Good:**
```typescript
// Announced to screen readers
<CircularProgress aria-label="Loading" role="status" />
<span className="sr-only">Loading library, please wait...</span>
```

---

## Quick Tips

1. **Always show immediate feedback** - Never leave users wondering if their action worked
2. **Use skeletons over spinners** - Skeleton screens feel 2-3x faster
3. **Provide context** - Tell users what's happening ("Searching library..." not just a spinner)
4. **Always offer retry** - Network issues are common, make recovery easy
5. **Progressive loading** - Show partial data while loading rest
6. **Maintain layout** - Use minWidth on buttons to prevent shift
7. **Test with throttling** - Use Chrome DevTools to slow network and see loading states
8. **Accessibility first** - Add ARIA labels and screen reader text
9. **Match skeletons to content** - Skeleton layout should match actual content
10. **Clear on success** - Show brief success message then clear state

---

## Need Help?

Refer to:
- **Full Specification:** `/Users/jonathan/github/penumbra/LOADING_ERROR_STATES_DESIGN_SPEC.md`
- **Material-UI Docs:** https://mui.com/material-ui/
- **MUI Skeleton:** https://mui.com/material-ui/react-skeleton/
- **MUI Progress:** https://mui.com/material-ui/react-progress/

---

**Ready to implement! Start with Phase 1 (BookListSkeleton, NetworkError, EmptyLibrary) for immediate impact.**
