// src/pages/_app.tsx or src/app/layout.tsx (App Router)
import type { AppProps } from 'next/app';
import '@/app/globals.css'; // ✅ not /src/index.css

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
