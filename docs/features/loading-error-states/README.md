# Loading & Error States Feature

Comprehensive loading and error states across the application for improved user experience and perceived performance.

## Overview

This feature adds skeleton loaders, loading spinners, empty states, error handling with retry functionality, and client-side image caching to eliminate visual glitches and provide better user feedback.

## Documentation Files

- **[LOADING_ERROR_STATES_DESIGN_SPEC.md](./LOADING_ERROR_STATES_DESIGN_SPEC.md)** - Design specifications
  - Component specifications
  - Design patterns
  - Implementation approach

- **[LOADING_ERROR_STATES_QUICK_REFERENCE.md](./LOADING_ERROR_STATES_QUICK_REFERENCE.md)** - Quick reference
  - Key features overview
  - Usage examples
  - Component patterns

- **[LOADING_ERROR_STATES_VISUAL_GUIDE.md](./LOADING_ERROR_STATES_VISUAL_GUIDE.md)** - Visual guide
  - Visual design details
  - UI states
  - User flows

## Key Features

### Loading States
- Skeleton loaders for book lists and cards
- Loading spinners on action buttons
- Image loading states with smooth transitions
- Client-side image caching (Map-based)

### Error States
- Error handling with retry functionality
- Empty states with helpful CTAs
- No results state (empty search)
- No books state (empty library)

### Image Handling
- Proper state reset when book changes (prevents "blip" effect)
- JavaScript Map-based cache for instant repeat loads
- Smooth opacity transitions on image load
- Error fallback with placeholder icon

## Implementation

**Modified Files:**
- `/src/app/library/components/list.tsx` - Skeleton loaders for book cards
- `/src/app/library/components/library.tsx` - Empty states
- `/src/app/import/components/queue.tsx` - Button loading states
- `/src/app/library/components/intelligentSearch.tsx` - Error handling with retry
- `/src/app/library/components/item.tsx` - Image caching and loading
- `/src/app/library/components/details.tsx` - Image caching and loading

## Components Used

- **Material-UI:** Skeleton, CircularProgress, Alert, Snackbar
- **Icons:** ImageIcon (fallback for missing covers)
- **Patterns:** JavaScript Map for caching, state management for loading states

## Performance Impact

- **Reduced network requests** - Cached images don't re-fetch
- **Instant display** - Cached images show immediately
- **Perceived performance** - Skeleton screens improve perceived speed
- **No layout shift** - Proper loading states prevent content jumps

## Pull Request

- **PR #25:** https://github.com/moonejon/penumbra/pull/25
- **Status:** Merged to main
- **Date:** November 10, 2025
- **Changes:** 9 files changed, 4,384+ lines
