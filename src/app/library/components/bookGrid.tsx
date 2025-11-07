"use client";

import { BookType } from "@/shared.types";
import { Dispatch, FC, SetStateAction } from "react";
import BookCard from "./bookCard";

type BookGridProps = {
  books: BookType[];
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
};

const BookGrid: FC<BookGridProps> = ({ books, setSelectedBook }) => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
        {books.map((book, index) => (
          <BookCard
            key={book.id || index}
            book={book}
            setSelectedBook={setSelectedBook}
          />
        ))}
      </div>
    </div>
  );
};

export default BookGrid;
