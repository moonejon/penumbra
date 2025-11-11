# Penumbra Visual Design Plan
## Transition to Portfolio Design Language

**Project:** Penumbra Book Library Application
**Target:** Match jonathanmooney.me portfolio aesthetic
**Date:** 2025-11-10
**Strategy:** MUI → Tailwind CSS with zinc-based palette

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Visual Design Analysis](#visual-design-analysis)
3. [Component-by-Component Visual Plan](#component-by-component-visual-plan)
4. [Layout & Navigation Redesign](#layout--navigation-redesign)
5. [Design System Migration](#design-system-migration)
6. [Phased Implementation Roadmap](#phased-implementation-roadmap)
7. [Future Considerations](#future-considerations)

---

## Executive Summary

### Current State
Penumbra is a book library management system built with Material-UI v7, featuring:
- Space Mono monospace font throughout
- MUI dark theme with default Material Design palette
- Prominent AppBar navigation with visible Import/Library links
- Card-based book display in list view
- Full CRUD functionality for authenticated users

### Target State
Transform Penumbra into a public-first browseable library matching the portfolio's:
- Clean, minimalist zinc-based aesthetic (zinc-50 to zinc-950)
- Geist/Geist Mono typography for refined, modern feel
- Subtle, elegant navigation with admin features hidden
- Portfolio-style layout constraints (max-w-screen-sm centered)
- Smooth transitions and micro-interactions
- Public browsing emphasis with elegant admin access

### Key Design Principles
1. **Public-First UX:** Library is browseable by anyone; editing requires authentication
2. **Minimalism:** Clean, uncluttered interface prioritizing content
3. **Elegance:** Subtle interactions, refined typography, generous whitespace
4. **Consistency:** Unified design language with portfolio site
5. **Accessibility:** WCAG 2.1 AA compliance with semantic HTML
6. **Performance:** Fast perceived load times with skeleton states

---

## Visual Design Analysis

### Current Penumbra UI/UX Patterns

#### Typography
- **Current:** Space Mono (400, 700 weights) for all text
- **Feel:** Technical, monospaced, developer-centric
- **Issues:** Less readable for body text, feels heavy for long-form content

#### Color Palette
- **Mode:** Dark theme only
- **Palette:** MUI default dark theme
  - Background: Default MUI dark backgrounds
  - Text: Default MUI light text
  - Primary: Default MUI primary (blue)
  - Cards: MUI `background.paper`
- **Issues:** Generic Material Design look, not unique to Penumbra

#### Navigation
- **Structure:** Full-width MUI AppBar with prominent navigation
- **Pages visible:** Import, Library (always visible)
- **Settings:** Gear icon with dropdown menu for Dashboard
- **Auth:** Large "Sign Up" button, "Sign In" text button in top-right
- **Issues:**
  - Too prominent for public-first experience
  - Import shouldn't be visible to unauthenticated users
  - Sign up/in buttons too prominent
  - Doesn't match portfolio's subtle navigation

#### Layout
- **Container:** MUI Container components with maxWidth="xl"
- **Grid:** MUI Grid components for structure
- **Spacing:** MUI theme spacing units
- **Issues:** Too wide for content-focused reading, lacks portfolio intimacy

#### Component Patterns

**Library List (src/app/library/components/list.tsx)**
- Card-based layout with 200px max height
- Book cover thumbnails (100-160px height)
- Horizontal layout: image left, metadata right
- Hover state: `boxShadow: "5px 5px grey"` (harsh drop shadow)
- Pagination at bottom with outlined variant
- Skeleton loading states (10 cards)

**Book Details Modal (src/app/library/components/details.tsx)**
- Full-screen modal with centered Card (80% width)
- Close button (IconButton) in top-right
- Large book cover (200px) on left
- Metadata stack on right
- Synopsis with HTML parsing
- Hidden on mobile portrait (cover image)

**Search Header (src/app/library/components/searchHeader.tsx)**
- Sticky header with background.paper
- Full-width search component
- Border bottom with divider color
- Responsive padding

**Import Page (src/app/import/components/import.tsx)**
- Two-column layout (50/50 split)
- Search, Preview, Queue workflow
- Mobile: stacks vertically
- Always visible in navigation

**Dashboard (src/app/dashboard/page.tsx)**
- Simple container with Typography h3 heading
- Grid component for book display
- Only accessible via Settings menu

### Portfolio Design Language

Based on WebFetch analysis of jonathanmooney.me:

#### Typography System
- **Primary Font:** Inter Tight (custom variable font)
  - `font-inter-tight` CSS variable
  - `tracking-tight` for condensed letter spacing
  - `antialiased` for smooth rendering
- **Characteristics:** Clean, modern, highly readable
- **Hierarchy:** Clear size/weight variations for headings vs body

#### Color Palette
- **Light Mode:**
  - Background: `bg-white` (#ffffff)
  - Text: Default black (#000000)
- **Dark Mode:**
  - Background: `bg-zinc-950` (#09090b)
  - Text: `text-white` (#ffffff)
  - Zinc variants: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
- **System:** Intelligent theme detection with localStorage persistence

#### Layout Strategy
- **Container:** `max-w-screen-sm` (640px max width)
- **Centering:** `mx-auto` horizontal auto margins
- **Padding:** `px-4` (16px horizontal), `pt-20` (80px top)
- **Structure:** `flex min-h-screen flex-col` for full-height vertical layout
- **Philosophy:** Narrow, focused content area for readability

#### Navigation Patterns
- **Header Component:** Minimal, subtle
- **Footer Component:** Contact links, social media
- **Structure:** No prominent AppBar; integrated into page flow
- **Mobile:** Responsive, likely hamburger or hidden navigation

#### Animation & Motion
- **Theme Switching:** Smooth transitions (no Motion Primitives library detected)
- **Interactions:** Subtle, purposeful micro-interactions
- **Loading:** Likely skeleton states or fade-ins
- **Performance:** 60fps target, respects `prefers-reduced-motion`

#### Visual Characteristics
- **Whitespace:** Generous, breathing room around content
- **Borders:** Subtle, likely zinc-200 (light) or zinc-800 (dark)
- **Shadows:** Minimal to none; relies on borders/backgrounds
- **Radius:** Consistent border radius (likely 0.375rem / 6px)
- **Focus:** Content-first, minimal chrome

### Gap Analysis: Current vs Target

| Aspect | Current (Penumbra) | Target (Portfolio) | Gap Size |
|--------|-------------------|-------------------|----------|
| **Typography** | Space Mono (monospace) | Geist/Geist Mono | Large - requires font replacement |
| **Color System** | MUI default dark | Zinc palette (50-950) | Large - complete palette migration |
| **Layout Width** | maxWidth="xl" (1536px) | max-w-screen-sm (640px) | Large - dramatic narrowing |
| **Navigation** | Prominent AppBar | Subtle integrated nav | Large - complete restructure |
| **Auth UI** | Prominent Sign Up button | Minimal, hidden | Medium - reduce prominence |
| **Cards** | MUI Card components | Custom Tailwind divs | Medium - restyle components |
| **Spacing** | MUI theme units | Tailwind spacing scale | Medium - adjust all spacing |
| **Shadows** | `boxShadow: "5px 5px grey"` | Minimal/none | Small - remove heavy shadows |
| **Animations** | MUI transitions | Custom subtle animations | Medium - add Motion Primitives |

### Design System Transition Strategy

**Approach: Incremental Replacement**

Rather than a big-bang rewrite, we'll:
1. Keep existing functionality intact during migration
2. Replace MUI components page-by-page, component-by-component
3. Run both MUI and Tailwind in parallel during transition
4. Remove MUI dependencies only after complete migration
5. Ensure accessibility maintained throughout

**Why This Approach:**
- Reduces risk of breaking existing features
- Allows for testing at each phase
- Maintains working application throughout
- Easier to roll back if issues arise
- Better for incremental code review

---

## Component-by-Component Visual Plan

### 1. Navigation (src/app/components/navbar.tsx)

#### Current State
```typescript
- MUI AppBar with position="static"
- Full-width Container maxWidth="xl"
- Toolbar with brand icon (AdbIcon) and "Penumbra" text
- Desktop: Horizontal buttons for Import, Library
- Mobile: Hamburger menu (MenuIcon) with SwipeableDrawer
- Settings: Gear icon (SettingsIcon) with dropdown menu
- Auth: Large SignUpButton (contained variant) + SignInButton (text variant)
- Always visible at top of page
```

**Visual Characteristics:**
- MUI primary color background (likely blue in dark theme)
- White text throughout
- Heavy visual weight (takes significant vertical space)
- Clear separation from content below

**UX Issues:**
- Import visible to everyone (should be admin-only)
- Auth buttons too prominent (conflicts with public-first UX)
- Material Design aesthetic doesn't match portfolio
- Too much visual weight for a browsing experience

#### Target State
```typescript
- Minimal header integrated into page flow
- max-w-screen-sm centered container
- Subtle "Penumbra" text link (no icon)
- Public nav: Only "Library" visible by default
- Admin nav: "Import" + "Dashboard" visible when authenticated
- Settings: Remove; admin features in main nav when logged in
- Auth: Small, subtle text link in top-right corner
- Sticky positioning with backdrop blur on scroll
```

**Visual Design:**
```
Desktop (Unauthenticated):
┌─────────────────────────────────────────────────┐
│  Penumbra                           sign in     │  ← Subtle text, zinc-400
└─────────────────────────────────────────────────┘

Desktop (Authenticated):
┌─────────────────────────────────────────────────┐
│  Penumbra  Library  Import  Dashboard    [👤]  │  ← Admin links visible
└─────────────────────────────────────────────────┘

Mobile (Any state):
┌─────────────────────────────────────────────────┐
│  Penumbra                                  ≡    │  ← Hamburger reveals menu
└─────────────────────────────────────────────────┘
```

**Styling Specifications:**
```css
/* Container */
max-width: 640px (max-w-screen-sm)
margin: 0 auto
padding: 16px (px-4)
background: transparent initially, zinc-950/80 with backdrop blur when scrolled

/* Typography */
Brand: text-xl font-semibold text-zinc-100
Nav links: text-sm font-medium text-zinc-400 hover:text-zinc-100
Auth link: text-xs text-zinc-500 hover:text-zinc-400

/* Spacing */
height: 64px
gap between links: 24px (gap-6)

/* Borders */
border-bottom: 1px solid zinc-800 (when scrolled)

/* States */
Hover: smooth color transition (transition-colors duration-200)
Active: text-zinc-100 with underline decoration
Focus: outline-2 outline-offset-2 outline-zinc-500
```

**User Experience Changes:**
- **Public users:** See only "Penumbra" brand and "Library" link; minimal distraction
- **Admin (authenticated):** See Import/Dashboard in main nav, no settings menu
- **Mobile:** Clean hamburger menu with conditional items based on auth
- **Login prominence:** Drastically reduced; small text link instead of button
- **Visual weight:** Much lighter; doesn't compete with content

**Animation Strategy:**
```typescript
// Scroll-based backdrop blur
useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 50) {
      setScrolled(true); // Triggers backdrop-blur-lg and bg-zinc-950/80
    } else {
      setScrolled(false);
    }
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// Link hover animations
className="transition-colors duration-200 hover:text-zinc-100"

// Mobile menu
className="transition-transform duration-300 ease-out"
// Slides in from right
```

**Accessibility Considerations:**
- Maintain semantic `<nav>` element
- ARIA labels for hamburger menu: `aria-label="Main navigation"`
- ARIA expanded states for mobile menu: `aria-expanded={isOpen}`
- Skip to main content link (visually hidden, keyboard accessible)
- Focus trap in mobile menu when open
- High contrast for text against backgrounds (minimum 4.5:1)

**Responsive Behavior:**
```
Desktop (≥640px):
- Horizontal nav layout
- All links visible inline
- No hamburger menu

Tablet (640px-1024px):
- Potentially same as desktop, monitor spacing
- Consider wrapping to second line if too cramped

Mobile (<640px):
- Hamburger menu for navigation
- Only brand and hamburger visible initially
- Full-height drawer slides in from right
- Overlay dims background (bg-black/50)
```

---

### 2. Library List View (src/app/library/components/library.tsx, list.tsx, item.tsx)

#### Current State

**Library Component (library.tsx):**
```typescript
- Container maxWidth="xl" (very wide)
- SearchHeader sticky at top
- Empty states: LibraryBooksIcon + text + CTA button
- Displays List component with books
- Details modal triggered by book selection
```

**List Component (list.tsx):**
```typescript
- Stack with spacing={2}
- Maps through books, renders Item components
- Skeleton loading: 10 SkeletonBookCard instances
- Pagination at bottom (outlined variant, responsive size)
```

**Item Component (item.tsx):**
```typescript
- MUI Card with maxHeight="200px"
- Hover: boxShadow: "5px 5px grey" (harsh drop shadow)
- Horizontal layout: image left (100-160px), metadata right
- CardContent with responsive padding
- Click handler to open Details modal
- Image loading states with Skeleton
- Image error fallback: ImageIcon in colored box
```

**Visual Issues:**
- Container too wide for comfortable reading
- Harsh drop shadow on hover (not subtle)
- MUI Card has Material Design look (elevation, rounded corners)
- Spacing feels generic (MUI spacing units)
- No entrance animations (items just appear)

#### Target State

**Visual Design:**
```
┌──────────────────────────────────────────┐
│  ┌─────┐  Title of the Book             │  ← Cleaner, zinc-based
│  │     │  Author Name                    │
│  │ img │                                 │
│  │     │  Publisher • 2023 • Hardcover   │
│  └─────┘                                 │
└──────────────────────────────────────────┘
  ^ Subtle border, no shadow
  ^ Hover: slight background change + border accent
```

**Layout Specifications:**
```css
/* Container */
max-width: 640px (max-w-screen-sm)
margin: 0 auto
padding: 0 16px (px-4)

/* Book Card */
border: 1px solid zinc-800 (dark) / zinc-200 (light)
border-radius: 8px (rounded-lg)
padding: 16px (p-4)
background: transparent
transition: background-color 0.2s, border-color 0.2s

/* Hover State */
background: zinc-900/50 (dark) / zinc-50 (light)
border-color: zinc-700 (dark) / zinc-300 (light)
cursor: pointer

/* Image Container */
width: 120px
height: 180px
flex-shrink: 0
border-radius: 4px (rounded)
overflow: hidden

/* Image */
object-fit: cover
width: 100%
height: 100%
transition: opacity 0.3s

/* Image Fallback */
background: zinc-800 (dark) / zinc-100 (light)
display: flex
align-items: center
justify-content: center
color: zinc-600

/* Metadata Stack */
flex: 1
margin-left: 16px (ml-4)
display: flex
flex-direction: column
gap: 8px (gap-2)

/* Title */
font-size: 18px (text-lg)
font-weight: 600 (font-semibold)
color: zinc-100 (dark) / zinc-900 (light)
line-height: 1.4

/* Author */
font-size: 14px (text-sm)
font-weight: 400 (font-normal)
color: zinc-400 (dark) / zinc-600 (light)

/* Details (Publisher, Date, Binding) */
font-size: 12px (text-xs)
color: zinc-500 (dark) / zinc-500 (light)
display: flex
gap: 8px (gap-2)
separator: "•" between items
```

**Animation Strategy:**
```typescript
// Stagger entrance animation for book cards
// Using Motion Primitives or Framer Motion

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.05 }}
>
  {/* Book card content */}
</motion.div>

// This creates a waterfall effect where cards
// appear from top to bottom with slight delays

// Hover animation
className="transition-all duration-200 hover:bg-zinc-900/50"

// Image load animation
<motion.img
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
/>
```

**Skeleton Loading State:**
```typescript
// Match target card structure exactly
<div className="border border-zinc-800 rounded-lg p-4 animate-pulse">
  <div className="flex gap-4">
    {/* Image skeleton */}
    <div className="w-[120px] h-[180px] bg-zinc-800 rounded" />

    {/* Metadata skeleton */}
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-zinc-800 rounded w-3/4" />
      <div className="h-4 bg-zinc-800 rounded w-1/2" />
      <div className="h-3 bg-zinc-800 rounded w-1/3 mt-4" />
    </div>
  </div>
</div>
```

**Empty States:**

*No books in library:*
```
┌──────────────────────────────────────────┐
│                                          │
│              📚                          │
│                                          │
│        Your library is empty             │
│                                          │
│   Start building your collection by      │
│   importing your first book.             │
│                                          │
│        [Add Your First Book]             │  ← Subtle button
│                                          │
└──────────────────────────────────────────┘
```

*No search results:*
```
┌──────────────────────────────────────────┐
│                                          │
│              🔍                          │
│                                          │
│     No books match your search           │
│                                          │
│   Try adjusting your filters or clear    │
│   them to see all books.                 │
│                                          │
│          [Clear Filters]                 │  ← Subtle button
│                                          │
└──────────────────────────────────────────┘
```

**Styling:**
```css
/* Empty state container */
text-align: center
padding: 64px 16px (py-16 px-4)

/* Icon */
font-size: 64px
opacity: 0.5
color: zinc-500
margin-bottom: 16px (mb-4)

/* Heading */
font-size: 24px (text-2xl)
font-weight: 600 (font-semibold)
color: zinc-100 (dark) / zinc-900 (light)
margin-bottom: 8px (mb-2)

/* Description */
font-size: 14px (text-sm)
color: zinc-400 (dark) / zinc-600 (light)
max-width: 400px
margin: 0 auto 24px (mx-auto mb-6)

/* CTA Button */
border: 1px solid zinc-700 (dark) / zinc-300 (light)
padding: 12px 24px (px-6 py-3)
border-radius: 8px (rounded-lg)
background: transparent
color: zinc-100 (dark) / zinc-900 (light)
hover: background: zinc-800 (dark) / zinc-100 (light)
transition: all 0.2s
```

**Pagination:**
```css
/* Container */
display: flex
justify-content: center
margin-top: 32px (mt-8)
gap: 4px (gap-1)

/* Page Button */
width: 40px
height: 40px
border: 1px solid zinc-800 (dark) / zinc-200 (light)
border-radius: 6px (rounded-md)
background: transparent
color: zinc-400 (dark) / zinc-600 (light)
hover: background: zinc-800 (dark) / zinc-100 (light)
hover: color: zinc-100 (dark) / zinc-900 (light)

/* Active Page */
border-color: zinc-600 (dark) / zinc-400 (light)
background: zinc-800 (dark) / zinc-100 (light)
color: zinc-100 (dark) / zinc-900 (light)

/* Disabled */
opacity: 0.5
cursor: not-allowed
```

**Responsive Behavior:**
```
Desktop (≥640px):
- Image: 120px × 180px visible
- Horizontal layout maintained
- Full metadata visible

Tablet (640px-1024px):
- Same as desktop

Mobile (<640px):
- Image: Hidden or smaller (80px × 120px)
- Metadata wraps tighter
- Reduced padding (p-3 instead of p-4)
- Font sizes scale down slightly
```

**Accessibility Enhancements:**
- Semantic `<article>` for each book card
- `aria-label` with full book info for screen readers
- Keyboard navigation: cards focusable with Enter to open
- Focus visible states: outline-2 outline-zinc-500
- Alt text for images: "Cover of {title}"
- Loading state announced to screen readers

**User Experience Changes:**
- **Narrower layout:** More comfortable reading experience
- **Subtle interactions:** No harsh shadows, smooth transitions
- **Faster perceived load:** Skeleton states exactly match final layout
- **Scannable:** Clear visual hierarchy, easy to browse
- **Delightful:** Stagger animations make browsing feel fluid

---

### 3. Book Details View (src/app/library/components/details.tsx)

#### Current State
```typescript
- Full-screen modal centered with flexbox
- Card component at 80% width with 5% margin
- Close button (IconButton with CloseIcon) in top-right corner
- Horizontal layout: image left (200px), metadata right
- Synopsis with HTML parsing (parse function)
- Publisher, Date, Binding in label/value pairs
- Mobile portrait: hides book cover image
```

**Visual Issues:**
- Full-screen takeover feels heavy
- Card at 80% width doesn't match portfolio constraint
- Close button uses MUI IconButton (Material Design)
- Metadata feels dense without clear hierarchy
- No animation on open/close

#### Target State

**Visual Design:**
```
┌────────────────────────────────────────────────────┐
│                                              ✕     │  ← Subtle close
│                                                    │
│   ┌──────┐  The Great Gatsby                      │
│   │      │  F. Scott Fitzgerald                   │
│   │      │                                         │
│   │ img  │  A story of the mysteriously wealthy   │
│   │      │  Jay Gatsby and his love for the       │
│   │      │  beautiful Daisy Buchanan...           │
│   │      │                                         │
│   └──────┘  Publisher • Date • Binding • Pages    │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Layout Approach:**

Two options to consider:

**Option A: Modal (Overlay)**
- Keeps current modal approach but refined
- Dark overlay dims background
- Centered card with max-w-2xl (672px)
- Click outside or Escape to close
- Smooth fade + scale animation

**Option B: Slide-Over Panel**
- Slides in from right side of screen
- Full height, fixed width (448px)
- Overlay dims left side
- More modern, common pattern
- Better for mobile (full screen)

**Recommendation: Option B (Slide-Over Panel)** for better mobile experience and modern feel.

**Styling Specifications (Option B):**
```css
/* Overlay */
position: fixed
inset: 0
background: rgb(0 0 0 / 0.5)
z-index: 50
backdrop-filter: blur(4px)

/* Panel Container */
position: fixed
right: 0
top: 0
height: 100vh
width: 448px (w-[448px])
max-width: 100vw
background: zinc-950 (dark) / white (light)
border-left: 1px solid zinc-800 (dark) / zinc-200 (light)
overflow-y: auto
z-index: 51

/* Header (with close button) */
display: flex
justify-content: space-between
align-items: center
padding: 24px (p-6)
border-bottom: 1px solid zinc-800 (dark) / zinc-200 (light)
position: sticky
top: 0
background: inherit
z-index: 1

/* Close Button */
width: 32px
height: 32px
border-radius: 6px (rounded-md)
background: transparent
color: zinc-400
hover: background: zinc-800 (dark) / zinc-100 (light)
hover: color: zinc-100 (dark) / zinc-900 (light)
transition: all 0.2s

/* Content Area */
padding: 24px (p-6)
display: flex
flex-direction: column
gap: 24px (gap-6)

/* Book Cover */
width: 200px
height: auto
aspect-ratio: 2/3
border-radius: 8px (rounded-lg)
margin: 0 auto
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)

/* Title */
font-size: 28px (text-3xl)
font-weight: 700 (font-bold)
color: zinc-100 (dark) / zinc-900 (light)
line-height: 1.2
margin-bottom: 8px (mb-2)

/* Author */
font-size: 18px (text-lg)
font-weight: 400 (font-normal)
color: zinc-400 (dark) / zinc-600 (light)
margin-bottom: 24px (mb-6)

/* Synopsis */
font-size: 14px (text-sm)
color: zinc-300 (dark) / zinc-700 (light)
line-height: 1.6
margin-bottom: 24px (mb-6)

/* Metadata Grid */
display: grid
grid-template-columns: repeat(2, 1fr)
gap: 16px (gap-4)

/* Metadata Item */
display: flex
flex-direction: column
gap: 4px (gap-1)

/* Metadata Label */
font-size: 12px (text-xs)
font-weight: 600 (font-semibold)
color: zinc-500 (dark) / zinc-500 (light)
text-transform: uppercase
letter-spacing: 0.05em (tracking-wider)

/* Metadata Value */
font-size: 14px (text-sm)
color: zinc-100 (dark) / zinc-900 (light)
```

**Animation Strategy:**
```typescript
// Panel slide-in animation (Framer Motion)
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
>
  {/* Panel content */}
</motion.div>

// Overlay fade-in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  onClick={handleClose}
>
  {/* Overlay */}
</motion.div>

// Content stagger (for metadata items)
<motion.div
  variants={{
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 }
    })
  }}
  initial="hidden"
  animate="visible"
  custom={index}
>
  {/* Metadata item */}
</motion.div>
```

**Mobile Behavior:**
```
Mobile (<640px):
- Panel takes full width (w-full)
- Slides up from bottom instead of right
- Full screen experience
- Swipe down to close gesture (optional)
- Maintains all content
```

**Accessibility:**
```typescript
// Focus trap within panel
// Focus close button on open
// Escape key closes panel
// ARIA attributes

<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="book-title"
  aria-describedby="book-synopsis"
>
  <button
    aria-label="Close book details"
    onClick={handleClose}
  >
    ✕
  </button>

  <h2 id="book-title">{title}</h2>
  <p id="book-synopsis">{synopsis}</p>

  {/* Rest of content */}
</div>

// Focus management
useEffect(() => {
  if (isOpen) {
    // Focus close button
    closeButtonRef.current?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  return () => {
    document.body.style.overflow = 'unset';
  };
}, [isOpen]);
```

**User Experience Changes:**
- **Less disruptive:** Slide-over feels lighter than full modal
- **Better mobile UX:** Full screen on mobile is more natural
- **Smooth animations:** Spring physics for natural motion
- **Clear hierarchy:** Metadata organized in grid
- **Easy exit:** Click overlay, Escape key, or close button

---

### 4. Search Header (src/app/library/components/searchHeader.tsx, intelligentSearch.tsx)

#### Current State
```typescript
- Sticky Box at top: 0
- Background: theme.palette.background.paper
- Border bottom: theme.palette.divider
- z-index: 1000
- Container maxWidth="xl"
- Responsive padding
- IntelligentSearch component (not visible in current code)
```

**Visual Issues:**
- Container too wide (xl = 1536px)
- MUI styling (background.paper, divider colors)
- Unknown IntelligentSearch component styling

#### Target State

**Visual Design:**
```
┌────────────────────────────────────────────────┐
│  🔍  Search by title, author, or subject...    │  ← Subtle search
└────────────────────────────────────────────────┘
  ^ Sticky, blurred background on scroll
```

**Layout Specifications:**
```css
/* Sticky Container */
position: sticky
top: 64px (after navigation)
z-index: 40
background: zinc-950/80 (dark) / white/80 (light)
backdrop-filter: blur(12px)
border-bottom: 1px solid zinc-800 (dark) / zinc-200 (light)

/* Inner Container */
max-width: 640px (max-w-screen-sm)
margin: 0 auto
padding: 12px 16px (py-3 px-4)

/* Search Input */
width: 100%
background: zinc-900 (dark) / zinc-50 (light)
border: 1px solid zinc-800 (dark) / zinc-200 (light)
border-radius: 8px (rounded-lg)
padding: 10px 16px 10px 40px (py-2.5 px-4 pl-10)
font-size: 14px (text-sm)
color: zinc-100 (dark) / zinc-900 (light)
placeholder: zinc-500

focus: border-color: zinc-600 (dark) / zinc-400 (light)
focus: outline: 2px solid zinc-600 (dark) / zinc-400 (light)
focus: outline-offset: 2px

/* Search Icon */
position: absolute
left: 12px
top: 50%
transform: translateY(-50%)
color: zinc-500
pointer-events: none

/* Clear Button (when has value) */
position: absolute
right: 12px
top: 50%
transform: translateY(-50%)
width: 20px
height: 20px
border-radius: 50%
background: zinc-800 (dark) / zinc-200 (light)
color: zinc-400
hover: background: zinc-700 (dark) / zinc-300 (light)
cursor: pointer
```

**Filter Pills (Active Filters):**
```
If filters active, show pills below search:

┌────────────────────────────────────────────────┐
│  🔍  Search by title, author, or subject...    │
│                                                 │
│  Title: "Gatsby" ✕   Author: "Fitzgerald" ✕   │  ← Filter pills
└────────────────────────────────────────────────┘
```

```css
/* Pills Container */
display: flex
gap: 8px (gap-2)
flex-wrap: wrap
margin-top: 8px (mt-2)

/* Filter Pill */
display: inline-flex
align-items: center
gap: 6px (gap-1.5)
padding: 4px 10px (px-2.5 py-1)
background: zinc-800 (dark) / zinc-100 (light)
border: 1px solid zinc-700 (dark) / zinc-300 (light)
border-radius: 16px (rounded-full)
font-size: 12px (text-xs)
color: zinc-300 (dark) / zinc-700 (light)

/* Pill Label */
font-weight: 600 (font-semibold)

/* Pill Value */
font-weight: 400 (font-normal)

/* Remove Button */
width: 14px
height: 14px
border-radius: 50%
background: zinc-700 (dark) / zinc-300 (light)
color: zinc-400 (dark) / zinc-600 (light)
hover: background: zinc-600 (dark) / zinc-400 (light)
cursor: pointer
transition: all 0.2s
```

**Animation Strategy:**
```typescript
// Search input focus animation
className="transition-all duration-200 focus:ring-2 focus:ring-zinc-600"

// Filter pill entrance
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.2 }}
>
  {/* Filter pill */}
</motion.div>

// Backdrop blur on scroll (similar to nav)
className="backdrop-blur-lg bg-zinc-950/80"
```

**Accessibility:**
```html
<div role="search">
  <label for="library-search" class="sr-only">
    Search library by title, author, or subject
  </label>

  <input
    id="library-search"
    type="search"
    placeholder="Search by title, author, or subject..."
    aria-label="Search library"
    aria-describedby="search-help"
  />

  <span id="search-help" class="sr-only">
    Type to search, press Enter to submit
  </span>

  <!-- Active filters -->
  <div role="status" aria-live="polite">
    {filters.length} active filters
  </div>

  <!-- Filter pills with remove buttons -->
  <button
    aria-label="Remove title filter: Gatsby"
    onClick={removeFilter}
  >
    ✕
  </button>
</div>
```

**User Experience Changes:**
- **Cleaner appearance:** Integrated into page flow
- **Subtle backdrop:** Only visible when scrolled
- **Clear active filters:** Visual pills show what's filtering
- **Easy filter removal:** Click X on any pill
- **Smooth transitions:** All state changes animated

---

### 5. Import Page (src/app/import/components/import.tsx, search.tsx, preview.tsx, queue.tsx)

#### Current State
```typescript
- Two-column layout (50/50 split)
- Left: Search + Preview components
- Right: Queue component
- Mobile: Stacks vertically (column direction)
- Always visible in navigation
```

**Components:**
- **Search:** ISBN or title search
- **Preview:** Shows fetched book data before adding to queue
- **Queue:** List of books to batch import

**Visual Issues:**
- Prominent in navigation (should be admin-only)
- MUI styling throughout
- Two-column layout might be too wide for narrow container

#### Target State

**Visibility:**
- **Unauthenticated:** Not visible at all
- **Authenticated:** Visible in navigation as "Import"
- **URL:** Redirect unauthenticated users to /library or login

**Layout Redesign:**

Given max-w-screen-sm (640px) constraint, two-column layout won't work. Redesign as stepped workflow:

```
Step 1: Search
┌────────────────────────────────────────────────┐
│  Import Books                                   │
│                                                 │
│  Search by ISBN or title                       │
│  ┌──────────────────────────────────────────┐  │
│  │ 978-0-7432-7356-5                    🔍 │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘

Step 2: Preview (after search)
┌────────────────────────────────────────────────┐
│  ← Back to Search                               │
│                                                 │
│  ┌──────┐  The Great Gatsby                    │
│  │      │  F. Scott Fitzgerald                 │
│  │ img  │  Scribner • 2004 • Paperback         │
│  └──────┘                                       │
│                                                 │
│  [Add to Queue]                                │
└────────────────────────────────────────────────┘

Step 3: Queue (floating or separate view)
┌────────────────────────────────────────────────┐
│  Import Queue (3)                              │
│                                                 │
│  1. The Great Gatsby                      ✕    │
│  2. 1984                                  ✕    │
│  3. To Kill a Mockingbird                 ✕    │
│                                                 │
│  [Import All Books]                            │
└────────────────────────────────────────────────┘
```

**Alternative: Persistent Queue**

Keep queue visible as a fixed footer or sidebar that expands:

```
Main View (Search + Preview)
┌────────────────────────────────────────────────┐
│  Import Books                                   │
│                                                 │
│  [Search interface]                            │
│                                                 │
└────────────────────────────────────────────────┘

Queue Footer (collapsed)
┌────────────────────────────────────────────────┐
│  Queue (3) ▲                         Import ▶  │
└────────────────────────────────────────────────┘

Queue Footer (expanded)
┌────────────────────────────────────────────────┐
│  Queue (3) ▼                         Import ▶  │
│                                                 │
│  1. The Great Gatsby                      ✕    │
│  2. 1984                                  ✕    │
│  3. To Kill a Mockingbird                 ✕    │
└────────────────────────────────────────────────┘
```

**Recommendation: Persistent Queue Footer** for better workflow continuity.

**Styling Specifications:**

```css
/* Page Container */
max-width: 640px (max-w-screen-sm)
margin: 0 auto
padding: 24px 16px (py-6 px-4)
min-height: calc(100vh - 64px - 60px) /* viewport - nav - queue footer */

/* Page Heading */
font-size: 32px (text-3xl)
font-weight: 700 (font-bold)
color: zinc-100 (dark) / zinc-900 (light)
margin-bottom: 24px (mb-6)

/* Search Input */
width: 100%
background: zinc-900 (dark) / zinc-50 (light)
border: 1px solid zinc-800 (dark) / zinc-200 (light)
border-radius: 8px (rounded-lg)
padding: 12px 48px 12px 16px (py-3 pr-12 pl-4)
font-size: 16px (text-base)
color: zinc-100 (dark) / zinc-900 (light)

/* Search Button */
position: absolute
right: 8px
top: 50%
transform: translateY(-50%)
width: 36px
height: 36px
border-radius: 6px (rounded-md)
background: zinc-800 (dark) / zinc-200 (light)
color: zinc-100 (dark) / zinc-900 (light)
hover: background: zinc-700 (dark) / zinc-300 (light)

/* Preview Card (similar to book details) */
border: 1px solid zinc-800 (dark) / zinc-200 (light)
border-radius: 8px (rounded-lg)
padding: 16px (p-4)
margin-top: 16px (mt-4)
background: transparent

/* Add to Queue Button */
width: 100%
padding: 12px 24px (px-6 py-3)
border-radius: 8px (rounded-lg)
background: zinc-100 (dark) / zinc-900 (light)
color: zinc-900 (dark) / zinc-100 (light)
font-weight: 600 (font-semibold)
hover: background: zinc-200 (dark) / zinc-800 (light)
transition: all 0.2s

/* Queue Footer (collapsed) */
position: fixed
bottom: 0
left: 0
right: 0
height: 60px
background: zinc-900 (dark) / zinc-100 (light)
border-top: 1px solid zinc-800 (dark) / zinc-200 (light)
z-index: 50
display: flex
align-items: center
justify-content: space-between
padding: 0 16px (px-4)

/* Queue Footer (expanded) */
height: auto
max-height: 50vh
overflow-y: auto

/* Queue Item */
padding: 12px 16px (py-3 px-4)
border-bottom: 1px solid zinc-800 (dark) / zinc-200 (light)
display: flex
justify-content: space-between
align-items: center

/* Import All Button */
padding: 12px 24px (px-6 py-3)
border-radius: 8px (rounded-lg)
background: zinc-100 (dark) / zinc-900 (light)
color: zinc-900 (dark) / zinc-100 (light)
font-weight: 600 (font-semibold)
hover: background: zinc-200 (dark) / zinc-800 (light)
```

**Animation Strategy:**
```typescript
// Queue footer expansion
<motion.div
  initial={false}
  animate={{ height: isExpanded ? 'auto' : '60px' }}
  transition={{ type: 'spring', damping: 20 }}
>
  {/* Queue content */}
</motion.div>

// Queue item addition
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 20 }}
  transition={{ duration: 0.2 }}
>
  {/* Queue item */}
</motion.div>

// Search result appearance
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Preview card */}
</motion.div>
```

**Loading States:**
```typescript
// Searching for book
<div className="animate-pulse">
  <div className="h-48 bg-zinc-800 rounded-lg" />
</div>

// Importing queue
<button disabled className="opacity-50 cursor-not-allowed">
  Importing... <Spinner />
</button>
```

**Error States:**
```typescript
// Book not found
<div className="border border-red-800 bg-red-900/20 rounded-lg p-4">
  <p className="text-red-400">
    No book found for ISBN. Try a different number or search by title.
  </p>
</div>

// Import failed
<div className="border border-red-800 bg-red-900/20 rounded-lg p-4">
  <p className="text-red-400">
    Failed to import some books. Review errors below.
  </p>
</div>
```

**Accessibility:**
```html
<!-- Search form -->
<form role="search" onSubmit={handleSearch}>
  <label for="isbn-search" class="sr-only">
    Search by ISBN or title
  </label>
  <input
    id="isbn-search"
    type="search"
    aria-label="ISBN or title"
  />
  <button type="submit" aria-label="Search">
    🔍
  </button>
</form>

<!-- Queue -->
<section aria-label="Import queue">
  <h2>Queue ({queueLength})</h2>
  <ul>
    <li>
      <span>{bookTitle}</span>
      <button aria-label="Remove {bookTitle} from queue">✕</button>
    </li>
  </ul>
</section>

<!-- Import button -->
<button aria-label="Import {queueLength} books">
  Import All Books
</button>
```

**User Experience Changes:**
- **Admin-only:** Hidden from public users entirely
- **Streamlined workflow:** Narrow layout forces focus
- **Persistent queue:** Always visible, easy to manage
- **Clear feedback:** Loading and error states for every action
- **Efficient batching:** Add multiple books before importing

---

### 6. Dashboard (src/app/dashboard/page.tsx, components/grid.tsx)

#### Current State
```typescript
- Container with padding: 25px
- Typography h3 heading: "Dashboard"
- Grid component (likely MUI DataGrid based on package.json)
- Displays all books in grid format
- Only accessible via Settings menu
```

**Visual Issues:**
- Generic heading ("Dashboard" too vague)
- MUI Container and Typography
- Unknown Grid component styling
- Hidden in Settings menu (should be in main nav when authenticated)

#### Target State

**Visibility:**
- **Unauthenticated:** Not visible
- **Authenticated:** Visible in main navigation

**Purpose Clarification:**

What should Dashboard show? Options:
1. **Library statistics:** Total books, authors, genres, reading progress
2. **Recent activity:** Recently added, recently viewed
3. **Management tools:** Bulk edit, delete, export

**Recommendation: Library Statistics + Recent Activity** for a useful admin overview.

**Visual Design:**
```
┌────────────────────────────────────────────────┐
│  Dashboard                                      │
│                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   247   │  │   142   │  │    38   │        │
│  │  Books  │  │ Authors │  │ Genres  │        │
│  └─────────┘  └─────────┘  └─────────┘        │
│                                                 │
│  Recently Added                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ Book 1                              3d   │  │
│  │ Book 2                              1w   │  │
│  │ Book 3                              2w   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Quick Actions                                  │
│  [Import Books]  [Export Library]              │
└────────────────────────────────────────────────┘
```

**Styling Specifications:**

```css
/* Page Container */
max-width: 640px (max-w-screen-sm)
margin: 0 auto
padding: 24px 16px (py-6 px-4)

/* Page Heading */
font-size: 32px (text-3xl)
font-weight: 700 (font-bold)
color: zinc-100 (dark) / zinc-900 (light)
margin-bottom: 24px (mb-6)

/* Stats Grid */
display: grid
grid-template-columns: repeat(3, 1fr)
gap: 16px (gap-4)
margin-bottom: 32px (mb-8)

/* Stat Card */
border: 1px solid zinc-800 (dark) / zinc-200 (light)
border-radius: 8px (rounded-lg)
padding: 16px (p-4)
text-align: center
background: transparent
hover: background: zinc-900/50 (dark) / zinc-50 (light)
transition: background 0.2s

/* Stat Number */
font-size: 36px (text-4xl)
font-weight: 700 (font-bold)
color: zinc-100 (dark) / zinc-900 (light)
line-height: 1
margin-bottom: 8px (mb-2)

/* Stat Label */
font-size: 14px (text-sm)
color: zinc-400 (dark) / zinc-600 (light)

/* Section Heading */
font-size: 18px (text-lg)
font-weight: 600 (font-semibold)
color: zinc-100 (dark) / zinc-900 (light)
margin-bottom: 12px (mb-3)

/* Recent Activity List */
border: 1px solid zinc-800 (dark) / zinc-200 (light)
border-radius: 8px (rounded-lg)
overflow: hidden
margin-bottom: 24px (mb-6)

/* Activity Item */
padding: 12px 16px (py-3 px-4)
border-bottom: 1px solid zinc-800 (dark) / zinc-200 (light)
display: flex
justify-content: space-between
align-items: center
hover: background: zinc-900/50 (dark) / zinc-50 (light)
transition: background 0.2s

/* Activity Item Title */
font-size: 14px (text-sm)
color: zinc-100 (dark) / zinc-900 (light)
font-weight: 500 (font-medium)

/* Activity Item Time */
font-size: 12px (text-xs)
color: zinc-500
font-weight: 400 (font-normal)

/* Quick Actions */
display: flex
gap: 12px (gap-3)
flex-wrap: wrap

/* Action Button */
padding: 10px 20px (px-5 py-2.5)
border: 1px solid zinc-800 (dark) / zinc-200 (light)
border-radius: 8px (rounded-lg)
background: transparent
color: zinc-100 (dark) / zinc-900 (light)
font-size: 14px (text-sm)
font-weight: 500 (font-medium)
hover: background: zinc-800 (dark) / zinc-100 (light)
transition: all 0.2s
```

**Animation Strategy:**
```typescript
// Stat cards entrance (stagger)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.1 }}
>
  {/* Stat card */}
</motion.div>

// Recent activity items (fade in)
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3, delay: 0.2 }}
>
  {/* Activity list */}
</motion.div>

// Number count-up animation (optional)
// Animate from 0 to final number over 1 second
```

**Responsive Behavior:**
```
Desktop (≥640px):
- 3-column stat grid
- Full layout as shown

Mobile (<640px):
- 1-column stat grid (stacked)
- Maintain all content
- Action buttons stack vertically
```

**Accessibility:**
```html
<main>
  <h1>Dashboard</h1>

  <section aria-label="Library statistics">
    <div role="group">
      <p aria-label="Total books">
        <span class="text-4xl">247</span>
        <span class="sr-only">total</span>
        <span class="text-sm">Books</span>
      </p>
    </div>
    <!-- More stats -->
  </section>

  <section aria-labelledby="recent-heading">
    <h2 id="recent-heading">Recently Added</h2>
    <ul>
      <li>
        <span>{bookTitle}</span>
        <time datetime="2025-11-07">3d</time>
      </li>
    </ul>
  </section>

  <section aria-label="Quick actions">
    <button>Import Books</button>
    <button>Export Library</button>
  </section>
</main>
```

**User Experience Changes:**
- **Clear visibility:** In main nav when authenticated
- **Useful overview:** Stats give sense of library size
- **Recent activity:** Quickly see what's been added
- **Quick access:** Common actions readily available
- **Clean design:** Matches library aesthetic

---

### 7. Home Page (src/app/page.tsx)

#### Current State
```typescript
- Empty Grid container
- Empty main section
- Empty footer
```

**Current Issues:**
- Essentially blank page
- No clear purpose or content
- Not leveraging potential landing page

#### Target State

**Purpose:** Welcome page that showcases the library and invites browsing

**Visual Design:**
```
┌────────────────────────────────────────────────┐
│                                                 │
│              Penumbra                          │
│                                                 │
│        A curated collection of books           │
│        Browse the library →                    │
│                                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │      │  │      │  │      │  │      │      │
│  │ img  │  │ img  │  │ img  │  │ img  │      │
│  │      │  │      │  │      │  │      │      │
│  └──────┘  └──────┘  └──────┘  └──────┘      │
│   Book 1    Book 2    Book 3    Book 4        │
│                                                 │
│           Recently Added Books                 │
│                                                 │
└────────────────────────────────────────────────┘
```

**Styling Specifications:**

```css
/* Page Container */
max-width: 640px (max-w-screen-sm)
margin: 0 auto
padding: 48px 16px (py-12 px-4)
text-align: center

/* Hero Heading */
font-size: 48px (text-5xl)
font-weight: 700 (font-bold)
color: zinc-100 (dark) / zinc-900 (light)
line-height: 1.1
margin-bottom: 16px (mb-4)

/* Hero Subheading */
font-size: 18px (text-lg)
color: zinc-400 (dark) / zinc-600 (light)
margin-bottom: 24px (mb-6)

/* CTA Link */
display: inline-flex
align-items: center
gap: 8px (gap-2)
font-size: 16px (text-base)
font-weight: 500 (font-medium)
color: zinc-100 (dark) / zinc-900 (light)
hover: color: zinc-400 (dark) / zinc-600 (light)
transition: color 0.2s

/* Featured Books Grid */
display: grid
grid-template-columns: repeat(4, 1fr)
gap: 16px (gap-4)
margin-top: 48px (mt-12)
margin-bottom: 16px (mb-4)

/* Book Card (simplified) */
aspect-ratio: 2/3
border-radius: 8px (rounded-lg)
overflow: hidden
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)
transition: transform 0.2s
hover: transform: translateY(-4px)

/* Section Label */
font-size: 14px (text-sm)
font-weight: 600 (font-semibold)
color: zinc-500
text-transform: uppercase
letter-spacing: 0.05em (tracking-wider)
margin-top: 8px (mt-2)
```

**Mobile Responsive:**
```
Mobile (<640px):
- Heading: text-4xl instead of text-5xl
- Featured grid: 2 columns instead of 4
- Padding: py-8 instead of py-12
```

**Animation Strategy:**
```typescript
// Hero fade-in
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <h1>Penumbra</h1>
  <p>A curated collection of books</p>
  <a>Browse the library →</a>
</motion.div>

// Featured books stagger
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
>
  {/* Book card */}
</motion.div>
```

**Accessibility:**
```html
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">Penumbra</h1>
    <p>A curated collection of books</p>
    <a href="/library" aria-label="Browse the library">
      Browse the library
      <span aria-hidden="true">→</span>
    </a>
  </section>

  <section aria-labelledby="featured-heading">
    <h2 id="featured-heading" class="sr-only">Featured Books</h2>
    <div role="list">
      <div role="listitem">
        <a href="/library?id={bookId}" aria-label="{bookTitle} by {author}">
          <img src="{cover}" alt="Cover of {title}" />
        </a>
      </div>
    </div>
    <p aria-label="Featured category">Recently Added Books</p>
  </section>
</main>
```

**User Experience:**
- **Welcoming:** Clear entry point to library
- **Showcases content:** Featured books entice browsing
- **Simple navigation:** One clear CTA to main library
- **Delightful:** Smooth animations make it feel polished

---

## Layout & Navigation Redesign

### Global Layout Structure

#### Current Structure (src/app/layout.tsx)
```typescript
<html>
  <body>
    <ThemeProvider>
      <Navbar /> {/* MUI AppBar, always visible */}
      {children} {/* Page content */}
    </ThemeProvider>
  </body>
</html>
```

**Issues:**
- MUI ThemeProvider required (will be removed)
- Navbar always mounted (even when not needed)
- No footer component
- Space Mono font for everything

#### Target Structure
```typescript
<html lang="en" className="dark"> {/* or light based on preference */}
  <body className="bg-zinc-950 text-zinc-100 font-geist antialiased">
    <div className="flex min-h-screen flex-col">
      <Header /> {/* New minimal header */}

      <main className="flex-1">
        {children} {/* Page content */}
      </main>

      <Footer /> {/* New footer component */}
    </div>
  </body>
</html>
```

**Changes:**
- Remove MUI ThemeProvider
- Add Geist font family
- Add dark/light class to html element
- Flex column layout for sticky footer
- New Header and Footer components

### Header Component Design

**File:** `/src/app/components/header.tsx`

**Purpose:** Subtle navigation matching portfolio aesthetic

**Structure:**
```typescript
'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export function Header() {
  const { isSignedIn, isLoaded } = useUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen-sm mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href="/"
            className="text-xl font-semibold text-zinc-100 hover:text-zinc-400 transition-colors"
          >
            Penumbra
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/library"
              className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Library
            </Link>

            {isLoaded && isSignedIn && (
              <>
                <Link
                  href="/import"
                  className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Import
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Dashboard
                </Link>
              </>
            )}

            {/* Auth */}
            {isLoaded && !isSignedIn ? (
              <Link
                href="/sign-in"
                className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
              >
                sign in
              </Link>
            ) : (
              <UserButton /> {/* Clerk UserButton */}
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
```

**Mobile Version:**

For mobile, add hamburger menu:

```typescript
{/* Mobile */}
<div className="md:hidden">
  <button
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    className="text-zinc-400 hover:text-zinc-100"
    aria-label="Toggle menu"
    aria-expanded={mobileMenuOpen}
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {mobileMenuOpen ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  </button>

  {/* Mobile Menu Overlay */}
  {mobileMenuOpen && (
    <div className="fixed inset-0 z-50 bg-zinc-950">
      <div className="flex flex-col items-center justify-center h-full gap-8">
        <Link
          href="/library"
          onClick={() => setMobileMenuOpen(false)}
          className="text-2xl font-medium text-zinc-100"
        >
          Library
        </Link>
        {/* Other links */}
      </div>
    </div>
  )}
</div>
```

### Footer Component Design

**File:** `/src/app/components/footer.tsx`

**Purpose:** Minimal footer with links, matching portfolio

**Structure:**
```typescript
export function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-auto">
      <div className="max-w-screen-sm mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Penumbra. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/yourusername/penumbra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="mailto:your@email.com"
              className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

**Styling:**
```css
/* Footer */
border-top: 1px solid zinc-800 (dark) / zinc-200 (light)
margin-top: auto (pushes to bottom)
background: transparent

/* Container */
max-width: 640px (max-w-screen-sm)
margin: 0 auto
padding: 24px 16px (py-6 px-4)

/* Flex Layout */
display: flex
justify-content: space-between
align-items: center
gap: 16px (gap-4)
flex-wrap: wrap

/* Links */
font-size: 12px (text-xs)
color: zinc-500
hover: color: zinc-400
transition: color 0.2s
```

### Admin Menu UX

**Strategy:** No separate admin menu; integrate into main navigation

**Public View (Unauthenticated):**
```
Penumbra    Library                        sign in
```

**Admin View (Authenticated):**
```
Penumbra    Library    Import    Dashboard    [👤]
```

**Benefits:**
- Simpler navigation structure
- No hidden menus to discover
- Clear separation between public and admin features
- Consistent with portfolio's minimal approach

### Login Prominence Reduction

**Current State:**
- Large "Sign Up" button (contained variant, blue background)
- "Sign In" text button next to it
- High visual prominence

**Target State:**
- Small "sign in" text link in zinc-500
- Minimal visual weight
- Tucked in top-right corner

**Rationale:**
- Penumbra is public-first (browsing doesn't require auth)
- Login is only needed for admin tasks
- De-emphasizing auth makes browsing feel more open
- Matches portfolio's subtle aesthetic

**Implementation:**
```typescript
{isLoaded && !isSignedIn ? (
  <Link
    href="/sign-in"
    className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
  >
    sign in
  </Link>
) : (
  <UserButton afterSignOutUrl="/" />
)}
```

### Public vs Authenticated Views

**Comparison:**

| Page | Public Access | Authenticated Access |
|------|---------------|---------------------|
| **Home (/)** | Welcome page, featured books | Same |
| **Library (/library)** | Browse all books, search, filters | Same + edit/delete actions |
| **Book Details** | View details, synopsis | Same + edit button |
| **Import (/import)** | Redirect to /library or /sign-in | Full access to import workflow |
| **Dashboard (/dashboard)** | Redirect to /library or /sign-in | Full access to stats and management |

**Navigation Differences:**

**Public Header:**
```
Penumbra    Library                        sign in
```

**Admin Header:**
```
Penumbra    Library    Import    Dashboard    [👤]
```

**Implementation Strategy:**

Use Next.js middleware to protect routes:

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/library', '/library/(.*)'],
  // All other routes require auth
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

In components, conditionally show admin features:

```typescript
import { useUser } from '@clerk/nextjs';

function BookCard({ book }) {
  const { isSignedIn } = useUser();

  return (
    <div className="book-card">
      {/* Book details */}

      {isSignedIn && (
        <button className="edit-button">Edit</button>
      )}
    </div>
  );
}
```

---

## Design System Migration

### Color Palette Transition

#### Current: MUI Default Dark Theme

```typescript
// src/theme.ts
const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});
```

MUI dark theme defaults:
- Primary: Blue (#90caf9)
- Background default: #121212
- Background paper: #1e1e1e
- Text primary: rgba(255, 255, 255, 0.87)
- Text secondary: rgba(255, 255, 255, 0.6)
- Divider: rgba(255, 255, 255, 0.12)

#### Target: Zinc-Based Palette

**Full Zinc Scale (Tailwind):**
```css
/* Light Mode */
--zinc-50: #fafafa;
--zinc-100: #f4f4f5;
--zinc-200: #e4e4e7;
--zinc-300: #d4d4d8;
--zinc-400: #a1a1aa;
--zinc-500: #71717a;
--zinc-600: #52525b;
--zinc-700: #3f3f46;
--zinc-800: #27272a;
--zinc-900: #18181b;
--zinc-950: #09090b;

/* Dark Mode (Primary) */
background: zinc-950 (#09090b)
text-primary: zinc-100 (#f4f4f5)
text-secondary: zinc-400 (#a1a1aa)
text-tertiary: zinc-500 (#71717a)
borders: zinc-800 (#27272a)
card-background: zinc-900 (#18181b) or transparent
hover-background: zinc-900/50 (rgba(24, 24, 27, 0.5))
```

**Semantic Token Mapping:**

| Purpose | Light Mode | Dark Mode |
|---------|-----------|----------|
| **Background** | zinc-50 | zinc-950 |
| **Surface** | white | zinc-900 |
| **Border** | zinc-200 | zinc-800 |
| **Text Primary** | zinc-900 | zinc-100 |
| **Text Secondary** | zinc-600 | zinc-400 |
| **Text Tertiary** | zinc-500 | zinc-500 |
| **Hover Background** | zinc-100 | zinc-900/50 |
| **Active Border** | zinc-400 | zinc-600 |
| **Focus Ring** | zinc-500 | zinc-500 |

**Implementation:**

Remove MUI theme, add Tailwind config:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // or 'media' for system preference
  theme: {
    extend: {
      colors: {
        // Zinc palette is included by default
      },
    },
  },
  plugins: [],
};

export default config;
```

Update globals.css:

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode (if needed in future) */
    --background: 250 250 250; /* zinc-50 */
    --foreground: 24 24 27; /* zinc-900 */
  }

  .dark {
    /* Dark mode (primary) */
    --background: 9 9 11; /* zinc-950 */
    --foreground: 244 244 245; /* zinc-100 */
  }
}

html {
  @apply antialiased;
}

body {
  @apply bg-zinc-950 text-zinc-100;
}
```

### Typography Changes

#### Current: Space Mono

```typescript
// src/app/layout.tsx
const spaceMono = Space_Mono({
  weight: ['400', '700'],
  variable: '--font-space-mono',
  subsets: ['latin', 'latin-ext'],
});
```

**Characteristics:**
- Monospace font (fixed-width)
- Technical, code-like appearance
- Good for code/data, less readable for prose
- Weights: 400 (regular), 700 (bold)

#### Target: Geist & Geist Mono

**Geist (Sans Serif):**
- Variable font with full weight range (100-900)
- Clean, modern, highly readable
- Designed by Vercel for interfaces
- Use for: Body text, headings, UI elements

**Geist Mono (Monospace):**
- Variable font with full weight range (100-900)
- Clean monospace for code/data
- Use for: Code blocks, data tables, ISBN numbers

**Implementation:**

```typescript
// src/app/layout.tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        {/* font-sans will use Geist Sans */}
        {/* font-mono will use Geist Mono */}
        {children}
      </body>
    </html>
  );
}
```

Update tailwind.config.ts:

```typescript
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      mono: ['var(--font-geist-mono)', 'Menlo', 'monospace'],
    },
  },
}
```

**Typography Scale:**

```css
/* Headings */
h1: text-4xl (36px) font-bold tracking-tight
h2: text-3xl (30px) font-bold tracking-tight
h3: text-2xl (24px) font-semibold tracking-tight
h4: text-xl (20px) font-semibold
h5: text-lg (18px) font-semibold
h6: text-base (16px) font-semibold

/* Body */
body-lg: text-lg (18px) font-normal
body: text-base (16px) font-normal
body-sm: text-sm (14px) font-normal
caption: text-xs (12px) font-normal

/* Line Heights */
tight: leading-tight (1.25)
snug: leading-snug (1.375)
normal: leading-normal (1.5)
relaxed: leading-relaxed (1.625)
```

**Usage Examples:**

```typescript
// Page heading
<h1 className="text-4xl font-bold text-zinc-100 mb-6">Penumbra</h1>

// Book title
<h3 className="text-xl font-semibold text-zinc-100">The Great Gatsby</h3>

// Author name
<p className="text-sm text-zinc-400">F. Scott Fitzgerald</p>

// Metadata label
<span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
  Publisher
</span>

// Metadata value
<span className="text-sm text-zinc-100">Scribner</span>

// ISBN or code
<code className="font-mono text-sm text-zinc-400">978-0-7432-7356-5</code>
```

### Spacing and Layout Grid

#### Current: MUI Spacing

MUI uses 8px base unit:
- `spacing(1)` = 8px
- `spacing(2)` = 16px
- `spacing(3)` = 24px
- etc.

Components use `sx` prop with spacing values:
```typescript
<Container sx={{ padding: '25px' }}>
<Stack spacing={2}>
<Box sx={{ mt: { xs: 2, sm: 3 } }}>
```

#### Target: Tailwind Spacing Scale

Tailwind uses 0.25rem (4px) base unit:
- `1` = 0.25rem (4px)
- `2` = 0.5rem (8px)
- `3` = 0.75rem (12px)
- `4` = 1rem (16px)
- `6` = 1.5rem (24px)
- `8` = 2rem (32px)
- `12` = 3rem (48px)
- `16` = 4rem (64px)

**Conversion Guide:**

| MUI | Tailwind | Pixels |
|-----|----------|--------|
| spacing(1) | p-2 | 8px |
| spacing(2) | p-4 | 16px |
| spacing(3) | p-6 | 24px |
| spacing(4) | p-8 | 32px |
| spacing(5) | p-10 | 40px |
| spacing(6) | p-12 | 48px |

**Common Patterns:**

```typescript
// MUI
<Container sx={{ padding: '25px' }}>

// Tailwind
<div className="p-6"> {/* 24px, closest to 25px */}

// MUI
<Stack spacing={2}>

// Tailwind
<div className="space-y-4"> {/* 16px between children */}

// MUI
<Box sx={{ mt: { xs: 2, sm: 3 } }}>

// Tailwind
<div className="mt-4 sm:mt-6"> {/* 16px mobile, 24px tablet+ */}
```

**Layout Container:**

```typescript
// Standard page container (consistent across all pages)
<div className="max-w-screen-sm mx-auto px-4 py-6">
  {/* Content */}
</div>

// max-w-screen-sm: 640px max width
// mx-auto: Centered horizontally
// px-4: 16px horizontal padding
// py-6: 24px vertical padding
```

**Responsive Spacing:**

```typescript
// Small padding on mobile, larger on desktop
<div className="p-4 md:p-6 lg:p-8">

// Different gaps for different breakpoints
<div className="gap-2 sm:gap-4 md:gap-6">
```

### Animation Principles

#### Current: MUI Transitions

MUI provides basic transitions:
```typescript
sx={{
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: 2,
  },
  transition: 'all 0.2s ease-in-out',
}}
```

#### Target: Motion Primitives + Tailwind Transitions

**Philosophy:**
1. **Purposeful:** Animations should have meaning, not be decorative
2. **Subtle:** Smooth, refined, not attention-grabbing
3. **Fast:** Quick transitions (200-300ms) for immediate feedback
4. **Performance:** 60fps, GPU-accelerated properties (transform, opacity)
5. **Accessible:** Respect `prefers-reduced-motion`

**Framer Motion Integration:**

```bash
npm install framer-motion
```

**Common Animation Patterns:**

```typescript
// Fade in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>

// Slide up on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>

// Stagger children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }}
  initial="hidden"
  animate="visible"
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>

// Slide-over panel
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
>
  {children}
</motion.div>

// Button hover
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.15 }}
>
  Click me
</motion.button>
```

**Tailwind Transition Utilities:**

```typescript
// Basic transition
<div className="transition-colors duration-200 hover:bg-zinc-800">

// Multiple properties
<div className="transition-all duration-300 hover:scale-105">

// Custom timing
<div className="transition-transform ease-out duration-500">

// Reduce motion for accessibility
<div className="motion-reduce:transition-none">
```

**Accessibility:**

```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Performance Considerations:**

```typescript
// Good: GPU-accelerated properties
transform: translateX() translateY() scale() rotate()
opacity

// Bad: Layout-thrashing properties
width, height, margin, padding, top, left
```

**Loading States:**

```typescript
// Skeleton pulse animation (Tailwind built-in)
<div className="animate-pulse">
  <div className="h-4 bg-zinc-800 rounded w-3/4" />
</div>

// Spinner (custom)
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-100" />
```

### Accessibility Considerations

**WCAG 2.1 AA Compliance Checklist:**

#### Color Contrast
- [ ] Text (14-18px): Minimum 4.5:1 contrast ratio
- [ ] Large text (18px+ or 14px+ bold): Minimum 3:1 contrast ratio
- [ ] UI components and graphical objects: Minimum 3:1 contrast ratio

**Zinc Palette Contrast Checks (Dark Mode):**

| Combination | Ratio | Pass? |
|-------------|-------|-------|
| zinc-100 on zinc-950 | 18.1:1 | ✅ AAA |
| zinc-200 on zinc-950 | 16.5:1 | ✅ AAA |
| zinc-400 on zinc-950 | 9.8:1 | ✅ AAA |
| zinc-500 on zinc-950 | 6.9:1 | ✅ AA |
| zinc-600 on zinc-950 | 4.8:1 | ✅ AA |
| zinc-700 on zinc-950 | 3.2:1 | ✅ UI components |
| zinc-800 on zinc-950 | 2.1:1 | ❌ Borders only |

**Recommendations:**
- Body text: zinc-100 or zinc-200
- Secondary text: zinc-400
- Tertiary text / placeholders: zinc-500
- Borders: zinc-800 (meets 3:1 for UI components)

#### Keyboard Navigation
- [ ] All interactive elements focusable via Tab
- [ ] Focus order follows visual order
- [ ] Focus visible indicator (not just browser default)
- [ ] Skip to main content link
- [ ] Modal/dialog focus trap
- [ ] Escape key closes overlays

**Implementation:**

```typescript
// Custom focus ring (Tailwind)
<button className="focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950">

// Skip to content link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-zinc-100 focus:text-zinc-900"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

#### Screen Reader Support
- [ ] Semantic HTML elements (nav, main, article, section, etc.)
- [ ] ARIA labels for icons and icon-only buttons
- [ ] ARIA expanded states for dropdowns/menus
- [ ] ARIA live regions for dynamic content
- [ ] Alt text for all images
- [ ] Form labels associated with inputs

**Examples:**

```typescript
// Semantic structure
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/library">Library</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Book Title</h1>
    {/* Content */}
  </article>
</main>

// Icon button
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// Expandable menu
<button
  aria-expanded={isOpen}
  aria-controls="mobile-menu"
  onClick={toggle}
>
  Menu
</button>
<div id="mobile-menu" hidden={!isOpen}>
  {/* Menu items */}
</div>

// Live region for search results
<div role="status" aria-live="polite" aria-atomic="true">
  {resultsCount} books found
</div>

// Image alt text
<img src={cover} alt={`Cover of ${title} by ${author}`} />

// Form label
<label htmlFor="search-input" className="sr-only">
  Search library
</label>
<input id="search-input" type="search" />
```

#### Motion and Animation
- [ ] Respect prefers-reduced-motion
- [ ] No motion critical for understanding content
- [ ] User can pause/stop animations
- [ ] No auto-playing videos with sound

**Implementation:**

```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```typescript
// Tailwind utility
<div className="motion-reduce:transition-none motion-reduce:animate-none">
```

#### Touch Targets
- [ ] Minimum 44x44px touch target size
- [ ] Adequate spacing between touch targets
- [ ] No overlapping touch areas

**Implementation:**

```typescript
// Ensure minimum size
<button className="min-h-[44px] min-w-[44px] p-2">

// Add padding to increase touch area
<a className="inline-block p-3"> {/* Makes larger hit area */}
  Link text
</a>
```

---

## Phased Implementation Roadmap

### Overview

Breaking the visual redesign into 5 manageable phases:

1. **Foundation** - Design system basics (colors, fonts, layout)
2. **Navigation & Footer** - Header/footer components
3. **Core Library Views** - Library list, details, search
4. **Admin Features** - Import, dashboard
5. **Polish & Animations** - Motion, micro-interactions, final touches

Each phase is independently deployable and testable.

---

### Phase 1: Foundation (Est. 8-12 hours)

**Goal:** Establish new design system without breaking existing functionality

**Tasks:**

1. **Install Dependencies**
   - Install Tailwind CSS
   - Install Geist fonts (`geist` package)
   - Install Framer Motion
   - Keep MUI installed (remove in Phase 4)

2. **Configure Tailwind**
   - Create `tailwind.config.ts` with zinc palette
   - Update `globals.css` with Tailwind directives
   - Configure dark mode (class-based)

3. **Update Root Layout**
   - Import Geist fonts
   - Add font CSS variables to html element
   - Update body classes (bg-zinc-950, text-zinc-100, font-sans)
   - Keep MUI ThemeProvider for now

4. **Create Layout Components**
   - Create basic flex layout structure (min-h-screen, flex-col)
   - Add skip-to-content link
   - Create max-w-screen-sm container utility

5. **Update Globals**
   - Add focus ring utilities
   - Add prefers-reduced-motion styles
   - Define any custom CSS utilities needed

**Files Modified:**
- `package.json` (add dependencies)
- `tailwind.config.ts` (new file)
- `src/app/globals.css` (major update)
- `src/app/layout.tsx` (font changes, body classes)
- `postcss.config.js` (Tailwind config)

**Success Criteria:**
- Tailwind CSS working alongside MUI
- Geist fonts loading correctly
- Dark zinc background visible
- No visual regressions in existing pages

**Testing:**
- All pages still render correctly
- Fonts load without FOUT/FOIT
- Tailwind classes apply correctly
- No console errors

---

### Phase 2: Navigation & Footer (Est. 6-8 hours)

**Goal:** Replace MUI Navbar with new Header, add Footer

**Tasks:**

1. **Create Header Component**
   - Build new `/src/app/components/header.tsx`
   - Implement responsive navigation (desktop + mobile)
   - Add scroll-based backdrop blur
   - Conditional rendering for auth state
   - Hamburger menu for mobile
   - Integrate Clerk UserButton

2. **Create Footer Component**
   - Build new `/src/app/components/footer.tsx`
   - Add links (GitHub, Contact, etc.)
   - Responsive layout

3. **Update Root Layout**
   - Remove `<Navbar />` import
   - Add `<Header />` and `<Footer />`
   - Ensure proper flex layout (footer at bottom)

4. **Delete Old Navbar**
   - Remove `/src/app/components/navbar.tsx`
   - Clean up any navbar-specific styles

5. **Test Navigation**
   - Test all navigation links
   - Test auth state changes (sign in/out)
   - Test mobile menu interactions
   - Test keyboard navigation
   - Test screen reader announcements

**Files Modified:**
- `src/app/components/header.tsx` (new file)
- `src/app/components/footer.tsx` (new file)
- `src/app/layout.tsx` (replace navbar)
- `src/app/components/navbar.tsx` (delete)

**Success Criteria:**
- Header renders correctly on all pages
- Admin links only visible when authenticated
- Mobile menu works smoothly
- Footer stays at bottom of page
- No layout shifts

**Testing:**
- Navigation links work
- Auth conditional rendering works
- Mobile menu toggles correctly
- Keyboard navigation works
- Screen reader announces menu state

---

### Phase 3: Core Library Views (Est. 16-20 hours)

**Goal:** Redesign library, book cards, details, and search to match portfolio style

**Tasks:**

#### 3.1: Home Page (2-3 hours)
- Redesign `/src/app/page.tsx` with hero section
- Add featured books grid (fetch recent books)
- Implement entrance animations

#### 3.2: Library List (6-8 hours)
- Redesign `/src/app/library/components/item.tsx`
  - Remove MUI Card, use Tailwind divs
  - New hover states (bg change, not shadow)
  - Image loading states
  - Responsive layout
- Redesign `/src/app/library/components/list.tsx`
  - Update container to max-w-screen-sm
  - Redesign pagination
  - Update skeleton loading
- Redesign `/src/app/library/components/library.tsx`
  - Update empty states
  - Remove MUI Container/Typography
- Add stagger animations for book cards

#### 3.3: Book Details (4-5 hours)
- Redesign `/src/app/library/components/details.tsx`
  - Change from modal to slide-over panel
  - Implement Framer Motion animations
  - Update metadata layout (grid instead of stacked)
  - New close button styling
  - Overlay with backdrop blur
- Ensure mobile full-screen behavior

#### 3.4: Search Header (3-4 hours)
- Redesign `/src/app/library/components/searchHeader.tsx`
  - Update container to max-w-screen-sm
  - Sticky header with backdrop blur
  - New search input styling
- Redesign `/src/app/library/components/intelligentSearch.tsx`
  - Update search input
  - Add filter pills
  - Clear filters functionality
  - Animations for filter additions/removals

**Files Modified:**
- `src/app/page.tsx`
- `src/app/library/page.tsx`
- `src/app/library/components/library.tsx`
- `src/app/library/components/list.tsx`
- `src/app/library/components/item.tsx`
- `src/app/library/components/details.tsx`
- `src/app/library/components/searchHeader.tsx`
- `src/app/library/components/intelligentSearch.tsx`

**Success Criteria:**
- Library list matches target designs
- Book cards have proper hover states
- Details panel slides in smoothly
- Search works with new styling
- All animations smooth (60fps)
- Skeleton states match final layout
- Mobile responsive behavior works

**Testing:**
- Browse library on desktop and mobile
- Open book details, test animations
- Search and filter books
- Test keyboard navigation
- Test screen reader experience
- Test with slow network (loading states)
- Test with no book cover images

---

### Phase 4: Admin Features (Est. 10-12 hours)

**Goal:** Redesign import and dashboard pages for narrow layout

**Tasks:**

#### 4.1: Import Page Redesign (6-8 hours)
- Redesign `/src/app/import/components/import.tsx`
  - Change from two-column to single-column + footer queue
  - Update container to max-w-screen-sm
- Redesign `/src/app/import/components/search.tsx`
  - New search input styling
  - Loading states
- Redesign `/src/app/import/components/preview.tsx`
  - Update card styling
  - "Add to Queue" button styling
- Redesign `/src/app/import/components/queue.tsx`
  - Build fixed footer queue
  - Expand/collapse animation
  - Queue item styling
  - "Import All" button
- Add proper error states
- Test import workflow end-to-end

#### 4.2: Dashboard Redesign (4-6 hours)
- Redesign `/src/app/dashboard/page.tsx`
  - Update container to max-w-screen-sm
  - Remove MUI Typography
- Redesign `/src/app/dashboard/components/grid.tsx`
  - Build stats grid (books, authors, genres counts)
  - Recent activity list
  - Quick action buttons
- Add entrance animations
- Fetch real stats from database

#### 4.3: Auth Protection
- Ensure middleware protects /import and /dashboard
- Add redirects for unauthenticated users
- Test auth flows

**Files Modified:**
- `src/app/import/page.tsx`
- `src/app/import/components/import.tsx`
- `src/app/import/components/search.tsx`
- `src/app/import/components/preview.tsx`
- `src/app/import/components/queue.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/components/grid.tsx`
- `middleware.ts` (if needed)

**Success Criteria:**
- Import workflow functions correctly
- Queue footer expands/collapses smoothly
- Dashboard shows accurate stats
- Only visible when authenticated
- Mobile responsive

**Testing:**
- Test full import workflow
- Test queue management (add/remove)
- Test batch import
- Test dashboard stats accuracy
- Test on mobile devices
- Test auth redirects

---

### Phase 5: Polish & Animations (Est. 8-10 hours)

**Goal:** Add final animations, micro-interactions, and remove MUI

**Tasks:**

#### 5.1: Remove MUI (2-3 hours)
- Remove all remaining MUI components
- Delete `src/theme.ts`
- Remove MUI from `package.json`
- Remove `@mui/*` and `@emotion/*` packages
- Remove `AppRouterCacheProvider` and `ThemeProvider` from layout
- Run `npm install` to clean up
- Test all pages still work

#### 5.2: Add Micro-Interactions (3-4 hours)
- Button hover/press animations
- Link hover effects
- Input focus animations
- Card hover lift effects
- Smooth scroll behavior
- Loading state transitions

#### 5.3: Page Transitions (2-3 hours)
- Add page transition animations (optional)
- Smooth route changes
- Loading indicators for page navigation

#### 5.4: Performance Optimization (2-3 hours)
- Image optimization (Next.js Image component)
- Lazy loading for images
- Code splitting review
- Bundle size analysis
- Lighthouse audit and fixes

#### 5.5: Final Accessibility Audit (1-2 hours)
- Contrast checker on all text
- Keyboard navigation full test
- Screen reader full test
- Focus management review
- ARIA labels review
- Generate accessibility report

#### 5.6: Final QA (2-3 hours)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile device testing (iOS, Android)
- Tablet testing
- Dark mode verification
- Loading state verification
- Error state verification
- Empty state verification

**Files Modified:**
- `package.json` (remove MUI dependencies)
- `src/app/layout.tsx` (remove MUI providers)
- `src/theme.ts` (delete file)
- Various component files (add final animations)

**Success Criteria:**
- No MUI dependencies remaining
- All animations smooth and performant
- Lighthouse score: 90+ Performance, 100 Accessibility
- No console errors or warnings
- Works across all major browsers
- Fully responsive on all devices

**Testing:**
- Full regression testing
- Performance testing
- Accessibility testing (automated + manual)
- Cross-browser testing
- Mobile testing

---

### Implementation Timeline

**Total Estimated Time: 48-62 hours**

Suggested schedule (assuming 10 hours/week):

- **Week 1:** Phase 1 (Foundation)
- **Week 2:** Phase 2 (Navigation & Footer)
- **Weeks 3-4:** Phase 3 (Core Library Views)
- **Weeks 5-6:** Phase 4 (Admin Features)
- **Week 7:** Phase 5 (Polish & Animations)

---

## Future Considerations

### Cover View Option

**User Requirement:** "Future consideration: 'cover view' option for library"

**Concept:** Toggle between list view (current) and cover grid view

**Visual Design:**

#### List View (Current/Default)
```
┌──────────────────────────────────────────┐
│  ┌─────┐  Title of Book                 │
│  │ img │  Author Name                    │
│  └─────┘  Metadata                       │
└──────────────────────────────────────────┘
```

#### Cover Grid View (Future)
```
┌──────────────────────────────────────────┐
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐             │
│  │img│  │img│  │img│  │img│             │
│  └───┘  └───┘  └───┘  └───┘             │
│  Title  Title  Title  Title              │
│                                           │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐             │
│  │img│  │img│  │img│  │img│             │
│  └───┘  └───┘  └───┘  └───┘             │
│  Title  Title  Title  Title              │
└──────────────────────────────────────────┘
```

**Implementation Plan:**

```typescript
// Add view toggle to search header
<div className="flex items-center gap-2">
  <button
    onClick={() => setView('list')}
    className={view === 'list' ? 'active' : ''}
    aria-label="List view"
  >
    <ListIcon />
  </button>
  <button
    onClick={() => setView('grid')}
    className={view === 'grid' ? 'active' : ''}
    aria-label="Grid view"
  >
    <GridIcon />
  </button>
</div>

// Conditional rendering
{view === 'list' ? (
  <ListView books={books} />
) : (
  <GridView books={books} />
)}
```

**Grid View Specifications:**

```css
/* Grid Container */
display: grid
grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))
gap: 16px (gap-4)

/* Book Card */
display: flex
flex-direction: column
cursor: pointer

/* Cover Image */
aspect-ratio: 2/3
width: 100%
border-radius: 8px (rounded-lg)
overflow: hidden
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
transition: transform 0.2s, box-shadow 0.2s

hover: transform: translateY(-4px)
hover: box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2)

/* Title (below cover) */
font-size: 14px (text-sm)
font-weight: 500 (font-medium)
color: zinc-100 (dark) / zinc-900 (light)
margin-top: 8px (mt-2)
line-height: 1.3
overflow: hidden
text-overflow: ellipsis
display: -webkit-box
-webkit-line-clamp: 2
-webkit-box-orient: vertical
```

**Responsive Behavior:**

```
Desktop (≥640px): 4 columns
Tablet (480px-640px): 3 columns
Mobile (<480px): 2 columns
```

**Accessibility:**

```typescript
<div role="group" aria-label="Library view options">
  <button
    role="tab"
    aria-selected={view === 'list'}
    aria-controls="library-content"
  >
    List View
  </button>
  <button
    role="tab"
    aria-selected={view === 'grid'}
    aria-controls="library-content"
  >
    Grid View
  </button>
</div>

<div id="library-content" role="tabpanel">
  {/* Content */}
</div>
```

**User Preference Persistence:**

```typescript
// Save to localStorage
useEffect(() => {
  localStorage.setItem('library-view', view);
}, [view]);

// Load on mount
useEffect(() => {
  const savedView = localStorage.getItem('library-view');
  if (savedView) {
    setView(savedView as 'list' | 'grid');
  }
}, []);
```

**Implementation Phase:** Add this in Phase 5 or as Phase 6 after full redesign complete.

---

### Dark/Light Mode Toggle

**Current:** Dark mode only

**Future:** Add light mode support

**Implementation:**

```typescript
// Theme provider
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'dark',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

**Theme Toggle Button:**

```typescript
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md border border-zinc-800 dark:border-zinc-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

Add to header navigation.

---

### Progressive Web App (PWA)

**Future:** Add offline support and PWA capabilities

**Benefits:**
- Offline browsing of cached books
- Add to home screen on mobile
- Faster load times with caching
- Native-like experience

**Implementation:**

```typescript
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // ... other config
});
```

Add manifest.json and service worker.

---

### Enhanced Search

**Future:** Full-text search, filters, sorting

**Ideas:**
- Search within synopsis/descriptions
- Filter by: genre, publication year, language, binding
- Sort by: title, author, publication date, recently added
- Saved searches
- Search history

---

## Appendix

### Design Tokens Reference

```typescript
// design-tokens.ts
export const colors = {
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
};

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const borderRadius = {
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem',   // 8px
  xl: '0.75rem',  // 12px
  '2xl': '1rem',  // 16px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};
```

### Component Library Checklist

Common components to build:

- [ ] Button (primary, secondary, ghost, danger)
- [ ] Input (text, search, email, password)
- [ ] Card (basic container)
- [ ] Badge/Pill (for filters, tags)
- [ ] Spinner (loading indicator)
- [ ] Skeleton (loading placeholder)
- [ ] Modal/Dialog (overlays)
- [ ] Toast/Notification (feedback)
- [ ] Dropdown Menu
- [ ] Tabs
- [ ] Pagination

---

## Summary

This comprehensive visual design plan provides a complete roadmap for transitioning Penumbra from Material-UI to a portfolio-aligned design system. The plan prioritizes:

1. **Public-first UX** - Browseable library with elegant admin features
2. **Minimal aesthetic** - Clean zinc palette, generous whitespace, refined typography
3. **Smooth interactions** - Purposeful animations, smooth transitions
4. **Accessibility** - WCAG 2.1 AA compliance throughout
5. **Incremental migration** - Phased approach to minimize risk
6. **Future-ready** - Considerations for cover view, theming, PWA

The next step is for frontend-dev to use this plan to create a technical implementation plan with specific component specifications, file changes, and code examples.
