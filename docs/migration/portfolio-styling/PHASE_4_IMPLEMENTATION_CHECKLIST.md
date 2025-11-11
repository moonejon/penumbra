# Phase 4 Implementation Checklist

Use this as a working document to track progress during implementation.

## Pre-Implementation

- [ ] Review full audit document (`PHASE_4_MUI_CLEANUP_AUDIT.md`)
- [ ] Review quick summary (`PHASE_4_QUICK_SUMMARY.md`)
- [ ] Make DataGrid decision (Option A, B, C, or D)
- [ ] Document decision in audit report
- [ ] Create feature branch: `git checkout -b phase-4-mui-cleanup`
- [ ] Ensure dev server can build: `npm run build`

## Phase 4.1: Home Page Migration

**File:** `src/app/page.tsx`

- [ ] Remove MUI imports (`Container`, `Grid`)
- [ ] Replace with Tailwind layout
- [ ] Test home page loads
- [ ] Check responsive at mobile/tablet/desktop
- [ ] Commit changes: `git commit -m "Phase 4.1: Migrate home page from MUI to Tailwind"`

## Phase 4.2: Library Filters Migration

**Files:** `src/app/library/components/filters.tsx`, `src/app/library/components/textSearch.tsx`

### filters.tsx
- [ ] Remove MUI imports (`Container`, `Stack`)
- [ ] Replace `Container` with Tailwind container
- [ ] Replace `Stack` with Tailwind flex layout
- [ ] Verify spacing matches design system

### textSearch.tsx
- [ ] Remove MUI import (`TextField`)
- [ ] Decide: Use existing Input component OR create custom styled input
- [ ] Implement replacement input
- [ ] Preserve label styling
- [ ] Preserve debounce functionality
- [ ] Verify search functionality works

### Testing
- [ ] Visit /library page
- [ ] Test title search with various inputs
- [ ] Verify debounce behavior (500ms delay)
- [ ] Test authors filter dropdown
- [ ] Test subjects filter dropdown
- [ ] Test filter combinations
- [ ] Verify URL parameters update correctly
- [ ] Check responsive layout at all breakpoints
- [ ] Commit changes: `git commit -m "Phase 4.2: Migrate library filters from MUI to Tailwind"`

## Phase 4.3: Dashboard Header Migration

**File:** `src/app/dashboard/page.tsx`

- [ ] Remove MUI imports (`Container`, `Typography`)
- [ ] Replace `Container` with Tailwind container
- [ ] Replace `Typography h3` with Tailwind heading
- [ ] Match heading size (text-3xl or text-2xl)
- [ ] Verify spacing (mb-4 for gutterBottom)

### Testing
- [ ] Visit /dashboard page
- [ ] Verify heading renders correctly
- [ ] Check container padding matches other pages
- [ ] Verify Grid component still works
- [ ] Check responsive behavior
- [ ] Commit changes: `git commit -m "Phase 4.3: Migrate dashboard header from MUI to Tailwind"`

## Phase 4.4: Dashboard DataGrid Migration

**Decision Made:** [ ] Option A (TanStack) [ ] Option B (AG Grid) [ ] Option C (Custom) [ ] Option D (Defer)

### If Option D (Defer):
- [ ] Skip this section
- [ ] Document decision in audit report
- [ ] Update this checklist with "DEFERRED" status
- [ ] Note: Keep `@mui/x-data-grid` in dependencies

### If Option A (TanStack Table):

#### Installation
- [ ] Run: `npm install @tanstack/react-table`
- [ ] Verify installation successful

#### Implementation
- [ ] Create `src/components/ui/table.tsx` base component
- [ ] Style table with Tailwind (borders, spacing, colors)
- [ ] Create table header styles
- [ ] Create table row styles (hover states)
- [ ] Create pagination controls component
- [ ] Test base table component in isolation

#### Grid Component Migration
- [ ] Open `src/app/dashboard/components/grid.tsx`
- [ ] Define column definitions for all 7 fields
- [ ] Implement `useReactTable` hook
- [ ] Replace MUI DataGrid with TanStack Table
- [ ] Implement pagination
- [ ] Add sorting (optional)
- [ ] Style to match design system
- [ ] Handle empty state
- [ ] Handle loading state (if needed)

#### Testing
- [ ] Visit /dashboard page
- [ ] Verify all columns display: title, authors, binding, publisher, pageCount, datePublished, isbn13
- [ ] Test pagination (next/previous)
- [ ] Verify page size controls (if implemented)
- [ ] Test sorting (if implemented)
- [ ] Check responsive behavior at all breakpoints
- [ ] Test with empty dataset
- [ ] Test with large dataset (performance)
- [ ] Verify no console errors
- [ ] Commit changes: `git commit -m "Phase 4.4: Migrate dashboard grid to TanStack Table"`

### If Option B (AG Grid):
- [ ] Run: `npm install ag-grid-react ag-grid-community`
- [ ] Implement AG Grid component
- [ ] Customize theme to match design system
- [ ] Test thoroughly
- [ ] Commit changes

### If Option C (Custom):
- [ ] Design custom table component
- [ ] Implement table structure
- [ ] Add pagination
- [ ] Add sorting
- [ ] Add filtering (if needed)
- [ ] Style with Tailwind
- [ ] Test thoroughly
- [ ] Commit changes

## Phase 4.5: Package Cleanup

### Before Cleanup
- [ ] Verify all previous phases committed
- [ ] Ensure all MUI imports removed from source (except DataGrid if deferred)
- [ ] Run build: `npm run build` - must succeed
- [ ] Test all pages manually one final time

### Remove Packages

**If DataGrid Migrated (Option A, B, or C):**
- [ ] Run: `npm uninstall @mui/material @mui/icons-material @mui/material-nextjs @mui/x-data-grid @emotion/cache @emotion/server @emotion/styled`

**If DataGrid Deferred (Option D):**
- [ ] Run: `npm uninstall @mui/material @mui/icons-material @mui/material-nextjs @emotion/cache @emotion/server @emotion/styled`
- [ ] Verify `@mui/x-data-grid` remains in package.json

### Post-Cleanup Verification
- [ ] Delete node_modules: `rm -rf node_modules`
- [ ] Delete package-lock.json: `rm package-lock.json`
- [ ] Reinstall: `npm install`
- [ ] Build project: `npm run build`
- [ ] Check build output for warnings/errors
- [ ] Start dev server: `npm run dev`

### Final Testing
- [ ] Home page (/)
  - [ ] Page loads without errors
  - [ ] Layout correct
  - [ ] No console errors
  
- [ ] Library page (/library)
  - [ ] Page loads
  - [ ] Search works (title, authors, subjects)
  - [ ] Filters function correctly
  - [ ] Pagination works
  - [ ] Book details display
  - [ ] No console errors

- [ ] Import page (/import)
  - [ ] Page loads
  - [ ] Search functionality works
  - [ ] Import features work
  - [ ] No console errors

- [ ] Dashboard page (/dashboard)
  - [ ] Page loads
  - [ ] Header displays correctly
  - [ ] Grid/table displays all books
  - [ ] Pagination works
  - [ ] No console errors

- [ ] Browser Console
  - [ ] No MUI-related warnings
  - [ ] No missing dependency errors
  - [ ] No runtime errors

- [ ] Network Tab
  - [ ] Check bundle size reduction
  - [ ] Verify no MUI chunks loading
  - [ ] Verify performance maintained

### Documentation
- [ ] Update `PHASE_4_MUI_CLEANUP_AUDIT.md` status to COMPLETED
- [ ] Document actual bundle size reduction
- [ ] Note any deviations from plan
- [ ] Update this checklist with completion date
- [ ] Commit changes: `git commit -m "Phase 4.5: Remove MUI dependencies and verify cleanup"`

## Post-Implementation

- [ ] Push branch to remote: `git push -u origin phase-4-mui-cleanup`
- [ ] Create pull request
- [ ] Add PR description with summary of changes
- [ ] Link to audit document in PR
- [ ] Request review
- [ ] Address any review comments
- [ ] Merge to main
- [ ] Delete feature branch
- [ ] Update `CLAUDE_PROGRESS.md` with Phase 4 completion

## Rollback Plan (If Needed)

If issues arise:
- [ ] Identify the problem
- [ ] Check commit history: `git log`
- [ ] Revert specific commit: `git revert <commit-hash>`
- [ ] OR reset to previous state: `git reset --hard <commit-hash>`
- [ ] Reinstall dependencies: `npm install`
- [ ] Document what went wrong
- [ ] Plan fix or alternative approach

## Success Metrics

Record actual results:

- **Bundle Size Reduction:** _______ MB (Target: 4-5 MB)
- **Build Time:** _______ seconds
- **Pages Tested:** ___ / 4 passing
- **Accessibility:** [ ] WCAG 2.1 AA maintained
- **Console Errors:** [ ] Zero errors
- **Completion Date:** ___________
- **Total Time Spent:** _______ hours

## Notes & Issues

Use this space to document any issues, decisions, or deviations:

---

**Status:** [ ] Not Started [ ] In Progress [ ] Completed [ ] Blocked

**Completed By:** _________________

**Date Completed:** _________________

---
