"use client";

import { Dispatch, FC, SetStateAction, useEffect, useState, useRef } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { BookImportDataType } from "@/shared.types";
import { fetchMetadata } from "../../../utils/actions/isbndb/fetchMetadata";
import { initialBookImportData } from "./import";
import { checkRecordExists } from "@/utils/actions/books";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchProps = {
  setBookData: Dispatch<SetStateAction<BookImportDataType>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
};

type Inputs = {
  isbn: string;
};

type SearchError = {
  type: "validation" | "not_found" | "network" | "timeout" | "api_error" | "unknown";
  message: string;
};

const SEARCH_TIMEOUT = 10000; // 10 seconds

const Search: FC<SearchProps> = ({ setBookData, setLoading, setError }) => {
  const { control, reset, handleSubmit, formState } = useForm<Inputs>({
    defaultValues: { isbn: "" },
  });

  const [localError, setLocalError] = useState<SearchError | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clear local error when typing
  const handleInputChange = (onChange: (...event: unknown[]) => void) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalError(null);
      setError(null);
      onChange(e);
    };
  };

  const validateISBN = (isbn: string): SearchError | null => {
    // Remove any spaces or hyphens
    const cleanISBN = isbn.replace(/[\s-]/g, "");

    if (!cleanISBN) {
      return {
        type: "validation",
        message: "ISBN is required",
      };
    }

    // Check if it's numeric
    if (!/^\d+$/.test(cleanISBN)) {
      return {
        type: "validation",
        message: "ISBN must contain only numbers",
      };
    }

    // Check length (ISBN-10 or ISBN-13)
    if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
      return {
        type: "validation",
        message: "ISBN must be either 10 or 13 digits",
      };
    }

    return null;
  };

  const checkForDuplicates = async (isbn13: string) => {
    return await checkRecordExists(isbn13);
  };

  const requiredFields: string[] = [
    "title",
    "image",
    "image_original",
    "publisher",
    "synopsis",
    "pages",
    "date_published",
    "authors",
    "subjects",
    "isbn10",
    "isbn13",
    "binding",
    "language",
    "title_long",
  ];

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    // Prevent multiple simultaneous searches
    if (isSearching) {
      return;
    }

    // Clear previous errors
    setLocalError(null);
    setError(null);

    // Validate ISBN
    const validationError = validateISBN(data.isbn);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    // Clean the ISBN
    const cleanISBN = data.isbn.replace(/[\s-]/g, "");

    setIsSearching(true);
    setLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setLocalError({
        type: "timeout",
        message: "Search timed out. Please check your connection and try again.",
      });
      setIsSearching(false);
      setLoading(false);
    }, SEARCH_TIMEOUT);

    try {
      const value = await fetchMetadata(cleanISBN);

      // Clear timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const { book } = value;

      // Check if book data was returned
      if (!book) {
        setLocalError({
          type: "not_found",
          message: "No book found for this ISBN. Please verify the number and try again.",
        });
        setIsSearching(false);
        setLoading(false);
        return;
      }

      const isIncomplete: boolean = requiredFields.some((field) => {
        const value = book[field];

        if (value == null || value === "") return true;

        if (Array.isArray(value) && value.length === 0) return true;

        return false;
      });

      const isDuplicate: boolean = await checkForDuplicates(book.isbn13);

      setBookData({
        title: book.title,
        authors: book.authors,
        image: book.image,
        imageOriginal: book.image_original,
        publisher: book.publisher,
        synopsis: book.synopsis,
        pageCount: book.pages,
        datePublished: book.date_published,
        subjects: book.subjects,
        isbn10: book.isbn10,
        isbn13: book.isbn13,
        binding: book.binding,
        language: book.language,
        titleLong: book.title_long,
        edition: book.edition || initialBookImportData.edition,
        isIncomplete: isIncomplete,
        isDuplicate: isDuplicate,
      });

      setIsSearching(false);
      setLoading(false);
    } catch (err) {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Handle abort (timeout already set error)
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      // Determine error type
      let error: SearchError;

      if (err instanceof Error) {
        if (err.message.includes("404")) {
          error = {
            type: "not_found",
            message: "Book not found. Please verify the ISBN and try again.",
          };
        } else if (err.message.includes("401") || err.message.includes("403")) {
          error = {
            type: "api_error",
            message: "Authentication error. Please contact support.",
          };
        } else if (err.message.includes("429")) {
          error = {
            type: "api_error",
            message: "Too many requests. Please wait a moment and try again.",
          };
        } else if (err.message.toLowerCase().includes("fetch") || err.message.toLowerCase().includes("network")) {
          error = {
            type: "network",
            message: "Network error. Please check your connection and try again.",
          };
        } else {
          error = {
            type: "unknown",
            message: "An unexpected error occurred. Please try again.",
          };
        }
      } else {
        error = {
          type: "unknown",
          message: "An unexpected error occurred. Please try again.",
        };
      }

      setLocalError(error);
      console.error("Search error:", err);
      setIsSearching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formState.isSubmitSuccessful && !localError) {
      reset({ isbn: "" });
    }
  }, [formState, reset, localError]);

  return (
    <div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12">
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Search
          </h2>

          {localError && (
            <Alert className="border-red-500/50 bg-red-950/50 text-red-400 animate-in fade-in duration-300">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-300 font-medium mb-1">
                {localError.type === "validation" && "Invalid ISBN"}
                {localError.type === "not_found" && "Book Not Found"}
                {localError.type === "network" && "Connection Error"}
                {localError.type === "timeout" && "Request Timeout"}
                {localError.type === "api_error" && "API Error"}
                {localError.type === "unknown" && "Error"}
              </AlertTitle>
              <AlertDescription className="text-red-200/90 text-sm leading-relaxed flex items-start justify-between gap-2">
                <span className="flex-1">{localError.message}</span>
                <button
                  onClick={() => setLocalError(null)}
                  className="text-red-400 hover:text-red-300 transition-colors shrink-0"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </AlertDescription>
            </Alert>
          )}

          <form
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="isbn"
              control={control}
              render={({ field }) => (
                <input
                  id="isbn-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter ISBN number"
                  {...field}
                  onChange={handleInputChange(field.onChange)}
                  disabled={isSearching}
                  className={cn(
                    "w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700 transition-all duration-200",
                    isSearching && "opacity-50 cursor-not-allowed",
                    localError && "border-red-500/50 focus:ring-red-500/50"
                  )}
                />
              )}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSearching}
                className={cn(
                  "px-6 py-2.5 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-all duration-200 font-medium text-sm flex items-center gap-2",
                  isSearching && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Search;
