'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { animate } from '@/lib/animejs';

interface TrailDot {
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  element: HTMLDivElement;
}

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);
  const particleContainerRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ringPosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Trail state
  const trailDotsRef = useRef<TrailDot[]>([]);
  const TRAIL_LENGTH = 8;
  const lastTrailUpdate = useRef(0);

  // Particle counter
  const particleIdRef = useRef(0);

  // Initialize trail dots
  useEffect(() => {
    trailDotsRef.current = Array(TRAIL_LENGTH).fill(null).map(() => ({
      x: 0,
      y: 0,
      opacity: 0,
      scale: 1,
    }));
  }, []);

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

    // Update trail every 30ms
    if (now - lastTrailUpdate.current > 30 && trailContainerRef.current) {
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
        const el = trailElements[i] as HTMLDivElement;
        el.style.left = `${dot.x}px`;
        el.style.top = `${dot.y}px`;
        el.style.opacity = `${dot.opacity}`;
        el.style.transform = `translate(-50%, -50%) scale(${dot.scale})`;
      }
    }

    animationFrameRef.current = requestAnimationFrame(animateRing);
  }, []);

  // Update cursor position
  const updatePosition = useCallback((e: MouseEvent) => {
    targetPosition.current = { x: e.clientX, y: e.clientY };

    if (cursorDotRef.current) {
      cursorDotRef.current.style.left = `${e.clientX}px`;
      cursorDotRef.current.style.top = `${e.clientY}px`;
    }
  }, []);

  // Create click burst particles
  const createClickBurst = useCallback((x: number, y: number) => {
    if (!particleContainerRef.current) return;

    const colors = ['#a855f7', '#ec4899', '#6366f1', '#22d3ee', '#f59e0b'];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = 80 + Math.random() * 60;
      const size = 4 + Math.random() * 4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.className = 'absolute rounded-full pointer-events-none';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = color;
      particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      particleContainerRef.current.appendChild(particle);

      // Animate particle outward
      animate(particle, {
        translateX: Math.cos(angle) * velocity,
        translateY: Math.sin(angle) * velocity,
        opacity: [1, 0],
        scale: [1, 0],
        duration: 600 + Math.random() * 200,
        ease: 'outQuad',
        onComplete: () => particle.remove(),
      });
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

  // Click animations with burst
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (cursorRingRef.current) {
      animate(cursorRingRef.current, {
        scale: [1, 0.7],
        duration: 100,
        ease: 'outQuad',
      });
    }

    // Create click burst
    createClickBurst(e.clientX, e.clientY);
  }, [createClickBurst]);

  const handleMouseUp = useCallback(() => {
    if (cursorRingRef.current) {
      animate(cursorRingRef.current, {
        scale: [0.7, 1.1, 1],
        duration: 200,
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
        scale: isPointer ? 1.4 : 1,
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
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.15s' }}
    >
      {/* Trail container */}
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

      {/* Click particle container */}
      <div ref={particleContainerRef} className="absolute inset-0" />

      {/* Outer ring - follows with delay */}
      <div
        ref={cursorRingRef}
        className="absolute w-10 h-10 rounded-full border-2"
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
        className="absolute w-3 h-3 rounded-full"
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
