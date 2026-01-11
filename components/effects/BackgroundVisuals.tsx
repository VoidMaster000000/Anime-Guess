'use client';

import { useEffect, useRef } from 'react';
import { usePerformanceMode } from '@/hooks/useReducedMotion';

interface Sparkle {
  element: HTMLDivElement;
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

export default function BackgroundVisuals() {
  const sparkleContainerRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const lastSparkleTime = useRef(0);
  const { reduceAnimations, disableParticles, disableBlur } = usePerformanceMode();

  useEffect(() => {
    // Skip sparkle effect if particles are disabled
    if (disableParticles || !sparkleContainerRef.current) return;

    const sparkleContainer = sparkleContainerRef.current;

    // Track mouse for interactive sparkle effect
    const handleMouseMove = (e: MouseEvent) => {
      // Create sparkle on mouse move (throttled - increased for performance)
      const now = Date.now();
      const throttleTime = reduceAnimations ? 200 : 100; // Slower on low-end
      if (now - lastSparkleTime.current > throttleTime) {
        lastSparkleTime.current = now;
        createSparkle(e.clientX, e.clientY);
      }
    };

    // Create sparkle effect
    const createSparkle = (x: number, y: number) => {
      const maxSparkles = reduceAnimations ? 8 : 15; // Fewer sparkles on low-end
      if (sparklesRef.current.length > maxSparkles) return;

      const element = document.createElement('div');
      const size = Math.random() * 3 + 2;
      const hue = Math.random() > 0.5 ? 270 : 200;

      element.className = 'absolute rounded-full pointer-events-none';
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.left = `${x + (Math.random() - 0.5) * 20}px`;
      element.style.top = `${y + (Math.random() - 0.5) * 20}px`;
      element.style.background = `hsla(${hue}, 80%, 70%, 0.6)`;

      // Simpler shadow on low-end devices
      if (!reduceAnimations) {
        element.style.boxShadow = `0 0 ${size * 2}px hsla(${hue}, 80%, 70%, 0.4)`;
      }

      sparkleContainer.appendChild(element);

      const sparkle: Sparkle = {
        element,
        x: parseFloat(element.style.left),
        y: parseFloat(element.style.top),
        life: 0,
        maxLife: 30 + Math.random() * 20,
      };

      sparklesRef.current.push(sparkle);

      // Animate sparkle with CSS
      const translateY = -30 - Math.random() * 20;
      element.style.transition = `all ${sparkle.maxLife * 10}ms ease-out`;
      element.style.opacity = '1';
      element.style.transform = 'scale(1.2)';

      requestAnimationFrame(() => {
        element.style.opacity = '0';
        element.style.transform = `scale(0) translateY(${translateY}px)`;
      });

      setTimeout(() => {
        element.remove();
        sparklesRef.current = sparklesRef.current.filter(s => s !== sparkle);
      }, sparkle.maxLife * 10);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      sparklesRef.current.forEach((s) => s.element.remove());
    };
  }, [disableParticles, reduceAnimations]);

  // Always render the same DOM structure to prevent layout shifts
  // Use CSS classes to show/hide elements based on performance mode
  return (
    <div className="contents">
      {/* Sparkle container - always in DOM, conditionally populated */}
      <div
        ref={sparkleContainerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{ display: disableParticles ? 'none' : 'block' }}
      />

      {/* Gaming Background - Using CSS classes from globals.css */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Simple static gradient for reduced animations mode */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-transparent to-cyan-950/20"
          style={{ opacity: reduceAnimations ? 1 : 0 }}
        />

        {/* Hex pattern - hidden in reduced mode via CSS */}
        <div
          className="bg-hex-pattern"
          style={{ opacity: reduceAnimations ? 0 : 1 }}
        />

        {/* Floating orbs - use visibility instead of conditional render */}
        <div
          className="orb-gaming orb-purple -top-20 -left-20"
          style={{ display: disableBlur ? 'none' : 'block' }}
        />
        <div
          className="orb-gaming orb-cyan top-1/3 -right-32"
          style={{ display: disableBlur ? 'none' : 'block' }}
        />
        <div
          className="orb-gaming orb-pink bottom-20 left-1/4"
          style={{ display: disableBlur ? 'none' : 'block' }}
        />

        {/* Scan line - use visibility instead of conditional render */}
        <div
          className="scan-line"
          style={{ display: reduceAnimations ? 'none' : 'block' }}
        />

        {/* Tech lines */}
        <div className="tech-lines" />
      </div>
    </div>
  );
}
