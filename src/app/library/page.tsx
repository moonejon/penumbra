import { fetchBooksPaginated } from "@/utils/actions/books";
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

  return (
    <Library
      books={books}
      page={page}
      pageCount={pageCount}
      pageSize={pageSize}
    />
  );
}
