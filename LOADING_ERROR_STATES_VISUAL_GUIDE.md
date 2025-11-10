# Loading & Error States - Visual Design Guide

**Visual reference showing exact appearance of all feedback states in Penumbra**

---

## Design Token Reference

### Color Palette (Dark Theme)

```
Background:
  └─ default: #121212 (main app background)
  └─ paper:   #1e1e1e (cards, surfaces)

Text:
  └─ primary:   rgba(255, 255, 255, 0.87)
  └─ secondary: rgba(255, 255, 255, 0.6)
  └─ disabled:  rgba(255, 255, 255, 0.38)

State Colors:
  └─ primary:  #90caf9 (loading indicators, links)
  └─ error:    #f44336 (errors, destructive actions)
  └─ warning:  #ffa726 (warnings, caution)
  └─ success:  #66bb6a (success states)
  └─ info:     #29b6f6 (informational)

Action:
  └─ hover:     rgba(255, 255, 255, 0.08)
  └─ selected:  rgba(255, 255, 255, 0.16)
  └─ disabled:  rgba(255, 255, 255, 0.26)
```

---

## Loading State Visuals

### 1. Book List Skeleton Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  [████████████████████████]  ← Search bar skeleton              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ┌──────┐  ███████████████████                                   │
│ │ ████ │  ████████████                                          │
│ │ ████ │                                                         │
│ │ ████ │  ██████████████ ✧ ████████                            │
│ │ ████ │  ████████████████ ✧ █████████                         │
│ │ ████ │  ███████████ ✧ ██████                                 │
│ └──────┘                                                         │
└─────────────────────────────────────────────────────────────────┘
  ↑ Book cover      ↑ Title, author, metadata skeletons
    100×160px         Wave animation (1.5s)

Repeat 10 times ↓

Colors:
- Card background: #1e1e1e
- Skeleton color:  rgba(255, 255, 255, 0.11) (action.hover)
- Wave animation:  Subtle gradient sweep

Animation:
- Type:     Wave (default MUI)
- Duration: 1.5s
- Timing:   Linear infinite
```

---

### 2. Search Input Loading

```
┌────────────────────────────────────────────────────────────┐
│  Search by title, author, or subject...    ⟳  ×            │
└────────────────────────────────────────────────────────────┘
                                              ↑   ↑
                                         Loading  Clear
                                         spinner  button

Details:
- Spinner: 20px diameter
- Color:   #90caf9 (primary.main)
- Speed:   1.4s per rotation
- Position: Right side of input, 8px margin

States:
1. Idle:    No spinner, no clear button
2. Typing:  Spinner appears after 300ms debounce
3. Results: Spinner disappears, clear button shows (if has filters)
4. Error:   Spinner disappears, input stays
```

---

### 3. Button Loading States

#### Default State
```
┌───────────────────┐
│  💾  Save Book    │  ← Icon + Text
└───────────────────┘
Color: #90caf9 (primary)
Size:  minWidth 120px
```

#### Loading State
```
┌───────────────────┐
│  ⟳  Saving...     │  ← Spinner + Text (present continuous)
└───────────────────┘
Color: Slightly faded
Disabled: true
Width: Same (120px minimum)
```

#### Success State (1 second)
```
┌───────────────────┐
│  ✓  Saved!        │  ← Checkmark + Text
└───────────────────┘
Color: #66bb6a (success.main)
Duration: 1000ms, then return to default
```

Animation:
```
Default → Loading → Success → Default
  ↓         ↓          ↓          ↓
 0ms      200ms      1000ms    1200ms
```

---

### 4. Linear Progress Bar (Long Operations)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│          Fetching book details...               │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ↑ Indeterminate animation (sliding bar)        │
│                                                 │
│         This may take a few seconds...          │
│                                                 │
└─────────────────────────────────────────────────┘

Specifications:
- Height:           6px
- Border radius:    3px
- Background:       rgba(255, 255, 255, 0.08)
- Bar color:        #90caf9 (primary.main)
- Bar width:        40% of container
- Animation speed:  2s slide
```

---

### 5. Book Cover Image Progressive Loading

#### State 1: Loading (Skeleton)
```
┌──────────┐
│ ▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓ │  100×160px skeleton
│ ▓▓▓▓▓▓▓▓ │  Wave animation
│ ▓▓▓▓▓▓▓▓ │  Border radius: 4px
│ ▓▓▓▓▓▓▓▓ │
└──────────┘
```

#### State 2: Loaded (Fade In)
```
┌──────────┐
│          │
│  [Image] │  Fade in over 300ms
│          │  opacity: 0 → 1
│          │  easing: ease-in-out
└──────────┘
```

#### State 3: Error (Placeholder)
```
┌──────────┐
│          │
│    🖼️    │  Image not supported icon
│          │  40px, color: text.disabled
│          │  Background: action.hover
└──────────┘
```

---

### 6. Search Dropdown Loading

```
┌────────────────────────────────────────────┐
│  Search by title, author, or subject...   │
└────────────────────────────────────────────┘
         ↓ Opens dropdown
┌────────────────────────────────────────────┐
│                                            │
│              ⟳                             │  ← 32px spinner
│                                            │
│        Searching library...                │  ← body2, text.secondary
│                                            │
└────────────────────────────────────────────┘

Details:
- Dropdown elevation: 8
- Background: #1e1e1e (background.paper)
- Padding: 32px vertical
- Spinner: 32px diameter, centered
- Text: Center-aligned, 16px below spinner
```

---

## Error State Visuals

### 1. Network Error (Full Page)

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│                                                       │
│                        📡                             │
│                     (80px icon)                       │
│                  color: #f44336                       │
│                  opacity: 0.8                         │
│                                                       │
│                  Connection Lost                      │
│                  (h6, fontWeight: 600)                │
│                                                       │
│     Unable to connect to the server. Please check     │
│     your internet connection and try again.           │
│     (body2, text.secondary, max-width: 400px)         │
│                                                       │
│        ┌────────────┐    ┌────────────┐             │
│        │   Retry    │    │  Go Home   │             │
│        └────────────┘    └────────────┘             │
│         Contained          Outlined                  │
│                                                       │
└───────────────────────────────────────────────────────┘

Spacing:
- Icon to title:    24px (mb: 3)
- Title to text:    16px (gutterBottom)
- Text to buttons:  32px (mb: 4)
- Button gap:       16px (spacing: 2)

Center alignment:
- display: flex
- flexDirection: column
- alignItems: center
- justifyContent: center
- minHeight: 60vh
```

---

### 2. API Error (Card)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ⚠️  Rate Limit Exceeded                                │
│  (32px icon)  (h6)                                      │
│  #ffa726                                                │
│                                                         │
│  Too many searches in a short time. Please wait a       │
│  moment before trying again.                            │
│  (body2, text.secondary)                                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  ℹ️  The ISBNdb API limits search requests. This  │ │
│  │  helps keep the service available for everyone.   │ │
│  └───────────────────────────────────────────────────┘ │
│  Info alert, outlined variant                           │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                 │
│  │ Please Wait... │  │   Go Back    │                 │
│  └──────────────┘    └──────────────┘                 │
│    Disabled            Outlined                         │
│                                                         │
└─────────────────────────────────────────────────────────┘

Card:
- Margin: 25px (xs) / 50px (md)
- Background: #1e1e1e
- Padding: 24px (CardContent default)

Alert:
- Severity: info
- Variant: outlined
- Border color: #29b6f6
- Background: Slightly lighter than card
```

---

### 3. Validation Error (Inline)

```
ISBN
┌────────────────────────────────────────────────────────┐
│  ⚠️  978-0-13-110362                                   │  ← Error icon + value
└────────────────────────────────────────────────────────┘
   ↑ Red border (2px, #f44336)

⚠️ Please enter a valid ISBN (10 or 13 digits)
↑ Helper text, error color

Details:
- Error icon: 20px, inside input (startAdornment)
- Border width: 2px (increases from 1px)
- Border color: #f44336 (error.main)
- Helper text: caption size (12px)
- Icon color: #f44336
```

---

### 4. Form Error (Alert)

```
┌─────────────────────────────────────────────────────────┐
│  ⛔  Unable to save book                                │
│                                                         │
│  Please check all required fields and try again.        │
└─────────────────────────────────────────────────────────┘
  ↑ Error alert at top of form

Specifications:
- Severity: error
- Variant: outlined
- Border color: #f44336 (error.main)
- Background: rgba(244, 67, 54, 0.12) (error.dark)
- Icon: Error icon (⛔), color: #e57373 (error.light)
- Margin bottom: 16px (mb: 2)
```

---

### 5. Error Boundary (Crash Recovery)

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│                                                       │
│                        ⚠️                             │
│                    (100px icon)                       │
│                  color: #f44336                       │
│                  opacity: 0.8                         │
│                                                       │
│               Something Went Wrong                    │
│                  (h6, fontWeight: 600)                │
│                                                       │
│    An unexpected error occurred. This has been        │
│    logged and we'll look into it.                     │
│    (body2, text.secondary, max-width: 500px)          │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  TypeError: Cannot read property 'map' of null  │ │
│  └─────────────────────────────────────────────────┘ │
│  Dev mode only: Error details box                     │
│  Background: action.hover                             │
│  Font: monospace, error.light                         │
│                                                       │
│      ┌──────────────┐    ┌──────────────┐           │
│      │ Reload Page  │    │   Go Home    │           │
│      └──────────────┘    └──────────────┘           │
│                                                       │
└───────────────────────────────────────────────────────┘

Full viewport:
- minHeight: 100vh
- Background: #121212 (background.default)
- Centered content
```

---

## Empty State Visuals

### 1. Empty Library (New User)

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│                                                       │
│                        📚                             │
│                   (120px icon)                        │
│                  color: #90caf9                       │
│                  opacity: 0.6                         │
│                                                       │
│               Your Library is Empty                   │
│                  (h6, fontWeight: 600)                │
│                                                       │
│    Start building your personal library by importing  │
│    books. Search by ISBN to quickly add books with    │
│    complete metadata.                                 │
│    (body2, text.secondary, max-width: 500px)          │
│                                                       │
│        ┌──────────────────────────────┐              │
│        │  ➕  Import Your First Book  │              │
│        └──────────────────────────────┘              │
│         Large contained button                        │
│         minWidth: 180px                               │
│                                                       │
└───────────────────────────────────────────────────────┘

Hierarchy:
1. Large icon (visual anchor)
2. Clear heading (what's wrong)
3. Helpful description (why and what to do)
4. Primary action button (next step)
```

---

### 2. Empty Search Results

```
┌────────────────────────────────────────────┐
│                                            │
│                  🔍                         │
│               (48px icon)                  │
│            color: text.disabled            │
│            opacity: 0.5                    │
│                                            │
│   No suggestions found for "neuromancer"   │
│   (body2, text.secondary)                  │
│                                            │
│   Press Enter to search for titles         │
│   containing this text                     │
│   (caption, text.secondary)                │
│                                            │
└────────────────────────────────────────────┘

In dropdown context:
- Padding: 32px vertical, 24px horizontal
- Center-aligned text
- Gray icons (less alarming than error red)
```

---

### 3. Empty Filtered Results

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│                        🔍⃠                            │
│                   (80px icon)                         │
│                color: text.disabled                   │
│                opacity: 0.5                           │
│                                                       │
│                  No Books Found                       │
│                  (h6, fontWeight: 600)                │
│                                                       │
│    No books match your current filters. Try           │
│    adjusting your search or clearing filters.         │
│    (body2, text.secondary, max-width: 400px)          │
│                                                       │
│              ┌──────────────────┐                    │
│              │  Clear Filters   │                    │
│              └──────────────────┘                    │
│               Outlined button                         │
│                                                       │
└───────────────────────────────────────────────────────┘

Less dramatic than "empty library":
- Smaller icon (80px vs 120px)
- Outlined button (vs contained)
- Shorter minHeight (50vh vs 60vh)
```

---

### 4. Empty Import Queue

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                         📋                              │
│                     (64px icon)                         │
│                  color: text.disabled                   │
│                  opacity: 0.5                           │
│                                                         │
│                    Queue is Empty                       │
│                    (h6, text.secondary)                 │
│                                                         │
│         Search for books by ISBN and add them           │
│         to the queue to import multiple books           │
│         at once.                                        │
│         (body2, text.secondary, max-width: 300px)       │
│                                                         │
└─────────────────────────────────────────────────────────┘

In card context:
- Within existing card margin
- Vertical padding: 32px (py: 4)
- Center alignment
- Informative but not urgent
```

---

## State Transitions & Animations

### 1. Loading → Content

```
Skeleton (wave)  →  Fade in content  →  Content visible
    ▓▓▓▓▓▓▓▓          [Image 50%]         [Image 100%]

Timeline:
0ms           →  300ms            →  300ms
Skeleton visible  Cross-fade begins   Content visible

CSS:
.skeleton { opacity: 1; }
.content { opacity: 0; transition: opacity 300ms ease-in-out; }
.content.loaded { opacity: 1; }
```

---

### 2. Button State Transitions

```
Idle  →  Loading  →  Success  →  Idle
 💾       ⟳         ✓           💾
Save     Saving...  Saved!      Save

Timings:
0ms → 0-2000ms → 1000ms → back to idle

Animations:
- Icon change: Instant (no transition)
- Text change: Instant
- Color change: 300ms ease-in-out
- Disable state: Instant
```

---

### 3. Error Appearance

```
Content visible  →  Error detected  →  Error visible
    [Content]         [Transition]      [Error UI]

Timeline:
0ms           →  200ms          →  200ms
Content          Fade out         Error fades in

CSS:
transition: opacity 200ms ease-out

No jarring instant replacement - smooth fade
```

---

## Responsive Breakpoints

### Mobile (xs: 0-600px)

```
Changes:
- Book cover: Hidden (display: none)
- Icon sizes: Reduced 20%
- Button sizes: Small
- Text sizes: One step smaller
- Padding: Reduced 50%
- Stack direction: Column
```

### Tablet (sm: 600-900px)

```
Changes:
- Book cover: Visible
- Icon sizes: Standard
- Button sizes: Medium
- All features visible
```

### Desktop (md: 900px+)

```
Changes:
- Full feature set
- Larger touch targets not needed
- More horizontal space
- Side-by-side layouts
```

---

## Spacing Reference

```
Consistent spacing scale (8px base):

Component spacing:
- Icon to text:     16px (spacing: 2)
- Text to button:   32px (spacing: 4)
- Section spacing:  24px (spacing: 3)
- Card padding:     16px (sm) / 24px (md)

Layout spacing:
- Container margin: 16px (xs) / 24px (sm)
- Between cards:    16px (spacing: 2)
- Page margins:     16px (xs) / 24px (sm) / 32px (md)
```

---

## Icon Reference

### Loading Icons
- **CircularProgress**: Material-UI built-in spinner
- **LinearProgress**: Material-UI built-in bar

### Error Icons
- **WifiOff**: Network errors (📡)
- **ErrorOutline**: General errors (⚠️)
- **Error**: Critical errors (⛔)
- **Lock**: Permission errors (🔒)

### Empty State Icons
- **MenuBook**: Empty library (📚)
- **SearchOff**: No search results (🔍⃠)
- **Queue**: Empty queue (📋)
- **ImageNotSupported**: Missing image (🖼️)

### Action Icons
- **Save**: Save action (💾)
- **Check**: Success state (✓)
- **Close**: Close/clear (×)
- **Add**: Add action (➕)
- **Refresh**: Retry/reload (⟳)

---

## Typography Specifications

```
Page Headers (h6):
- Font size:   20px (1.25rem)
- Font weight: 600
- Line height: 1.6
- Letter spacing: 0.0075em

Body Text (body2):
- Font size:   14px (0.875rem)
- Font weight: 400
- Line height: 1.43
- Letter spacing: 0.01071em

Captions (caption):
- Font size:   12px (0.75rem)
- Font weight: 400
- Line height: 1.66
- Letter spacing: 0.03333em

All use Space Mono font:
font-family: var(--font-space-mono)
```

---

## Z-Index Layers

```
Layer hierarchy (lowest to highest):

0:   Base content (cards, text)
1:   Elevated cards (hover states)
8:   Dropdown menus (Paper elevation={8})
1300: Modals, drawers
1400: Tooltips
1500: App bar, navigation
1600: Snackbars

Use Material-UI elevation prop instead of manual z-index
```

---

## Shadow/Elevation Reference

```
Material-UI elevation levels:

0:  No shadow (flat)
1:  Subtle shadow (resting cards)
2:  Slightly elevated
4:  Raised elements
8:  Dropdown menus (search suggestions)
16: Modals, dialogs
24: Maximum elevation (drawers)

Applied via elevation prop:
<Paper elevation={8}>...</Paper>
```

---

## Animation Specifications

### Skeleton Wave Animation

```css
@keyframes wave {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
}

Duration: 1.5s
Timing: linear
Iteration: infinite
```

### Circular Progress Rotation

```css
@keyframes circular-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

Duration: 1.4s
Timing: linear
Iteration: infinite
```

### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

Duration: 300ms
Timing: ease-in-out
Iteration: 1
```

---

## Implementation Priority Matrix

```
High Impact, Low Effort:
✓ BookListSkeleton      [30 min] ████████ 100% visible
✓ NetworkError          [20 min] ████████  90% coverage
✓ EmptyLibrary          [20 min] ████████  95% new users

High Impact, Medium Effort:
✓ BookCoverImage        [30 min] ██████    75% of images
✓ APIError              [30 min] ██████    60% import errors
✓ Button loading        [20 min] ████      40% interactions

Medium Impact, Low Effort:
○ EmptySearch           [15 min] ████      Search users
○ SearchLoading         [10 min] ████      Already implemented
○ EmptyQueue            [15 min] ███       Import feature

Low Priority:
○ Error boundary        [30 min] ██        Rare crashes
○ PermissionError       [20 min] █         Auth errors
```

---

## Visual Design Principles Applied

1. **Hierarchy**: Icon → Heading → Description → Action
2. **Consistency**: Same spacing, colors, patterns throughout
3. **Feedback**: Always show what's happening
4. **Clarity**: Simple language, clear next steps
5. **Accessibility**: Color + icon + text (never color alone)
6. **Performance**: Skeleton screens feel faster than spinners
7. **Brand**: Dark theme, Space Mono, minimalist
8. **Polish**: Smooth transitions, no jarring changes

---

## Testing Visual States

### Chrome DevTools

```bash
# Throttle network to see loading states
DevTools > Network > Throttling > Slow 3G

# Disable cache to test fresh loads
DevTools > Network > Disable cache

# Mobile viewport testing
DevTools > Toggle device toolbar (Cmd+Shift+M)

# Color contrast checking
DevTools > CSS Overview > Color contrast
```

### Accessibility Testing

```bash
# Screen reader testing
- macOS: VoiceOver (Cmd+F5)
- Windows: NVDA (free)
- Browser: ChromeVox extension

# Keyboard navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals

# Color contrast
- Use WebAIM Contrast Checker
- Target: 4.5:1 for text, 3:1 for UI
```

---

## Quick Reference: When to Use Each State

```
Loading States:
├─ BookListSkeleton      → Initial page load, pagination
├─ CircularProgress      → Search, short operations (< 3s)
├─ LinearProgress        → Long operations (> 3s), uploads
└─ BookCoverImage        → Every image load

Error States:
├─ NetworkError          → Connection issues, 502/503/504
├─ APIError              → External API failures (ISBNdb)
├─ ValidationError       → Form field errors
├─ PermissionError       → 401/403 auth errors
└─ GenericError          → Unexpected errors, fallback

Empty States:
├─ EmptyLibrary          → No books in library
├─ EmptySearch           → Search returns nothing
├─ EmptyFiltered         → Filters return nothing
└─ EmptyQueue            → Import queue empty
```

---

**Visual guide complete! Use these specifications to ensure consistent, beautiful feedback states throughout Penumbra.**
