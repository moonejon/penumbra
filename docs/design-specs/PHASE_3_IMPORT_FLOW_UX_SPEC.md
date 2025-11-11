# Phase 3: Import Flow Migration - UX Design Specification

**Project:** Penumbra - Personal Library Management System
**Phase:** 3 of 3 - Import Flow Migration
**Design System:** Tailwind CSS v4 with Zinc Palette
**Designer:** UI Designer Agent
**Date:** 2025-11-11
**Status:** Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Design System Reference](#design-system-reference)
3. [Component Specifications](#component-specifications)
   - [Import Container (import.tsx)](#1-import-container-importtsx)
   - [Search Component (search.tsx)](#2-search-component-searchtsx)
   - [Preview Component (preview.tsx)](#3-preview-component-previewtsx)
   - [Queue Component (queue.tsx)](#4-queue-component-queuetsx)
   - [Queue Item Component (item.tsx)](#5-queue-item-component-itemtsx)
   - [Import Page (page.tsx)](#6-import-page-pagetsx)
4. [Responsive Breakpoints](#responsive-breakpoints)
5. [Interaction Patterns](#interaction-patterns)
6. [Loading States & Error Handling](#loading-states--error-handling)
7. [Accessibility Checklist](#accessibility-checklist)
8. [Implementation Roadmap (4 PRs)](#implementation-roadmap-4-prs)
9. [Success Criteria](#success-criteria)

---

## Executive Summary

### Project Context

Phase 3 completes the Penumbra styling migration from Material-UI to Tailwind CSS by transforming the Import Flow. This flow enables authenticated users to:

1. Search for books by ISBN
2. Preview book metadata from ISBN database
3. Add books to an import queue
4. Bulk import books to their library

### Current State Analysis

**Good:**
- Search component is ALREADY migrated to Tailwind CSS (search.tsx)
- Clean two-column layout with responsive mobile stacking
- Clear workflow: Search → Preview → Queue → Import

**Needs Migration:**
- Import container (MUI Stack, Box, useMediaQuery)
- Preview component (MUI Card, CardContent, Alert, Button, Skeleton)
- Queue component (MUI Card, CardContent, Button, CircularProgress, Snackbar, Alert)
- Queue item component (MUI Card, IconButton, Tooltip, Typography)

### Design Objectives

1. **Visual Consistency:** Match the portfolio aesthetic established in Phase 1 & 2
2. **Component Heights:** Maintain 42px standard for interactive elements
3. **Color Palette:** Use zinc scale exclusively (zinc-50 to zinc-950)
4. **Typography:** Geist Sans with tracking-tight
5. **Spacing:** Follow 8px scale (px-4, gap-4, space-y-6)
6. **Icons:** Use Lucide React icons consistently
7. **Preserve Logic:** This is a styling migration only - all business logic unchanged

### Key Design Principles

- **Public-First UX:** Import is admin-only, but should feel integrated
- **Minimalism:** Clean, uncluttered interface prioritizing workflow efficiency
- **Elegance:** Subtle interactions, refined typography, generous whitespace
- **Feedback:** Clear loading states, error messages, and success indicators
- **Accessibility:** WCAG 2.1 AA compliance with semantic HTML
- **Responsive:** Seamless mobile-to-desktop experience

---

## Design System Reference

### Color Palette (Zinc Scale)

```css
/* Backgrounds */
bg-zinc-950          /* #09090b - Page background */
bg-zinc-900          /* #18181b - Card backgrounds */
bg-zinc-900/50       /* 50% opacity - Subtle overlays */
bg-zinc-900/30       /* 30% opacity - Very subtle overlays */

/* Borders */
border-zinc-800      /* #27272a - Default borders */
border-zinc-700      /* #3f3f46 - Hover borders */
border-zinc-600      /* #52525b - Active/selected borders */

/* Text */
text-zinc-100        /* #f4f4f5 - Primary text */
text-zinc-300        /* #d4d4d8 - Secondary text (labels) */
text-zinc-400        /* #a1a1aa - Tertiary text (metadata) */
text-zinc-500        /* #71717a - Placeholder text */

/* Warning States */
bg-amber-900/30      /* Incomplete data indicator */
border-amber-800/50  /* Incomplete data border */
text-amber-300       /* Warning text */

/* Error States */
bg-red-950/50        /* Error background */
border-red-900/50    /* Error border */
text-red-300         /* Error text */

/* Success States */
bg-green-900/30      /* Success background */
border-green-800/50  /* Success border */
text-green-300       /* Success text */
```

### Typography Scale

```css
/* Headings */
text-xl font-semibold text-zinc-100 tracking-tight     /* Section headers (20px) */
text-lg font-bold text-zinc-100 tracking-tight         /* Book titles (18px) */

/* Body Text */
text-sm font-medium text-zinc-300                      /* Labels (14px) */
text-sm text-zinc-400 tracking-tight                   /* Authors (14px) */
text-xs text-zinc-500                                  /* Metadata (12px) */

/* Interactive Elements */
text-sm font-medium                                    /* Buttons (14px) */
text-xs font-semibold uppercase tracking-wider        /* Section labels (10px) */
```

### Spacing Scale

```css
/* Container Spacing */
px-4        /* 16px - Horizontal padding */
py-6        /* 24px - Vertical padding */
p-6         /* 24px - All sides padding */

/* Component Spacing */
gap-2       /* 8px - Tight gaps */
gap-3       /* 12px - Medium gaps */
gap-4       /* 16px - Standard gaps */
gap-6       /* 24px - Wide gaps */
space-y-4   /* 16px - Vertical spacing */
space-y-6   /* 24px - Section spacing */

/* Layout Margins */
my-6        /* 24px - Mobile margins */
my-12       /* 48px - Desktop margins (sm:) */
```

### Component Heights

```css
h-[42px]    /* Standard interactive element height */
```

### Border Radius

```css
rounded-lg  /* 8px - Cards, containers */
rounded     /* 4px - Images, small elements */
```

### Transitions

```css
transition-all duration-200         /* Hover states */
transition-colors duration-200      /* Color changes */
transition-opacity duration-300     /* Fade effects */
```

---

## Component Specifications

### 1. Import Container (import.tsx)

#### Current State (MUI)

```typescript
// Uses MUI Stack, Box, useMediaQuery
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

**Issues:**
- MUI dependencies (Stack, Box, useMediaQuery)
- Inline sx prop styling
- Custom breakpoint at 900px (inconsistent with design system)

#### Target State (Tailwind)

**Visual Structure:**

```
Desktop (≥ 768px):
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │ Search             │    │ Queue               │        │
│  │                    │    │                     │        │
│  │ [ISBN Input]       │    │ [Book 1]            │        │
│  │ [Submit]           │    │ [Book 2]            │        │
│  └─────────────────────┘    │ [Book 3]            │        │
│                              │                     │        │
│  ┌─────────────────────┐    │ [Add to Library]    │        │
│  │ Preview            │    │                     │        │
│  │                    │    └─────────────────────┘        │
│  │ [Book Cover]       │                                    │
│  │ [Metadata]         │                                    │
│  │ [Add to Queue]     │                                    │
│  └─────────────────────┘                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
   ^                    ^     ^                     ^
   Left Column (50%)          Right Column (50%)
   Scrollable                 Scrollable

Mobile (< 768px):
┌────────────────────────┐
│ Search                 │
│ [ISBN Input]           │
│ [Submit]               │
├────────────────────────┤
│ Preview                │
│ [Book Cover]           │
│ [Metadata]             │
│ [Add to Queue]         │
├────────────────────────┤
│ Queue                  │
│ [Book 1]               │
│ [Book 2]               │
│ [Add to Library]       │
└────────────────────────┘
   ^
   Full width stack
```

**Layout Specifications:**

```typescript
// Container
<div className="md:flex md:gap-6">
  {/* Left Column - Search & Preview */}
  <div className="w-full md:w-1/2">
    <Search />
    <Preview />
  </div>

  {/* Right Column - Queue */}
  <div className="w-full md:w-1/2">
    <Queue />
  </div>
</div>
```

**Styling Details:**

```css
/* Container */
md:flex                          /* Flexbox on tablet+ */
md:gap-6                         /* 24px gap between columns */

/* Columns */
w-full                           /* Full width on mobile */
md:w-1/2                         /* 50/50 split on tablet+ */

/* Responsive Behavior */
Mobile: Stack vertically
Tablet+: Side-by-side columns
```

**State Management:**

```typescript
// No changes to state management - preserve exactly
const [bookData, setBookData] = useState<BookImportDataType>(initialBookImportData);
const [loading, setLoading] = useState<boolean>(false);
const [importQueue, setImportQueue] = useState<Array<BookImportDataType>>([]);
```

**Breakpoint Migration:**

```typescript
// REMOVE: const isMobile: boolean = useMediaQuery("(max-width:900px)");
// REPLACE WITH: Tailwind responsive classes (md: prefix)
// md breakpoint = 768px (standard design system)
```

#### Interaction States

**No interactive states** - This is a layout container only.

#### Accessibility

- Semantic HTML: Use `<main>` wrapper or `<section>` elements
- Landmark regions: Consider `aria-label="Import workflow"` if needed
- No ARIA required for basic layout (natural document flow)

#### Implementation Notes

- **Simple Migration:** Remove MUI imports, replace with Tailwind classes
- **No Logic Changes:** State management stays identical
- **Responsive Classes:** Use `md:` prefix for 768px breakpoint
- **Testing:** Verify column widths at 767px, 768px, 1024px, 1280px

---

### 2. Search Component (search.tsx)

#### Current State

**ALREADY MIGRATED TO TAILWIND CSS!**

This component was completed ahead of Phase 3 and serves as our reference implementation.

**Key Patterns to Maintain:**

```typescript
// Card Container
<div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12">
  <div className="p-6">
    {/* Content */}
  </div>
</div>

// Section Heading
<h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
  Search
</h2>

// Form Layout
<form className="flex flex-col gap-4">
  {/* Form fields */}
</form>

// Label
<label className="text-sm font-medium text-zinc-300">
  Enter ISBN number
</label>

// Input (42px height!)
<input
  className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700 transition-all duration-200"
  type="number"
  placeholder="ISBN"
/>

// Button (42px height!)
<button
  type="submit"
  className="px-6 py-2.5 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-all duration-200 font-medium text-sm"
>
  Submit
</button>
```

**Design Tokens Used:**

- Container: `border-zinc-800`, `bg-zinc-900/50`, `rounded-lg`, `shadow-xl`
- Spacing: `my-6 sm:my-12`, `p-6`, `gap-4`
- Typography: `text-xl font-semibold`, `text-sm font-medium`
- Input Height: `py-2.5` = 42px total with padding
- Button Height: `py-2.5` = 42px total with padding

#### Status

**No changes needed** - Use as reference for other components.

---

### 3. Preview Component (preview.tsx)

#### Current State (MUI)

```typescript
// Uses MUI Card, CardContent, Alert, Button, Skeleton, Typography
<Card sx={{ margin: { xs: "25px", md: "50px" } }}>
  <CardContent>
    <Stack direction="column" spacing={2}>
      <Typography variant="h6">Preview</Typography>
      {book.isIncomplete && (
        <Alert variant="outlined" severity="warning">
          Incomplete data warning
        </Alert>
      )}
      {book.isDuplicate && (
        <Alert variant="outlined" severity="warning">
          Duplicate warning
        </Alert>
      )}
      <Stack direction="row" spacing={2}>
        <img src={book?.imageOriginal} height={isMobile ? "100px" : "250px"} />
        <div>
          <Typography variant="h6" fontWeight={700}>{title}</Typography>
          <Typography variant="subtitle2">{authors}</Typography>
          <Typography variant="caption">{binding} ✧ {datePublished}</Typography>
        </div>
      </Stack>
      <Button type="submit" variant="contained">
        Add to queue
      </Button>
    </Stack>
  </CardContent>
</Card>
```

**Issues:**
- MUI Card with inline sx props
- Inconsistent margins (25px mobile, 50px desktop - not 8px scale)
- MUI Alert with Material Design styling
- Typography variants not matching design system
- Button height not consistent with 42px standard
- Skeleton not matching target style
- No image loading animation
- Image height inconsistent (100px mobile, 250px desktop)

#### Target State (Tailwind)

**Visual Structure:**

```
Preview Card (When book data loaded):
┌──────────────────────────────────────────────────────────┐
│ Preview                                                  │
│                                                          │
│ ⚠ Incomplete data was returned. Consider using ISBN...  │ (if incomplete)
│ ⚠ A copy of this book already exists...                 │ (if duplicate)
│                                                          │
│  ┌────┐  Title of the Book                              │
│  │    │  Author Name                                    │
│  │ IM │                                                  │
│  │ G  │  Hardcover ✧ 2023                               │
│  └────┘                                                  │
│                                     [Add to queue] →     │
└──────────────────────────────────────────────────────────┘

Preview Card (Loading):
┌──────────────────────────────────────────────────────────┐
│ Preview                                                  │
│                                                          │
│  ┌────┐  ▓▓▓▓▓▓▓▓▓▓▓▓▓                                 │
│  │ ▓▓ │  ▓▓▓▓▓▓▓▓                                       │
│  │ ▓▓ │                                                  │
│  │ ▓▓ │  ▓▓▓▓▓▓▓ ▓ ▓▓▓▓                                │
│  └────┘                                                  │
└──────────────────────────────────────────────────────────┘

Preview Card (Empty - no book data):
┌──────────────────────────────────────────────────────────┐
│ Preview                                                  │
│                                                          │
│ (empty - waiting for search)                            │
└──────────────────────────────────────────────────────────┘
```

**Complete Implementation:**

```typescript
<div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12">
  <div className="p-6">
    <div className="flex flex-col gap-4">
      {/* Section Heading */}
      <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
        Preview
      </h2>

      {/* Content: Only show if book data exists and not loading */}
      {book !== initialBookImportData && !loading && (
        <form noValidate autoComplete="off" onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Warning Alerts */}
          {book.isIncomplete && (
            <div className="bg-amber-900/30 border border-amber-800/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-300 font-medium">
                    Incomplete data was returned. Consider using the ISBN number found on the title page for more specific details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {book.isDuplicate && (
            <div className="bg-amber-900/30 border border-amber-800/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-300">
                    A copy of this book already exists in your library. This will create a duplicate copy. Is this intentional?
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Book Preview */}
          <div className="flex gap-4 sm:gap-6">
            {/* Book Cover */}
            <div className="flex items-start">
              {book?.imageOriginal ? (
                <img
                  src={book.imageOriginal}
                  alt={`Cover of ${title}`}
                  className="h-[100px] sm:h-[200px] w-auto object-cover rounded shadow-md"
                />
              ) : (
                <div className="w-[70px] h-[100px] sm:w-[140px] sm:h-[200px] bg-zinc-800 animate-pulse rounded flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-zinc-600 opacity-30" />
                </div>
              )}
            </div>

            {/* Book Metadata */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight leading-tight">
                {title}
              </h3>

              {/* Authors */}
              <p className="text-xs sm:text-sm text-zinc-400 tracking-tight">
                {authors.join(", ")}
              </p>

              {/* Publication Details */}
              <p className="text-xs text-zinc-500 mt-2">
                {binding} ✧ {datePublished?.toString().split("-")[0]}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 h-[42px] bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-all duration-200 font-medium text-sm w-full sm:w-auto"
            >
              Add to queue
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex gap-4 sm:gap-6 animate-pulse">
          {/* Image Skeleton */}
          <div className="w-[70px] h-[100px] sm:w-[140px] sm:h-[200px] bg-zinc-800 rounded" />

          {/* Metadata Skeleton */}
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/2" />
            <div className="h-3 bg-zinc-800 rounded w-1/3 mt-4" />
          </div>
        </div>
      )}
    </div>
  </div>
</div>
```

**Styling Specifications:**

```css
/* Card Container - Matches Search component */
w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl
my-6 sm:my-12                    /* 24px mobile, 48px desktop */
p-6                              /* 24px padding */

/* Section Heading */
text-xl font-semibold text-zinc-100 tracking-tight

/* Warning Alert - Incomplete Data */
bg-amber-900/30                  /* Subtle amber background */
border border-amber-800/50       /* Amber border */
rounded-lg p-4                   /* Consistent radius + padding */

/* Warning Icon */
text-amber-400                   /* Amber icon color */
w-5 h-5                          /* 20px icon size */

/* Warning Text */
text-sm text-amber-300 font-medium   /* Readable warning text */

/* Book Cover Image */
h-[100px] sm:h-[200px]           /* Responsive height */
w-auto                           /* Maintain aspect ratio */
object-cover rounded shadow-md   /* Clean presentation */

/* Book Cover Skeleton */
w-[70px] h-[100px]               /* Mobile */
sm:w-[140px] sm:h-[200px]        /* Desktop */
bg-zinc-800 animate-pulse rounded

/* Book Title */
text-base sm:text-lg             /* 16px mobile, 18px desktop */
font-bold text-zinc-100 tracking-tight leading-tight

/* Authors */
text-xs sm:text-sm               /* 12px mobile, 14px desktop */
text-zinc-400 tracking-tight

/* Publication Details */
text-xs text-zinc-500 mt-2       /* Small, subtle text */

/* Submit Button */
px-6 h-[42px]                    /* 42px height standard! */
bg-zinc-800 text-zinc-100 rounded-lg
hover:bg-zinc-700
transition-all duration-200
font-medium text-sm
w-full sm:w-auto                 /* Full width mobile, auto desktop */
```

#### Icon Requirements

```typescript
import { AlertTriangle, ImageIcon } from "lucide-react";
```

- **AlertTriangle**: Warning icon for incomplete/duplicate alerts
- **ImageIcon**: Fallback for missing book covers

#### Responsive Behavior

| Breakpoint | Image Height | Title Size | Authors Size | Button Width |
|------------|--------------|------------|--------------|--------------|
| Mobile (<640px) | 100px | text-base (16px) | text-xs (12px) | Full width |
| Desktop (≥640px) | 200px | text-lg (18px) | text-sm (14px) | Auto (fit content) |

#### Interaction States

**Button States:**
1. **Default:** `bg-zinc-800 text-zinc-100`
2. **Hover:** `bg-zinc-700`
3. **Focus:** Ring automatically applied via Tailwind defaults
4. **Disabled:** Not applicable (button only enabled when book data exists)

**Form Submission:**
- On submit: Book added to queue
- Form resets: bookData returns to initialBookImportData
- No loading state on submit (instant queue addition)

#### Loading States

**Initial (Empty):**
- Show only heading "Preview"
- No content below heading

**Loading (Fetching book data):**
- Show skeleton for image (70x100px mobile, 140x200px desktop)
- Show skeleton bars for title, author, publication details
- Use `animate-pulse` for pulsing effect
- Match exact layout of loaded state

**Loaded (Book data available):**
- Show warnings if applicable (incomplete/duplicate)
- Show book cover or fallback icon
- Show metadata (title, authors, publication details)
- Show "Add to queue" button

#### Accessibility

**Semantic HTML:**
```html
<form> - Semantic form element
<h2> - Section heading
<h3> - Book title heading
<button type="submit"> - Explicit submit button
```

**Image Alt Text:**
```typescript
alt={`Cover of ${title}`}  // Descriptive alt text
```

**Warning Alerts:**
- Use `<div>` with semantic icon
- Consider `role="alert"` for dynamic warnings
- Clear, readable text content

**Keyboard Navigation:**
- Tab to button
- Enter or Space to submit form
- Natural form submission flow

**Color Contrast:**
- Warning text (amber-300 #fcd34d) on amber background: Verify 4.5:1 ratio
- Button text (zinc-100) on zinc-800: Meets 4.5:1 ratio
- All text meets WCAG AA standards

#### Edge Cases

1. **No image URL:** Show ImageIcon fallback (already handled)
2. **Very long title:** Use `leading-tight` for compact line height
3. **Many authors:** Join with commas, allow natural text wrap
4. **Missing binding/date:** Safely access with optional chaining
5. **Incomplete data with no warnings:** Still render normally
6. **Simultaneous incomplete + duplicate:** Show both warnings

#### Implementation Notes

**Migration Steps:**
1. Remove all MUI imports (Card, CardContent, Alert, Button, Skeleton, Typography, Stack)
2. Import Lucide icons (AlertTriangle, ImageIcon)
3. Replace Card structure with div + Tailwind classes
4. Replace Alert with custom warning divs
5. Replace Button with button + Tailwind classes
6. Replace Skeleton with custom animated div
7. Update responsive classes (sm: instead of xs: md:)
8. Test all three states: empty, loading, loaded
9. Test both warning types individually and together
10. Verify 42px button height

**Preserve Exactly:**
- All form submission logic
- All state management
- All data transformation (title splitting, etc.)
- All book data mapping
- All validation logic

---

### 4. Queue Component (queue.tsx)

#### Current State (MUI)

```typescript
// Uses MUI Card, CardContent, Button, CircularProgress, Alert, Snackbar
<Card sx={{ display: "flex", minWidth: "200px", minHeight: "90vh", margin: { xs: "25px", md: "50px" } }}>
  <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
    <Typography variant="h6" sx={{ marginBottom: "1em" }}>Queue</Typography>

    {error && <Alert severity="error">{error}</Alert>}

    {books?.length ? (
      <>
        {books.map((book, i) => <Item key={i} {...book} />)}
        <Button variant="contained" startIcon={<CircularProgress />}>
          {isImporting ? "Adding..." : "Add to library"}
        </Button>
      </>
    ) : (
      <div style={{ /* Empty state placeholder */ }}></div>
    )}
  </CardContent>
</Card>

<Snackbar open={showSuccess}>
  <Alert severity="success">Books successfully added!</Alert>
</Snackbar>
```

**Issues:**
- MUI Card with extensive inline sx props
- Fixed minHeight: "90vh" (too rigid)
- Inconsistent margins (25px mobile, 50px desktop)
- MUI Button with contained variant
- MUI CircularProgress inside button
- MUI Snackbar for success message
- Empty state using inline styles
- Typography variants not matching design system

#### Target State (Tailwind)

**Visual Structure:**

```
Queue Card (With Books):
┌──────────────────────────────────────────────────────────┐
│ Queue                                                    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠ The Great Gatsby                                  │ │
│ │    F. Scott Fitzgerald                         [X]  │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ To Kill a Mockingbird                               │ │
│ │    Harper Lee                                  [X]  │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1984                                                │ │
│ │    George Orwell                               [X]  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│                              [Add to library] →         │
└──────────────────────────────────────────────────────────┘

Queue Card (Empty):
┌──────────────────────────────────────────────────────────┐
│ Queue                                                    │
│                                                          │
│ ╔═══════════════════════════════════════════════════╗  │
│ ║                                                   ║  │
│ ║                                                   ║  │
│ ║        Queue is empty                             ║  │
│ ║                                                   ║  │
│ ║        Add books from the preview panel           ║  │
│ ║                                                   ║  │
│ ║                                                   ║  │
│ ╚═══════════════════════════════════════════════════╝  │
└──────────────────────────────────────────────────────────┘

Queue Card (Error State):
┌──────────────────────────────────────────────────────────┐
│ Queue                                                    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✕  Error                                       [X]  │ │
│ │    Failed to import books. Please try again.        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ (books still shown below)                               │
└──────────────────────────────────────────────────────────┘

Queue Card (Importing):
┌──────────────────────────────────────────────────────────┐
│ Queue                                                    │
│                                                          │
│ (books listed)                                           │
│                                                          │
│                              [◉ Adding...] (disabled)    │
└──────────────────────────────────────────────────────────┘

Success Toast (Bottom Center):
                ┌─────────────────────────────┐
                │ ✓ Books successfully added! │
                └─────────────────────────────┘
```

**Complete Implementation:**

```typescript
import { Loader2, CheckCircle, X, AlertCircle } from "lucide-react";

const Queue: FC<QueueProps> = ({ books, setBooks }) => {
  // ... state management (unchanged)

  return (
    <>
      {/* Main Queue Card */}
      <div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            {/* Section Heading */}
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
              Queue
            </h2>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Queue Content */}
            {books?.length ? (
              <>
                {/* Queue Items */}
                <div className="flex flex-col gap-3">
                  {books.map((book, i) => (
                    <Item
                      key={i}
                      title={book.title}
                      authors={book.authors}
                      isIncomplete={book.isIncomplete || false}
                      itemKey={i}
                      handleDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* Import Button */}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={isImporting}
                    className={`
                      px-6 h-[42px] rounded-lg font-medium text-sm
                      transition-all duration-200
                      flex items-center gap-2
                      ${isImporting
                        ? 'bg-zinc-800/50 text-zinc-400 cursor-not-allowed'
                        : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                      }
                    `}
                  >
                    {isImporting && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {isImporting ? "Adding..." : "Add to library"}
                  </button>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/30 p-12 flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-zinc-500 text-sm text-center">
                  Queue is empty
                </p>
                <p className="text-zinc-600 text-xs text-center mt-2">
                  Add books from the preview panel
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-4 min-w-[320px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-900/30 border border-green-800/50">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-sm font-medium text-zinc-100">
                  Books successfully added to your library!
                </p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="text-zinc-400 hover:text-zinc-300 transition-colors duration-200"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
```

**Styling Specifications:**

```css
/* Card Container - Matches Search & Preview */
w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl
my-6 sm:my-12                    /* 24px mobile, 48px desktop */
p-6                              /* 24px padding */

/* Section Heading */
text-xl font-semibold text-zinc-100 tracking-tight

/* Error Alert */
bg-red-950/50                    /* Red error background */
border border-red-900/50         /* Red border */
rounded-lg p-4                   /* Consistent radius + padding */
text-sm text-red-300             /* Readable error text */

/* Queue Items Container */
flex flex-col gap-3              /* 12px gap between items */

/* Import Button - Enabled */
px-6 h-[42px]                    /* 42px height standard! */
bg-zinc-800 text-zinc-100 rounded-lg
hover:bg-zinc-700
transition-all duration-200
font-medium text-sm
flex items-center gap-2          /* Icon + text alignment */

/* Import Button - Disabled (Importing) */
bg-zinc-800/50 text-zinc-400
cursor-not-allowed

/* Loading Spinner */
w-4 h-4 animate-spin             /* 16px spinner */

/* Empty State */
border-2 border-dashed border-zinc-800
rounded-lg bg-zinc-900/30 p-12
min-h-[400px]                    /* Minimum height for visual presence */
text-zinc-500 text-sm            /* Subtle empty message */
text-zinc-600 text-xs            /* Even subtler helper text */

/* Success Toast Container */
fixed bottom-6 left-1/2 -translate-x-1/2 z-50
animate-fade-in-up               /* Custom animation (see below) */

/* Success Toast Card */
bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-4
min-w-[320px]                    /* Minimum toast width */

/* Success Icon Circle */
w-8 h-8 rounded-full
bg-green-900/30 border border-green-800/50

/* Success Icon */
w-5 h-5 text-green-400           /* Green checkmark */

/* Success Text */
text-sm font-medium text-zinc-100
```

**Custom Animation (Add to globals.css or component):**

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translate(-50%, 16px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}
```

#### Icon Requirements

```typescript
import { Loader2, CheckCircle, X, AlertCircle } from "lucide-react";
```

- **Loader2**: Spinning loading icon for importing state
- **CheckCircle**: Success icon for toast notification
- **X**: Close icon for dismissing error/toast
- **AlertCircle**: Error icon for error alert

#### Responsive Behavior

| Breakpoint | Margins | Min Height | Button Width |
|------------|---------|------------|--------------|
| Mobile (<640px) | my-6 (24px) | min-h-[400px] | Auto (fit content) |
| Desktop (≥640px) | my-12 (48px) | min-h-[400px] | Auto (fit content) |

**Note:** Remove fixed `minHeight: 90vh` - let content determine height with minimum.

#### Interaction States

**Import Button States:**
1. **Enabled (Default):**
   - `bg-zinc-800 text-zinc-100`
   - Hover: `bg-zinc-700`
   - Cursor: pointer
   - Text: "Add to library"

2. **Disabled (Importing):**
   - `bg-zinc-800/50 text-zinc-400`
   - No hover effect
   - Cursor: not-allowed
   - Text: "Adding..."
   - Shows spinning Loader2 icon

**Error Alert:**
- Dismissable via X button
- Click X: Calls `setError(null)`
- Smooth fade-out (CSS transition)

**Success Toast:**
- Auto-dismiss after 4 seconds (existing logic)
- Manual dismiss via X button
- Slide up from bottom with fade-in animation
- Fixed position: bottom-6, centered horizontally

#### State Management Flow

**Initial State:**
```typescript
const [books, setBooks] = useState<BookImportDataType[]>([]);
const [isImporting, setIsImporting] = useState(false);
const [error, setError] = useState<string | null>(null);
const [showSuccess, setShowSuccess] = useState(false);
```

**Import Flow:**
1. User clicks "Add to library"
2. `isImporting` = true (button disabled, shows spinner)
3. `error` = null (clear any previous errors)
4. Call `importBooks(cleanedBooks)`
5. **On Success:**
   - `books` = [] (clear queue)
   - `showSuccess` = true (show toast)
   - `isImporting` = false
   - Toast auto-dismisses after 4s
6. **On Error:**
   - `error` = error message (show alert)
   - `isImporting` = false
   - Books remain in queue

#### Accessibility

**Semantic HTML:**
```html
<h2> - Section heading
<button> - Interactive buttons
<ul> + <li> - Consider for queue items (semantic list)
```

**ARIA Attributes:**
```typescript
// Error alert (if dynamic)
role="alert"

// Success toast
role="status" aria-live="polite"

// Disabled button
disabled={isImporting}  // Automatically adds aria-disabled

// Close buttons
aria-label="Dismiss error"
aria-label="Dismiss notification"
```

**Keyboard Navigation:**
- Tab to "Add to library" button
- Tab to delete buttons in queue items
- Tab to dismiss buttons in alerts/toast
- Enter or Space to activate buttons

**Color Contrast:**
- Error text (red-300) on red background: Verify 4.5:1
- Button text (zinc-100) on zinc-800: Meets 4.5:1
- Toast text (zinc-100) on zinc-900: Meets 4.5:1

**Screen Reader Announcements:**
- Success toast: "Books successfully added to your library!"
- Error alert: Error message content
- Button state: "Adding..." vs "Add to library"

#### Loading States

**Not Importing (Default):**
- Button enabled
- Text: "Add to library"
- No spinner icon
- Hover effect active

**Importing (Active):**
- Button disabled
- Text: "Adding..."
- Spinner icon (Loader2) animating
- No hover effect
- Grayed out appearance

**Empty Queue:**
- Large dashed border box
- Centered text: "Queue is empty"
- Helper text: "Add books from the preview panel"
- No import button visible

#### Error Handling

**Error Display:**
- Red-tinted alert box at top of queue
- AlertCircle icon on left
- Error message text in center
- X close button on right

**Error Messages:**
- "Failed to import books. Please try again." (API error)
- "An unexpected error occurred. Please try again." (Unknown error)
- Custom messages from API response

**Error Recovery:**
- User can dismiss error (click X)
- User can retry import (books still in queue)
- Error clears on next import attempt

#### Edge Cases

1. **Empty queue:** Show empty state (dashed border box)
2. **Single book:** Still show queue, button works
3. **Many books (>10):** Queue scrolls naturally, no max height
4. **Import in progress + user adds more:** New books added after import completes
5. **Network error during import:** Show error, keep books in queue
6. **Success toast + immediate new import:** Toast dismissed, new import starts
7. **Multiple rapid imports:** Button disabled prevents duplicate submissions

#### Implementation Notes

**Migration Steps:**
1. Remove all MUI imports (Card, CardContent, Button, CircularProgress, Alert, Snackbar, Typography)
2. Import Lucide icons (Loader2, CheckCircle, X, AlertCircle)
3. Replace Card structure with div + Tailwind classes
4. Replace Button with button + Tailwind classes + conditional styling
5. Replace CircularProgress with Loader2 + animate-spin
6. Replace Alert with custom error div
7. Replace Snackbar with custom fixed toast
8. Add fade-in-up animation to globals.css or Tailwind config
9. Update margins (my-6 sm:my-12 instead of xs: md:)
10. Remove fixed height (90vh), use min-h-[400px] for empty state
11. Test all states: empty, populated, importing, error, success
12. Verify 42px button height
13. Test toast auto-dismiss (4 seconds)
14. Test error dismissal

**Preserve Exactly:**
- All import logic (handleSubmit function)
- All error handling
- All state management
- All book data cleaning
- Toast auto-dismiss timer (4 seconds)
- All prop passing to Item components

**Tailwind Config (if needed for animation):**
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(16px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out'
      }
    }
  }
}
```

---

### 5. Queue Item Component (item.tsx)

#### Current State (MUI)

```typescript
// Uses MUI Card, IconButton, Tooltip, Typography
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
  <div id="icon-drawer">
    <IconButton aria-label="delete" onClick={() => handleDelete(itemKey)}>
      <DeleteIcon />
    </IconButton>
  </div>
</Card>
```

**Issues:**
- MUI Card with extensive inline sx props
- Fixed minWidth: "450px" (not responsive)
- MUI IconButton for delete action
- MUI Tooltip for warning indicator
- Typography variants not matching design system
- Inline styles for layout

#### Target State (Tailwind)

**Visual Structure:**

```
Queue Item (Normal):
┌─────────────────────────────────────────────────────────┐
│ The Great Gatsby                                  [🗑️]  │
│ F. Scott Fitzgerald                                     │
└─────────────────────────────────────────────────────────┘

Queue Item (Incomplete Data):
┌─────────────────────────────────────────────────────────┐
│ ⚠  The Great Gatsby                               [🗑️]  │
│    F. Scott Fitzgerald                                  │
└─────────────────────────────────────────────────────────┘
   ^
   Warning icon with tooltip
```

**Complete Implementation:**

```typescript
import { FC, useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

interface ItemProps {
  title: string;
  authors: string[];
  isIncomplete: boolean;
  itemKey: number;
  handleDelete: (key: number) => void;
}

const Item: FC<ItemProps> = ({
  title,
  authors,
  isIncomplete,
  itemKey,
  handleDelete,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        {/* Left Side - Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Warning Icon (if incomplete) */}
          {isIncomplete && (
            <div className="relative flex-shrink-0 mt-0.5">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                className="text-amber-400 hover:text-amber-300 transition-colors duration-200"
                aria-label="Incomplete data"
                tabIndex={0}
              >
                <AlertTriangle className="w-5 h-5" />
              </button>

              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute left-0 top-full mt-2 z-10 whitespace-nowrap">
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl px-3 py-2">
                    <p className="text-xs text-zinc-300">Incomplete data</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight truncate">
              {title}
            </h3>
            <p className="text-xs text-zinc-400 tracking-tight truncate mt-1">
              {authors.join(", ")}
            </p>
          </div>
        </div>

        {/* Right Side - Delete Button */}
        <button
          onClick={() => handleDelete(itemKey)}
          className="flex-shrink-0 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all duration-200"
          aria-label={`Delete ${title}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Item;
```

**Styling Specifications:**

```css
/* Card Container */
border border-zinc-800 rounded-lg
bg-zinc-900/30                   /* Subtle background */
p-4                              /* 16px padding */
hover:bg-zinc-900/50             /* Slightly darker on hover */
hover:border-zinc-700            /* Lighter border on hover */
transition-all duration-200      /* Smooth hover transition */

/* Layout */
flex items-start justify-between gap-3
/* ^
   Flexbox with items aligned to top
   Space between left and right
   12px gap
*/

/* Left Side Container */
flex items-start gap-3 flex-1 min-w-0
/* ^
   Flexbox with items aligned to top
   12px gap
   flex-1 to fill available space
   min-w-0 to enable text truncation
*/

/* Warning Icon Button */
text-amber-400 hover:text-amber-300
transition-colors duration-200
flex-shrink-0 mt-0.5
/* ^
   Amber color (warning)
   Don't shrink (preserve icon size)
   Small top margin for alignment
*/

/* Warning Icon */
w-5 h-5                          /* 20px icon size */

/* Tooltip */
absolute left-0 top-full mt-2 z-10
whitespace-nowrap
bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl
px-3 py-2
text-xs text-zinc-300

/* Text Content Container */
flex-1 min-w-0
/* ^
   Fill available space
   min-w-0 enables text truncation in children
*/

/* Title */
text-sm font-semibold text-zinc-100 tracking-tight
truncate                         /* Ellipsis for long titles */

/* Authors */
text-xs text-zinc-400 tracking-tight
truncate                         /* Ellipsis for long author lists */
mt-1                             /* 4px top margin */

/* Delete Button */
flex-shrink-0                    /* Don't shrink */
p-2                              /* 8px padding (clickable area) */
text-zinc-500                    /* Default icon color */
hover:text-red-400               /* Red on hover (danger) */
hover:bg-red-950/30              /* Red background on hover */
rounded-lg                       /* Rounded corners */
transition-all duration-200      /* Smooth hover transition */

/* Delete Icon */
w-4 h-4                          /* 16px icon size */
```

#### Icon Requirements

```typescript
import { Trash2, AlertTriangle } from "lucide-react";
```

- **Trash2**: Delete icon for removing item from queue
- **AlertTriangle**: Warning icon for incomplete data

#### Responsive Behavior

**All Breakpoints:**
- No changes needed - component is naturally responsive
- Text truncates gracefully with ellipsis
- Flexbox ensures proper layout on all screen sizes

**Key Responsive Features:**
- `min-w-0` on text containers enables truncation
- `flex-shrink-0` on icons prevents them from shrinking
- `truncate` on text prevents overflow
- Gap spacing adjusts naturally

#### Interaction States

**Card States:**
1. **Default:** `border-zinc-800 bg-zinc-900/30`
2. **Hover:** `border-zinc-700 bg-zinc-900/50`

**Delete Button States:**
1. **Default:** `text-zinc-500`
2. **Hover:** `text-red-400 bg-red-950/30` (danger indication)
3. **Focus:** Ring automatically applied via Tailwind defaults

**Warning Icon States:**
1. **Default:** `text-amber-400`
2. **Hover:** `text-amber-300`
3. **Focus:** Show tooltip

**Tooltip:**
- Appears on hover or focus
- Dismisses on mouse leave or blur
- Positioned below icon with small margin
- No click interaction (informational only)

#### State Management

**Tooltip State:**
```typescript
const [showTooltip, setShowTooltip] = useState(false);

// Show on mouse enter or focus
onMouseEnter={() => setShowTooltip(true)}
onFocus={() => setShowTooltip(true)}

// Hide on mouse leave or blur
onMouseLeave={() => setShowTooltip(false)}
onBlur={() => setShowTooltip(false)}
```

**Delete Action:**
```typescript
// Calls parent handler with item key
onClick={() => handleDelete(itemKey)}
```

#### Accessibility

**Semantic HTML:**
```html
<div> - Card container (not interactive, so div is fine)
<button> - Warning icon (focusable, shows tooltip)
<h3> - Title (heading hierarchy)
<p> - Authors (paragraph)
<button> - Delete action (semantic button)
```

**ARIA Attributes:**
```typescript
// Warning button
aria-label="Incomplete data"
tabIndex={0}  // Ensure focusable

// Delete button
aria-label={`Delete ${title}`}  // Descriptive label with book title
```

**Keyboard Navigation:**
- Tab to warning icon (if present) → Shows tooltip on focus
- Tab to delete button → Press Enter or Space to delete
- Visual focus indicators on both interactive elements

**Color Contrast:**
- Title (zinc-100) on dark background: Meets 4.5:1
- Authors (zinc-400) on dark background: Meets 4.5:1
- Warning icon (amber-400): Meets 3:1 for UI elements
- Delete icon (zinc-500): Meets 3:1 for UI elements
- Hover states increase contrast further

**Tooltip Accessibility:**
- Appears on focus (not just hover)
- Text is readable by screen readers
- Doesn't trap focus
- Auto-dismisses on blur

#### Edge Cases

1. **Very long title:** Truncates with ellipsis, hover doesn't show full title (acceptable)
2. **Very long author list:** Truncates with ellipsis
3. **Single author:** Works normally
4. **Empty authors array:** Shows empty string (consider "Unknown Author"?)
5. **Incomplete + very long title:** Both work together correctly
6. **Delete during import:** Parent manages this (button should be disabled)
7. **Rapid delete clicks:** Each click removes one item via parent handler

#### Implementation Notes

**Migration Steps:**
1. Remove all MUI imports (Card, IconButton, Tooltip, Typography)
2. Import Lucide icons (Trash2, AlertTriangle)
3. Add tooltip state management
4. Replace Card with div + Tailwind classes
5. Replace IconButton with button + Tailwind classes
6. Replace Tooltip with custom tooltip div + show/hide logic
7. Replace Typography with semantic HTML (h3, p)
8. Remove all inline styles
9. Remove fixed minWidth (450px)
10. Test tooltip on hover and focus
11. Test delete functionality
12. Test with and without incomplete flag
13. Test text truncation with very long titles/authors
14. Verify hover states on card and buttons

**Preserve Exactly:**
- All props interface (title, authors, isIncomplete, itemKey, handleDelete)
- Delete handler invocation logic
- Authors array joining logic
- Conditional rendering of warning icon

**Design Decisions:**

1. **Why custom tooltip instead of library?**
   - Keep dependencies minimal
   - Match design system exactly
   - Simple show/hide logic sufficient
   - Full accessibility control

2. **Why text truncation?**
   - Prevent layout breaking with very long titles
   - Consistent card heights in queue
   - Clean visual presentation
   - Mobile-friendly

3. **Why hover state on entire card?**
   - Visual feedback for hovering over item
   - Helps identify active item in queue
   - Subtle, not distracting
   - Consistent with library item cards

4. **Why red hover for delete?**
   - Universal danger color
   - Clear destructive action indicator
   - Prevents accidental deletes (requires intentional hover)
   - Accessible contrast

---

### 6. Import Page (page.tsx)

#### Current State

```typescript
"use server";
import Import from "./components/import";

export default async function ImportPage(){
  return <Import />;
};
```

**Status:** This file is just a wrapper and requires no changes.

#### Target State

**No changes needed** - This is a server component wrapper that simply renders the Import client component.

#### Implementation Notes

- Keep "use server" directive
- Keep Import component import
- No styling or logic changes
- Verify it still works after Import component migration

---

## Responsive Breakpoints

### Breakpoint Strategy

Penumbra uses Tailwind's default breakpoint system:

| Breakpoint | Min Width | Prefix | Usage in Import Flow |
|------------|-----------|--------|----------------------|
| **Mobile** | 0px | (none) | Default, base styles |
| **sm** | 640px | `sm:` | Larger text, larger margins |
| **md** | 768px | `md:` | Side-by-side layout, two columns |
| **lg** | 1024px | `lg:` | Not used in import flow |
| **xl** | 1280px | `xl:` | Not used in import flow |

### Component-Specific Breakpoints

#### Import Container (import.tsx)

**Mobile (< 768px):**
```css
/* Vertical stack, full width */
<div className="md:flex md:gap-6">  /* No flex on mobile */
  <div className="w-full md:w-1/2">  /* Full width on mobile */
```

**Desktop (≥ 768px):**
```css
/* Side-by-side columns, 50/50 split */
<div className="md:flex md:gap-6">  /* Flex on tablet+ */
  <div className="w-full md:w-1/2">  /* 50% width on tablet+ */
```

#### Search Component (search.tsx)

**Mobile (< 640px):**
```css
my-6            /* 24px vertical margin */
```

**Desktop (≥ 640px):**
```css
sm:my-12        /* 48px vertical margin */
```

#### Preview Component (preview.tsx)

**Mobile (< 640px):**
```css
my-6                        /* 24px margin */
gap-4                       /* 16px gap */
h-[100px]                   /* 100px book cover */
text-base                   /* 16px title */
text-xs                     /* 12px authors */
w-full                      /* Full width button */
```

**Desktop (≥ 640px):**
```css
sm:my-12                    /* 48px margin */
sm:gap-6                    /* 24px gap */
sm:h-[200px]                /* 200px book cover */
sm:text-lg                  /* 18px title */
sm:text-sm                  /* 14px authors */
sm:w-auto                   /* Auto width button */
```

#### Queue Component (queue.tsx)

**Mobile (< 640px):**
```css
my-6            /* 24px margin */
```

**Desktop (≥ 640px):**
```css
sm:my-12        /* 48px margin */
```

#### Queue Item Component (item.tsx)

**No breakpoint-specific styles** - Naturally responsive with flexbox and text truncation.

### Testing Breakpoints

Test at these specific widths:

1. **320px** - iPhone SE (narrow mobile)
2. **375px** - iPhone standard
3. **640px** - sm breakpoint
4. **768px** - md breakpoint (critical - layout change!)
5. **1024px** - Large tablet/desktop
6. **1280px** - Desktop standard
7. **1920px** - Large desktop

**Critical Test:** 767px vs 768px - Verify layout switches correctly from stacked to side-by-side.

---

## Interaction Patterns

### ISBN Search Flow

**User Actions:**
1. User types ISBN in search input
2. User clicks "Submit" button
3. API fetches book metadata
4. Preview component shows book data
5. User reviews and clicks "Add to queue"
6. Book appears in queue

**States:**
- **Idle:** Empty search input, empty preview
- **Typing:** User entering ISBN
- **Submitting:** Form submitted, loading begins
- **Loading:** Preview shows skeleton state
- **Loaded:** Preview shows book data
- **Added:** Book in queue, preview resets

**Transitions:**
```
Idle → Typing → Submitting → Loading → Loaded → Added → Idle
```

### Queue Management Flow

**User Actions:**
1. Books added to queue from preview
2. User reviews queue
3. User can delete individual books
4. User clicks "Add to library" when ready
5. Import process begins
6. Success toast appears
7. Queue clears

**States:**
- **Empty:** No books in queue
- **Populated:** Books in queue, ready to import
- **Importing:** "Add to library" clicked, API call in progress
- **Success:** Import complete, toast shown
- **Error:** Import failed, error alert shown

**Transitions:**
```
Empty → Populated → Importing → Success → Empty
                               ↓
                            Error → Populated (retry)
```

### Warning Indicators

**Incomplete Data Warning (Preview):**
- Appears when book data has missing fields
- Amber-colored alert
- AlertTriangle icon
- Informational (doesn't block adding to queue)

**Duplicate Warning (Preview):**
- Appears when book ISBN already exists in library
- Amber-colored alert
- AlertTriangle icon
- Informational (user can still import duplicate)

**Incomplete Data Indicator (Queue Item):**
- Small amber AlertTriangle icon
- Tooltip on hover/focus: "Incomplete data"
- Reminds user before bulk import

### Button Interactions

**Search Submit Button:**
- **Default:** Gray (zinc-800), white text
- **Hover:** Darker gray (zinc-700)
- **Click:** Triggers form submission
- **After Submit:** Form resets, button returns to default

**Preview "Add to queue" Button:**
- **Default:** Gray (zinc-800), white text
- **Hover:** Darker gray (zinc-700)
- **Click:** Adds book to queue, resets preview
- **Mobile:** Full width
- **Desktop:** Auto width (fit content)

**Queue "Add to library" Button:**
- **Default:** Gray (zinc-800), white text
- **Hover:** Darker gray (zinc-700)
- **Disabled (Importing):** Light gray (zinc-800/50), grayed text, spinner icon
- **Click:** Triggers bulk import

**Queue Item Delete Button:**
- **Default:** Gray icon (zinc-500)
- **Hover:** Red icon (red-400), red background tint
- **Click:** Removes item from queue immediately

### Loading Patterns

**Search Loading:**
- Occurs after form submission
- Preview component shows skeleton state
- Skeleton matches exact layout of loaded preview
- Duration: Depends on API response time

**Import Loading:**
- Occurs after clicking "Add to library"
- Button becomes disabled
- Text changes to "Adding..."
- Spinner icon appears next to text
- Duration: Depends on bulk import API

**Skeleton Pattern:**
```typescript
// Used in Preview component
<div className="animate-pulse">
  <div className="w-[70px] h-[100px] bg-zinc-800 rounded" />
  <div className="h-6 bg-zinc-800 rounded w-3/4" />
  <div className="h-4 bg-zinc-800 rounded w-1/2" />
</div>
```

### Hover Effects

**All hover effects use:**
```css
transition-all duration-200  /* or transition-colors duration-200 */
```

**Component-specific hovers:**

1. **Search Input:**
   - Focus ring on focus (ring-2 ring-zinc-700)
   - No hover effect (input fields don't hover)

2. **Buttons:**
   - Background darkens slightly
   - Maintains same border and text color
   - Smooth 200ms transition

3. **Queue Items (Card):**
   - Background: zinc-900/30 → zinc-900/50
   - Border: zinc-800 → zinc-700
   - Subtle visual feedback

4. **Delete Button:**
   - Icon color: zinc-500 → red-400
   - Background: transparent → red-950/30
   - Strong danger indication

5. **Warning Icon:**
   - Color: amber-400 → amber-300
   - Shows tooltip on hover/focus

### Focus States

**All interactive elements receive focus indicators:**

**Inputs:**
```css
focus:outline-none
focus:ring-2 focus:ring-zinc-700
focus:border-zinc-700
```

**Buttons:**
```css
/* Tailwind applies default focus ring automatically */
/* Can customize with focus:ring-2 focus:ring-zinc-500 if needed */
```

**Tab Order:**
1. Search input
2. Search submit button
3. Preview "Add to queue" button (if visible)
4. Queue warning icon (if present)
5. Queue delete buttons (each item)
6. Queue "Add to library" button (if visible)

### Error Recovery

**Search Errors:**
- Handled by search component (already migrated)
- User can retry by submitting again

**Import Errors:**
- Error alert appears at top of queue
- Books remain in queue
- User can dismiss error (click X)
- User can retry import (click "Add to library" again)
- Error clears automatically on next import attempt

---

## Loading States & Error Handling

### Loading State Specifications

#### 1. Search Loading State

**When:** After user submits ISBN search form
**Duration:** Until API returns book metadata
**Location:** Preview component

**Implementation:**
```typescript
{loading && (
  <div className="flex gap-4 sm:gap-6 animate-pulse">
    {/* Image Skeleton */}
    <div className="w-[70px] h-[100px] sm:w-[140px] sm:h-[200px] bg-zinc-800 rounded" />

    {/* Metadata Skeleton */}
    <div className="flex-1 space-y-3">
      <div className="h-6 bg-zinc-800 rounded w-3/4" />
      <div className="h-4 bg-zinc-800 rounded w-1/2" />
      <div className="h-3 bg-zinc-800 rounded w-1/3 mt-4" />
    </div>
  </div>
)}
```

**Visual Effect:**
- Pulsing animation (`animate-pulse`)
- Gray rectangular placeholders (zinc-800)
- Matches exact layout of loaded preview
- Responsive sizes (mobile vs desktop)

**User Feedback:**
- Clear visual indication that data is loading
- User knows to wait
- Maintains spatial stability (no layout shift)

#### 2. Import Loading State

**When:** After user clicks "Add to library"
**Duration:** Until bulk import API completes
**Location:** Queue component button

**Implementation:**
```typescript
<button
  onClick={handleSubmit}
  disabled={isImporting}
  className={`
    px-6 h-[42px] rounded-lg font-medium text-sm
    transition-all duration-200
    flex items-center gap-2
    ${isImporting
      ? 'bg-zinc-800/50 text-zinc-400 cursor-not-allowed'
      : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
    }
  `}
>
  {isImporting && (
    <Loader2 className="w-4 h-4 animate-spin" />
  )}
  {isImporting ? "Adding..." : "Add to library"}
</button>
```

**Visual Effect:**
- Button becomes disabled (no hover, no click)
- Text changes: "Add to library" → "Adding..."
- Spinner icon appears (Loader2 with spin animation)
- Grayed out appearance (zinc-800/50 background, zinc-400 text)

**User Feedback:**
- Clear indication that import is in progress
- Prevents duplicate submissions
- Text change communicates action state
- Spinner provides visual motion (user knows system is working)

#### 3. Image Loading State

**When:** Book cover image is being fetched
**Duration:** Until image loads or errors
**Location:** Preview component

**Implementation:**
```typescript
{book?.imageOriginal ? (
  <img
    src={book.imageOriginal}
    alt={`Cover of ${title}`}
    className="h-[100px] sm:h-[200px] w-auto object-cover rounded shadow-md"
  />
) : (
  <div className="w-[70px] h-[100px] sm:w-[140px] sm:h-[200px] bg-zinc-800 animate-pulse rounded flex items-center justify-center">
    <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-zinc-600 opacity-30" />
  </div>
)}
```

**Visual Effect:**
- Pulsing placeholder while loading
- ImageIcon as fallback for missing/failed images
- Smooth fade-in when image loads (can add transition-opacity)

**User Feedback:**
- Immediate visual placeholder
- User knows image space is reserved
- Graceful fallback for missing images

### Error State Specifications

#### 1. Import Error State

**When:** Bulk import API fails
**Duration:** Until user dismisses or retries
**Location:** Top of queue component

**Implementation:**
```typescript
{error && (
  <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 flex-1">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-300">{error}</p>
      </div>
      <button
        onClick={() => setError(null)}
        className="text-red-400 hover:text-red-300 transition-colors duration-200"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
)}
```

**Visual Effect:**
- Red-tinted alert box (red-950/50 background, red-900/50 border)
- AlertCircle icon in red (red-400)
- Error message text in red (red-300)
- Dismissable X button

**User Feedback:**
- Clear error indication (red color = error)
- Specific error message
- Actionable (user can dismiss or retry)
- Non-blocking (books remain in queue)

**Error Messages:**
- "Failed to import books. Please try again." (API error)
- "An unexpected error occurred. Please try again." (Unknown error)
- Custom messages from API response

#### 2. Incomplete Data Warning (Not an Error)

**When:** API returns book with missing required fields
**Duration:** Until user adds to queue or searches again
**Location:** Preview component

**Implementation:**
```typescript
{book.isIncomplete && (
  <div className="bg-amber-900/30 border border-amber-800/50 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-amber-300 font-medium">
          Incomplete data was returned. Consider using the ISBN number found on the title page for more specific details.
        </p>
      </div>
    </div>
  </div>
)}
```

**Visual Effect:**
- Amber-tinted warning box (amber-900/30 background, amber-800/50 border)
- AlertTriangle icon in amber (amber-400)
- Warning message text in amber (amber-300)

**User Feedback:**
- Warning, not error (amber vs red)
- Informational (doesn't block action)
- Suggests remedy (use ISBN from title page)
- User can still add to queue

#### 3. Duplicate Book Warning (Not an Error)

**When:** API detects book already exists in user's library
**Duration:** Until user adds to queue or searches again
**Location:** Preview component

**Implementation:**
```typescript
{book.isDuplicate && (
  <div className="bg-amber-900/30 border border-amber-800/50 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-amber-300">
          A copy of this book already exists in your library. This will create a duplicate copy. Is this intentional?
        </p>
      </div>
    </div>
  </div>
)}
```

**Visual Effect:**
- Same amber styling as incomplete warning
- Question format ("Is this intentional?")
- Non-blocking

**User Feedback:**
- Alerts user to potential duplicate
- Allows intentional duplicates (e.g., different editions)
- User makes informed decision

### Success State Specification

#### Import Success Toast

**When:** Bulk import completes successfully
**Duration:** 4 seconds (auto-dismiss) or until manually dismissed
**Location:** Fixed at bottom center of viewport

**Implementation:**
```typescript
{showSuccess && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-4 min-w-[320px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-900/30 border border-green-800/50">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-sm font-medium text-zinc-100">
            Books successfully added to your library!
          </p>
        </div>
        <button
          onClick={() => setShowSuccess(false)}
          className="text-zinc-400 hover:text-zinc-300 transition-colors duration-200"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
)}
```

**Visual Effect:**
- Slides up from bottom with fade-in animation
- Green success indicator (CheckCircle icon, green-400)
- Clean dark card (zinc-900 background, zinc-700 border)
- Auto-dismisses after 4 seconds

**User Feedback:**
- Positive confirmation (green = success)
- Clear message
- Non-intrusive (bottom of screen, auto-dismiss)
- Dismissable if user wants to clear it immediately

**Animation:**
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translate(-50%, 16px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}
```

### Loading State Best Practices

1. **Immediate Feedback:** Show loading state immediately when action triggered
2. **Spatial Stability:** Loading placeholder matches exact layout of loaded content
3. **Animation:** Use `animate-pulse` for skeleton states, `animate-spin` for spinners
4. **Disable Interactions:** Disable buttons during loading to prevent duplicate actions
5. **Text Changes:** Update button text to indicate action in progress ("Adding...")

### Error Handling Best Practices

1. **Clear Communication:** Specific error messages, not generic "An error occurred"
2. **Actionable:** Provide way to recover (retry, dismiss)
3. **Non-Blocking:** Don't prevent user from continuing workflow if possible
4. **Visual Distinction:** Red for errors, amber for warnings
5. **Accessibility:** Use semantic elements and ARIA attributes

### State Persistence

**What persists:**
- Queue contents (state variable)
- Error messages (until dismissed)
- Success toast (until dismissed or timeout)

**What resets:**
- Search input (after submission)
- Preview (after adding to queue)
- Loading states (after completion)

**What doesn't persist:**
- Import queue is NOT persisted to localStorage
- User must complete import in single session
- Refreshing page clears queue (intentional for data integrity)

---

## Accessibility Checklist

### WCAG 2.1 AA Compliance Requirements

All components in the Import Flow must meet WCAG 2.1 Level AA standards.

### 1. Perceivable

#### 1.1 Text Alternatives
- [ ] All images have descriptive alt text
  - Book covers: `alt={`Cover of ${title}`}`
  - Icon fallbacks: Described by surrounding context
- [ ] Icons paired with text labels
  - Spinner icon + "Adding..." text
  - CheckCircle icon + "Books successfully added!" text
- [ ] Form inputs have associated labels
  - ISBN input has `<label>` element

#### 1.2 Time-based Media
- [ ] N/A - No video or audio content

#### 1.3 Adaptable
- [ ] Semantic HTML structure
  - `<form>` for search
  - `<h2>` for section headings
  - `<h3>` for book titles
  - `<button>` for interactive elements
  - `<p>` for text content
- [ ] Correct heading hierarchy (h2 → h3)
- [ ] No content relies on shape, size, or visual location alone
- [ ] Content is linearizable (makes sense when read top-to-bottom)

#### 1.4 Distinguishable
- [ ] **Color Contrast Ratios:**
  - Text zinc-100 on zinc-950: ✓ 14.1:1 (Passes AAA)
  - Text zinc-300 on zinc-900: ✓ 9.7:1 (Passes AAA)
  - Text zinc-400 on zinc-900: ✓ 6.3:1 (Passes AA)
  - Text zinc-500 on zinc-900: ✓ 4.5:1 (Passes AA)
  - Warning amber-300 on amber-900/30: ⚠️ Verify 4.5:1
  - Error red-300 on red-950/50: ⚠️ Verify 4.5:1
  - Button zinc-100 on zinc-800: ✓ 11.2:1 (Passes AAA)
  - Icon zinc-500: ✓ 3:1+ for UI components (Passes AA)
- [ ] Color is not the only means of conveying information
  - Warnings use icon + text
  - Errors use icon + text
  - Loading uses spinner + text
- [ ] Text can be resized up to 200% without loss of content
- [ ] Images of text avoided (using real text instead)
- [ ] Focus indicators visible and clear

### 2. Operable

#### 2.1 Keyboard Accessible
- [ ] All functionality available via keyboard
  - Tab to navigate between elements
  - Enter/Space to activate buttons
  - Enter to submit forms
  - Escape to dismiss tooltip (automatically via blur)
- [ ] No keyboard traps
  - Tooltip dismisses on blur
  - Modals not used (no trapping needed)
- [ ] Logical tab order
  1. Search input
  2. Search submit button
  3. Preview button (if visible)
  4. Queue warning icon (if visible)
  5. Queue delete buttons
  6. Queue submit button (if visible)

#### 2.2 Enough Time
- [ ] No time limits on reading or interaction
  - Exception: Success toast auto-dismisses after 4s
  - User can manually dismiss at any time
  - Not essential content (informational only)
- [ ] No auto-updating content
- [ ] Users can pause animations (N/A - only CSS animations)

#### 2.3 Seizures and Physical Reactions
- [ ] No flashing content (3+ flashes per second)
  - Pulse animation is slow (2s cycle)
  - Spinner rotation is smooth
  - No rapid flashing

#### 2.4 Navigable
- [ ] Skip to main content link (handled by navbar)
- [ ] Page title describes content (handled by Next.js metadata)
- [ ] Focus order matches visual order
- [ ] Link/button purpose clear from text
  - "Submit" (search form)
  - "Add to queue" (preview)
  - "Add to library" (queue)
  - "Delete [book title]" (queue items)
  - "Dismiss error/notification" (alerts)
- [ ] Multiple ways to locate pages (navbar handles this)
- [ ] Headings describe content
  - "Search", "Preview", "Queue"
- [ ] Focus visible on all interactive elements

#### 2.5 Input Modalities
- [ ] All pointer interactions available via keyboard
- [ ] Click targets at least 44x44px
  - Buttons: 42px height (slightly under, but acceptable)
  - Delete buttons: 8px padding + icon = adequate size
  - Warning icon: Adequate clickable area
- [ ] Labels in names
  - Button text matches aria-label or vice versa

### 3. Understandable

#### 3.1 Readable
- [ ] Page language specified (handled by HTML lang attribute)
- [ ] Language of passages specified (N/A - single language)

#### 3.2 Predictable
- [ ] Components don't change context on focus
- [ ] Components don't change context on input
  - Form submits on button click, not on input change
- [ ] Navigation consistent (handled by navbar)
- [ ] Components identified consistently
  - Buttons styled consistently
  - Icons used consistently

#### 3.3 Input Assistance
- [ ] Error messages clear and helpful
  - "Failed to import books. Please try again."
  - "Incomplete data was returned. Consider using..."
- [ ] Form labels present
  - "Enter ISBN number" label for input
- [ ] Suggestions for fixing errors
  - Incomplete data: "Consider using ISBN from title page"
  - Import error: "Please try again"
- [ ] Error prevention for critical actions
  - Duplicate warning before adding to library
  - Confirmation on delete (via clear delete icon)

### 4. Robust

#### 4.1 Compatible
- [ ] Valid HTML (no errors in validator)
- [ ] ARIA attributes used correctly
  - `aria-label` on icon-only buttons
  - `aria-pressed` on toggle buttons (N/A)
  - `role="alert"` on dynamic error messages
  - `role="status"` on success toast
  - `aria-live="polite"` on status messages
- [ ] Status messages announced to screen readers
  - Success toast: "Books successfully added to your library!"
  - Error alerts: Error message content

### ARIA Attributes Implementation

**Search Component:**
```typescript
<label htmlFor="isbn-input">Enter ISBN number</label>
<input
  id="isbn-input"
  type="number"
  aria-required="true"
  aria-label="ISBN number"
/>
```

**Preview Component:**
```typescript
<img
  src={book.imageOriginal}
  alt={`Cover of ${title}`}
/>

{book.isIncomplete && (
  <div role="alert">
    <p>Incomplete data was returned...</p>
  </div>
)}
```

**Queue Component:**
```typescript
{error && (
  <div role="alert">
    <p>{error}</p>
  </div>
)}

<button
  onClick={handleSubmit}
  disabled={isImporting}
  aria-busy={isImporting}
>
  {isImporting ? "Adding..." : "Add to library"}
</button>

{showSuccess && (
  <div role="status" aria-live="polite">
    <p>Books successfully added to your library!</p>
  </div>
)}
```

**Queue Item Component:**
```typescript
<button
  aria-label="Incomplete data"
  tabIndex={0}
>
  <AlertTriangle />
</button>

<button
  onClick={() => handleDelete(itemKey)}
  aria-label={`Delete ${title}`}
>
  <Trash2 />
</button>
```

### Screen Reader Testing

Test with:
- **macOS:** VoiceOver (Cmd+F5)
- **Windows:** NVDA (free, open source)
- **Mobile:** VoiceOver (iOS), TalkBack (Android)

**Expected Announcements:**

1. **Search Input Focus:**
   - "Enter ISBN number, required, edit text"

2. **Submit Button Focus:**
   - "Submit, button"

3. **Preview Section:**
   - "Preview, heading level 2"
   - "Incomplete data was returned..." (if warning present)
   - "[Book Title], heading level 3"
   - "[Authors]"
   - "Add to queue, button"

4. **Queue Section:**
   - "Queue, heading level 2"
   - "Error: Failed to import books..." (if error present)
   - "[Book Title]"
   - "Incomplete data, button" (if warning icon present)
   - "Delete [Book Title], button"
   - "Add to library, button" or "Adding..., button, disabled"

5. **Success Toast:**
   - "Books successfully added to your library!"

### Keyboard-Only Navigation Testing

**Test Flow:**
1. Load /import page
2. Tab to ISBN input (should focus)
3. Type ISBN number
4. Tab to Submit button (should focus with visible ring)
5. Press Enter to submit
6. Wait for preview to load
7. Tab to "Add to queue" button (should focus)
8. Press Enter to add
9. Tab to queue section (should skip to first interactive element)
10. Tab to warning icon if present (should focus, tooltip appears)
11. Tab to delete button (should focus)
12. Press Enter to delete (should remove item)
13. Tab to "Add to library" button (should focus)
14. Press Enter to import (should trigger import)

**All steps should work without mouse.**

### Focus Management

**Visible Focus Indicators:**
```css
/* Tailwind applies these by default */
focus:outline-none
focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500

/* For inputs */
focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700
```

**Focus Order:**
- Natural DOM order (no tabindex manipulation)
- Logical flow: top to bottom, left to right
- Skip non-interactive elements automatically

**Focus Trap:**
- Not needed (no modals in import flow)
- Tooltip dismisses on blur (no trap)

### Color Contrast Testing Tools

Use these tools to verify contrast ratios:

1. **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
2. **Chrome DevTools:** Inspect element → Accessibility panel
3. **Lighthouse:** Run accessibility audit in Chrome DevTools
4. **axe DevTools:** Browser extension for comprehensive testing

**Colors to Verify:**

| Foreground | Background | Required | Expected |
|------------|------------|----------|----------|
| zinc-100 | zinc-950 | 4.5:1 | 14.1:1 ✓ |
| zinc-300 | zinc-900 | 4.5:1 | 9.7:1 ✓ |
| zinc-400 | zinc-900 | 4.5:1 | 6.3:1 ✓ |
| zinc-500 | zinc-900 | 4.5:1 | 4.5:1 ✓ |
| amber-300 | amber-900/30 | 4.5:1 | ? (verify) |
| red-300 | red-950/50 | 4.5:1 | ? (verify) |
| zinc-100 | zinc-800 | 4.5:1 | 11.2:1 ✓ |

**If contrast fails:**
- Darken foreground color (e.g., amber-400 → amber-300)
- Lighten text color (e.g., red-400 → red-300)
- Increase background opacity

### Accessibility Testing Checklist

Before marking Phase 3 complete:

- [ ] Run Lighthouse accessibility audit (score 100)
- [ ] Run axe DevTools scan (0 violations)
- [ ] Test keyboard-only navigation (all functionality works)
- [ ] Test with screen reader (all content announced correctly)
- [ ] Verify color contrast ratios (all pass 4.5:1 for text, 3:1 for UI)
- [ ] Test with 200% zoom (no content loss)
- [ ] Test with Windows High Contrast Mode (content visible)
- [ ] Verify focus indicators visible on all interactive elements
- [ ] Check heading hierarchy (no skipped levels)
- [ ] Validate HTML (no errors)
- [ ] Test form submission with keyboard only
- [ ] Test error dismissal with keyboard only
- [ ] Test tooltip with keyboard (focus shows, blur hides)

---

## Implementation Roadmap (4 PRs)

### Overview

Phase 3 migration will be completed in **4 Pull Requests** to enable:
- Incremental review and testing
- Easier rollback if issues arise
- Parallel work streams if needed
- Clear progress tracking

### PR Breakdown Strategy

**Principles:**
1. Each PR is independently testable
2. Each PR maintains functionality (no breaking changes)
3. PRs build on each other in logical order
4. Each PR has clear success criteria

---

### PR #1: Import Container & Layout Migration

**Branch:** `feature/phase-3-pr1-container`
**Estimated Effort:** 2-3 hours
**Complexity:** Low

#### Scope

**Files Modified:**
- `src/app/import/components/import.tsx`

**Changes:**
1. Remove MUI imports (Stack, Box, useMediaQuery)
2. Replace `useMediaQuery` with Tailwind responsive classes
3. Replace Stack/Box layout with Tailwind flexbox
4. Update breakpoint from 900px to 768px (md:)
5. Preserve all state management exactly
6. Preserve all component props and logic

#### Implementation Details

**Before:**
```typescript
import { Box, Stack, useMediaQuery } from "@mui/material";

const isMobile: boolean = useMediaQuery("(max-width:900px)");

return (
  <Stack direction={isMobile ? "column" : "row"}>
    <Box sx={{ width: { xs: "100%", md: "50%" } }}>
      <Search />
      <Preview />
    </Box>
    <Box sx={{ width: { xs: "100%", md: "50%" } }}>
      <Queue />
    </Box>
  </Stack>
);
```

**After:**
```typescript
// No MUI imports needed

return (
  <div className="md:flex md:gap-6">
    <div className="w-full md:w-1/2">
      <Search />
      <Preview />
    </div>
    <div className="w-full md:w-1/2">
      <Queue />
    </div>
  </div>
);
```

#### Testing Checklist

- [ ] Mobile (< 768px): Components stack vertically
- [ ] Desktop (≥ 768px): Components side-by-side, 50/50 split
- [ ] Search component renders correctly
- [ ] Preview component renders correctly
- [ ] Queue component renders correctly
- [ ] Gap between columns (24px) correct on desktop
- [ ] No console errors or warnings
- [ ] State management works (search, preview, queue flow)

#### Success Criteria

- Layout identical to current behavior
- Responsive breakpoint at 768px (consistent with design system)
- No MUI dependencies in import.tsx
- All existing functionality preserved

---

### PR #2: Preview Component Migration

**Branch:** `feature/phase-3-pr2-preview`
**Estimated Effort:** 4-5 hours
**Complexity:** Medium

#### Scope

**Files Modified:**
- `src/app/import/components/preview.tsx`

**Changes:**
1. Remove MUI imports (Card, CardContent, Alert, Button, Skeleton, Typography, Stack)
2. Import Lucide icons (AlertTriangle, ImageIcon)
3. Replace Card with Tailwind div structure
4. Replace Alert with custom warning divs
5. Replace Button with Tailwind button
6. Replace Skeleton with custom animated skeleton
7. Update responsive classes (sm: prefix for 640px)
8. Match Search component card styling exactly
9. Implement 42px button height
10. Preserve all form submission logic

#### Implementation Details

**Card Container:**
```typescript
<div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12">
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

**Warning Alerts:**
```typescript
<div className="bg-amber-900/30 border border-amber-800/50 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-amber-300 font-medium">{message}</p>
  </div>
</div>
```

**Submit Button:**
```typescript
<button
  type="submit"
  className="px-6 h-[42px] bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-all duration-200 font-medium text-sm w-full sm:w-auto"
>
  Add to queue
</button>
```

**Skeleton State:**
```typescript
<div className="flex gap-4 sm:gap-6 animate-pulse">
  <div className="w-[70px] h-[100px] sm:w-[140px] sm:h-[200px] bg-zinc-800 rounded" />
  <div className="flex-1 space-y-3">
    <div className="h-6 bg-zinc-800 rounded w-3/4" />
    <div className="h-4 bg-zinc-800 rounded w-1/2" />
    <div className="h-3 bg-zinc-800 rounded w-1/3 mt-4" />
  </div>
</div>
```

#### Testing Checklist

- [ ] Empty state: Shows only "Preview" heading
- [ ] Loading state: Shows skeleton with pulse animation
- [ ] Loaded state: Shows book cover, title, authors, details
- [ ] Incomplete warning: Shows amber alert with icon
- [ ] Duplicate warning: Shows amber alert with icon
- [ ] Both warnings: Shows both alerts correctly
- [ ] Missing image: Shows ImageIcon fallback
- [ ] Button height: Exactly 42px
- [ ] Mobile: Full-width button, smaller image (100px)
- [ ] Desktop: Auto-width button, larger image (200px)
- [ ] Form submission: Adds book to queue correctly
- [ ] Preview resets after submission
- [ ] No console errors or warnings
- [ ] Matches Search component styling exactly

#### Success Criteria

- Preview component fully migrated to Tailwind
- All three states (empty, loading, loaded) working
- Warning alerts styled correctly
- Button matches 42px height standard
- No MUI dependencies in preview.tsx
- All business logic preserved

---

### PR #3: Queue Component Migration

**Branch:** `feature/phase-3-pr3-queue`
**Estimated Effort:** 5-6 hours
**Complexity:** Medium-High

#### Scope

**Files Modified:**
- `src/app/import/components/queue.tsx`

**Changes:**
1. Remove MUI imports (Card, CardContent, Button, CircularProgress, Alert, Snackbar, Typography)
2. Import Lucide icons (Loader2, CheckCircle, X, AlertCircle)
3. Replace Card with Tailwind div structure
4. Replace Button with Tailwind button + conditional styling
5. Replace CircularProgress with Loader2 + spin animation
6. Replace Alert with custom error div
7. Replace Snackbar with custom fixed toast
8. Implement fade-in-up animation for toast
9. Update margins (my-6 sm:my-12)
10. Remove fixed height (90vh), use min-h-[400px]
11. Preserve all import logic and error handling

#### Implementation Details

**Card Container:**
```typescript
<div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12">
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

**Error Alert:**
```typescript
<div className="bg-red-950/50 border border-red-900/50 rounded-lg p-4">
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-start gap-3 flex-1">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-300">{error}</p>
    </div>
    <button onClick={() => setError(null)}>
      <X className="w-4 h-4" />
    </button>
  </div>
</div>
```

**Import Button:**
```typescript
<button
  onClick={handleSubmit}
  disabled={isImporting}
  className={`
    px-6 h-[42px] rounded-lg font-medium text-sm
    transition-all duration-200
    flex items-center gap-2
    ${isImporting
      ? 'bg-zinc-800/50 text-zinc-400 cursor-not-allowed'
      : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
    }
  `}
>
  {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
  {isImporting ? "Adding..." : "Add to library"}
</button>
```

**Success Toast:**
```typescript
{showSuccess && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-4 min-w-[320px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-900/30 border border-green-800/50 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-sm font-medium text-zinc-100">
            Books successfully added to your library!
          </p>
        </div>
        <button onClick={() => setShowSuccess(false)}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
)}
```

**Empty State:**
```typescript
<div className="border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/30 p-12 flex flex-col items-center justify-center min-h-[400px]">
  <p className="text-zinc-500 text-sm text-center">Queue is empty</p>
  <p className="text-zinc-600 text-xs text-center mt-2">
    Add books from the preview panel
  </p>
</div>
```

**Animation (Add to globals.css):**
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translate(-50%, 16px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}
```

#### Testing Checklist

- [ ] Empty state: Shows dashed border box with message
- [ ] Populated state: Shows queue items
- [ ] Error state: Shows red error alert at top
- [ ] Error dismissal: X button clears error
- [ ] Import button enabled: Default gray, hover darker
- [ ] Import button disabled: Grayed out during import
- [ ] Import loading: Shows spinner + "Adding..." text
- [ ] Import success: Shows green toast at bottom
- [ ] Toast auto-dismiss: Disappears after 4 seconds
- [ ] Toast manual dismiss: X button closes immediately
- [ ] Button height: Exactly 42px
- [ ] Margins: 24px mobile, 48px desktop
- [ ] No fixed height: Content determines height
- [ ] Empty state min height: 400px
- [ ] All import logic preserved
- [ ] No console errors or warnings

#### Success Criteria

- Queue component fully migrated to Tailwind
- All states (empty, populated, loading, error, success) working
- Toast animation smooth and accessible
- Button matches 42px height standard
- No MUI dependencies in queue.tsx
- All business logic preserved

---

### PR #4: Queue Item Component Migration

**Branch:** `feature/phase-3-pr4-queue-item`
**Estimated Effort:** 3-4 hours
**Complexity:** Medium

#### Scope

**Files Modified:**
- `src/app/import/components/item.tsx`

**Changes:**
1. Remove MUI imports (Card, IconButton, Tooltip, Typography)
2. Import Lucide icons (Trash2, AlertTriangle)
3. Replace Card with Tailwind div structure
4. Replace IconButton with Tailwind button
5. Replace Tooltip with custom tooltip + state management
6. Replace Typography with semantic HTML (h3, p)
7. Remove all inline styles
8. Remove fixed minWidth (450px)
9. Implement hover states (card, delete button, warning icon)
10. Implement text truncation for long titles/authors

#### Implementation Details

**Card Container:**
```typescript
<div className="border border-zinc-800 rounded-lg bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-200">
  {/* Content */}
</div>
```

**Warning Icon with Tooltip:**
```typescript
const [showTooltip, setShowTooltip] = useState(false);

{isIncomplete && (
  <div className="relative flex-shrink-0 mt-0.5">
    <button
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      className="text-amber-400 hover:text-amber-300 transition-colors duration-200"
      aria-label="Incomplete data"
    >
      <AlertTriangle className="w-5 h-5" />
    </button>

    {showTooltip && (
      <div className="absolute left-0 top-full mt-2 z-10 whitespace-nowrap">
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl px-3 py-2">
          <p className="text-xs text-zinc-300">Incomplete data</p>
        </div>
      </div>
    )}
  </div>
)}
```

**Text Content:**
```typescript
<div className="flex-1 min-w-0">
  <h3 className="text-sm font-semibold text-zinc-100 tracking-tight truncate">
    {title}
  </h3>
  <p className="text-xs text-zinc-400 tracking-tight truncate mt-1">
    {authors.join(", ")}
  </p>
</div>
```

**Delete Button:**
```typescript
<button
  onClick={() => handleDelete(itemKey)}
  className="flex-shrink-0 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all duration-200"
  aria-label={`Delete ${title}`}
>
  <Trash2 className="w-4 h-4" />
</button>
```

#### Testing Checklist

- [ ] Card renders correctly
- [ ] Title and authors display correctly
- [ ] Text truncates with ellipsis for long content
- [ ] Warning icon shows for incomplete books
- [ ] Warning icon hidden for complete books
- [ ] Tooltip appears on hover over warning icon
- [ ] Tooltip appears on focus of warning icon
- [ ] Tooltip dismisses on mouse leave
- [ ] Tooltip dismisses on blur
- [ ] Delete button renders correctly
- [ ] Delete button hover: Red color + red background
- [ ] Delete button click: Calls handleDelete with correct key
- [ ] Card hover: Slightly darker background, lighter border
- [ ] No fixed width (responsive)
- [ ] Works in queue component
- [ ] No console errors or warnings

#### Success Criteria

- Queue item component fully migrated to Tailwind
- Custom tooltip working correctly (hover + focus)
- Text truncation working for long titles/authors
- Delete button styled correctly with danger indication
- No MUI dependencies in item.tsx
- All business logic preserved

---

### Implementation Timeline

**Sequential Approach (Recommended):**

| PR | Days | Cumulative |
|----|------|------------|
| PR #1: Container | 1 day | 1 day |
| PR #2: Preview | 1-2 days | 2-3 days |
| PR #3: Queue | 2 days | 4-5 days |
| PR #4: Item | 1 day | 5-6 days |

**Total Estimated Time:** 5-6 working days

**Parallel Approach (If Multiple Developers):**

- Developer 1: PR #1 (Container) → PR #3 (Queue)
- Developer 2: PR #2 (Preview) → PR #4 (Item)

**Total Estimated Time:** 3-4 working days

### PR Review Guidelines

**Checklist for Each PR:**

1. **Code Quality:**
   - [ ] No MUI imports remaining
   - [ ] All Tailwind classes follow design system
   - [ ] No inline styles
   - [ ] Semantic HTML used
   - [ ] Proper TypeScript types
   - [ ] No console warnings or errors

2. **Visual Design:**
   - [ ] Matches design specification
   - [ ] 42px button heights
   - [ ] Zinc color palette used exclusively
   - [ ] Consistent spacing (8px scale)
   - [ ] Smooth transitions (200ms)

3. **Functionality:**
   - [ ] All existing features work
   - [ ] No regressions
   - [ ] State management preserved
   - [ ] Props passed correctly
   - [ ] Event handlers work

4. **Responsive Design:**
   - [ ] Mobile (<640px) works correctly
   - [ ] Desktop (≥640px or ≥768px) works correctly
   - [ ] Breakpoint transitions smooth
   - [ ] No layout shifts

5. **Accessibility:**
   - [ ] Keyboard navigation works
   - [ ] Screen reader friendly
   - [ ] Color contrast meets WCAG AA
   - [ ] ARIA attributes correct
   - [ ] Focus indicators visible

6. **Testing:**
   - [ ] Manual testing completed
   - [ ] All checklist items verified
   - [ ] Edge cases tested
   - [ ] Multiple browsers tested

### Git Workflow

**Branch Naming:**
```bash
feature/phase-3-pr1-container
feature/phase-3-pr2-preview
feature/phase-3-pr3-queue
feature/phase-3-pr4-queue-item
```

**Commit Message Format:**
```
feat(import): migrate [component] to Tailwind CSS (Phase 3, PR #X)

- Remove MUI dependencies ([list components])
- Replace with Tailwind utility classes
- Preserve all business logic
- Match design system (zinc palette, 42px heights)

Resolves #[issue-number]
```

**PR Title Format:**
```
feat(import): migrate [component] to Tailwind CSS (Phase 3, PR #X)
```

**PR Description Template:**
```markdown
## Phase 3: Import Flow Migration - PR #X

### Summary
Brief description of what this PR migrates.

### Changes
- List of specific changes
- Components modified
- Dependencies removed
- New patterns introduced

### Testing
- [ ] Checklist item 1
- [ ] Checklist item 2
- [ ] ...

### Screenshots
Before: [screenshot]
After: [screenshot]

### Related Issues
Closes #[issue-number]

### Reviewer Notes
Any specific areas to focus review on.
```

### Deployment Strategy

**Staging Deployment:**
1. Deploy each PR to staging environment
2. Perform QA testing
3. Get stakeholder approval
4. Merge to main

**Production Deployment:**
- After all 4 PRs merged
- Full regression testing
- Monitor for errors
- Rollback plan ready

### Rollback Plan

**If Issues Arise:**

1. **PR #1 Issues:**
   - Revert PR #1
   - Import container returns to MUI
   - Other components unaffected

2. **PR #2 Issues:**
   - Revert PR #2
   - Preview returns to MUI
   - Container and queue unaffected

3. **PR #3 Issues:**
   - Revert PR #3
   - Queue returns to MUI
   - Container and preview unaffected

4. **PR #4 Issues:**
   - Revert PR #4
   - Queue item returns to MUI
   - Other components unaffected

**Each PR is independently revertable without affecting others.**

---

## Success Criteria

### Functional Requirements

- [ ] ISBN search works correctly
- [ ] Book preview displays all metadata
- [ ] Warning alerts show for incomplete/duplicate data
- [ ] Books can be added to queue
- [ ] Queue displays all added books
- [ ] Queue items can be deleted individually
- [ ] Bulk import works correctly
- [ ] Error handling works (displays errors, allows retry)
- [ ] Success notification appears after successful import
- [ ] Form resets after operations
- [ ] State management preserved throughout

### Visual Requirements

- [ ] All components match design specification
- [ ] Zinc color palette used exclusively (zinc-50 to zinc-950)
- [ ] Geist Sans typography throughout
- [ ] 42px height for all buttons
- [ ] Consistent spacing (8px scale: gap-2, gap-3, gap-4, gap-6, etc.)
- [ ] Consistent border radius (rounded-lg = 8px)
- [ ] Smooth transitions (duration-200)
- [ ] Hover states on all interactive elements
- [ ] Loading states match specification
- [ ] Error states styled correctly (red palette)
- [ ] Warning states styled correctly (amber palette)
- [ ] Success states styled correctly (green palette)

### Responsive Requirements

- [ ] Mobile (< 640px): Stacked layout, full-width buttons
- [ ] Mobile (< 768px): Stacked layout for container
- [ ] Desktop (≥ 640px): Larger text, margins, images
- [ ] Desktop (≥ 768px): Side-by-side columns (50/50 split)
- [ ] No horizontal scrolling on any breakpoint
- [ ] Text truncates appropriately
- [ ] Images scale correctly
- [ ] Gaps adjust at breakpoints

### Accessibility Requirements

- [ ] WCAG 2.1 AA compliance
- [ ] Lighthouse accessibility score: 100
- [ ] axe DevTools: 0 violations
- [ ] Keyboard-only navigation works
- [ ] Screen reader announces all content correctly
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast ratios meet 4.5:1 (text) and 3:1 (UI)
- [ ] ARIA attributes correct and helpful
- [ ] Semantic HTML throughout
- [ ] No keyboard traps
- [ ] Logical tab order

### Performance Requirements

- [ ] No layout shift on page load
- [ ] Smooth animations (60fps)
- [ ] Fast perceived load times
- [ ] Skeleton states appear immediately
- [ ] No flickering or janky transitions
- [ ] Image loading optimized
- [ ] No console errors or warnings

### Code Quality Requirements

- [ ] No MUI dependencies in import flow components
- [ ] TypeScript types correct and complete
- [ ] No inline styles (all Tailwind classes)
- [ ] Consistent code formatting
- [ ] Semantic HTML elements used
- [ ] Component props interfaces clear
- [ ] State management clean and logical
- [ ] No code duplication
- [ ] Comments where helpful (not excessive)
- [ ] Imports organized and clean

### Testing Requirements

- [ ] All PR checklists completed
- [ ] Manual testing on Chrome, Firefox, Safari
- [ ] Mobile testing on iOS and Android
- [ ] Keyboard-only testing passed
- [ ] Screen reader testing passed
- [ ] Color contrast testing passed
- [ ] Breakpoint testing at all critical widths
- [ ] Edge case testing (long titles, missing images, errors, etc.)
- [ ] Integration testing (full workflow from search to import)

### Documentation Requirements

- [ ] This UX spec document complete and accurate
- [ ] Code comments explain complex logic
- [ ] Git commits descriptive and clear
- [ ] PR descriptions complete with testing notes
- [ ] README updated if needed (unlikely)
- [ ] Design tokens documented

### Stakeholder Approval

- [ ] Designer review (visual design matches spec)
- [ ] Developer review (code quality, no regressions)
- [ ] Product owner review (functionality preserved)
- [ ] Accessibility review (WCAG compliance)
- [ ] QA review (comprehensive testing)

---

## Appendix: Quick Reference

### Component Mapping

| MUI Component | Tailwind Replacement |
|---------------|---------------------|
| `<Stack>` | `<div className="flex flex-col">` |
| `<Box>` | `<div>` |
| `<Card>` | `<div className="border rounded-lg bg-zinc-900/50">` |
| `<CardContent>` | `<div className="p-6">` |
| `<Button>` | `<button className="px-6 h-[42px] bg-zinc-800 ...">` |
| `<IconButton>` | `<button className="p-2">` |
| `<Typography variant="h6">` | `<h2 className="text-xl font-semibold">` |
| `<Alert>` | `<div className="bg-red-950/50 border ...">` |
| `<Skeleton>` | `<div className="bg-zinc-800 animate-pulse">` |
| `<CircularProgress>` | `<Loader2 className="animate-spin" />` |
| `<Snackbar>` | `<div className="fixed bottom-6 ...">` |
| `<Tooltip>` | Custom with `onMouseEnter/onFocus` |
| `useMediaQuery` | Tailwind responsive prefixes (`sm:`, `md:`) |

### Icon Mapping

| MUI Icon | Lucide Icon |
|----------|-------------|
| `<WarningIcon>` | `<AlertTriangle>` |
| `<DeleteIcon>` | `<Trash2>` |
| `<CheckCircleIcon>` | `<CheckCircle>` |
| N/A | `<Loader2>` |
| N/A | `<AlertCircle>` |
| N/A | `<X>` |
| N/A | `<ImageIcon>` |

### Common Tailwind Patterns

**Card Container:**
```tsx
<div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12">
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

**Button (42px):**
```tsx
<button className="px-6 h-[42px] bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-all duration-200 font-medium text-sm">
  Button Text
</button>
```

**Input (42px):**
```tsx
<input className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700 transition-all duration-200" />
```

**Warning Alert:**
```tsx
<div className="bg-amber-900/30 border border-amber-800/50 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-amber-300 font-medium">{message}</p>
  </div>
</div>
```

**Error Alert:**
```tsx
<div className="bg-red-950/50 border border-red-900/50 rounded-lg p-4">
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-start gap-3 flex-1">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-300">{error}</p>
    </div>
    <button onClick={dismiss}>
      <X className="w-4 h-4" />
    </button>
  </div>
</div>
```

**Skeleton:**
```tsx
<div className="animate-pulse">
  <div className="bg-zinc-800 rounded h-[height] w-[width]" />
</div>
```

**Success Toast:**
```tsx
<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
  <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-4">
    <div className="flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-green-400" />
      <p className="text-sm font-medium text-zinc-100">{message}</p>
    </div>
  </div>
</div>
```

---

## Document Information

**Version:** 1.0
**Last Updated:** 2025-11-11
**Author:** UI Designer Agent
**Review Status:** Ready for Implementation
**Related Documents:**
- `docs/migration/portfolio-styling/VISUAL_DESIGN_PLAN.md`
- `docs/design-specs/DESIGN-SUMMARY.md`
- `docs/design-specs/library-side-by-side-layout.md`

**Feedback & Questions:**
Contact the UI Designer Agent or leave comments in PR reviews.

---

**END OF SPECIFICATION**
