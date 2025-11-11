# Phase 3: Import Flow Implementation Plan
## Material-UI to Tailwind CSS Migration

**Project:** Penumbra - Personal Library Management System
**Phase:** 3 of 5 - Import Flow Migration
**Date:** November 11, 2025
**Branch:** `feature/phase-3-import-flow`
**Estimated Duration:** 2-3 days, 4 PRs

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technical Analysis](#technical-analysis)
3. [MUI → Tailwind Migration Map](#mui--tailwind-migration-map)
4. [PR Breakdown Strategy](#pr-breakdown-strategy)
5. [Testing Strategy](#testing-strategy)
6. [Risk Assessment & Mitigation](#risk-assessment--mitigation)
7. [Implementation Timeline](#implementation-timeline)

---

## Executive Summary

### Current State
The Import Flow is partially migrated to Tailwind CSS:
- **Search component** (search.tsx) - **ALREADY MIGRATED** ✅
  - Uses Tailwind classes, react-hook-form integration
  - Custom input fields, button styling
  - No MUI dependencies
- **Other components** (import.tsx, preview.tsx, queue.tsx, item.tsx) - **Need Migration**
  - Heavy MUI dependencies (Box, Stack, Card, CardContent, etc.)
  - Material icons need replacement with Lucide React
  - Layout components need custom Tailwind implementation

### Migration Goals
1. **Preserve all business logic** - ISBN API integration, form handling, queue management
2. **Maintain functionality** - Duplicate detection, incomplete data warnings, batch import
3. **Match Phase 2 patterns** - Consistent zinc palette, 42px heights, responsive design
4. **Replace MUI components** - Cards, Buttons, Alerts, Modals with Tailwind equivalents
5. **Replace Material Icons** - Use Lucide React icons throughout

### Success Criteria
- [ ] Zero MUI dependencies in import flow
- [ ] All business logic preserved (API calls, validations, state management)
- [ ] Visual consistency with library components from Phase 2
- [ ] Mobile and desktop responsive layouts working
- [ ] Loading states, error states, empty states implemented
- [ ] Accessibility maintained (keyboard navigation, ARIA labels)
- [ ] TypeScript strict mode compliance (no `any` types)

---

## Technical Analysis

### Component Inventory

#### 1. **src/app/import/page.tsx** (Server Component)
**Current State:**
- Simple wrapper, already clean
- No MUI dependencies
- Returns `<Import />` client component

**Complexity:** ⚡ TRIVIAL
**Migration Needed:** ❌ No changes required

---

#### 2. **src/app/import/components/search.tsx** (Client Component)
**Current State:** ✅ **ALREADY MIGRATED TO TAILWIND**
- Uses Tailwind CSS classes throughout
- Custom input and button styling
- react-hook-form Controller integration
- Server action integration (fetchMetadata, checkRecordExists)

**Complexity:** ⚡ TRIVIAL (Already complete)
**Migration Needed:** ❌ No changes required
**Business Logic:**
- ISBN form validation (required field)
- API call to fetchMetadata (ISBNdb)
- Duplicate checking via checkRecordExists
- Form reset after successful submit
- Required fields validation (14 fields)
- Incomplete/duplicate flags on book data

**Patterns to Maintain:**
- react-hook-form with Controller
- Server action integration
- Form reset with useEffect
- Validation logic

---

#### 3. **src/app/import/components/import.tsx** (Client Component)
**Current State:**
```tsx
// MUI Dependencies
import { Box, Stack, useMediaQuery } from "@mui/material";

// Layout
<Stack direction={isMobile ? "column" : "row"}>
  <Box sx={{ width: { xs: "100%", md: "50%" } }}>
    <Search />
    <Preview />
  </Box>
  <Box sx={{ width: { xs: "100%", md: "50%" } }}>
    <Queue />
  </Box>
</Stack>
```

**MUI Components Used:**
- `Box` (2 instances) - Layout containers with responsive width
- `Stack` (1 instance) - Flex container with direction
- `useMediaQuery` (1 instance) - Responsive breakpoint detection

**Complexity:** ⚡ LOW
**Migration Needed:** ✅ Yes - Layout restructure
**Business Logic:**
- State management (bookData, loading, importQueue)
- Two-column responsive layout (50/50 desktop, stacked mobile)
- Breakpoint: 900px (isMobile)

**Tailwind Replacement:**
```tsx
// Replace with custom useMediaQuery hook
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Replace with Tailwind flex layout
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2">
    <Search />
    <Preview />
  </div>
  <div className="w-full md:w-1/2">
    <Queue />
  </div>
</div>
```

**State to Preserve:**
- `bookData: BookImportDataType` - Current book being previewed
- `loading: boolean` - ISBN search loading state
- `importQueue: Array<BookImportDataType>` - Books ready to import

---

#### 4. **src/app/import/components/preview.tsx** (Client Component)
**Current State:**
```tsx
// MUI Dependencies
import {
  Alert,
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";

// Layout Example
<Card sx={{ margin: { xs: "25px", md: "50px" } }}>
  <CardContent>
    <Stack direction="column" spacing={2}>
      <Typography variant={"h6"}>Preview</Typography>
      {book.isIncomplete && <Alert severity="warning">...</Alert>}
      {book.isDuplicate && <Alert severity="warning">...</Alert>}
      <Stack direction="row" spacing={2}>
        <img src={book?.imageOriginal} height={isMobile ? "100px" : "250px"} />
        <div>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="subtitle2">{authors}</Typography>
          <Typography variant="caption">{binding} ✧ {year}</Typography>
        </div>
      </Stack>
      <Button type="submit" variant="contained">Add to queue</Button>
    </Stack>
  </CardContent>
</Card>
```

**MUI Components Used:**
- `Card` + `CardContent` - Container with elevation/shadow
- `Stack` (2 instances) - Vertical and horizontal flex layouts
- `Typography` (4 instances) - Text with variant styling
- `Alert` (2 instances) - Warning messages for incomplete/duplicate
- `Button` (1 instance) - Submit button with contained variant
- `Skeleton` (1 instance) - Loading placeholder for missing image
- `useMediaQuery` (1 instance) - Responsive image sizing

**Complexity:** 🔶 MEDIUM
**Migration Needed:** ✅ Yes - Multiple component replacements
**Business Logic:**
- Title parsing (split on ":" to separate title/subtitle)
- Form submission handler (adds book to importQueue)
- Conditional rendering based on bookData state
- Image fallback to Skeleton if no imageOriginal
- Duplicate/incomplete warnings display
- Mobile responsive image sizing

**Tailwind Replacement:**
```tsx
// Alert → Custom Alert component (already exists in src/components/ui/alert.tsx)
import { Alert, AlertDescription } from '@/components/ui/alert';
<Alert variant="default" className="border-amber-500/50 text-amber-400">
  <AlertDescription>Warning message</AlertDescription>
</Alert>

// Button → Custom Button component
import { Button } from '@/components/ui/button';
<Button type="submit">Add to queue</Button>

// Card → Tailwind div with border/shadow
<div className="border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl">
  <div className="p-6">
    {/* Content */}
  </div>
</div>

// Skeleton → Tailwind loading state
<div className="w-[150px] h-[250px] bg-zinc-800 animate-pulse rounded" />

// Typography → Semantic HTML with Tailwind
<h2 className="text-xl font-semibold text-zinc-100">Preview</h2>
<h3 className="text-lg font-bold text-zinc-100">{title}</h3>
<p className="text-sm text-zinc-400">{authors}</p>
<p className="text-xs text-zinc-500">{binding} ✧ {year}</p>

// Stack → Flex divs
<div className="flex flex-col gap-4">
  <div className="flex flex-row gap-4">
    {/* Content */}
  </div>
</div>
```

**State to Preserve:**
- Form submit handler (adds to queue, resets bookData)
- Conditional rendering logic
- Responsive image sizing (mobile: 100px, desktop: 250px)

---

#### 5. **src/app/import/components/queue.tsx** (Client Component)
**Current State:**
```tsx
// MUI Dependencies
import { Button, Card, CardContent, Typography, CircularProgress, Alert, Snackbar } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Layout Example
<Card sx={{ display: "flex", minWidth: "200px", minHeight: "90vh", margin: { xs: "25px", md: "50px" } }}>
  <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
    <Typography variant="h6">Queue</Typography>
    {error && <Alert severity="error">{error}</Alert>}
    {books?.map((book, i) => <Item key={i} {...book} />)}
    <Button
      onClick={handleSubmit}
      variant="contained"
      disabled={isImporting}
      startIcon={isImporting ? <CircularProgress size={20} /> : null}
    >
      {isImporting ? "Adding..." : "Add to library"}
    </Button>
  </CardContent>
</Card>
<Snackbar open={showSuccess}>
  <Alert severity="success" icon={<CheckCircleIcon />}>
    Books successfully added to your library!
  </Alert>
</Snackbar>
```

**MUI Components Used:**
- `Card` + `CardContent` - Full-height container (90vh)
- `Typography` (1 instance) - Section heading
- `Alert` (2 instances) - Error message and success toast
- `Snackbar` (1 instance) - Success notification modal
- `Button` (1 instance) - Submit button with loading state
- `CircularProgress` (1 instance) - Loading spinner icon
- Material Icon: `CheckCircleIcon` - Success icon

**Complexity:** 🔶 MEDIUM
**Migration Needed:** ✅ Yes - Complex interactions (loading, error, success states)
**Business Logic:**
- Queue management (delete items by index)
- Batch import to database via importBooks server action
- Loading state during import (isImporting)
- Error handling with dismissable alert
- Success notification with auto-dismiss (4s)
- Clean isIncomplete/isDuplicate flags before import
- Empty queue state (grey placeholder box)

**Tailwind Replacement:**
```tsx
// Card → Full-height Tailwind container
<div className="flex min-w-[200px] min-h-[90vh] border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12">
  <div className="flex flex-col flex-1 w-full p-6">
    {/* Content */}
  </div>
</div>

// Alert → Custom Alert component
import { Alert, AlertDescription } from '@/components/ui/alert';
<Alert variant="destructive">
  <AlertDescription>{error}</AlertDescription>
</Alert>

// Button with loading → Custom Button
import { Button } from '@/components/ui/button';
<Button onClick={handleSubmit} disabled={isImporting}>
  {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isImporting ? "Adding..." : "Add to library"}
</Button>

// Snackbar → Custom toast notification (need to create)
// For Phase 3, we can use a simple fixed positioning div
<div className={cn(
  "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
  showSuccess ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
)}>
  <Alert className="border-green-500/50 bg-green-950/50 text-green-400">
    <CheckCircle className="h-4 w-4" />
    <AlertDescription>Books successfully added to your library!</AlertDescription>
  </Alert>
</div>

// Empty state placeholder
<div className="border-2 border-zinc-800 bg-zinc-800/5 m-2.5 rounded-lg flex-1" />
```

**Icons to Replace:**
- `CheckCircleIcon` → Lucide `CheckCircle`
- `CircularProgress` → Lucide `Loader2` with `animate-spin`

**State to Preserve:**
- `isImporting: boolean` - Loading during batch import
- `error: string | null` - Error message display
- `showSuccess: boolean` - Success notification visibility
- handleDelete function (filter by index)
- handleSubmit function (async batch import)

---

#### 6. **src/app/import/components/item.tsx** (Client Component)
**Current State:**
```tsx
// MUI Dependencies
import { Card, IconButton, Tooltip, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";

// Layout Example
<Card sx={{ display: "flex", flexDirection: "row", minHeight: "50px", minWidth: "450px", justifyContent: "space-between" }}>
  <div style={{ display: "inline-flex", justifyItems: "baseline" }}>
    {isIncomplete && (
      <Tooltip title="Incomplete data">
        <IconButton>
          <WarningIcon />
        </IconButton>
      </Tooltip>
    )}
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="subtitle2">{authors.join(", ")}</Typography>
    </div>
  </div>
  <div>
    <IconButton aria-label="delete" onClick={() => handleDelete(itemKey)}>
      <DeleteIcon />
    </IconButton>
  </div>
</Card>
```

**MUI Components Used:**
- `Card` - Horizontal flex card with fixed dimensions
- `Typography` (2 instances) - Title and author text
- `IconButton` (2 instances) - Warning icon and delete button
- `Tooltip` (1 instance) - Hover tooltip for warning
- Material Icons: `DeleteIcon`, `WarningIcon`

**Complexity:** 🔶 MEDIUM
**Migration Needed:** ✅ Yes - Icon buttons and tooltip
**Business Logic:**
- Display book title and authors
- Warning indicator for incomplete data
- Delete button to remove from queue
- Tooltip hover interaction

**Tailwind Replacement:**
```tsx
// Icons → Lucide React
import { Trash2, AlertTriangle } from 'lucide-react';

// Card → Tailwind flex card
<div className="flex flex-row min-h-[50px] border border-zinc-800 rounded-lg bg-zinc-900/50 justify-between items-center px-4 py-2 gap-3">
  <div className="flex items-baseline gap-2">
    {isIncomplete && (
      <button
        type="button"
        className="p-2 hover:bg-zinc-800 rounded-md transition-colors group relative"
        aria-label="Incomplete data"
      >
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        {/* Tooltip on hover */}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-zinc-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Incomplete data
        </span>
      </button>
    )}
    <div className="flex flex-col">
      <h3 className="text-base font-medium text-zinc-100">{title}</h3>
      <p className="text-sm text-zinc-400">{authors.join(", ")}</p>
    </div>
  </div>
  <button
    type="button"
    onClick={() => handleDelete(itemKey)}
    className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
    aria-label="delete"
  >
    <Trash2 className="w-5 h-5 text-zinc-400 hover:text-zinc-100" />
  </button>
</div>
```

**Icons to Replace:**
- `DeleteIcon` → Lucide `Trash2`
- `WarningIcon` → Lucide `AlertTriangle`

**Tooltip Strategy:**
- For Phase 3, use CSS-only tooltip (hover with absolute positioning)
- Alternative: Install Radix UI Tooltip for more robust solution (future enhancement)

**State to Preserve:**
- Props: title, authors, isIncomplete, itemKey, handleDelete
- Delete click handler

---

## MUI → Tailwind Migration Map

### Layout Components

| MUI Component | Tailwind Replacement | Notes |
|---------------|---------------------|-------|
| `Box` | `<div>` with flex/grid classes | Use `className` with responsive utilities |
| `Stack` | `<div>` with `flex` + `gap-*` | `flex-col` or `flex-row`, `gap-2/4/6` |
| `Container` | `<div>` with `max-w-*` + `mx-auto` | Use `max-w-screen-sm` to match Phase 2 |
| `Card` | `<div>` with border/shadow | `border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl` |
| `CardContent` | `<div>` with padding | `p-6` or `p-4` |

### Typography Components

| MUI Component | Tailwind Replacement | Notes |
|---------------|---------------------|-------|
| `Typography variant="h6"` | `<h2 className="text-xl font-semibold">` | Semantic HTML + utility classes |
| `Typography variant="subtitle1"` | `<h3 className="text-lg font-bold">` | Use semantic headings |
| `Typography variant="subtitle2"` | `<p className="text-sm text-zinc-400">` | Body text with muted color |
| `Typography variant="caption"` | `<p className="text-xs text-zinc-500">` | Small helper text |

### Interactive Components

| MUI Component | Tailwind Replacement | Notes |
|---------------|---------------------|-------|
| `Button variant="contained"` | `<Button>` from `src/components/ui/button.tsx` | Custom component already created |
| `IconButton` | `<button>` with padding + icon | `p-2 hover:bg-zinc-800 rounded-md` |
| `TextField` | `<Input>` from `src/components/ui/input.tsx` | Custom component already created |

### Feedback Components

| MUI Component | Tailwind Replacement | Notes |
|---------------|---------------------|-------|
| `Alert severity="warning"` | `<Alert>` with amber colors | `border-amber-500/50 text-amber-400` |
| `Alert severity="error"` | `<Alert variant="destructive">` | Use custom Alert component |
| `Alert severity="success"` | `<Alert>` with green colors | `border-green-500/50 text-green-400` |
| `Snackbar` | Fixed positioned `<div>` with transitions | `fixed bottom-8 left-1/2 -translate-x-1/2 z-50` |
| `CircularProgress` | Lucide `Loader2` with `animate-spin` | `<Loader2 className="animate-spin" />` |
| `Skeleton` | `<div>` with `animate-pulse` | `bg-zinc-800 animate-pulse rounded` |
| `Tooltip` | CSS-only tooltip | Absolute positioned span with group-hover |

### Utility Hooks

| MUI Hook | Tailwind Replacement | Notes |
|----------|---------------------|-------|
| `useMediaQuery("(max-width:900px)")` | `useMediaQuery` from `src/hooks/useMediaQuery.ts` | Custom hook already created |

### Icons

| Material Icon | Lucide React Replacement | Notes |
|---------------|-------------------------|-------|
| `DeleteIcon` | `Trash2` | Matches library component patterns |
| `CheckCircleIcon` | `CheckCircle` | Success indicator |
| `WarningIcon` | `AlertTriangle` | Warning/incomplete indicator |
| `CircularProgress` | `Loader2` | Loading spinner with `animate-spin` |

---

## PR Breakdown Strategy

### PR #1: Import Container Layout
**Branch:** `feature/phase-3-pr1-import-container`
**Estimated Time:** 2-3 hours
**Complexity:** ⚡ LOW

**Files to Modify:**
1. `src/app/import/components/import.tsx` - Main container layout

**Changes:**
- Remove MUI imports (Box, Stack, useMediaQuery from MUI)
- Add custom useMediaQuery import from hooks
- Replace Stack with flex div
- Replace Box components with responsive width divs
- Update breakpoint from 900px to 768px (md: in Tailwind)
- Preserve all state management logic
- Preserve initialBookImportData export

**Testing Requirements:**
- ✅ Two-column layout on desktop (>768px)
- ✅ Stacked layout on mobile (<768px)
- ✅ State flows correctly between components
- ✅ No console errors
- ✅ TypeScript compiles without errors

**Risk:** ⚡ LOW - Simple layout change, no business logic touched

---

### PR #2: Preview Component Migration
**Branch:** `feature/phase-3-pr2-preview`
**Estimated Time:** 3-4 hours
**Complexity:** 🔶 MEDIUM

**Files to Modify:**
1. `src/app/import/components/preview.tsx` - Book preview with form

**Changes:**
- Remove all MUI imports
- Replace Card/CardContent with Tailwind div
- Replace Typography with semantic HTML (h2, h3, p)
- Replace Alert with custom Alert component
- Replace Button with custom Button component
- Replace Skeleton with Tailwind loading div
- Update responsive image sizing (mobile: 100px, desktop: 250px)
- Preserve form submission logic
- Preserve title parsing logic
- Preserve conditional rendering (isIncomplete, isDuplicate)
- Update margin/padding to match Phase 2 (my-6 sm:my-12, p-6)

**New Imports:**
```tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AlertTriangle, AlertCircle } from 'lucide-react';
```

**Alert Styling:**
- Warning (incomplete): `border-amber-500/50 text-amber-400`
- Warning (duplicate): `border-amber-500/50 text-amber-400`
- Use AlertTriangle icon for incomplete
- Use AlertCircle icon for duplicate

**Testing Requirements:**
- ✅ Preview displays correctly when bookData populated
- ✅ Incomplete warning shows when book.isIncomplete is true
- ✅ Duplicate warning shows when book.isDuplicate is true
- ✅ Image displays at correct size (responsive)
- ✅ Skeleton shows when no imageOriginal
- ✅ "Add to queue" button works (adds to importQueue)
- ✅ Form resets after submission
- ✅ Mobile and desktop layouts both work
- ✅ No TypeScript errors

**Risk:** 🔶 MEDIUM - Multiple component replacements, but form logic preserved

---

### PR #3: Queue Component Migration
**Branch:** `feature/phase-3-pr3-queue`
**Estimated Time:** 4-5 hours
**Complexity:** 🔶 MEDIUM-HIGH

**Files to Modify:**
1. `src/app/import/components/queue.tsx` - Import queue with batch operations

**Changes:**
- Remove all MUI imports
- Remove Material Icons import
- Replace Card/CardContent with full-height Tailwind container
- Replace Typography with semantic HTML
- Replace Alert (error) with custom Alert component
- Replace Button with custom Button component
- Replace CircularProgress with Lucide Loader2
- Replace Snackbar with custom toast notification
- Replace CheckCircleIcon with Lucide CheckCircle
- Preserve all business logic (handleDelete, handleSubmit, importBooks)
- Preserve error handling and success notification
- Preserve empty state rendering
- Update spacing to match Phase 2

**New Imports:**
```tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
```

**Toast Notification Implementation:**
```tsx
// Success toast (replaces Snackbar)
<div className={cn(
  "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
  showSuccess ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
)}>
  <Alert className="border-green-500/50 bg-green-950/50 text-green-400 shadow-xl">
    <CheckCircle className="h-4 w-4" />
    <AlertDescription>Books successfully added to your library!</AlertDescription>
  </Alert>
</div>

// Auto-dismiss with useEffect (preserve existing 4s timeout)
useEffect(() => {
  if (showSuccess) {
    const timer = setTimeout(() => setShowSuccess(false), 4000);
    return () => clearTimeout(timer);
  }
}, [showSuccess]);
```

**Button Loading State:**
```tsx
<Button onClick={handleSubmit} disabled={isImporting} className="w-1/2 self-end">
  {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isImporting ? "Adding..." : "Add to library"}
</Button>
```

**Testing Requirements:**
- ✅ Queue displays all books from importQueue
- ✅ Delete button removes book from queue (updates state)
- ✅ "Add to library" button triggers importBooks server action
- ✅ Loading state shows during import (button disabled, spinner visible)
- ✅ Error alert displays when import fails
- ✅ Success toast displays when import succeeds
- ✅ Success toast auto-dismisses after 4 seconds
- ✅ Queue clears after successful import
- ✅ Empty state shows when queue is empty
- ✅ Error alert is dismissable (X button)
- ✅ No TypeScript errors
- ✅ Server action completes successfully

**Risk:** 🔶 MEDIUM-HIGH - Complex interactions (loading, error, success states), server action integration

---

### PR #4: Queue Item Component Migration
**Branch:** `feature/phase-3-pr4-queue-item`
**Estimated Time:** 2-3 hours
**Complexity:** 🔶 MEDIUM

**Files to Modify:**
1. `src/app/import/components/item.tsx` - Individual queue item card

**Changes:**
- Remove all MUI imports
- Remove Material Icons imports
- Replace Card with Tailwind horizontal flex card
- Replace Typography with semantic HTML
- Replace IconButton with custom button
- Replace Tooltip with CSS-only tooltip
- Replace DeleteIcon with Lucide Trash2
- Replace WarningIcon with Lucide AlertTriangle
- Preserve delete functionality
- Preserve warning display logic
- Update styling to match library item.tsx patterns from Phase 2

**New Imports:**
```tsx
import { Trash2, AlertTriangle } from 'lucide-react';
```

**CSS-Only Tooltip Implementation:**
```tsx
<button
  type="button"
  className="p-2 hover:bg-zinc-800 rounded-md transition-colors group relative"
  aria-label="Incomplete data"
>
  <AlertTriangle className="w-5 h-5 text-amber-500" />
  {/* Tooltip */}
  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-zinc-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
    Incomplete data
  </span>
</button>
```

**Card Styling:**
```tsx
<div className="flex flex-row min-h-[50px] border border-zinc-800 rounded-lg bg-zinc-900/50 justify-between items-center px-4 py-2 gap-3 hover:border-zinc-700 transition-colors">
  {/* Content */}
</div>
```

**Testing Requirements:**
- ✅ Item displays book title and authors
- ✅ Warning icon shows when isIncomplete is true
- ✅ Tooltip appears on warning icon hover
- ✅ Delete button removes item from queue
- ✅ Delete button has hover state
- ✅ Card has hover state (border color change)
- ✅ Mobile responsive (text truncates if needed)
- ✅ Keyboard accessible (focus states)
- ✅ No TypeScript errors

**Risk:** 🔶 MEDIUM - Tooltip implementation, icon replacements

---

## Testing Strategy

### Unit Testing
**Not required for this phase** - Focus on manual integration testing

### Manual Testing Checklist

#### PR #1: Import Container
- [ ] Desktop layout (>768px): Two columns side-by-side
- [ ] Mobile layout (<768px): Stacked vertically
- [ ] State flows between Search, Preview, Queue components
- [ ] No visual regressions
- [ ] TypeScript compiles

#### PR #2: Preview Component
- [ ] ISBN search returns data to preview
- [ ] Preview displays book metadata correctly
- [ ] Incomplete warning appears when data missing
- [ ] Duplicate warning appears for existing books
- [ ] Image loads correctly (or skeleton shows)
- [ ] "Add to queue" button adds book to queue state
- [ ] Preview clears after adding to queue
- [ ] Responsive sizing works (mobile vs desktop)

#### PR #3: Queue Component
- [ ] Queue displays all books added from preview
- [ ] Books render with correct data
- [ ] Delete button removes book from queue
- [ ] "Add to library" button triggers import
- [ ] Loading state shows during import (spinner, disabled button)
- [ ] Error alert shows if import fails
- [ ] Success toast shows after successful import
- [ ] Success toast auto-dismisses after 4s
- [ ] Queue clears after successful import
- [ ] Empty state shows when queue is empty

#### PR #4: Queue Item
- [ ] Item displays book title and authors
- [ ] Warning icon shows for incomplete books
- [ ] Tooltip shows on warning icon hover
- [ ] Delete button removes item from queue
- [ ] Hover states work (button, card border)
- [ ] Keyboard navigation works (focus states)

### End-to-End Testing Workflow
**Complete import flow from start to finish:**

1. Navigate to /import page
2. Enter ISBN: `9780316769174` (valid test ISBN)
3. Submit search form
4. Verify preview displays book data
5. Click "Add to queue" button
6. Verify book appears in queue
7. Add 2-3 more books to queue
8. Click delete on one queue item
9. Verify item removed from queue
10. Click "Add to library" button
11. Verify loading state shows
12. Verify success toast appears
13. Verify queue clears
14. Navigate to /library
15. Verify books were imported successfully

### Edge Cases to Test

#### Search Component (Already Migrated)
- [ ] Empty ISBN submission (validation)
- [ ] Invalid ISBN (API error handling)
- [ ] Network timeout (API error handling)
- [ ] Duplicate detection works correctly

#### Preview Component
- [ ] Book with no image (skeleton fallback)
- [ ] Book with title containing ":" (subtitle parsing)
- [ ] Book with long title (text truncation)
- [ ] Book with many authors (display formatting)
- [ ] Incomplete data warning (missing required fields)
- [ ] Duplicate book warning (already in library)

#### Queue Component
- [ ] Empty queue (placeholder shows)
- [ ] Single book in queue
- [ ] Many books in queue (10+ items, scroll behavior)
- [ ] Delete last item in queue
- [ ] Import failure (error alert)
- [ ] Import success (toast notification)
- [ ] Rapid clicking "Add to library" (disabled state)

#### Queue Item Component
- [ ] Book with very long title (text overflow)
- [ ] Book with many authors (text overflow)
- [ ] Incomplete book (warning icon)
- [ ] Complete book (no warning icon)
- [ ] Tooltip shows on hover
- [ ] Delete button keyboard accessible

### Accessibility Testing

**Keyboard Navigation:**
- [ ] Tab through all interactive elements (buttons, inputs)
- [ ] Enter/Space activates buttons
- [ ] Focus visible on all interactive elements

**Screen Reader:**
- [ ] All buttons have proper aria-labels
- [ ] Alerts have role="alert"
- [ ] Loading states announced
- [ ] Error messages announced
- [ ] Success messages announced

**Visual:**
- [ ] Color contrast meets WCAG AA (text on backgrounds)
- [ ] Focus indicators visible
- [ ] Interactive elements have hover states
- [ ] Text readable at 200% zoom

### Performance Testing
- [ ] Import page loads quickly (<2s)
- [ ] ISBN search completes quickly (<3s)
- [ ] Batch import completes quickly (<5s for 5 books)
- [ ] No layout shift (CLS)
- [ ] Smooth transitions and animations (60fps)

---

## Risk Assessment & Mitigation

### High Risk Areas

#### 1. **Toast Notification Implementation (PR #3)**
**Risk:** Snackbar replacement may not match MUI behavior exactly
- **Severity:** MEDIUM
- **Mitigation:**
  - Use simple fixed positioning with CSS transitions
  - Test auto-dismiss timing (4s preserved)
  - Ensure z-index prevents overlap with other content
  - Future: Consider installing Radix UI Toast for robust solution

#### 2. **Server Action Integration (PR #3)**
**Risk:** importBooks server action may fail if data format changes
- **Severity:** HIGH
- **Mitigation:**
  - Preserve exact data cleaning logic (remove isIncomplete, isDuplicate)
  - Test with actual database connection
  - Verify BookImportDataType interface unchanged
  - Add error logging for debugging

#### 3. **State Management (All PRs)**
**Risk:** Breaking state flow between Search → Preview → Queue
- **Severity:** HIGH
- **Mitigation:**
  - Do not modify state structure or prop drilling
  - Test each PR independently before merging
  - Verify state updates propagate correctly
  - Add console.log for debugging if issues arise

### Medium Risk Areas

#### 4. **Responsive Breakpoints (PR #1, PR #2)**
**Risk:** Breakpoint change from 900px to 768px may affect UX
- **Severity:** MEDIUM
- **Mitigation:**
  - Test on multiple screen sizes (mobile, tablet, desktop)
  - Use Tailwind standard breakpoint (md: 768px) for consistency
  - Verify layout doesn't break at edge cases (767px, 769px)

#### 5. **Tooltip Implementation (PR #4)**
**Risk:** CSS-only tooltip may not work on mobile (no hover)
- **Severity:** LOW-MEDIUM
- **Mitigation:**
  - Test on actual mobile device (not just browser DevTools)
  - Consider adding click/tap behavior for mobile
  - Ensure aria-label provides same information for screen readers
  - Future: Upgrade to Radix UI Tooltip if needed

#### 6. **Icon Replacements (PR #3, PR #4)**
**Risk:** Lucide icons may not match Material Design aesthetic
- **Severity:** LOW
- **Mitigation:**
  - Use similar icons (Trash2 ≈ Delete, AlertTriangle ≈ Warning)
  - Adjust icon sizes to match (w-4 h-4 or w-5 h-5)
  - Test icon colors for visibility (zinc-400, amber-500, etc.)

### Low Risk Areas

#### 7. **Layout Styling (All PRs)**
**Risk:** Visual inconsistency with Phase 2 library components
- **Severity:** LOW
- **Mitigation:**
  - Reference Phase 2 patterns for consistency
  - Use established spacing (gap-4, p-6, my-6 sm:my-12)
  - Use established colors (zinc-900/50 backgrounds, zinc-800 borders)
  - Use established heights (42px for inputs/buttons where applicable)

#### 8. **TypeScript Errors (All PRs)**
**Risk:** Type mismatches after removing MUI imports
- **Severity:** LOW
- **Mitigation:**
  - Run `npm run build` after each PR
  - Use existing types (BookImportDataType, etc.)
  - Add explicit types where needed
  - Verify strict mode compliance

---

## Implementation Timeline

### Day 1: Container & Preview (PR #1 & #2)
**Morning (2-3 hours):**
- [ ] Create PR #1 branch
- [ ] Migrate import.tsx container
- [ ] Test responsive layout
- [ ] Commit and push PR #1
- [ ] Create PR on GitHub

**Afternoon (3-4 hours):**
- [ ] Create PR #2 branch
- [ ] Migrate preview.tsx component
- [ ] Replace all MUI components
- [ ] Test preview functionality
- [ ] Test warning alerts (incomplete, duplicate)
- [ ] Commit and push PR #2
- [ ] Create PR on GitHub

**Evening:**
- [ ] Manual testing of PR #1 + PR #2 together
- [ ] Fix any issues found
- [ ] Request review (if applicable)

---

### Day 2: Queue Component (PR #3)
**Morning (2-3 hours):**
- [ ] Create PR #3 branch
- [ ] Migrate queue.tsx component
- [ ] Replace Card/CardContent
- [ ] Replace Button with loading state
- [ ] Replace error Alert

**Afternoon (2-3 hours):**
- [ ] Implement toast notification (Snackbar replacement)
- [ ] Replace CircularProgress with Loader2
- [ ] Replace CheckCircleIcon with CheckCircle
- [ ] Test batch import functionality
- [ ] Test error handling
- [ ] Test success notification

**Evening:**
- [ ] End-to-end testing (search → preview → queue → import)
- [ ] Test with multiple books (5-10 items)
- [ ] Test error scenarios
- [ ] Commit and push PR #3
- [ ] Create PR on GitHub

---

### Day 3: Queue Item & Final Testing (PR #4)
**Morning (2-3 hours):**
- [ ] Create PR #4 branch
- [ ] Migrate item.tsx component
- [ ] Replace Card with Tailwind div
- [ ] Replace IconButton with custom buttons
- [ ] Implement CSS-only tooltip
- [ ] Replace Material Icons with Lucide

**Afternoon (2 hours):**
- [ ] Test queue item functionality
- [ ] Test delete button
- [ ] Test warning tooltip
- [ ] Test hover states
- [ ] Commit and push PR #4
- [ ] Create PR on GitHub

**Evening (2-3 hours):**
- [ ] Final end-to-end testing (all PRs together)
- [ ] Accessibility audit (keyboard, screen reader)
- [ ] Performance testing
- [ ] Visual regression check
- [ ] Update documentation (CLAUDE_PROGRESS.md)
- [ ] Request final review

---

### Day 4 (Optional): Cleanup & Polish
**If needed for fixes or enhancements:**
- [ ] Address any PR feedback
- [ ] Fix bugs found in testing
- [ ] Polish animations/transitions
- [ ] Final verification build
- [ ] Merge PRs to main

---

## Success Criteria Checklist

### Functional Requirements
- [ ] ISBN search works correctly (already complete)
- [ ] Book preview displays all metadata
- [ ] "Add to queue" adds books to queue state
- [ ] Queue displays all queued books
- [ ] Delete button removes books from queue
- [ ] Batch import triggers importBooks server action
- [ ] Books successfully saved to database
- [ ] Success notification shows after import
- [ ] Queue clears after successful import
- [ ] Error handling works for API failures

### Visual Requirements
- [ ] All MUI components removed from import flow
- [ ] Consistent zinc palette (zinc-900/50, zinc-800, etc.)
- [ ] Consistent spacing (gap-4, p-6, my-6 sm:my-12)
- [ ] Consistent typography (text-xl, text-lg, text-sm, text-xs)
- [ ] Consistent border radius (rounded-lg)
- [ ] Lucide icons match Phase 2 patterns
- [ ] Hover states on all interactive elements
- [ ] Loading states (skeleton, spinner)
- [ ] Warning states (amber colors)
- [ ] Error states (red colors)
- [ ] Success states (green colors)

### Responsive Requirements
- [ ] Desktop layout (>768px): Two columns side-by-side
- [ ] Mobile layout (<768px): Stacked vertically
- [ ] Image sizing responsive (100px mobile, 250px desktop)
- [ ] Text truncates appropriately on small screens
- [ ] Buttons full-width on mobile (where appropriate)
- [ ] Touch targets large enough (min 44x44px)

### Accessibility Requirements
- [ ] All buttons have aria-labels
- [ ] Keyboard navigation works throughout
- [ ] Focus visible on all interactive elements
- [ ] Alerts have proper ARIA roles
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader announces loading states
- [ ] Screen reader announces error messages
- [ ] Screen reader announces success messages
- [ ] Tooltips have text alternatives (aria-label)

### Technical Requirements
- [ ] TypeScript strict mode compliance (no `any` types)
- [ ] No MUI imports remaining in import flow components
- [ ] All Material Icons replaced with Lucide React
- [ ] Custom useMediaQuery hook used instead of MUI
- [ ] Custom Button component used throughout
- [ ] Custom Input component used throughout
- [ ] Custom Alert component used throughout
- [ ] No console errors in browser
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors

### Business Logic Preservation
- [ ] ISBN API integration unchanged
- [ ] Duplicate detection unchanged (checkRecordExists)
- [ ] Incomplete data validation unchanged (14 required fields)
- [ ] Form validation unchanged (required field)
- [ ] State management unchanged (bookData, loading, importQueue)
- [ ] Delete functionality unchanged (filter by index)
- [ ] Import functionality unchanged (importBooks server action)
- [ ] Data cleaning unchanged (remove isIncomplete, isDuplicate)
- [ ] Title parsing unchanged (split on ":")
- [ ] Form reset unchanged (useEffect on formState.isSubmitSuccessful)

---

## Component Dependencies

### Import Flow Component Tree
```
page.tsx (Server Component)
  └─ import.tsx (Client Component) [PR #1]
       ├─ search.tsx (Client Component) [Already Migrated ✅]
       ├─ preview.tsx (Client Component) [PR #2]
       └─ queue.tsx (Client Component) [PR #3]
            └─ item.tsx (Client Component) [PR #4]
```

### State Flow
```
search.tsx
  ├─ setBookData() → preview.tsx receives book data
  └─ setLoading() → preview.tsx shows loading state

preview.tsx
  ├─ book prop from import.tsx bookData state
  ├─ setBookData() → clears preview after adding to queue
  └─ setImportQueue() → adds book to queue

queue.tsx
  ├─ books prop from import.tsx importQueue state
  ├─ setBooks() → removes items or clears after import
  └─ handleSubmit() → calls importBooks server action

item.tsx
  ├─ Props from queue.tsx map function
  └─ handleDelete() callback from queue.tsx
```

### External Dependencies
```
Server Actions:
  - fetchMetadata() → src/utils/actions/isbndb/fetchMetadata.ts
  - checkRecordExists() → src/utils/actions/books.ts
  - importBooks() → src/utils/actions/books.ts

Types:
  - BookImportDataType → src/shared.types.ts
  - initialBookImportData → src/app/import/components/import.tsx

Custom Components:
  - Button → src/components/ui/button.tsx
  - Input → src/components/ui/input.tsx
  - Alert → src/components/ui/alert.tsx

Custom Hooks:
  - useMediaQuery → src/hooks/useMediaQuery.ts

Utilities:
  - cn() → src/lib/utils.ts

External Packages:
  - react-hook-form (Controller, useForm, SubmitHandler)
  - lucide-react (icons)
```

---

## Documentation Updates Required

### After Phase 3 Completion

**Files to Update:**
1. `CLAUDE_PROGRESS.md`
   - Add Phase 3 completion details
   - Update PR links
   - Document any issues encountered
   - Update next steps

2. `docs/migration/portfolio-styling/README.md`
   - Mark Phase 3 as complete
   - Update success criteria checklist
   - Note any deviations from plan

3. `docs/design-specs/IMPLEMENTATION-CHECKLIST.md` (if exists)
   - Check off import flow components
   - Update component status

---

## Notes for Implementation

### Code Style Consistency
- Use same spacing patterns as Phase 2 (gap-4, p-6, my-6 sm:my-12)
- Use same color palette as Phase 2 (zinc-900/50, zinc-800, zinc-100, zinc-400, zinc-500)
- Use same border radius (rounded-lg)
- Use same transitions (transition-colors, duration-200)
- Use same hover states (hover:bg-zinc-800, hover:border-zinc-700)

### Component Patterns from Phase 2
Reference these files for consistency:
- `src/app/library/components/item.tsx` - Card styling, hover states
- `src/app/library/components/gridItem.tsx` - Image loading, skeleton
- `src/app/library/components/details.tsx` - Modal/overlay patterns
- `src/app/library/components/filters.tsx` - Button styling
- `src/components/ui/button.tsx` - Button variants
- `src/components/ui/alert.tsx` - Alert styling

### Preserving Business Logic
**Do NOT modify:**
- Server action calls (fetchMetadata, checkRecordExists, importBooks)
- State management logic (useState, useEffect)
- Form validation (react-hook-form Controller, rules)
- Data transformations (title parsing, data cleaning)
- API integration (headers, fetch, error handling)

**Only modify:**
- Visual components (MUI → Tailwind)
- Layout structure (Box/Stack → div)
- Typography (Typography → semantic HTML)
- Icons (Material → Lucide)
- Styling (sx prop → className)

### Future Enhancements (Out of Scope for Phase 3)
- Radix UI Tooltip (upgrade from CSS-only)
- Radix UI Toast (upgrade from custom toast)
- Drag-and-drop reordering in queue
- Edit book data in preview
- Multiple ISBN batch search
- Image upload/replace
- Advanced validation (ISBN format checking)
- Undo delete from queue

---

## Conclusion

Phase 3 will successfully migrate the Import Flow from Material-UI to Tailwind CSS while preserving all business logic and functionality. The 4-PR strategy isolates changes for easier review and testing. Each PR builds on the previous, with careful attention to state management and server action integration.

**Key Success Factors:**
1. Preserve all business logic (no changes to server actions, validations, state management)
2. Follow Phase 2 patterns for visual consistency
3. Test thoroughly at each PR (manual testing sufficient)
4. Reference existing Tailwind components (Button, Input, Alert)
5. Use Lucide React icons consistently
6. Maintain accessibility standards (keyboard nav, ARIA labels, focus states)

**Estimated Timeline:** 2-3 days (8-12 hours total implementation + testing)

**Next Phase:** Phase 4 - Cleanup & MUI Removal (final dependency removal, build verification)

---

**Document Version:** 1.0
**Created:** November 11, 2025
**Author:** Frontend Developer (Claude Sonnet 4.5)
**Status:** Ready for Implementation
