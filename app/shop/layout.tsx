import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Purchase power-ups, hints, and upgrades to boost your anime guessing game. Spend coins earned from correct guesses!',
  openGraph: {
    title: 'Shop | Anime Guess',
    description: 'Get power-ups and upgrades for your anime character guessing adventure.',
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
