import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'View and manage your collected items, power-ups, and upgrades in Anime Guess.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Inventory | Anime Guess',
    description: 'Your collected items and power-ups.',
  },
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
