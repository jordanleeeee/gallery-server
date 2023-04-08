import type {AppProps} from "next/app";
import "../styles/globals.css";
import Head from "next/head";

export default function MyApp({Component, pageProps}: AppProps) {
    return (
        <>
            <Head>
                <title>Gallery</title>
                <link rel="shortcut icon" href="/favicon.ico"/>
                <meta name="google" content="notranslate"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </Head>
            <Component {...pageProps} />
        </>
    );
}
