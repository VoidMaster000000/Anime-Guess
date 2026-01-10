'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy, Flame, Star, Play, Save, X } from 'lucide-react';
import { motion, AnimatePresence, modalVariants, backdropVariants, scaleInBounce, staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
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
// CONFETTI COMPONENT WITH GSAP
// ============================================================================

function ConfettiEffect({ isNewRecord }: { isNewRecord: boolean }) {
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNewRecord || !confettiRef.current) return;

    const particles = confettiRef.current.children;
    const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

    Array.from(particles).forEach((particle, i) => {
      const el = particle as HTMLElement;
      el.style.backgroundColor = colors[i % 4];

      const randomX = (Math.random() - 0.5) * 400;
      const randomY = (Math.random() - 0.5) * 400;

      gsap.fromTo(el,
        { opacity: 1, x: 0, y: 0, scale: 0 },
        {
          opacity: 0,
          x: randomX,
          y: randomY,
          scale: 1,
          duration: 0.8,
          delay: i * 0.025,
          ease: 'power2.out'
        }
      );
    });
  }, [isNewRecord]);

  if (!isNewRecord) return null;

  return (
    <div ref={confettiRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full left-1/2 top-1/2"
        />
      ))}
    </div>
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop overlay */}
      <motion.div
        key="backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          key="modal"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Gradient border container */}
          <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 p-[2px] rounded-2xl">
            <div className="bg-gray-900 rounded-2xl p-8">
              {/* Close button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  variants={scaleInBounce}
                  initial="hidden"
                  animate="visible"
                  className="inline-block mb-4"
                >
                  <Trophy className="w-16 h-16 text-yellow-500" />
                </motion.div>
                <motion.h2
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  {isNewRecord ? 'New Record!' : 'Game Over'}
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.15 }}
                  className="text-gray-400"
                >
                  {isNewRecord ? 'Congratulations on your best streak!' : 'Nice try! Better luck next time!'}
                </motion.p>
              </div>

              {/* Stats */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-4 mb-8"
              >
                {/* Final Streak */}
                <motion.div
                  variants={staggerItem}
                  className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center"
                >
                  <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-500">{finalStreak}</div>
                  <div className="text-xs text-gray-400 mt-1">Final Streak</div>
                </motion.div>

                {/* Final Points */}
                <motion.div
                  variants={staggerItem}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center"
                >
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-500">{finalPoints}</div>
                  <div className="text-xs text-gray-400 mt-1">Points Earned</div>
                </motion.div>
              </motion.div>

              {/* High Streak Display */}
              {highStreak > 0 && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.25 }}
                  className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 mb-6 text-center"
                >
                  <div className="text-sm text-gray-400">
                    Your Best Streak: <span className="text-purple-400 font-bold">{highStreak}</span>
                  </div>
                </motion.div>
              )}

              {/* Username Input - Only for guests */}
              <AnimatePresence>
                {!isSaved && !isAuthenticated && (
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mb-6"
                  >
                    <label className="block text-sm text-gray-400 mb-2">
                      Save your score to the leaderboard
                    </label>
                    <input
                      type="text"
                      value={guestUsername}
                      onChange={(e) => setGuestUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      placeholder="Enter your username..."
                      maxLength={20}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-500 outline-none transition-all focus:border-purple-500"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Saved confirmation */}
              <AnimatePresence>
                {isSaved && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center"
                  >
                    <p className="text-green-400 font-medium">Score saved successfully!</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex gap-3"
              >
                {!isSaved && !isAuthenticated && (
                  <motion.button
                    variants={staggerItem}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={!guestUsername.trim()}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Score
                  </motion.button>
                )}

                <motion.button
                  variants={staggerItem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlayAgain}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Play Again
                </motion.button>
              </motion.div>
            </div>
          </div>

          {/* Animated particles (confetti effect) */}
          <ConfettiEffect isNewRecord={isNewRecord} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
