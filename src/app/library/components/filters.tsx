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
          background: "#0a0a0a",
          borderRadius: "12px",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          boxShadow: "0 0 40px rgba(245, 158, 11, 0.2)",
          margin: "2em 0",
          opacity: 0.8,
          transition: "all 0.3s ease",
          "&:hover": {
            opacity: 1,
            boxShadow: "0 0 60px rgba(245, 158, 11, 0.3)",
          },
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
