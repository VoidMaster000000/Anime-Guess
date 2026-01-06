'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface AntiCheatState {
  tabSwitchCount: number;
  isTabVisible: boolean;
  lastSwitchTime: number | null;
  warnings: string[];
  isSuspicious: boolean;
}

interface UseAntiCheatOptions {
  maxTabSwitches?: number; // Max allowed tab switches before penalty
  onSuspiciousActivity?: (type: string, count: number) => void;
  onWarning?: (message: string) => void;
  enabled?: boolean;
}

export function useAntiCheat(options: UseAntiCheatOptions = {}) {
  const {
    maxTabSwitches = 3,
    onSuspiciousActivity,
    onWarning,
    enabled = true,
  } = options;

  const [state, setState] = useState<AntiCheatState>({
    tabSwitchCount: 0,
    isTabVisible: true,
    lastSwitchTime: null,
    warnings: [],
    isSuspicious: false,
  });

  const switchCountRef = useRef(0);
  const hasWarnedRef = useRef(false);

  // Tab visibility detection
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';

      if (!isVisible) {
        // User left the tab
        switchCountRef.current += 1;

        setState(prev => ({
          ...prev,
          tabSwitchCount: switchCountRef.current,
          isTabVisible: false,
          lastSwitchTime: Date.now(),
        }));
      } else {
        // User returned to the tab
        const switchCount = switchCountRef.current;

        setState(prev => {
          const newWarnings = [...prev.warnings];
          let isSuspicious = prev.isSuspicious;

          if (switchCount >= maxTabSwitches && !hasWarnedRef.current) {
            hasWarnedRef.current = true;
            isSuspicious = true;
            const warning = `Suspicious activity detected: ${switchCount} tab switches`;
            newWarnings.push(warning);
            onSuspiciousActivity?.('tab_switch', switchCount);
          } else if (switchCount > 0 && switchCount < maxTabSwitches) {
            const warning = `Warning: Tab switch detected (${switchCount}/${maxTabSwitches})`;
            if (!newWarnings.includes(warning)) {
              newWarnings.push(warning);
              onWarning?.(warning);
            }
          }

          return {
            ...prev,
            isTabVisible: true,
            warnings: newWarnings,
            isSuspicious,
          };
        });
      }
    };

    // Window blur/focus (catches more cases than visibility API alone)
    const handleBlur = () => {
      if (document.visibilityState === 'visible') {
        // Window lost focus but tab is still visible (e.g., dev tools, other windows)
        // This is less suspicious than full tab switch
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, maxTabSwitches, onSuspiciousActivity, onWarning]);

  // Reset function for new rounds
  const resetAntiCheat = useCallback(() => {
    switchCountRef.current = 0;
    hasWarnedRef.current = false;
    setState({
      tabSwitchCount: 0,
      isTabVisible: true,
      lastSwitchTime: null,
      warnings: [],
      isSuspicious: false,
    });
  }, []);

  // Clear a specific warning
  const clearWarning = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      warnings: prev.warnings.filter((_, i) => i !== index),
    }));
  }, []);

  // Clear all warnings
  const clearAllWarnings = useCallback(() => {
    setState(prev => ({
      ...prev,
      warnings: [],
    }));
  }, []);

  return {
    ...state,
    resetAntiCheat,
    clearWarning,
    clearAllWarnings,
  };
}

// Image distortion utilities to prevent reverse image search
export interface ImageDistortionOptions {
  hueRotation?: number; // 0-360 degrees
  saturation?: number; // 0-200%
  brightness?: number; // 0-200%
  contrast?: number; // 0-200%
  blur?: number; // 0-10px
  noise?: number; // 0-100%
  flipHorizontal?: boolean;
  cropPercent?: number; // 0-20% crop from edges
  overlayPattern?: boolean;
}

export function generateImageDistortion(): ImageDistortionOptions {
  return {
    hueRotation: Math.random() * 30 - 15, // -15 to +15 degrees
    saturation: 90 + Math.random() * 20, // 90-110%
    brightness: 95 + Math.random() * 10, // 95-105%
    contrast: 95 + Math.random() * 10, // 95-105%
    flipHorizontal: Math.random() > 0.5,
    cropPercent: 2 + Math.random() * 5, // 2-7% crop
    overlayPattern: true,
    noise: 5 + Math.random() * 10, // 5-15% noise
  };
}

export function getDistortionStyle(options: ImageDistortionOptions): React.CSSProperties {
  const filters: string[] = [];

  if (options.hueRotation) {
    filters.push(`hue-rotate(${options.hueRotation}deg)`);
  }
  if (options.saturation && options.saturation !== 100) {
    filters.push(`saturate(${options.saturation}%)`);
  }
  if (options.brightness && options.brightness !== 100) {
    filters.push(`brightness(${options.brightness}%)`);
  }
  if (options.contrast && options.contrast !== 100) {
    filters.push(`contrast(${options.contrast}%)`);
  }
  if (options.blur) {
    filters.push(`blur(${options.blur}px)`);
  }

  return {
    filter: filters.length > 0 ? filters.join(' ') : undefined,
    transform: options.flipHorizontal ? 'scaleX(-1)' : undefined,
  };
}
