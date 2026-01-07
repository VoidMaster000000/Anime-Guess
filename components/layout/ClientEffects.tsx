'use client';

import dynamic from 'next/dynamic';

// Lazy load heavy visual effects - they're not critical for LCP
const CustomCursor = dynamic(() => import('@/components/layout/CustomCursor'), {
  ssr: false,
});
const BackgroundVisuals = dynamic(() => import('@/components/effects/BackgroundVisuals'), {
  ssr: false,
});

export default function ClientEffects() {
  return (
    <>
      <BackgroundVisuals />
      <CustomCursor />
    </>
  );
}
