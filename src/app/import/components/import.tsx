"use client";
import { FC, useState } from "react";
import { Box, Stack, useMediaQuery } from "@mui/material";
import { BookImportDataType } from "@/shared.types";
import Preview from "./preview";
import Queue from "./queue";
import Search from "./search";
import theme from "@/theme";

type ImportProps = object;

export const initialBookImportData = {
  title: "",
  authors: [],
  image: "",
  imageOriginal: "",
  publisher: "",
  synopsis: "",
  pageCount: 0,
  datePublished: "",
  subjects: [],
  isbn10: "",
  isbn13: "",
  binding: "",
  language: "",
  titleLong: "",
  edition: "",
};

// eslint-disable-next-line no-empty-pattern
const Import: FC<ImportProps> = ({}) => {
  const [bookData, setBookData] = useState<BookImportDataType>(
    initialBookImportData,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [importQueue, setImportQueue] = useState<Array<BookImportDataType>>([]);

  const isMobile: boolean = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Stack direction={isMobile ? "column" : "row"}>
      <Box sx={{ width: { xs: "100%", md: "50%" } }}>
        <Search setBookData={setBookData} setLoading={setLoading} />
        <Preview
          book={bookData}
          setBookData={setBookData}
          loading={loading}
          importQueue={importQueue}
          setImportQueue={setImportQueue}
        />
      </Box>
      <Box sx={{ width: { xs: "100%", md: "50%" } }}>
        <Queue books={importQueue} setBooks={setImportQueue} />
      </Box>
    </Stack>
  );
};

export default Import;
