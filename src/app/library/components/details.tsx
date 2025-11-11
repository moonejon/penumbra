import { BookType } from "@/shared.types";
import { X, ImageIcon } from "lucide-react";
import parse from "html-react-parser";
import { Dispatch, FC, SetStateAction, useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type BookProps = {
  book: BookType;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
};

// Client-side image cache to prevent unnecessary re-fetches
const imageCache = new Map<string, boolean>();

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

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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

  return (
    <div className="flex-1 w-4/5 max-w-4xl m-8 border border-zinc-800 rounded-lg bg-zinc-900/50 relative">
      {/* Close Button */}
      <button
        onClick={() => setSelectedBook(undefined)}
        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
        aria-label="Close details"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-6">
        <div className="flex gap-8">
          {/* Book Cover - Hidden on mobile portrait */}
          {!isMobilePortrait && (
            <div className="flex flex-col items-start w-[200px]">
              <div className="relative w-[200px] min-h-[200px]">
                {image && !imageError ? (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 w-[200px] h-[200px] bg-zinc-800 animate-pulse rounded" />
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
                      className={`max-h-[200px] object-fill transition-opacity duration-300 ${
                        imageLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                  </>
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center bg-zinc-800/50 rounded">
                    <ImageIcon className="w-16 h-16 text-zinc-600 opacity-30" />
                  </div>
                )}
              </div>
              <div className="flex justify-center w-full mt-4">
                <span className="text-xs font-semibold text-zinc-400">
                  {pageCount} pgs
                </span>
              </div>
            </div>
          )}

          {/* Book Metadata */}
          <div className="flex flex-col gap-4 sm:gap-6 flex-1 sm:ml-8">
            {/* Title and Authors */}
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">
                {title}
              </h2>
              <p className="text-base text-zinc-400">
                {authors.join(' • ')}
              </p>
            </div>

            {/* Synopsis */}
            <div className="text-xs text-zinc-400 leading-relaxed">
              {parse(synopsis)}
            </div>

            {/* Publication Details */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <span className="text-sm font-bold text-zinc-300">Publisher:</span>
                <span className="text-sm text-zinc-500">{publisher}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-bold text-zinc-300">Publication Date:</span>
                <span className="text-sm text-zinc-500">{datePublished}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-bold text-zinc-300">Binding:</span>
                <span className="text-sm text-zinc-500">{binding}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
