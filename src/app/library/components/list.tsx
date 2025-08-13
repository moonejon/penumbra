"use client";

import { BookType } from "@/shared.types";
import { Dispatch, FC, SetStateAction } from "react";
import { Grid, Pagination, Stack } from "@mui/material";
import Item from "./item";
import { useRouter } from "next/navigation";

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
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default List;
