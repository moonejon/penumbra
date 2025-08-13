"use client";

import { BookType } from "@/shared.types";
import { Dispatch, FC, SetStateAction } from "react";
import { Grid, Pagination, Stack } from "@mui/material";
import Item from "./item";
import { useRouter } from "next/navigation";
import theme from "@/theme";

type ListProps = {
  rows: BookType[];
  page: number;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
  pageCount: number;
};

const List: FC<ListProps> = ({ rows, page, setSelectedBook, pageCount }) => {
  const router = useRouter();

  const handlePageChange = (_: unknown, page: number) => {
    router.push(`library/?page=${page}`);
  };

  return (
    <Grid container spacing={2}>
      <Grid size={4}></Grid>
      <Grid size={8}>
        <Stack spacing={1} sx={{ padding: "2em" }}>
          {rows?.map((book, i) => (
            <Item book={book} key={i} setSelectedBook={setSelectedBook} />
          ))}
          <span style={{ width: '100%', alignContent: "center" }}>
            <Pagination
              variant="outlined"
              size="large"
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
          </span>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default List;
