"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function fetchFilters() {
  // Get current user (optional - filters can be viewed without auth)
  const { userId } = await auth();

  // Only return filters from public books OR user's own books if authenticated
  // This prevents leaking private book metadata
  return await prisma.book.findMany({
    where: userId
      ? {
          OR: [
            { isPublic: true },
            {
              owner: {
                clerkId: userId,
              },
            },
          ],
        }
      : { isPublic: true },
    select: {
      authors: true,
      subjects: true,
    },
  });
}
