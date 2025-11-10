type BookType = {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  imageOriginal: string;
  publisher: string;
  synopsis: string;
  pageCount: number;
  datePublished: string;
  authors: Array<string>;
  subjects: Array<string>;
  isbn10: string;
  isbn13: string;
  binding: string;
  language: string;
  titleLong: string;
  edition: string | null;
};

type BookImportDataType = {
  title: string;
  subtitle?: string;
  image: string;
  imageOriginal: string;
  publisher: string;
  synopsis: string;
  pageCount: number;
  datePublished: string;
  authors: Array<string>;
  subjects: Array<string>;
  isbn10: string;
  isbn13: string;
  binding: string;
  language: string;
  titleLong: string;
  edition: string;
  isIncomplete?: boolean;
  isDuplicate?: boolean;
};

type SearchSuggestion = {
  authors: string[];
  titles: { id: number; title: string }[];
  subjects: string[];
};

export type { BookType, BookImportDataType, SearchSuggestion };
