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
              background: "#161b22",
              border: "2px solid #00ffff",
              borderRadius: "0px",
              color: "#00ffff",
              fontWeight: "bold",
              boxShadow: "0 0 10px rgba(0, 255, 255, 0.3)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "#1c2128",
                borderColor: "#ff00ff",
                color: "#ff00ff",
                boxShadow: "0 0 20px rgba(255, 0, 255, 0.5)",
              },
              "&.Mui-selected": {
                background: "#00ffff",
                color: "#0d1117",
                borderColor: "#00ffff",
                boxShadow: "0 0 30px rgba(0, 255, 255, 0.8)",
                "&:hover": {
                  background: "#00ffff",
                  color: "#0d1117",
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
