"use client";

import { FC } from "react";
import { Box, Container } from "@mui/material";
import theme from "@/theme";
import IntelligentSearch from "./intelligentSearch";
import FiltersDropdown from "./filtersDropdown";

type SearchHeaderProps = {
  authors: string[];
  subjects: string[];
};

const SearchHeader: FC<SearchHeaderProps> = ({ authors, subjects }) => {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: "sticky",
        top: 0,
        zIndex: 1000,
        py: { xs: 1, sm: 1.5 },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2 },
            alignItems: "center",
            px: { xs: 1, sm: 2 },
          }}
        >
          {/* Search takes up most of the space */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <IntelligentSearch />
          </Box>

          {/* Filters button on the right */}
          <Box sx={{ flexShrink: 0 }}>
            <FiltersDropdown authors={authors} subjects={subjects} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SearchHeader;
