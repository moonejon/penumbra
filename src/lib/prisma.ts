import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// Only use Accelerate extension if using a Prisma Accelerate URL
const databaseUrl = process.env.DEWEY_DB_DATABASE_URL || '';
const isAccelerateUrl = databaseUrl.startsWith('prisma://') || databaseUrl.startsWith('prisma+postgres://');

const prisma = globalForPrisma.prisma || (
  isAccelerateUrl
    ? new PrismaClient().$extends(withAccelerate())
    : new PrismaClient()
);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;