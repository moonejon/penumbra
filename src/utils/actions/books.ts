"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { BookImportDataType } from "@/shared.types";

export async function importBooks(importQueue: BookImportDataType[]) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

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
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

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
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

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
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  const filters = {
    ownerId: user.id,
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

  console.log(filters);

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
