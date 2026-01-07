'use client';

import { Heart, Flame, Star, Trophy } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { animate } from '@/lib/animejs';

interface GameStatsProps {
  lives: number;
  maxLives: number;
  streak: number;
  points: number;
  highStreak: number;
}

// ============================================================================
// PARTICLE TRAIL EFFECT FOR STREAK (CSS-only on mobile for performance)
// ============================================================================

function StreakParticles({ streak }: { streak: number }) {
  const intensity = Math.floor(streak / 5);
  const isActive = streak >= 5;

  if (!isActive) return null;

  // Use CSS animation only - no JS particle system for better mobile performance
  const getGlowColor = () => {
    if (intensity >= 5) return 'rgba(251, 191, 36, 0.6)'; // Gold
    if (intensity >= 4) return 'rgba(34, 211, 238, 0.6)'; // Cyan
    if (intensity >= 3) return 'rgba(192, 132, 252, 0.6)'; // Purple
    if (intensity >= 2) return 'rgba(239, 68, 68, 0.6)'; // Red
    return 'rgba(249, 115, 22, 0.6)'; // Orange
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg"
      style={{ zIndex: 0 }}
    >
      {/* Simple CSS glow effect instead of particles */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: `radial-gradient(ellipse at center bottom, ${getGlowColor()}, transparent 70%)`,
          animationDuration: `${Math.max(1.5 - intensity * 0.1, 0.8)}s`,
        }}
      />
    </div>
  );
}

// Glowing flame effect that intensifies with streak (CSS-only for performance)
function GlowingFlame({ streak }: { streak: number }) {
  const intensity = Math.floor(streak / 5);
  const isActive = streak >= 5;

  // Color based on intensity
  const getFlameColor = () => {
    if (intensity >= 5) return 'text-yellow-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]';
    if (intensity >= 4) return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]';
    if (intensity >= 3) return 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]';
    if (intensity >= 2) return 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]';
    return 'text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]';
  };

  return (
    <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
      <Flame className={`w-5 h-5 ${isActive ? getFlameColor() : 'text-orange-500'}`} />
      {isActive && (
        <Flame
          className={`absolute inset-0 w-5 h-5 ${getFlameColor()} blur-sm`}
          style={{ opacity: 0.5 }}
        />
      )}
    </div>
  );
}

// ============================================================================
// ANIMATED HELPER COMPONENTS
// ============================================================================

function AnimatedHeart({ index, lives, lostLife }: { index: number; lives: number; lostLife: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && lostLife && index === lives) {
      animate(ref.current, {
        scale: [1, 1.3, 0.8, 1],
        rotate: [0, -10, 10, 0],
        duration: 500,
        ease: 'outQuad',
      });
    }
  }, [lostLife, index, lives]);

  return (
    <div ref={ref}>
      {index < lives ? (
        <Heart className="w-6 h-6 fill-red-500 text-red-500" />
      ) : (
        <Heart className="w-6 h-6 text-gray-700" />
      )}
    </div>
  );
}

function AnimatedNumber({ value, className }: { value: number; className: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (ref.current && prevValueRef.current !== value) {
      // Animate out old value and in new value
      animate(ref.current, {
        translateY: [0, -20],
        opacity: [1, 0],
        duration: 150,
        ease: 'inQuad',
        onComplete: () => {
          if (ref.current) {
            ref.current.textContent = String(value);
            animate(ref.current, {
              translateY: [20, 0],
              opacity: [0, 1],
              duration: 150,
              ease: 'outQuad',
            });
          }
        },
      });
      prevValueRef.current = value;
    }
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GameStats({ lives, streak, points, highStreak, maxLives }: GameStatsProps) {
  const [prevLives, setPrevLives] = useState(lives);
  const [lostLife, setLostLife] = useState(false);

  useEffect(() => {
    if (lives < prevLives) {
      setLostLife(true);
      setTimeout(() => setLostLife(false), 500);
    }
    setPrevLives(lives);
  }, [lives, prevLives]);

  return (
    <div className="w-full bg-gray-900/80 backdrop-blur-sm border-b-2 border-purple-500/30 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 flex-wrap">
        {/* Lives */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: maxLives }).map((_, index) => (
              <AnimatedHeart key={index} index={index} lives={lives} lostLife={lostLife} />
            ))}
          </div>
          <span className="text-gray-400 text-sm font-medium">
            {lives}/{maxLives}
          </span>
        </div>

        {/* Current Streak with Particle Effect */}
        <div className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
          streak >= 5
            ? streak >= 25
              ? 'bg-yellow-500/20 border-yellow-500/50'
              : streak >= 20
                ? 'bg-cyan-500/20 border-cyan-500/50'
                : streak >= 15
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : streak >= 10
                    ? 'bg-red-500/20 border-red-500/50'
                    : 'bg-orange-500/20 border-orange-500/50'
            : 'bg-orange-500/10 border-orange-500/30'
        }`}>
          <StreakParticles streak={streak} />
          <GlowingFlame streak={streak} />
          <div className="flex flex-col relative z-10">
            <span className="text-xs text-gray-400">Streak</span>
            <AnimatedNumber
              value={streak}
              className={`text-lg font-bold ${
                streak >= 25
                  ? 'text-yellow-400'
                  : streak >= 20
                    ? 'text-cyan-400'
                    : streak >= 15
                      ? 'text-purple-400'
                      : streak >= 10
                        ? 'text-red-500'
                        : 'text-orange-500'
              }`}
            />
          </div>
        </div>

        {/* Points */}
        <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/30">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Points</span>
            <AnimatedNumber value={points} className="text-lg font-bold text-yellow-500" />
          </div>
        </div>

        {/* High Streak */}
        <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/30">
          <Trophy className="w-5 h-5 text-purple-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Best</span>
            <AnimatedNumber value={highStreak} className="text-lg font-bold text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
