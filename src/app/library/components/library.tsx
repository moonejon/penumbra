"use client";

import { BookType } from "@/shared.types";
import { FC, useState } from "react";
import { Box, Grid } from "@mui/material";
import Details from "./details";
import Filters from "./filters";
import ShelfGrid from "./shelfGrid";

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
}) => {
  const [selectedBook, setSelectedBook] = useState<BookType>();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#faf8f5",
      }}
    >
      {!selectedBook ? (
        <Grid container>
          <Grid size={{ xs: 12, md: 3 }}>
            <Filters authors={authors} subjects={subjects} />
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <ShelfGrid books={books} setSelectedBook={setSelectedBook} />
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
    </Box>
  );
};

export default Library;
