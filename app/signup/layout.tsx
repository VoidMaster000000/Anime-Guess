import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your free Anime Guess account to save progress, earn achievements, and compete globally!',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Sign Up | Anime Guess',
    description: 'Join the anime character guessing community!',
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
