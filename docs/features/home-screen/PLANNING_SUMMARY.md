# Home Screen Feature - Planning Summary

## Document Status

**Status:** Planning Complete - Ready for Implementation
**Version:** 1.0
**Date:** 2025-11-11
**Team:** Frontend Development

---

## Overview

This document provides a high-level summary of the home screen feature planning and serves as a navigation guide to the detailed documentation.

### What is the Home Screen?

The home screen (`/`) is Penumbra's landing page, showcasing:
1. **User Profile/Bio** - Owner's profile picture and bio
2. **Favorite Books** - Top 5-6 favorite books with year filtering
3. **Reading Lists** - Curated collections of books with list/cover views
4. **Reading List Detail** - Full view of individual lists with management features (owner only)

---

## Documentation Files

### Core Planning Documents

#### 1. **[COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md)** (46 KB)
**Purpose:** Complete technical specification and architectural design

**When to use:**
- Designing new components
- Understanding component relationships
- Defining TypeScript interfaces
- Planning API endpoints
- Making architectural decisions
- Code review and consistency checks

**Key sections:**
- Component hierarchy and tree structure (visual diagram)
- File structure and organization
- Component specifications with props interfaces
- Type definitions (UserProfile, ReadingList, FavoriteBook, etc.)
- API route specifications with schemas
- State management patterns (Server vs Client Components)
- Authentication/authorization patterns
- Responsive design strategy
- Accessibility requirements (WCAG 2.1 AA)
- Performance considerations

**Best for:** Developers implementing components, tech leads reviewing architecture

---

#### 2. **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** (69 KB)
**Purpose:** Step-by-step implementation guide with detailed tasks

**When to use:**
- Planning sprints and milestones
- Assigning tasks to developers
- Estimating project timeline
- Tracking implementation progress
- Identifying blockers or dependencies
- Making prioritization decisions

**Key sections:**
- 5 phases of development (Foundation → API → Home Screen → Detail → Polish)
- 54 detailed tasks with:
  - Complexity ratings (Low/Medium/High)
  - Time estimates (2-10 hours per task)
  - Clear dependencies
  - Deliverables and testing criteria
  - Step-by-step "what to do" instructions
- Critical path identification
- Risk mitigation strategies
- Success criteria and metrics

**Best for:** Project managers, team leads, developers planning work

---

### Supporting Documents

#### 3. **[README.md](./README.md)** (10 KB)
**Purpose:** Quick reference guide from design phase

**Contents:**
- Design system (colors, typography, spacing)
- Responsive breakpoints
- Component list
- API endpoints needed
- Accessibility checklist
- Implementation phases (simplified)

**Best for:** Quick lookups during implementation

---

#### 4. **[HOME_SCREEN_DESIGN_SPEC.md](./HOME_SCREEN_DESIGN_SPEC.md)** (36 KB)
**Purpose:** Detailed visual design specification

**Contents:**
- Visual layout and styling
- Component mockups
- Interaction patterns
- Design tokens
- Animation specifications

**Best for:** Understanding visual requirements and UX

---

## Quick Start Guide

### For Developers Starting Implementation

**Step 1: Understand the Architecture**
1. Read [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md)
2. Review the component hierarchy diagram
3. Study the type definitions
4. Understand Server vs Client Component strategy

**Step 2: Identify Your Tasks**
1. Open [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
2. Find your assigned phase (1-5)
3. Read task details: complexity, dependencies, deliverables
4. Check dependencies before starting

**Step 3: Set Up Environment**
```bash
# From project root
cd /Users/jonathan/github/penumbra/.conductor/monrovia

# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma migrate dev --name add_reading_lists_favorites

# Run development server
npm run dev
```

**Step 4: Follow Existing Patterns**
- Study `/src/app/library/components/` for component patterns
- Use `/src/components/ui/` shared components
- Maintain TypeScript strict mode
- Follow Tailwind CSS v4 styling conventions

**Step 5: Write Tests**
- Unit tests for all components (React Testing Library)
- Integration tests for flows
- E2E tests for critical paths (Playwright)
- Aim for 85%+ coverage

---

### For Project Managers

**Planning a Sprint:**
1. Review [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
2. Select a complete phase (e.g., Phase 1: Foundation)
3. Create tickets for each task in the phase
4. Assign based on complexity:
   - Low (2-4 hours): Junior/Mid developers
   - Medium (5-6 hours): Mid developers
   - High (8-10 hours): Senior developers
5. Schedule phase review meeting at end

**Tracking Progress:**
- Use task deliverables as acceptance criteria
- Monitor critical path (Database → API → UI → Integration)
- Address blockers immediately (see risk mitigation section)
- Hold daily standups to sync on dependencies

**Estimating Timeline:**
- Phase 1: 1 week (32 hours)
- Phase 2: 1 week (28 hours)
- Phase 3: 1.5 weeks (44 hours)
- Phase 4: 1.5 weeks (64 hours)
- Phase 5: 1 week (56 hours)
- **Total: 4-5 weeks** (1 full-time developer)

---

### For Designers

**Design Handoff Checklist:**
- [ ] All components match specifications in COMPONENT_ARCHITECTURE.md
- [ ] Responsive behaviors documented (mobile/tablet/desktop)
- [ ] All states designed (default, hover, loading, error, empty)
- [ ] Animations specified (Motion Primitives patterns)
- [ ] Accessibility notes included (contrast, focus states)
- [ ] Design tokens align with Tailwind CSS theme

**Review Process:**
1. Review component specifications in architecture doc
2. Verify responsive breakpoints match implementation plan
3. Check accessibility requirements (WCAG 2.1 AA)
4. Provide feedback on technical constraints early

---

## Implementation Phases Summary

### Phase 1: Foundation (Week 1)
**Goal:** Set up infrastructure

**Tasks:** 8 tasks, ~32 hours
- Type definitions (shared.types.ts)
- Database schema (Prisma migration)
- Shared UI components (BookCoverCard, Modal, Dropdown, etc.)

**Deliverables:**
- [ ] Database schema updated and migrated
- [ ] 6 shared UI components created and tested
- [ ] Type definitions exported and documented

**Dependencies:** None - can start immediately

---

### Phase 2: API Layer (Week 1-2)
**Goal:** Build backend routes with auth

**Tasks:** 9 tasks, ~28 hours
- GET /api/favorites (with year filter)
- Reading Lists CRUD (GET, POST, PATCH, DELETE)
- Books in lists (POST add, DELETE remove, PATCH reorder)

**Deliverables:**
- [ ] 9 API routes implemented and tested
- [ ] Authentication and authorization working
- [ ] API documentation with examples

**Dependencies:** Phase 1 (database schema)

---

### Phase 3: Home Screen (Week 2-3)
**Goal:** Build public-facing home screen

**Tasks:** 14 tasks, ~44 hours
- ProfileBio component
- FavoriteBooksSection (with year filter)
- ReadingListsSection (with list/cover views)
- Home page integration (Server Component)

**Deliverables:**
- [ ] Home screen fully functional
- [ ] Owner vs guest experiences working
- [ ] Responsive on mobile and desktop
- [ ] Empty states handled

**Dependencies:** Phase 1 (shared UI), Phase 2 (API routes)

---

### Phase 4: Reading List Detail (Week 3-4)
**Goal:** Detailed view with management

**Tasks:** 14 tasks, ~64 hours
- Reading list detail page
- BookListView (with drag-and-drop)
- BookGridView (with remove buttons)
- EditListModal and AddBooksModal
- Owner-only management features

**Deliverables:**
- [ ] Reading list detail page complete
- [ ] Drag-and-drop reordering working
- [ ] Modals for edit and add books
- [ ] Owner controls fully functional

**Dependencies:** Phase 1-3

---

### Phase 5: Polish & Testing (Week 4-5)
**Goal:** Quality assurance and refinement

**Tasks:** 9 tasks, ~56 hours
- Responsive testing (all breakpoints)
- Accessibility audit (WCAG 2.1 AA)
- Performance optimization (Lighthouse)
- Comprehensive testing (unit, integration, E2E)
- Documentation and Storybook

**Deliverables:**
- [ ] All breakpoints tested and working
- [ ] Zero accessibility violations
- [ ] Lighthouse score > 90
- [ ] 85%+ test coverage
- [ ] Storybook documentation complete

**Dependencies:** Phase 1-4

---

## Critical Path

The following tasks are on the critical path and block other work:

1. **Database Schema** (Task 1.2) → Blocks all API work
2. **Type Definitions** (Task 1.1) → Blocks all component work
3. **API Routes** (Phase 2) → Blocks UI integration
4. **Shared UI Components** (Phase 1) → Blocks feature components
5. **Home Screen** (Phase 3) → Blocks reading list detail
6. **Testing** (Phase 5) → Blocks production deployment

**Recommendation:** Parallelize Phase 1 tasks (database + types + shared UI) to accelerate start.

---

## Key Technical Decisions

### Server Components vs Client Components

**Server Components (data fetching):**
- `/app/page.tsx` (home page)
- `/app/reading-lists/[id]/page.tsx` (detail page)

**Client Components (interactivity):**
- All components in `/app/components/home/`
- All components in `/app/reading-lists/components/`
- All shared UI components

**Rationale:**
- SEO-friendly initial render
- Fast page loads with server data
- Client-side interactivity where needed

---

### State Management

**No global state library needed.**

**Patterns:**
- Server Components fetch and pass initial data as props
- Client Components manage local state (useState)
- Optimistic updates for owner actions
- localStorage for user preferences (view mode, filters)

**API integration:**
- Native fetch in Server Components
- Client-side fetch with error handling
- Consider SWR or TanStack Query for caching (future)

---

### Authentication & Authorization

**Strategy:**
- Clerk for authentication (`auth()` helper)
- Owner detection: `userId === content.ownerId`
- Middleware protects sensitive routes
- API routes check ownership before mutations

**Patterns:**
```typescript
// Server Component
const { userId } = await auth();
const isOwner = userId === profile?.clerkId;

// Client Component
const { userId } = useUser();
<Button visible={isOwner} />
```

---

### Styling Approach

**Tailwind CSS v4:**
- Utility-first classes
- Zinc color palette (dark theme)
- Geist Sans and Mono fonts
- class-variance-authority for variants

**No Material-UI:**
- Ongoing migration away from MUI
- All new components use Tailwind
- Consistent with library components

---

## Risk Assessment

### High Risk

**Drag-and-Drop Implementation (Task 4.4)**
- **Risk:** HTML5 drag-and-drop is complex and buggy
- **Impact:** Owner book reordering feature
- **Mitigation:** Use @dnd-kit library, implement keyboard alternative
- **Fallback:** Simple up/down buttons instead of drag

---

### Medium Risk

**Performance with Many Books (Tasks 3.4, 4.5)**
- **Risk:** Many book covers slow to load
- **Impact:** Home screen and list detail UX
- **Mitigation:** Next.js Image, lazy loading, blur placeholders
- **Fallback:** Pagination or "Load More" button

**State Synchronization (Tasks 4.4, 4.5)**
- **Risk:** Optimistic updates get out of sync
- **Impact:** Owner management features
- **Mitigation:** Proper error handling and rollback
- **Fallback:** Refresh data from server on error

---

### Low Risk

**Testing Time Overrun (Phase 5)**
- **Risk:** Testing reveals major issues late
- **Impact:** Timeline delay
- **Mitigation:** Write tests during development
- **Fallback:** Prioritize critical path testing, defer nice-to-haves

---

## Success Metrics

### Performance Targets
- [ ] Home screen load time < 2 seconds
- [ ] API response times < 500ms
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing (LCP, FID, CLS)

### Quality Targets
- [ ] 85%+ test coverage
- [ ] Zero accessibility violations (axe DevTools)
- [ ] TypeScript strict mode, no `any` types
- [ ] No console errors or warnings

### User Experience Targets
- [ ] Smooth drag-and-drop (60 FPS)
- [ ] Clear owner vs guest experiences
- [ ] Helpful empty and error states
- [ ] Responsive on all devices

---

## Dependencies & Integration

### External Dependencies
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Motion Primitives** (animations)
- **Lucide React** (icons)
- **Clerk** (authentication)
- **Prisma** (database ORM)

### Internal Dependencies
- **Existing library components** (GridItem pattern, Details modal)
- **Existing API patterns** (search suggestions)
- **Existing database** (Book, User models)

### Integration Points
- Home screen links to library
- Book cards reuse library patterns
- Search in AddBooksModal uses library search
- Auth uses existing Clerk setup

---

## Out of Scope (Future Enhancements)

The following features are documented but NOT in scope for initial implementation:

1. **Collaborative Lists** - Share editing with other users
2. **Comments** - Add comments to reading lists
3. **Following** - Follow other users' public lists
4. **Categories/Tags** - Organize lists into categories
5. **FRIENDS/UNLISTED Visibility** - Additional privacy modes
6. **Analytics** - Most popular books in lists
7. **Export** - Download list as PDF/CSV
8. **Reading Progress** - Track progress through list books
9. **List Templates** - Create lists from templates
10. **Recommendations** - AI-suggested books for lists

---

## Questions & Decisions

### Resolved
- ✅ **Tech stack:** Next.js 15, React 19, Tailwind CSS v4
- ✅ **Server vs Client Components:** Hybrid approach
- ✅ **Authentication:** Clerk (existing)
- ✅ **Database:** PostgreSQL with Prisma (existing)

### Open Questions
- ❓ **Profile image source:** Portfolio site, Clerk, or custom upload?
- ❓ **Favorites logic:** How to determine "of 2025" vs "of all time"?
- ❓ **Reading lists in Phase 1:** Include with mock data or defer?
- ❓ **Owner edit features:** When to prioritize?

### Decisions Needed From
- **Product Owner:** Profile image source, favorites logic
- **Tech Lead:** Library choice for drag-and-drop
- **Design Lead:** Final approval on responsive layouts

---

## Communication Plan

### Daily Standups
- Share progress on assigned tasks
- Identify blockers immediately
- Coordinate on shared components

### Phase Reviews
- End of each phase (1-5)
- Demo completed features
- Review architecture decisions
- Plan next phase sprint

### Documentation Updates
- Update progress in IMPLEMENTATION_PLAN.md
- Add lessons learned to this summary
- Keep README.md quick reference current

---

## Getting Help

### Technical Issues
- **Architecture questions:** Review COMPONENT_ARCHITECTURE.md
- **Task details:** Check IMPLEMENTATION_PLAN.md
- **Code patterns:** Study existing library components
- **Blocked by dependency:** Escalate in standup

### Process Issues
- **Timeline concerns:** Contact project manager
- **Scope changes:** Discuss in phase review
- **Resource needs:** Escalate to team lead

### Design Issues
- **Visual inconsistencies:** Reference HOME_SCREEN_DESIGN_SPEC.md
- **UX patterns:** Consult with design lead
- **Accessibility:** Review WCAG requirements in architecture doc

---

## Next Steps

### Immediate (This Week)
1. ✅ Review and approve planning documents
2. ⏳ Set up project management (create tickets)
3. ⏳ Assign Phase 1 tasks to developers
4. ⏳ Schedule kickoff meeting
5. ⏳ Begin Phase 1: Foundation

### Short Term (Weeks 1-2)
1. Complete Phase 1 (Foundation)
2. Complete Phase 2 (API Layer)
3. Begin Phase 3 (Home Screen)

### Medium Term (Weeks 3-4)
1. Complete Phase 3 (Home Screen)
2. Complete Phase 4 (Reading List Detail)
3. Begin Phase 5 (Polish & Testing)

### Long Term (Week 5+)
1. Complete Phase 5 (Polish & Testing)
2. Production deployment
3. Monitor and iterate based on feedback

---

## Document Change Log

### Version 1.0 - 2025-11-11
- Initial planning summary created
- All documentation reviewed and synthesized
- Ready for team review and implementation kickoff

---

## Related Resources

### Documentation
- [Project README](../../../README.md)
- [Design Specs](../../design-specs/)
- [Intelligent Search Feature](../intelligent-search/)
- [Migration Guide](../../migration/)

### External Resources
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Ready to start?** Proceed to [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) and begin Phase 1!

**Questions?** Contact the Frontend Development team lead.
