import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'VIRAL LINK HUB - Netflix-Style Telegram Mini App',
  description: 'Stream, unlock and download viral movies, clips and Terabox links with real-time analytics and dynamic monetization.',
  openGraph: {
    title: 'VIRAL LINK HUB - Netflix-Style Telegram Mini App',
    description: 'Stream, unlock and download viral movies, clips and Terabox links with real-time analytics and dynamic monetization.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VIRAL LINK HUB - Netflix-Style Telegram Mini App',
    description: 'Stream, unlock and download viral movies, clips and Terabox links with real-time analytics and dynamic monetization.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[#0b0d13] text-[#e2e8f0] antialiased selection:bg-[#e50914] selection:text-white" suppressHydrationWarning>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
