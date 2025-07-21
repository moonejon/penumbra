/*
  Warnings:

  - You are about to drop the column `imageOriginal` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publicationDate` on the `Book` table. All the data in the column will be lost.
  - Added the required column `date_published` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_original` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "imageOriginal",
DROP COLUMN "publicationDate",
ADD COLUMN     "date_published" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "image_original" TEXT NOT NULL;
