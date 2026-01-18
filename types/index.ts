/**
 * TypeScript Type Definitions for Anime Guessing Game
 */

// ============================================================================
// CORE GAME TYPES
// ============================================================================

/**
 * Represents an anime title with multiple language variants
 */
export interface AnimeTitle {
  romaji: string;      // Romanized Japanese title
  english?: string;    // English title (optional)
  native?: string;     // Native Japanese title (optional)
}

/**
 * Represents a character in the game
 */
export interface Character {
  id: number;
  name: {
    full: string;      // Full character name
    native?: string;   // Native name in original language
  };
  image: {
    large: string;     // High-resolution image URL
    medium?: string;   // Medium-resolution image URL
  };
  media: AnimeMedia[]; // Array of anime/manga this character appears in
}

/**
 * Represents an anime or manga series
 */
export interface AnimeMedia {
  id: number;
  title: AnimeTitle;
  type: 'ANIME' | 'MANGA';
  format?: 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL' | 'MANGA' | 'NOVEL' | 'ONE_SHOT';
  coverImage?: {
    large?: string;
    medium?: string;
  };
}

// ============================================================================
// GAME DIFFICULTY
// ============================================================================

/**
 * Game difficulty levels
 */
export enum GameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  TIMED = 'timed',
}

/**
 * Configuration for each difficulty level
 */
export interface DifficultyConfig {
  lives: number;              // Number of lives player starts with
  initialHints: number;       // Number of hints revealed at start (0-4)
  maxFreeHints: number;       // Max hints that can be revealed for free (extra hints extend this)
  pointsMultiplier: number;   // Multiplier for points earned
  timeLimit?: number;         // Time limit in seconds (only for timed mode)
}

/**
 * Map of difficulty levels to their configurations
 */
export type DifficultyConfigMap = {
  [key in GameDifficulty]: DifficultyConfig;
};

// ============================================================================
// SHOP & UPGRADES
// ============================================================================

/**
 * Types of items available in the shop
 */
export enum ShopItemType {
  EXTRA_HINT = 'extra_hint',      // Permanent extra hint slot
  EXTRA_LIFE = 'extra_life',      // Extra life for current game
  HINT_REVEAL = 'hint_reveal',    // Reveal one hint immediately
  SKIP = 'skip',                  // Skip current character
  TEXT_HINT = 'text_hint',        // Show text hint about character
}

/**
 * Represents an item in the shop
 */
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;               // Cost in points
  type: ShopItemType;
  maxOwned?: number;         // Maximum number that can be owned (undefined = unlimited)
  icon?: string;             // Icon or emoji for the item
}

// ============================================================================
// LEADERBOARD
// ============================================================================

/**
 * Represents a leaderboard entry
 */
export interface LeaderboardEntry {
  id: string;                // Unique identifier
  username: string;          // Player username
  streak: number;            // Streak achieved
  points: number;            // Total points earned in that run
  difficulty: GameDifficulty; // Difficulty level played
  date: string;              // ISO date string
  timestamp?: number;        // Unix timestamp for sorting
  rank?: number;             // Position on leaderboard

  // User profile data (optional for backward compatibility)
  userId?: string;           // Link to user profile
  avatar?: string;           // User avatar (emoji)
  avatarImage?: string;      // User avatar image (base64 or URL)
  level?: UserLevel;         // User level data
  accuracy?: number;         // Accuracy percentage
  totalGamesPlayed?: number; // Total games played
}

// ============================================================================
// GAME STATE
// ============================================================================

/**
 * Current status of the game
 */
export type GameStatus = 'menu' | 'playing' | 'gameover' | 'correct';

/**
 * Complete game state interface
 */
export interface GameState {
  // Current round data
  currentCharacter: Character | null;
  correctAnime: string[];              // All valid anime titles for current character

  // Hints system
  hintsRevealed: number;               // Number of quadrants revealed (0-4)
  maxHints: number;                    // Total hints available (4 + extras)
  extraHintsOwned: number;             // Purchased permanent hint slots (max 5)

  // Lives and scoring
  lives: number;                       // Current lives
  maxLives: number;                    // Maximum lives for current difficulty
  streak: number;                      // Current streak
  highStreak: number;                  // All-time high streak
  points: number;                      // Points in current game
  totalPoints: number;                 // All-time total points earned

  // Session stats (for current game session)
  sessionCorrectGuesses: number;       // Correct guesses in current session
  sessionTotalGuesses: number;         // Total guesses in current session

  // Track seen characters to avoid repeats
  seenCharacterIds: number[];          // Character IDs already seen this session

  // Game settings
  difficulty: GameDifficulty;
  gameStatus: GameStatus;
  isLoading: boolean;

  // Timed mode
  timeRemaining: number | null;        // Seconds remaining (null if not timed mode)

  // User mode
  isGuest: boolean;                    // True if playing as guest (not authenticated)

  // Leaderboard
  leaderboard: LeaderboardEntry[];

  // Actions
  setDifficulty: (difficulty: GameDifficulty) => void;
  startGame: (isAuthenticated?: boolean) => Promise<void>;
  fetchNewCharacter: () => Promise<void>;
  revealHint: () => void;
  submitGuess: (guess: string) => boolean;
  skipCharacter: () => Promise<void>;
  loseLife: (reason?: string) => void;
  purchaseUpgrade: (item: ShopItem) => boolean;
  resetGame: () => void;
  saveToLeaderboard: (username: string) => Promise<void>;
  decrementTimer: () => void;

  // Internal helpers
  _calculatePoints: () => number;
  _checkAnswer: (guess: string, validAnswers: string[]) => boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Response from the character fetch API
 */
export interface FetchCharacterResponse {
  success: boolean;
  character?: Character;
  correctAnime?: string[];
  error?: string;
}

/**
 * Response from leaderboard API
 */
export interface LeaderboardResponse {
  success: boolean;
  leaderboard?: LeaderboardEntry[];
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Persisted state (saved to localStorage)
 */
export interface PersistedGameState {
  highStreak: number;
  totalPoints: number;
  extraHintsOwned: number;
  leaderboard: LeaderboardEntry[];
}

/**
 * Statistics for display
 */
export interface GameStats {
  currentStreak: number;
  highStreak: number;
  currentPoints: number;
  totalPoints: number;
  hintsUsed: number;
  livesRemaining: number;
  difficulty: GameDifficulty;
}

// ============================================================================
// USER PROFILE SYSTEM
// ============================================================================

/**
 * Level mode types - infinite allows unlimited progression
 */
export type LevelMode = 'infinite' | 'capped';

/**
 * Level configuration
 */
export interface LevelConfig {
  mode: LevelMode;
  maxLevel?: number; // Only for capped mode
  xpPerLevel: number; // Base XP needed per level
  xpScaling: number; // Multiplier for XP per level (1.1 = 10% more each level)
}

/**
 * User level data
 */
export interface UserLevel {
  current: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  mode: LevelMode;
}

/**
 * Inventory item
 */
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'hint' | 'skip' | 'life' | 'cosmetic' | 'booster';
  quantity: number;
  icon?: string;
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar?: string;           // Emoji avatar
  avatarImage?: string;      // Base64 encoded image or URL
  createdAt: string;
  lastLoginAt: string;

  // Currency
  coins: number;
  totalCoinsEarned: number;

  // Level system
  level: UserLevel;

  // Inventory
  inventory: InventoryItem[];

  // Stats
  stats: {
    gamesPlayed: number;
    correctGuesses: number;
    wrongGuesses: number;
    highestStreak: number;
    totalPoints: number;
    perfectGames: number; // Games with no wrong guesses
  };

  // Preferences
  preferences: {
    theme: 'dark' | 'light';
    soundEnabled: boolean;
    notificationsEnabled: boolean;
  };
}

/**
 * Auth state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}
