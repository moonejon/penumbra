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
    <Box
      sx={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0f 100%)",
        backgroundAttachment: "fixed",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
        },
      }}
    >
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
    </Box>
  );
};

export default Library;
