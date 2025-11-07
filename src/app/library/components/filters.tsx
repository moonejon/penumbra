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
          background: "#292524",
          borderRadius: "8px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          margin: "2em 0",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "100%",
            background: "linear-gradient(180deg, #f59e0b, #84cc16)",
            borderRadius: "8px 0 0 8px",
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
