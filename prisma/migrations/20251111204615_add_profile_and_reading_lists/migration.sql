/*
  Warnings:

  - Added the required column `updatedAt` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReadingListVisibility" AS ENUM ('PRIVATE', 'PUBLIC', 'FRIENDS', 'UNLISTED');

-- CreateEnum
CREATE TYPE "ReadingListType" AS ENUM ('STANDARD', 'FAVORITES_YEAR', 'FAVORITES_ALL');

-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_ownerId_fkey";

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "readDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ReadingList" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "ReadingListVisibility" NOT NULL DEFAULT 'PRIVATE',
    "type" "ReadingListType" NOT NULL DEFAULT 'STANDARD',
    "year" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookInReadingList" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "readingListId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookInReadingList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadingList_ownerId_idx" ON "ReadingList"("ownerId");

-- CreateIndex
CREATE INDEX "ReadingList_visibility_idx" ON "ReadingList"("visibility");

-- CreateIndex
CREATE INDEX "ReadingList_type_idx" ON "ReadingList"("type");

-- CreateIndex
CREATE INDEX "ReadingList_type_year_idx" ON "ReadingList"("type", "year");

-- CreateIndex
CREATE INDEX "BookInReadingList_readingListId_position_idx" ON "BookInReadingList"("readingListId", "position");

-- CreateIndex
CREATE INDEX "BookInReadingList_bookId_idx" ON "BookInReadingList"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BookInReadingList_bookId_readingListId_key" ON "BookInReadingList"("bookId", "readingListId");

-- CreateIndex
CREATE INDEX "Book_ownerId_idx" ON "Book"("ownerId");

-- CreateIndex
CREATE INDEX "Book_visibility_idx" ON "Book"("visibility");

-- CreateIndex
CREATE INDEX "Book_title_idx" ON "Book"("title");

-- CreateIndex
CREATE INDEX "Book_readDate_idx" ON "Book"("readDate");

-- CreateIndex
CREATE INDEX "Book_ownerId_readDate_idx" ON "Book"("ownerId", "readDate");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingList" ADD CONSTRAINT "ReadingList_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookInReadingList" ADD CONSTRAINT "BookInReadingList_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookInReadingList" ADD CONSTRAINT "BookInReadingList_readingListId_fkey" FOREIGN KEY ("readingListId") REFERENCES "ReadingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
