import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>BNB RiskLens - Transparent Token Risk Evaluation</title>
        <meta name="description" content="Evaluate token risk on BNB Chain using deterministic, transparent rules" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
