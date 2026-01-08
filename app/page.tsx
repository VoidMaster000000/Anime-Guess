'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Animated, AnimatePresence } from '@/lib/animejs';
import { animate } from '@/lib/animejs';
import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import {
  CharacterImage,
  GuessInput,
  GameStats,
  HintButton,
  GameOver,
  DifficultySelect,
  ItemUsagePanel,
  AntiCheatWarning,
} from '@/components/game';
import { Loader2, Timer, Sparkles, Award } from 'lucide-react';

export default function GamePage() {
  const {
    gameStatus,
    currentCharacter,
    hintsRevealed,
    maxHints,
    difficulty,
    timeRemaining,
    lives,
    maxLives,
    streak,
    points,
    highStreak,
    isLoading,
    startGame,
    fetchNewCharacter,
    decrementTimer,
    revealHint,
    submitGuess,
    saveToLeaderboard,
    resetGame,
    setDifficulty,
    loseLife,
  } = useGameStore();

  // Auth hook integration (MongoDB)
  const { user, isAuthenticated, updateUserStats } = useAuth();

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showLevelUpNotification, setShowLevelUpNotification] = useState(false);
  const [showAntiCheatWarning, setShowAntiCheatWarning] = useState(false);

  // Anti-cheat system (relaxed - only penalize excessive switching)
  const {
    tabSwitchCount,
    isSuspicious,
    isTabVisible,
    resetAntiCheat,
  } = useAntiCheat({
    maxTabSwitches: 10, // More lenient - allow 10 switches before penalty
    enabled: gameStatus === 'playing',
    onWarning: useCallback(() => {
      // Only show warning on first tab switch, not every time
      // Warnings are now handled inside the hook more selectively
    }, []),
    onSuspiciousActivity: useCallback((type: string, count: number) => {
      setShowAntiCheatWarning(true);
      // Lose a life as punishment for excessive cheating
      loseLife(`Cheating detected: ${type} (${count} times)`);
    }, [loseLife]),
  });

  // Reset anti-cheat when game ends or restarts
  useEffect(() => {
    if (gameStatus === 'menu' || gameStatus === 'gameover') {
      resetAntiCheat();
      setShowAntiCheatWarning(false);
    }
  }, [gameStatus, resetAntiCheat]);

  // Only show warning when approaching the limit (at 7+ switches)
  useEffect(() => {
    if (isTabVisible && tabSwitchCount >= 7 && tabSwitchCount < 10 && gameStatus === 'playing' && !isSuspicious) {
      setShowAntiCheatWarning(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => setShowAntiCheatWarning(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isTabVisible, tabSwitchCount, gameStatus, isSuspicious]);

  // Handle guess with profile integration
  const handleGuess = async (guess: string) => {
    // Get current streak BEFORE submitting (since submitGuess updates it)
    const currentStreak = streak;
    const currentHintsRevealed = hintsRevealed;

    const isCorrect = submitGuess(guess);

    // Award XP and coins if authenticated (via MongoDB API)
    if (isAuthenticated) {
      if (isCorrect) {
        // Calculate new streak (current + 1 since we just got it right)
        const newStreakValue = currentStreak + 1;

        // Base rewards
        const baseXp = 10;
        const streakBonus = Math.min(currentStreak * 2, 20); // Max +20 XP from streak
        // Apply penalty if suspicious activity detected
        const antiCheatPenalty = isSuspicious ? 0.5 : 1; // 50% reduction if suspicious
        const totalXp = Math.floor((baseXp + streakBonus) * antiCheatPenalty);

        const baseCoins = 5;
        const difficultyBonus = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 5 : 0;
        const hintBonus = Math.max(0, (4 - currentHintsRevealed) * 2); // +2 coins per unused hint
        const totalCoins = Math.floor((baseCoins + difficultyBonus + hintBonus) * antiCheatPenalty);

        // Update stats via MongoDB API
        await updateUserStats({
          xpToAdd: totalXp,
          coinsToAdd: totalCoins,
          correctGuess: true,
          newStreak: newStreakValue,
        });
      } else {
        // Record wrong guess via MongoDB API
        await updateUserStats({
          correctGuess: false,
        });
      }
    }

    return isCorrect;
  };

  // Track game start
  useEffect(() => {
    if (gameStatus === 'playing' && isAuthenticated) {
      // Increment games played when game starts
      const hasTrackedGame = sessionStorage.getItem('current-game-tracked');
      if (!hasTrackedGame) {
        // Record game start via MongoDB API
        updateUserStats({ gameWon: false }); // Just increments gamesPlayed
        sessionStorage.setItem('current-game-tracked', 'true');
      }
    }

    if (gameStatus === 'menu' || gameStatus === 'gameover') {
      // Clear tracking flag when game ends
      sessionStorage.removeItem('current-game-tracked');
    }
  }, [gameStatus, isAuthenticated, updateUserStats]);

  // Timer countdown for timed mode
  useEffect(() => {
    if (difficulty === 'timed' && gameStatus === 'playing' && timeRemaining !== null && timeRemaining > 0) {
      const interval = setInterval(() => {
        decrementTimer();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [difficulty, gameStatus, timeRemaining, decrementTimer]);

  // Handle correct answer state - auto advance to next character
  useEffect(() => {
    if (gameStatus === 'correct') {
      setShowSuccessAnimation(true);

      const timeout = setTimeout(async () => {
        setShowSuccessAnimation(false);
        await fetchNewCharacter();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [gameStatus, fetchNewCharacter]);

  // Handle game start
  const handleDifficultySelect = async (selectedDifficulty: string) => {
    // Set difficulty first, then start game with auth status
    setDifficulty(selectedDifficulty as any);
    await startGame(isAuthenticated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white overflow-hidden relative">
      {/* Background gradient - static on mobile for performance */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 sm:animate-pulse" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <AnimatePresence mode="wait">
          {/* MENU STATE - Difficulty Selection */}
          {gameStatus === 'menu' && (
            <Animated
              key="menu"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 150 }}
              className="flex items-center justify-center min-h-[calc(100vh-4rem)]"
            >
              <div className="text-center space-y-8">
                <Animated
                  initial={{ translateY: -20, opacity: 0 }}
                  animate={{ translateY: 0, opacity: 1 }}
                  transition={{ delay: 200 }}
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 px-2">
                    Anime Guess Game
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto px-4">
                    Test your anime knowledge! Guess the anime from character images revealed quadrant by quadrant.
                  </p>
                </Animated>

                <DifficultySelect onSelect={handleDifficultySelect} />
              </div>
            </Animated>
          )}

          {/* PLAYING STATE - Main Game UI */}
          {gameStatus === 'playing' && (
            <Animated
              key="playing"
              initial={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -20 }}
              transition={{ duration: 150 }}
              className="space-y-6"
            >
              {/* Game Stats Bar */}
              <GameStats
                lives={lives}
                maxLives={maxLives}
                streak={streak}
                points={points}
                highStreak={highStreak}
              />

              {/* Timer for Timed Mode */}
              {difficulty === 'timed' && timeRemaining !== null && (
                <Animated
                  initial={{ scale: [0, 1] }}
                  animate={{ scale: 1 }}
                  className="card p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-orange-400" />
                      <span className="text-sm font-medium text-zinc-300">Time Remaining</span>
                    </div>
                    <span className={`text-2xl font-bold ${
                      timeRemaining <= 5 ? 'text-red-400 animate-pulse' :
                      timeRemaining <= 10 ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {timeRemaining}s
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        timeRemaining <= 5 ? 'bg-red-500' :
                        timeRemaining <= 10 ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(timeRemaining / 30) * 100}%` }}
                    />
                  </div>
                </Animated>
              )}

              {/* Main Game Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Left Column - Character Image */}
                <div className="space-y-4">
                  {currentCharacter ? (
                    <>
                      <CharacterImage
                        imageUrl={currentCharacter.image.large}
                        revealedQuadrants={hintsRevealed}
                      />

                      {/* Character Name Reference - simplified for mobile performance */}
                      <div className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-zinc-400">Character</span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                          {currentCharacter.name.full}
                        </p>
                        {currentCharacter.name.native && (
                          <p className="text-sm text-zinc-500 mt-1">
                            {currentCharacter.name.native}
                          </p>
                        )}
                      </div>

                      {/* Hint Button */}
                      <HintButton
                        hintsRevealed={hintsRevealed}
                        maxHints={maxHints}
                        onReveal={revealHint}
                        cost={0}
                      />
                    </>
                  ) : (
                    <div className="flex-center h-96 card">
                      <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
                        <p className="text-zinc-400">Loading character...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Guess Input and Info */}
                <div className="space-y-4">
                  <div className="card p-4 sm:p-6 relative z-20">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gradient">
                      Guess the Anime!
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-400 mb-4 sm:mb-6">
                      Type the anime title this character appears in. The more quadrants you reveal, the easier it gets!
                    </p>

                    <GuessInput
                      onGuess={handleGuess}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Item Usage Panel */}
                  <div className="relative z-10">
                    <ItemUsagePanel />
                  </div>

                  {/* Game Tips - Hidden on small mobile, visible on larger screens */}
                  <div className="hidden sm:block stat-blue p-4 sm:p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-blue-400" />
                      <h3 className="text-base sm:text-lg font-semibold text-blue-300">Pro Tips</h3>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Fewer hints used = more points earned!</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Both English and Romaji titles are accepted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Press Enter to submit your guess</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Build your streak for maximum points!</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Animated>
          )}

          {/* CORRECT STATE - Success Animation */}
          {gameStatus === 'correct' && showSuccessAnimation && (
            <SuccessOverlay currentCharacter={currentCharacter} />
          )}

          {/* GAME OVER STATE */}
          {gameStatus === 'gameover' && (
            <Animated
              key="gameover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <GameOver
                isOpen={true}
                finalStreak={streak}
                finalPoints={points}
                highStreak={highStreak}
                onSaveScore={saveToLeaderboard}
                onPlayAgain={resetGame}
                isAuthenticated={isAuthenticated}
                username={user?.username}
              />
            </Animated>
          )}
        </AnimatePresence>
      </div>

      {/* Background ambient effects */}
      <BackgroundEffects />

      {/* Anti-Cheat Warning Overlay */}
      <AntiCheatWarning
        isVisible={showAntiCheatWarning}
        tabSwitchCount={tabSwitchCount}
        maxSwitches={10}
        onDismiss={() => setShowAntiCheatWarning(false)}
        isSuspicious={isSuspicious}
      />
    </div>
  );
}

// Helper Components
function SuccessOverlay({ currentCharacter }: { currentCharacter: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 150,
        ease: 'outQuad',
      });
    }

    if (flashRef.current) {
      animate(flashRef.current, {
        opacity: [0, 0.3, 0],
        duration: 400,
        ease: 'inOutQuad',
      });
    }

    if (messageRef.current) {
      animate(messageRef.current, {
        opacity: [0, 1],
        scale: [0.8, 1],
        rotate: [-5, 0],
        duration: 200,
        ease: 'outBack',
      });
    }

    if (emojiRef.current) {
      animate(emojiRef.current, {
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0],
        duration: 400,
        loop: true,
        ease: 'inOutQuad',
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      style={{ opacity: 0 }}
    >
      {/* Green flash effect */}
      <div
        ref={flashRef}
        className="absolute inset-0 bg-green-500"
        style={{ opacity: 0 }}
      />

      {/* Success message */}
      <div
        ref={messageRef}
        className="relative text-center space-y-6 p-8"
        style={{ opacity: 0 }}
      >
        <div ref={emojiRef} className="text-8xl">
          🎉
        </div>

        <div>
          <h2 className="text-5xl font-bold text-green-400 mb-2">Correct!</h2>
          {currentCharacter && (
            <p className="text-2xl text-white">
              {currentCharacter.media[0]?.title.english ||
                currentCharacter.media[0]?.title.romaji}
            </p>
          )}
        </div>

        <div className="text-zinc-400">Loading next character...</div>

        {/* Confetti particles - fewer on mobile */}
        {[...Array(10)].map((_, i) => (
          <ConfettiParticle key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

function ConfettiParticle({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [1, 0],
        translateX: [(Math.random() - 0.5) * 400],
        translateY: [Math.random() * -400 - 100],
        scale: [1, 0],
        duration: 1500,
        delay: Math.random() * 300,
        ease: 'outQuad',
      });
    }
  }, []);

  const colors = ['#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#f59e0b'];

  return (
    <div
      ref={ref}
      className="absolute w-3 h-3 rounded-full"
      style={{
        backgroundColor: colors[Math.floor(Math.random() * 5)],
        left: '50%',
        top: '50%',
      }}
    />
  );
}

function BackgroundEffects() {
  // Use CSS-only animation for better mobile performance
  // No JS-based looping animations that cause flickering
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden hidden sm:block">
      <div
        className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-600/15 to-transparent rounded-full blur-3xl opacity-40"
      />
      <div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/15 to-transparent rounded-full blur-3xl opacity-40"
      />
    </div>
  );
}
