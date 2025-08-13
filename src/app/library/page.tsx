import { fetchBooksPaginated } from "@/utils/actions/books";
import Library from "./components/library";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string}>;
}) {

  const params = await searchParams;

  const page = Number(params.page) || 1;

  const result = await fetchBooksPaginated({ page: page });

  const { books, pageCount } = result;

  return <Library books={books} page={page} pageCount={pageCount} />;
}
