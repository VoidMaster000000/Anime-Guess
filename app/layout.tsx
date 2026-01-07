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

export const metadata: Metadata = {
  title: "Anime Guess - Character Guessing Game",
  description: "Test your anime knowledge! Guess characters from popular anime series and compete on the leaderboard.",
  keywords: ["anime", "game", "guessing game", "quiz", "anime characters"],
  authors: [{ name: "Anime Guess Team" }],
  openGraph: {
    title: "Anime Guess - Character Guessing Game",
    description: "Test your anime knowledge! Guess characters from popular anime series.",
    type: "website",
  },
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
