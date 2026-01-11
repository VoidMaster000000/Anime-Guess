import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo',
  description: 'Try Anime Guess without signing up! Play a demo round and test your anime character knowledge.',
  openGraph: {
    title: 'Demo | Anime Guess',
    description: 'Try the anime character guessing game for free!',
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
