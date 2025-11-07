"use client";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1c1917", // Warm off-black with brown undertones
      paper: "#292524",
    },
    primary: {
      main: "#f59e0b", // Warm amber
    },
    secondary: {
      main: "#84cc16", // Sage green
    },
    text: {
      primary: "#fafaf9",
      secondary: "#d6d3d1",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: "#292524",
          borderRadius: "8px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
          "&:hover": {
            transform: "perspective(1000px) rotateX(2deg) rotateY(2deg) translateY(-8px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
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
