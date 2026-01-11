'use client';

import { useRef, useSyncExternalStore } from 'react';

// Helper for SSR-safe media query
function getServerSnapshot() {
  return false;
}

/**
 * Hook to detect user's reduced motion preference
 * Returns true if user prefers reduced motion (accessibility setting)
 */
export function useReducedMotion(): boolean {
  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') return () => {};
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  };

  const getSnapshot = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook to detect low-end device based on various heuristics
 * Uses ref to avoid re-renders and prevent flickering
 */
export function useLowEndDevice(): boolean {
  // Use refs to store the result - checked synchronously to prevent flicker
  const checkedRef = useRef(false);
  const resultRef = useRef(false);

  // Check synchronously on first render (client-side only)
  if (typeof window !== 'undefined' && !checkedRef.current) {
    checkedRef.current = true;

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
    resultRef.current = factors.length >= 2;
  }

  return resultRef.current;
}

/**
 * Combined hook for performance mode
 * Returns consistent values - no delay needed since we use CSS visibility
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
