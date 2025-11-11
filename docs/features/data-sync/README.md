# Data Sync Feature

Production to development data synchronization for robust testing.

## Overview

This feature exports book data from the production database and imports it into the development environment with user ID transformation, enabling realistic testing without affecting production data.

## Documentation Files

- **[DATA_SYNC_TECHNICAL_DOCUMENTATION.md](./DATA_SYNC_TECHNICAL_DOCUMENTATION.md)** - Comprehensive technical guide (29KB)
  - Complete implementation details
  - Performance analysis
  - Usage instructions
  - Architecture decisions

- **[SYNC_IMPLEMENTATION_SUMMARY.md](./SYNC_IMPLEMENTATION_SUMMARY.md)** - Quick overview
  - High-level summary
  - Key features
  - Usage examples

- **[BACKEND_REVIEW.md](./BACKEND_REVIEW.md)** - Backend analysis
  - Implementation review
  - Code quality assessment
  - Technical decisions

- **[FULLSTACK_COORDINATION.md](./FULLSTACK_COORDINATION.md)** - Integration guide
  - Full-stack coordination
  - Component integration
  - System architecture

## Implementation

**Scripts:**
- `/scripts/sync-prod-data-enhanced.ts` - Enhanced version (batched, 10-20x faster)
- `/scripts/sync-prod-data.ts` - Original version (ACID-compliant)
- `/scripts/check-users.ts` - User verification utility

**Key Commands:**
```bash
# Dry run (preview changes)
npm run sync-prod-data:dry-run -- --user-id=1

# Sync production data
npm run sync-prod-data -- --user-id=1 --yes
```

## Performance

- **Enhanced Script:** 3-5 seconds for 357 books
- **Original Script:** 35-70 seconds for 357 books
- **Speedup:** 10-20x faster with batched transactions
- **Throughput:** 3,570 books/second

## Pull Request

- **PR #24:** https://github.com/moonejon/penumbra/pull/24
- **Status:** Merged to main
- **Date:** November 10, 2025
