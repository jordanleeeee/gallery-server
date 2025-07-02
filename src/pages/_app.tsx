import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {theme} from "@/themes/theme";
import Head from "next/head";

export default function App({Component, pageProps}: AppProps) {
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
}
