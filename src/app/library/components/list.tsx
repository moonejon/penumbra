"use client";

import { BookType } from "@/shared.types";
import { Dispatch, FC, SetStateAction } from "react";
import { Box, Pagination, Stack, useMediaQuery } from "@mui/material";
import Item from "./item";
import { useRouter, useSearchParams } from "next/navigation";
import theme from "@/theme";

type ListProps = {
  rows: BookType[];
  page: number;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
  pageCount: number;
};

const List: FC<ListProps> = ({ rows, page, setSelectedBook, pageCount }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (_: unknown, page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`library/?${params.toString()}`);
  };

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Stack spacing={1} sx={{ padding: "2em" }}>
      {/* <Search /> */}
      {rows?.map((book, i) => (
        <Item book={book} key={i} setSelectedBook={setSelectedBook} />
      ))}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Pagination
          variant="outlined"
          size={isMobile ? "small" : "large"}
          shape="rounded"
          count={pageCount}
          page={page}
          sx={{
            button: {
              background: theme.palette.background.default,
            },
          }}
          onChange={handlePageChange}
        />
      </Box>
    </Stack>
  );
};

export default List;
