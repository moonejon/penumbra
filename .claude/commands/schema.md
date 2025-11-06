---
description: View and modify the Prisma database schema
---

Help me work with the Prisma database schema for the Penumbra project.

Schema location: `prisma/schema.prisma`

Current models:
- **User:** Clerk-integrated user model with books relationship
- **Book:** Book model with metadata (ISBN, title, authors, subjects, etc.)

Common schema tasks:
1. Add new fields to existing models
2. Create new models
3. Modify relationships
4. Add indexes for performance
5. Update field types or constraints

After schema changes:
1. Generate migration: `npx prisma migrate dev --name <description>`
2. Generate Prisma Client: `npx prisma generate`
3. Update TypeScript types if needed

Ask me what schema changes are needed, or show me the current schema and wait for instructions.
