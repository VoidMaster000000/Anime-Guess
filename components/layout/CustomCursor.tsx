'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePerformanceMode } from '@/hooks/useReducedMotion';

interface TrailDot {
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);
  const particleContainerRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const ringPosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Performance mode
  const { reduceAnimations, disableParticles } = usePerformanceMode();

  // Trail state - reduced for performance mode
  const trailDotsRef = useRef<TrailDot[]>([]);
  const TRAIL_LENGTH = reduceAnimations ? 0 : 8;
  const lastTrailUpdate = useRef(0);

  // Check for touch-only device on mount
  useEffect(() => {
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isPureTouchDevice = !hasFinePointer && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setIsTouchDevice(isPureTouchDevice);
  }, []);

  // Initialize trail dots
  useEffect(() => {
    if (reduceAnimations) {
      trailDotsRef.current = [];
      return;
    }
    trailDotsRef.current = Array(TRAIL_LENGTH).fill(null).map(() => ({
      x: 0,
      y: 0,
      opacity: 0,
      scale: 1,
    }));
  }, [reduceAnimations, TRAIL_LENGTH]);

  // Smooth follow animation with trail
  const animateRing = useCallback(() => {
    const lerp = 0.15;
    const now = Date.now();

    ringPosition.current.x += (targetPosition.current.x - ringPosition.current.x) * lerp;
    ringPosition.current.y += (targetPosition.current.y - ringPosition.current.y) * lerp;

    if (cursorRingRef.current) {
      cursorRingRef.current.style.left = `${ringPosition.current.x}px`;
      cursorRingRef.current.style.top = `${ringPosition.current.y}px`;
    }

    // Update trail every 30ms (skip if reduced animations)
    if (!reduceAnimations && now - lastTrailUpdate.current > 30 && trailContainerRef.current) {
      lastTrailUpdate.current = now;

      // Shift trail positions
      for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
        trailDotsRef.current[i] = { ...trailDotsRef.current[i - 1] };
        trailDotsRef.current[i].opacity = (TRAIL_LENGTH - i) / TRAIL_LENGTH * 0.5;
        trailDotsRef.current[i].scale = (TRAIL_LENGTH - i) / TRAIL_LENGTH * 0.8;
      }
      trailDotsRef.current[0] = {
        x: targetPosition.current.x,
        y: targetPosition.current.y,
        opacity: 0.5,
        scale: 0.8,
      };

      // Update trail DOM
      const trailElements = trailContainerRef.current.children;
      for (let i = 0; i < trailElements.length; i++) {
        const dot = trailDotsRef.current[i];
        if (dot) {
          const el = trailElements[i] as HTMLDivElement;
          el.style.left = `${dot.x}px`;
          el.style.top = `${dot.y}px`;
          el.style.opacity = `${dot.opacity}`;
          el.style.transform = `translate(-50%, -50%) scale(${dot.scale})`;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(animateRing);
  }, [reduceAnimations, TRAIL_LENGTH]);

  // Update cursor position
  const updatePosition = useCallback((e: MouseEvent) => {
    targetPosition.current = { x: e.clientX, y: e.clientY };

    if (cursorDotRef.current) {
      cursorDotRef.current.style.left = `${e.clientX}px`;
      cursorDotRef.current.style.top = `${e.clientY}px`;
    }
  }, []);

  // Create click burst particles (skip if disabled)
  const createClickBurst = useCallback((x: number, y: number) => {
    if (disableParticles || !particleContainerRef.current) return;

    const colors = ['#a855f7', '#ec4899', '#6366f1', '#22d3ee', '#f59e0b'];
    const particleCount = reduceAnimations ? 5 : 12; // Fewer particles on low-end

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = 60 + Math.random() * 40;
      const size = 3 + Math.random() * 3;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.className = 'absolute rounded-full pointer-events-none';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = color;

      // Skip box-shadow on reduced animations
      if (!reduceAnimations) {
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
      }

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      particleContainerRef.current.appendChild(particle);

      const duration = 250 + Math.random() * 100;
      const translateX = Math.cos(angle) * velocity;
      const translateY = Math.sin(angle) * velocity;

      particle.style.transition = `all ${duration}ms ease-out`;
      requestAnimationFrame(() => {
        particle.style.transform = `translate(${translateX}px, ${translateY}px) scale(0)`;
        particle.style.opacity = '0';
      });

      setTimeout(() => particle.remove(), duration);
    }
  }, [disableParticles, reduceAnimations]);

  // Throttled hover check
  const checkHover = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const interactive = target.closest('a, button, input, textarea, select, [role="button"]');
    setIsPointer(!!interactive);
  }, []);

  const handleMouseEnter = useCallback(() => setIsVisible(true), []);
  const handleMouseLeave = useCallback(() => setIsVisible(false), []);

  // Click animations with burst
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (cursorRingRef.current) {
      cursorRingRef.current.style.transition = 'transform 100ms ease-out';
      cursorRingRef.current.style.transform = 'translate(-50%, -50%) scale(0.7)';
    }

    // Create click burst
    createClickBurst(e.clientX, e.clientY);
  }, [createClickBurst]);

  const handleMouseUp = useCallback(() => {
    if (cursorRingRef.current) {
      cursorRingRef.current.style.transition = 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      cursorRingRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    // Start ring animation loop
    animationFrameRef.current = requestAnimationFrame(animateRing);

    document.addEventListener('mousemove', updatePosition, { passive: true });
    document.addEventListener('mousemove', checkHover, { passive: true });
    document.documentElement.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });

    // Hide default cursor
    document.body.style.cursor = 'none';
    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(style);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousemove', checkHover);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.getElementById('custom-cursor-style')?.remove();
    };
  }, [isTouchDevice, updatePosition, checkHover, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp, animateRing]);

  // Animate hover state changes
  useEffect(() => {
    if (cursorDotRef.current) {
      cursorDotRef.current.style.transition = 'transform 80ms ease-out';
      cursorDotRef.current.style.transform = `translate(-50%, -50%) scale(${isPointer ? 1.5 : 1})`;
    }
    if (cursorRingRef.current) {
      cursorRingRef.current.style.transition = 'transform 80ms ease-out';
      cursorRingRef.current.style.transform = `translate(-50%, -50%) scale(${isPointer ? 1.4 : 1})`;
    }
  }, [isPointer]);

  // Don't render on touch devices
  if (isTouchDevice) {
    return null;
  }

  // Simplified cursor for reduced animations
  if (reduceAnimations) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
        style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.15s' }}
      >
        {/* Simple dot only */}
        <div
          ref={cursorDotRef}
          className="absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 bg-purple-500"
        />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.15s' }}
    >
      {/* Trail container */}
      {!reduceAnimations && (
        <div ref={trailContainerRef} className="absolute inset-0">
          {Array(TRAIL_LENGTH).fill(null).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: `linear-gradient(135deg, rgba(168, 85, 247, ${0.6 - i * 0.06}), rgba(99, 102, 241, ${0.4 - i * 0.04}))`,
                boxShadow: `0 0 ${6 - i * 0.5}px rgba(168, 85, 247, ${0.4 - i * 0.04})`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Click particle container */}
      {!disableParticles && <div ref={particleContainerRef} className="absolute inset-0" />}

      {/* Outer ring - follows with delay */}
      <div
        ref={cursorRingRef}
        className="absolute w-10 h-10 rounded-full border-2 -translate-x-1/2 -translate-y-1/2"
        style={{
          borderColor: isPointer ? 'rgba(236, 72, 153, 0.8)' : 'rgba(168, 85, 247, 0.6)',
          boxShadow: isPointer
            ? '0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.2)'
            : '0 0 15px rgba(168, 85, 247, 0.4), 0 0 30px rgba(168, 85, 247, 0.15)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      />

      {/* Inner dot - follows instantly */}
      <div
        ref={cursorDotRef}
        className="absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          background: isPointer
            ? 'linear-gradient(135deg, #ec4899, #a855f7)'
            : 'linear-gradient(135deg, #a855f7, #6366f1)',
          boxShadow: isPointer
            ? '0 0 12px rgba(236, 72, 153, 0.7)'
            : '0 0 10px rgba(168, 85, 247, 0.6)',
          transition: 'background 0.15s, box-shadow 0.15s',
        }}
      />
    </div>
  );
}
