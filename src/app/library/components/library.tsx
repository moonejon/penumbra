"use client";

import { BookType } from "@/shared.types";
import { FC, useState } from "react";
import List from "./list";
import { Box } from "@mui/material";
import Details from "./details";

type LibraryProps = {
  books: BookType[];
  pageCount: number;
  page: number;
};

const Library: FC<LibraryProps> = ({ books, pageCount, page }) => {
  const [selectedBook, setSelectedBook] = useState<BookType | undefined>();

  return (
    <>
      {!selectedBook ? (
          <List
            rows={books}
            setSelectedBook={setSelectedBook}
            page={page}
            pageCount={pageCount}
          />
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          minWidth="100vw"
          flexDirection="column"
        >
          <Details book={selectedBook} setSelectedBook={setSelectedBook} />
        </Box>
      )}
    </>
  );
};

export default Library;
