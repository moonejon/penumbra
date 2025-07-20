type BookType = {
  title: string;
  subtitle?: string;
  image_original: string;
  publisher: string;
  synopsis: string;
  pages: number;
  date_published: string;
  authors: Array<string>;
  subjects: Array<string>;
  isbn10: string;
  isbn13: string;
  binding: string;
};

export type { BookType }