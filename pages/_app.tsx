import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { Inter, JetBrains_Mono, Outfit } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <div className={`${inter.variable} ${jetbrainsMono.variable} ${outfit.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
}

export default MyApp; 