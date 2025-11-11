import { fetchBooksPaginated } from "@/utils/actions/books";
import { getCurrentUserId } from "@/utils/permissions";
import prisma from "@/lib/prisma";
import Library from "./components/library";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    title?: string;
    authors?: string;
    subjects?: string;
  }>;
}) {
  const params = await searchParams;

  const { title, authors, subjects } = params;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 25; // Default to 25 for list view

  const result = await fetchBooksPaginated({
    page: page,
    pageSize: pageSize,
    title: title,
    authors: authors,
    subjects: subjects,
  });

  const { books, pageCount } = result;

  // Get current user's database ID for ownership checks
  let currentUserId: number | null = null;
  const clerkUserId = await getCurrentUserId();

  if (clerkUserId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });
    currentUserId = user?.id ?? null;
  }

  return (
    <Library
      books={books}
      page={page}
      pageCount={pageCount}
      pageSize={pageSize}
      currentUserId={currentUserId}
    />
  );
}
