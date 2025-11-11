# Library Side-by-Side Layout - Design Summary

**One-Page Executive Summary**

---

## The Design

Transform the Penumbra library from a full-screen overlay to a **responsive side-by-side layout** where book details appear alongside the book list on desktop, while maintaining the current mobile overlay experience.

---

## Before vs After

### BEFORE (Current State)

**Mobile & Desktop:**
```
┌─────────────────────────┐      ┌─────────────────────────┐
│   Book List             │      │   Book Details          │
│                         │ CLICK│   (Full Screen)         │
│   [Book 1]              │ ───→ │                         │
│   [Book 2]              │      │   [Close X]             │
│   [Book 3]              │      │                         │
│                         │      │   Title                 │
└─────────────────────────┘      │   Author                │
                                 │   Synopsis...           │
                                 │                         │
                                 └─────────────────────────┘
```
**Problem:** Lose context when viewing details, must close to browse other books

---

### AFTER (New Design)

**Mobile (< 1024px):** Same as before (full-screen overlay)

**Desktop (>= 1024px):**
```
┌────────────────────────────────────────────────────────────┐
│                     Book List (40%)    │  Book Details (60%)|
│                                        │                    │
│   [Book 1]                             │   [Close X]        │
│   ╔══════════════════╗ ← SELECTED      │                    │
│   ║ [Book 2]        ║                  │   TITLE            │
│   ║                 ║                  │   Author           │
│   ╚══════════════════╝                 │                    │
│   [Book 3]                             │   [Cover Image]    │
│   [Book 4]                             │                    │
│   [Book 5]                             │   Synopsis text... │
│                                        │   Lorem ipsum...   │
│   ↕ Scrollable                         │   ↕ Scrollable     │
│                                        │   (Sticky)         │
└────────────────────────────────────────────────────────────┘
```
**Benefit:** Browse and compare books without losing context

---

## Key Features

| Feature | Mobile | Desktop |
|---------|--------|---------|
| **Layout** | Full-screen overlay | Side-by-side (40/60) |
| **List Visibility** | Hidden when details open | Always visible |
| **Details Position** | Centered modal | Sticky side panel |
| **Selected State** | N/A | Highlighted card |
| **Backdrop** | Semi-transparent overlay | None |
| **Scrolling** | Details only | Independent panels |

---

## Technical Specs

**Breakpoint:** `lg` (1024px)
**Layout:** CSS Flexbox with `lg:flex lg:gap-6`
**Split Ratio:** 40% list / 60% details
**Sticky Offset:** `top-24` (96px)
**Transitions:** 200ms ease-in-out

**Files Modified:** 4 files, ~80-100 lines total
- `library.tsx` - Layout structure
- `item.tsx` - Selected state
- `list.tsx` - Prop passing
- `details.tsx` - Responsive width

---

## Accessibility

- WCAG 2.1 AA compliant
- Full keyboard navigation (Tab, Enter, Space, Escape)
- ARIA attributes (role, aria-pressed, aria-label)
- Visible focus indicators
- Screen reader support
- 4.5:1 text contrast, 3:1 UI contrast

---

## Design System Alignment

**Colors:** Zinc palette (950, 900, 800, 700, 600, 500, 400, 100)
**Typography:** Geist Sans, tracking-tight
**Spacing:** 8px scale (gap-4, gap-6, p-6, p-8)
**Borders:** lg radius (8px), zinc-800/700/600
**Transitions:** 200ms duration

---

## Visual States

**Book Card States:**
1. **Default:** `border-zinc-800`
2. **Hover:** `border-zinc-700 bg-zinc-900/50`
3. **Selected:** `border-zinc-600 bg-zinc-900 ring-1 ring-zinc-700`
4. **Focus:** `ring-2 ring-zinc-500 ring-offset-2`

---

## Implementation Effort

**Total Time:** 12-16 hours

| Phase | Hours | Priority |
|-------|-------|----------|
| Layout Structure | 2-3h | Must Have |
| Selected State | 1h | Must Have |
| Details Panel | 1-2h | Must Have |
| Keyboard Nav | 1h | Must Have |
| Accessibility | 1-2h | Must Have |
| Edge Cases | 2h | Must Have |
| Testing | 3-4h | Must Have |

---

## Testing Checklist

**Breakpoints:** 375px, 768px, 1023px, 1024px, 1280px, 1920px
**Interactions:** Click, keyboard, touch, hover, focus
**Accessibility:** Screen reader, keyboard-only, contrast, focus order
**Performance:** Smooth transitions, no layout shift, 60fps

---

## Success Metrics

Post-launch KPIs:
1. Time to view details: Decrease
2. Books viewed per session: Increase
3. Bounce rate: Decrease
4. User satisfaction: Increase
5. Accessibility score: 100% WCAG AA

---

## Documentation Package

5 comprehensive documents (2,347 lines, 80KB total):

1. **README.md** - Package overview and quick start
2. **library-side-by-side-layout.md** - Full specification (1,028 lines)
3. **library-layout-quick-reference.md** - TL;DR version (169 lines)
4. **library-layout-visual-guide.md** - ASCII diagrams (441 lines)
5. **IMPLEMENTATION-CHECKLIST.md** - Step-by-step guide (393 lines)

---

## Core Tailwind Classes

**Layout Container:**
```tsx
<div className="lg:flex lg:gap-6">
```

**List Wrapper (40%):**
```tsx
<div className={cn("lg:w-[40%]", selectedBook && "hidden lg:block")}>
```

**Details Wrapper (60%):**
```tsx
<div className={cn(
  "fixed inset-0 z-50 bg-zinc-950/95 flex items-center justify-center",
  "lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:w-[60%]"
)}>
```

**Selected Card:**
```tsx
className={cn(
  "border-zinc-800 hover:bg-zinc-900/50 hover:border-zinc-700",
  selected && "bg-zinc-900 border-zinc-600 ring-1 ring-zinc-700"
)}
```

**Sticky Details:**
```tsx
className={cn(
  "w-4/5 max-w-4xl m-8",
  "lg:w-full lg:m-0 lg:sticky lg:top-24"
)}
```

---

## User Experience Flow

### Desktop Experience
1. User browses book list (left panel)
2. User clicks a book card
3. Card highlights with selected state
4. Details appear in right panel (60% width)
5. List remains visible and scrollable
6. User can click another book to switch details
7. Details panel sticks to top when scrolling list
8. User clicks [X] or presses Escape to close

### Mobile Experience
1. User browses book list (full width)
2. User clicks a book card
3. List fades out
4. Details overlay fades in with backdrop
5. User focuses on single book
6. User clicks [X] or presses Escape to close
7. Details fades out, list fades in

---

## Design Rationale

**Why 40/60 split?**
- Comfortable reading width for synopsis
- Sufficient space for book list
- Approximates golden ratio
- Tested for visual harmony

**Why lg breakpoint?**
- Matches existing max-w-5xl container
- Natural transition point at 1024px
- Tablet landscape width
- Avoids cramping on smaller devices

**Why sticky details?**
- Keeps book info visible while browsing
- Reduces scrolling
- Common pattern (email, messaging)
- Enhances comparison workflow

**Why overlay on mobile?**
- Limited screen space
- Focus on one task (mobile UX best practice)
- Better readability
- Maintains existing user behavior

---

## Browser Support

**Target:** All modern browsers (latest versions)
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

**CSS Features Used:**
- Flexbox (full support)
- Position sticky (full support)
- CSS calc() (full support)
- CSS custom properties (full support)

---

## Next Steps

1. **Review:** Read full specification (`library-side-by-side-layout.md`)
2. **Understand:** Review visual guide (`library-layout-visual-guide.md`)
3. **Reference:** Bookmark quick reference (`library-layout-quick-reference.md`)
4. **Implement:** Follow implementation checklist (`IMPLEMENTATION-CHECKLIST.md`)
5. **Test:** Verify against completion criteria
6. **Deploy:** Ship to production
7. **Monitor:** Track success metrics

---

## Questions?

**For design details:** See `library-side-by-side-layout.md`
**For implementation:** See `IMPLEMENTATION-CHECKLIST.md`
**For quick lookup:** See `library-layout-quick-reference.md`
**For visuals:** See `library-layout-visual-guide.md`

---

**Status:** Ready for Implementation
**Designer:** Claude (UI Designer Agent)
**Version:** 1.0
**Date:** 2025-11-10

---

## One-Sentence Summary

Transform the Penumbra library to show book details alongside the list on desktop (>= 1024px) using a 40/60 split with sticky positioning, while maintaining the current full-screen overlay on mobile for optimal responsive user experience.
