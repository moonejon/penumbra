# Penumbra Documentation

This directory contains all technical documentation for the Penumbra project.

## Directory Structure

```
docs/
├── features/               # Feature-specific documentation
│   ├── data-sync/         # Production data sync feature
│   ├── intelligent-search/ # Intelligent search with autocomplete
│   └── loading-error-states/ # Loading and error state improvements
├── migration/             # Migration planning and guides
│   └── portfolio-styling/ # Portfolio styling migration
└── testing/               # Testing strategies and plans
```

## Features Documentation

### Data Sync (`features/data-sync/`)
Documentation for the production to development data synchronization feature:
- **DATA_SYNC_TECHNICAL_DOCUMENTATION.md** - Comprehensive technical guide (29KB)
- **SYNC_IMPLEMENTATION_SUMMARY.md** - Implementation overview
- **BACKEND_REVIEW.md** - Backend implementation analysis
- **FULLSTACK_COORDINATION.md** - Integration guide

Related files: `/scripts/sync-prod-data*.ts`, `/scripts/check-users.ts`

### Intelligent Search (`features/intelligent-search/`)
Documentation for the intelligent search with autocomplete feature:
- **INTELLIGENT_SEARCH_IMPLEMENTATION.md** - Feature implementation details

Related files: `/src/app/library/components/intelligentSearch.tsx`, `/src/app/api/library/search-suggestions/`

### Loading & Error States (`features/loading-error-states/`)
Documentation for loading states, error handling, and UI feedback improvements:
- **LOADING_ERROR_STATES_DESIGN_SPEC.md** - Design specifications
- **LOADING_ERROR_STATES_QUICK_REFERENCE.md** - Quick reference guide
- **LOADING_ERROR_STATES_VISUAL_GUIDE.md** - Visual design guide

Related files: `/src/app/library/components/`, `/src/app/import/components/`

## Migration Documentation

### Portfolio Styling Migration (`migration/portfolio-styling/`)
Planning documents for transitioning Penumbra to match portfolio styling:
- **VISUAL_DESIGN_PLAN.md** - UX designer's comprehensive visual specifications

## Testing Documentation (`testing/`)
Testing strategies and quality assurance plans:
- **NON_UI_TESTING_PLAN.md** - Backend and non-UI testing strategy

## Main Documentation Files (Root)

These files remain in the project root:
- **README.md** - Project overview and setup instructions
- **CLAUDE_PROGRESS.md** - Development progress log and context preservation

## Contributing to Documentation

When adding new documentation:

1. **Feature Documentation** → Place in `docs/features/[feature-name]/`
2. **Migration Guides** → Place in `docs/migration/[migration-name]/`
3. **Testing Plans** → Place in `docs/testing/`
4. **Architecture Decisions** → Consider adding `docs/architecture/`
5. **API Documentation** → Consider adding `docs/api/`

### Documentation Standards

- Use descriptive filenames in UPPERCASE_SNAKE_CASE.md for major docs
- Include table of contents for documents >100 lines
- Link to related source files
- Keep documentation up to date with code changes
- Add visual diagrams where helpful

## Quick Links

- [Main Project README](../README.md)
- [Development Progress](../CLAUDE_PROGRESS.md)
- [Scripts Documentation](../scripts/README.md)
