# Library Side-by-Side Layout - Implementation Checklist

**Status:** Ready for Development
**Designer:** Claude (UI Designer Agent)
**Date:** 2025-11-10

---

## Pre-Implementation

- [ ] Review full specification: `library-side-by-side-layout.md`
- [ ] Review quick reference: `library-layout-quick-reference.md`
- [ ] Review visual guide: `library-layout-visual-guide.md`
- [ ] Understand current component structure
- [ ] Set up testing environment at different breakpoints

---

## Phase 1: Layout Structure (Core Functionality)

### File: `/Users/jonathan/github/penumbra/src/app/library/components/library.tsx`

- [ ] Import `cn` utility if not already imported
- [ ] Move `<SearchHeader />` outside conditional rendering
- [ ] Wrap empty state check with layout container
- [ ] Add `lg:flex lg:gap-6` wrapper div
- [ ] Create List wrapper with `lg:w-[40%]`
- [ ] Add conditional `hidden lg:block` to List wrapper when book selected
- [ ] Create Details wrapper with responsive classes:
  - [ ] `fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95`
  - [ ] `lg:relative lg:inset-auto lg:z-auto lg:bg-transparent`
  - [ ] `lg:w-[60%] lg:flex-shrink-0`
- [ ] Pass `selectedBookId={selectedBook?.id}` to List component
- [ ] Test mobile behavior (overlay)
- [ ] Test desktop behavior (side-by-side at 1024px)

**Expected Outcome:** Side-by-side layout appears at lg breakpoint, mobile overlay maintained

---

## Phase 2: Selected Card State

### File: `/Users/jonathan/github/penumbra/src/app/library/components/list.tsx`

- [ ] Add `selectedBookId?: string` to `ListProps` type
- [ ] Pass `selectedBookId` prop to each `<Item>` component

### File: `/Users/jonathan/github/penumbra/src/app/library/components/item.tsx`

- [ ] Add `selectedBookId?: string` to `ItemProps` type
- [ ] Update card `className` with conditional selected state:
  - [ ] Add `cn()` utility import if needed
  - [ ] Base: `border-zinc-800 hover:bg-zinc-900/50 hover:border-zinc-700`
  - [ ] Selected: `selectedBookId === book.id && "bg-zinc-900 border-zinc-600 ring-1 ring-zinc-700"`
- [ ] Test selected state appears correctly
- [ ] Test hover states work on both selected and unselected cards

**Expected Outcome:** Selected card has distinct visual highlight

---

## Phase 3: Details Panel Responsiveness

### File: `/Users/jonathan/github/penumbra/src/app/library/components/details.tsx`

- [ ] Update container `className` with responsive width:
  - [ ] Mobile: `w-4/5 max-w-4xl m-8`
  - [ ] Desktop: `lg:w-full lg:m-0`
- [ ] Add sticky positioning: `lg:sticky lg:top-24`
- [ ] Add max-height and overflow:
  - [ ] Container: `flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden`
  - [ ] Content wrapper: `overflow-y-auto`
- [ ] Update padding: `p-6 lg:p-8`
- [ ] Update content gap: `gap-6 lg:gap-8`
- [ ] Test sticky behavior on desktop
- [ ] Test scrolling works correctly
- [ ] Test mobile centering still works

**Expected Outcome:** Details panel responsive, sticky on desktop, scrollable

---

## Phase 4: Keyboard Navigation

### File: `/Users/jonathan/github/penumbra/src/app/library/components/details.tsx`

- [ ] Import `useEffect` if not already imported
- [ ] Add escape key handler:
```tsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelectedBook(undefined);
    }
  };
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [setSelectedBook]);
```
- [ ] Test Escape key closes details

### File: `/Users/jonathan/github/penumbra/src/app/library/components/item.tsx`

- [ ] Add `onKeyDown` handler to card:
```tsx
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    setSelectedBook(book);
  }
}}
```
- [ ] Test Enter key selects book
- [ ] Test Space key selects book

**Expected Outcome:** Full keyboard navigation works

---

## Phase 5: Accessibility (ARIA)

### File: `/Users/jonathan/github/penumbra/src/app/library/components/item.tsx`

- [ ] Add `role="button"` to card div
- [ ] Add `tabIndex={0}` to card div
- [ ] Add `aria-pressed={selectedBookId === book.id}` to card div
- [ ] Add `aria-label` with book title and authors
- [ ] Add focus styles:
  - [ ] `focus:outline-none focus:ring-2 focus:ring-zinc-500`
  - [ ] `focus:ring-offset-2 focus:ring-offset-zinc-950`
- [ ] Test focus indicators visible

### File: `/Users/jonathan/github/penumbra/src/app/library/components/details.tsx`

- [ ] Add `role="dialog"` to container
- [ ] Add `aria-modal="true"` (consider conditional for mobile only)
- [ ] Add `id="book-title"` to title heading
- [ ] Add `aria-labelledby="book-title"` to container
- [ ] Update close button:
  - [ ] Ensure `aria-label="Close details"` is present
  - [ ] Add focus styles to close button
- [ ] Test screen reader announces dialog
- [ ] Test close button is keyboard accessible

**Expected Outcome:** Full WCAG 2.1 AA compliance

---

## Phase 6: Visual Polish

### Optional Typography Enhancements

- [ ] Details title: Consider `text-3xl lg:text-4xl`
- [ ] Details authors: Consider `text-base lg:text-lg`
- [ ] Details synopsis: Consider `text-sm lg:text-base`
- [ ] Details cover: Consider increasing to `w-[240px] h-[360px]`

### Optional Transition Enhancements

- [ ] Ensure all transitions are `duration-200 ease-in-out`
- [ ] Consider adding subtle shadow to selected card:
  - [ ] `hover:shadow-lg hover:shadow-zinc-950/50`

**Expected Outcome:** Enhanced visual hierarchy and polish

---

## Phase 7: Edge Cases

### Test and Handle

- [ ] Selected book not on current page after pagination
  - [ ] Add `useEffect` in library.tsx to clear selection if book not found
- [ ] Very long book titles (wrapping)
- [ ] Many authors (display/truncation)
- [ ] Missing cover images (placeholder)
- [ ] Very long synopsis (scrolling)
- [ ] Empty states still display correctly
- [ ] Loading states (skeletons) don't show selected state

### Implementation for Page Change Handler

In `library.tsx`, add:
```tsx
useEffect(() => {
  if (selectedBook && !books.find(b => b.id === selectedBook.id)) {
    setSelectedBook(undefined);
  }
}, [books, selectedBook]);
```

- [ ] Implement page change handler
- [ ] Test pagination with book selected

**Expected Outcome:** All edge cases handled gracefully

---

## Phase 8: Responsive Testing

### Breakpoints to Test

- [ ] 375px - iPhone SE (mobile overlay)
- [ ] 390px - iPhone 12 Pro (mobile overlay)
- [ ] 768px - iPad Mini (mobile overlay)
- [ ] 1023px - Just below lg (mobile overlay)
- [ ] 1024px - At lg breakpoint (side-by-side activates)
- [ ] 1280px - Standard laptop (side-by-side)
- [ ] 1920px - Desktop (side-by-side)

### Specific Tests

- [ ] Layout switches at exactly 1024px
- [ ] No horizontal scrolling at any size
- [ ] Text remains readable at all sizes
- [ ] Spacing looks correct at all sizes
- [ ] Images load and display correctly
- [ ] Buttons are tappable/clickable (44px minimum on mobile)

**Expected Outcome:** Flawless responsive behavior

---

## Phase 9: Accessibility Testing

### Manual Tests

- [ ] Navigate entire flow with keyboard only
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify focus order is logical
- [ ] Verify all interactive elements have focus indicators
- [ ] Verify color contrast meets WCAG AA
- [ ] Test with browser zoom at 200%

### Automated Tests

- [ ] Run axe DevTools or similar
- [ ] Check for ARIA errors
- [ ] Check for contrast errors
- [ ] Check for keyboard trap issues

**Expected Outcome:** WCAG 2.1 AA compliance verified

---

## Phase 10: Performance Testing

### Metrics to Check

- [ ] Layout shift (CLS) - should be minimal
- [ ] Time to interactive
- [ ] Smooth transitions (60fps)
- [ ] No janky scrolling
- [ ] Image loading performance

### Test Scenarios

- [ ] Library with 100+ books
- [ ] Rapid selection changes
- [ ] Scrolling while details open
- [ ] Page changes with details open

**Expected Outcome:** Smooth, performant experience

---

## Phase 11: Final Polish

### Review Checklist

- [ ] All spacing matches specification
- [ ] All colors match specification
- [ ] All typography matches specification
- [ ] All transitions are smooth
- [ ] Selected state is clearly visible
- [ ] No console errors
- [ ] No console warnings
- [ ] Code is clean and documented

### Cross-Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Expected Outcome:** Consistent experience across browsers

---

## Phase 12: Documentation

### Code Comments

- [ ] Add comments explaining layout structure
- [ ] Add comments for accessibility features
- [ ] Add comments for responsive breakpoints

### Update Project Docs

- [ ] Update README if needed
- [ ] Document any new patterns introduced
- [ ] Add screenshots to documentation

**Expected Outcome:** Well-documented implementation

---

## Completion Criteria

All of the following must be true:

- [x] Side-by-side layout appears at 1024px breakpoint
- [x] Mobile overlay behavior maintained below 1024px
- [x] Selected card has distinct visual state
- [x] Details panel is sticky on desktop
- [x] Both panels scroll independently
- [x] Keyboard navigation works (Tab, Enter, Space, Escape)
- [x] ARIA attributes are correct
- [x] Focus indicators are visible
- [x] WCAG 2.1 AA compliance verified
- [x] Responsive at all breakpoints
- [x] Edge cases handled
- [x] Performance is acceptable
- [x] Cross-browser compatibility verified
- [x] Code is clean and documented

---

## Post-Implementation

### User Testing

- [ ] Get feedback from users
- [ ] Monitor analytics for engagement
- [ ] Check for any reported issues

### Future Enhancements

Consider for next iteration:
- Arrow key navigation between books
- Swipe gestures on mobile
- Quick preview on hover
- Keyboard shortcuts
- Preferences storage

---

## Troubleshooting

### Common Issues

**Layout not switching at 1024px:**
- Check Tailwind config includes lg breakpoint
- Verify classes are not being purged
- Check browser DevTools for applied classes

**Selected state not showing:**
- Verify selectedBookId is being passed correctly
- Check conditional className logic
- Verify book.id comparison is correct

**Sticky not working:**
- Verify parent container doesn't have overflow:hidden
- Check z-index conflicts
- Verify top offset is correct

**Keyboard navigation not working:**
- Check event handlers are attached
- Verify preventDefault is called for Space
- Check focus is not being trapped

**ARIA warnings:**
- Verify all ARIA attributes are valid
- Check role/aria-* combinations are allowed
- Use axe DevTools to identify issues

---

## Support

For questions or issues during implementation:

1. Review the full specification: `library-side-by-side-layout.md`
2. Check the visual guide: `library-layout-visual-guide.md`
3. Consult the quick reference: `library-layout-quick-reference.md`
4. Test in isolation at each phase
5. Use browser DevTools to inspect computed styles

---

**Ready to implement!** Follow phases sequentially for best results.
