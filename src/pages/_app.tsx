import type {AppProps} from "next/app";
import "../styles/globals.css";
import Head from "next/head";
import React from "react";

export default function MyApp({Component, pageProps}: AppProps) {
    return (
        <>
            <Head>
                <title>Gallery</title>
                <link rel="shortcut icon" href="/favicon.ico" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}
