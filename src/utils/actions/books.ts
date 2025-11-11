"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { BookImportDataType } from "@/shared.types";
import { getCurrentUser, getViewableBookFilter } from "@/utils/permissions";

export async function importBooks(importQueue: BookImportDataType[]) {
  const user = await getCurrentUser();

  try {
    const result = await prisma.book.createMany({
      data: importQueue.map((book) => ({
        ...book,
        ownerId: user.id,
      })),
    });
    return {
      success: true,
      count: result.count,
      message: `Successfully imported ${result.count} books`,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        count: 0,
      };
    }
  }
}

export async function checkRecordExists(isbn13: string): Promise<boolean> {
  const user = await getCurrentUser();

  return (
    (await prisma.book.count({
      where: {
        isbn13: isbn13,
        ownerId: user.id,
      },
    })) > 0
  );
}

export async function fetchBooks() {
  const user = await getCurrentUser();

  return await prisma.book.findMany({
    where: {
      ownerId: user.id,
    },
  });
}

export async function fetchBooksPaginated({
  pageSize = 10,
  page = 1,
  title,
  authors,
  subjects,
}: {
  pageSize?: number;
  page?: number;
  title?: string;
  authors?: string;
  subjects?: string;
}) {
  // Get viewable book filter (handles auth automatically)
  const visibilityFilter = await getViewableBookFilter();

  const filters = {
    ...visibilityFilter,
    ...(title && {
      title: {
        contains: title,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(authors && {
      authors: {
        hasSome: authors.split(","),
      },
    }),
    ...(subjects && {
      subjects: {
        hasSome: subjects.split(","),
      },
    }),
  };


  const [results, totalCount] = await prisma.$transaction([
    prisma.book.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
      where: filters,
      orderBy: {
        id: "asc",
      },
    }),
    prisma.book.count({
      where: filters,
    }),
  ]);

  return {
    books: results,
    pageCount: Math.ceil(totalCount / pageSize),
    totalCount: totalCount,
  };
}

/**
 * Update an existing book
 */
export async function updateBook(
  bookId: number,
  updates: Partial<BookImportDataType>
) {
  const user = await getCurrentUser();

  try {
    // Verify ownership
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { ownerId: true },
    });

    if (!book || book.ownerId !== user.id) {
      return {
        success: false,
        error: "Unauthorized - you don't own this book",
      };
    }

    // Update the book
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: updates,
    });

    return {
      success: true,
      book: updatedBook,
    };
  } catch (error) {
    console.error("Update book error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

/**
 * Re-fetch book metadata from ISBNDB
 */
export async function refetchBookMetadata(bookId: number) {
  const user = await getCurrentUser();

  try {
    // Verify ownership
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book || book.ownerId !== user.id) {
      return {
        success: false,
        error: "Unauthorized - you don't own this book",
      };
    }

    if (!book.isbn13) {
      return {
        success: false,
        error: "Book missing ISBN13",
      };
    }

    // Fetch from ISBNDB
    const response = await fetch(
      `https://api2.isbndb.com/book/${book.isbn13}`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_ISBN_DB_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to fetch book data from ISBNDB",
      };
    }

    const data = await response.json();
    const freshData = data.book;

    if (!freshData) {
      return {
        success: false,
        error: "No book data returned from ISBNDB",
      };
    }

    // Update book with fresh data (preserve custom image if exists)
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        title: freshData.title || book.title,
        titleLong: freshData.title_long || freshData.title || book.titleLong,
        authors: freshData.authors || book.authors,
        publisher: freshData.publisher || book.publisher,
        synopsis: freshData.synopsis || book.synopsis,
        image: freshData.image || book.image,
        imageOriginal: freshData.image || book.imageOriginal,
        pageCount: freshData.pages || book.pageCount,
        datePublished: freshData.date_published || book.datePublished,
        subjects: freshData.subjects || book.subjects,
        binding: freshData.binding || book.binding,
        language: freshData.language || book.language,
        edition: freshData.edition || book.edition,
      },
    });

    return {
      success: true,
      book: updatedBook,
    };
  } catch (error) {
    console.error("Re-fetch metadata error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Re-fetch failed",
    };
  }
}
