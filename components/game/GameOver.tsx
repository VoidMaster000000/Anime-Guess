'use client';

import { useState, useRef, useEffect } from 'react';
import { animate } from '@/lib/animejs';
import { Trophy, Flame, Star, Play, Save, X } from 'lucide-react';

interface GameOverProps {
  isOpen: boolean;
  finalStreak: number;
  finalPoints: number;
  highStreak: number;
  onSaveScore: (username: string) => void;
  onPlayAgain: () => void;
  onClose?: () => void;
}

// ============================================================================
// ANIMATED HELPER COMPONENTS
// ============================================================================

function AnimatedBackdrop({ onClick }: { onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        duration: 300,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
      style={{ opacity: 0 }}
      onClick={onClick}
    />
  );
}

function AnimatedModal({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        scale: [0.8, 1],
        translateY: [50, 0],
        duration: 400,
        ease: 'outBack',
      });
    }
  }, []);

  return (
    <div ref={ref} className={className} onClick={onClick} style={{ opacity: 0, transform: 'scale(0.8) translateY(50px)' }}>
      {children}
    </div>
  );
}

function AnimatedTrophy() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        scale: [0, 1.2, 1],
        duration: 500,
        delay: 200,
        ease: 'outBack',
      });
    }
  }, []);

  return (
    <div ref={ref} className="inline-block mb-4" style={{ transform: 'scale(0)' }}>
      <Trophy className="w-16 h-16 text-yellow-500" />
    </div>
  );
}

function AnimatedStat({ children, className, delay }: { children: React.ReactNode; className: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateX: delay === 300 ? [-20, 0] : [20, 0],
        duration: 300,
        delay,
        ease: 'outQuad',
      });
    }
  }, [delay]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

function AnimatedElement({ children, className, delay }: { children: React.ReactNode; className: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 300,
        delay,
        ease: 'outQuad',
      });
    }
  }, [delay]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

function HoverButton({
  children,
  onClick,
  disabled,
  className,
  delay,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className: string;
  delay: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 300,
        delay,
        ease: 'outQuad',
      });
    }
  }, [delay]);

  const handleMouseEnter = () => {
    if (ref.current && !disabled) {
      animate(ref.current, { scale: 1.02, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseLeave = () => {
    if (ref.current && !disabled) {
      animate(ref.current, { scale: 1, duration: 150, ease: 'outQuad' });
    }
  };

  const handleMouseDown = () => {
    if (ref.current && !disabled) {
      animate(ref.current, { scale: 0.98, duration: 100, ease: 'outQuad' });
    }
  };

  const handleMouseUp = () => {
    if (ref.current && !disabled) {
      animate(ref.current, { scale: 1.02, duration: 100, ease: 'outQuad' });
    }
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ opacity: 0 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </button>
  );
}

function ConfettiParticle({ index, isNewRecord }: { index: number; isNewRecord: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

  useEffect(() => {
    if (!ref.current || !isNewRecord) return;

    const randomX = (Math.random() - 0.5) * 400;
    const randomY = (Math.random() - 0.5) * 400;

    animate(ref.current, {
      opacity: [1, 0],
      translateX: [0, randomX],
      translateY: [0, randomY],
      scale: [0, 1],
      duration: 1500,
      delay: index * 50,
      ease: 'outQuad',
    });
  }, [index, isNewRecord]);

  if (!isNewRecord) return null;

  return (
    <div
      ref={ref}
      className="absolute w-2 h-2 rounded-full"
      style={{
        left: '50%',
        top: '50%',
        background: colors[index % 4],
        opacity: 0,
      }}
    />
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
}: GameOverProps) {
  const [username, setUsername] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (username.trim()) {
      onSaveScore(username.trim());
      setIsSaved(true);
    }
  };

  const handlePlayAgain = () => {
    setUsername('');
    setIsSaved(false);
    onPlayAgain();
  };

  const isNewRecord = finalStreak === highStreak && finalStreak > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatedBackdrop onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <AnimatedModal className="relative w-full max-w-md" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
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
                <AnimatedTrophy />
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isNewRecord ? 'New Record!' : 'Game Over'}
                </h2>
                <p className="text-gray-400">
                  {isNewRecord ? 'Congratulations on your best streak!' : 'Nice try! Better luck next time!'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Final Streak */}
                <AnimatedStat
                  className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center"
                  delay={300}
                >
                  <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-500">{finalStreak}</div>
                  <div className="text-xs text-gray-400 mt-1">Final Streak</div>
                </AnimatedStat>

                {/* Final Points */}
                <AnimatedStat
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center"
                  delay={400}
                >
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-500">{finalPoints}</div>
                  <div className="text-xs text-gray-400 mt-1">Points Earned</div>
                </AnimatedStat>
              </div>

              {/* High Streak Display */}
              {highStreak > 0 && (
                <AnimatedElement
                  className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 mb-6 text-center"
                  delay={500}
                >
                  <div className="text-sm text-gray-400">
                    Your Best Streak: <span className="text-purple-400 font-bold">{highStreak}</span>
                  </div>
                </AnimatedElement>
              )}

              {/* Username Input */}
              {!isSaved && (
                <AnimatedElement className="mb-6" delay={600}>
                  <label className="block text-sm text-gray-400 mb-2">
                    Save your score to the leaderboard
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="Enter your username..."
                    maxLength={20}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-500 outline-none transition-all focus:border-purple-500"
                  />
                </AnimatedElement>
              )}

              {/* Saved confirmation */}
              {isSaved && (
                <AnimatedElement
                  className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center"
                  delay={0}
                >
                  <p className="text-green-400 font-medium">Score saved successfully!</p>
                </AnimatedElement>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!isSaved && (
                  <HoverButton
                    onClick={handleSave}
                    disabled={!username.trim()}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    delay={700}
                  >
                    <Save className="w-5 h-5" />
                    Save Score
                  </HoverButton>
                )}

                <HoverButton
                  onClick={handlePlayAgain}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  delay={800}
                >
                  <Play className="w-5 h-5" />
                  Play Again
                </HoverButton>
              </div>
            </div>
          </div>

          {/* Animated particles (confetti effect) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} isNewRecord={isNewRecord} />
            ))}
          </div>
        </AnimatedModal>
      </div>
    </>
  );
}
