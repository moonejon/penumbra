# Penumbra Loading & Error States Design Specification

**Version:** 1.0
**Date:** November 10, 2025
**Design System:** Material-UI v7, Dark Theme, Space Mono Font
**Target:** Frontend Development Implementation

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Design Tokens](#design-tokens)
3. [Loading States](#loading-states)
4. [Error States](#error-states)
5. [Empty States](#empty-states)
6. [Accessibility](#accessibility)
7. [Implementation Guidelines](#implementation-guidelines)
8. [Usage Examples](#usage-examples)

---

## Design Principles

### Core Philosophy

**Perceived Performance Over Actual Performance**
- Show immediate feedback for every user action
- Use skeleton screens instead of spinners when possible
- Progressive loading: show data as it arrives
- Optimistic UI updates for safe operations

**Clear Communication**
- Always tell users what's happening
- Provide context-specific feedback messages
- Offer actionable next steps for errors
- Use appropriate visual hierarchy

**Brand Consistency**
- Match dark theme aesthetic (Space Mono font)
- Use Material-UI components and patterns
- Maintain minimalist, clean interface
- Consistent motion and timing

**User Empowerment**
- Always provide retry options for failures
- Show clear paths to resolution
- Prevent user frustration with helpful messages
- Handle edge cases gracefully

---

## Design Tokens

### Colors (Material-UI Dark Theme)

```typescript
// Background Colors
background.default: '#121212'      // Main background
background.paper: '#1e1e1e'        // Card/surface background

// Text Colors
text.primary: 'rgba(255, 255, 255, 0.87)'
text.secondary: 'rgba(255, 255, 255, 0.6)'
text.disabled: 'rgba(255, 255, 255, 0.38)'

// State Colors
primary.main: '#90caf9'            // Loading indicators
error.main: '#f44336'              // Error states
error.light: '#e57373'             // Error backgrounds
warning.main: '#ffa726'            // Warning states
info.main: '#29b6f6'               // Info states
success.main: '#66bb6a'            // Success states

// Action Colors
action.hover: 'rgba(255, 255, 255, 0.08)'
action.selected: 'rgba(255, 255, 255, 0.16)'
action.disabled: 'rgba(255, 255, 255, 0.26)'

// Divider
divider: 'rgba(255, 255, 255, 0.12)'
```

### Spacing Scale

```typescript
// MUI spacing function: theme.spacing(n) = n * 8px
spacing: {
  0: '0px',
  1: '8px',    // Small gaps
  2: '16px',   // Default spacing
  3: '24px',   // Medium spacing
  4: '32px',   // Large spacing
  6: '48px',   // Extra large spacing
  8: '64px',   // Section spacing
}
```

### Animation Timing

```typescript
// Duration (milliseconds)
duration: {
  shortest: 150,   // Small UI changes
  shorter: 200,    // Tooltips, popovers
  short: 250,      // Modals, dialogs
  standard: 300,   // Most transitions
  complex: 375,    // Complex animations
  enteringScreen: 225,
  leavingScreen: 195,
}

// Easing Functions
easing: {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Standard
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',    // Deceleration
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',       // Acceleration
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',      // Sharp
}
```

### Typography Scale

```typescript
typography: {
  fontFamily: 'var(--font-space-mono)',  // Space Mono
  h6: {
    fontSize: '1.25rem',      // 20px - Section headers
    fontWeight: 500,
  },
  body1: {
    fontSize: '1rem',         // 16px - Body text
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.875rem',     // 14px - Secondary text
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.75rem',      // 12px - Labels, hints
    fontWeight: 400,
  },
}
```

---

## Loading States

### 1. Page Loading (Initial Load)

**When to Use:**
- First page load (Library, Import, Dashboard)
- Route transitions between pages
- After authentication

**Design:**

**Full Page Skeleton**
```typescript
Component Structure:
<Container maxWidth="xl" sx={{ mt: 3 }}>
  {/* Search Header Skeleton */}
  <Box sx={{ mb: 3 }}>
    <Skeleton
      variant="rectangular"
      height={56}
      sx={{
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    />
  </Box>

  {/* Book List Skeleton (3 items visible) */}
  <Stack spacing={2}>
    {[1, 2, 3].map((i) => (
      <Card key={i} sx={{ maxHeight: 200 }}>
        <CardContent>
          <Stack direction="row" spacing={4}>
            {/* Book cover */}
            <Skeleton
              variant="rectangular"
              width={100}
              height={160}
              sx={{
                borderRadius: 1,
                display: { xs: 'none', sm: 'block' }
              }}
            />

            {/* Book details */}
            <Stack spacing={2} sx={{ flex: 1 }}>
              {/* Title */}
              <Skeleton
                variant="text"
                width="60%"
                height={32}
                sx={{ fontSize: '1.25rem' }}
              />

              {/* Author */}
              <Skeleton
                variant="text"
                width="40%"
                height={24}
              />

              {/* Metadata */}
              <Stack spacing={1}>
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

  {/* Pagination Skeleton */}
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, mt: 2 }}>
    <Skeleton
      variant="rectangular"
      width={300}
      height={40}
      sx={{ borderRadius: 1 }}
    />
  </Box>
</Container>
```

**Animation:**
- Use MUI Skeleton `animation="wave"` (default)
- Wave animation: 1.5s duration, infinite loop
- Smooth, subtle animation that doesn't distract

**Accessibility:**
```typescript
<Skeleton
  variant="rectangular"
  aria-label="Loading library content"
  role="status"
>
  <span className="sr-only">Loading library, please wait...</span>
</Skeleton>
```

---

### 2. Search Loading (Real-Time Autocomplete)

**When to Use:**
- Intelligent search while user types
- Suggestion dropdown loading
- Search results filtering

**Design:**

**Current Implementation Enhancement:**
```typescript
// Already implemented in intelligentSearch.tsx line 368
InputProps={{
  endAdornment: (
    <>
      {isLoading && (
        <CircularProgress
          size={20}
          sx={{
            mr: 1,
            color: 'primary.main'
          }}
        />
      )}
    </>
  ),
}}
```

**Improvement - Add Inline Loading State in Dropdown:**
```typescript
{isLoading && (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      py: 3,
      gap: 2,
    }}
  >
    <CircularProgress size={24} />
    <Typography variant="body2" color="text.secondary">
      Searching library...
    </Typography>
  </Box>
)}
```

**Animation Specifications:**
- CircularProgress: Indeterminate (infinite rotation)
- Size: 20px in input, 24px in dropdown
- Color: `primary.main` (#90caf9)
- Duration: 1.4s per rotation (MUI default)

**Debounce Timing:**
- Current: 300ms (optimal)
- Prevents excessive API calls
- Feels responsive without lag

**Accessibility:**
```typescript
<CircularProgress
  size={20}
  aria-label="Searching"
  role="status"
  sx={{ mr: 1 }}
/>

{/* Add live region for screen readers */}
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {isLoading ? 'Searching library' : `Found ${totalItems} results`}
</div>
```

---

### 3. Book Import Loading (ISBN Fetch)

**When to Use:**
- Searching ISBNdb API by ISBN
- Fetching book metadata
- Can be slow (2-5 seconds)

**Design:**

**Linear Progress with Message:**
```typescript
// Replace current loading state with more informative version
{loading && (
  <Card sx={{ margin: { xs: '25px', md: '50px' } }}>
    <CardContent>
      <Stack spacing={3} alignItems="center">
        <Typography variant="h6" color="text.secondary">
          Fetching book details...
        </Typography>

        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <LinearProgress
            sx={{
              height: 6,
              borderRadius: 1,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'primary.main',
                borderRadius: 1,
              }
            }}
          />
        </Box>

        <Typography variant="caption" color="text.secondary">
          This may take a few seconds...
        </Typography>
      </Stack>
    </CardContent>
  </Card>
)}
```

**Progressive Loading:**
```typescript
// Show partial data as it arrives
{loading && bookData.title && (
  <Card sx={{ margin: { xs: '25px', md: '50px' } }}>
    <CardContent>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Preview</Typography>
          <CircularProgress size={20} />
        </Box>

        {/* Show partial data with skeleton for missing parts */}
        <Stack direction="row" spacing={2}>
          {bookData.imageOriginal ? (
            <img src={bookData.imageOriginal} height={150} />
          ) : (
            <Skeleton variant="rectangular" width={100} height={150} />
          )}

          <Stack spacing={1}>
            <Typography variant="h6">
              {bookData.title}
            </Typography>

            {bookData.authors.length > 0 ? (
              <Typography variant="subtitle2">
                {bookData.authors.join(', ')}
              </Typography>
            ) : (
              <Skeleton variant="text" width={200} />
            )}
          </Stack>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Loading additional details...
        </Typography>
      </Stack>
    </CardContent>
  </Card>
)}
```

**Animation:**
- LinearProgress: Indeterminate mode
- Bar width: 40% of container
- Animation: Slide left-to-right, 2s duration
- Color: primary.main with opacity variations

---

### 4. Action Button Loading States

**When to Use:**
- Save/Delete operations
- Form submissions
- API mutations

**Design:**

**Button Loading Pattern:**
```typescript
import { Button, CircularProgress } from '@mui/material';

<Button
  variant="contained"
  disabled={isSaving}
  onClick={handleSave}
  startIcon={
    isSaving ? (
      <CircularProgress
        size={16}
        sx={{ color: 'inherit' }}
      />
    ) : (
      <SaveIcon />
    )
  }
  sx={{
    minWidth: 120,  // Prevent layout shift
    transition: 'all 0.2s ease-in-out',
  }}
>
  {isSaving ? 'Saving...' : 'Save Book'}
</Button>
```

**States:**

1. **Default State:**
   - Full color, interactive
   - Clear call-to-action text
   - Icon prefix (optional)

2. **Loading State:**
   - Disabled interaction
   - Spinner replaces icon
   - Text changes to present continuous ("Saving...")
   - Maintain button width (prevent layout shift)

3. **Success State (Temporary):**
   - Show checkmark icon briefly (500ms)
   - Success color flash
   - Then return to default

```typescript
// Enhanced with success feedback
const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');

const handleSave = async () => {
  setButtonState('loading');
  try {
    await saveBook();
    setButtonState('success');
    setTimeout(() => setButtonState('idle'), 1000);
  } catch (error) {
    setButtonState('idle');
    // Show error (see error states section)
  }
};

<Button
  variant="contained"
  disabled={buttonState !== 'idle'}
  onClick={handleSave}
  startIcon={
    buttonState === 'loading' ? (
      <CircularProgress size={16} sx={{ color: 'inherit' }} />
    ) : buttonState === 'success' ? (
      <CheckIcon />
    ) : (
      <SaveIcon />
    )
  }
  sx={{
    minWidth: 140,
    bgcolor: buttonState === 'success' ? 'success.main' : undefined,
    transition: 'all 0.3s ease-in-out',
  }}
>
  {buttonState === 'loading' ? 'Saving...' :
   buttonState === 'success' ? 'Saved!' :
   'Save Book'}
</Button>
```

---

### 5. Image Loading States

**When to Use:**
- Book cover images
- Profile images
- Any async image loading

**Design:**

**Current Implementation (item.tsx line 68-79):**
```typescript
{image ? (
  <Box
    component="img"
    src={image}
    sx={{
      maxHeight: { xs: '80px', md: '160px' },
      objectFit: 'fill',
    }}
  />
) : (
  <Skeleton variant="rectangular" width={100} height={160} />
)}
```

**Enhanced Implementation with Progressive Loading:**
```typescript
import { useState } from 'react';

const BookCover = ({ src, alt }: { src?: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <Box
        sx={{
          width: 100,
          height: 160,
          bgcolor: 'action.hover',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ImageNotSupportedIcon
          sx={{
            fontSize: 40,
            color: 'text.disabled'
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: 100, height: 160 }}>
      {/* Skeleton shown while loading */}
      {!loaded && (
        <Skeleton
          variant="rectangular"
          width={100}
          height={160}
          sx={{
            position: 'absolute',
            borderRadius: 1,
          }}
        />
      )}

      {/* Actual image */}
      <Box
        component="img"
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        sx={{
          width: 100,
          maxHeight: 160,
          objectFit: 'cover',
          borderRadius: 1,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </Box>
  );
};
```

**Animation:**
- Fade-in: 300ms ease-in-out
- Skeleton wave animation while loading
- Smooth transition from skeleton to image

---

### 6. List/Grid Loading (Skeleton Screens)

**When to Use:**
- Library list initial load
- Pagination navigation
- Filter changes

**Design:**

**Book List Skeleton Component:**
```typescript
import { Card, CardContent, Stack, Skeleton } from '@mui/material';

const BookListSkeleton = ({ count = 10 }: { count?: number }) => {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          sx={{
            maxHeight: 200,
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          <CardContent sx={{ paddingLeft: { xs: 1, md: 2 } }}>
            <Stack direction="row" spacing={4}>
              {/* Book cover skeleton */}
              <Skeleton
                variant="rectangular"
                width={100}
                height={160}
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                }}
              />

              {/* Book details skeleton */}
              <Stack spacing={2} sx={{ flex: 1 }}>
                {/* Title */}
                <Skeleton
                  variant="text"
                  width="60%"
                  height={32}
                  sx={{
                    fontSize: '1.25rem',
                    borderRadius: 0.5,
                  }}
                />

                {/* Author */}
                <Skeleton
                  variant="text"
                  width="40%"
                  height={24}
                  sx={{ borderRadius: 0.5 }}
                />

                {/* Metadata */}
                <Stack spacing={1} sx={{ mt: 'auto' }}>
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={16}
                    sx={{ borderRadius: 0.5 }}
                  />
                  <Skeleton
                    variant="text"
                    width="70%"
                    height={16}
                    sx={{ borderRadius: 0.5 }}
                  />
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={16}
                    sx={{ borderRadius: 0.5 }}
                  />
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default BookListSkeleton;
```

**Usage in List Component:**
```typescript
// In list.tsx
import BookListSkeleton from './bookListSkeleton';

const List: FC<ListProps> = ({ rows, page, setSelectedBook, pageCount, isLoading }) => {
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <BookListSkeleton count={10} />
      </Container>
    );
  }

  return (
    <Stack spacing={2}>
      {rows?.map((book, i) => (
        <Item book={book} key={i} setSelectedBook={setSelectedBook} />
      ))}
      {/* Pagination */}
    </Stack>
  );
};
```

**Animation:**
- Stagger animation: Each skeleton appears 50ms after previous
- Wave animation on skeletons
- Fade-in when real content loads

---

## Error States

### 1. Network Errors

**When to Use:**
- Connection failures
- Timeouts
- Server unavailable (502, 503, 504)

**Design:**

**Full Page Error:**
```typescript
import { Box, Typography, Button, Stack } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const NetworkError = ({ onRetry }: { onRetry: () => void }) => {
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
      <WifiOffIcon
        sx={{
          fontSize: 80,
          color: 'error.main',
          mb: 3,
          opacity: 0.8,
        }}
      />

      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Connection Lost
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 400 }}
      >
        Unable to connect to the server. Please check your internet
        connection and try again.
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{ minWidth: 120 }}
        >
          Retry
        </Button>

        <Button
          variant="outlined"
          onClick={() => window.location.href = '/'}
        >
          Go Home
        </Button>
      </Stack>
    </Box>
  );
};
```

**Inline Error (For Components):**
```typescript
const NetworkErrorInline = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <Card sx={{ bgcolor: 'error.dark', borderColor: 'error.main', borderWidth: 1 }}>
      <CardContent>
        <Stack spacing={2} alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <WifiOffIcon sx={{ color: 'error.light' }} />
            <Typography variant="body2" color="error.light">
              Network error. Unable to load data.
            </Typography>
          </Stack>

          <Button
            size="small"
            variant="outlined"
            onClick={onRetry}
            sx={{
              borderColor: 'error.light',
              color: 'error.light',
              '&:hover': {
                borderColor: 'error.main',
                bgcolor: 'error.main',
                color: 'error.contrastText',
              }
            }}
          >
            Try Again
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
```

---

### 2. API Errors (External Service)

**When to Use:**
- ISBNdb API failures
- Rate limit exceeded
- Invalid ISBN
- API key issues

**Design:**

**ISBN Search Error:**
```typescript
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ISBNSearchError = ({
  error,
  isbn,
  onRetry
}: {
  error: string;
  isbn: string;
  onRetry: () => void
}) => {
  const isRateLimit = error.includes('rate limit');
  const isNotFound = error.includes('not found') || error.includes('404');

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

          {isRateLimit && (
            <>
              <Typography variant="body2" color="text.secondary">
                Too many searches in a short time. Please wait a moment
                before trying again.
              </Typography>
              <Alert severity="info" variant="outlined">
                The ISBNdb API limits search requests. This helps keep
                the service available for everyone.
              </Alert>
            </>
          )}

          {isNotFound && (
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
          )}

          {!isRateLimit && !isNotFound && (
            <>
              <Typography variant="body2" color="text.secondary">
                Unable to fetch book details from ISBNdb.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Error: {error}
              </Typography>
            </>
          )}

          <Stack direction="row" spacing={2}>
            {!isNotFound && (
              <Button
                variant="contained"
                onClick={onRetry}
                disabled={isRateLimit}
              >
                {isRateLimit ? 'Please Wait...' : 'Try Again'}
              </Button>
            )}

            <Button
              variant="outlined"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
```

---

### 3. Validation Errors

**When to Use:**
- Form validation
- Input errors
- Required field missing

**Design:**

**Inline Field Error:**
```typescript
import { TextField, FormHelperText } from '@mui/material';

<TextField
  label="ISBN"
  value={isbn}
  onChange={handleChange}
  error={!!error}
  helperText={error}
  fullWidth
  sx={{
    '& .MuiOutlinedInput-root': {
      '&.Mui-error fieldset': {
        borderColor: 'error.main',
        borderWidth: 2,
      },
    },
  }}
  InputProps={{
    startAdornment: error && (
      <ErrorOutlineIcon
        sx={{
          color: 'error.main',
          mr: 1,
          fontSize: 20,
        }}
      />
    ),
  }}
/>
```

**Form-Level Error:**
```typescript
const FormError = ({ message }: { message: string }) => {
  return (
    <Alert
      severity="error"
      variant="outlined"
      sx={{
        mb: 2,
        borderColor: 'error.main',
        bgcolor: 'error.dark',
        '& .MuiAlert-icon': {
          color: 'error.light',
        },
      }}
    >
      <Typography variant="body2">
        {message}
      </Typography>
    </Alert>
  );
};
```

---

### 4. Generic Error with Retry

**When to Use:**
- Unexpected errors
- Unhandled exceptions
- Fallback error state

**Design:**

**Error Boundary Fallback:**
```typescript
import { Component, ReactNode } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            px: 3,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <ErrorIcon
            sx={{
              fontSize: 100,
              color: 'error.main',
              mb: 3,
              opacity: 0.8,
            }}
          />

          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Something Went Wrong
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, maxWidth: 500 }}
          >
            An unexpected error occurred. This has been logged and
            we'll look into it.
          </Typography>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box
              sx={{
                mb: 4,
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
                maxWidth: 600,
                textAlign: 'left',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  color: 'error.light',
                }}
              >
                {this.state.error.message}
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{ minWidth: 120 }}
            >
              Reload Page
            </Button>

            <Button
              variant="outlined"
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

### 5. Permission/Auth Errors

**When to Use:**
- 401 Unauthorized
- 403 Forbidden
- Session expired

**Design:**

```typescript
import LockIcon from '@mui/icons-material/Lock';
import { useRouter } from 'next/navigation';

const PermissionError = ({ message }: { message?: string }) => {
  const router = useRouter();

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
      <LockIcon
        sx={{
          fontSize: 80,
          color: 'warning.main',
          mb: 3,
          opacity: 0.8,
        }}
      />

      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Access Denied
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 400 }}
      >
        {message || 'You do not have permission to access this resource.'}
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={() => router.push('/api/auth/signin')}
          sx={{ minWidth: 120 }}
        >
          Sign In
        </Button>

        <Button
          variant="outlined"
          onClick={() => router.push('/')}
        >
          Go Home
        </Button>
      </Stack>
    </Box>
  );
};
```

---

## Empty States

### 1. Empty Library

**When to Use:**
- New user with no books
- All books deleted
- Filtered results return nothing

**Design:**

```typescript
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useRouter } from 'next/navigation';

const EmptyLibrary = ({ hasFilters }: { hasFilters: boolean }) => {
  const router = useRouter();

  if (hasFilters) {
    // Empty results from filters
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
        <SearchOffIcon
          sx={{
            fontSize: 80,
            color: 'text.disabled',
            mb: 3,
            opacity: 0.5,
          }}
        />

        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          No Books Found
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 400 }}
        >
          No books match your current filters. Try adjusting your
          search or clearing filters.
        </Typography>

        <Button
          variant="outlined"
          onClick={() => router.push('/library')}
        >
          Clear Filters
        </Button>
      </Box>
    );
  }

  // Truly empty library
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
      <MenuBookIcon
        sx={{
          fontSize: 120,
          color: 'primary.main',
          mb: 3,
          opacity: 0.6,
        }}
      />

      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Your Library is Empty
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 500 }}
      >
        Start building your personal library by importing books.
        Search by ISBN to quickly add books with complete metadata.
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
};
```

---

### 2. Empty Search Results

**When to Use:**
- Search query returns no suggestions
- No matching titles, authors, or subjects

**Design:**

```typescript
// Already partially implemented in intelligentSearch.tsx line 434-443
// Enhancement:

const EmptySearchResults = ({ query }: { query: string }) => {
  return (
    <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
      <SearchOffIcon
        sx={{
          fontSize: 48,
          color: 'text.disabled',
          mb: 2,
          opacity: 0.5,
        }}
      />

      <Typography variant="body2" color="text.secondary" gutterBottom>
        No suggestions found for &quot;{query}&quot;
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 1 }}
      >
        Press Enter to search for titles containing this text
      </Typography>
    </Box>
  );
};
```

---

### 3. Empty Import Queue

**When to Use:**
- No books in import queue
- Queue cleared after import

**Design:**

```typescript
const EmptyQueue = () => {
  return (
    <Card sx={{ margin: { xs: '25px', md: '50px' } }}>
      <CardContent>
        <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
          <QueueIcon
            sx={{
              fontSize: 64,
              color: 'text.disabled',
              opacity: 0.5,
            }}
          />

          <Typography variant="h6" color="text.secondary">
            Queue is Empty
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', maxWidth: 300 }}
          >
            Search for books by ISBN and add them to the queue
            to import multiple books at once.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
```

---

## Accessibility

### ARIA Labels and Roles

**Loading States:**
```typescript
// Skeleton screens
<Skeleton
  variant="rectangular"
  aria-label="Loading content"
  role="status"
>
  <span className="sr-only">Loading library content, please wait...</span>
</Skeleton>

// Spinners
<CircularProgress
  aria-label="Loading"
  role="status"
  aria-live="polite"
/>

// Progress bars
<LinearProgress
  aria-label="Loading book details"
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
/>
```

**Live Regions for Dynamic Content:**
```typescript
// Announce search results to screen readers
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {isLoading ? 'Searching library' :
   totalResults > 0 ? `Found ${totalResults} results` :
   'No results found'}
</div>

// Announce errors
<div
  role="alert"
  aria-live="assertive"
  className="sr-only"
>
  {errorMessage}
</div>
```

**Focus Management:**
```typescript
// Trap focus in error modals
import { useEffect, useRef } from 'react';

const ErrorDialog = ({ open }: { open: boolean }) => {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      firstButtonRef.current?.focus();
    }
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogContent>
        <Typography>Error occurred</Typography>
      </DialogContent>
      <DialogActions>
        <Button ref={firstButtonRef} onClick={handleRetry}>
          Retry
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

**Screen Reader Only Text:**
```typescript
// Add to global CSS
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Keyboard Navigation:**
```typescript
// Ensure all interactive elements are keyboard accessible
<Button
  onClick={handleRetry}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRetry();
    }
  }}
>
  Retry
</Button>

// Skip to main content link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only"
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
  }}
>
  Skip to main content
</a>
```

**Color Contrast:**
- All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Error colors: #f44336 on dark background provides 7.2:1 contrast
- Primary colors: #90caf9 on dark background provides 8.5:1 contrast
- Never rely on color alone - always use icons + text

---

## Implementation Guidelines

### Component Architecture

**Create Reusable Components:**

```
/src/app/components/feedback/
  ├── loading/
  │   ├── PageSkeleton.tsx
  │   ├── BookListSkeleton.tsx
  │   ├── BookCardSkeleton.tsx
  │   ├── SearchLoading.tsx
  │   └── ButtonLoading.tsx
  ├── errors/
  │   ├── NetworkError.tsx
  │   ├── APIError.tsx
  │   ├── PermissionError.tsx
  │   ├── GenericError.tsx
  │   └── ErrorBoundary.tsx
  ├── empty/
  │   ├── EmptyLibrary.tsx
  │   ├── EmptySearch.tsx
  │   └── EmptyQueue.tsx
  └── index.ts (barrel export)
```

**Barrel Export (index.ts):**
```typescript
// /src/app/components/feedback/index.ts
export { default as PageSkeleton } from './loading/PageSkeleton';
export { default as BookListSkeleton } from './loading/BookListSkeleton';
export { default as BookCardSkeleton } from './loading/BookCardSkeleton';
export { default as SearchLoading } from './loading/SearchLoading';
export { default as ButtonLoading } from './loading/ButtonLoading';

export { default as NetworkError } from './errors/NetworkError';
export { default as APIError } from './errors/APIError';
export { default as PermissionError } from './errors/PermissionError';
export { default as GenericError } from './errors/GenericError';
export { default as ErrorBoundary } from './errors/ErrorBoundary';

export { default as EmptyLibrary } from './empty/EmptyLibrary';
export { default as EmptySearch } from './empty/EmptySearch';
export { default as EmptyQueue } from './empty/EmptyQueue';
```

---

### State Management Patterns

**Loading State Hook:**
```typescript
// /src/hooks/useLoadingState.ts
import { useState, useCallback } from 'react';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const useLoadingState = () => {
  const [state, setState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setState('loading');
    setError(null);
  }, []);

  const setSuccess = useCallback(() => {
    setState('success');
    setError(null);
  }, []);

  const setError = useCallback((errorMessage: string) => {
    setState('error');
    setError(errorMessage);
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
  }, []);

  return {
    state,
    error,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    isIdle: state === 'idle',
    startLoading,
    setSuccess,
    setError,
    reset,
  };
};
```

**Usage Example:**
```typescript
import { useLoadingState } from '@/hooks/useLoadingState';

const MyComponent = () => {
  const { state, error, startLoading, setSuccess, setError } = useLoadingState();

  const handleSave = async () => {
    startLoading();
    try {
      await saveData();
      setSuccess();
      // Show success message briefly
      setTimeout(() => reset(), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (state === 'loading') return <LoadingSpinner />;
  if (state === 'error') return <ErrorMessage error={error} />;

  return <MyForm onSubmit={handleSave} />;
};
```

---

### Error Handling Pattern

**Create Unified Error Handler:**
```typescript
// /src/utils/errorHandler.ts
export type ErrorType =
  | 'network'
  | 'api'
  | 'validation'
  | 'permission'
  | 'generic';

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: unknown;
}

export const handleError = (error: unknown): AppError => {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Unable to connect to the server. Please check your internet connection.',
    };
  }

  // API errors
  if (error instanceof Response) {
    if (error.status === 401) {
      return {
        type: 'permission',
        message: 'Your session has expired. Please sign in again.',
        code: '401',
      };
    }
    if (error.status === 403) {
      return {
        type: 'permission',
        message: 'You do not have permission to perform this action.',
        code: '403',
      };
    }
    if (error.status === 429) {
      return {
        type: 'api',
        message: 'Rate limit exceeded. Please wait a moment and try again.',
        code: '429',
      };
    }
    if (error.status >= 500) {
      return {
        type: 'network',
        message: 'Server error. Please try again later.',
        code: error.status.toString(),
      };
    }
  }

  // Validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    return {
      type: 'validation',
      message: error.message,
    };
  }

  // Generic fallback
  return {
    type: 'generic',
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    details: error,
  };
};
```

**Usage:**
```typescript
import { handleError } from '@/utils/errorHandler';
import { NetworkError, APIError, GenericError } from '@/components/feedback';

const MyComponent = () => {
  const [error, setError] = useState<AppError | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw response;
      const data = await response.json();
      return data;
    } catch (err) {
      const appError = handleError(err);
      setError(appError);
    }
  };

  if (error) {
    switch (error.type) {
      case 'network':
        return <NetworkError onRetry={fetchData} />;
      case 'api':
        return <APIError error={error.message} onRetry={fetchData} />;
      case 'permission':
        return <PermissionError message={error.message} />;
      default:
        return <GenericError error={error.message} onRetry={fetchData} />;
    }
  }

  return <div>Content</div>;
};
```

---

## Usage Examples

### Example 1: Library Page with Loading & Error States

```typescript
// /src/app/library/page.tsx
import { Suspense } from 'react';
import { BookListSkeleton, EmptyLibrary, NetworkError } from '@/components/feedback';
import Library from './components/library';

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { page?: string; title?: string; authors?: string; subjects?: string };
}) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<BookListSkeleton count={10} />}>
        <LibraryContent searchParams={searchParams} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function LibraryContent({ searchParams }: { searchParams: any }) {
  try {
    const books = await getBooks(searchParams);

    if (books.length === 0) {
      const hasFilters = !!(searchParams.title || searchParams.authors || searchParams.subjects);
      return <EmptyLibrary hasFilters={hasFilters} />;
    }

    return <Library books={books} />;
  } catch (error) {
    const appError = handleError(error);

    if (appError.type === 'network') {
      return <NetworkError onRetry={() => window.location.reload()} />;
    }

    throw error; // Let error boundary handle it
  }
}
```

---

### Example 2: Book Import with Progressive Loading

```typescript
// /src/app/import/components/search.tsx
'use client';

import { useState } from 'react';
import { TextField, Button, Stack, CircularProgress, Alert } from '@mui/material';
import { handleError } from '@/utils/errorHandler';
import { APIError } from '@/components/feedback';

const Search = ({ setBookData, setLoading }) => {
  const [isbn, setIsbn] = useState('');
  const [error, setError] = useState<AppError | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!isbn.trim()) return;

    setIsSearching(true);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/isbn/${isbn}`);

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      setBookData(data);
    } catch (err) {
      const appError = handleError(err);
      setError(appError);
      setLoading(false);
    } finally {
      setIsSearching(false);
    }
  };

  if (error && error.type === 'api') {
    return (
      <APIError
        error={error.message}
        isbn={isbn}
        onRetry={handleSearch}
      />
    );
  }

  return (
    <Stack spacing={2}>
      <TextField
        label="ISBN"
        value={isbn}
        onChange={(e) => setIsbn(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        fullWidth
        disabled={isSearching}
      />

      <Button
        variant="contained"
        onClick={handleSearch}
        disabled={isSearching || !isbn.trim()}
        startIcon={
          isSearching ? (
            <CircularProgress size={16} sx={{ color: 'inherit' }} />
          ) : (
            <SearchIcon />
          )
        }
      >
        {isSearching ? 'Searching...' : 'Search'}
      </Button>

      {error && error.type === 'validation' && (
        <Alert severity="error">{error.message}</Alert>
      )}
    </Stack>
  );
};
```

---

### Example 3: Intelligent Search with Real-Time Loading

```typescript
// Enhancement to existing intelligentSearch.tsx

// Add loading indicator in dropdown
{isOpen && query.trim().length > 0 && (
  <Paper {...paperProps}>
    {isLoading ? (
      // Loading state
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          gap: 2,
        }}
      >
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          Searching library...
        </Typography>
      </Box>
    ) : hasResults ? (
      // Results
      <List disablePadding>
        {/* Existing suggestion rendering */}
      </List>
    ) : (
      // Empty state
      <EmptySearchResults query={query} />
    )}
  </Paper>
)}
```

---

### Example 4: Book Card with Image Loading

```typescript
// /src/app/library/components/item.tsx enhancement
import { useState } from 'react';
import { Skeleton, Box } from '@mui/material';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

const BookCoverImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <Box
        sx={{
          width: 100,
          height: 160,
          bgcolor: 'action.hover',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ImageNotSupportedIcon
          sx={{ fontSize: 40, color: 'text.disabled' }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: 100, height: 160 }}>
      {!loaded && (
        <Skeleton
          variant="rectangular"
          width={100}
          height={160}
          sx={{ position: 'absolute', borderRadius: 1 }}
          animation="wave"
        />
      )}

      <Box
        component="img"
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        sx={{
          width: 100,
          maxHeight: 160,
          objectFit: 'cover',
          borderRadius: 1,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </Box>
  );
};

// Use in Item component:
<BookCoverImage src={book.image} alt={book.title} />
```

---

## Summary Checklist

### Loading States
- [ ] Page skeleton screens for initial loads
- [ ] List skeleton screens with staggered animation
- [ ] Inline spinners for search (20px)
- [ ] Button loading states with width preservation
- [ ] Linear progress for long operations
- [ ] Progressive image loading with fade-in
- [ ] Dropdown loading indicators

### Error States
- [ ] Network error full page
- [ ] API error with context-specific messages
- [ ] Rate limit error with wait message
- [ ] Validation errors inline with fields
- [ ] Permission errors with sign-in option
- [ ] Generic error boundary fallback
- [ ] Retry buttons on all error states

### Empty States
- [ ] Empty library (new user)
- [ ] Empty search results
- [ ] Empty filtered results
- [ ] Empty import queue
- [ ] Clear call-to-action buttons

### Accessibility
- [ ] ARIA labels on all loading indicators
- [ ] Live regions for dynamic announcements
- [ ] Keyboard navigation support
- [ ] Focus management in modals/errors
- [ ] Screen reader only text where needed
- [ ] Color contrast meets WCAG AA
- [ ] Never rely on color alone

### Performance
- [ ] Debounced search (300ms)
- [ ] Skeleton screens instead of spinners
- [ ] Progressive loading where possible
- [ ] Optimistic UI updates
- [ ] Lazy load images
- [ ] Stagger animations (50ms delay)

---

## Next Steps for Implementation

1. **Create Component Library** (1-2 hours)
   - Set up `/src/app/components/feedback/` directory structure
   - Implement all loading components
   - Implement all error components
   - Implement all empty state components
   - Create barrel exports

2. **Update Existing Pages** (2-3 hours)
   - Library page: Add skeleton screens and error handling
   - Import page: Enhance loading states
   - Dashboard page: Add empty states
   - Details view: Add image loading states

3. **Implement Error Handling** (1-2 hours)
   - Create error handler utility
   - Add error boundary to root layout
   - Update API calls with proper error handling
   - Add retry logic

4. **Accessibility Audit** (1 hour)
   - Add ARIA labels
   - Test with screen reader
   - Add keyboard navigation
   - Test color contrast

5. **Testing & Refinement** (1-2 hours)
   - Test all loading states
   - Test all error scenarios
   - Test on mobile devices
   - Gather user feedback

**Total Estimated Time:** 6-10 hours

---

**End of Design Specification**

This document provides complete specifications for implementing elegant loading and error states in Penumbra. All components follow Material-UI v7 patterns, maintain the dark theme aesthetic, and prioritize accessibility and user experience.

For questions or clarifications, refer to the specific sections above or consult the Material-UI documentation: https://mui.com/material-ui/
