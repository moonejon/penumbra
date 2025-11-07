"use client";

import { BookType } from "@/shared.types";
import { FC, useState } from "react";
import { Box } from "@mui/material";
import Details from "./details";
import Constellation from "./constellation";

type LibraryProps = {
  books: BookType[];
  authors: string[];
  subjects: string[];
  pageCount: number;
  page: number;
};

const Library: FC<LibraryProps> = ({
  books,
}) => {
  const [selectedBook, setSelectedBook] = useState<BookType>();

  return (
    <>
      {!selectedBook ? (
        <Constellation books={books} onBookSelect={setSelectedBook} />
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          minWidth="100vw"
          flexDirection="column"
          sx={{
            background: "#2d2d2d",
          }}
        >
          <Details book={selectedBook} setSelectedBook={setSelectedBook} />
        </Box>
      )}
    </>
  );
};

export default Library;
