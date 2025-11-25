-- AlterTable
ALTER TABLE "Book" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ReadingList" ADD COLUMN     "coverImage" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;
