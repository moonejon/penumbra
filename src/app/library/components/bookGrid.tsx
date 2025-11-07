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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Library</h1>
        <p className="text-gray-600">
          {books.length} {books.length === 1 ? "book" : "books"} found
        </p>
      </div>

      {/* Grid */}
      {books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {books.map((book, index) => (
            <BookCard
              key={book.id || index}
              book={book}
              setSelectedBook={setSelectedBook}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 mb-4 text-gray-300">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No books found
          </h3>
          <p className="text-gray-600 max-w-md">
            Try adjusting your filters or search criteria to find more books.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookGrid;
