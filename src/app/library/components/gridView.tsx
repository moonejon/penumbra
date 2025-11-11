"use client";

import { BookType } from "@/shared.types";
import { Dispatch, FC, SetStateAction } from "react";
import GridItem from "./gridItem";
import { useRouter, useSearchParams } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type GridViewProps = {
  rows: BookType[];
  page: number;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
  pageCount: number;
  isLoading?: boolean;
  selectedBook?: BookType;
  pageSize: number;
  isSidePanelOpen?: boolean;
};

const SkeletonGridCard: FC = () => {
  return (
    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900/50 border border-zinc-800">
      <div className="w-full h-full bg-zinc-800 animate-pulse" />
    </div>
  );
};

// Simple Pagination Component
const Pagination: FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  isMobile?: boolean;
}> = ({ currentPage, totalPages, onPageChange, disabled = false, isMobile = false }) => {
  const getPageNumbers = () => {
    const delta = isMobile ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pages = totalPages > 1 ? getPageNumbers() : [];

  return (
    <div className="flex justify-center items-center gap-2 py-6 mt-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className={`px-4 py-2 rounded-lg border font-medium ${
          disabled || currentPage === 1
            ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
            : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600'
        } transition-all duration-200 ${isMobile ? 'text-xs' : 'text-sm'}`}
        aria-label="Previous page"
      >
        Previous
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) =>
        page === '...' ? (
          <span
            key={`dots-${index}`}
            className="px-2 text-zinc-600"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            disabled={disabled}
            className={`${
              isMobile ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-sm'
            } rounded-lg border transition-all duration-200 font-medium ${
              currentPage === page
                ? 'border-zinc-600 bg-zinc-800 text-zinc-100 shadow-md ring-1 ring-zinc-700/50'
                : disabled
                ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        className={`px-4 py-2 rounded-lg border font-medium ${
          disabled || currentPage === totalPages
            ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
            : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600'
        } transition-all duration-200 ${isMobile ? 'text-xs' : 'text-sm'}`}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
};

const GridView: FC<GridViewProps> = ({
  rows,
  page,
  setSelectedBook,
  pageCount,
  isLoading = false,
  selectedBook,
  pageSize,
  isSidePanelOpen = false
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery('(max-width:600px)');

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`library/?${params.toString()}`);
  };

  return (
    <div>
      {/* Grid Container with responsive columns - fewer columns when side panel is open */}
      <div className={`grid gap-3 sm:gap-4 md:gap-5 ${
        isSidePanelOpen
          ? 'grid-cols-2 md:grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
      }`}>
        {isLoading ? (
          // Show skeleton cards based on pageSize
          <>
            {Array.from({ length: pageSize }).map((_, i) => (
              <SkeletonGridCard key={i} />
            ))}
          </>
        ) : (
          rows?.map((book, i) => (
            <GridItem
              book={book}
              key={i}
              setSelectedBook={setSelectedBook}
              isSelected={selectedBook?.id === book.id}
            />
          ))
        )}
      </div>

      {pageCount > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pageCount}
          onPageChange={handlePageChange}
          disabled={isLoading}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default GridView;
