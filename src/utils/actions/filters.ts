"use server";

import prisma from "@/lib/prisma";
import { getViewableBookFilter } from "@/utils/permissions";

export async function fetchFilters() {
  // Get viewable book filter (handles auth automatically)
  // Only returns filters from public books OR user's own books if authenticated
  // This prevents leaking private book metadata
  const visibilityFilter = await getViewableBookFilter();

  return await prisma.book.findMany({
    where: visibilityFilter,
    select: {
      authors: true,
      subjects: true,
    },
  });
}
