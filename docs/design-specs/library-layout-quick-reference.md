# Library Side-by-Side Layout - Quick Reference

**Full Specification:** `library-side-by-side-layout.md`

---

## TL;DR

Transform the book library from a full-screen overlay to a **side-by-side layout** at desktop breakpoints (>= 1024px), while maintaining mobile overlay behavior.

---

## Key Design Decisions

| Aspect | Decision | Value |
|--------|----------|-------|
| **Breakpoint** | Large (lg) | 1024px |
| **Layout Split** | List / Details | 40% / 60% |
| **Desktop Behavior** | Side-by-side | List always visible |
| **Mobile Behavior** | Full-screen overlay | Current behavior maintained |
| **Selected State** | Visual highlight | Border + Ring + Background |
| **Details Position** | Sticky | Stays visible while scrolling |

---

## Tailwind Class Reference

### Library Container
```tsx
// Parent flex container
<div className="lg:flex lg:gap-6">

  // List wrapper (40%)
  <div className={cn(
    "lg:w-[40%]",
    selectedBook && "hidden lg:block"
  )}>

  // Details wrapper (60%)
  <div className={cn(
    "fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95",
    "lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:w-[60%]"
  )}>
```

### Book Card Selected State
```tsx
className={cn(
  // Base + hover
  "border-zinc-800 hover:bg-zinc-900/50 hover:border-zinc-700",

  // Selected
  selectedBookId === book.id && "bg-zinc-900 border-zinc-600 ring-1 ring-zinc-700"
)}
```

### Details Panel
```tsx
className={cn(
  // Mobile
  "w-4/5 max-w-4xl m-8",

  // Desktop
  "lg:w-full lg:m-0 lg:sticky lg:top-24",

  // Scrolling
  "max-h-[calc(100vh-8rem)] overflow-hidden"
)}
```

---

## Files to Modify

1. **library.tsx** - Add flex layout, conditional visibility
2. **item.tsx** - Add selected state styling, keyboard handlers
3. **list.tsx** - Pass selectedBookId prop
4. **details.tsx** - Responsive width, sticky positioning

---

## Must-Have Features

- [x] Side-by-side layout at lg breakpoint (40/60 split)
- [x] Selected card visual state (border + ring + background)
- [x] Responsive details width (80% mobile, 100% desktop)
- [x] Mobile overlay with backdrop (current behavior maintained)
- [x] Sticky details panel on desktop (top-24 offset)
- [x] Keyboard navigation (Escape, Enter, Space)
- [x] ARIA attributes for accessibility
- [x] Focus management and indicators

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| zinc-950 | #0a0a0a | Background |
| zinc-900 | #18181b | Selected background |
| zinc-800 | #27272a | Default border |
| zinc-700 | #3f3f46 | Hover border |
| zinc-600 | #52525b | Selected border |
| zinc-500 | #71717a | Metadata text |
| zinc-400 | #a1a1aa | Secondary text |
| zinc-100 | #f4f4f5 | Primary text |

---

## Spacing Guide

| Element | Mobile | Desktop |
|---------|--------|---------|
| Layout gap | N/A | 24px (gap-6) |
| Details padding | 24px (p-6) | 32px (p-8) |
| Details margin | 32px (m-8) | 0 |
| Sticky offset | N/A | 96px (top-24) |

---

## Accessibility Checklist

- [ ] Escape key closes details
- [ ] Enter/Space selects book card
- [ ] Focus indicators visible
- [ ] ARIA role="button" on cards
- [ ] ARIA aria-pressed on selected card
- [ ] ARIA role="dialog" on mobile details
- [ ] Close button has aria-label

---

## Visual States

**Book Card:**
- Default: `border-zinc-800`
- Hover: `border-zinc-700 bg-zinc-900/50`
- Selected: `border-zinc-600 bg-zinc-900 ring-1 ring-zinc-700`
- Focus: `ring-2 ring-zinc-500 ring-offset-2`

**Details Panel:**
- Mobile: Fixed overlay with backdrop
- Desktop: Sticky side panel, no backdrop

---

## Implementation Order

1. Update library.tsx layout structure
2. Add selected state to book cards
3. Make details panel responsive
4. Add keyboard handlers
5. Add ARIA attributes
6. Test and refine

---

## Testing Breakpoints

- 375px - iPhone SE
- 768px - iPad Mini (mobile behavior)
- 1023px - Just below lg (mobile behavior)
- 1024px - At lg (side-by-side activates)
- 1280px - Desktop
- 1920px - Large desktop

---

**For complete specifications, see:** `library-side-by-side-layout.md`
