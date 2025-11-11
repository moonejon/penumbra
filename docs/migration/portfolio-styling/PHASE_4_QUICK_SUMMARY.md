# Phase 4: MUI Cleanup - Quick Reference

**Status:** Ready for Implementation
**Created:** November 11, 2025

## Files With MUI Dependencies

### Active Source Files (5 total)

1. **`src/app/page.tsx`** - Home page
   - Imports: `Container`, `Grid`
   - Priority: LOW
   - Effort: 15 minutes

2. **`src/app/library/components/filters.tsx`**
   - Imports: `Container`, `Stack`
   - Priority: MEDIUM
   - Effort: 30 minutes

3. **`src/app/library/components/textSearch.tsx`**
   - Imports: `TextField`
   - Priority: MEDIUM
   - Effort: 45 minutes

4. **`src/app/dashboard/page.tsx`**
   - Imports: `Container`, `Typography`
   - Priority: MEDIUM
   - Effort: 20 minutes

5. **`src/app/dashboard/components/grid.tsx`**
   - Imports: `DataGrid` from `@mui/x-data-grid`
   - Priority: HIGH (or DEFER)
   - Effort: 8-12 hours (TanStack Table) or DEFER

## Package Dependencies to Remove

\`\`\`json
"@mui/material": "^7.1.0"
"@mui/icons-material": "^7.1.2"
"@mui/material-nextjs": "^7.1.0"
"@mui/x-data-grid": "^8.9.1"  // Only if DataGrid migrated
"@emotion/cache": "^11.14.0"
"@emotion/server": "^11.11.0"
"@emotion/styled": "^11.14.0"
\`\`\`

**Estimated Bundle Size Reduction:** 4-5 MB

## Migration Phases

### Phase 4.1: Home Page (15 min)
- Replace `Container` and `Grid` with Tailwind
- Test home page

### Phase 4.2: Library Filters (75 min)
- Replace `Container`, `Stack` in filters.tsx
- Replace `TextField` in textSearch.tsx
- Test library search functionality

### Phase 4.3: Dashboard Header (20 min)
- Replace `Container`, `Typography` in dashboard page
- Test dashboard layout

### Phase 4.4: Dashboard DataGrid (DECISION REQUIRED)
**Options:**
- **A. TanStack Table** - 8-12 hours, fully customizable
- **B. AG Grid** - 4-6 hours, feature-rich
- **C. Custom** - 16-24 hours, complete control
- **D. Defer** - 0 hours, keep MUI for Dashboard only

**Recommendation:** Option D (Defer) unless Dashboard is critical

### Phase 4.5: Package Cleanup
- Remove MUI packages
- Run build and tests
- Verify all pages work

## Total Estimated Time

- **Without DataGrid migration:** 2-3 hours
- **With TanStack Table:** 10-15 hours
- **With AG Grid:** 6-9 hours
- **With custom solution:** 18-27 hours

## Quick Command Reference

\`\`\`bash
# Create feature branch
git checkout -b phase-4-mui-cleanup

# After migrations complete, remove packages
npm uninstall @mui/material @mui/icons-material @mui/material-nextjs @emotion/cache @emotion/server @emotion/styled

# If keeping DataGrid, only remove:
npm uninstall @mui/material @mui/icons-material @mui/material-nextjs @emotion/cache @emotion/server @emotion/styled

# Test build
npm run build

# Start dev server
npm run dev
\`\`\`

## Testing Checklist

### Critical Tests
- [ ] Home page loads
- [ ] Library search works (title, authors, subjects)
- [ ] Library filters display correctly
- [ ] Dashboard page loads
- [ ] Dashboard grid/table displays books

### Accessibility
- [ ] All inputs have labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA

### Performance
- [ ] Bundle size reduced
- [ ] No console errors
- [ ] Pages load quickly

## Related Documents

- **Full Audit:** `PHASE_4_MUI_CLEANUP_AUDIT.md` (504 lines, comprehensive)
- **Visual Design Plan:** `VISUAL_DESIGN_PLAN.md`
- **Migration README:** `README.md`

## Next Steps

1. Review this summary and full audit document
2. Decide on DataGrid strategy (A, B, C, or D)
3. Create feature branch `phase-4-mui-cleanup`
4. Execute phases 4.1-4.3 (easy wins)
5. Handle DataGrid (4.4) based on decision
6. Remove packages (4.5)
7. Test thoroughly
8. Merge to main

---

**Contact:** Frontend Developer agent for implementation
**Questions:** Refer to full audit document for details
