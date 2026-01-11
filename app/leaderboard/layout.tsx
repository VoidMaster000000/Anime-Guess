import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'See the top anime character guessing players! Compete for the highest streak and climb the global rankings.',
  openGraph: {
    title: 'Leaderboard | Anime Guess',
    description: 'Global rankings for the best anime character guessers.',
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
