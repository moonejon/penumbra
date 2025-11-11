import { Dispatch, FC, SetStateAction } from "react";
import { BookImportDataType } from "@/shared.types";
import { initialBookImportData } from "./import";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ImageIcon } from "lucide-react";

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

  let { title } = book;
  // let subtitle = "";
  if (book?.title?.includes(":")) {
    const splitTitle = book.title.split(":");
    title = splitTitle[0];
    // subtitle = splitTitle[1];
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
    <div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12">
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Preview
          </h2>

          {/* Empty State */}
          {showEmpty && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="w-16 h-16 text-zinc-700 mb-4 opacity-50" />
              <p className="text-zinc-400 text-sm">
                Search for a book by ISBN to see a preview here
              </p>
            </div>
          )}

          {/* Loading State */}
          {showLoading && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-4">
                <div className="w-[150px] h-[250px] bg-zinc-800 rounded animate-pulse" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-6 bg-zinc-800 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
                  <div className="h-3 bg-zinc-800 rounded w-1/3 animate-pulse mt-4" />
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {showContent && (
            <form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {book.isIncomplete && (
                <Alert className="border-amber-500/50 bg-amber-950/50 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Incomplete data was returned. Consider using the ISBN number
                    found on the title page for more specific details.
                  </AlertDescription>
                </Alert>
              )}
              {book.isDuplicate && (
                <Alert className="border-amber-500/50 bg-amber-950/50 text-amber-400">
                  <AlertDescription>
                    A copy of this book already exists in your library. This
                    will create a duplicate copy. Is this intentional?
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex flex-row gap-4">
                {book?.imageOriginal ? (
                  <img
                    src={book?.imageOriginal}
                    alt={title}
                    className={`rounded ${isMobile ? "h-[100px]" : "h-[250px]"} object-cover`}
                  />
                ) : (
                  <div className="w-[150px] h-[250px] bg-zinc-800 rounded animate-pulse flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-zinc-600" />
                  </div>
                )}
                <div className="flex flex-col">
                  <h3
                    className={`font-bold text-zinc-100 tracking-tight ${
                      isMobile ? "text-sm" : "text-lg"
                    }`}
                  >
                    {title}
                  </h3>
                  <p
                    className={`text-zinc-400 mt-1 ${
                      isMobile ? "text-xs" : "text-sm"
                    }`}
                  >
                    {authors.join(", ")}
                  </p>
                  <p className="text-zinc-500 text-xs mt-4">
                    {binding} ✧ {datePublished?.toString().split("-")[0]}
                  </p>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full md:w-[40%] self-end"
              >
                Add to queue
              </Button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;
