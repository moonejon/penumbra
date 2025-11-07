"use client";

import { BookType } from "@/shared.types";
import { Dispatch, FC, SetStateAction } from "react";
import { Box, useMediaQuery } from "@mui/material";
import ShelfCard from "./shelfCard";
import theme from "@/theme";

type ShelfGridProps = {
  books: BookType[];
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
};

const ShelfGrid: FC<ShelfGridProps> = ({ books, setSelectedBook }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Determine column count based on screen size
  const columns = isMobile ? 1 : isTablet ? 2 : 4;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: { xs: 2, sm: 3, md: 4 },
        width: "100%",
        px: { xs: 2, sm: 3, md: 4 },
        py: 3,
      }}
    >
      {books.map((book, index) => (
        <Box key={book.id || index}>
          <ShelfCard book={book} setSelectedBook={setSelectedBook} />
        </Box>
      ))}
    </Box>
  );
};

export default ShelfGrid;
