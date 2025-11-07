"use client";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0a0a0f",
      paper: "rgba(255, 255, 255, 0.05)",
    },
    primary: {
      main: "#667eea",
    },
    secondary: {
      main: "#64b5f6",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          transition: "all 0.3s ease-out",
          "&:hover": {
            backdropFilter: "blur(30px)",
            background: "rgba(255, 255, 255, 0.08)",
            boxShadow: "0 8px 32px rgba(100, 150, 255, 0.15)",
            transform: "translateY(-4px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
  typography: {
    fontFamily: "var(--font-space-mono)",
  },
});

export default responsiveFontSizes(theme);
