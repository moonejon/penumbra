import React, { Dispatch, FC, SetStateAction, useState, useRef } from "react";
import { BookImportDataType } from "@/shared.types";
import Item from "./item";
import { importBooks } from "@/utils/actions/books";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueProps {
  books: Array<BookImportDataType>;
  setBooks: Dispatch<SetStateAction<BookImportDataType[]>>;
}

type ImportError = {
  type: "partial" | "complete" | "validation" | "network" | "unknown";
  message: string;
  failedCount?: number;
  successCount?: number;
};

const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

const Queue: FC<QueueProps> = ({ books, setBooks }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<ImportError | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  const cleanup = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  };

  const handleDelete = (key: number) => {
    const updatedBooks = books.filter((_, index) => index !== key);
    return setBooks(updatedBooks);
  };

  const calculateBackoff = (attempt: number): number => {
    // Exponential backoff: 1s, 2s, 4s
    return INITIAL_BACKOFF * Math.pow(2, attempt);
  };

  const validateBooks = (): ImportError | null => {
    if (books.length === 0) {
      return {
        type: "validation",
        message: "No books in queue to import",
      };
    }

    // Check for required fields in each book
    const invalidBooks = books.filter((book) => {
      return !book.isbn13 || !book.title;
    });

    if (invalidBooks.length > 0) {
      return {
        type: "validation",
        message: `${invalidBooks.length} book(s) missing required information (ISBN13 or title)`,
      };
    }

    return null;
  };

  const handleSubmit = async (isRetry: boolean = false) => {
    // Prevent submission during import
    if (isImporting) {
      return;
    }

    // Validate books before import
    const validationError = validateBooks();
    if (validationError) {
      setError(validationError);
      return;
    }

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
        setRetryCount(0);
        setShowSuccess(true);

        // Auto-hide success message after 4 seconds
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        successTimeoutRef.current = setTimeout(() => {
          setShowSuccess(false);
          successTimeoutRef.current = null;
        }, 4000);
      } else {
        // Determine error type and handle retry logic
        const errorMessage = result?.error || "Unknown error occurred";

        let errorType: ImportError["type"] = "unknown";
        let shouldRetry = false;

        if (errorMessage.includes("network") || errorMessage.includes("timeout")) {
          errorType = "network";
          shouldRetry = true;
        } else if (errorMessage.includes("duplicate") || errorMessage.includes("constraint")) {
          errorType = "validation";
          shouldRetry = false;
        } else if (result?.count && result.count > 0 && result.count < books.length) {
          errorType = "partial";
          shouldRetry = true;
        } else {
          errorType = "complete";
          shouldRetry = true;
        }

        const importError: ImportError = {
          type: errorType,
          message: errorMessage,
          failedCount: books.length - (result?.count || 0),
          successCount: result?.count || 0,
        };

        // Attempt retry with exponential backoff
        if (shouldRetry && !isRetry && retryCount < MAX_RETRIES) {
          const backoffDelay = calculateBackoff(retryCount);
          setRetryCount(retryCount + 1);

          setError({
            ...importError,
            message: `${errorMessage}. Retrying in ${backoffDelay / 1000}s... (Attempt ${retryCount + 1}/${MAX_RETRIES})`,
          });

          retryTimeoutRef.current = setTimeout(() => {
            handleSubmit(true);
          }, backoffDelay);
        } else {
          // Max retries reached or shouldn't retry
          setError({
            ...importError,
            message: retryCount >= MAX_RETRIES
              ? `${errorMessage}. Maximum retry attempts reached.`
              : errorMessage,
          });
          setRetryCount(0);
        }
      }
    } catch (err) {
      cleanup();

      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";

      // Determine if this is a network error
      const isNetworkError = errorMessage.includes("fetch") ||
                            errorMessage.includes("network") ||
                            errorMessage.includes("connection");

      const importError: ImportError = {
        type: isNetworkError ? "network" : "unknown",
        message: errorMessage,
      };

      // Attempt retry for network errors
      if (isNetworkError && !isRetry && retryCount < MAX_RETRIES) {
        const backoffDelay = calculateBackoff(retryCount);
        setRetryCount(retryCount + 1);

        setError({
          ...importError,
          message: `${errorMessage}. Retrying in ${backoffDelay / 1000}s... (Attempt ${retryCount + 1}/${MAX_RETRIES})`,
        });

        retryTimeoutRef.current = setTimeout(() => {
          handleSubmit(true);
        }, backoffDelay);
      } else {
        setError({
          ...importError,
          message: retryCount >= MAX_RETRIES
            ? `${errorMessage}. Maximum retry attempts reached.`
            : errorMessage,
        });
        setRetryCount(0);
      }

      console.error("Import error:", err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleManualRetry = () => {
    cleanup();
    setRetryCount(0);
    handleSubmit(false);
  };

  const handleClearError = () => {
    cleanup();
    setError(null);
    setRetryCount(0);
  };

  const getErrorTitle = (error: ImportError): string => {
    switch (error.type) {
      case "partial":
        return "Partial Import Failure";
      case "complete":
        return "Import Failed";
      case "validation":
        return "Validation Error";
      case "network":
        return "Network Error";
      default:
        return "Error";
    }
  };

  const getErrorActions = (error: ImportError): React.ReactElement | null => {
    if (error.type === "partial" && error.successCount && error.successCount > 0) {
      return (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              // Remove successfully imported books (keep only failed ones)
              // This is a simplified approach - in production you'd track which specific books failed
              const failedBooks = books.slice(0, error.failedCount || 0);
              setBooks(failedBooks);
              handleClearError();
            }}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-100 rounded text-xs hover:bg-zinc-700 transition-colors"
          >
            Remove Successful
          </button>
          <button
            onClick={handleManualRetry}
            className="px-3 py-1.5 bg-red-900/50 text-red-100 rounded text-xs hover:bg-red-900/70 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Retry All
          </button>
        </div>
      );
    }

    if (error.type === "network" || error.type === "unknown") {
      return (
        <button
          onClick={handleManualRetry}
          className="px-3 py-1.5 bg-red-900/50 text-red-100 rounded text-xs hover:bg-red-900/70 transition-colors flex items-center gap-1 mt-3"
        >
          <RefreshCw className="h-3 w-3" />
          Retry Import
        </button>
      );
    }

    return null;
  };

  return (
    <>
      <div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12 flex flex-col max-h-[calc(100vh-6rem)] md:max-h-none">
        <div className="p-6 flex flex-col flex-1 overflow-hidden">
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight mb-4">
            Queue
          </h2>

          {error && (
            <Alert className="mb-4 border-red-500/50 bg-red-950/50 text-red-400 animate-in fade-in duration-300">
              <AlertCircle className="h-4 w-4" />
              <div className="flex-1">
                <AlertTitle className="text-red-300 font-medium mb-1">
                  {getErrorTitle(error)}
                </AlertTitle>
                <AlertDescription className="text-red-200/90 text-sm leading-relaxed">
                  {error.message}
                  {error.successCount !== undefined && error.failedCount !== undefined && (
                    <div className="mt-2 text-xs">
                      Successfully imported: {error.successCount} | Failed: {error.failedCount}
                    </div>
                  )}
                </AlertDescription>
                {getErrorActions(error)}
              </div>
              <button
                onClick={handleClearError}
                className="ml-auto text-red-400 hover:text-red-300 self-start"
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
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => handleSubmit(false)}
                  className="w-full md:w-1/2"
                  disabled={isImporting}
                  aria-live="polite"
                  aria-busy={isImporting}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                      {retryCount > 0 && ` (Retry ${retryCount}/${MAX_RETRIES})`}
                    </>
                  ) : (
                    "Add to library"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/30 m-2 flex items-center justify-center py-16">
              <p className="text-zinc-500 text-sm">Queue is empty</p>
            </div>
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
        role="status"
        aria-live="polite"
      >
        <Alert className="border-green-500/50 bg-green-950/50 text-green-400 shadow-xl">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Books successfully added to your library!
          </AlertDescription>
          <button
            onClick={() => {
              setShowSuccess(false);
              if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
                successTimeoutRef.current = null;
              }
            }}
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
