import { Dispatch, FC, SetStateAction, useState, useEffect } from "react";
import { BookType } from "@/shared.types";
import { ImageIcon } from "lucide-react";

type ItemProps = {
  book: BookType;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
  isSelected?: boolean;
};

// Client-side image cache to prevent unnecessary re-fetches
const imageCache = new Map<string, boolean>();

const Item: FC<ItemProps> = ({ book, setSelectedBook, isSelected = false }) => {
  const {
    title,
    authors,
    image = undefined,
    publisher,
    datePublished,
    binding,
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

  return (
    <div
      className={`border rounded-lg p-5 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-zinc-600 bg-zinc-900/70 shadow-lg ring-1 ring-zinc-700/50'
          : 'border-zinc-800 hover:bg-zinc-900/50 hover:border-zinc-700'
      }`}
      onClick={() => setSelectedBook(book)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedBook(book);
        }
      }}
    >
      <div className="flex gap-3 sm:gap-5">
        {/* Book Cover */}
        <div className="flex items-center justify-center min-w-[70px] sm:min-w-[120px]">
          {image && !imageError ? (
            <div className="relative w-[60px] sm:w-[100px]">
              {imageLoading && (
                <div className="absolute inset-0 bg-zinc-800 animate-pulse rounded w-[60px] h-[90px] sm:w-[100px] sm:h-[160px]" />
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
                className={`max-h-[90px] sm:max-h-[160px] object-fill transition-opacity duration-300 rounded shadow-md ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </div>
          ) : (
            <div className="w-[60px] h-[90px] sm:w-[100px] sm:h-[160px] flex items-center justify-center bg-zinc-800/50 rounded">
              <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-zinc-600 opacity-30" />
            </div>
          )}
        </div>

        {/* Book Metadata */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {/* Title and Authors */}
          <div>
            <h3 className="text-lg font-bold text-zinc-100 mb-1.5 tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-sm text-zinc-400 tracking-tight">
              {authors.join(', ')}
            </p>
          </div>

          {/* Publication Details */}
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex gap-3">
              <span className="font-semibold text-zinc-400 min-w-[100px]">Publisher</span>
              <span className="text-zinc-500 overflow-hidden whitespace-nowrap text-ellipsis flex-1">
                {publisher}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-zinc-400 min-w-[100px]">Published</span>
              <span className="text-zinc-500">{datePublished}</span>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-zinc-400 min-w-[100px]">Binding</span>
              <span className="text-zinc-500">{binding}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Item;
