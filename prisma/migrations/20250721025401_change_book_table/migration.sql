/*
  Warnings:

  - You are about to drop the column `genres` on the `Book` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[isbn10]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[isbn13]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "genres",
ADD COLUMN     "subjects" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn10_key" ON "Book"("isbn10");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn13_key" ON "Book"("isbn13");
