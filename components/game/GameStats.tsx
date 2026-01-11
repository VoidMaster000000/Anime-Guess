'use client';

import { Heart, Flame, Star, Trophy, Zap, Shield } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from '@/lib/animations';
import { gsap } from '@/lib/animations';

interface GameStatsProps {
  lives: number;
  maxLives: number;
  streak: number;
  points: number;
  highStreak: number;
}

// ============================================================================
// STREAK FIRE EFFECT - Enhanced visual feedback
// ============================================================================

function StreakFireEffect({ streak }: { streak: number }) {
  const intensity = Math.floor(streak / 5);
  const isActive = streak >= 3;

  // Always render same structure, use CSS to hide to prevent flicker
  const getGlowColor = () => {
    if (intensity >= 5) return 'from-yellow-400/60 to-orange-500/40'; // Gold
    if (intensity >= 4) return 'from-cyan-400/60 to-blue-500/40'; // Cyan
    if (intensity >= 3) return 'from-purple-400/60 to-pink-500/40'; // Purple
    if (intensity >= 2) return 'from-red-400/60 to-orange-500/40'; // Red
    return 'from-orange-400/60 to-amber-500/40'; // Orange
  };

  // Always render same structure, use CSS to hide to prevent flicker
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none"
      style={{ display: isActive ? 'block' : 'none' }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-t ${getGlowColor()} animate-pulse`}
        style={{ animationDuration: `${Math.max(1.5 - intensity * 0.1, 0.6)}s` }}
      />
      {/* Fire particles effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2">
        {[...Array(Math.min(intensity + 2, 6))].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 w-1 bg-gradient-to-t from-orange-500 to-transparent rounded-full animate-pulse opacity-60"
            style={{
              height: `${20 + Math.random() * 30}%`,
              left: `${15 + i * 15}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${0.8 + Math.random() * 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ANIMATED HEART WITH GSAP
// ============================================================================

function AnimatedHeart({ index, lives, lostLife, maxLives }: { index: number; lives: number; lostLife: boolean; maxLives: number }) {
  const heartRef = useRef<HTMLDivElement>(null);
  const shouldAnimate = lostLife && index === lives;
  const isActive = index < lives;

  useEffect(() => {
    if (shouldAnimate && heartRef.current) {
      gsap.fromTo(heartRef.current,
        { scale: 1.5, opacity: 1, rotate: 0 },
        {
          scale: 0,
          opacity: 0,
          rotate: 180,
          duration: 0.2,
          ease: 'back.in(2)',
        }
      );
    }
  }, [shouldAnimate]);

  return (
    <motion.div
      ref={heartRef}
      initial={false}
      animate={{
        scale: isActive ? 1 : 0.8,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative"
      aria-hidden="true"
    >
      {isActive ? (
        <div className="relative">
          <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          {/* Pulse effect on active hearts */}
          <div className="absolute inset-0 animate-ping">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-red-500/30" />
          </div>
        </div>
      ) : (
        <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-700" />
      )}
    </motion.div>
  );
}

// ============================================================================
// ANIMATED NUMBER COUNTER
// ============================================================================

function AnimatedNumber({ value, className, prefix = '', suffix = '' }: { value: number; className: string; prefix?: string; suffix?: string }) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (displayValue !== value && numberRef.current) {
      // Pop animation
      gsap.fromTo(numberRef.current,
        { scale: 1.3, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.12, ease: 'back.out(2)' }
      );
      setDisplayValue(value);
    }
  }, [value, displayValue]);

  return (
    <span ref={numberRef} className={className}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  glowClass: string;
  children?: React.ReactNode;
}

function StatCard({ icon, label, value, suffix = '', colorClass, bgClass, borderClass, glowClass, children }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border backdrop-blur-sm transition-all duration-150 ${bgClass} ${borderClass} hover:${glowClass}`}
    >
      {children}
      <div className={`flex-shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider font-medium">{label}</span>
        <AnimatedNumber value={value} suffix={suffix} className={`text-lg sm:text-xl font-bold tabular-nums ${colorClass}`} />
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GameStats({ lives, streak, points, highStreak, maxLives }: GameStatsProps) {
  const [prevLives, setPrevLives] = useState(lives);
  const [lostLife, setLostLife] = useState(false);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const prevStreakRef = useRef(streak);

  // Track life loss
  useEffect(() => {
    if (lives < prevLives) {
      setLostLife(true);
      setTimeout(() => setLostLife(false), 250);
    }
    setPrevLives(lives);
  }, [lives, prevLives]);

  // Track streak milestones
  useEffect(() => {
    if (streak > prevStreakRef.current && streak % 5 === 0 && streak > 0) {
      setShowStreakBonus(true);
      setTimeout(() => setShowStreakBonus(false), 1200);
    }
    prevStreakRef.current = streak;
  }, [streak]);

  // Calculate streak tier for visual effects
  const getStreakTier = () => {
    if (streak >= 25) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', glow: 'shadow-yellow-500/30', name: 'LEGENDARY' };
    if (streak >= 20) return { color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', glow: 'shadow-cyan-500/30', name: 'EPIC' };
    if (streak >= 15) return { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50', glow: 'shadow-purple-500/30', name: 'RARE' };
    if (streak >= 10) return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', glow: 'shadow-red-500/30', name: 'HOT' };
    if (streak >= 5) return { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50', glow: 'shadow-orange-500/30', name: 'WARM' };
    return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'shadow-orange-500/20', name: '' };
  };

  const streakTier = getStreakTier();

  return (
    <div className="w-full">
      {/* Main Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-zinc-900/90 backdrop-blur-md border-b-2 border-purple-500/30 rounded-xl sm:rounded-2xl overflow-hidden"
      >
        {/* Animated gradient border effect */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 animate-pulse" />

        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
            {/* Lives Section */}
            <div className="flex items-center gap-2 sm:gap-3" role="status" aria-label={`Lives: ${lives} of ${maxLives}`}>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30" aria-hidden="true">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">HP</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: maxLives }).map((_, index) => (
                  <AnimatedHeart
                    key={index}
                    index={index}
                    lives={lives}
                    lostLife={lostLife}
                    maxLives={maxLives}
                  />
                ))}
              </div>
              <span className="text-zinc-500 text-sm font-medium ml-1">
                {lives}/{maxLives}
              </span>
            </div>

            {/* Center Stats */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              {/* Streak */}
              <div className={`relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border backdrop-blur-sm transition-all duration-150 ${streakTier.bg} ${streakTier.border}`} role="status" aria-label={`Current streak: ${streak}${streakTier.name ? `, ${streakTier.name} tier` : ''}`}>
                <StreakFireEffect streak={streak} />
                <div className="relative z-10 flex items-center gap-2 sm:gap-3">
                  <div className="relative" aria-hidden="true">
                    <Flame className={`w-5 h-5 sm:w-6 sm:h-6 ${streakTier.color} ${streak >= 5 ? 'animate-pulse' : ''}`} />
                    {streak >= 10 && (
                      <Flame className={`absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 ${streakTier.color} blur-sm opacity-60`} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">Streak</span>
                      {streakTier.name && (
                        <span className={`text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded ${streakTier.bg} ${streakTier.color}`}>
                          {streakTier.name}
                        </span>
                      )}
                    </div>
                    <AnimatedNumber value={streak} className={`text-xl sm:text-2xl font-black tabular-nums ${streakTier.color}`} />
                  </div>
                </div>

                {/* Streak bonus notification */}
                <AnimatePresence>
                  {showStreakBonus && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: -40, scale: 1 }}
                      exit={{ opacity: 0, y: -60, scale: 0.8 }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                      <div className={`px-3 py-1 rounded-full ${streakTier.bg} border ${streakTier.border} ${streakTier.color} text-xs font-bold flex items-center gap-1`} role="alert">
                        <Zap className="w-3 h-3" aria-hidden="true" />
                        {streak} STREAK BONUS!
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Points */}
              <StatCard
                icon={<Star className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400" />}
                label="Points"
                value={points}
                colorClass="text-yellow-400"
                bgClass="bg-yellow-500/10"
                borderClass="border-yellow-500/30"
                glowClass="shadow-yellow-500/20"
              />
            </div>

            {/* High Streak */}
            <StatCard
              icon={<Trophy className="w-5 h-5 sm:w-6 sm:h-6" />}
              label="Best"
              value={highStreak}
              colorClass="text-purple-400"
              bgClass="bg-purple-500/10"
              borderClass="border-purple-500/30"
              glowClass="shadow-purple-500/20"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
