import '../styles/globals.css';
import { SessionProvider } from "next-auth/react";
import Head from 'next/head';
import Layout from '../components/Layout';
import { SupermarketProvider } from '../context/SupermarketContext';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <SupermarketProvider>
        <Head>
          <title>Guia de Mercado</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
          <meta name="theme-color" content="#0f172a" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SupermarketProvider>
    </SessionProvider>
  );
}

export default MyApp;
