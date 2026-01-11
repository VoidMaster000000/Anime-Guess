import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Customize your Anime Guess experience with game settings and preferences.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Settings | Anime Guess',
    description: 'Customize your game settings.',
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
