import React, {createContext, useContext, useEffect, useState} from "react";
import {PaletteMode} from "@mui/material/styles";

interface ThemeContextType {
    mode: PaletteMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemeMode must be used within a ThemeProvider");
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeProviderProps> = ({children}) => {
    const [mode, setMode] = useState<PaletteMode>("light");

    useEffect(() => {
        // Load theme from localStorage on mount
        const savedMode = localStorage.getItem("themeMode") as PaletteMode;
        if (savedMode && (savedMode === "light" || savedMode === "dark")) {
            setMode(savedMode);
        }
    }, []);

    const toggleTheme = () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        localStorage.setItem("themeMode", newMode);
    };

    return <ThemeContext.Provider value={{mode, toggleTheme}}>{children}</ThemeContext.Provider>;
};
