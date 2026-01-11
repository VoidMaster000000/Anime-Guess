import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'View your Anime Guess profile, stats, achievements, and game history.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Profile | Anime Guess',
    description: 'Your Anime Guess profile and stats.',
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
