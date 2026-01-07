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
  pulsePhase: number;
}

interface Sparkle {
  element: HTMLDivElement;
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

export default function BackgroundVisuals() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sparkleContainerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastSparkleTime = useRef(0);

  useEffect(() => {
    if (!containerRef.current || !sparkleContainerRef.current) return;

    const container = containerRef.current;
    const sparkleContainer = sparkleContainerRef.current;
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 20;

    // Create floating particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const element = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const hue = Math.random() > 0.5 ? 270 : 330; // Purple or Pink

      element.className = 'absolute rounded-full pointer-events-none';
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.background = `hsla(${hue}, 70%, 60%, 0.6)`;
      element.style.boxShadow = `0 0 ${size * 2}px hsla(${hue}, 70%, 60%, 0.4)`;

      container.appendChild(element);

      particles.push({
        element,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.5 + 0.3,
        hue,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    particlesRef.current = particles;

    // Track mouse for interactive effect
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Create sparkle on mouse move (throttled)
      const now = Date.now();
      if (now - lastSparkleTime.current > 50) {
        lastSparkleTime.current = now;
        createSparkle(e.clientX, e.clientY);
      }
    };

    // Create sparkle effect
    const createSparkle = (x: number, y: number) => {
      if (sparklesRef.current.length > 30) return; // Limit sparkles

      const element = document.createElement('div');
      const size = Math.random() * 3 + 2;
      const hue = Math.random() > 0.5 ? 270 : 200;

      element.className = 'absolute rounded-full pointer-events-none';
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.left = `${x + (Math.random() - 0.5) * 20}px`;
      element.style.top = `${y + (Math.random() - 0.5) * 20}px`;
      element.style.background = `hsla(${hue}, 80%, 70%, 0.8)`;
      element.style.boxShadow = `0 0 ${size * 3}px hsla(${hue}, 80%, 70%, 0.6)`;

      sparkleContainer.appendChild(element);

      const sparkle: Sparkle = {
        element,
        x: parseFloat(element.style.left),
        y: parseFloat(element.style.top),
        life: 0,
        maxLife: 30 + Math.random() * 20,
      };

      sparklesRef.current.push(sparkle);

      // Animate sparkle
      animate(element, {
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
        translateY: -30 - Math.random() * 20,
        duration: sparkle.maxLife * 10,
        ease: 'outQuad',
        onComplete: () => {
          element.remove();
          sparklesRef.current = sparklesRef.current.filter(s => s !== sparkle);
        },
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let time = 0;
    const animateParticles = () => {
      time += 0.016;

      particles.forEach((particle) => {
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Pulse effect
        const pulse = Math.sin(time * 2 + particle.pulsePhase) * 0.3 + 1;
        particle.element.style.transform = `scale(${pulse})`;

        // Mouse repulsion effect
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 15000) { // 120px radius
          const distance = Math.sqrt(distSq);
          const force = (120 - distance) / 120;
          particle.x -= (dx / distance) * force * 2;
          particle.y -= (dy / distance) * force * 2;
        }

        // Wrap around screen
        if (particle.x < -20) particle.x = window.innerWidth + 20;
        if (particle.x > window.innerWidth + 20) particle.x = -20;
        if (particle.y < -20) particle.y = window.innerHeight + 20;
        if (particle.y > window.innerHeight + 20) particle.y = -20;

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
      sparklesRef.current.forEach((s) => s.element.remove());
    };
  }, []);

  return (
    <>
      {/* Particle container */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      />

      {/* Sparkle container */}
      <div
        ref={sparkleContainerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      />

      {/* Gradient orbs with enhanced glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <FloatingOrb
          className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl"
          duration={20000}
          rangeX={100}
          rangeY={80}
        />
        <FloatingOrb
          className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-pink-600/20 rounded-full blur-3xl"
          duration={25000}
          rangeX={80}
          rangeY={100}
          delay={3000}
        />
        <FloatingOrb
          className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-3xl"
          duration={22000}
          rangeX={120}
          rangeY={60}
          delay={7000}
        />
        <FloatingOrb
          className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-3xl"
          duration={30000}
          rangeX={150}
          rangeY={150}
          delay={10000}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.02]">
        <div
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          style={{
            animation: 'scanLine 8s linear infinite',
          }}
        />
      </div>

      {/* CSS for scan line */}
      <style jsx>{`
        @keyframes scanLine {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
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
