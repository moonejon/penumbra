"use client";

import { FC } from "react";
import { Container, Stack } from "@mui/material";
import TextSearch from "./textSearch";
import AutoCompleteSearch from "./autocompleteSearch";

type FiltersProps = {
    authors: string[]
    subjects: string[]
}

const Filters: FC<FiltersProps> = ({ authors, subjects }) => {
  return (
    <Container>
      <Stack spacing={1} sx={{ padding: "2em" }}>
        <TextSearch filterType="title" />
        <AutoCompleteSearch filterType="authors" values={authors} />
        <AutoCompleteSearch filterType="subjects" values={subjects} />
      </Stack>
    </Container>
  );
};

export default Filters;
