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
      <Stack
        spacing={1}
        sx={{
          padding: "2em",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          margin: "2em 0",
        }}
      >
        <TextSearch filterType="title" />
        <AutoCompleteSearch filterType="authors" values={authors} />
        <AutoCompleteSearch filterType="subjects" values={subjects} />
      </Stack>
    </Container>
  );
};

export default Filters;
