import { Dispatch, FC, SetStateAction, useState } from "react";
import { BookImportDataType } from "@/shared.types";
import Item from "./item";
import { importBooks } from "@/utils/actions/books";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueProps {
  books: Array<BookImportDataType>;
  setBooks: Dispatch<SetStateAction<BookImportDataType[]>>;
}

const Queue: FC<QueueProps> = ({ books, setBooks }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = (key: number) => {
    const updatedBooks = books.filter((_, index) => index !== key);

    return setBooks(updatedBooks);
  };

  const handleSubmit = async () => {
    setIsImporting(true);
    setError(null);

    try {
      const cleanedBooks: BookImportDataType[] = books.map((book) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isIncomplete, isDuplicate, ...bookData } = book;
        return bookData;
      });

      const result = await importBooks(cleanedBooks);

      if (result?.success) {
        setBooks([]);
        setShowSuccess(true);
        // Auto-hide success message after 4 seconds
        setTimeout(() => setShowSuccess(false), 4000);
      } else {
        setError("Failed to import books. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Import error:", err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12 flex flex-col max-h-[calc(100vh-6rem)] md:max-h-none">
        <div className="p-6 flex flex-col flex-1 overflow-hidden">
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight mb-4">
            Queue
          </h2>

          {error && (
            <Alert className="mb-4 border-red-500/50 bg-red-950/50 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex-1">{error}</AlertDescription>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
                aria-label="Close error"
              >
                ×
              </button>
            </Alert>
          )}

          {books?.length ? (
            <div className="flex flex-col flex-1 gap-4 min-h-0">
              <div className="flex-1 overflow-y-auto hide-scrollbar pr-2 -mr-2">
                {books.map((book, i) => (
                  <Item
                    title={book.title}
                    authors={book.authors}
                    isIncomplete={book.isIncomplete || false}
                    key={i}
                    itemKey={i}
                    handleDelete={handleDelete}
                  />
                ))}
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full md:w-1/2 self-end"
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add to library"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/30 m-2" />
          )}
        </div>
      </div>

      {/* Success Toast */}
      <div
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
          showSuccess
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <Alert className="border-green-500/50 bg-green-950/50 text-green-400 shadow-xl">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Books successfully added to your library!
          </AlertDescription>
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-4 text-green-400 hover:text-green-300"
            aria-label="Close success message"
          >
            ×
          </button>
        </Alert>
      </div>
    </>
  );
};

export default Queue;
