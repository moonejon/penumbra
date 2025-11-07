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

  const isMobile: boolean = useMediaQuery(theme.breakpoints.down("sm"));

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
              background: "#292524",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#d6d3d1",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "#3c3835",
                borderColor: "#f59e0b",
                boxShadow: "0 6px 20px rgba(245, 158, 11, 0.2)",
              },
              "&.Mui-selected": {
                background: "#f59e0b",
                color: "#1c1917",
                borderColor: "#f59e0b",
                fontWeight: "bold",
                boxShadow: "0 8px 24px rgba(245, 158, 11, 0.4)",
                "&:hover": {
                  background: "#d97706",
                },
              },
            },
          }}
          onChange={handlePageChange}
        />
      </Box>
    </Stack>
  );
};

export default List;
