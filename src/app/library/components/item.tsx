import { Dispatch, FC, SetStateAction, useState, useEffect } from "react";
import { BookType } from "@/shared.types";
import { ImageIcon } from "lucide-react";

type ItemProps = {
  book: BookType;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
};

// Client-side image cache to prevent unnecessary re-fetches
const imageCache = new Map<string, boolean>();

const Item: FC<ItemProps> = ({ book, setSelectedBook }) => {
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
      className="border border-zinc-800 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-zinc-900/50 hover:border-zinc-700"
      onClick={() => setSelectedBook(book)}
    >
      <div className="flex gap-4">
        {/* Book Cover - Hidden on mobile */}
        <div className="hidden sm:flex items-center justify-center min-w-[120px]">
          {image && !imageError ? (
            <div className="relative w-[100px]">
              {imageLoading && (
                <div className="absolute inset-0 bg-zinc-800 animate-pulse rounded"
                     style={{ width: '100px', height: '160px' }}
                />
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
                className={`max-h-[160px] object-fill transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </div>
          ) : (
            <div className="w-[100px] h-[160px] flex items-center justify-center bg-zinc-800/50 rounded">
              <ImageIcon className="w-12 h-12 text-zinc-600 opacity-30" />
            </div>
          )}
        </div>

        {/* Book Metadata */}
        <div className="flex flex-col gap-4 md:gap-7 flex-1 min-w-0">
          {/* Title and Authors */}
          <div>
            <h3 className="text-lg font-bold text-zinc-100 mb-1">
              {title}
            </h3>
            <p className="text-sm text-zinc-400">
              {authors.join(', ')}
            </p>
          </div>

          {/* Publication Details */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex gap-2">
              <span className="font-bold text-zinc-300">Publisher:</span>
              <span className="text-zinc-500 overflow-hidden whitespace-nowrap text-ellipsis max-w-[200px]">
                {publisher}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-zinc-300">Date Published:</span>
              <span className="text-zinc-500">{datePublished}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-zinc-300">Binding:</span>
              <span className="text-zinc-500">{binding}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Item;
