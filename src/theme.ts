"use client";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#000000", // True black
      paper: "#0a0a0a",
    },
    primary: {
      main: "#f59e0b", // Warm amber/gold
    },
    secondary: {
      main: "#d97706", // Darker amber
    },
    text: {
      primary: "#fafaf9",
      secondary: "#a8a29e",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: "#0a0a0a",
          borderRadius: "12px",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.9)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: 0.6,
          "&:hover": {
            opacity: 1,
            borderColor: "#f59e0b",
            boxShadow: "0 0 60px rgba(245, 158, 11, 0.4), 0 0 100px rgba(245, 158, 11, 0.2)",
            transform: "scale(1.02)",
          },
        },
      },
    },
  },
  typography: {
    fontFamily: "var(--font-space-mono)",
  },
});

export default responsiveFontSizes(theme);
