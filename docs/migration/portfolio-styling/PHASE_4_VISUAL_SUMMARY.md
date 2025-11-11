# Phase 4: MUI Cleanup - Visual Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                   PHASE 4: MUI DEPENDENCY REMOVAL               │
│                         Status: READY                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  FILES TO MIGRATE    │
└──────────────────────┘

    5 Source Files with MUI
    ├── 📄 src/app/page.tsx (Home)
    │   └── Container, Grid → Tailwind
    │
    ├── 📄 src/app/library/components/filters.tsx
    │   └── Container, Stack → Tailwind flex
    │
    ├── 📄 src/app/library/components/textSearch.tsx
    │   └── TextField → Custom Input
    │
    ├── 📄 src/app/dashboard/page.tsx
    │   └── Container, Typography → Tailwind
    │
    └── 📄 src/app/dashboard/components/grid.tsx
        └── DataGrid → TanStack/AG Grid/Custom/Defer ⚠️

┌──────────────────────┐
│  PACKAGE CLEANUP     │
└──────────────────────┘

    7 Packages to Remove (~4-5 MB)
    ├── @mui/material (7.1.2)
    ├── @mui/icons-material (7.1.2)
    ├── @mui/material-nextjs (7.1.0)
    ├── @mui/x-data-grid (8.9.1) *
    ├── @emotion/cache (11.14.0)
    ├── @emotion/server (11.11.0)
    └── @emotion/styled (11.14.0)
    
    * Keep if DataGrid deferred

┌──────────────────────┐
│  MIGRATION PHASES    │
└──────────────────────┘

    Phase 4.1: Home Page
    ├── Complexity: ⚪ Very Low
    ├── Time: 15 minutes
    └── Risk: Very Low

    Phase 4.2: Library Filters
    ├── Complexity: ⚪ Low
    ├── Time: 75 minutes
    └── Risk: Low-Medium

    Phase 4.3: Dashboard Header
    ├── Complexity: ⚪ Very Low
    ├── Time: 20 minutes
    └── Risk: Low

    Phase 4.4: Dashboard DataGrid
    ├── Complexity: 🔴 High
    ├── Time: 0-24 hours (depends on option)
    ├── Risk: High
    └── Options:
        ├── A) TanStack Table (8-12h) ⭐ Recommended
        ├── B) AG Grid (4-6h)
        ├── C) Custom (16-24h)
        └── D) Defer (0h) 🎯 If low priority

    Phase 4.5: Package Cleanup
    ├── Complexity: ⚪ Low
    ├── Time: 30 minutes
    └── Risk: Low (if migrations complete)

┌──────────────────────┐
│  TIME ESTIMATES      │
└──────────────────────┘

    Without DataGrid:     2-3 hours
    With TanStack Table:  10-15 hours
    With AG Grid:         6-9 hours
    With Custom:          18-27 hours
    With Defer:           2-3 hours ⚡

┌──────────────────────┐
│  TESTING COVERAGE    │
└──────────────────────┘

    Critical Tests:
    ├── ✓ Home page loads
    ├── ✓ Library search (title, authors, subjects)
    ├── ✓ Library filters
    ├── ✓ Dashboard page
    └── ✓ Dashboard grid/table

    Accessibility:
    ├── ✓ Input labels
    ├── ✓ Keyboard navigation
    ├── ✓ Focus indicators
    └── ✓ WCAG 2.1 AA compliance

    Performance:
    ├── ✓ Bundle size reduced (4-5 MB)
    ├── ✓ No console errors
    └── ✓ Fast page loads

┌──────────────────────┐
│  RISK ASSESSMENT     │
└──────────────────────┘

    🔴 HIGH RISK
    └── Dashboard DataGrid replacement
        Mitigation: Use feature branch, defer if needed

    🟡 MEDIUM RISK
    ├── Library search functionality
    └── Responsive layouts
        Mitigation: Thorough testing at all breakpoints

    🟢 LOW RISK
    ├── Home page changes
    └── Container/Stack replacements
        Mitigation: Visual comparison

┌──────────────────────┐
│  COMPONENT MAPPING   │
└──────────────────────┘

    MUI Component       →  Tailwind Replacement
    ─────────────────────────────────────────────────
    Container           →  <div className="container mx-auto px-4">
    Stack               →  <div className="flex flex-col gap-4">
    Grid                →  <div className="grid grid-cols-12 gap-2">
    Typography (h3)     →  <h1 className="text-3xl font-bold">
    TextField           →  Custom Input component
    DataGrid            →  TanStack Table / AG Grid / Custom

┌──────────────────────┐
│  SUCCESS CRITERIA    │
└──────────────────────┘

    Code:
    ✓ All MUI imports removed (or documented exception)
    ✓ All components use Tailwind
    ✓ Packages removed from package.json

    Functionality:
    ✓ All pages load without errors
    ✓ All features work correctly
    ✓ No regressions

    Quality:
    ✓ Visual consistency maintained
    ✓ Accessibility (WCAG 2.1 AA)
    ✓ Responsive design works
    ✓ No console errors

┌──────────────────────┐
│  DOCUMENTS CREATED   │
└──────────────────────┘

    📘 PHASE_4_MUI_CLEANUP_AUDIT.md (504 lines)
       → Comprehensive audit and detailed migration plan

    📄 PHASE_4_QUICK_SUMMARY.md
       → Quick reference for developers

    📋 PHASE_4_IMPLEMENTATION_CHECKLIST.md
       → Working document to track progress

    📊 PHASE_4_VISUAL_SUMMARY.md (this file)
       → Visual overview of the migration

┌──────────────────────┐
│  NEXT STEPS          │
└──────────────────────┘

    1. Review audit document
    2. Decide on DataGrid strategy (A/B/C/D)
    3. Create feature branch
    4. Execute phases 4.1-4.3 (easy wins)
    5. Handle DataGrid (phase 4.4)
    6. Remove packages (phase 4.5)
    7. Test thoroughly
    8. Merge to main

┌──────────────────────┐
│  RECOMMENDATION      │
└──────────────────────┘

    🎯 START WITH PHASES 4.1-4.3
       → Low risk, quick wins
       → Removes most MUI code
       → ~2 hours total time

    🤔 DECIDE ON DASHBOARD
       → Assess Dashboard usage/importance
       → If rarely used: DEFER (Option D)
       → If important: TanStack Table (Option A)

    ⚡ COMPLETE IN ONE SESSION
       → All phases except DataGrid can be done in 2-3 hours
       → DataGrid can be deferred to future phase
       → Immediate bundle size reduction

┌──────────────────────┐
│  KEY FILES           │
└──────────────────────┘

    Source Files (5):
    /Users/jonathan/github/penumbra/src/app/page.tsx
    /Users/jonathan/github/penumbra/src/app/library/components/filters.tsx
    /Users/jonathan/github/penumbra/src/app/library/components/textSearch.tsx
    /Users/jonathan/github/penumbra/src/app/dashboard/page.tsx
    /Users/jonathan/github/penumbra/src/app/dashboard/components/grid.tsx

    Reusable Components:
    /Users/jonathan/github/penumbra/src/components/ui/input.tsx
    /Users/jonathan/github/penumbra/src/components/ui/button.tsx
    /Users/jonathan/github/penumbra/src/components/ui/alert.tsx
    /Users/jonathan/github/penumbra/src/components/ui/pagination.tsx

────────────────────────────────────────────────────────────────────

Phase 4 Audit Complete - Ready for Frontend Developer Implementation

────────────────────────────────────────────────────────────────────
