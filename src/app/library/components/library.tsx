"use client";

import { BookType } from "@/shared.types";
import { FC, useState } from "react";
import List from "./list";
import { Box, Container } from "@mui/material";
import Details from "./details";
import SearchHeader from "./searchHeader";

type LibraryProps = {
  books: BookType[];
  authors: string[];
  subjects: string[];
  pageCount: number;
  page: number;
};

const Library: FC<LibraryProps> = ({
  books,
  authors,
  subjects,
  pageCount,
  page,
}) => {
  const [selectedBook, setSelectedBook] = useState<BookType>();

  return (
    <>
      {!selectedBook ? (
        <>
          <SearchHeader authors={authors} subjects={subjects} />
          <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3 } }}>
            <List
              rows={books}
              setSelectedBook={setSelectedBook}
              page={page}
              pageCount={pageCount}
            />
          </Container>
        </>
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
