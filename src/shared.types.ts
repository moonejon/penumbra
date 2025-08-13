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
  edition: string;
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
};

export type { BookType, BookImportDataType };
