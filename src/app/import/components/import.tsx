"use client";
import { FC, useState } from "react";
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

  const isMobile: boolean = useMediaQuery("(max-width: 768px)");

  return (
    <div className={`flex ${isMobile ? "flex-col" : "flex-row"}`}>
      <div className="w-full md:w-1/2">
        <Search setBookData={setBookData} setLoading={setLoading} />
        <Preview
          book={bookData}
          setBookData={setBookData}
          loading={loading}
          importQueue={importQueue}
          setImportQueue={setImportQueue}
        />
      </div>
      <div className="w-full md:w-1/2">
        <Queue books={importQueue} setBooks={setImportQueue} />
      </div>
    </div>
  );
};

export default Import;
