'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy, Flame, Star, Play, Save, X, Crown, Sparkles, Target, Zap, Award } from 'lucide-react';
import { motion, AnimatePresence } from '@/lib/animations';
import { gsap } from '@/lib/animations';

interface GameOverProps {
  isOpen: boolean;
  finalStreak: number;
  finalPoints: number;
  highStreak: number;
  onSaveScore: (username: string) => void;
  onPlayAgain: () => void;
  onClose?: () => void;
  isAuthenticated?: boolean;
  username?: string;
}

// ============================================================================
// CONFETTI EFFECT
// ============================================================================

function ConfettiEffect({ isNewRecord }: { isNewRecord: boolean }) {
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNewRecord || !confettiRef.current) return;

    const particles = confettiRef.current.children;
    const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#22c55e', '#06b6d4'];

    Array.from(particles).forEach((particle, i) => {
      const el = particle as HTMLElement;
      el.style.backgroundColor = colors[i % colors.length];

      const randomX = (Math.random() - 0.5) * 500;
      const randomY = (Math.random() - 0.5) * 500;
      const randomRotate = Math.random() * 720 - 360;

      gsap.fromTo(el,
        { opacity: 1, x: 0, y: 0, scale: 0, rotation: 0 },
        {
          opacity: 0,
          x: randomX,
          y: randomY,
          scale: Math.random() * 0.5 + 0.5,
          rotation: randomRotate,
          duration: 1.2,
          delay: i * 0.02,
          ease: 'power2.out'
        }
      );
    });
  }, [isNewRecord]);

  if (!isNewRecord) return null;

  return (
    <div ref={confettiRef} className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full left-1/2 top-1/2"
          style={{
            clipPath: i % 3 === 0 ? 'polygon(50% 0%, 100% 100%, 0% 100%)' : i % 3 === 1 ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : undefined
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// ANIMATED STAT CARD
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  delay: number;
}

function StatCard({ icon, label, value, colorClass, bgClass, borderClass, delay }: StatCardProps) {
  const valueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (valueRef.current) {
      gsap.fromTo(valueRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, delay: delay + 0.2, ease: 'back.out(2)' }
      );
    }
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      className={`relative overflow-hidden rounded-2xl ${bgClass} ${borderClass} border p-4 sm:p-5`}
    >
      {/* Background glow */}
      <div className={`absolute inset-0 ${bgClass} opacity-50 blur-xl`} />

      <div className="relative flex flex-col items-center text-center">
        <div className={`mb-2 ${colorClass}`}>
          {icon}
        </div>
        <div ref={valueRef} className={`text-3xl sm:text-4xl font-black ${colorClass} tabular-nums`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-xs text-zinc-400 uppercase tracking-wider mt-1 font-medium">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GameOver({
  isOpen,
  finalStreak,
  finalPoints,
  highStreak,
  onSaveScore,
  onPlayAgain,
  onClose,
  isAuthenticated = false,
  username: authUsername,
}: GameOverProps) {
  const [guestUsername, setGuestUsername] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-save for authenticated users
  useEffect(() => {
    if (isOpen && isAuthenticated && authUsername && !isSaved && finalStreak > 0) {
      onSaveScore(authUsername);
      setIsSaved(true);
    }
  }, [isOpen, isAuthenticated, authUsername, isSaved, finalStreak, onSaveScore]);

  const handleSave = () => {
    if (guestUsername.trim()) {
      onSaveScore(guestUsername.trim());
      setIsSaved(true);
    }
  };

  const handlePlayAgain = () => {
    setGuestUsername('');
    setIsSaved(false);
    onPlayAgain();
  };

  const isNewRecord = finalStreak === highStreak && finalStreak > 0;

  // Performance rating
  const getPerformanceRating = () => {
    if (finalStreak >= 20) return { label: 'LEGENDARY', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' };
    if (finalStreak >= 15) return { label: 'EPIC', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50' };
    if (finalStreak >= 10) return { label: 'EXCELLENT', color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50' };
    if (finalStreak >= 5) return { label: 'GREAT', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' };
    if (finalStreak >= 3) return { label: 'GOOD', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' };
    return { label: 'NICE TRY', color: 'text-zinc-400', bg: 'bg-zinc-500/20', border: 'border-zinc-500/50' };
  };

  const performance = getPerformanceRating();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-md z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          ref={modalRef}
          key="modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg my-8"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Outer glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-3xl blur-xl opacity-60" />

          {/* Main card */}
          <div className="relative overflow-hidden">
            {/* Gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-2xl" />
            <div className="absolute inset-[2px] bg-zinc-900 rounded-2xl" />

            {/* Content */}
            <div className="relative p-5 sm:p-6 md:p-8">
              {/* Close button */}
              {onClose && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}

              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                {/* Trophy/Crown icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="relative inline-block mb-4"
                >
                  <div className={`absolute inset-0 ${isNewRecord ? 'bg-yellow-500/30' : 'bg-purple-500/30'} blur-2xl rounded-full scale-150`} />
                  <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center ${isNewRecord ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'}`}>
                    {isNewRecord ? (
                      <Crown className="w-10 h-10 text-white" />
                    ) : (
                      <Trophy className="w-10 h-10 text-white" />
                    )}
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl sm:text-4xl font-black mb-2">
                    <span className={`${isNewRecord ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400' : 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400'} bg-clip-text text-transparent`}>
                      {isNewRecord ? 'New Record!' : 'Game Over'}
                    </span>
                  </h2>

                  {/* Performance badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="inline-flex items-center gap-2"
                  >
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${performance.bg} ${performance.border} border ${performance.color} flex items-center gap-1`}>
                      <Sparkles className="w-3 h-3" />
                      {performance.label}
                    </span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatCard
                  icon={<Flame className="w-8 h-8" />}
                  label="Final Streak"
                  value={finalStreak}
                  colorClass="text-orange-400"
                  bgClass="bg-orange-500/10"
                  borderClass="border-orange-500/30"
                  delay={0.3}
                />
                <StatCard
                  icon={<Star className="w-8 h-8 fill-yellow-400" />}
                  label="Points Earned"
                  value={finalPoints}
                  colorClass="text-yellow-400"
                  bgClass="bg-yellow-500/10"
                  borderClass="border-yellow-500/30"
                  delay={0.4}
                />
              </div>

              {/* Best Streak */}
              {highStreak > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-zinc-400">Your Best Streak</span>
                    </div>
                    <span className="text-xl font-bold text-purple-400">{highStreak}</span>
                  </div>
                </motion.div>
              )}

              {/* Username Input - Guests only */}
              <AnimatePresence>
                {!isSaved && !isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <label className="block text-sm text-zinc-400 mb-2 font-medium">
                      Save your score to the leaderboard
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={guestUsername}
                        onChange={(e) => setGuestUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        placeholder="Enter your username..."
                        maxLength={20}
                        className="w-full px-4 py-3 bg-zinc-800/50 border-2 border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 outline-none transition-all focus:border-purple-500 focus:bg-zinc-800/80"
                      />
                      <Target className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Saved Confirmation */}
              <AnimatePresence>
                {isSaved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Zap className="w-5 h-5" />
                      <p className="font-medium">Score saved successfully!</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3"
              >
                {!isSaved && !isAuthenticated && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={!guestUsername.trim()}
                    className="flex-1 px-5 py-3.5 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-700/50"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlayAgain}
                  className="flex-1 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  <Play className="w-5 h-5" />
                  <span>Play Again</span>
                </motion.button>
              </motion.div>
            </div>
          </div>

          {/* Confetti */}
          <ConfettiEffect isNewRecord={isNewRecord} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
