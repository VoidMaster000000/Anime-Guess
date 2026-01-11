'use client';

import dynamic from 'next/dynamic';

// Lazy load heavy effects - ssr: false prevents hydration mismatch
// No loading state to prevent flicker - components handle their own visibility
const CustomCursor = dynamic(() => import('@/components/layout/CustomCursor'), {
  ssr: false,
  loading: () => null, // Render nothing during load to prevent flicker
});

const BackgroundVisuals = dynamic(() => import('@/components/effects/BackgroundVisuals'), {
  ssr: false,
  loading: () => null, // Render nothing during load to prevent flicker
});

export default function ClientEffects() {
  // No mounted state - dynamic imports with ssr:false handle client-only rendering
  // This prevents the flash caused by mounted=false returning null
  return (
    <>
      <BackgroundVisuals />
      <CustomCursor />
    </>
  );
}
