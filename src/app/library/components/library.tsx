"use client";

import { BookType } from "@/shared.types";
import { FC, useState } from "react";
import List from "./list";
import { Box, Container, Typography, Button } from "@mui/material";
import Details from "./details";
import SearchHeader from "./searchHeader";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { useRouter, useSearchParams } from "next/navigation";

type LibraryProps = {
  books: BookType[];
  pageCount: number;
  page: number;
  isLoading?: boolean;
};

const Library: FC<LibraryProps> = ({
  books,
  pageCount,
  page,
  isLoading = false,
}) => {
  const [selectedBook, setSelectedBook] = useState<BookType>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasActiveFilters = !!(
    searchParams.get("title") ||
    searchParams.get("authors") ||
    searchParams.get("subjects")
  );

  const handleClearFilters = () => {
    router.push("/library");
  };

  const handleImportBooks = () => {
    router.push("/import");
  };

  // Empty state for no search results
  const EmptySearchState = () => (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        px: 2,
      }}
    >
      <SearchOffIcon
        sx={{
          fontSize: 80,
          color: "text.secondary",
          mb: 2,
          opacity: 0.5,
        }}
      />
      <Typography variant="h5" gutterBottom fontWeight={600}>
        No books match your search
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: "auto" }}>
        Try adjusting your search terms or clear your filters to see all books in your library.
      </Typography>
      <Button
        variant="outlined"
        onClick={handleClearFilters}
        size="large"
      >
        Clear Filters
      </Button>
    </Box>
  );

  // Empty state for no books in library
  const EmptyLibraryState = () => (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        px: 2,
      }}
    >
      <LibraryBooksIcon
        sx={{
          fontSize: 80,
          color: "text.secondary",
          mb: 2,
          opacity: 0.5,
        }}
      />
      <Typography variant="h5" gutterBottom fontWeight={600}>
        No books yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: "auto" }}>
        Start building your library by importing your first book.
      </Typography>
      <Button
        variant="contained"
        onClick={handleImportBooks}
        size="large"
      >
        Add Your First Book
      </Button>
    </Box>
  );

  const showEmptyState = !isLoading && books.length === 0;

  return (
    <>
      {!selectedBook ? (
        <>
          <SearchHeader />
          <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3 } }}>
            {showEmptyState ? (
              hasActiveFilters ? (
                <EmptySearchState />
              ) : (
                <EmptyLibraryState />
              )
            ) : (
              <List
                rows={books}
                setSelectedBook={setSelectedBook}
                page={page}
                pageCount={pageCount}
                isLoading={isLoading}
              />
            )}
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
