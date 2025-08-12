"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    // MuiCard: {
    //   backgroundColor: 
    // }
  },
  typography: {
    fontFamily: "var(--font-space-mono)",
  },
});

export default theme;
