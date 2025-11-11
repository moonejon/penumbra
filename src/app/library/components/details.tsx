import { BookType } from "@/shared.types";
import { X, ImageIcon } from "lucide-react";
import parse from "html-react-parser";
import { Dispatch, FC, SetStateAction, useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type BookProps = {
  book: BookType;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
  isSidePanel?: boolean;
};

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

  // Reset image state when book changes to prevent showing old image
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [book.id, image]);

  const isMobilePortrait = useMediaQuery(
    "(max-width:600px) and (orientation: portrait)",
  );

  // Side panel styling (desktop) vs full-screen (mobile)
  const sidePanelClasses = isSidePanel
    ? "w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl"
    : "w-full h-full bg-zinc-950 border-t border-zinc-800";

  return (
    <div className={`${sidePanelClasses} relative`}>
      {/* Close Button */}
      <button
        onClick={() => setSelectedBook(undefined)}
        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all duration-200 z-10"
        aria-label="Close details"
      >
        <X className="w-5 h-5" />
      </button>

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
      </div>
    </div>
  );
};

export default Details;
