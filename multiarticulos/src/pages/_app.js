import Head from "next/head";
import { Oswald } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";

const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

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
      <AuthProvider>
        <div className={display.variable}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </>
  );
}
