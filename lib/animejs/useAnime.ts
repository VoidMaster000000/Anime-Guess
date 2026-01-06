'use client';

import { useEffect, useRef, useCallback } from 'react';
import { animate, stagger, type AnimationParams, type TargetsParam } from './anime.esm.js';

// Re-export for convenience
export { animate, stagger };

/**
 * Hook to animate an element on mount
 */
export function useAnimeOnMount<T extends HTMLElement>(
  params: Omit<AnimationParams, 'targets'>,
  deps: any[] = []
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, params);
    }
  }, deps);

  return ref;
}

/**
 * Hook to get animate function bound to a ref
 */
export function useAnimeRef<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const runAnimation = useCallback((params: Omit<AnimationParams, 'targets'>) => {
    if (ref.current) {
      return animate(ref.current, params);
    }
    return null;
  }, []);

  return { ref, animate: runAnimation };
}

/**
 * Hook to animate multiple children with stagger
 */
export function useStaggerAnimation(
  selector: string,
  params: Omit<AnimationParams, 'targets' | 'delay'>,
  staggerValue: number = 50,
  deps: any[] = []
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(selector);
      if (elements.length > 0) {
        animate(elements, {
          ...params,
          delay: stagger(staggerValue),
        });
      }
    }
  }, deps);

  return containerRef;
}

/**
 * Animation presets for common animations
 */
export const animePresets = {
  fadeIn: {
    opacity: [0, 1],
    duration: 400,
    ease: 'outQuad',
  },
  fadeInUp: {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 500,
    ease: 'outQuad',
  },
  fadeInDown: {
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 500,
    ease: 'outQuad',
  },
  fadeInLeft: {
    opacity: [0, 1],
    translateX: [-20, 0],
    duration: 500,
    ease: 'outQuad',
  },
  fadeInRight: {
    opacity: [0, 1],
    translateX: [20, 0],
    duration: 500,
    ease: 'outQuad',
  },
  fadeOut: {
    opacity: [1, 0],
    duration: 300,
    ease: 'inQuad',
  },
  fadeOutUp: {
    opacity: [1, 0],
    translateY: [0, -20],
    duration: 300,
    ease: 'inQuad',
  },
  fadeOutDown: {
    opacity: [1, 0],
    translateY: [0, 20],
    duration: 300,
    ease: 'inQuad',
  },
  scaleIn: {
    opacity: [0, 1],
    scale: [0.9, 1],
    duration: 400,
    ease: 'outBack',
  },
  scaleOut: {
    opacity: [1, 0],
    scale: [1, 0.9],
    duration: 300,
    ease: 'inQuad',
  },
  slideInUp: {
    translateY: [100, 0],
    opacity: [0, 1],
    duration: 500,
    ease: 'outQuad',
  },
  slideInDown: {
    translateY: [-100, 0],
    opacity: [0, 1],
    duration: 500,
    ease: 'outQuad',
  },
  bounce: {
    translateY: [0, -15, 0],
    duration: 600,
    ease: 'outBounce',
  },
  pulse: {
    scale: [1, 1.05, 1],
    duration: 400,
    ease: 'inOutQuad',
  },
  shake: {
    translateX: [0, -10, 10, -10, 10, 0],
    duration: 500,
    ease: 'linear',
  },
  spin: {
    rotate: [0, 360],
    duration: 600,
    ease: 'inOutQuad',
  },
};

/**
 * Run an animation imperatively
 */
export function runAnimation(
  target: TargetsParam | null,
  preset: keyof typeof animePresets | AnimationParams
) {
  if (!target) return null;

  const params = typeof preset === 'string' ? animePresets[preset] : preset;
  return animate(target, params);
}

/**
 * Hook for hover animations
 */
export function useHoverAnimation<T extends HTMLElement>(
  hoverParams: Omit<AnimationParams, 'targets'>,
  leaveParams?: Omit<AnimationParams, 'targets'>
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => {
      animate(element, hoverParams);
    };

    const handleMouseLeave = () => {
      if (leaveParams) {
        animate(element, leaveParams);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return ref;
}

export default animate;
