"use client";

import { BookType } from "@/shared.types";
import parse from "html-react-parser";
import { Dispatch, FC, SetStateAction } from "react";

type BookProps = {
  book: BookType;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
};

const Details: FC<BookProps> = ({ book, setSelectedBook }) => {
  const {
    title,
    authors,
    image,
    publisher,
    datePublished,
    binding,
    synopsis,
    pageCount,
  } = book;

  return (
    <div className="relative w-full max-w-4xl mx-auto my-8 px-4">
      {/* Close button */}
      <button
        onClick={() => setSelectedBook(undefined)}
        className="absolute -top-2 -right-2 sm:top-2 sm:right-2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
        aria-label="Close"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            {/* Book cover - hidden on mobile portrait */}
            <div className="hidden sm:flex flex-col items-center flex-shrink-0 w-48">
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="w-full rounded-lg shadow-md"
                  style={{ maxHeight: "280px", objectFit: "cover" }}
                />
              ) : (
                <div className="w-full h-72 bg-gray-200 rounded-lg animate-pulse" />
              )}
              {pageCount && (
                <div className="mt-4 text-center">
                  <span className="text-sm font-semibold text-gray-600">
                    {pageCount} pages
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6">
              {/* Title and Author */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h2>
                <p className="text-base text-gray-600">
                  {authors.join(" • ")}
                </p>
              </div>

              {/* Synopsis */}
              {synopsis && (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {parse(synopsis)}
                </div>
              )}

              {/* Publication details */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                {publisher && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-900 min-w-[140px]">
                      Publisher:
                    </span>
                    <span className="text-gray-700">{publisher}</span>
                  </div>
                )}
                {datePublished && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-900 min-w-[140px]">
                      Publication Date:
                    </span>
                    <span className="text-gray-700">{datePublished}</span>
                  </div>
                )}
                {binding && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-900 min-w-[140px]">
                      Binding:
                    </span>
                    <span className="text-gray-700">{binding}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
