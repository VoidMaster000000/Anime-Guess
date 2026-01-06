/**
 * Zustand Game Store for Anime Guessing Game
 * Manages all game state, actions, and persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  GameDifficulty,
  ShopItemType,
  type GameState,
  type Character,
  type DifficultyConfigMap,
  type ShopItem,
  type LeaderboardEntry,
  type FetchCharacterResponse,
} from '@/types';

// ============================================================================
// DIFFICULTY CONFIGURATIONS
// ============================================================================

/**
 * Difficulty configurations for the game
 * - Easy: 5 lives, 2 hints revealed at start, 0.5x points
 * - Medium: 3 lives, 1 hint revealed at start, 1x points
 * - Hard: 2 lives, 0 hints revealed at start, 2x points
 * - Timed: 3 lives, 1 hint revealed at start, 1.5x points, 30 second timer
 */
const DIFFICULTY_CONFIGS: DifficultyConfigMap = {
  [GameDifficulty.EASY]: {
    lives: 5,
    initialHints: 2,
    pointsMultiplier: 0.5,
  },
  [GameDifficulty.MEDIUM]: {
    lives: 3,
    initialHints: 1,
    pointsMultiplier: 1,
  },
  [GameDifficulty.HARD]: {
    lives: 2,
    initialHints: 0,
    pointsMultiplier: 2,
  },
  [GameDifficulty.TIMED]: {
    lives: 3,
    initialHints: 1,
    pointsMultiplier: 1.5,
    timeLimit: 30,
  },
};

// ============================================================================
// CONSTANTS
// ============================================================================

const BASE_POINTS = 100;
const HINT_BONUS = 25;
const MAX_EXTRA_HINTS = 5;
const SKIP_COST = 50;

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // ========================================================================
      // INITIAL STATE
      // ========================================================================

      // Current round data
      currentCharacter: null,
      correctAnime: [],

      // Hints system
      hintsRevealed: 0,
      maxHints: 4,
      extraHintsOwned: 0,

      // Lives and scoring
      lives: 3,
      maxLives: 3,
      streak: 0,
      highStreak: 0,
      points: 0,
      totalPoints: 0,

      // Game settings
      difficulty: GameDifficulty.MEDIUM,
      gameStatus: 'menu',
      isLoading: false,

      // Timed mode
      timeRemaining: null,

      // User mode
      isGuest: true, // Default to guest mode

      // Leaderboard
      leaderboard: [],

      // ========================================================================
      // ACTIONS
      // ========================================================================

      /**
       * Set the game difficulty
       */
      setDifficulty: (difficulty: GameDifficulty) => {
        set({ difficulty });
      },

      /**
       * Start a new game with the selected difficulty
       * @param isAuthenticated - whether user is authenticated with MongoDB
       */
      startGame: async (isAuthenticated = false) => {
        const { difficulty, extraHintsOwned, fetchNewCharacter } = get();
        const config = DIFFICULTY_CONFIGS[difficulty];

        set({
          gameStatus: 'playing',
          lives: config.lives,
          maxLives: config.lives,
          streak: 0,
          points: 0,
          hintsRevealed: config.initialHints,
          maxHints: 4 + extraHintsOwned,
          timeRemaining: config.timeLimit ?? null,
          isGuest: !isAuthenticated,
        });

        // Fetch the first character
        await fetchNewCharacter();
      },

      /**
       * Fetch a new character from the API
       */
      fetchNewCharacter: async () => {
        set({ isLoading: true });

        try {
          const { difficulty } = get();
          const response = await fetch(`/api/character?difficulty=${difficulty}`);
          const data: FetchCharacterResponse = await response.json();

          if (data.success && data.character && data.correctAnime) {
            const { difficulty, extraHintsOwned } = get();
            const config = DIFFICULTY_CONFIGS[difficulty];

            set({
              currentCharacter: data.character,
              correctAnime: data.correctAnime,
              hintsRevealed: config.initialHints,
              maxHints: 4 + extraHintsOwned,
              timeRemaining: config.timeLimit ?? null,
              isLoading: false,
              gameStatus: 'playing', // Reset to playing state for next round
            });
          } else {
            console.error('Failed to fetch character:', data.error);
            set({ isLoading: false, gameStatus: 'playing' });
          }
        } catch (error) {
          console.error('Error fetching character:', error);
          set({ isLoading: false, gameStatus: 'playing' });
        }
      },

      /**
       * Reveal one more hint (quadrant)
       */
      revealHint: () => {
        const { hintsRevealed, maxHints } = get();

        if (hintsRevealed < maxHints && hintsRevealed < 4) {
          set({ hintsRevealed: hintsRevealed + 1 });
        }
      },

      /**
       * Submit a guess for the current character
       * Returns true if correct, false if incorrect
       */
      submitGuess: (guess: string): boolean => {
        const {
          correctAnime,
          lives,
          streak,
          highStreak,
          points,
          totalPoints,
          _checkAnswer,
          _calculatePoints,
        } = get();

        // Check if the answer is correct
        const isCorrect = _checkAnswer(guess, correctAnime);

        if (isCorrect) {
          // Calculate points for this round
          const earnedPoints = _calculatePoints();
          const newStreak = streak + 1;
          const newPoints = points + earnedPoints;
          const newTotalPoints = totalPoints + earnedPoints;
          const newHighStreak = Math.max(highStreak, newStreak);

          set({
            gameStatus: 'correct',
            streak: newStreak,
            highStreak: newHighStreak,
            points: newPoints,
            totalPoints: newTotalPoints,
            timeRemaining: null, // Stop timer
          });

          return true;
        } else {
          // Incorrect guess - lose a life
          const newLives = lives - 1;

          if (newLives <= 0) {
            // Game over
            set({
              lives: 0,
              gameStatus: 'gameover',
              timeRemaining: null,
            });
          } else {
            set({ lives: newLives });
          }

          return false;
        }
      },

      /**
       * Skip the current character (costs points)
       */
      skipCharacter: async () => {
        const { points, totalPoints, fetchNewCharacter } = get();

        // Deduct skip cost
        const newPoints = Math.max(0, points - SKIP_COST);
        const pointsDeducted = points - newPoints;
        const newTotalPoints = Math.max(0, totalPoints - pointsDeducted);

        set({
          points: newPoints,
          totalPoints: newTotalPoints,
        });

        // Fetch new character
        await fetchNewCharacter();
      },

      /**
       * Lose a life (e.g., from anti-cheat detection)
       */
      loseLife: (reason?: string) => {
        const { lives } = get();
        const newLives = lives - 1;

        if (newLives <= 0) {
          // Game over
          set({
            lives: 0,
            gameStatus: 'gameover',
            timeRemaining: null,
          });
        } else {
          set({ lives: newLives });
        }

        if (reason) {
          console.log(`Life lost: ${reason}`);
        }
      },

      /**
       * Purchase an upgrade from the shop
       * Returns true if purchase successful, false otherwise
       */
      purchaseUpgrade: (item: ShopItem): boolean => {
        const { totalPoints, extraHintsOwned, lives, maxLives, maxHints, gameStatus } = get();

        // Check if player has enough points
        if (totalPoints < item.cost) {
          return false;
        }

        // Check if item has reached max ownership
        if (item.maxOwned !== undefined) {
          if (item.type === ShopItemType.EXTRA_HINT && extraHintsOwned >= MAX_EXTRA_HINTS) {
            return false;
          }
        }

        // Process purchase based on item type
        switch (item.type) {
          case ShopItemType.EXTRA_HINT:
            // Permanent extra hint slot
            set({
              extraHintsOwned: extraHintsOwned + 1,
              maxHints: maxHints + 1,
              totalPoints: totalPoints - item.cost,
            });
            return true;

          case ShopItemType.EXTRA_LIFE:
            // Extra life for current game
            if (gameStatus === 'playing' && lives < maxLives) {
              set({
                lives: lives + 1,
                totalPoints: totalPoints - item.cost,
              });
              return true;
            }
            return false; // Can't buy if not playing or already at max lives

          case ShopItemType.HINT_REVEAL:
            // Reveal one hint immediately
            const { hintsRevealed } = get();
            if (gameStatus === 'playing' && hintsRevealed < 4) {
              set({
                hintsRevealed: hintsRevealed + 1,
                totalPoints: totalPoints - item.cost,
              });
              return true;
            }
            return false; // Can't buy if not playing or all hints revealed

          case ShopItemType.SKIP:
            // Skip character without losing life
            if (gameStatus === 'playing') {
              set({ totalPoints: totalPoints - item.cost });
              get().fetchNewCharacter();
              return true;
            }
            return false;

          case ShopItemType.TEXT_HINT:
            // Text hint - just deduct points, logic handled in game component
            if (gameStatus === 'playing') {
              set({ totalPoints: totalPoints - item.cost });
              return true;
            }
            return false;

          default:
            return false;
        }
      },

      /**
       * Reset the game to initial state
       */
      resetGame: () => {
        const { highStreak, totalPoints, extraHintsOwned, leaderboard } = get();

        set({
          currentCharacter: null,
          correctAnime: [],
          hintsRevealed: 0,
          maxHints: 4 + extraHintsOwned,
          lives: 3,
          maxLives: 3,
          streak: 0,
          points: 0,
          difficulty: GameDifficulty.MEDIUM,
          gameStatus: 'menu',
          isLoading: false,
          timeRemaining: null,
          // Preserve persistent data
          highStreak,
          totalPoints,
          extraHintsOwned,
          leaderboard,
        });
      },

      /**
       * Save current game to leaderboard (local + global if authenticated)
       */
      saveToLeaderboard: async (username: string) => {
        const { streak, points, difficulty, leaderboard, isGuest } = get();

        if (streak === 0) return; // Don't save if no progress made

        // Local leaderboard entry (for guests and as backup)
        const entry: LeaderboardEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          username: username.trim() || 'Anonymous',
          streak,
          points,
          difficulty,
          date: new Date().toISOString(),
          timestamp: Date.now(),
        };

        // Add to local leaderboard and sort by streak (descending), then points
        const updatedLeaderboard = [...leaderboard, entry].sort((a, b) => {
          if (b.streak !== a.streak) {
            return b.streak - a.streak;
          }
          return b.points - a.points;
        });

        // Keep top 100 entries
        const trimmedLeaderboard = updatedLeaderboard.slice(0, 100);

        set({ leaderboard: trimmedLeaderboard });

        // If authenticated, also save to global MongoDB leaderboard
        if (!isGuest) {
          try {
            // Submit score to global leaderboard
            await fetch('/api/leaderboard', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                streak,
                points,
                difficulty,
                accuracy: 0, // Will be calculated if needed
              }),
            });

            // Update user stats
            await fetch('/api/profile/stats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                xpToAdd: points,
                coinsToAdd: Math.floor(points / 10),
                gameWon: streak > 0,
                newStreak: streak,
              }),
            });
          } catch (error) {
            console.error('Failed to sync with server:', error);
          }
        }
      },

      /**
       * Decrement timer for timed mode (called every second)
       */
      decrementTimer: () => {
        const { timeRemaining, gameStatus } = get();

        if (gameStatus !== 'playing' || timeRemaining === null) return;

        if (timeRemaining <= 1) {
          // Time's up - treat as incorrect guess
          const { lives } = get();
          const newLives = lives - 1;

          if (newLives <= 0) {
            set({
              lives: 0,
              gameStatus: 'gameover',
              timeRemaining: 0,
            });
          } else {
            set({
              lives: newLives,
              timeRemaining: 0,
            });
          }
        } else {
          set({ timeRemaining: timeRemaining - 1 });
        }
      },

      // ========================================================================
      // INTERNAL HELPER FUNCTIONS
      // ========================================================================

      /**
       * Calculate points based on hints used and difficulty
       * Formula: (100 + (4 - hintsUsed) * 25) * difficulty multiplier
       */
      _calculatePoints: (): number => {
        const { hintsRevealed, difficulty } = get();
        const config = DIFFICULTY_CONFIGS[difficulty];

        const hintsUsed = hintsRevealed;
        const unusedHints = 4 - hintsUsed;
        const baseScore = BASE_POINTS + unusedHints * HINT_BONUS;
        const finalScore = Math.round(baseScore * config.pointsMultiplier);

        return finalScore;
      },

      /**
       * Check if the guess matches any valid answer
       * Case-insensitive, trims whitespace, handles special characters
       */
      _checkAnswer: (guess: string, validAnswers: string[]): boolean => {
        const normalizedGuess = guess.trim().toLowerCase();

        return validAnswers.some((answer) => {
          const normalizedAnswer = answer.trim().toLowerCase();

          // Exact match
          if (normalizedGuess === normalizedAnswer) return true;

          // Remove special characters and try again
          const cleanGuess = normalizedGuess.replace(/[^a-z0-9\s]/g, '');
          const cleanAnswer = normalizedAnswer.replace(/[^a-z0-9\s]/g, '');

          return cleanGuess === cleanAnswer;
        });
      },
    }),

    // ========================================================================
    // PERSISTENCE CONFIGURATION
    // ========================================================================
    {
      name: 'anime-guess-game-storage',
      storage: createJSONStorage(() => localStorage),

      // Only persist specific fields
      partialize: (state) => ({
        highStreak: state.highStreak,
        totalPoints: state.totalPoints,
        extraHintsOwned: state.extraHintsOwned,
        leaderboard: state.leaderboard,
      }),
    }
  )
);

// ============================================================================
// SHOP ITEMS CONFIGURATION
// ============================================================================

/**
 * Available shop items
 */
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'extra_hint',
    name: 'Extra Hint',
    description: 'Reveals additional quadrant (max 5)',
    cost: 50,
    type: ShopItemType.HINT_REVEAL,
    maxOwned: 10,
    icon: 'eye',
  },
  {
    id: 'skip_character',
    name: 'Skip Character',
    description: 'Skip current character without losing a life',
    cost: 100,
    type: ShopItemType.SKIP,
    maxOwned: 5,
    icon: 'skip-forward',
  },
  {
    id: 'extra_life',
    name: 'Extra Life',
    description: '+1 life for current game',
    cost: 200,
    type: ShopItemType.EXTRA_LIFE,
    maxOwned: 3,
    icon: 'heart',
  },
  {
    id: 'double_points',
    name: 'Double Points',
    description: '2x points for the next correct answer',
    cost: 150,
    type: ShopItemType.TEXT_HINT,
    maxOwned: 5,
    icon: 'zap',
  },
  {
    id: 'freeze_time',
    name: 'Freeze Time',
    description: 'Stop the timer for 10 seconds (Timed mode)',
    cost: 75,
    type: ShopItemType.SKIP,
    maxOwned: 5,
    icon: 'clock',
  },
];

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Get the configuration for the current difficulty
 */
export const useDifficultyConfig = () => {
  const difficulty = useGameStore((state) => state.difficulty);
  return DIFFICULTY_CONFIGS[difficulty];
};

/**
 * Get current game statistics
 */
export const useGameStats = () => {
  const {
    streak,
    highStreak,
    points,
    totalPoints,
    lives,
    hintsRevealed,
    difficulty,
  } = useGameStore();

  return {
    currentStreak: streak,
    highStreak,
    currentPoints: points,
    totalPoints,
    hintsUsed: hintsRevealed,
    livesRemaining: lives,
    difficulty,
  };
};

/**
 * Check if player can afford an item
 */
export const useCanAfford = (item: ShopItem): boolean => {
  const totalPoints = useGameStore((state) => state.totalPoints);
  return totalPoints >= item.cost;
};

/**
 * Check if player can purchase an item (checks both points and limits)
 */
export const useCanPurchase = (item: ShopItem): boolean => {
  const { totalPoints, extraHintsOwned, lives, maxLives, hintsRevealed } =
    useGameStore();

  // Check if player has enough points
  if (totalPoints < item.cost) return false;

  // Check item-specific limits
  switch (item.type) {
    case ShopItemType.EXTRA_HINT:
      return extraHintsOwned < MAX_EXTRA_HINTS;

    case ShopItemType.EXTRA_LIFE:
      return lives < maxLives;

    case ShopItemType.HINT_REVEAL:
      return hintsRevealed < 4;

    default:
      return false;
  }
};
