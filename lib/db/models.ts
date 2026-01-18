import { ObjectId } from 'mongodb';

// ============================================================================
// USER MODEL
// ============================================================================

export interface DBUser {
  _id?: ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  avatarImage?: string;
  createdAt: Date;
  updatedAt: Date;

  // Profile stats
  profile: {
    level: number;
    xp: number;
    totalXp: number;
    coins: number;

    // Game stats
    gamesPlayed: number;
    totalGuesses: number;
    correctGuesses: number;
    highestStreak: number;

    // Achievements
    achievements: string[];
    titles: string[];
    selectedTitle: string | null;
  };

  // Settings
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    animationsEnabled: boolean;
    theme: 'dark' | 'light' | 'system';
  };
}

// User without sensitive data (for client)
export interface SafeUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  avatarImage?: string;
  createdAt: string;
  profile: DBUser['profile'];
  settings: DBUser['settings'];
}

// ============================================================================
// LEADERBOARD MODEL
// ============================================================================

export interface DBLeaderboardEntry {
  _id?: ObjectId;
  odId: string;
  username: string;
  avatar: string;
  avatarImage?: string;

  // Score data
  streak: number;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'timed';

  // User level at time of score
  level: number;
  accuracy: number;

  // Timestamps
  createdAt: Date;        // When best score was achieved
  lastPlayedAt: Date;     // When user last played (updates every game)

  // Anti-cheat
  isSuspicious: boolean;
  tabSwitches: number;
}

// ============================================================================
// INVENTORY MODEL
// ============================================================================

export interface DBInventoryItem {
  _id?: ObjectId;
  odId: string;

  itemId: string;
  itemType: 'hint' | 'skip' | 'life' | 'multiplier' | 'cosmetic';
  quantity: number;

  purchasedAt: Date;
  lastUsedAt: Date | null;
}

// ============================================================================
// GAME SESSION MODEL (for tracking active games)
// ============================================================================

export interface DBGameSession {
  _id?: ObjectId;
  odId: string;

  startedAt: Date;
  endedAt: Date | null;

  difficulty: 'easy' | 'medium' | 'hard' | 'timed';

  // Game state
  currentStreak: number;
  currentPoints: number;
  livesRemaining: number;

  // Characters guessed
  characters: {
    characterId: number;
    characterName: string;
    animeName: string;
    hintsUsed: number;
    wasCorrect: boolean;
    timeTaken: number; // ms
  }[];

  // Anti-cheat data
  tabSwitches: number;
  suspiciousActivity: boolean;
}

// ============================================================================
// SHOP ITEM DEFINITIONS (static, not in DB)
// ============================================================================

export interface ShopItemDefinition {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'hint' | 'skip' | 'life' | 'multiplier' | 'cosmetic';
  icon: string;
  maxOwnable: number;
  effect: {
    type: string;
    value: number;
  };
}

export const SHOP_ITEMS: ShopItemDefinition[] = [
  {
    id: 'reveal_hint',
    name: 'Reveal Hint',
    description: 'Instantly reveal one hint quadrant',
    price: 50,
    type: 'hint',
    icon: 'Eye',
    maxOwnable: 10,
    effect: { type: 'reveal_quadrant', value: 1 },
  },
  {
    id: 'skip_character',
    name: 'Skip Character',
    description: 'Skip to the next character without penalty',
    price: 100,
    type: 'skip',
    icon: 'SkipForward',
    maxOwnable: 5,
    effect: { type: 'skip', value: 1 },
  },
  {
    id: 'extra_life',
    name: 'Extra Life',
    description: 'Gain an additional life',
    price: 200,
    type: 'life',
    icon: 'Heart',
    maxOwnable: 3,
    effect: { type: 'add_life', value: 1 },
  },
  {
    id: 'double_points',
    name: 'Double Points',
    description: '2x points for the next correct answer',
    price: 150,
    type: 'multiplier',
    icon: 'Zap',
    maxOwnable: 5,
    effect: { type: 'multiply_points', value: 2 },
  },
  {
    id: 'freeze_time',
    name: 'Freeze Time',
    description: 'Stop the timer for 10 seconds (Timed mode)',
    price: 75,
    type: 'skip',
    icon: 'Clock',
    maxOwnable: 5,
    effect: { type: 'freeze_timer', value: 10 },
  },
];

// ============================================================================
// XP/LEVEL CALCULATIONS
// ============================================================================

/**
 * XP required per level: 100 XP base, increases by 50 XP per level
 * Level 1→2: 100 XP
 * Level 2→3: 150 XP
 * Level 10→11: 550 XP
 * Level 50→51: 2550 XP
 */
function getXpForLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

export function calculateLevel(totalXp: number): { level: number; xp: number; xpToNextLevel: number } {
  let level = 1;
  let remainingXp = totalXp;
  let xpNeeded = getXpForLevel(level);

  while (remainingXp >= xpNeeded) {
    remainingXp -= xpNeeded;
    level++;
    xpNeeded = getXpForLevel(level);
  }

  return {
    level,
    xp: remainingXp,
    xpToNextLevel: xpNeeded,
  };
}

export function calculateXpForLevel(level: number): number {
  // Total XP needed to reach a specific level
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

// Export for use in frontend
export { getXpForLevel };
