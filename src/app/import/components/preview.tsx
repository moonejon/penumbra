import { Dispatch, FC, SetStateAction, useState } from "react";
import { BookImportDataType } from "@/shared.types";
import { initialBookImportData } from "./import";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ImageIcon, Copy, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookProps {
  book: BookImportDataType;
  setBookData: Dispatch<SetStateAction<BookImportDataType>>;
  loading: boolean;
  importQueue: BookImportDataType[];
  setImportQueue: Dispatch<SetStateAction<BookImportDataType[]>>;
}

const Preview: FC<BookProps> = ({
  book,
  setBookData,
  loading,
  importQueue,
  setImportQueue,
}) => {
  const { authors, binding, datePublished } = book;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  let { title } = book;
  if (book?.title?.includes(":")) {
    const splitTitle = book.title.split(":");
    title = splitTitle[0];
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newImportQueue = importQueue.slice();
    newImportQueue.push({
      ...book,
      title: title,
      image: book.image,
      imageOriginal: book.imageOriginal,
      publisher: book.publisher,
      synopsis: book.synopsis,
      pageCount: book.pageCount,
      datePublished: book.datePublished,
      authors: book.authors,
      subjects: book.subjects,
      isbn10: book.isbn10,
      isbn13: book.isbn13,
      binding: book.binding,
      language: book.language,
      titleLong: book.titleLong,
      edition: book.edition || initialBookImportData.edition,
      isIncomplete: book.isIncomplete,
      isDuplicate: book.isDuplicate,
    });

    setImportQueue(newImportQueue);
    setBookData(initialBookImportData);
  };

  const isMobile: boolean = useMediaQuery("(max-width: 600px)");

  const showEmpty = book === initialBookImportData && !loading;
  const showLoading = loading;
  const showContent = book !== initialBookImportData && !loading;

  return (
    <div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12 transition-all duration-300">
      <div className="p-6">
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Preview
          </h2>

          {/* Empty State */}
          {showEmpty && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center transition-all duration-300 opacity-60 hover:opacity-100">
              <div className="relative">
                <ImageIcon className="w-20 h-20 text-zinc-700 mb-4" />
                <div className="absolute inset-0 bg-zinc-700/20 blur-2xl" />
              </div>
              <p className="text-zinc-400 text-sm max-w-xs">
                Search for a book by ISBN to see a preview here
              </p>
            </div>
          )}

          {/* Loading State - Enhanced Skeleton */}
          {showLoading && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className={cn(
                "flex gap-6",
                isMobile ? "flex-col items-center" : "flex-row"
              )}>
                {/* Image Skeleton */}
                <div className="relative shrink-0">
                  <div className={cn(
                    "bg-gradient-to-br from-zinc-800 to-zinc-850 rounded-lg overflow-hidden",
                    isMobile ? "w-[120px] h-[180px]" : "w-[160px] h-[240px]"
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent animate-pulse" />
                  </div>
                </div>

                {/* Content Skeleton */}
                <div className={cn(
                  "flex flex-col gap-3 flex-1",
                  isMobile && "items-center text-center w-full"
                )}>
                  {/* Title Skeleton */}
                  <div className={cn(
                    "space-y-2",
                    isMobile && "w-full"
                  )}>
                    <div className={cn(
                      "h-7 bg-gradient-to-r from-zinc-800 to-zinc-850 rounded animate-pulse",
                      isMobile ? "w-full" : "w-4/5"
                    )} />
                    <div className={cn(
                      "h-7 bg-gradient-to-r from-zinc-800 to-zinc-850 rounded animate-pulse",
                      isMobile ? "w-3/4 mx-auto" : "w-2/3"
                    )} />
                  </div>

                  {/* Author Skeleton */}
                  <div className={cn(
                    "h-5 bg-gradient-to-r from-zinc-800 to-zinc-850 rounded animate-pulse",
                    isMobile ? "w-2/3" : "w-1/2"
                  )} />

                  {/* Metadata Skeleton */}
                  <div className={cn(
                    "h-4 bg-gradient-to-r from-zinc-800 to-zinc-850 rounded animate-pulse mt-2",
                    isMobile ? "w-1/2" : "w-2/5"
                  )} />

                  {/* Additional Info Skeleton */}
                  <div className={cn(
                    "space-y-2 mt-4",
                    isMobile && "w-full"
                  )}>
                    <div className={cn(
                      "h-3 bg-gradient-to-r from-zinc-800 to-zinc-850 rounded animate-pulse",
                      isMobile ? "w-full" : "w-full"
                    )} />
                    <div className={cn(
                      "h-3 bg-gradient-to-r from-zinc-800 to-zinc-850 rounded animate-pulse",
                      isMobile ? "w-5/6 mx-auto" : "w-4/5"
                    )} />
                    <div className={cn(
                      "h-3 bg-gradient-to-r from-zinc-800 to-zinc-850 rounded animate-pulse",
                      isMobile ? "w-4/5 mx-auto" : "w-3/5"
                    )} />
                  </div>
                </div>
              </div>

              {/* Button Skeleton */}
              <div className="flex justify-end mt-2">
                <div className={cn(
                  "h-10 bg-gradient-to-r from-zinc-800 to-zinc-850 rounded-lg animate-pulse",
                  isMobile ? "w-full" : "w-40"
                )} />
              </div>
            </div>
          )}

          {/* Content */}
          {showContent && (
            <form
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
              className="animate-in fade-in duration-500"
            >
              <div className="flex flex-col gap-5">
                {/* Enhanced Alerts */}
                {book.isIncomplete && (
                  <Alert className="border-amber-500/40 bg-amber-950/40 text-amber-200 shadow-sm">
                    <Info className="h-4 w-4 text-amber-400" />
                    <AlertTitle className="text-amber-300 font-medium mb-1">
                      Incomplete Data
                    </AlertTitle>
                    <AlertDescription className="text-amber-200/90 text-sm leading-relaxed">
                      Some book information is missing. Consider using the ISBN from the title page for more detailed results.
                    </AlertDescription>
                  </Alert>
                )}

                {book.isDuplicate && (
                  <Alert className="border-orange-500/40 bg-orange-950/40 text-orange-200 shadow-sm">
                    <Copy className="h-4 w-4 text-orange-400" />
                    <AlertTitle className="text-orange-300 font-medium mb-1">
                      Duplicate Detected
                    </AlertTitle>
                    <AlertDescription className="text-orange-200/90 text-sm leading-relaxed">
                      This book already exists in your library. Adding it again will create a duplicate copy.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Book Preview Card */}
                <div className={cn(
                  "flex gap-6 p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50",
                  isMobile && "flex-col items-center"
                )}>
                  {/* Book Cover */}
                  <div className="relative shrink-0">
                    {book?.imageOriginal && !imageError ? (
                      <div className="relative group">
                        {imageLoading && (
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-850 rounded-lg animate-pulse z-10",
                            isMobile ? "w-[120px] h-[180px]" : "w-[160px] h-[240px]"
                          )}>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 text-zinc-600 animate-pulse" />
                            </div>
                          </div>
                        )}
                        <img
                          src={book.imageOriginal}
                          alt={title}
                          onLoad={() => setImageLoading(false)}
                          onError={() => {
                            setImageLoading(false);
                            setImageError(true);
                          }}
                          className={cn(
                            "rounded-lg object-cover shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]",
                            isMobile ? "h-[180px]" : "h-[240px]",
                            imageLoading && "opacity-0"
                          )}
                        />
                        {/* Subtle glow effect */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-zinc-900/50 via-transparent to-transparent pointer-events-none" />
                      </div>
                    ) : (
                      <div className={cn(
                        "flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-850 rounded-lg border border-zinc-700/50",
                        isMobile ? "w-[120px] h-[180px]" : "w-[160px] h-[240px]"
                      )}>
                        <ImageIcon className="w-12 h-12 text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* Book Details */}
                  <div className={cn(
                    "flex flex-col gap-3 flex-1 min-w-0",
                    isMobile && "items-center text-center"
                  )}>
                    {/* Title */}
                    <h3 className={cn(
                      "font-bold text-zinc-100 tracking-tight leading-tight",
                      isMobile ? "text-base" : "text-xl"
                    )}>
                      {title}
                    </h3>

                    {/* Authors */}
                    {authors && authors.length > 0 && (
                      <p className={cn(
                        "text-zinc-400 leading-relaxed",
                        isMobile ? "text-sm" : "text-base"
                      )}>
                        {authors.join(", ")}
                      </p>
                    )}

                    {/* Publication Details */}
                    <div className="flex items-center gap-2 text-zinc-500 text-sm mt-1">
                      {binding && <span>{binding}</span>}
                      {binding && datePublished && (
                        <span className="text-zinc-700">•</span>
                      )}
                      {datePublished && (
                        <span>{datePublished.toString().split("-")[0]}</span>
                      )}
                    </div>

                    {/* Additional Metadata */}
                    {(book.publisher || book.pageCount) && (
                      <div className="flex flex-col gap-1.5 mt-2 text-xs text-zinc-500">
                        {book.publisher && (
                          <p className="flex items-center gap-2">
                            <span className="text-zinc-600">Publisher:</span>
                            <span className="text-zinc-400">{book.publisher}</span>
                          </p>
                        )}
                        {book.pageCount && (
                          <p className="flex items-center gap-2">
                            <span className="text-zinc-600">Pages:</span>
                            <span className="text-zinc-400">{book.pageCount}</span>
                          </p>
                        )}
                        {book.language && (
                          <p className="flex items-center gap-2">
                            <span className="text-zinc-600">Language:</span>
                            <span className="text-zinc-400 uppercase">{book.language}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className={cn(
                      "font-medium shadow-sm hover:shadow-md transition-all duration-200",
                      isMobile && "w-full"
                    )}
                  >
                    Add to Queue
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;
