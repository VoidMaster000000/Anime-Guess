'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Animated, AnimatePresence, Transition, AnimatedSplitText } from '@/lib/animejs';
import { animate, useAnimeOnMount } from '@/lib/animejs';
import { useGameStore } from '@/store/gameStore';
import { useProfileStore } from '@/store/profileStore';
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
  } = useGameStore();

  // Profile store integration
  const isAuthenticated = useProfileStore((state) => state.isAuthenticated);
  const addXp = useProfileStore((state) => state.addXp);
  const addCoins = useProfileStore((state) => state.addCoins);
  const recordGuess = useProfileStore((state) => state.recordGuess);
  const updateHighestStreak = useProfileStore((state) => state.updateHighestStreak);
  const incrementGamesPlayed = useProfileStore((state) => state.incrementGamesPlayed);

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showLevelUpNotification, setShowLevelUpNotification] = useState(false);
  const [showAntiCheatWarning, setShowAntiCheatWarning] = useState(false);

  // Anti-cheat system
  const {
    tabSwitchCount,
    isSuspicious,
    isTabVisible,
    resetAntiCheat,
  } = useAntiCheat({
    maxTabSwitches: 3,
    enabled: gameStatus === 'playing',
    onWarning: useCallback((message: string) => {
      setShowAntiCheatWarning(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowAntiCheatWarning(false), 5000);
    }, []),
    onSuspiciousActivity: useCallback((type: string, count: number) => {
      setShowAntiCheatWarning(true);
      // Don't auto-hide suspicious activity warnings
    }, []),
  });

  // Reset anti-cheat when game ends or restarts
  useEffect(() => {
    if (gameStatus === 'menu' || gameStatus === 'gameover') {
      resetAntiCheat();
      setShowAntiCheatWarning(false);
    }
  }, [gameStatus, resetAntiCheat]);

  // Show warning when returning to tab (if switches detected)
  useEffect(() => {
    if (isTabVisible && tabSwitchCount > 0 && gameStatus === 'playing') {
      setShowAntiCheatWarning(true);
    }
  }, [isTabVisible, tabSwitchCount, gameStatus]);

  // Handle guess with profile integration
  const handleGuess = (guess: string) => {
    const isCorrect = submitGuess(guess);

    // Award XP and coins if authenticated
    if (isAuthenticated) {
      if (isCorrect) {
        // Base rewards
        const baseXp = 10;
        const streakBonus = Math.min(streak * 2, 20); // Max +20 XP from streak
        // Apply penalty if suspicious activity detected
        const antiCheatPenalty = isSuspicious ? 0.5 : 1; // 50% reduction if suspicious
        const totalXp = Math.floor((baseXp + streakBonus) * antiCheatPenalty);

        const baseCoins = 5;
        const difficultyBonus = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 5 : 0;
        const hintBonus = Math.max(0, (4 - hintsRevealed) * 2); // +2 coins per unused hint
        const totalCoins = Math.floor((baseCoins + difficultyBonus + hintBonus) * antiCheatPenalty);

        // Award rewards
        addXp(totalXp);
        addCoins(totalCoins);

        // Update stats
        recordGuess(true);
        updateHighestStreak(streak + 1);
      } else {
        // Record wrong guess
        recordGuess(false);
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
        incrementGamesPlayed();
        sessionStorage.setItem('current-game-tracked', 'true');
      }
    }

    if (gameStatus === 'menu' || gameStatus === 'gameover') {
      // Clear tracking flag when game ends
      sessionStorage.removeItem('current-game-tracked');
    }
  }, [gameStatus, isAuthenticated, incrementGamesPlayed]);

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
    // Set difficulty first, then start game
    setDifficulty(selectedDifficulty as any);
    await startGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 animate-pulse" />

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
              transition={{ duration: 300 }}
              className="flex items-center justify-center min-h-[calc(100vh-4rem)]"
            >
              <div className="text-center space-y-8">
                <Animated
                  initial={{ translateY: -20, opacity: 0 }}
                  animate={{ translateY: 0, opacity: 1 }}
                  transition={{ delay: 200 }}
                >
                  <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
                    Anime Guess Game
                  </h1>
                  <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
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
              transition={{ duration: 300 }}
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
                  className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-700/50"
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
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Character Image */}
                <div className="space-y-4">
                  {currentCharacter ? (
                    <>
                      <CharacterImage
                        imageUrl={currentCharacter.image.large}
                        revealedQuadrants={hintsRevealed}
                      />

                      {/* Character Name Reference */}
                      <Animated
                        initial={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-700/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-zinc-400">Character</span>
                        </div>
                        <AnimatedSplitText
                          key={currentCharacter.name.full}
                          text={currentCharacter.name.full}
                          className="text-lg font-semibold text-white block"
                          splitBy="chars"
                          staggerDelay={25}
                          duration={300}
                          animation="fadeInUp"
                          tag="p"
                        />
                        {currentCharacter.name.native && (
                          <AnimatedSplitText
                            key={currentCharacter.name.native}
                            text={currentCharacter.name.native}
                            className="text-sm text-zinc-500 mt-1 block"
                            splitBy="chars"
                            staggerDelay={20}
                            duration={250}
                            animation="fadeIn"
                            tag="p"
                          />
                        )}
                      </Animated>

                      {/* Hint Button */}
                      <HintButton
                        hintsRevealed={hintsRevealed}
                        maxHints={maxHints}
                        onReveal={revealHint}
                        cost={0}
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-96 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                      <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
                        <p className="text-zinc-400">Loading character...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Guess Input and Info */}
                <div className="space-y-4">
                  <Animated
                    initial={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50 relative z-20"
                  >
                    <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Guess the Anime!
                    </h2>
                    <p className="text-zinc-400 mb-6">
                      Type the anime title this character appears in. The more quadrants you reveal, the easier it gets!
                    </p>

                    <GuessInput
                      onGuess={handleGuess}
                      disabled={isLoading}
                    />
                  </Animated>

                  {/* Item Usage Panel */}
                  <Animated
                    initial={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 100 }}
                    className="relative z-10"
                  >
                    <ItemUsagePanel />
                  </Animated>

                  {/* Game Tips */}
                  <Animated
                    initial={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 200 }}
                    className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30 relative z-10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-300">Pro Tips</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-zinc-300">
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
                  </Animated>
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
        maxSwitches={3}
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
        scale: [0.8, 1],
        duration: 300,
        ease: 'outQuad',
      });
    }

    if (flashRef.current) {
      animate(flashRef.current, {
        opacity: [0, 0.3, 0],
        duration: 1000,
        ease: 'inOutQuad',
      });
    }

    if (messageRef.current) {
      animate(messageRef.current, {
        opacity: [0, 1],
        scale: [0, 1],
        rotate: [-10, 0],
        duration: 500,
        ease: 'outBack',
      });
    }

    if (emojiRef.current) {
      animate(emojiRef.current, {
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0],
        duration: 500,
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

        {/* Confetti particles */}
        {[...Array(20)].map((_, i) => (
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
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref1.current) {
      animate(ref1.current, {
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        duration: 8000,
        loop: true,
        ease: 'inOutQuad',
      });
    }

    if (ref2.current) {
      animate(ref2.current, {
        scale: [1.2, 1, 1.2],
        opacity: [0.3, 0.5, 0.3],
        duration: 10000,
        loop: true,
        ease: 'inOutQuad',
      });
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
      <div
        ref={ref1}
        className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl"
      />
      <div
        ref={ref2}
        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/20 to-transparent rounded-full blur-3xl"
      />
    </div>
  );
}
