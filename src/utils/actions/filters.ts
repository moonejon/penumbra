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
            { visibility: "PUBLIC" },
            {
              owner: {
                clerkId: userId,
              },
            },
          ],
        }
      : { visibility: "PUBLIC" },
    select: {
      authors: true,
      subjects: true,
    },
  });
}
