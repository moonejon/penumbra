import { fetchBooksPaginated } from "@/utils/actions/books";
import Library from "./components/library";
import { fetchAuthors } from "@/utils/actions/filters";
import _ from "lodash";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string, title?: string, authors?: string }>;
}) {

  const params = await searchParams;

  const { title, authors } = params;
  const page = Number(params.page) || 1;


  const result = await fetchBooksPaginated({ page: page, title: title, authors: authors });

  const allAuthors = await fetchAuthors()

  const sortedAuthors = _.uniq(allAuthors.flatMap( el => el.authors ).sort())

  const { books, pageCount } = result;

  return <Library books={books} authors={sortedAuthors} page={page} pageCount={pageCount} />;
}
