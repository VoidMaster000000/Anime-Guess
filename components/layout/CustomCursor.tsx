'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { animate } from '@/lib/animejs';

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const positionRef = useRef({ x: 0, y: 0 });

  const TRAIL_COUNT = 5;

  // Update cursor position
  const updatePosition = useCallback((e: MouseEvent) => {
    positionRef.current = { x: e.clientX, y: e.clientY };

    // Move dot instantly
    if (cursorDotRef.current) {
      cursorDotRef.current.style.left = `${e.clientX}px`;
      cursorDotRef.current.style.top = `${e.clientY}px`;
    }

    // Animate ring to follow with delay
    if (cursorRingRef.current) {
      animate(cursorRingRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 150,
        ease: 'outQuad',
      });
    }

    // Animate trail particles
    trailRefs.current.forEach((trail, index) => {
      if (trail) {
        animate(trail, {
          left: e.clientX,
          top: e.clientY,
          duration: 200 + index * 50,
          ease: 'outQuad',
        });
      }
    });
  }, []);

  // Check if hovering over interactive element
  const checkHover = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const interactive = target.closest('a, button, input, textarea, select, [role="button"], [onclick]');
    setIsPointer(!!interactive);
  }, []);

  // Handle mouse enter/leave viewport
  const handleMouseEnter = useCallback(() => setIsVisible(true), []);
  const handleMouseLeave = useCallback(() => setIsVisible(false), []);

  // Handle click animations
  const handleMouseDown = useCallback(() => {
    setIsClicking(true);

    // Animate ring on click
    if (cursorRingRef.current) {
      animate(cursorRingRef.current, {
        scale: [1, 0.8],
        duration: 100,
        ease: 'outQuad',
      });
    }

    // Burst effect on trails
    trailRefs.current.forEach((trail, index) => {
      if (trail) {
        const angle = (index / TRAIL_COUNT) * Math.PI * 2;
        const distance = 20;
        animate(trail, {
          translateX: [0, Math.cos(angle) * distance, 0],
          translateY: [0, Math.sin(angle) * distance, 0],
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.3],
          duration: 300,
          ease: 'outQuad',
        });
      }
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsClicking(false);

    if (cursorRingRef.current) {
      animate(cursorRingRef.current, {
        scale: [0.8, 1],
        duration: 150,
        ease: 'outBack',
      });
    }
  }, []);

  useEffect(() => {
    // Check if touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mousemove', checkHover);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Add cursor:none to all interactive elements
    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.textContent = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousemove', checkHover);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.getElementById('custom-cursor-style')?.remove();
    };
  }, [updatePosition, checkHover, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp]);

  // Animate hover state changes
  useEffect(() => {
    if (cursorDotRef.current) {
      animate(cursorDotRef.current, {
        scale: isPointer ? 1.5 : 1,
        duration: 150,
        ease: 'outQuad',
      });
    }
    if (cursorRingRef.current) {
      animate(cursorRingRef.current, {
        scale: isPointer ? 1.5 : 1,
        borderWidth: isPointer ? '1px' : '2px',
        duration: 150,
        ease: 'outQuad',
      });
    }
  }, [isPointer]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.2s' }}
    >
      {/* Trail particles */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { trailRefs.current[i] = el; }}
          className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `rgba(168, 85, 247, ${0.3 - i * 0.05})`,
            filter: 'blur(1px)',
          }}
        />
      ))}

      {/* Outer ring */}
      <div
        ref={cursorRingRef}
        className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple-500/50 transition-colors duration-150"
        style={{
          boxShadow: isPointer
            ? '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)'
            : '0 0 10px rgba(168, 85, 247, 0.3)',
          borderColor: isPointer ? 'rgba(236, 72, 153, 0.7)' : 'rgba(168, 85, 247, 0.5)',
        }}
      />

      {/* Inner dot */}
      <div
        ref={cursorDotRef}
        className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: isPointer
            ? 'linear-gradient(135deg, #ec4899, #a855f7)'
            : 'linear-gradient(135deg, #a855f7, #6366f1)',
          boxShadow: isPointer
            ? '0 0 15px rgba(236, 72, 153, 0.8)'
            : '0 0 10px rgba(168, 85, 247, 0.6)',
        }}
      />
    </div>
  );
}
