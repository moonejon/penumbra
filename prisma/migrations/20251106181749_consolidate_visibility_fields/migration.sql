-- CreateEnum
CREATE TYPE "BookVisibility" AS ENUM ('PRIVATE', 'PUBLIC', 'FRIENDS', 'UNLISTED');

-- AlterTable: Add temporary column with enum type
ALTER TABLE "Book" ADD COLUMN "visibility_new" "BookVisibility" NOT NULL DEFAULT 'PUBLIC';

-- Data migration: Convert isPublic boolean to visibility enum
UPDATE "Book" SET "visibility_new" = CASE
  WHEN "isPublic" = true THEN 'PUBLIC'::"BookVisibility"
  WHEN "isPublic" = false THEN 'PRIVATE'::"BookVisibility"
END;

-- Drop old columns
ALTER TABLE "Book" DROP COLUMN "isPublic";
ALTER TABLE "Book" DROP COLUMN "visibility";

-- Rename new column to visibility
ALTER TABLE "Book" RENAME COLUMN "visibility_new" TO "visibility";
