import { fetchBooksPaginated } from "@/utils/actions/books";
import Library from "./components/library";
import { fetchFilters } from "@/utils/actions/filters";
import _ from "lodash";

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

  const filterData = await fetchFilters();

  const sortedAuthors = _.uniq(filterData.flatMap((el) => el.authors).sort());
  const sortedSubjects = _.uniq(filterData.flatMap((el) => el.subjects).sort());

  const { books, pageCount } = result;

  return (
    <Library
      books={books}
      authors={sortedAuthors}
      subjects={sortedSubjects}
      page={page}
      pageCount={pageCount}
    />
  );
}
