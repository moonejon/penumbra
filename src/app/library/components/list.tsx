"use client";

import { BookType } from "@/shared.types";
import { Dispatch, FC, SetStateAction } from "react";
import Item from "./item";
import { useRouter, useSearchParams } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type ListProps = {
  rows: BookType[];
  page: number;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
  pageCount: number;
  isLoading?: boolean;
  selectedBook?: BookType;
};

const SkeletonBookCard: FC = () => {
  return (
    <div className="border border-zinc-800 rounded-lg p-5">
      <div className="flex gap-5">
        {/* Book Cover Skeleton - Hidden on mobile */}
        <div className="hidden sm:flex items-center justify-center min-w-[120px]">
          <div className="w-[100px] h-[160px] bg-zinc-800 animate-pulse rounded" />
        </div>

        {/* Metadata Skeleton */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Title and Authors */}
          <div className="space-y-2">
            <div className="h-6 bg-zinc-800 animate-pulse rounded w-3/5" />
            <div className="h-5 bg-zinc-800 animate-pulse rounded w-2/5" />
          </div>

          {/* Publication Details */}
          <div className="space-y-2">
            <div className="h-3 bg-zinc-800 animate-pulse rounded w-1/2" />
            <div className="h-3 bg-zinc-800 animate-pulse rounded w-1/3" />
            <div className="h-3 bg-zinc-800 animate-pulse rounded w-1/4" />
          </div>
        </div>
      </div>
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

const List: FC<ListProps> = ({
  rows,
  page,
  setSelectedBook,
  pageCount,
  isLoading = false,
  selectedBook
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
    <div className="flex flex-col gap-4">
      {isLoading ? (
        // Show 10 skeleton cards while loading
        <>
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonBookCard key={i} />
          ))}
        </>
      ) : (
        rows?.map((book, i) => (
          <Item
            book={book}
            key={i}
            setSelectedBook={setSelectedBook}
            isSelected={selectedBook?.id === book.id}
          />
        ))
      )}

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

export default List;
