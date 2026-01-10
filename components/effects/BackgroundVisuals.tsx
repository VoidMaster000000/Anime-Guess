'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (!sparkleContainerRef.current) return;

    const sparkleContainer = sparkleContainerRef.current;

    // Track mouse for interactive sparkle effect
    const handleMouseMove = (e: MouseEvent) => {
      // Create sparkle on mouse move (throttled)
      const now = Date.now();
      if (now - lastSparkleTime.current > 80) {
        lastSparkleTime.current = now;
        createSparkle(e.clientX, e.clientY);
      }
    };

    // Create sparkle effect
    const createSparkle = (x: number, y: number) => {
      if (sparklesRef.current.length > 20) return; // Limit sparkles

      const element = document.createElement('div');
      const size = Math.random() * 3 + 2;
      const hue = Math.random() > 0.5 ? 270 : 200;

      element.className = 'absolute rounded-full pointer-events-none';
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.left = `${x + (Math.random() - 0.5) * 20}px`;
      element.style.top = `${y + (Math.random() - 0.5) * 20}px`;
      element.style.background = `hsla(${hue}, 80%, 70%, 0.6)`;
      element.style.boxShadow = `0 0 ${size * 2}px hsla(${hue}, 80%, 70%, 0.4)`;

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

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      sparklesRef.current.forEach((s) => s.element.remove());
    };
  }, []);

  return (
    <>
      {/* Sparkle container for mouse interaction */}
      <div
        ref={sparkleContainerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      />

      {/* Gaming Background - Using CSS classes from globals.css */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Hex pattern */}
        <div className="bg-hex-pattern" />

        {/* Floating orbs */}
        <div className="orb-gaming orb-purple -top-20 -left-20" />
        <div className="orb-gaming orb-cyan top-1/3 -right-32" />
        <div className="orb-gaming orb-pink bottom-20 left-1/4" />

        {/* Scan line */}
        <div className="scan-line" />

        {/* Tech lines */}
        <div className="tech-lines" />
      </div>
    </>
  );
}
