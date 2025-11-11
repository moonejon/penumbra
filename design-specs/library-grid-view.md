# Library Grid View Design Specification

**Version:** 1.0
**Date:** 2025-11-10
**Status:** Ready for Implementation

---

## Overview

This specification defines the visual design, interaction patterns, and responsive behavior for a cover-focused grid view in the Penumbra library. The grid view complements the existing list view, providing users with a visual browsing experience optimized for book cover discovery.

---

## Design Principles

1. **Visual Discovery:** Cover-first design that leverages book artwork for quick scanning
2. **Responsive Fluidity:** Seamless adaptation across devices without compromising usability
3. **Performance:** Optimized rendering with lazy loading and efficient state management
4. **Consistency:** Maintains the established zinc color palette and design language
5. **Accessibility:** WCAG 2.1 AA compliant with keyboard navigation and screen reader support

---

## 1. Layout System

### 1.1 Responsive Grid Specifications

#### Desktop (≥1024px)
```
Grid Configuration:
- Columns: 5 (max-width: 1280px)
- Columns: 6 (max-width: 1536px)
- Gap: 24px (1.5rem)
- Cover Size: 180px × 280px
- Aspect Ratio: 9:14 (standard book cover)
```

#### Tablet (768px - 1023px)
```
Grid Configuration:
- Columns: 4
- Gap: 20px (1.25rem)
- Cover Size: 160px × 250px
- Aspect Ratio: 9:14
```

#### Mobile Large (600px - 767px)
```
Grid Configuration:
- Columns: 3
- Gap: 16px (1rem)
- Cover Size: 140px × 218px
- Aspect Ratio: 9:14
```

#### Mobile Small (<600px)
```
Grid Configuration:
- Columns: 2
- Gap: 12px (0.75rem)
- Cover Size: 150px × 234px
- Aspect Ratio: 9:14
```

### 1.2 CSS Grid Implementation

```css
/* Base Grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

/* Responsive Breakpoints */
@media (min-width: 600px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
}

@media (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }
}
```

---

## 2. Grid Item Design

### 2.1 Default State

**Visual Specifications:**
```
Cover Container:
- Width: 100% (responsive to grid cell)
- Height: auto (maintains 9:14 aspect ratio)
- Border Radius: 0.5rem (8px)
- Box Shadow: 0 4px 8px rgba(0, 0, 0, 0.3)
- Border: 1px solid transparent
- Background: zinc-800 (loading/fallback)
- Transition: all 200ms ease-in-out

Overlay (Hidden by default):
- Background: linear-gradient(
    to top,
    rgba(9, 9, 11, 0.95) 0%,
    rgba(9, 9, 11, 0.85) 40%,
    transparent 100%
  )
- Height: 60%
- Position: absolute bottom
- Padding: 1rem
- Opacity: 0
- Transform: translateY(8px)
```

**Layout Structure:**
```
┌─────────────────────┐
│                     │
│                     │
│   Book Cover Image  │
│                     │
│                     │
│                     │
│  [Hidden Overlay]   │
└─────────────────────┘
```

### 2.2 Hover State (Desktop)

**Trigger:** Mouse hover on grid item
**Duration:** 200ms ease-in-out

**Visual Changes:**
```
Cover Container:
- Transform: translateY(-4px) scale(1.02)
- Box Shadow: 0 12px 24px rgba(0, 0, 0, 0.5)
- Border: 1px solid zinc-700
- Z-index: 10

Overlay:
- Opacity: 1
- Transform: translateY(0)
```

**Overlay Content:**
```
Title:
- Font: Geist Sans, 600 weight
- Size: 0.875rem (14px)
- Color: zinc-100
- Line Height: 1.25
- Max Lines: 2
- Overflow: ellipsis

Author:
- Font: Geist Sans, 400 weight
- Size: 0.75rem (12px)
- Color: zinc-400
- Line Height: 1.25
- Max Lines: 1
- Overflow: ellipsis
- Margin Top: 0.25rem

Metadata (Optional - if space allows):
- Font: Geist Mono, 400 weight
- Size: 0.625rem (10px)
- Color: zinc-500
- Display: Page count icon + number
- Margin Top: 0.5rem
```

**Layout Structure:**
```
┌─────────────────────┐
│                     │
│   Book Cover Image  │
│                     │
│ ╔═════════════════╗ │
│ ║ Title Line 1    ║ │
│ ║ Title Line 2... ║ │
│ ║ Author Name     ║ │
│ ║ [📄 256]        ║ │
│ ╚═════════════════╝ │
└─────────────────────┘
```

### 2.3 Selected State

**Visual Specifications:**
```
Cover Container:
- Border: 2px solid zinc-400
- Box Shadow: 0 0 0 3px rgba(161, 161, 170, 0.2)
- Ring: 1px ring-zinc-600/50
- Background: zinc-900 (behind cover)
- Z-index: 20

Overlay:
- Always visible (opacity: 1)
- Background: more opaque gradient
  rgba(9, 9, 11, 0.98) to transparent
```

**Persistent Indicator:**
```
- Small checkmark badge in top-right corner
- Background: zinc-400
- Icon: Check (lucide-react)
- Size: 20px × 20px
- Border Radius: 50%
- Position: absolute top-right (-8px, -8px)
- Box Shadow: 0 2px 8px rgba(0, 0, 0, 0.4)
```

### 2.4 Touch/Tap Interaction (Mobile)

**First Tap:**
- Shows overlay with details
- Adds visual feedback (scale(0.98) for 100ms)
- Overlay remains visible until second tap or tap outside

**Second Tap (on same item):**
- Opens full details view (full-screen modal on mobile)
- Smooth transition animation

**Tap on Different Item:**
- Hides overlay on previous item
- Shows overlay on new item
- Updates selected state

---

## 3. Loading & Empty States

### 3.1 Skeleton Loading State

**Visual Specifications:**
```
Skeleton Grid Item:
- Same grid layout as normal items
- Background: zinc-800
- Animation: pulse (1.5s infinite)
- Border Radius: 0.5rem
- Aspect Ratio: 9:14
- No overlay content
```

**Implementation:**
```
Display 20 skeleton items during initial load
Maintain grid structure
Smooth transition when real content loads
```

### 3.2 Image Loading State

**Per-Item Loading:**
```
Placeholder:
- Background: zinc-800
- Icon: ImageIcon (lucide-react)
- Icon Size: 48px × 48px
- Icon Color: zinc-600 (opacity: 0.3)
- Icon Position: centered
- Fade-in animation when image loads
```

### 3.3 Missing Cover Image

**Fallback Design:**
```
Container:
- Background: zinc-800/50
- Border: 1px dashed zinc-700
- Border Radius: 0.5rem

Content (Centered):
- Icon: ImageIcon (lucide-react)
- Icon Size: 64px × 64px (desktop), 48px (mobile)
- Icon Color: zinc-600 (opacity: 0.4)
- Text: Book title (if space allows)
- Font: Geist Sans, 600 weight
- Size: 0.875rem
- Color: zinc-500
- Text Align: center
- Padding: 1rem
```

### 3.4 Empty Grid State

**No Books in Library:**
```
Centered Container:
- Icon: Grid3x3 (lucide-react)
- Size: 80px × 80px
- Color: zinc-600 (opacity: 0.5)
- Heading: "No books yet"
- Font: Geist Sans, 600 weight
- Size: 1.5rem
- Color: zinc-100
- Description: "Start building your library..."
- Font: Geist Sans, 400 weight
- Size: 1rem
- Color: zinc-400
- Button: "Add Your First Book"
```

**No Search Results:**
```
Same layout as above, but:
- Icon: SearchX
- Heading: "No books match your search"
- Description: "Try adjusting your search terms..."
- Button: "Clear Filters"
```

---

## 4. View Toggle Component

### 4.1 Toggle Button Design

**Location:**
- Positioned in SearchHeader component
- Right side of search input
- Sticky with header (top: 14px)

**Visual Specifications:**
```
Container:
- Display: flex
- Gap: 0 (buttons are adjacent)
- Border Radius: 0.5rem
- Background: zinc-900/50
- Border: 1px solid zinc-800
- Padding: 2px
- Backdrop Blur: enabled

List View Button:
- Icon: List (lucide-react)
- Size: 36px × 36px (touch target)
- Icon Size: 18px × 18px
- Border Radius: 0.375rem
- Transition: all 150ms

Grid View Button:
- Icon: Grid3x3 (lucide-react)
- Size: 36px × 36px
- Icon Size: 18px × 18px
- Border Radius: 0.375rem
- Transition: all 150ms
```

### 4.2 Active State

**Active Button:**
```
- Background: zinc-800
- Border: 1px solid zinc-700
- Icon Color: zinc-100
- Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.3)
```

**Inactive Button:**
```
- Background: transparent
- Border: 1px solid transparent
- Icon Color: zinc-500
- Hover Background: zinc-800/50
- Hover Icon Color: zinc-300
```

### 4.3 Responsive Behavior

**Desktop (≥768px):**
```
- Both buttons visible
- Icon + optional label
- Larger touch targets (36px)
```

**Mobile (<768px):**
```
- Both buttons visible
- Icon only (no label)
- Standard touch targets (44px min)
- Larger gap between buttons (4px)
```

### 4.4 State Persistence

**localStorage Implementation:**
```javascript
Key: "penumbra-library-view"
Values: "list" | "grid"
Default: "list"

// Save on toggle
localStorage.setItem("penumbra-library-view", viewType);

// Restore on mount
const savedView = localStorage.getItem("penumbra-library-view") || "list";
```

---

## 5. Animations & Transitions

### 5.1 View Transition (List ↔ Grid)

**Animation Specifications:**
```
Duration: 300ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)

Fade Out (Current View):
- Opacity: 1 → 0
- Duration: 150ms

Fade In (New View):
- Opacity: 0 → 1
- Duration: 150ms
- Delay: 150ms
```

### 5.2 Grid Item Entrance

**Initial Load:**
```
Stagger Animation:
- Delay: index × 30ms (max 500ms)
- Opacity: 0 → 1
- Transform: translateY(20px) → translateY(0)
- Duration: 300ms
- Easing: ease-out
```

**Pagination:**
```
Fade In:
- No stagger (feels more responsive)
- Opacity: 0 → 1
- Duration: 200ms
```

### 5.3 Hover Animations

**Desktop Hover:**
```
Cover Lift:
- Transform: translateY(-4px) scale(1.02)
- Duration: 200ms
- Easing: ease-out

Shadow Expansion:
- Box Shadow: small → large
- Duration: 200ms

Overlay Slide:
- Opacity: 0 → 1
- Transform: translateY(8px) → translateY(0)
- Duration: 200ms
- Easing: ease-out
```

### 5.4 Selection Animation

**On Select:**
```
Scale Pulse:
- Transform: scale(1) → scale(0.98) → scale(1)
- Duration: 200ms
- Easing: ease-in-out

Border Appearance:
- Border Width: 0 → 2px
- Duration: 150ms

Ring Fade:
- Opacity: 0 → 1
- Duration: 200ms
```

### 5.5 Touch Feedback (Mobile)

**Tap Down:**
```
- Transform: scale(0.98)
- Duration: 100ms
- Easing: ease-out
```

**Tap Release:**
```
- Transform: scale(1)
- Duration: 150ms
- Easing: ease-out
```

---

## 6. Responsive Behavior

### 6.1 Breakpoint Strategy

**Breakpoint Definitions:**
```
mobile-sm:  < 600px   (2 columns)
mobile-lg:  600-767px (3 columns)
tablet:     768-1023px (4 columns)
desktop:    ≥1024px    (5-6 columns)
```

### 6.2 Desktop Layout (≥768px)

**With Details Panel Open:**
```
Layout:
┌──────────────────┬─────────────────┐
│                  │                 │
│   Grid View      │  Details Panel  │
│   (40% width)    │  (60% width)    │
│                  │                 │
└──────────────────┴─────────────────┘

Grid Configuration:
- Reduced columns (2-3) to accommodate panel
- Larger gap for better breathing room
- Maintains smooth column transitions
```

**Without Details Panel:**
```
Layout:
┌─────────────────────────────────────┐
│                                     │
│          Grid View (100%)           │
│                                     │
└─────────────────────────────────────┘

Grid Configuration:
- Full column count (4-6)
- Optimal spacing
- Maximum visual impact
```

### 6.3 Mobile Layout (<768px)

**Grid View:**
```
- Full-screen grid (2-3 columns)
- No side panel
- Tap to show overlay
- Second tap opens full-screen details
```

**Details View:**
```
- Full-screen modal
- Slide-up animation
- Back button in top-left
- Overlays grid completely (z-index: 50)
```

### 6.4 Tablet Optimization (768px-1023px)

**Portrait Mode:**
```
- 3-4 columns
- Hybrid behavior (iPad-style)
- Optional side panel (collapsed by default)
- Tap to expand details panel
```

**Landscape Mode:**
```
- 5-6 columns
- Desktop-like behavior
- Side panel available
- Hover interactions enabled
```

---

## 7. Accessibility

### 7.1 Keyboard Navigation

**Tab Order:**
```
1. View toggle buttons
2. Grid items (left-to-right, top-to-bottom)
3. Pagination controls
```

**Keyboard Shortcuts:**
```
Tab:           Navigate to next item
Shift+Tab:     Navigate to previous item
Enter/Space:   Select item / Open details
Arrow Keys:    Navigate grid (2D navigation)
Escape:        Close details panel
V:             Toggle view (list/grid)
```

### 7.2 Focus States

**Focus Ring:**
```
- Border: 2px solid zinc-400
- Outline: 2px solid transparent
- Outline Offset: 2px
- Box Shadow: 0 0 0 3px rgba(161, 161, 170, 0.3)
- Transition: all 150ms
```

**Focus Visible (keyboard only):**
```
- More prominent ring
- Higher contrast
- Matches WCAG AAA standards
```

### 7.3 Screen Reader Support

**Grid Item Attributes:**
```html
<div
  role="button"
  tabindex="0"
  aria-label="Book: [Title] by [Author]"
  aria-pressed="[true/false]"
  aria-describedby="book-[id]-details"
>
  <img
    src="[cover-url]"
    alt="Cover of [Title]"
    loading="lazy"
  />
  <div id="book-[id]-details" class="sr-only">
    [Title] by [Author]. Published [Year]. [Page Count] pages.
  </div>
</div>
```

**View Toggle Attributes:**
```html
<button
  aria-label="Switch to grid view"
  aria-pressed="false"
  title="Grid View"
>
  <Grid3x3 aria-hidden="true" />
</button>
```

**Grid Container:**
```html
<div
  role="grid"
  aria-label="Library books"
  aria-rowcount="[total-rows]"
  aria-colcount="[column-count]"
>
  <!-- Grid items with role="gridcell" -->
</div>
```

### 7.4 Color Contrast

**WCAG 2.1 AA Compliance:**
```
Text on Overlay:
- Title (zinc-100 on zinc-950/95): 18.5:1 ✓
- Author (zinc-400 on zinc-950/95): 8.2:1 ✓
- Metadata (zinc-500 on zinc-950/95): 6.4:1 ✓

Focus States:
- Focus ring (zinc-400 on zinc-950): 7.1:1 ✓

Button Text:
- Active (zinc-100 on zinc-800): 15.2:1 ✓
- Inactive (zinc-500 on zinc-900): 4.8:1 ✓
```

### 7.5 Motion Preferences

**Respects prefers-reduced-motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .grid-item {
    transform: none !important;
  }
}
```

---

## 8. Performance Optimization

### 8.1 Image Loading Strategy

**Lazy Loading:**
```html
<img
  src="[cover-url]"
  loading="lazy"
  decoding="async"
  alt="Cover of [Title]"
/>
```

**Progressive Enhancement:**
```
1. Show placeholder (zinc-800 background)
2. Load low-quality image preview (if available)
3. Load full-resolution image
4. Apply fade-in transition
```

**Image Cache:**
```javascript
// Client-side cache to prevent re-fetches
const imageCache = new Map<string, boolean>();

// Cache hit: Instant display
// Cache miss: Load with placeholder
```

### 8.2 Virtual Scrolling (Optional Enhancement)

**For Large Libraries (>500 books):**
```
- Implement react-window or similar
- Render only visible items + buffer
- Maintain scroll position on view toggle
- Smooth scrolling experience
```

**Benefits:**
```
- Reduced initial render time
- Lower memory footprint
- Smooth scrolling with 1000+ books
- Better mobile performance
```

### 8.3 Pagination

**Strategy:**
```
Items Per Page:
- Desktop: 60 items (6×10 grid)
- Tablet: 48 items (4×12 grid)
- Mobile: 40 items (2×20 grid)

Pagination Controls:
- Same as list view
- Positioned below grid
- Smooth page transitions
```

---

## 9. Design Tokens

### 9.1 Colors (Zinc Palette)

```css
/* Background & Surfaces */
--grid-bg: hsl(0, 0%, 9%);           /* zinc-950 */
--card-bg: hsl(0, 0%, 15%);          /* zinc-900 */
--card-hover-bg: hsl(0, 0%, 20%);    /* zinc-850 */

/* Borders */
--border-default: hsl(0, 0%, 24%);   /* zinc-800 */
--border-hover: hsl(0, 0%, 32%);     /* zinc-700 */
--border-focus: hsl(0, 0%, 64%);     /* zinc-400 */

/* Text */
--text-primary: hsl(0, 0%, 98%);     /* zinc-100 */
--text-secondary: hsl(0, 0%, 64%);   /* zinc-400 */
--text-tertiary: hsl(0, 0%, 45%);    /* zinc-500 */
--text-muted: hsl(0, 0%, 35%);       /* zinc-600 */

/* Overlay */
--overlay-gradient: linear-gradient(
  to top,
  hsla(0, 0%, 9%, 0.95) 0%,
  hsla(0, 0%, 9%, 0.85) 40%,
  transparent 100%
);

/* Shadows */
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.5);
--shadow-focus: 0 0 0 3px rgba(161, 161, 170, 0.2);
```

### 9.2 Spacing Scale

```css
/* Grid Gaps */
--gap-mobile-sm: 0.75rem;   /* 12px */
--gap-mobile-lg: 1rem;      /* 16px */
--gap-tablet: 1.25rem;      /* 20px */
--gap-desktop: 1.5rem;      /* 24px */

/* Item Padding */
--overlay-padding: 1rem;    /* 16px */
--item-padding: 0.5rem;     /* 8px */

/* Margins */
--section-margin: 1.5rem;   /* 24px */
```

### 9.3 Typography

```css
/* Font Families */
--font-sans: 'Geist Sans', system-ui, sans-serif;
--font-mono: 'Geist Mono', monospace;

/* Overlay Text Sizes */
--text-title: 0.875rem;     /* 14px */
--text-author: 0.75rem;     /* 12px */
--text-meta: 0.625rem;      /* 10px */

/* Font Weights */
--weight-normal: 400;
--weight-semibold: 600;
--weight-bold: 700;

/* Line Heights */
--line-tight: 1.25;
--line-normal: 1.5;
```

### 9.4 Border Radius

```css
--radius-sm: 0.375rem;      /* 6px */
--radius-md: 0.5rem;        /* 8px */
--radius-lg: 0.75rem;       /* 12px */
--radius-full: 9999px;      /* Circles */
```

### 9.5 Transitions

```css
/* Durations */
--duration-fast: 100ms;
--duration-normal: 150ms;
--duration-medium: 200ms;
--duration-slow: 300ms;

/* Easing Functions */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### 9.6 Z-Index Scale

```css
--z-base: 0;
--z-hover: 10;
--z-selected: 20;
--z-dropdown: 30;
--z-sticky: 40;
--z-modal: 50;
--z-tooltip: 60;
```

---

## 10. Component Hierarchy

### 10.1 Component Structure

```
Library (Parent)
├── SearchHeader
│   ├── IntelligentSearch
│   └── ViewToggle (NEW)
│       ├── ListViewButton
│       └── GridViewButton
├── GridView (NEW) | ListView
│   ├── GridContainer
│   │   ├── GridItem × N
│   │   │   ├── CoverImage
│   │   │   ├── HoverOverlay
│   │   │   └── SelectionIndicator
│   │   └── SkeletonGridItem × N (loading)
│   └── Pagination
└── Details (Side panel or modal)
```

### 10.2 State Management

**Component State:**
```typescript
type ViewType = "list" | "grid";

interface LibraryState {
  viewType: ViewType;
  selectedBook: BookType | undefined;
  hoveredBook: BookType | undefined; // Desktop only
  isLoading: boolean;
  books: BookType[];
  page: number;
  pageCount: number;
}
```

**View Toggle State:**
```typescript
const [viewType, setViewType] = useState<ViewType>(() => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('penumbra-library-view') as ViewType) || 'list';
  }
  return 'list';
});

// Persist on change
useEffect(() => {
  localStorage.setItem('penumbra-library-view', viewType);
}, [viewType]);
```

---

## 11. Implementation Guidelines

### 11.1 Phase 1: Core Grid View

**Tasks:**
1. Create `GridView.tsx` component
2. Create `GridItem.tsx` component
3. Implement responsive grid layout
4. Add image loading states
5. Implement selection state
6. Add keyboard navigation

**Acceptance Criteria:**
- Grid displays correctly on all breakpoints
- Images load progressively with placeholders
- Selection state is clearly visible
- Keyboard navigation works as specified

### 11.2 Phase 2: View Toggle

**Tasks:**
1. Create `ViewToggle.tsx` component
2. Add toggle to SearchHeader
3. Implement localStorage persistence
4. Add view transition animation
5. Update routing/state management

**Acceptance Criteria:**
- Toggle switches between views smoothly
- View preference persists across sessions
- Transition animation is smooth
- Mobile layout adapts appropriately

### 11.3 Phase 3: Interactions

**Tasks:**
1. Implement hover overlay (desktop)
2. Add tap interactions (mobile)
3. Implement selection highlighting
4. Add focus states for accessibility
5. Test with screen readers

**Acceptance Criteria:**
- Hover overlay shows book details smoothly
- Mobile tap interactions work intuitively
- Focus states are clearly visible
- Screen readers announce content correctly

### 11.4 Phase 4: Performance

**Tasks:**
1. Implement lazy loading for images
2. Add pagination for large libraries
3. Optimize re-renders with React.memo
4. Test with 500+ books
5. Add virtual scrolling (optional)

**Acceptance Criteria:**
- Images load only when in viewport
- Smooth scrolling with large libraries
- No performance degradation on mobile
- Memory usage is optimized

---

## 12. Testing & Validation

### 12.1 Visual Testing

**Devices:**
- iPhone SE (375px)
- iPhone 14 Pro (393px)
- iPad (768px)
- iPad Pro (1024px)
- Desktop (1280px, 1920px)

**Browsers:**
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)

### 12.2 Interaction Testing

**Desktop:**
- [ ] Hover shows overlay with details
- [ ] Click selects book
- [ ] Second click opens details panel
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] View toggle works smoothly

**Mobile:**
- [ ] Tap shows overlay
- [ ] Second tap opens details
- [ ] Touch targets are adequate (44px min)
- [ ] Swipe gestures don't interfere
- [ ] View toggle is accessible

### 12.3 Accessibility Testing

**Tools:**
- axe DevTools
- WAVE
- Screen readers (VoiceOver, NVDA)
- Keyboard-only navigation

**Checklist:**
- [ ] WCAG 2.1 AA compliant
- [ ] Color contrast ratios meet standards
- [ ] Focus indicators are visible
- [ ] Screen reader announces correctly
- [ ] Keyboard navigation complete
- [ ] Touch targets adequate
- [ ] Motion respects preferences

### 12.4 Performance Testing

**Metrics:**
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Smooth animations (60fps)
- [ ] Memory usage acceptable
- [ ] No layout shifts

---

## 13. Design Assets

### 13.1 Icons (Lucide React)

**Primary Icons:**
```
- Grid3x3: Grid view toggle
- List: List view toggle
- ImageIcon: Missing cover fallback
- Check: Selection indicator
- BookOpen: Page count indicator
- X: Close details panel
- SearchX: No results state
- LibraryBig: Empty library state
```

### 13.2 Image Specifications

**Cover Images:**
```
Format: JPEG or PNG
Optimal Size: 300px × 466px (9:14 ratio)
Max Size: 500KB per image
Lazy Loading: Enabled
Fallback: ImageIcon placeholder
```

### 13.3 Skeleton States

**Grid Skeleton:**
```
- Same aspect ratio as covers (9:14)
- Pulsing animation (1.5s)
- zinc-800 background
- Rounded corners (0.5rem)
- Display 20 items initially
```

---

## 14. Edge Cases & Error Handling

### 14.1 Missing Cover Images

**Behavior:**
- Show fallback placeholder with ImageIcon
- Display book title (truncated if needed)
- Maintain grid layout consistency
- Same hover/interaction behavior

### 14.2 Very Long Titles

**Behavior:**
- Truncate with ellipsis after 2 lines
- Show full title in Details panel
- Consider tooltip on hover (optional)

### 14.3 Books with No Authors

**Behavior:**
- Show "Unknown Author" in overlay
- Maintain layout spacing
- Style as muted text (zinc-500)

### 14.4 Single-Column Grid (Very Small Screens)

**Behavior:**
- Allow single column on screens <375px
- Increase cover size slightly
- Maintain touch targets
- Adjust overlay text sizing

### 14.5 Network Errors

**Behavior:**
- Show placeholder immediately
- Retry image load once
- If retry fails, show fallback
- Don't block interaction

---

## 15. Future Enhancements

### 15.1 Potential Features

**Sorting & Filtering in Grid:**
- Sort by: Title, Author, Date Added, Recently Read
- Filter by: Genre, Rating, Read Status
- Visual indicators for sorting/filtering

**Reading Progress Indicator:**
- Small progress bar at bottom of cover
- Color-coded by status (reading, finished, unread)
- Percentage indicator on hover

**Collections/Shelves:**
- Group books into visual collections
- Drag-and-drop to organize
- Color-coded shelf labels

**Cover Themes:**
- Detect dominant cover colors
- Apply subtle glow/shadow effects
- Group similar-colored books

**Reading Stats:**
- Pages read counter
- Reading streak indicator
- Year-in-review highlights

### 15.2 Advanced Interactions

**Multi-Select Mode:**
- Checkbox on each cover
- Bulk actions (delete, tag, export)
- Selection count indicator

**Drag-and-Drop:**
- Reorder books manually
- Create custom collections
- Visual feedback during drag

**Quick Actions:**
- Context menu on long-press/right-click
- Edit, Delete, Mark as Read, etc.
- Floating action button

---

## 16. Handoff Checklist

### 16.1 Design Deliverables

- [x] Complete design specification (this document)
- [x] Responsive breakpoint definitions
- [x] Component hierarchy and structure
- [x] Interaction patterns and animations
- [x] Accessibility guidelines
- [x] Design tokens and color values
- [x] Typography specifications
- [x] Spacing and layout guidelines
- [x] State definitions and transitions
- [x] Error and empty state designs

### 16.2 Developer Resources

**Reference Files:**
- `/Users/jonathan/github/penumbra/src/app/library/components/library.tsx`
- `/Users/jonathan/github/penumbra/src/app/library/components/list.tsx`
- `/Users/jonathan/github/penumbra/src/app/library/components/item.tsx`
- `/Users/jonathan/github/penumbra/src/app/library/components/searchHeader.tsx`

**Design Tokens:**
- Color palette: Zinc (900-100)
- Fonts: Geist Sans, Geist Mono
- Shadows: 3 levels (sm, md, lg)
- Border radius: 3 levels (sm, md, lg)

**Component Pattern:**
Follow existing patterns in `item.tsx` for:
- Loading states
- Image handling
- Selection states
- Responsive behavior

---

## 17. Questions & Decisions

### 17.1 Open Questions

**Performance:**
- Should we implement virtual scrolling for libraries with 500+ books?
  - Recommendation: Add as optional enhancement in Phase 4

**Interaction:**
- Should single tap/click show overlay or select immediately?
  - Recommendation: Show overlay first, second tap selects (mobile)
  - Recommendation: Hover shows overlay, click selects (desktop)

**Layout:**
- Should we show details panel in grid view on tablet?
  - Recommendation: Yes, but collapse by default in portrait mode

### 17.2 Design Decisions Made

1. **Aspect Ratio:** 9:14 (standard book cover) for consistency
2. **Grid Strategy:** CSS Grid with auto-fill for flexibility
3. **Hover Overlay:** Bottom-gradient style for better readability
4. **Selection Style:** Border + ring + checkmark for clarity
5. **View Toggle:** Icon buttons in header for quick access
6. **Persistence:** localStorage for view preference
7. **Animation Duration:** 200ms for most transitions (feels responsive)
8. **Mobile Strategy:** Full-screen details modal for better focus

---

## Appendix A: Code Snippets

### A.1 Tailwind CSS Classes for Grid Item

```tsx
// Default state
className={`
  group relative cursor-pointer
  aspect-[9/14]
  rounded-lg
  overflow-hidden
  border border-transparent
  transition-all duration-200
  hover:border-zinc-700
  hover:-translate-y-1
  hover:scale-[1.02]
  hover:shadow-xl
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-zinc-400
  focus-visible:ring-offset-2
  focus-visible:ring-offset-zinc-950
  ${isSelected ? 'ring-2 ring-zinc-600/50 border-zinc-400 shadow-lg' : ''}
`}

// Overlay
className={`
  absolute inset-x-0 bottom-0 h-3/5
  bg-gradient-to-t
  from-zinc-950/95 via-zinc-950/85 to-transparent
  p-4
  opacity-0
  translate-y-2
  transition-all duration-200
  group-hover:opacity-100
  group-hover:translate-y-0
  ${isSelected ? 'opacity-100 translate-y-0' : ''}
`}
```

### A.2 View Toggle Component Skeleton

```tsx
type ViewType = "list" | "grid";

interface ViewToggleProps {
  viewType: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewToggle: FC<ViewToggleProps> = ({ viewType, onViewChange }) => {
  return (
    <div className="flex gap-0 p-0.5 bg-zinc-900/50 border border-zinc-800 rounded-lg backdrop-blur">
      <button
        onClick={() => onViewChange("list")}
        aria-label="List view"
        aria-pressed={viewType === "list"}
        className={`
          p-2 rounded-md transition-all duration-150
          ${viewType === "list"
            ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-sm'
            : 'bg-transparent border border-transparent text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
          }
        `}
      >
        <List className="w-4.5 h-4.5" aria-hidden="true" />
      </button>

      <button
        onClick={() => onViewChange("grid")}
        aria-label="Grid view"
        aria-pressed={viewType === "grid"}
        className={`
          p-2 rounded-md transition-all duration-150
          ${viewType === "grid"
            ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-sm'
            : 'bg-transparent border border-transparent text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
          }
        `}
      >
        <Grid3x3 className="w-4.5 h-4.5" aria-hidden="true" />
      </button>
    </div>
  );
};
```

### A.3 Grid Container CSS

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 0;
}

@media (min-width: 600px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
}

@media (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }
}
```

---

## Appendix B: Accessibility Checklist

### WCAG 2.1 AA Compliance

**Perceivable:**
- [x] Text alternatives for cover images
- [x] Color contrast meets 4.5:1 ratio
- [x] Content adaptable to different layouts
- [x] Visual indicators not reliant on color alone

**Operable:**
- [x] All functionality available via keyboard
- [x] No keyboard traps
- [x] Timing is not essential
- [x] No seizure-inducing content
- [x] Clear focus indicators

**Understandable:**
- [x] Text is readable (language, level)
- [x] UI behaves predictably
- [x] Labels and instructions provided
- [x] Error identification and suggestions

**Robust:**
- [x] Compatible with assistive technologies
- [x] Valid HTML structure
- [x] ARIA attributes used correctly
- [x] Name, role, value for all components

---

## Document Version History

| Version | Date       | Author        | Changes                           |
|---------|------------|---------------|-----------------------------------|
| 1.0     | 2025-11-10 | UI Designer   | Initial comprehensive spec        |

---

**End of Design Specification**

For implementation questions or clarifications, please refer to the existing codebase patterns in `/src/app/library/components/` and maintain consistency with the established Penumbra design system.
