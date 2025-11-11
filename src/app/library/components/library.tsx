"use client";

import { BookType, BookImportDataType } from "@/shared.types";
import { FC, useState, useEffect } from "react";
import List from "./list";
import GridView from "./gridView";
import Details from "./details";
import SearchHeader, { ViewMode } from "./searchHeader";
import { LibraryBig, SearchX, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PageSizeOption } from "./pageSizeSelector";
import Modal from "@/components/ui/modal";
import BookForm from "@/components/forms/BookForm";
import ImageManager from "@/components/forms/ImageManager";
import { createManualBook } from "@/utils/actions/books";

type LibraryProps = {
  books: BookType[];
  pageCount: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
};

const STORAGE_KEY = "library-view-mode";
const PAGE_SIZE_STORAGE_KEY_LIST = "library-list-page-size";
const PAGE_SIZE_STORAGE_KEY_GRID = "library-grid-page-size";

// Page size options for list view
const LIST_PAGE_SIZE_OPTIONS: PageSizeOption[] = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

// Page size options for grid view
const GRID_PAGE_SIZE_OPTIONS: PageSizeOption[] = [
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: 200, label: "200" },
];

// Default page sizes
const DEFAULT_LIST_PAGE_SIZE = 25;
const DEFAULT_GRID_PAGE_SIZE = 50;

const Library: FC<LibraryProps> = ({
  books,
  pageCount,
  page,
  pageSize: initialPageSize,
  isLoading = false,
}) => {
  const [selectedBook, setSelectedBook] = useState<BookType>();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Load view mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (savedMode === "list" || savedMode === "grid") {
      setViewMode(savedMode);
    }
  }, []);

  // Load page size from localStorage based on current view mode
  useEffect(() => {
    const storageKey = viewMode === "list" ? PAGE_SIZE_STORAGE_KEY_LIST : PAGE_SIZE_STORAGE_KEY_GRID;
    const defaultPageSize = viewMode === "list" ? DEFAULT_LIST_PAGE_SIZE : DEFAULT_GRID_PAGE_SIZE;

    const savedPageSize = localStorage.getItem(storageKey);
    const parsedPageSize = savedPageSize ? parseInt(savedPageSize, 10) : null;

    // Use saved page size if valid, otherwise use default
    if (parsedPageSize && !isNaN(parsedPageSize)) {
      setPageSize(parsedPageSize);
    } else {
      setPageSize(defaultPageSize);
    }
  }, [viewMode]);

  // Handle view mode change and persist to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  // Handle page size change, persist to localStorage, and update URL
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);

    // Save to localStorage based on current view mode
    const storageKey = viewMode === "list" ? PAGE_SIZE_STORAGE_KEY_LIST : PAGE_SIZE_STORAGE_KEY_GRID;
    localStorage.setItem(storageKey, newPageSize.toString());

    // Update URL with new page size and reset to page 1
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newPageSize.toString());
    params.set("page", "1");
    router.push(`/library?${params.toString()}`);
  };

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

  const handleManualEntrySubmit = async (bookData: BookImportDataType) => {
    setIsSubmitting(true);
    try {
      const result = await createManualBook(bookData);

      if (result.success) {
        setIsManualEntryOpen(false);
        // Refresh the page to show new book
        router.refresh();
      } else {
        alert(result.error || "Failed to create book");
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
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
        Start building your library by importing or adding a book.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleImportBooks}
          className="px-6 py-3 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-all duration-200 font-medium"
        >
          Import Book
        </button>
        <button
          onClick={() => setIsManualEntryOpen(true)}
          className="px-6 py-3 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-all duration-200 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Custom Book
        </button>
      </div>
    </div>
  );

  const showEmptyState = !isLoading && books.length === 0;

  // Get current page size options based on view mode
  const currentPageSizeOptions = viewMode === "list" ? LIST_PAGE_SIZE_OPTIONS : GRID_PAGE_SIZE_OPTIONS;

  return (
    <>
      <SearchHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        pageSize={pageSize}
        pageSizeOptions={currentPageSizeOptions}
        onPageSizeChange={handlePageSizeChange}
      />

      <div className="mt-6">
        {showEmptyState ? (
          hasActiveFilters ? (
            <EmptySearchState />
          ) : (
            <EmptyLibraryState />
          )
        ) : (
          <>
            {/* Mobile: Full-screen toggle between list/grid and details */}
            {!isDesktop && !selectedBook && (
              <>
                {viewMode === "list" ? (
                  <List
                    rows={books}
                    setSelectedBook={setSelectedBook}
                    page={page}
                    pageCount={pageCount}
                    isLoading={isLoading}
                    selectedBook={selectedBook}
                    pageSize={pageSize}
                  />
                ) : (
                  <GridView
                    rows={books}
                    setSelectedBook={setSelectedBook}
                    page={page}
                    pageCount={pageCount}
                    isLoading={isLoading}
                    selectedBook={selectedBook}
                    pageSize={pageSize}
                  />
                )}
              </>
            )}

            {!isDesktop && selectedBook && (
              <div className="fixed inset-0 z-50 bg-zinc-950">
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
                {/* Book List/Grid - 40% width */}
                <div className={`transition-all duration-300 ${
                  selectedBook ? 'w-[40%]' : 'w-full'
                }`}>
                  {viewMode === "list" ? (
                    <List
                      rows={books}
                      setSelectedBook={setSelectedBook}
                      page={page}
                      pageCount={pageCount}
                      isLoading={isLoading}
                      selectedBook={selectedBook}
                      pageSize={pageSize}
                    />
                  ) : (
                    <GridView
                      rows={books}
                      setSelectedBook={setSelectedBook}
                      page={page}
                      pageCount={pageCount}
                      isLoading={isLoading}
                      selectedBook={selectedBook}
                      pageSize={pageSize}
                      isSidePanelOpen={!!selectedBook}
                    />
                  )}
                </div>

                {/* Details Panel - 60% width */}
                {selectedBook && (
                  <div className="w-[60%] sticky top-20 self-start">
                    <Details
                      book={selectedBook}
                      setSelectedBook={setSelectedBook}
                      isSidePanel={true}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        title="Add Custom Book"
        size="lg"
      >
        <div className="space-y-6">
          {/* Image Manager */}
          <div>
            <h4 className="text-sm font-medium text-zinc-300 mb-3">Cover Image</h4>
            <ImageManager
              currentImage=""
              onImageSelect={(url) => {
                // Image will be set when form is submitted
              }}
            />
          </div>

          {/* Book Form */}
          <BookForm
            mode="create"
            onSubmit={handleManualEntrySubmit}
            onCancel={() => setIsManualEntryOpen(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </Modal>
    </>
  );
};

export default Library;
