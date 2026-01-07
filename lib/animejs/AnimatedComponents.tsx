'use client';

import React, { useEffect, useRef, useState, createContext, useContext, forwardRef } from 'react';
import { animate, stagger, splitText, type AnimationParams } from './anime.esm.js';
import { animePresets } from './useAnime';

// ============================================================================
// TYPES
// ============================================================================

interface AnimatedProps extends React.HTMLAttributes<HTMLDivElement> {
  initial?: Partial<AnimationParams>;
  animate?: Partial<AnimationParams>;
  exit?: Partial<AnimationParams>;
  transition?: {
    duration?: number;
    delay?: number;
    ease?: string;
  };
  whileHover?: Partial<AnimationParams>;
  whileTap?: Partial<AnimationParams>;
  children?: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}

interface AnimatePresenceProps {
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
}

// ============================================================================
// ANIMATE PRESENCE CONTEXT
// ============================================================================

const PresenceContext = createContext<{
  isExiting: boolean;
  onExitComplete: () => void;
}>({
  isExiting: false,
  onExitComplete: () => {},
});

// ============================================================================
// ANIMATED COMPONENT
// ============================================================================

export const Animated = forwardRef<HTMLDivElement, AnimatedProps>(
  (
    {
      initial,
      animate: animateProps,
      exit,
      transition,
      whileHover,
      whileTap,
      children,
      className,
      style,
      as: Component = 'div',
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = (forwardedRef as React.RefObject<HTMLDivElement>) || internalRef;
    const { isExiting, onExitComplete } = useContext(PresenceContext);
    const [isAnimating, setIsAnimating] = useState(false);

    // Convert initial state to CSS
    const getInitialStyles = (): React.CSSProperties => {
      if (!initial) return {};

      const styles: React.CSSProperties = {};
      if (initial.opacity !== undefined) {
        styles.opacity = Array.isArray(initial.opacity) ? initial.opacity[0] : initial.opacity;
      }
      if (initial.translateY !== undefined) {
        const y = Array.isArray(initial.translateY) ? initial.translateY[0] : initial.translateY;
        styles.transform = `translateY(${y}px)`;
      }
      if (initial.translateX !== undefined) {
        const x = Array.isArray(initial.translateX) ? initial.translateX[0] : initial.translateX;
        styles.transform = (styles.transform || '') + ` translateX(${x}px)`;
      }
      if (initial.scale !== undefined) {
        const s = Array.isArray(initial.scale) ? initial.scale[0] : initial.scale;
        styles.transform = (styles.transform || '') + ` scale(${s})`;
      }
      return styles;
    };

    // Run enter animation
    useEffect(() => {
      const element = ref.current;
      if (!element || !animateProps) return;

      const params: AnimationParams = {
        ...animateProps,
        duration: transition?.duration || 200,
        delay: transition?.delay || 0,
        ease: transition?.ease || 'outQuad',
      };

      // Helper to extract numeric value from anime.js property
      const getValue = (v: unknown): number => {
        if (typeof v === 'function') return v();
        if (Array.isArray(v)) return getValue(v[0]);
        return v as number;
      };

      // If we have initial values, animate from them
      if (initial) {
        if (initial.opacity !== undefined && animateProps.opacity !== undefined) {
          params.opacity = [
            getValue(initial.opacity),
            getValue(animateProps.opacity),
          ];
        }
        if (initial.translateY !== undefined && animateProps.translateY !== undefined) {
          params.translateY = [
            getValue(initial.translateY),
            getValue(animateProps.translateY),
          ];
        }
        if (initial.translateX !== undefined && animateProps.translateX !== undefined) {
          params.translateX = [
            getValue(initial.translateX),
            getValue(animateProps.translateX),
          ];
        }
        if (initial.scale !== undefined && animateProps.scale !== undefined) {
          params.scale = [
            getValue(initial.scale),
            getValue(animateProps.scale),
          ];
        }
      }

      animate(element, params);
    }, []);

    // Run exit animation
    useEffect(() => {
      const element = ref.current;
      if (!element || !isExiting || !exit) return;

      setIsAnimating(true);

      animate(element, {
        ...exit,
        duration: transition?.duration || 150,
        ease: transition?.ease || 'inQuad',
        onComplete: () => {
          setIsAnimating(false);
          onExitComplete();
        },
      });
    }, [isExiting]);

    // Hover and tap handlers
    const handleMouseEnter = () => {
      const element = ref.current;
      if (!element || !whileHover) return;
      animate(element, {
        ...whileHover,
        duration: 100,
        ease: 'outQuad',
      });
    };

    const handleMouseLeave = () => {
      const element = ref.current;
      if (!element || !whileHover) return;
      // Reset to animate state
      if (animateProps) {
        animate(element, {
          ...animateProps,
          duration: 100,
          ease: 'outQuad',
        });
      }
    };

    const handleMouseDown = () => {
      const element = ref.current;
      if (!element || !whileTap) return;
      animate(element, {
        ...whileTap,
        duration: 50,
        ease: 'outQuad',
      });
    };

    const handleMouseUp = () => {
      const element = ref.current;
      if (!element || !whileTap) return;
      // Reset to hover or animate state
      const targetState = whileHover || animateProps;
      if (targetState) {
        animate(element, {
          ...targetState,
          duration: 50,
          ease: 'outQuad',
        });
      }
    };

    const Tag = Component as any;

    return (
      <Tag
        ref={ref}
        className={className}
        style={{ ...getInitialStyles(), ...style }}
        onMouseEnter={whileHover ? handleMouseEnter : undefined}
        onMouseLeave={whileHover ? handleMouseLeave : undefined}
        onMouseDown={whileTap ? handleMouseDown : undefined}
        onMouseUp={whileTap ? handleMouseUp : undefined}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

Animated.displayName = 'Animated';

// ============================================================================
// ANIMATE PRESENCE
// ============================================================================

export function AnimatePresence({ children, mode = 'sync' }: AnimatePresenceProps) {
  const [renderedChildren, setRenderedChildren] = useState<React.ReactNode>(children);
  const [exitingKeys, setExitingKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simple implementation: just render children directly
    // For more complex exit animations, track child keys
    setRenderedChildren(children);
  }, [children]);

  return <>{renderedChildren}</>;
}

// ============================================================================
// STAGGER CONTAINER
// ============================================================================

interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  staggerDelay?: number;
  animation?: keyof typeof animePresets | Partial<AnimationParams>;
  childSelector?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 50,
  animation = 'fadeInUp',
  childSelector = '& > *',
  className,
  ...props
}: StaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get direct children
    const elements = container.children;
    if (elements.length === 0) return;

    const params = typeof animation === 'string' ? animePresets[animation] : animation;

    // Set initial state
    Array.from(elements).forEach((el) => {
      (el as HTMLElement).style.opacity = '0';
    });

    // Animate - convert HTMLCollection to Array for anime.js compatibility
    animate(Array.from(elements) as HTMLElement[], {
      ...params,
      delay: stagger(staggerDelay),
    });
  }, [children, staggerDelay, animation]);

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  );
}

// ============================================================================
// TRANSITION WRAPPER
// ============================================================================

interface TransitionProps {
  show: boolean;
  children: React.ReactNode;
  enter?: Partial<AnimationParams>;
  exit?: Partial<AnimationParams>;
  duration?: number;
  className?: string;
}

export function Transition({
  show,
  children,
  enter = animePresets.fadeIn,
  exit = animePresets.fadeOut,
  duration = 300,
  className,
}: TransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (show) {
      setShouldRender(true);
      // Wait for render
      requestAnimationFrame(() => {
        animate(element, { ...enter, duration });
      });
    } else {
      animate(element, {
        ...exit,
        duration,
        onComplete: () => {
          setShouldRender(false);
        },
      });
    }
  }, [show]);

  if (!shouldRender) return null;

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

// ============================================================================
// ANIMATED SPLIT TEXT COMPONENT
// ============================================================================

interface AnimatedSplitTextProps {
  text: string;
  className?: string;
  splitBy?: 'chars' | 'words' | 'lines';
  staggerDelay?: number;
  duration?: number;
  ease?: string;
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'scaleIn' | 'slideInUp';
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export function AnimatedSplitText({
  text,
  className = '',
  splitBy = 'chars',
  staggerDelay = 30,
  duration = 400,
  ease = 'outQuad',
  animation = 'fadeInUp',
  tag: Tag = 'span',
}: AnimatedSplitTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const splitterRef = useRef<any>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any previous split
    if (splitterRef.current) {
      splitterRef.current.revert();
    }

    // Split the text
    const splitOptions: any = {};
    if (splitBy === 'chars') {
      splitOptions.chars = true;
    } else if (splitBy === 'words') {
      splitOptions.words = true;
    } else if (splitBy === 'lines') {
      splitOptions.lines = true;
    }

    splitterRef.current = splitText(container, splitOptions);

    // Get the split elements
    let elements: HTMLElement[] = [];
    if (splitBy === 'chars' && splitterRef.current.chars) {
      elements = splitterRef.current.chars;
    } else if (splitBy === 'words' && splitterRef.current.words) {
      elements = splitterRef.current.words;
    } else if (splitBy === 'lines' && splitterRef.current.lines) {
      elements = splitterRef.current.lines;
    }

    if (elements.length === 0) return;

    // Set initial state
    elements.forEach((el) => {
      el.style.opacity = '0';
      el.style.display = 'inline-block';
    });

    // Animation parameters based on animation type
    let animParams: Partial<AnimationParams> = {};
    switch (animation) {
      case 'fadeIn':
        animParams = { opacity: [0, 1] };
        break;
      case 'fadeInUp':
        animParams = { opacity: [0, 1], translateY: [20, 0] };
        break;
      case 'fadeInDown':
        animParams = { opacity: [0, 1], translateY: [-20, 0] };
        break;
      case 'scaleIn':
        animParams = { opacity: [0, 1], scale: [0.5, 1] };
        break;
      case 'slideInUp':
        animParams = { opacity: [0, 1], translateY: [40, 0] };
        break;
    }

    // Animate with stagger
    animate(elements, {
      ...animParams,
      duration,
      delay: stagger(staggerDelay),
      ease,
    });

    // Cleanup
    return () => {
      if (splitterRef.current) {
        splitterRef.current.revert();
      }
    };
  }, [text, splitBy, staggerDelay, duration, ease, animation]);

  return React.createElement(
    Tag,
    { ref: containerRef as any, className },
    text
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default Animated;
