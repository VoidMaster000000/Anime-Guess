'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load heavy effects to avoid blocking UI
const CustomCursor = dynamic(() => import('@/components/layout/CustomCursor'), {
  ssr: false,
});

const BackgroundVisuals = dynamic(() => import('@/components/effects/BackgroundVisuals'), {
  ssr: false,
});

export default function ClientEffects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay loading effects to let main content render first
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(() => setMounted(true));
    } else {
      timeoutHandle = setTimeout(() => setMounted(true), 100);
    }

    return () => {
      if (idleHandle !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle);
      }
    };
  }, []);

  // Only render effects after component mounts and browser is idle
  if (!mounted) return null;

  return (
    <>
      <BackgroundVisuals />
      <CustomCursor />
    </>
  );
}
