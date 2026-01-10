'use client';

import gsap from 'gsap';

// ============================================================================
// GSAP UTILITY FUNCTIONS - FAST ANIMATIONS
// ============================================================================

/**
 * Fade in animation
 */
export const fadeIn = (
  element: gsap.TweenTarget,
  options: {
    duration?: number;
    delay?: number;
    y?: number;
    x?: number;
    scale?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const { duration = 0.15, delay = 0, y = 10, x = 0, scale = 1, ease = 'power2.out', onComplete } = options;

  return gsap.fromTo(
    element,
    { opacity: 0, y, x, scale: scale === 1 ? 1 : 0.95 },
    { opacity: 1, y: 0, x: 0, scale: 1, duration, delay, ease, onComplete }
  );
};

/**
 * Fade out animation
 */
export const fadeOut = (
  element: gsap.TweenTarget,
  options: {
    duration?: number;
    delay?: number;
    y?: number;
    x?: number;
    scale?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const { duration = 0.1, delay = 0, y = -10, x = 0, scale = 1, ease = 'power2.in', onComplete } = options;

  return gsap.to(element, {
    opacity: 0,
    y,
    x,
    scale,
    duration,
    delay,
    ease,
    onComplete,
  });
};

/**
 * Stagger animation for multiple elements
 */
export const staggerIn = (
  elements: gsap.TweenTarget,
  options: {
    duration?: number;
    stagger?: number;
    y?: number;
    x?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const { duration = 0.15, stagger = 0.03, y = 10, x = 0, ease = 'power2.out', onComplete } = options;

  return gsap.fromTo(
    elements,
    { opacity: 0, y, x },
    { opacity: 1, y: 0, x: 0, duration, stagger, ease, onComplete }
  );
};

/**
 * Scale pop animation
 */
export const scalePop = (
  element: gsap.TweenTarget,
  options: {
    duration?: number;
    scale?: number;
    ease?: string;
  } = {}
) => {
  const { duration = 0.12, scale = 1.08, ease = 'power2.out' } = options;

  return gsap.to(element, {
    scale,
    duration: duration / 2,
    ease,
    yoyo: true,
    repeat: 1,
  });
};

/**
 * Shake animation for errors
 */
export const shake = (
  element: gsap.TweenTarget,
  options: {
    duration?: number;
    intensity?: number;
  } = {}
) => {
  const { duration = 0.2, intensity = 8 } = options;

  return gsap.to(element, {
    x: intensity,
    duration: duration / 4,
    ease: 'power2.inOut',
    yoyo: true,
    repeat: 3,
  });
};

/**
 * Pulse animation
 */
export const pulse = (
  element: gsap.TweenTarget,
  options: {
    duration?: number;
    scale?: number;
    repeat?: number;
  } = {}
) => {
  const { duration = 0.3, scale = 1.04, repeat = -1 } = options;

  return gsap.to(element, {
    scale,
    duration: duration / 2,
    ease: 'power1.inOut',
    yoyo: true,
    repeat,
  });
};

/**
 * Spin animation
 */
export const spin = (
  element: gsap.TweenTarget,
  options: {
    duration?: number;
    rotation?: number;
    ease?: string;
  } = {}
) => {
  const { duration = 0.2, rotation = 360, ease = 'power2.out' } = options;

  return gsap.to(element, {
    rotation,
    duration,
    ease,
  });
};

/**
 * Float animation (continuous)
 */
export const float = (
  element: gsap.TweenTarget,
  options: {
    duration?: number;
    y?: number;
  } = {}
) => {
  const { duration = 1, y = -6 } = options;

  return gsap.to(element, {
    y,
    duration,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
  });
};

/**
 * Particle float animation
 */
export const particleFloat = (
  element: gsap.TweenTarget,
  options: {
    duration?: number;
    x?: number;
    y?: number;
    scale?: number;
    delay?: number;
  } = {}
) => {
  const {
    duration = 2 + Math.random() * 1.5,
    x = (Math.random() - 0.5) * 150,
    y = (Math.random() - 0.5) * 150,
    scale = 0.5 + Math.random(),
    delay = Math.random() * 0.5
  } = options;

  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0, x: 0, y: 0 },
    {
      opacity: 0.6,
      scale,
      x,
      y,
      duration,
      delay,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      repeatDelay: 0,
    }
  );
};

/**
 * Kill all animations on element
 */
export const killAnimations = (element: gsap.TweenTarget) => {
  gsap.killTweensOf(element);
};

export { gsap };
