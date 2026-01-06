/**
 * Store Module - Central Export
 * Re-exports all store-related functionality
 */

// Main store
export { useGameStore, SHOP_ITEMS } from './gameStore';

// Helper hooks
export { useDifficultyConfig, useGameStats, useCanAfford, useCanPurchase } from './gameStore';

// Constants and configurations
export {
  DIFFICULTY_CONFIGS,
  DIFFICULTY_NAMES,
  DIFFICULTY_DESCRIPTIONS,
  BASE_POINTS,
  HINT_BONUS,
  MAX_EXTRA_HINTS,
  SKIP_COST,
  MAX_LEADERBOARD_ENTRIES,
  TOTAL_HINTS,
  SHOP_PRICES,
  API_ENDPOINTS,
  STORAGE_KEY,
  ANIMATION_DURATIONS,
  calculatePoints,
  getDifficultyConfig,
  getDifficultyName,
  getDifficultyDescription,
  formatPoints,
  formatLeaderboardDate,
} from './constants';
