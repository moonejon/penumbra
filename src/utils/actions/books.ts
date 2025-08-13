"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { BookType } from "@/shared.types";

export async function importBooks(importQueue: BookType[]) {
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

  return await prisma.book.createMany({
    data: importQueue.map((book) => ({
      ...book,
      ownerId: user.id,
    })),
  });
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
}: {
  pageSize?: number;
  page?: number;
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
