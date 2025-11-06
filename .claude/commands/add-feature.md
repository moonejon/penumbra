---
description: Add a new feature following project patterns and architecture
---

Help me add a new feature to the Penumbra library management application.

Project architecture:
- **Pages:** `/src/app/[feature]/page.tsx` (Next.js app directory)
- **Components:** `/src/app/[feature]/components/` (feature-specific components)
- **Server Actions:** `/src/utils/actions/` (database operations, API calls)
- **Types:** `shared.types.ts` (shared TypeScript types)
- **Database:** Prisma schema in `prisma/schema.prisma`

Tech stack:
- Next.js 15 with App Router (React Server Components)
- TypeScript
- Material-UI v7 for UI components
- Prisma ORM with PostgreSQL
- Clerk for authentication

Patterns to follow:
1. Use Server Components by default, Client Components only when needed ("use client")
2. Server actions for data mutations and API calls
3. Material-UI components for consistent styling
4. Dark theme (defined in `src/theme.ts`)
5. Responsive design (mobile-first with MUI breakpoints)
6. User-specific data isolation (filter by user ID from Clerk)

Ask me about the feature requirements, then plan and implement following these patterns.
