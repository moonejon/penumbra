"use server";

import { auth } from "@clerk/nextjs/server";
import prisma  from "@/lib/prisma";
import { BookType } from "@/shared.types";

export async function importBooks( importQueue: BookType[]) {
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
    data: importQueue.map(book => ({
        ...book,
        ownerId: user.id
    }))
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
      ownerId: user.id
    }
  })
}
