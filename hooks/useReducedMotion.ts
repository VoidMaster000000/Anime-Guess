'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';

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
 * Uses stable detection that doesn't cause re-renders
 */
export function useLowEndDevice(): boolean {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

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
      setIsChecked(true);
    };

    checkLowEnd();
  }, []);

  return isLowEnd;
}

/**
 * Combined hook for performance mode
 * Returns consistent values to prevent flickering
 */
export function usePerformanceMode(): {
  reduceAnimations: boolean;
  disableParticles: boolean;
  disableBlur: boolean;
  isLowEnd: boolean;
  isReady: boolean;
} {
  const prefersReducedMotion = useReducedMotion();
  const isLowEnd = useLowEndDevice();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure consistent hydration
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return {
    reduceAnimations: prefersReducedMotion || isLowEnd,
    disableParticles: prefersReducedMotion || isLowEnd,
    disableBlur: isLowEnd,
    isLowEnd,
    isReady,
  };
}
