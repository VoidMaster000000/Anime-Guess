'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect user's reduced motion preference
 * Returns true if user prefers reduced motion (accessibility setting)
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to detect low-end device based on various heuristics
 */
export function useLowEndDevice(): boolean {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkLowEnd = () => {
      // Check hardware concurrency (CPU cores)
      const lowCores = navigator.hardwareConcurrency <= 4;

      // Check device memory (if available)
      const nav = navigator as Navigator & { deviceMemory?: number };
      const lowMemory = nav.deviceMemory ? nav.deviceMemory <= 4 : false;

      // Check if mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      // Check connection speed (if available)
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
      const slowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';

      // Consider low-end if multiple factors are true
      const factors = [lowCores, lowMemory, isMobile && lowCores, slowConnection].filter(Boolean);
      setIsLowEnd(factors.length >= 2);
    };

    checkLowEnd();
  }, []);

  return isLowEnd;
}

/**
 * Combined hook for performance mode
 * Returns true if animations should be reduced
 */
export function usePerformanceMode(): {
  reduceAnimations: boolean;
  disableParticles: boolean;
  disableBlur: boolean;
  isLowEnd: boolean;
} {
  const prefersReducedMotion = useReducedMotion();
  const isLowEnd = useLowEndDevice();

  return {
    reduceAnimations: prefersReducedMotion || isLowEnd,
    disableParticles: prefersReducedMotion || isLowEnd,
    disableBlur: isLowEnd,
    isLowEnd,
  };
}
