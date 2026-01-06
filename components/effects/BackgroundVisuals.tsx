'use client';

import { useEffect, useRef } from 'react';
import { animate } from '@/lib/animejs';

interface Particle {
  element: HTMLDivElement;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

export default function BackgroundVisuals() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 30;

    // Create particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const element = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const hue = Math.random() > 0.5 ? 270 : 330; // Purple or Pink

      element.className = 'absolute rounded-full pointer-events-none';
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.background = `hsla(${hue}, 70%, 60%, 0.6)`;
      element.style.boxShadow = `0 0 ${size * 2}px hsla(${hue}, 70%, 60%, 0.4)`;
      element.style.filter = 'blur(1px)';

      container.appendChild(element);

      particles.push({
        element,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        hue,
      });
    }

    particlesRef.current = particles;

    // Track mouse for interactive effect
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animateParticles = () => {
      particles.forEach((particle) => {
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Mouse repulsion effect
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.x -= (dx / distance) * force * 2;
          particle.y -= (dy / distance) * force * 2;
        }

        // Wrap around screen
        if (particle.x < -10) particle.x = window.innerWidth + 10;
        if (particle.x > window.innerWidth + 10) particle.x = -10;
        if (particle.y < -10) particle.y = window.innerHeight + 10;
        if (particle.y > window.innerHeight + 10) particle.y = -10;

        // Update position
        particle.element.style.left = `${particle.x}px`;
        particle.element.style.top = `${particle.y}px`;
      });

      animationRef.current = requestAnimationFrame(animateParticles);
    };

    animateParticles();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      particles.forEach((p) => p.element.remove());
    };
  }, []);

  return (
    <>
      {/* Particle container */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      />

      {/* Gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <FloatingOrb
          className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          duration={20000}
          rangeX={100}
          rangeY={80}
        />
        <FloatingOrb
          className="absolute top-1/3 -right-32 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl"
          duration={25000}
          rangeX={80}
          rangeY={100}
          delay={5000}
        />
        <FloatingOrb
          className="absolute -bottom-32 left-1/3 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl"
          duration={22000}
          rangeX={120}
          rangeY={60}
          delay={10000}
        />
        <FloatingOrb
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl"
          duration={18000}
          rangeX={60}
          rangeY={90}
          delay={7000}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </>
  );
}

// Floating orb component with CSS animation
function FloatingOrb({
  className,
  duration,
  rangeX,
  rangeY,
  delay = 0,
}: {
  className: string;
  duration: number;
  rangeX: number;
  rangeY: number;
  delay?: number;
}) {
  return (
    <div
      className={className}
      style={{
        animation: `floatOrb ${duration}ms ease-in-out infinite`,
        animationDelay: `${delay}ms`,
        ['--range-x' as string]: `${rangeX}px`,
        ['--range-y' as string]: `${rangeY}px`,
      }}
    />
  );
}
