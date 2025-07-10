import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {createAppTheme} from "@/themes/theme";
import {ThemeContextProvider, useThemeMode} from "@/contexts/ThemeContext";
import Head from "next/head";

const ThemedApp = ({Component, pageProps}: AppProps) => {
    const {mode} = useThemeMode();
    const theme = createAppTheme(mode);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Head>
                <title>Gallery</title>
                <link rel="shortcut icon" href="/favicon.ico" />
                <meta name="google" content="notranslate" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <Component {...pageProps} />
        </ThemeProvider>
    );
};

export default function App(props: AppProps) {
    return (
        <ThemeContextProvider>
            <ThemedApp {...props} />
        </ThemeContextProvider>
    );
}
