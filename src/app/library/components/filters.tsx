"use client";

import { FC } from "react";
import { Container, Stack } from "@mui/material";
import TextSearch from "./textSearch";
import AutoCompleteSearch from "./autocompleteSearch";

type FiltersProps = {
    authors: string[]
}

const Filters: FC<FiltersProps> = ({ authors }) => {
  return (
    <Container>
      <Stack spacing={1} sx={{ padding: "2em" }}>
        <TextSearch filterType="title" />
        <AutoCompleteSearch filterType="authors" values={authors} />
      </Stack>
    </Container>
  );
};

export default Filters;
