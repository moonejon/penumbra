# Portfolio Styling Migration

Comprehensive plan to transition Penumbra from Material-UI to Tailwind CSS + Motion Primitives, matching the styling of jonathanmooney.me.

## Overview

This migration transforms Penumbra into a public-first book library that seamlessly integrates with the portfolio site, featuring minimal design, spring-based animations, and hidden admin features.

## Documentation Files

- **[VISUAL_DESIGN_PLAN.md](./VISUAL_DESIGN_PLAN.md)** - UX Designer's comprehensive specifications
  - Component-by-component visual specifications
  - Color palette, typography, spacing guidelines
  - Animation strategies with Motion Primitives
  - Accessibility requirements (WCAG 2.1 AA)
  - 5-phase implementation roadmap

## Migration Goals

### Visual Design
- **Remove:** Material-UI components and theme
- **Add:** Tailwind CSS v4 with zinc-based palette
- **Replace:** Space Mono font → Geist Sans + Geist Mono
- **Integrate:** Motion Primitives for spring-based animations
- **Match:** Portfolio aesthetic (minimal, modern, motion-first)

### UX Changes
- **Public-First:** Library browseable by anyone, editable only by owner
- **Minimal Navigation:** Replace MUI AppBar with simple header
- **Hidden Admin:** Import page behind Settings dropdown (Dashboard out of scope)
- **Simplified Auth:** Less prominent Sign In/Sign Up buttons
- **Future-Ready:** Layout designed for "cover view" grid option

### Technical Stack
**Current:**
- Next.js 15, React 19, TypeScript
- Material-UI v7, Emotion
- Space Mono font
- MUI components throughout

**Target:**
- Next.js 15, React 19, TypeScript (unchanged)
- Tailwind CSS v4 with @tailwindcss/postcss
- Motion Primitives (motion v11.15.0)
- next-themes for dark/light mode
- Geist fonts
- Custom Tailwind components

## Implementation Plan

### Phase 1: Foundation (1-2 days, 3 PRs)
- Add Tailwind configuration and dependencies
- Create utility libraries (cn helper, hooks)
- Update root layout (remove MUI, add next-themes)

### Phase 2: Core UI (3-4 days, 6 PRs)
- Rewrite navbar with admin menu
- Migrate library components (list, item, details)
- Refactor search components
- Update empty states

### Phase 3: Import Flow (2-3 days, 4 PRs)
- Migrate import page layout
- Refactor search, preview, queue components
- Preserve all business logic

### Phase 4: Cleanup (1 day, 1 PR)
- Remove all MUI dependencies
- Final verification build
- Clean up unused imports

### Phase 5: Animations & Polish (2-3 days, 4 PRs)
- Create animation component library
- Add Motion Primitives to library views
- Add animations to import flow
- Final polish, accessibility, performance audit

**Total:** 18 PRs, 8-12 days estimated

**Note:** Dashboard migration is out of scope for this phase. The dashboard will remain with MUI components until future work.

## Key Design Decisions

### Color Palette
- **Background:** zinc-950 (dark), zinc-50 (light)
- **Foreground:** zinc-100 (dark), zinc-900 (light)
- **Borders:** zinc-800 (dark), zinc-200 (light)
- **Accents:** zinc-700/zinc-300
- **Minimal palette:** Full zinc scale (50-950)

### Typography
- **Sans:** Geist Sans (clean, modern, readable)
- **Mono:** Geist Mono (code, technical content)
- **Weights:** Regular (400), Medium (500)
- **Scale:** Base 16px, responsive sizing

### Layout
- **Max Width:** 640px (max-w-screen-sm) - matches portfolio
- **Padding:** Consistent px-4 (1rem) on sides
- **Spacing:** gap-4, space-y-6, etc.
- **Responsive:** Mobile-first approach

### Animations
- **Philosophy:** Spring physics, subtle motion
- **Components:** FadeIn, Stagger, Magnetic, Modal animations
- **Performance:** Respect prefers-reduced-motion
- **Timing:** 200-400ms transitions, 0.1s stagger delays

## Branch & Workflow

**Branch:** `feature/portfolio-styling-migration`

**Workflow:**
1. Complete each phase sequentially
2. Each PR is small, testable, revertible
3. Checkpoint testing after each phase
4. Keep MUI deps until Phase 4 (rollback safety)

## Risk Mitigation

### High-Risk Changes
- **Phase 1, PR #3:** Root layout changes (temporarily breaks UI)
- **Intelligent Search:** Complex keyboard navigation must be preserved

### Mitigation Strategies
- Complete Phase 2 within 1-2 days of Phase 1 PR #3
- Extensive testing for keyboard navigation
- Each PR independently revertible
- No database changes (UI-only migration)
- Dashboard will keep MUI dependencies (out of scope)

## Success Criteria

- [ ] MUI dependencies removed from library and import flows
- [ ] Tailwind CSS v4 fully integrated
- [ ] Motion Primitives animations working
- [ ] All library and import functionality preserved
- [ ] Public-first UX with hidden admin features
- [ ] Accessibility maintained (WCAG 2.1 AA)
- [ ] Performance equal or better (Lighthouse scores)
- [ ] Visual consistency with portfolio (library pages)
- [ ] No TypeScript errors
- [ ] All tests passing

**Note:** Dashboard page will retain MUI components temporarily.

## Related Documentation

- [Main Documentation](../../README.md)
- [Testing Strategy](../../testing/NON_UI_TESTING_PLAN.md)
- [Development Progress](../../../CLAUDE_PROGRESS.md)
