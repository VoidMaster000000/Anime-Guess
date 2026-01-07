'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { animate } from '@/lib/animejs';
import { Infinity as InfinityIcon, TrendingUp, Crown, Star, Zap, Flame, Diamond, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// ============================================================================
// TYPES
// ============================================================================

interface LevelProgressProps {
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// LEVEL TIER SYSTEM (Every 5 levels = new tier)
// ============================================================================

interface LevelTier {
  name: string;
  gradient: string;
  borderGradient: string;
  glowColor: string;
  particleColors: string[];
  icon: React.ComponentType<{ className?: string }>;
  ringEffect: string;
  textShadow: string;
}

const LEVEL_TIERS: Record<number, LevelTier> = {
  0: { // Level 1-4: Bronze
    name: 'Bronze',
    gradient: 'from-amber-700 via-amber-600 to-yellow-700',
    borderGradient: 'from-amber-500 to-yellow-600',
    glowColor: 'rgba(217, 119, 6, 0.5)',
    particleColors: ['#d97706', '#b45309', '#fbbf24'],
    icon: Star,
    ringEffect: '',
    textShadow: '0 0 10px rgba(217, 119, 6, 0.5)',
  },
  1: { // Level 5-9: Silver
    name: 'Silver',
    gradient: 'from-slate-400 via-slate-300 to-zinc-400',
    borderGradient: 'from-slate-300 to-zinc-400',
    glowColor: 'rgba(148, 163, 184, 0.6)',
    particleColors: ['#94a3b8', '#cbd5e1', '#e2e8f0'],
    icon: Star,
    ringEffect: 'ring-2 ring-slate-400/30',
    textShadow: '0 0 10px rgba(148, 163, 184, 0.6)',
  },
  2: { // Level 10-14: Gold
    name: 'Gold',
    gradient: 'from-yellow-500 via-amber-400 to-yellow-500',
    borderGradient: 'from-yellow-400 to-amber-500',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    particleColors: ['#eab308', '#fbbf24', '#fde047'],
    icon: Crown,
    ringEffect: 'ring-2 ring-yellow-400/40',
    textShadow: '0 0 15px rgba(234, 179, 8, 0.7)',
  },
  3: { // Level 15-19: Platinum
    name: 'Platinum',
    gradient: 'from-cyan-300 via-teal-200 to-cyan-400',
    borderGradient: 'from-cyan-300 to-teal-400',
    glowColor: 'rgba(34, 211, 238, 0.6)',
    particleColors: ['#22d3ee', '#67e8f9', '#a5f3fc'],
    icon: Zap,
    ringEffect: 'ring-2 ring-cyan-400/50',
    textShadow: '0 0 15px rgba(34, 211, 238, 0.7)',
  },
  4: { // Level 20-24: Diamond
    name: 'Diamond',
    gradient: 'from-blue-400 via-purple-400 to-blue-500',
    borderGradient: 'from-blue-400 to-purple-500',
    glowColor: 'rgba(147, 51, 234, 0.6)',
    particleColors: ['#60a5fa', '#a78bfa', '#c084fc'],
    icon: Diamond,
    ringEffect: 'ring-2 ring-purple-400/50 ring-offset-1 ring-offset-purple-900/20',
    textShadow: '0 0 20px rgba(147, 51, 234, 0.8)',
  },
  5: { // Level 25-29: Master
    name: 'Master',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    borderGradient: 'from-rose-400 to-fuchsia-500',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    particleColors: ['#f43f5e', '#ec4899', '#d946ef'],
    icon: Flame,
    ringEffect: 'ring-2 ring-pink-400/60 ring-offset-2 ring-offset-pink-900/30',
    textShadow: '0 0 20px rgba(236, 72, 153, 0.8)',
  },
  6: { // Level 30-34: Grandmaster
    name: 'Grandmaster',
    gradient: 'from-orange-500 via-red-500 to-orange-600',
    borderGradient: 'from-orange-400 to-red-500',
    glowColor: 'rgba(239, 68, 68, 0.7)',
    particleColors: ['#f97316', '#ef4444', '#fbbf24'],
    icon: Flame,
    ringEffect: 'ring-4 ring-red-500/50 ring-offset-2 ring-offset-red-900/40',
    textShadow: '0 0 25px rgba(239, 68, 68, 0.9)',
  },
  7: { // Level 35-39: Legend
    name: 'Legend',
    gradient: 'from-violet-600 via-purple-500 to-indigo-600',
    borderGradient: 'from-violet-500 to-indigo-500',
    glowColor: 'rgba(139, 92, 246, 0.8)',
    particleColors: ['#8b5cf6', '#a855f7', '#6366f1'],
    icon: Crown,
    ringEffect: 'ring-4 ring-violet-500/60 ring-offset-2 ring-offset-violet-900/50',
    textShadow: '0 0 25px rgba(139, 92, 246, 0.9)',
  },
  8: { // Level 40-44: Mythic
    name: 'Mythic',
    gradient: 'from-emerald-400 via-teal-400 to-cyan-500',
    borderGradient: 'from-emerald-400 to-cyan-400',
    glowColor: 'rgba(52, 211, 153, 0.8)',
    particleColors: ['#34d399', '#2dd4bf', '#22d3ee'],
    icon: Sparkles,
    ringEffect: 'ring-4 ring-emerald-400/60 ring-offset-2 ring-offset-emerald-900/50',
    textShadow: '0 0 30px rgba(52, 211, 153, 0.9)',
  },
  9: { // Level 45-49: Immortal
    name: 'Immortal',
    gradient: 'from-yellow-300 via-amber-400 to-orange-500',
    borderGradient: 'from-yellow-300 to-orange-400',
    glowColor: 'rgba(251, 191, 36, 0.9)',
    particleColors: ['#fde047', '#fbbf24', '#f97316', '#ffffff'],
    icon: Crown,
    ringEffect: 'ring-4 ring-yellow-400/70 ring-offset-2 ring-offset-amber-900/60',
    textShadow: '0 0 35px rgba(251, 191, 36, 1)',
  },
  10: { // Level 50+: Transcendent
    name: 'Transcendent',
    gradient: 'from-white via-purple-200 to-pink-200',
    borderGradient: 'from-white to-pink-300',
    glowColor: 'rgba(255, 255, 255, 0.9)',
    particleColors: ['#ffffff', '#f0abfc', '#c084fc', '#fde047'],
    icon: InfinityIcon,
    ringEffect: 'ring-4 ring-white/80 ring-offset-4 ring-offset-purple-500/50',
    textShadow: '0 0 40px rgba(255, 255, 255, 1)',
  },
};

function getLevelTier(level: number): LevelTier {
  const tierIndex = Math.min(Math.floor(level / 5), 10);
  return LEVEL_TIERS[tierIndex];
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    container: 'px-3 py-2',
    levelText: 'text-sm',
    levelBadge: 'w-10 h-10 text-sm',
    progressHeight: 'h-1.5',
    xpText: 'text-xs',
    icon: 'w-3 h-3',
    badgeIcon: 'w-3 h-3',
    particles: 6,
  },
  md: {
    container: 'px-4 py-3',
    levelText: 'text-base',
    levelBadge: 'w-12 h-12 text-base',
    progressHeight: 'h-2',
    xpText: 'text-sm',
    icon: 'w-4 h-4',
    badgeIcon: 'w-4 h-4',
    particles: 8,
  },
  lg: {
    container: 'px-6 py-4',
    levelText: 'text-lg',
    levelBadge: 'w-16 h-16 text-lg',
    progressHeight: 'h-3',
    xpText: 'text-base',
    icon: 'w-5 h-5',
    badgeIcon: 'w-5 h-5',
    particles: 12,
  },
};

// ============================================================================
// ANIMATED COMPONENTS
// ============================================================================

function AnimatedContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 400,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

// ============================================================================
// PREMIUM LEVEL BADGE WITH PARTICLES
// ============================================================================

// Particle shape types based on tier - More unique anime/gaming style shapes
type ParticleShape =
  | 'orb' | 'sakura' | 'crescent' | 'bolt' | 'crystal'
  | 'starburst' | 'comet' | 'rune' | 'spiral' | 'nova'
  | 'feather' | 'ember' | 'shard' | 'aura' | 'prism';

interface BadgeParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  speed: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  shape: ParticleShape;
  pulsePhase: number;
}

// Get particle shapes based on tier level - unique combinations
function getTierParticleShapes(tier: number): ParticleShape[] {
  switch (tier) {
    case 1: return ['orb', 'crystal']; // Silver - elegant crystals
    case 2: return ['starburst', 'crystal', 'orb']; // Gold - shiny bursts
    case 3: return ['sakura', 'crescent', 'starburst']; // Platinum - ethereal
    case 4: return ['prism', 'nova', 'crystal']; // Diamond - prismatic
    case 5: return ['ember', 'bolt', 'nova']; // Master - energy
    case 6: return ['ember', 'comet', 'bolt']; // Grandmaster - fiery
    case 7: return ['rune', 'aura', 'spiral']; // Legend - mystical
    case 8: return ['feather', 'aura', 'nova', 'rune']; // Mythic - divine
    case 9: return ['comet', 'nova', 'ember', 'spiral']; // Immortal - cosmic
    case 10: return ['nova', 'aura', 'prism', 'sakura', 'comet']; // Transcendent - all
    default: return ['orb'];
  }
}

// SVG path generator for unique shapes
function getParticlePath(shape: ParticleShape, size: number): string {
  const s = size;

  switch (shape) {
    case 'sakura':
      // Cherry blossom petal - anime style
      return `M 0 ${-s}
              C ${s * 0.3} ${-s * 0.8} ${s * 0.8} ${-s * 0.3} ${s * 0.5} ${s * 0.2}
              C ${s * 0.3} ${s * 0.5} ${s * 0.1} ${s * 0.8} 0 ${s * 0.6}
              C ${-s * 0.1} ${s * 0.8} ${-s * 0.3} ${s * 0.5} ${-s * 0.5} ${s * 0.2}
              C ${-s * 0.8} ${-s * 0.3} ${-s * 0.3} ${-s * 0.8} 0 ${-s} Z`;

    case 'crescent':
      // Crescent moon
      return `M ${s * 0.5} ${-s * 0.8}
              A ${s} ${s} 0 1 1 ${s * 0.5} ${s * 0.8}
              A ${s * 0.7} ${s * 0.7} 0 1 0 ${s * 0.5} ${-s * 0.8} Z`;

    case 'bolt':
      // Lightning bolt
      return `M ${-s * 0.2} ${-s} L ${s * 0.4} ${-s * 0.1} L ${s * 0.1} ${-s * 0.1}
              L ${s * 0.5} ${s} L ${-s * 0.1} ${s * 0.1} L ${s * 0.1} ${s * 0.1}
              L ${-s * 0.5} ${-s * 0.3} L ${-s * 0.2} ${-s * 0.3} Z`;

    case 'crystal':
      // Geometric crystal shard
      return `M 0 ${-s} L ${s * 0.4} ${-s * 0.3} L ${s * 0.3} ${s * 0.5}
              L 0 ${s} L ${-s * 0.3} ${s * 0.5} L ${-s * 0.4} ${-s * 0.3} Z`;

    case 'starburst':
      // 8-pointed starburst with thin rays
      let burstPath = '';
      for (let i = 0; i < 8; i++) {
        const angle1 = (i * 45) * Math.PI / 180;
        const angle2 = (i * 45 + 22.5) * Math.PI / 180;
        const outerX = Math.cos(angle1) * s;
        const outerY = Math.sin(angle1) * s;
        const innerX = Math.cos(angle2) * s * 0.3;
        const innerY = Math.sin(angle2) * s * 0.3;
        burstPath += `${i === 0 ? 'M' : 'L'} ${outerX} ${outerY} L ${innerX} ${innerY} `;
      }
      return burstPath + 'Z';

    case 'comet':
      // Comet with tail
      return `M ${s} 0
              Q ${s * 0.3} ${-s * 0.3} 0 0
              Q ${s * 0.3} ${s * 0.3} ${s} 0 Z
              M 0 0 L ${-s * 1.5} ${s * 0.15} L ${-s * 1.2} 0 L ${-s * 1.5} ${-s * 0.15} Z`;

    case 'rune':
      // Mystical rune symbol
      return `M 0 ${-s} L ${s * 0.6} ${s * 0.3} L 0 ${s * 0.1} L ${-s * 0.6} ${s * 0.3} Z
              M 0 ${s * 0.1} L 0 ${s}
              M ${-s * 0.3} ${-s * 0.3} L ${s * 0.3} ${-s * 0.3}`;

    case 'spiral':
      // Spiral energy
      const spiralPoints = [];
      for (let i = 0; i <= 540; i += 30) {
        const angle = i * Math.PI / 180;
        const radius = s * (i / 540) * 0.8;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        spiralPoints.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
      }
      return spiralPoints.join(' ');

    case 'nova':
      // Supernova burst - thin pointed rays
      let novaPath = '';
      for (let i = 0; i < 12; i++) {
        const angle1 = (i * 30) * Math.PI / 180;
        const angle2 = (i * 30 + 15) * Math.PI / 180;
        const outerX = Math.cos(angle1) * s;
        const outerY = Math.sin(angle1) * s;
        const innerX = Math.cos(angle2) * s * 0.15;
        const innerY = Math.sin(angle2) * s * 0.15;
        novaPath += `${i === 0 ? 'M' : 'L'} ${outerX} ${outerY} L ${innerX} ${innerY} `;
      }
      return novaPath + 'Z';

    case 'feather':
      // Angel feather
      return `M 0 ${-s}
              C ${s * 0.15} ${-s * 0.6} ${s * 0.25} ${-s * 0.2} ${s * 0.2} ${s * 0.3}
              C ${s * 0.15} ${s * 0.6} ${s * 0.05} ${s * 0.9} 0 ${s}
              C ${-s * 0.05} ${s * 0.9} ${-s * 0.15} ${s * 0.6} ${-s * 0.2} ${s * 0.3}
              C ${-s * 0.25} ${-s * 0.2} ${-s * 0.15} ${-s * 0.6} 0 ${-s} Z
              M 0 ${-s * 0.8} L 0 ${s * 0.8}`;

    case 'ember':
      // Fire ember with wavy edges
      return `M 0 ${-s}
              Q ${s * 0.6} ${-s * 0.7} ${s * 0.4} ${-s * 0.2}
              Q ${s * 0.7} ${s * 0.1} ${s * 0.3} ${s * 0.5}
              Q ${s * 0.4} ${s * 0.9} 0 ${s}
              Q ${-s * 0.4} ${s * 0.9} ${-s * 0.3} ${s * 0.5}
              Q ${-s * 0.7} ${s * 0.1} ${-s * 0.4} ${-s * 0.2}
              Q ${-s * 0.6} ${-s * 0.7} 0 ${-s} Z`;

    case 'shard':
      // Sharp crystal shard
      return `M 0 ${-s} L ${s * 0.25} ${-s * 0.4} L ${s * 0.15} ${s * 0.7}
              L 0 ${s} L ${-s * 0.15} ${s * 0.7} L ${-s * 0.25} ${-s * 0.4} Z`;

    case 'aura':
      // Aura ring with gaps
      const auraPath = [];
      for (let i = 0; i < 6; i++) {
        const startAngle = i * 60 + 10;
        const endAngle = i * 60 + 50;
        const startRad = startAngle * Math.PI / 180;
        const endRad = endAngle * Math.PI / 180;
        const outerR = s;
        const innerR = s * 0.7;
        auraPath.push(`M ${Math.cos(startRad) * outerR} ${Math.sin(startRad) * outerR}
                       A ${outerR} ${outerR} 0 0 1 ${Math.cos(endRad) * outerR} ${Math.sin(endRad) * outerR}
                       L ${Math.cos(endRad) * innerR} ${Math.sin(endRad) * innerR}
                       A ${innerR} ${innerR} 0 0 0 ${Math.cos(startRad) * innerR} ${Math.sin(startRad) * innerR} Z`);
      }
      return auraPath.join(' ');

    case 'prism':
      // Triangular prism with light refraction effect
      return `M 0 ${-s} L ${s * 0.9} ${s * 0.5} L ${-s * 0.9} ${s * 0.5} Z
              M 0 ${-s * 0.5} L ${s * 0.45} ${s * 0.25} L ${-s * 0.45} ${s * 0.25} Z`;

    case 'orb':
    default:
      return ''; // Use circle element with gradient instead
  }
}

function LevelBadgeParticles({
  level,
  particleCount,
  colors,
}: {
  level: number;
  particleCount: number;
  colors: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<BadgeParticle[]>([]);
  const particleIdRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  const tier = Math.floor(level / 5);
  const isActive = level >= 5; // Particles start at level 5
  const intensity = Math.min(tier, 10);
  const shapes = getTierParticleShapes(tier);

  // Spawn particles around the badge
  useEffect(() => {
    if (!isActive) return;

    const spawnParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 28 + Math.random() * 12;

      const newParticle: BadgeParticle = {
        id: particleIdRef.current++,
        x: 50 + Math.cos(angle) * distance,
        y: 50 + Math.sin(angle) * distance,
        size: 2.5 + Math.random() * (1.5 + intensity * 0.4),
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: angle,
        speed: 0.25 + Math.random() * 0.35 + intensity * 0.04,
        opacity: 0.7 + Math.random() * 0.3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        pulsePhase: Math.random() * Math.PI * 2,
      };

      setParticles(prev => [...prev.slice(-(particleCount * 2)), newParticle]);
    };

    const spawnInterval = setInterval(spawnParticle, Math.max(180 - intensity * 12, 70));
    return () => clearInterval(spawnInterval);
  }, [isActive, particleCount, colors, intensity, shapes]);

  // Animate particles outward in a spiral with rotation
  useEffect(() => {
    if (!isActive || particles.length === 0) return;

    const animateParticles = () => {
      setParticles(prev =>
        prev
          .map(p => {
            const newAngle = p.angle + 0.015 + (intensity * 0.002);
            const distance = Math.sqrt(Math.pow(p.x - 50, 2) + Math.pow(p.y - 50, 2));
            const newDistance = distance + p.speed;

            return {
              ...p,
              x: 50 + Math.cos(newAngle) * newDistance,
              y: 50 + Math.sin(newAngle) * newDistance,
              angle: newAngle,
              opacity: p.opacity - 0.012,
              size: p.size * 0.997,
              rotation: p.rotation + p.rotationSpeed,
            };
          })
          .filter(p => p.opacity > 0 && p.x >= -15 && p.x <= 115 && p.y >= -15 && p.y <= 115)
      );

      animationRef.current = requestAnimationFrame(animateParticles);
    };

    animationRef.current = requestAnimationFrame(animateParticles);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, particles.length, intensity]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: 0 }}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute"
        style={{
          width: '220%',
          height: '220%',
          left: '-60%',
          top: '-60%',
        }}
      >
        <defs>
          {/* Glow filters for each particle */}
          {particles.map(particle => (
            <filter key={`glow-${particle.id}`} id={`glow-${particle.id}`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation={particle.size * 0.8} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {particles.map(particle => {
          const path = getParticlePath(particle.shape, particle.size);

          if (particle.shape === 'orb' || !path) {
            return (
              <circle
                key={particle.id}
                cx={particle.x}
                cy={particle.y}
                r={particle.size}
                fill={particle.color}
                opacity={particle.opacity}
                filter={`url(#glow-${particle.id})`}
              />
            );
          }

          return (
            <path
              key={particle.id}
              d={path}
              fill={particle.color}
              opacity={particle.opacity}
              transform={`translate(${particle.x}, ${particle.y}) rotate(${particle.rotation})`}
              filter={`url(#glow-${particle.id})`}
            />
          );
        })}
      </svg>
    </div>
  );
}

// Orbiting ring effect for higher tiers
function OrbitingRing({ level, glowColor }: { level: number; glowColor: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const tier = Math.floor(level / 5);

  useEffect(() => {
    if (!ref.current || tier < 2) return;

    animate(ref.current, {
      rotate: [0, 360],
      duration: Math.max(4000 - tier * 300, 1500),
      loop: true,
      ease: 'linear',
    });
  }, [tier]);

  if (tier < 2) return null;

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '130%',
        height: '130%',
        left: '-15%',
        top: '-15%',
      }}
    >
      {/* Orbiting dots */}
      {Array.from({ length: Math.min(tier, 6) }).map((_, i) => {
        const angle = (i / Math.min(tier, 6)) * 360;
        return (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: glowColor.replace(/[\d.]+\)$/, '1)'),
              boxShadow: `0 0 6px ${glowColor}`,
              left: '50%',
              top: '50%',
              transform: `rotate(${angle}deg) translateX(50%) translateY(-50%)`,
              transformOrigin: '0 0',
            }}
          />
        );
      })}
    </div>
  );
}

// Pulsing glow effect
function PulsingGlow({ level, glowColor }: { level: number; glowColor: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const tier = Math.floor(level / 5);

  useEffect(() => {
    if (!ref.current || tier < 1) return;

    animate(ref.current, {
      scale: [1, 1.1 + tier * 0.02, 1],
      opacity: [0.4, 0.7 + tier * 0.03, 0.4],
      duration: Math.max(2000 - tier * 100, 800),
      loop: true,
      ease: 'inOutSine',
    });
  }, [tier]);

  if (tier < 1) return null;

  return (
    <div
      ref={ref}
      className="absolute inset-0 rounded-xl pointer-events-none"
      style={{
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        opacity: 0.4,
      }}
    />
  );
}

// Premium Level Badge
function PremiumLevelBadge({
  level,
  size,
  isMaxLevel,
}: {
  level: number;
  size: 'sm' | 'md' | 'lg';
  isMaxLevel: boolean;
}) {
  const badgeRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const config = SIZE_CONFIG[size];
  const tier = getLevelTier(level);
  const TierIcon = tier.icon;
  const tierIndex = Math.floor(level / 5);

  // Hover animations
  const handleMouseEnter = () => {
    if (badgeRef.current) {
      animate(badgeRef.current, { scale: 1.08, duration: 200, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (badgeRef.current) {
      animate(badgeRef.current, { scale: 1, duration: 200, ease: 'outQuad' });
    }
  };

  // Shine animation
  useEffect(() => {
    if (!shineRef.current) return;

    const runShine = () => {
      if (!shineRef.current) return;
      shineRef.current.style.transition = 'none';
      shineRef.current.style.transform = 'translateX(-100%) rotate(25deg)';
      void shineRef.current.offsetHeight;
      shineRef.current.style.transition = 'transform 1s ease-in-out';
      shineRef.current.style.transform = 'translateX(200%) rotate(25deg)';
    };

    runShine();
    const interval = setInterval(runShine, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Particles (level 5+) */}
      <LevelBadgeParticles
        level={level}
        particleCount={config.particles}
        colors={tier.particleColors}
      />

      {/* Orbiting ring (level 10+) */}
      <OrbitingRing level={level} glowColor={tier.glowColor} />

      {/* Pulsing glow (level 5+) */}
      <PulsingGlow level={level} glowColor={tier.glowColor} />

      {/* Main badge */}
      <div
        ref={badgeRef}
        className={`
          relative ${config.levelBadge} flex items-center justify-center
          bg-gradient-to-br ${tier.gradient}
          rounded-xl font-bold text-white cursor-pointer
          ${tier.ringEffect}
          transition-shadow duration-300
          overflow-hidden
        `}
        style={{
          boxShadow: `
            0 0 20px ${tier.glowColor},
            0 4px 15px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -2px 5px rgba(0, 0, 0, 0.2)
          `,
          textShadow: tier.textShadow,
        }}
      >
        {/* Inner border gradient */}
        <div
          className={`absolute inset-0.5 rounded-lg bg-gradient-to-br ${tier.gradient} opacity-50`}
        />

        {/* Shine effect */}
        <div
          ref={shineRef}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            transform: 'translateX(-100%) rotate(25deg)',
            width: '50%',
          }}
        />

        {/* Level number or icon */}
        <div className="relative z-10 flex flex-col items-center">
          {isMaxLevel ? (
            <InfinityIcon className={config.badgeIcon} />
          ) : (
            <>
              {tierIndex >= 2 && (
                <TierIcon className="w-3 h-3 mb-0.5 opacity-80" />
              )}
              <span className="leading-none">{level}</span>
            </>
          )}
        </div>

        {/* Corner accents for higher tiers */}
        {tierIndex >= 4 && (
          <>
            <div
              className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 rounded-tl-lg"
              style={{ borderColor: tier.glowColor.replace(/[\d.]+\)$/, '0.8)') }}
            />
            <div
              className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 rounded-tr-lg"
              style={{ borderColor: tier.glowColor.replace(/[\d.]+\)$/, '0.8)') }}
            />
            <div
              className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 rounded-bl-lg"
              style={{ borderColor: tier.glowColor.replace(/[\d.]+\)$/, '0.8)') }}
            />
            <div
              className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 rounded-br-lg"
              style={{ borderColor: tier.glowColor.replace(/[\d.]+\)$/, '0.8)') }}
            />
          </>
        )}
      </div>

      {/* Tier name tooltip on hover (for larger sizes) */}
      {size === 'lg' && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap"
            style={{
              backgroundColor: tier.glowColor.replace(/[\d.]+\)$/, '0.2)'),
              color: tier.glowColor.replace(/[\d.]+\)$/, '1)'),
              textShadow: tier.textShadow,
            }}
          >
            {tier.name}
          </span>
        </div>
      )}
    </div>
  );
}

function AnimatedProgressBar({
  progress,
  isMaxLevel,
  className,
}: {
  progress: number;
  isMaxLevel: boolean;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        width: [0, `${isMaxLevel ? 100 : progress}%`],
        duration: 500,
        ease: 'outQuad',
      });
    }
  }, [progress, isMaxLevel]);

  // Continuous shine animation using CSS transition
  useEffect(() => {
    if (!shineRef.current) return;

    const runShine = () => {
      if (!shineRef.current) return;

      // Reset position instantly
      shineRef.current.style.transition = 'none';
      shineRef.current.style.transform = 'translateX(-100%)';

      // Force reflow
      shineRef.current.offsetHeight;

      // Animate to end position
      shineRef.current.style.transition = 'transform 2s ease-in-out';
      shineRef.current.style.transform = 'translateX(200%)';
    };

    runShine();
    const interval = setInterval(runShine, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className}>
      <div
        ref={ref}
        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative overflow-hidden"
        style={{ width: 0 }}
      >
        {/* Shine effect */}
        <div
          ref={shineRef}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ transform: 'translateX(-100%)' }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function LevelProgress({
  showDetails = true,
  size = 'md',
}: LevelProgressProps) {
  const { user } = useAuth();
  const level = user?.profile?.level ?? 1;
  const totalXp = user?.profile?.totalXp ?? 0;

  // Calculate XP progress locally
  // Formula: 100 XP base, increases by 50 XP per level (matches backend)
  // Level 1→2: 100 XP, Level 2→3: 150 XP, Level 10→11: 550 XP
  const getRequiredXpForLevel = useCallback((lvl: number) => {
    return 100 + (lvl - 1) * 50;
  }, []);

  // Calculate current XP within level and required XP
  let accumulatedXp = 0;
  for (let i = 1; i < level; i++) {
    accumulatedXp += getRequiredXpForLevel(i);
  }
  const currentXp = totalXp - accumulatedXp;
  const requiredXp = getRequiredXpForLevel(level);
  const progress = requiredXp > 0 ? (currentXp / requiredXp) * 100 : 0;

  const config = SIZE_CONFIG[size];
  const isMaxLevel = level >= 50; // Max level for infinite mode

  const tier = getLevelTier(level);

  return (
    <AnimatedContainer className={`bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 ${config.container}`}>
      <div className="flex items-center gap-4">
        {/* Premium Level Badge */}
        <PremiumLevelBadge level={level} size={size} isMaxLevel={isMaxLevel} />

        {/* Progress Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp className={`${config.icon} text-purple-400`} />
              <span className={`${config.levelText} font-semibold text-white`}>
                {isMaxLevel ? 'Max Level' : `Level ${level}`}
              </span>
              {/* Tier name badge */}
              {level >= 5 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: tier.glowColor.replace(/[\d.]+\)$/, '0.15)'),
                    color: tier.glowColor.replace(/[\d.]+\)$/, '1)'),
                  }}
                >
                  {tier.name}
                </span>
              )}
            </div>
            {showDetails && !isMaxLevel && (
              <span className={`${config.xpText} text-zinc-400 tabular-nums`}>
                {currentXp} / {requiredXp} XP
              </span>
            )}
            {isMaxLevel && (
              <span className={`${config.xpText} text-purple-400 font-semibold flex items-center gap-1`}>
                <InfinityIcon className={config.icon} />
                <span>Infinite</span>
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <AnimatedProgressBar
            progress={progress}
            isMaxLevel={isMaxLevel}
            className={`w-full bg-zinc-800/50 rounded-full overflow-hidden ${config.progressHeight}`}
          />

          {/* Additional Details */}
          {showDetails && size === 'lg' && !isMaxLevel && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {Math.round(progress)}% to next level
              </span>
              <span className="text-xs text-purple-400 font-medium">
                {requiredXp - currentXp} XP needed
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Level Up Animation Trigger (can be used for celebrations) */}
      {/* This would typically be triggered when level increases */}
    </AnimatedContainer>
  );
}

// ============================================================================
// LEVEL UP CELEBRATION COMPONENT (Optional)
// ============================================================================

interface LevelUpCelebrationProps {
  newLevel: number;
  onComplete: () => void;
}

export function LevelUpCelebration({ newLevel, onComplete }: LevelUpCelebrationProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: [0, 1],
        duration: 300,
        ease: 'outQuad',
      });
    }
    if (contentRef.current) {
      animate(contentRef.current, {
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 400,
        delay: 200,
        ease: 'outQuad',
      });
    }
    if (emojiRef.current) {
      // Celebratory animation
      const runAnimation = () => {
        animate(emojiRef.current, {
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
          duration: 500,
          ease: 'outQuad',
        });
      };
      runAnimation();
      const interval = setInterval(runAnimation, 600);
      setTimeout(() => clearInterval(interval), 1800);
    }
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      style={{ opacity: 0 }}
      onClick={onComplete}
    >
      <div
        ref={contentRef}
        className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500 rounded-2xl p-8 text-center"
        style={{ opacity: 0 }}
      >
        <div ref={emojiRef} className="text-6xl mb-4">
          🎉
        </div>
        <h2 className="text-4xl font-bold text-white mb-2">Level Up!</h2>
        <p className="text-2xl text-purple-400 mb-4">
          You've reached <span className="font-bold text-white">Level {newLevel}</span>
        </p>
        <p className="text-zinc-400 text-sm">Click anywhere to continue</p>
      </div>
    </div>
  );
}
