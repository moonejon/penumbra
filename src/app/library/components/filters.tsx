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
          background: "#161b22",
          border: "2px solid #00ffff",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
          margin: "2em 0",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-2px",
            left: "-2px",
            right: "-2px",
            bottom: "-2px",
            background: "linear-gradient(45deg, #00ffff, #ff00ff, #00ffff)",
            backgroundSize: "200% 200%",
            animation: "borderGlow 3s ease infinite",
            opacity: 0.5,
            zIndex: -1,
          },
          "@keyframes borderGlow": {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" },
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
