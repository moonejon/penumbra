"use client";

import { BookType } from "@/shared.types";
import { FC, useState } from "react";
import List from "./list";
import { Box, Grid } from "@mui/material";
import Details from "./details";
import Filters from "./filters";

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
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }} order={{ xs: 1, md: 1 }}>
            <Filters authors={authors} subjects={subjects} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }} order={{ xs: 2, md: 2 }}>
            <List
              rows={books}
              setSelectedBook={setSelectedBook}
              page={page}
              pageCount={pageCount}
            />
          </Grid>
        </Grid>
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
