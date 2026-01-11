import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CustomContextMenu from "@/components/layout/CustomContextMenu";
import ClientEffects from "@/components/layout/ClientEffects";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://anime-guess.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Anime Guess - Character Guessing Game",
    template: "%s | Anime Guess",
  },
  description: "Test your anime knowledge! Guess characters from popular anime series and compete on the global leaderboard. Play now for free!",
  keywords: ["anime", "game", "guessing game", "quiz", "anime characters", "anime quiz", "character quiz", "otaku", "manga", "anime trivia"],
  authors: [{ name: "Anime Guess Team" }],
  creator: "Anime Guess Team",
  publisher: "Anime Guess",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Anime Guess - Character Guessing Game",
    description: "Test your anime knowledge! Guess characters from popular anime series and compete on the leaderboard.",
    url: baseUrl,
    siteName: "Anime Guess",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Anime Guess - Character Guessing Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Anime Guess - Character Guessing Game",
    description: "Test your anime knowledge! Guess characters from popular anime series.",
    images: ['/og-image.png'],
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: baseUrl,
  },
  category: 'games',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preload critical fonts to reduce LCP */}
        <link
          rel="preload"
          href="/fonts/altron.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/nasalization.otf"
          as="font"
          type="font/opentype"
          crossOrigin="anonymous"
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Anime Guess',
              description: 'Test your anime knowledge! Guess characters from popular anime series and compete on the global leaderboard.',
              url: baseUrl,
              applicationCategory: 'GameApplication',
              genre: 'Quiz',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '150',
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-bg-primary text-text-primary`}
      >
        <Providers>
          <ClientEffects />
          <CustomContextMenu />
          <div className="flex flex-col min-h-screen relative z-10">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
