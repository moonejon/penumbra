"use client"
import { FC, useState } from "react";
import { Box } from "@mui/material";
import { BookImportDataType } from "@/shared.types";
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
  const [bookData, setBookData] = useState<BookImportDataType>(initialBookImportData);
  const [importQueue, setImportQueue] = useState<Array<BookImportDataType>>([]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
      }}
    >
      <Box sx={{ width: "50%" }}>
        <Search setBookData={setBookData} />
        <Preview
          book={bookData}
          setBookData={setBookData}
          importQueue={importQueue}
          setImportQueue={setImportQueue}
        />
      </Box>
      <Box sx={{ width: "50%" }}>
        <Queue books={importQueue} setBooks={setImportQueue} />
      </Box>
    </div>
  );
};

export default Import;