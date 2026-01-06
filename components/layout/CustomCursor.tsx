'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { animate } from '@/lib/animejs';

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ringPosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Smooth follow animation using requestAnimationFrame (much lighter than anime.js per move)
  const animateRing = useCallback(() => {
    const lerp = 0.15; // Smoothing factor

    ringPosition.current.x += (targetPosition.current.x - ringPosition.current.x) * lerp;
    ringPosition.current.y += (targetPosition.current.y - ringPosition.current.y) * lerp;

    if (cursorRingRef.current) {
      cursorRingRef.current.style.left = `${ringPosition.current.x}px`;
      cursorRingRef.current.style.top = `${ringPosition.current.y}px`;
    }

    animationFrameRef.current = requestAnimationFrame(animateRing);
  }, []);

  // Update cursor position - just update target, no anime.js calls
  const updatePosition = useCallback((e: MouseEvent) => {
    targetPosition.current = { x: e.clientX, y: e.clientY };

    // Move dot instantly with direct style update
    if (cursorDotRef.current) {
      cursorDotRef.current.style.left = `${e.clientX}px`;
      cursorDotRef.current.style.top = `${e.clientY}px`;
    }
  }, []);

  // Throttled hover check
  const checkHover = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const interactive = target.closest('a, button, input, textarea, select, [role="button"]');
    setIsPointer(!!interactive);
  }, []);

  const handleMouseEnter = useCallback(() => setIsVisible(true), []);
  const handleMouseLeave = useCallback(() => setIsVisible(false), []);

  // Click animations - only animate on click, not on move
  const handleMouseDown = useCallback(() => {
    if (cursorRingRef.current) {
      animate(cursorRingRef.current, {
        scale: [1, 0.8],
        duration: 100,
        ease: 'outQuad',
      });
    }
  }, []);

  const handleMouseUp = useCallback(() => {
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

    // Start ring animation loop
    animationFrameRef.current = requestAnimationFrame(animateRing);

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mousemove', checkHover);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

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
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.getElementById('custom-cursor-style')?.remove();
    };
  }, [updatePosition, checkHover, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp, animateRing]);

  // Animate hover state changes - only when state changes
  useEffect(() => {
    if (cursorDotRef.current) {
      cursorDotRef.current.style.transform = `translate(-50%, -50%) scale(${isPointer ? 1.5 : 1})`;
    }
    if (cursorRingRef.current) {
      cursorRingRef.current.style.transform = `translate(-50%, -50%) scale(${isPointer ? 1.4 : 1})`;
    }
  }, [isPointer]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.15s' }}
    >
      {/* Outer ring - follows with delay */}
      <div
        ref={cursorRingRef}
        className="absolute w-10 h-10 rounded-full border-2 transition-all duration-150"
        style={{
          borderColor: isPointer ? 'rgba(236, 72, 153, 0.7)' : 'rgba(168, 85, 247, 0.5)',
          boxShadow: isPointer
            ? '0 0 15px rgba(236, 72, 153, 0.4)'
            : '0 0 8px rgba(168, 85, 247, 0.3)',
        }}
      />

      {/* Inner dot - follows instantly */}
      <div
        ref={cursorDotRef}
        className="absolute w-3 h-3 rounded-full transition-transform duration-150"
        style={{
          background: isPointer
            ? 'linear-gradient(135deg, #ec4899, #a855f7)'
            : 'linear-gradient(135deg, #a855f7, #6366f1)',
          boxShadow: '0 0 8px rgba(168, 85, 247, 0.5)',
        }}
      />
    </div>
  );
}
