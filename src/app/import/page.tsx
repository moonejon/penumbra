"use client";
import { FC, useState } from "react";
import { Box } from "@mui/material";
import { BookType } from "@/shared.types";
import Book from "../components/book";
import Queue from "../components/queue";
import Search from "../components/search";

type ImportProps = object;

export const initialBookData = {
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
  const [bookData, setBookData] = useState<BookType>(initialBookData);
  const [importQueue, setImportQueue] = useState<Array<BookType>>([]);

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
        <Book
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
