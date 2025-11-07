"use client";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0d1117",
      paper: "#161b22",
    },
    primary: {
      main: "#00ffff", // Cyan
    },
    secondary: {
      main: "#ff00ff", // Magenta
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: "#161b22",
          border: "2px solid #00ffff",
          borderRadius: "0px",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
          position: "relative",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(45deg, transparent 48%, rgba(0, 255, 255, 0.1) 49%, rgba(0, 255, 255, 0.1) 51%, transparent 52%)",
            backgroundSize: "20px 20px",
            opacity: 0,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          },
          "&:hover": {
            borderColor: "#ff00ff",
            boxShadow: "0 0 30px rgba(255, 0, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.3)",
            transform: "translateY(-2px)",
            "&::before": {
              opacity: 1,
            },
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
