"use client";

import { FC } from "react";
import { Box, Stack, Typography } from "@mui/material";
import TextSearch from "./textSearch";
import AutoCompleteSearch from "./autocompleteSearch";

type FiltersProps = {
  authors: string[];
  subjects: string[];
};

const Filters: FC<FiltersProps> = ({ authors, subjects }) => {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 20,
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(0, 0, 0, 0.04)",
        p: 3,
        ml: { xs: 2, md: 4 },
        mr: { xs: 2, md: 2 },
        mt: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 2,
          color: "primary.main",
        }}
      >
        Filters
      </Typography>
      <Stack spacing={2}>
        <TextSearch filterType="title" />
        <AutoCompleteSearch filterType="authors" values={authors} />
        <AutoCompleteSearch filterType="subjects" values={subjects} />
      </Stack>
    </Box>
  );
};

export default Filters;
