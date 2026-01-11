'use client';

import { motion, AnimatePresence, type Variants } from 'motion/react';

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: [0.34, 1.56, 0.64, 1], // Bounce easing without spring overhead
    },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.1 } },
};

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '100%' },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 5 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.12, // Fast tween
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 5,
    transition: { duration: 0.08 },
  },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03, // Reduced from 0.1
      delayChildren: 0.02,   // Reduced from 0.1
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 }, // Reduced from y: 20
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.1, // Fast tween instead of spring
      ease: 'easeOut',
    },
  },
};

export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.01,
    y: -2,
    transition: {
      duration: 0.1,
      ease: 'easeOut',
    },
  },
  tap: { scale: 0.99 },
};

export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export const iconSpin = {
  rest: { rotate: 0 },
  hover: { rotate: 360, transition: { duration: 0.5 } },
};

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

export const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
};

export const smoothTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

export const bounceTransition = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 15,
};

// ============================================================================
// RE-EXPORTS
// ============================================================================

export { motion, AnimatePresence };
export type { Variants };
