import { fetchBooksPaginated } from "@/utils/actions/books";
import Library from "./components/library";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    title?: string;
    authors?: string;
    subjects?: string;
  }>;
}) {
  const params = await searchParams;

  const { title, authors, subjects } = params;
  const page = Number(params.page) || 1;

  const result = await fetchBooksPaginated({
    page: page,
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
    />
  );
}
