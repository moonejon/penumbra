/*
  Warnings:

  - You are about to drop the column `date_published` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `image_original` on the `Book` table. All the data in the column will be lost.
  - Added the required column `datePublished` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageOriginal` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "date_published",
DROP COLUMN "image_original",
ADD COLUMN     "datePublished" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "imageOriginal" TEXT NOT NULL;
