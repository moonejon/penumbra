import { Dispatch, FC, SetStateAction, useState, useEffect } from "react";
import { BookType } from "@/shared.types";
import { ImageIcon, BookOpen } from "lucide-react";

type GridItemProps = {
  book: BookType;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
  isSelected?: boolean;
};

// Client-side image cache to prevent unnecessary re-fetches
const imageCache = new Map<string, boolean>();

const GridItem: FC<GridItemProps> = ({ book, setSelectedBook, isSelected = false }) => {
  const {
    title,
    authors,
    image = undefined,
    pageCount,
  } = book;

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

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

  return (
    <div
      className={`group relative cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-zinc-600 ring-offset-2 ring-offset-zinc-950'
          : ''
      }`}
      onClick={() => setSelectedBook(book)}
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${title} by ${authors.join(', ')}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedBook(book);
        }
      }}
    >
      {/* Book Cover Container */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900/50 border border-zinc-800 group-hover:border-zinc-700 transition-all duration-200">
        {image && !imageError ? (
          <>
            {/* Loading Skeleton */}
            {imageLoading && (
              <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
            )}

            {/* Book Cover Image */}
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
              className={`w-full h-full object-cover transition-all duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              } ${showOverlay ? 'scale-105' : 'scale-100'}`}
            />
          </>
        ) : (
          /* Fallback for missing/errored images */
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/50">
            <ImageIcon className="w-12 h-12 text-zinc-600 opacity-30 mb-2" />
            <span className="text-xs text-zinc-600 px-2 text-center line-clamp-2">
              {title}
            </span>
          </div>
        )}

        {/* Desktop: Hover Overlay with metadata */}
        <div
          className={`hidden md:flex absolute inset-0 bg-zinc-950/95 backdrop-blur-sm flex-col justify-end p-4 transition-opacity duration-200 ${
            showOverlay ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h3 className="text-sm font-bold text-zinc-100 mb-1 line-clamp-2 leading-tight">
            {title}
          </h3>
          <p className="text-xs text-zinc-400 mb-2 line-clamp-1">
            {authors.join(', ')}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <BookOpen className="w-3 h-3" />
            <span>{pageCount} pages</span>
          </div>
        </div>

        {/* Mobile: Always show title overlay at bottom */}
        <div className="md:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-3 pt-8">
          <h3 className="text-xs font-semibold text-zinc-100 line-clamp-2 leading-tight">
            {title}
          </h3>
        </div>

        {/* Selected State Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-zinc-600 border-2 border-zinc-950 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-zinc-100"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default GridItem;
