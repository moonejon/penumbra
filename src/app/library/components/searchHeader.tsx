"use client";

import { FC } from "react";
import { Box, Container } from "@mui/material";
import theme from "@/theme";
import IntelligentSearch from "./intelligentSearch";

const SearchHeader: FC = () => {
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
            alignItems: "flex-start",
            px: { xs: 1, sm: 2 },
          }}
        >
          {/* Search takes up full width */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <IntelligentSearch />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SearchHeader;
