import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to Anime Guess to save your progress, compete on leaderboards, and track your stats.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Login | Anime Guess',
    description: 'Sign in to save your progress and compete on leaderboards.',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
