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
