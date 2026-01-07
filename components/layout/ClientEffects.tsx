'use client';

import { useEffect, useState } from 'react';
import CustomCursor from '@/components/layout/CustomCursor';
import BackgroundVisuals from '@/components/effects/BackgroundVisuals';

export default function ClientEffects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render effects after component mounts on client
  if (!mounted) return null;

  return (
    <>
      <BackgroundVisuals />
      <CustomCursor />
    </>
  );
}
