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
              background: "#0a0a0a",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#a8a29e",
              opacity: 0.7,
              transition: "all 0.3s ease",
              "&:hover": {
                opacity: 1,
                background: "#1a1a1a",
                borderColor: "#f59e0b",
                boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)",
              },
              "&.Mui-selected": {
                opacity: 1,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#000",
                borderColor: "#f59e0b",
                fontWeight: "bold",
                boxShadow: "0 0 30px rgba(245, 158, 11, 0.5)",
                "&:hover": {
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
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
