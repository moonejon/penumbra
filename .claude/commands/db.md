---
description: Database operations - migrations, schema updates, and Prisma commands
---

Help me with Prisma database operations. This project uses:
- PostgreSQL database
- Prisma ORM with Prisma Accelerate
- Schema location: `prisma/schema.prisma`

Common tasks:
1. Create and apply migrations: `npx prisma migrate dev --name <migration-name>`
2. Reset database: `npx prisma migrate reset`
3. Generate Prisma Client: `npx prisma generate`
4. View database in Prisma Studio: `npx prisma studio`
5. Push schema without migration: `npx prisma db push`

The database schema includes:
- User model (with Clerk integration)
- Book model (with user relationship)

Ask me which database operation I need, or if no additional context is provided, show me the current schema and ask what I'd like to do.
