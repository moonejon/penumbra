"use client";

import { BookType } from "@/shared.types";
import { FC, useState } from "react";
import List from "./list";
import Details from "./details";
import SearchHeader from "./searchHeader";
import { LibraryBig, SearchX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type LibraryProps = {
  books: BookType[];
  pageCount: number;
  page: number;
  isLoading?: boolean;
};

const Library: FC<LibraryProps> = ({
  books,
  pageCount,
  page,
  isLoading = false,
}) => {
  const [selectedBook, setSelectedBook] = useState<BookType>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const hasActiveFilters = !!(
    searchParams.get("title") ||
    searchParams.get("authors") ||
    searchParams.get("subjects")
  );

  const handleClearFilters = () => {
    router.push("/library");
  };

  const handleImportBooks = () => {
    router.push("/import");
  };

  // Empty state for no search results
  const EmptySearchState = () => (
    <div className="text-center py-16 px-4">
      <SearchX className="w-20 h-20 text-zinc-600 mx-auto mb-4 opacity-50" />
      <h2 className="text-2xl font-semibold text-zinc-100 mb-2 tracking-tight">
        No books match your search
      </h2>
      <p className="text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
        Try adjusting your search terms or clear your filters to see all books in your library.
      </p>
      <button
        onClick={handleClearFilters}
        className="px-6 py-2.5 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 transition-all duration-200"
      >
        Clear Filters
      </button>
    </div>
  );

  // Empty state for no books in library
  const EmptyLibraryState = () => (
    <div className="text-center py-16 px-4">
      <LibraryBig className="w-20 h-20 text-zinc-600 mx-auto mb-4 opacity-50" />
      <h2 className="text-2xl font-semibold text-zinc-100 mb-2 tracking-tight">
        No books yet
      </h2>
      <p className="text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
        Start building your library by importing your first book.
      </p>
      <button
        onClick={handleImportBooks}
        className="px-6 py-3 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-all duration-200 font-medium"
      >
        Add Your First Book
      </button>
    </div>
  );

  const showEmptyState = !isLoading && books.length === 0;

  return (
    <>
      <SearchHeader />

      <div className="mt-6">
        {showEmptyState ? (
          hasActiveFilters ? (
            <EmptySearchState />
          ) : (
            <EmptyLibraryState />
          )
        ) : (
          <>
            {/* Mobile: Full-screen toggle between list and details */}
            {!isDesktop && !selectedBook && (
              <List
                rows={books}
                setSelectedBook={setSelectedBook}
                page={page}
                pageCount={pageCount}
                isLoading={isLoading}
                selectedBook={selectedBook}
              />
            )}

            {!isDesktop && selectedBook && (
              <div className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto">
                <Details
                  book={selectedBook}
                  setSelectedBook={setSelectedBook}
                  isSidePanel={false}
                />
              </div>
            )}

            {/* Desktop: Side-by-side layout */}
            {isDesktop && (
              <div className="flex gap-6">
                {/* Book List - 40% width */}
                <div className={`transition-all duration-300 ${
                  selectedBook ? 'w-[40%]' : 'w-full'
                }`}>
                  <List
                    rows={books}
                    setSelectedBook={setSelectedBook}
                    page={page}
                    pageCount={pageCount}
                    isLoading={isLoading}
                    selectedBook={selectedBook}
                  />
                </div>

                {/* Details Panel - 60% width */}
                {selectedBook && (
                  <div className="w-[60%] sticky top-6 self-start">
                    <div className="animate-in slide-in-from-right duration-300">
                      <Details
                        book={selectedBook}
                        setSelectedBook={setSelectedBook}
                        isSidePanel={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Library;
