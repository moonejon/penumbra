"use client";

import { BookType } from "@/shared.types";
import { FC, useState } from "react";
import { Box } from "@mui/material";
import Details from "./details";
import Sidebar from "./sidebar";
import BookGrid from "./bookGrid";

type LibraryProps = {
  books: BookType[];
  authors: string[];
  subjects: string[];
  pageCount: number;
  page: number;
};

const Library: FC<LibraryProps> = ({ books, authors, subjects }) => {
  const [selectedBook, setSelectedBook] = useState<BookType>();

  return (
    <div className="min-h-screen bg-cream">
      {!selectedBook ? (
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <Sidebar authors={authors} subjects={subjects} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <BookGrid books={books} setSelectedBook={setSelectedBook} />
          </div>
        </div>
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
    </div>
  );
};

export default Library;
