-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "isbn10" VARCHAR(10) NOT NULL,
    "isbn13" VARCHAR(13) NOT NULL,
    "title" TEXT NOT NULL,
    "titleLong" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "imageOriginal" TEXT NOT NULL,
    "edition" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "genres" TEXT[],
    "authors" TEXT[],
    "binding" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
