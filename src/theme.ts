"use client";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#faf8f5", // Warm cream
      paper: "#ffffff",
    },
    primary: {
      main: "#e07856", // Terracotta
    },
    secondary: {
      main: "#d4a574", // Warm amber
    },
    text: {
      primary: "#2d2d2d",
      secondary: "#6b6b6b",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          border: "1px solid rgba(0, 0, 0, 0.04)",
          "&:hover": {
            boxShadow: "0 12px 40px rgba(224, 120, 86, 0.15)",
            transform: "translateY(-4px)",
            borderColor: "rgba(224, 120, 86, 0.2)",
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
