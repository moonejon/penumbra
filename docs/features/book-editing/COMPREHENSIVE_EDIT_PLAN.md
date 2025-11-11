# Comprehensive Book Edit Feature Plan

**Created:** November 11, 2025
**Branch:** `book-edit-features`
**Status:** Planning Phase

---

## Executive Summary

This document consolidates the comprehensive plans from frontend-dev, fullstack-dev, and ux-designer agents for implementing robust book editing functionality across the Penumbra application.

### Features Overview

1. **Pre-Import Editing** - Edit incomplete book data before or during import queue
2. **Library Item Editing** - Edit existing books in library, sync to DB
3. **Cover Image Management** - Upload custom images, search for cover options
4. **Manual Book Entry** - Add custom books not in ISBNDB
5. **Re-fetch from ISBNDB** - Refresh book data from external API
6. **Field Validation** - Comprehensive, elegant validation

---

## Architecture Overview

### Tech Stack Additions
- **Image Storage:** Vercel Blob Storage
- **Form Management:** React Hook Form (already installed)
- **Validation:** Custom validators with ISBN checksum validation

### Database Schema Changes

**New fields in Book model:**
```prisma
model Book {
  // ... existing fields

  customImage     String?        // User-uploaded cover image URL
  isManualEntry   Boolean        @default(false)
  lastFetchedAt   DateTime?      // Last ISBNDB fetch
  lastEditedAt    DateTime       @default(now()) @updatedAt

  // Updated constraints
  @@unique([isbn13, ownerId])  // Allow same book for different users
  @@unique([isbn10, ownerId])
}
```

---

## Component Architecture

### New Components

1. **BookForm** (`/src/components/forms/BookForm.tsx`)
   - Reusable form for all edit scenarios
   - Modes: 'create' | 'edit' | 'queue-edit'
   - Integrated validation and field components

2. **ImageManager** (`/src/components/forms/ImageManager.tsx`)
   - Tabbed interface: Current | Search | Upload
   - Image search from multiple providers
   - Drag-and-drop upload with preview

3. **Field Components** (`/src/components/forms/fields/`)
   - TextField, TextArea, NumberField, DateField
   - ArrayField (for authors, subjects)
   - Consistent styling with zinc theme

4. **Modal** (`/src/components/ui/Modal.tsx`)
   - Reusable modal container
   - Backdrop blur, keyboard shortcuts
   - Focus trap for accessibility

### Modified Components

1. **Preview** (`/src/app/import/components/preview.tsx`)
   - Add "Edit Before Queue" button
   - Open BookForm modal

2. **Queue Item** (`/src/app/import/components/item.tsx`)
   - Add edit icon button
   - Pass edit handler from Queue

3. **Details** (`/src/app/library/components/details.tsx`)
   - Add Edit and Re-fetch buttons
   - Toggle between view/edit modes

---

## API Architecture

### Server Actions

**File:** `/src/utils/actions/books.ts`

```typescript
// Update existing book (library edit)
async function updateBook(
  bookId: number,
  updates: BookUpdateInput
): Promise<{ success: boolean; book?: BookType; error?: string }>

// Create manual book entry
async function createManualBook(
  bookData: BookCreateInput
): Promise<{ success: boolean; book?: BookType; error?: string }>

// Re-fetch from ISBNDB
async function refetchBookMetadata(
  bookId: number
): Promise<{ success: boolean; book?: BookType; error?: string }>
```

### API Routes

**Image Upload:** `/src/app/api/upload/cover-image/route.ts`
- Accepts multipart/form-data
- Validates file type (JPEG, PNG, WebP) and size (max 5MB)
- Uploads to Vercel Blob Storage
- Returns public URL

**Image Search:** `/src/app/api/search/cover-images/route.ts`
- Searches Google Books and Open Library
- Returns array of image URLs
- Caches results client-side

---

## Validation Strategy

### Server-Side Validation

**ISBN-13 Validation:**
- Format: 13 digits starting with 978 or 979
- Checksum validation (weighted sum modulo 10)

**ISBN-10 Validation:**
- Format: 9 digits + digit or X
- Checksum validation (weighted sum modulo 11)

**Field Validations:**
- Title: Required, max 500 chars
- Authors: Required, min 1 author
- Page count: 1-10,000
- Date published: YYYY-MM-DD format
- Synopsis: Max 5,000 chars

### Client-Side Validation

**Real-time (on change):**
- Character limits
- Number ranges
- Format patterns

**On blur:**
- ISBN checksum (expensive calculation)
- Date parsing
- Array completeness

**On submit:**
- Complete form validation
- Required field checks
- Cross-field validation

---

## Image Management

### Storage: Vercel Blob Storage

**Why Vercel Blob?**
- Native Vercel integration
- Automatic CDN distribution
- No additional infrastructure
- Simple API

**File Organization:**
```
book-covers/
  {userId}/
    {timestamp}-{random}-{filename}
```

### Upload Flow

1. User selects/drops image
2. Client-side validation (type, size)
3. Upload to API route
4. Server validates again
5. Upload to Vercel Blob
6. Return public URL
7. Save URL in database

### Search Flow

1. User enters ISBN or title
2. Parallel search: Google Books + Open Library
3. Aggregate and deduplicate results
4. Display in grid (2-3 columns)
5. User selects image
6. Save URL in database

### Display Priority

1. `customImage` (user-uploaded) - highest
2. `imageOriginal` (ISBNDB high-res)
3. `image` (ISBNDB standard)
4. Fallback placeholder

---

## User Flows

### Flow 1: Edit Before Import

```
Search ISBN → Preview shows incomplete data
  → Click "Edit Before Queue"
  → Modal opens with editable fields
  → Edit title, authors, etc.
  → Upload custom cover (optional)
  → Save
  → Preview updates
  → Add to Queue
  → Import to library
```

### Flow 2: Edit Queue Item

```
Import page → Queue has 3 books
  → Click edit icon on 2nd book
  → Modal opens with current data
  → Edit fields
  → Save
  → Queue item updates
  → Proceed with import
```

### Flow 3: Edit Library Book

```
Library → Click book card
  → Details panel opens
  → Click "Edit" button
  → Form appears (inline or modal)
  → Edit fields
  → Upload new cover
  → Save
  → Details view updates
  → Database synced
```

### Flow 4: Re-fetch Metadata

```
Library → Open book details
  → Click "Re-fetch" button
  → Loading indicator
  → Fetch latest from ISBNDB
  → Compare old vs new
  → Confirmation dialog if significant changes
  → Apply updates (preserve customImage)
  → Show success message
```

### Flow 5: Manual Entry

```
Library → Click "Add Manual Book"
  → Modal opens with empty form
  → Fill in title, authors, etc.
  → ISBN optional
  → Upload cover image
  → Save
  → Book appears in library
  → Marked as manual entry
```

---

## UI/UX Design

### Form Layout

**Desktop (Modal):**
- Two-column: Image manager (left) | Fields (right)
- Scrollable fields area
- Sticky footer with Cancel/Save buttons

**Mobile:**
- Single column, full screen
- Image manager at top
- Collapsible sections for field groups
- Sticky footer buttons

### Field Organization

**Section 1: Cover Image** (always visible)
- Current image display
- Tabs: Current | Search | Upload

**Section 2: Basic Information** (always expanded)
- Title (required)
- Authors (required, tag input)
- ISBN-13 (required)
- ISBN-10 (optional)
- Language (optional)

**Section 3: Publication Details** (expanded by default)
- Publisher, Date, Edition, Binding, Page Count

**Section 4: Content** (collapsed on mobile)
- Synopsis (textarea)
- Subjects (tag input)

### Color & Styling

**Theme:** Zinc-based dark palette (matching portfolio)

**Input States:**
- Default: `border-zinc-800 bg-zinc-900`
- Focus: `ring-2 ring-zinc-600`
- Error: `border-red-500 ring-red-500`
- Disabled: `opacity-50 cursor-not-allowed`

**Validation Feedback:**
- Inline errors: Red text with AlertCircle icon
- Error border on field
- Summary at top for multiple errors

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Create Modal component
- Create field components (TextField, TextArea, etc.)
- Create `useBookForm` hook
- Create validation utilities
- Add ISBN validation functions

**Files Created:**
- `/src/components/ui/Modal.tsx`
- `/src/components/forms/fields/*.tsx`
- `/src/hooks/useBookForm.ts`
- `/src/utils/validation.ts`

### Phase 2: Core Form (Week 2)
- Create BookForm component
- Integrate field components
- Implement validation
- Add loading/error states
- Unsaved changes warning

**Files Created:**
- `/src/components/forms/BookForm.tsx`
- `/src/components/forms/FormSection.tsx`

### Phase 3: Image Management (Week 3)
- Create ImageManager component
- Implement ImageUpload (drag-and-drop)
- Create image search integration
- Build ImageSearchResults grid
- Implement upload API route

**Files Created:**
- `/src/components/forms/ImageManager.tsx`
- `/src/components/forms/ImageUpload.tsx`
- `/src/components/forms/ImageSearchResults.tsx`
- `/src/app/api/upload/cover-image/route.ts`
- `/src/app/api/search/cover-images/route.ts`

### Phase 4: Import Flow Integration (Week 4)
- Modify Preview component
- Modify Item component
- Update Queue component
- Add manual entry button

**Files Modified:**
- `/src/app/import/components/preview.tsx`
- `/src/app/import/components/item.tsx`
- `/src/app/import/components/queue.tsx`

### Phase 5: Library Edit Integration (Week 5)
- Add edit button to Details
- Add re-fetch button
- Implement updateBook action
- Implement refetchBookData action
- Optimistic UI updates

**Files Modified:**
- `/src/app/library/components/details.tsx`
- `/src/utils/actions/books.ts`

**Files Created:**
- `/src/components/forms/DataComparisonModal.tsx`

### Phase 6: Manual Entry & Polish (Week 6)
- Add "Add Manual Entry" to Library
- Create manual entry flow
- Toast notifications
- Animations and transitions
- Accessibility audit

**Files Modified:**
- `/src/app/library/components/library.tsx`

### Phase 7: Database Migration (Can run in parallel)
- Create Prisma migration
- Add new fields (customImage, isManualEntry, etc.)
- Update constraints (ISBN uniqueness)
- Validate migration on dev database

**Files Modified:**
- `prisma/schema.prisma`
- `prisma/migrations/*`

---

## Testing Strategy

### Unit Tests
- ISBN validation (checksum, format)
- Field validation (length, type, required)
- Form state management
- Utility functions

### Integration Tests
- Form submission flows
- Server actions (mocked Prisma)
- API routes (mocked Vercel Blob)
- Image upload validation

### E2E Tests
- Complete import flow with editing
- Library book edit flow
- Manual entry flow
- Image upload and search
- Re-fetch metadata

### Manual Testing
- [ ] Edit in preview (before import)
- [ ] Edit in queue
- [ ] Edit existing library book
- [ ] Upload custom cover
- [ ] Search for covers
- [ ] Re-fetch from ISBNDB
- [ ] Create manual book (with ISBN)
- [ ] Create manual book (without ISBN)
- [ ] Test validation errors
- [ ] Test on mobile
- [ ] Test accessibility (keyboard, screen reader)

---

## Security Considerations

### Authorization
- All update/delete operations check ownership
- Image uploads tied to authenticated user
- No cross-user data modification

### File Upload Security
- Strict MIME type validation
- File size limits (5MB)
- Random suffixes prevent path traversal
- Server-side validation (not just client)

### Input Validation
- All inputs sanitized server-side
- SQL injection prevented by Prisma
- XSS prevented by React (auto-escaping)
- Rate limiting on upload endpoint

---

## Performance Optimization

### Image Optimization
- Client-side compression before upload
- WebP format preferred
- Lazy loading with Next.js Image
- CDN delivery via Vercel Blob

### Database Optimization
- Existing indexes leveraged (ownerId)
- Selective field fetching (Prisma select)
- Single query for updates
- Prisma Accelerate for caching

### Bundle Size
- Code splitting for BookForm
- Dynamic imports for image components
- Tree-shaking unused UI components

---

## Success Metrics

### Functional Requirements
- ✅ Users can edit books before import
- ✅ Users can edit books in queue
- ✅ Users can edit books in library
- ✅ Users can upload custom covers
- ✅ Users can search for covers
- ✅ Users can re-fetch from ISBNDB
- ✅ Users can create manual entries

### Performance Targets
- Form opens in < 300ms
- Image upload in < 5s (5MB file)
- Book update saves in < 1s
- Cover search in < 2s

### Quality Targets
- Test coverage > 85%
- WCAG 2.1 AA compliance
- Mobile responsive (iOS/Android)
- No console errors

---

## Risk Mitigation

### Risk: Database Migration Failure
**Mitigation:**
- Validate no duplicate ISBNs before migration
- Test on copy of production data
- Plan rollback procedure

### Risk: File Upload Abuse
**Mitigation:**
- Rate limiting (10 uploads/minute)
- Monitor Blob storage usage
- Cleanup orphaned images

### Risk: ISBNDB Rate Limiting
**Mitigation:**
- Client cooldown (5s between requests)
- Cache responses (5 minutes)
- Clear error messaging

---

## Open Questions

1. **ISBN Requirement for Manual Entry**
   - Should manual books require at least one ISBN?
   - **Recommendation:** Make optional, allow fully custom books

2. **Re-fetch Behavior**
   - Which fields should be preserved during re-fetch?
   - **Recommendation:** Preserve customImage, visibility, manual edits

3. **Duplicate Books**
   - Should users have multiple copies of same book?
   - **Recommendation:** Allow duplicates, add quantity field later

4. **Edit History**
   - Should we track full edit audit trail?
   - **Recommendation:** Add lastEditedAt now, full history later

---

## Next Steps

1. ✅ Branch created: `book-edit-features`
2. ✅ Comprehensive plan documented
3. **Phase 1:** Begin foundation (Modal, fields, validation)
4. **Review:** Get user feedback on plan
5. **Iterate:** Adjust based on feedback

---

## Estimated Timeline

**Total:** 12-15 days (6 phases)
- Phase 1-2: 4-5 days (Foundation + Core Form)
- Phase 3: 2-3 days (Image Management)
- Phase 4: 2-3 days (Import Flow)
- Phase 5: 2-3 days (Library Edit)
- Phase 6: 1-2 days (Polish)

**Parallel:** Database migration can run alongside phases

---

## Related Documentation

- Frontend Implementation Plan: See agent output above
- Fullstack Architecture Plan: See agent output above
- UX Design Plan: (Output exceeded limits - key points incorporated)
- Current Progress: `/CLAUDE_PROGRESS.md`

---

**Last Updated:** November 11, 2025
**Agents Consulted:** frontend-dev, fullstack-dev, ux-designer
**Status:** Ready for implementation
