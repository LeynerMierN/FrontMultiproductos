import Head from "next/head";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Vestiq — Tu tienda en un solo lugar</title>
        <meta
          name="description"
          content="Vestiq · Catálogo y carrito con Next.js + Firebase"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
