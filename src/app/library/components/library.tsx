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
        background: "#0d1117",
        position: "relative",
        overflow: "hidden",
        // Grid lines background
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        // Animated scan line
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, #00ffff, transparent)",
          animation: "scanline 4s linear infinite",
          zIndex: 10,
          pointerEvents: "none",
        },
        "@keyframes scanline": {
          "0%": {
            transform: "translateY(0)",
          },
          "100%": {
            transform: "translateY(100vh)",
          },
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
