/**
 * Game Constants and Configuration
 */

import { GameDifficulty, DifficultyConfigMap } from '@/types';

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
export const DIFFICULTY_CONFIGS: DifficultyConfigMap = {
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

/**
 * Human-readable difficulty names
 */
export const DIFFICULTY_NAMES: Record<GameDifficulty, string> = {
  [GameDifficulty.EASY]: 'Easy',
  [GameDifficulty.MEDIUM]: 'Medium',
  [GameDifficulty.HARD]: 'Hard',
  [GameDifficulty.TIMED]: 'Timed Challenge',
};

/**
 * Difficulty descriptions
 */
export const DIFFICULTY_DESCRIPTIONS: Record<GameDifficulty, string> = {
  [GameDifficulty.EASY]:
    '5 lives, 2 hints revealed at start, 0.5x points - Perfect for beginners!',
  [GameDifficulty.MEDIUM]:
    '3 lives, 1 hint revealed at start, 1x points - Balanced challenge',
  [GameDifficulty.HARD]:
    '2 lives, no hints revealed, 2x points - For true anime fans!',
  [GameDifficulty.TIMED]:
    '3 lives, 1 hint revealed, 1.5x points, 30 second timer - Race against time!',
};

// ============================================================================
// GAME CONSTANTS
// ============================================================================

/**
 * Base points awarded for correct answers
 */
export const BASE_POINTS = 100;

/**
 * Bonus points for each unused hint
 */
export const HINT_BONUS = 25;

/**
 * Maximum number of extra hint slots that can be purchased
 */
export const MAX_EXTRA_HINTS = 5;

/**
 * Point cost to skip a character
 */
export const SKIP_COST = 50;

/**
 * Maximum number of leaderboard entries to keep
 */
export const MAX_LEADERBOARD_ENTRIES = 100;

/**
 * Total number of hint quadrants
 */
export const TOTAL_HINTS = 4;

// ============================================================================
// SHOP PRICES
// ============================================================================

/**
 * Shop item prices
 */
export const SHOP_PRICES = {
  EXTRA_HINT_SLOT: 500,
  EXTRA_LIFE: 200,
  REVEAL_HINT: 100,
  SKIP_CHARACTER: 50,
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  CHARACTER: '/api/character',
  LEADERBOARD: '/api/leaderboard',
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

/**
 * LocalStorage key for game data
 */
export const STORAGE_KEY = 'anime-guess-game-storage';

// ============================================================================
// ANIMATION DURATIONS (in milliseconds)
// ============================================================================

/**
 * Animation durations for UI elements
 */
export const ANIMATION_DURATIONS = {
  HINT_REVEAL: 300,
  CORRECT_ANSWER: 1500,
  WRONG_ANSWER: 500,
  GAME_OVER: 2000,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate points based on hints used and difficulty
 * @param hintsUsed Number of hints revealed
 * @param difficulty Current difficulty level
 * @returns Points earned
 */
export const calculatePoints = (
  hintsUsed: number,
  difficulty: GameDifficulty
): number => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const unusedHints = TOTAL_HINTS - hintsUsed;
  const baseScore = BASE_POINTS + unusedHints * HINT_BONUS;
  const finalScore = Math.round(baseScore * config.pointsMultiplier);
  return finalScore;
};

/**
 * Get difficulty configuration
 * @param difficulty Difficulty level
 * @returns Configuration object
 */
export const getDifficultyConfig = (difficulty: GameDifficulty) => {
  return DIFFICULTY_CONFIGS[difficulty];
};

/**
 * Get difficulty name
 * @param difficulty Difficulty level
 * @returns Human-readable name
 */
export const getDifficultyName = (difficulty: GameDifficulty): string => {
  return DIFFICULTY_NAMES[difficulty];
};

/**
 * Get difficulty description
 * @param difficulty Difficulty level
 * @returns Description text
 */
export const getDifficultyDescription = (difficulty: GameDifficulty): string => {
  return DIFFICULTY_DESCRIPTIONS[difficulty];
};

/**
 * Format points with comma separators
 * @param points Number of points
 * @returns Formatted string
 */
export const formatPoints = (points: number): string => {
  return points.toLocaleString();
};

/**
 * Format date for leaderboard display
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatLeaderboardDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
