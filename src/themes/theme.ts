import {createTheme} from "@mui/material/styles";

export const theme = createTheme({
    palette: {
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
            default: "#fafafa",
            paper: "#ffffff",
        },
        text: {
            primary: "#212121",
            secondary: "#757575",
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
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "box-shadow 0.3s ease-in-out",
                    "&:hover": {
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
