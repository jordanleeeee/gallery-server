import {createTheme, PaletteMode} from "@mui/material/styles";

export const createAppTheme = (mode: PaletteMode) => {
    return createTheme({
        palette: {
            mode,
            primary: {
                main: "#1976d2",
                light: "#42a5f5",
                dark: "#1565c0",
            },
            secondary: {
                main: "#dc004e",
                light: "#ff5983",
                dark: "#9a0036",
            },
            background: {
                default: mode === "light" ? "#fafafa" : "#121212",
                paper: mode === "light" ? "#ffffff" : "#1e1e1e",
            },
            text: {
                primary: mode === "light" ? "#212121" : "#ffffff",
                secondary: mode === "light" ? "#757575" : "#b0b0b0",
            },
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontSize: "2.5rem",
                fontWeight: 300,
                lineHeight: 1.2,
            },
            h2: {
                fontSize: "2rem",
                fontWeight: 300,
                lineHeight: 1.2,
            },
            h6: {
                fontSize: "1.25rem",
                fontWeight: 500,
                lineHeight: 1.6,
            },
            body1: {
                fontSize: "1rem",
                lineHeight: 1.5,
            },
            body2: {
                fontSize: "0.875rem",
                lineHeight: 1.43,
            },
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: mode === "light" ? "0 2px 8px rgba(0,0,0,0.1)" : "0 2px 8px rgba(255,255,255,0.1)",
                        transition: "box-shadow 0.3s ease-in-out",
                        "&:hover": {
                            boxShadow: mode === "light" ? "0 4px 16px rgba(0,0,0,0.15)" : "0 4px 16px rgba(255,255,255,0.15)",
                        },
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        boxShadow: mode === "light" ? "0 2px 4px rgba(0,0,0,0.1)" : "0 2px 4px rgba(255,255,255,0.1)",
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: "none",
                        fontWeight: 500,
                    },
                },
            },
        },
    });
};

// Default light theme for backward compatibility
export const theme = createAppTheme("light");
