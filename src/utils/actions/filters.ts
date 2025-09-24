"use server";

// import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function fetchFilters() {
  // const { userId } = await auth();

  // if (!userId) {
  //   throw new Error("User not authenticated");
  // }

  // const user = await prisma.user.findUnique({
  //   where: { clerkId: userId },
  // });

  // if (!user) {
  //   throw new Error("User not found in database");
  // }

  return await prisma.book.findMany({
    select: {
      authors: true,
      subjects: true,
    },
  });
}
