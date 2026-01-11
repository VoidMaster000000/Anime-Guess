'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load heavy effects - ssr: false prevents hydration mismatch
const CustomCursor = dynamic(() => import('@/components/layout/CustomCursor'), {
  ssr: false,
});

const BackgroundVisuals = dynamic(() => import('@/components/effects/BackgroundVisuals'), {
  ssr: false,
});

export default function ClientEffects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mount immediately on client
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <BackgroundVisuals />
      <CustomCursor />
    </>
  );
}
