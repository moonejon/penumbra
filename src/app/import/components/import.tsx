"use client";
import { FC, useState, useRef } from "react";
import { BookImportDataType } from "@/shared.types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Preview from "./preview";
import Queue from "./queue";
import Search from "./search";

type ImportProps = object;

export const initialBookImportData = {
  title: "",
  authors: [],
  image: "",
  imageOriginal: "",
  publisher: "",
  synopsis: "",
  pageCount: 0,
  datePublished: "",
  subjects: [],
  isbn10: "",
  isbn13: "",
  binding: "",
  language: "",
  titleLong: "",
  edition: "",
};

// eslint-disable-next-line no-empty-pattern
const Import: FC<ImportProps> = ({}) => {
  const [bookData, setBookData] = useState<BookImportDataType>(
    initialBookImportData,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [importQueue, setImportQueue] = useState<Array<BookImportDataType>>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Store the last ISBN searched for retry functionality
  const lastSearchedISBN = useRef<string>("");

  const isMobile: boolean = useMediaQuery("(max-width: 768px)");

  const handleRetry = () => {
    // Clear the error state
    setSearchError(null);

    // If we have a last searched ISBN, trigger a new search
    // This is handled by the Search component through its form submission
    // We just need to clear the error state here
    if (lastSearchedISBN.current) {
      // The user will need to resubmit the form
      // Alternatively, we could expose the search function from Search component
      console.log("Retry requested for ISBN:", lastSearchedISBN.current);
    }
  };

  return (
    <div className={`flex ${isMobile ? "flex-col" : "flex-row gap-6"} px-6 md:px-12`}>
      <div className="w-full md:w-1/2">
        <Search
          setBookData={setBookData}
          setLoading={setLoading}
          setError={setSearchError}
        />
        <Preview
          book={bookData}
          setBookData={setBookData}
          loading={loading}
          importQueue={importQueue}
          setImportQueue={setImportQueue}
          error={searchError}
          onRetry={handleRetry}
        />
      </div>
      <div className="w-full md:w-1/2">
        <Queue books={importQueue} setBooks={setImportQueue} />
      </div>
    </div>
  );
};

export default Import;
