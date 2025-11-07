"use client";

import { BookType } from "@/shared.types";
import { FC, useState, useEffect } from "react";
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
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#000000",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle 600px at ${mousePosition.x}% ${mousePosition.y}%, rgba(245, 158, 11, 0.15) 0%, rgba(0, 0, 0, 0) 100%)`,
          pointerEvents: "none",
          transition: "background 0.1s ease",
          zIndex: 1,
        },
      }}
    >
      {!selectedBook ? (
        <Grid container spacing={2} sx={{ position: "relative", zIndex: 2 }}>
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
          sx={{ position: "relative", zIndex: 2 }}
        >
          <Details book={selectedBook} setSelectedBook={setSelectedBook} />
        </Box>
      )}
    </Box>
  );
};

export default Library;
