import { BookType } from "@/shared.types";
import { X, ImageIcon, Pencil, RefreshCw, Loader2 } from "lucide-react";
import parse from "html-react-parser";
import { Dispatch, FC, SetStateAction, useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { updateBook, refetchBookMetadata } from "@/utils/actions/books";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/modal";
import BookForm from "@/components/forms/BookForm";
import ImageManager from "@/components/forms/ImageManager";
import { BookImportDataType } from "@/shared.types";
import { Alert, AlertDescription } from "@/components/ui/alert";

type BookProps = {
  book: BookType;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
  isSidePanel?: boolean;
};

// Client-side image cache to prevent unnecessary re-fetches
const imageCache = new Map<string, boolean>();

const Details: FC<BookProps> = ({ book, setSelectedBook, isSidePanel = false }) => {
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

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // Reset image state when book changes to prevent showing old image
  useEffect(() => {
    // If image is in cache, load immediately
    if (image && imageCache.has(image)) {
      setImageLoading(false);
      setImageError(false);
    } else {
      // Reset to loading state for new book
      setImageLoading(true);
      setImageError(false);
    }
  }, [book.id, image]);

  const isMobilePortrait = useMediaQuery(
    "(max-width:600px) and (orientation: portrait)",
  );

  // Side panel styling (desktop) vs full-screen (mobile)
  const sidePanelClasses = isSidePanel
    ? "w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl"
    : "w-full h-full bg-zinc-950 border-t border-zinc-800";

  // Handler for edit submit
  const handleEditSubmit = async (editedData: BookImportDataType) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await updateBook(book.id, editedData);

      if (result.success && result.book) {
        setSuccessMessage("Book updated successfully");
        setIsEditModalOpen(false);
        // Refresh the page to show updated data
        router.refresh();
        // Close success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.error || "Failed to update book");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for refetch from ISBNDB
  const handleRefetch = async () => {
    setIsRefetching(true);
    setErrorMessage(null);

    try {
      const result = await refetchBookMetadata(book.id);

      if (result.success && result.book) {
        setSuccessMessage("Book data refreshed from ISBNDB");
        // Refresh the page to show updated data
        router.refresh();
        // Close success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.error || "Failed to refresh book data");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsRefetching(false);
    }
  };

  return (
    <div className={`${sidePanelClasses} relative`}>
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={handleRefetch}
          disabled={isRefetching}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh book data"
          title="Refresh from ISBNDB"
        >
          {isRefetching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all duration-200"
          aria-label="Edit book"
          title="Edit book details"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSelectedBook(undefined)}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all duration-200"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className={`p-6 overflow-y-auto hide-scrollbar ${
        isSidePanel ? 'max-h-[calc(100vh-8rem)]' : 'h-full'
      }`}>
        <div className={`flex ${isSidePanel ? 'flex-col' : isMobilePortrait ? 'flex-col' : 'gap-8'}`}>
          {/* Book Cover */}
          <div className={`flex flex-col items-start ${
            isSidePanel ? 'w-full mb-6' : isMobilePortrait ? 'w-full mb-6' : 'w-[200px]'
          }`}>
            <div className={`relative ${
              isSidePanel ? 'w-full flex justify-center' : isMobilePortrait ? 'w-full flex justify-center' : 'w-[200px]'
            } min-h-[200px]`}>
              {image && !imageError ? (
                <>
                  {imageLoading && (
                    <div className={`absolute inset-0 ${
                      isSidePanel ? 'w-[180px] h-[280px]' : isMobilePortrait ? 'w-[150px] h-[240px]' : 'w-[200px] h-[200px]'
                    } bg-zinc-800 animate-pulse rounded`} />
                  )}
                  <img
                    src={image}
                    alt={`Cover of ${title}`}
                    onLoad={() => {
                      if (image) {
                        imageCache.set(image, true);
                      }
                      setImageLoading(false);
                    }}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                    className={`${
                      isSidePanel ? 'max-h-[280px]' : isMobilePortrait ? 'max-h-[240px]' : 'max-h-[200px]'
                    } object-fill transition-opacity duration-300 rounded shadow-lg ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                </>
              ) : (
                <div className={`${
                  isSidePanel ? 'w-[180px] h-[280px]' : isMobilePortrait ? 'w-[150px] h-[240px]' : 'w-[200px] h-[200px]'
                } flex items-center justify-center bg-zinc-800/50 rounded`}>
                  <ImageIcon className="w-16 h-16 text-zinc-600 opacity-30" />
                </div>
              )}
            </div>
            <div className={`flex justify-center w-full mt-4 ${
              isSidePanel || isMobilePortrait ? 'border-b border-zinc-800 pb-4' : ''
            }`}>
              <span className="text-sm font-semibold text-zinc-400 tracking-tight">
                {pageCount} pages
              </span>
            </div>
          </div>

          {/* Book Metadata */}
          <div className={`flex flex-col gap-5 flex-1 ${
            !isSidePanel && !isMobilePortrait ? 'sm:ml-8' : ''
          }`}>
            {/* Title and Authors */}
            <div className="pb-4 border-b border-zinc-800">
              <h2 className="text-2xl font-bold text-zinc-100 mb-2 tracking-tight leading-tight">
                {title}
              </h2>
              <p className="text-base text-zinc-400 tracking-tight">
                {authors.join(' • ')}
              </p>
            </div>

            {/* Synopsis */}
            {synopsis && (
              <div className="pb-4 border-b border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-300 mb-3 tracking-tight">Synopsis</h3>
                <div className="text-sm text-zinc-400 leading-relaxed space-y-2">
                  {parse(synopsis)}
                </div>
              </div>
            )}

            {/* Publication Details */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-zinc-300 tracking-tight">Publication Details</h3>
              <div className="space-y-2.5">
                <div className="flex gap-3">
                  <span className="text-sm font-semibold text-zinc-400 min-w-[120px]">Publisher</span>
                  <span className="text-sm text-zinc-500">{publisher}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-sm font-semibold text-zinc-400 min-w-[120px]">Publication Date</span>
                  <span className="text-sm text-zinc-500">{datePublished}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-sm font-semibold text-zinc-400 min-w-[120px]">Binding</span>
                  <span className="text-sm text-zinc-500">{binding}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert className="mt-4 border-green-500/50 bg-green-950/50 text-green-200">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert className="mt-4 border-red-500/50 bg-red-950/50 text-red-200">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Book"
        size="lg"
      >
        <div className="space-y-6">
          {/* Image Manager */}
          <div>
            <h4 className="text-sm font-medium text-zinc-300 mb-3">Cover Image</h4>
            <ImageManager
              currentImage={book.imageOriginal}
              isbn={book.isbn13}
              title={book.title}
              author={book.authors[0]}
              onImageSelect={(url) => {
                // Image will be updated when form is submitted
              }}
            />
          </div>

          {/* Book Form */}
          <BookForm
            mode="edit"
            initialData={{
              title: book.title,
              titleLong: book.titleLong,
              authors: book.authors,
              publisher: book.publisher,
              synopsis: book.synopsis,
              pageCount: book.pageCount,
              datePublished: book.datePublished,
              subjects: book.subjects,
              isbn10: book.isbn10,
              isbn13: book.isbn13,
              binding: book.binding,
              language: book.language,
              edition: book.edition || "",
              image: book.image,
              imageOriginal: book.imageOriginal,
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Details;
