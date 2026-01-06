/**
 * Zustand Profile Store for User Authentication and Profile Management
 * Manages user authentication, level system, inventory, and stats
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  type UserProfile,
  type AuthState,
  type InventoryItem,
  type UserLevel,
  type LevelMode,
} from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface ProfileState {
  // Authentication
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // User Profile
  user: UserProfile | null;

  // Quick access to commonly used values
  coins: number;
  level: number;
  xp: number;
  totalXp: number;
  levelMode: LevelMode;

  // Stats (synced from user.stats)
  stats: {
    gamesPlayed: number;
    correctGuesses: number;
    wrongGuesses: number;
    highestStreak: number;
    totalPoints: number;
    perfectGames: number;
  };

  // Inventory
  inventory: InventoryItem[];

  // Actions - Auth
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Actions - Profile
  updateProfile: (updates: Partial<Pick<UserProfile, 'username' | 'avatar' | 'avatarImage'>>) => void;

  // Actions - Coins
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;

  // Actions - XP & Level
  addXp: (amount: number) => void;
  setLevelMode: (mode: LevelMode) => void;

  // Actions - Stats
  incrementGamesPlayed: () => void;
  recordGuess: (isCorrect: boolean) => void;
  updateHighestStreak: (streak: number) => void;
  addPoints: (points: number) => void;
  incrementPerfectGames: () => void;

  // Actions - Inventory
  addItem: (item: Omit<InventoryItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => boolean;
  useItem: (itemId: string) => boolean;
  getItem: (itemId: string) => InventoryItem | undefined;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BASE_XP_PER_LEVEL = 100;
const XP_SCALING_FACTOR = 1.15; // 15% more XP needed each level
const MAX_CAPPED_LEVEL = 100; // Max level for capped mode

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate XP required for a specific level
 * Formula: 100 * 1.15^(level-1)
 */
function getXpForLevel(level: number): number {
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(XP_SCALING_FACTOR, level - 1));
}

/**
 * Calculate total XP needed to reach a level from level 1
 */
function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

/**
 * Get level from total XP
 */
function getLevelFromXp(totalXp: number, mode: LevelMode): { level: number; xpInCurrentLevel: number } {
  let level = 1;
  let remainingXp = totalXp;

  while (true) {
    const xpNeeded = getXpForLevel(level);

    if (remainingXp < xpNeeded) {
      return { level, xpInCurrentLevel: remainingXp };
    }

    remainingXp -= xpNeeded;
    level++;

    // For capped mode, stop at max level
    if (mode === 'capped' && level >= MAX_CAPPED_LEVEL) {
      return { level: MAX_CAPPED_LEVEL, xpInCurrentLevel: remainingXp };
    }
  }
}

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a default user profile
 */
function createDefaultProfile(username: string): UserProfile {
  return {
    id: generateUserId(),
    username,
    avatar: '🎮',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    coins: 100, // Starting coins
    totalCoinsEarned: 100,
    level: {
      current: 1,
      xp: 0,
      xpToNextLevel: getXpForLevel(1),
      totalXp: 0,
      mode: 'infinite',
    },
    inventory: [],
    stats: {
      gamesPlayed: 0,
      correctGuesses: 0,
      wrongGuesses: 0,
      highestStreak: 0,
      totalPoints: 0,
      perfectGames: 0,
    },
    preferences: {
      theme: 'dark',
      soundEnabled: true,
      notificationsEnabled: true,
    },
  };
}

// ============================================================================
// STORE
// ============================================================================

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // Initial State
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
      coins: 0,
      level: 1,
      xp: 0,
      totalXp: 0,
      levelMode: 'infinite',
      stats: {
        gamesPlayed: 0,
        correctGuesses: 0,
        wrongGuesses: 0,
        highestStreak: 0,
        totalPoints: 0,
        perfectGames: 0,
      },
      inventory: [],

      // ======================================================================
      // AUTH ACTIONS
      // ======================================================================

      login: async (username: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // For local storage auth, check if user exists
          const storedUsers = localStorage.getItem('anime-game-users');
          const users: Record<string, { password: string; profile: UserProfile }> = storedUsers
            ? JSON.parse(storedUsers)
            : {};

          const userEntry = users[username.toLowerCase()];

          if (!userEntry) {
            set({ isLoading: false, error: 'User not found' });
            return false;
          }

          if (userEntry.password !== password) {
            set({ isLoading: false, error: 'Invalid password' });
            return false;
          }

          // Update last login
          const profile = {
            ...userEntry.profile,
            lastLoginAt: new Date().toISOString(),
          };

          // Save updated profile
          users[username.toLowerCase()] = { ...userEntry, profile };
          localStorage.setItem('anime-game-users', JSON.stringify(users));

          // Update state
          set({
            isAuthenticated: true,
            isLoading: false,
            error: null,
            user: profile,
            coins: profile.coins,
            level: profile.level.current,
            xp: profile.level.xp,
            totalXp: profile.level.totalXp,
            levelMode: profile.level.mode,
            stats: profile.stats,
            inventory: profile.inventory,
          });

          return true;
        } catch (error) {
          set({ isLoading: false, error: 'Login failed' });
          return false;
        }
      },

      register: async (username: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Check if username already exists
          const storedUsers = localStorage.getItem('anime-game-users');
          const users: Record<string, { password: string; profile: UserProfile }> = storedUsers
            ? JSON.parse(storedUsers)
            : {};

          if (users[username.toLowerCase()]) {
            set({ isLoading: false, error: 'Username already taken' });
            return false;
          }

          // Create new profile
          const profile = createDefaultProfile(username);

          // Save user
          users[username.toLowerCase()] = { password, profile };
          localStorage.setItem('anime-game-users', JSON.stringify(users));

          // Update state
          set({
            isAuthenticated: true,
            isLoading: false,
            error: null,
            user: profile,
            coins: profile.coins,
            level: profile.level.current,
            xp: profile.level.xp,
            totalXp: profile.level.totalXp,
            levelMode: profile.level.mode,
            stats: profile.stats,
            inventory: profile.inventory,
          });

          return true;
        } catch (error) {
          set({ isLoading: false, error: 'Registration failed' });
          return false;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          coins: 0,
          level: 1,
          xp: 0,
          totalXp: 0,
          levelMode: 'infinite',
          stats: {
            gamesPlayed: 0,
            correctGuesses: 0,
            wrongGuesses: 0,
            highestStreak: 0,
            totalPoints: 0,
            perfectGames: 0,
          },
          inventory: [],
          error: null,
        });
      },

      // ======================================================================
      // PROFILE ACTIONS
      // ======================================================================

      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = { ...user, ...updates };

        // Save to localStorage
        const storedUsers = localStorage.getItem('anime-game-users');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          if (users[user.username.toLowerCase()]) {
            users[user.username.toLowerCase()].profile = updatedUser;
            localStorage.setItem('anime-game-users', JSON.stringify(users));
          }
        }

        set({ user: updatedUser });
      },

      // ======================================================================
      // COIN ACTIONS
      // ======================================================================

      addCoins: (amount: number) => {
        const { user, coins } = get();
        const newCoins = coins + amount;

        if (user) {
          const updatedUser = {
            ...user,
            coins: newCoins,
            totalCoinsEarned: user.totalCoinsEarned + amount,
          };

          // Save to localStorage
          const storedUsers = localStorage.getItem('anime-game-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users[user.username.toLowerCase()]) {
              users[user.username.toLowerCase()].profile = updatedUser;
              localStorage.setItem('anime-game-users', JSON.stringify(users));
            }
          }

          set({ coins: newCoins, user: updatedUser });
        } else {
          set({ coins: newCoins });
        }
      },

      spendCoins: (amount: number): boolean => {
        const { user, coins } = get();

        if (coins < amount) {
          return false;
        }

        const newCoins = coins - amount;

        if (user) {
          const updatedUser = { ...user, coins: newCoins };

          // Save to localStorage
          const storedUsers = localStorage.getItem('anime-game-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users[user.username.toLowerCase()]) {
              users[user.username.toLowerCase()].profile = updatedUser;
              localStorage.setItem('anime-game-users', JSON.stringify(users));
            }
          }

          set({ coins: newCoins, user: updatedUser });
        } else {
          set({ coins: newCoins });
        }

        return true;
      },

      // ======================================================================
      // XP & LEVEL ACTIONS
      // ======================================================================

      addXp: (amount: number) => {
        const { user, totalXp, levelMode, level: currentLevel } = get();
        const newTotalXp = totalXp + amount;

        // Calculate new level and XP in current level
        const { level: newLevel, xpInCurrentLevel } = getLevelFromXp(newTotalXp, levelMode);
        const xpToNextLevel = getXpForLevel(newLevel);

        const levelData: UserLevel = {
          current: newLevel,
          xp: xpInCurrentLevel,
          xpToNextLevel,
          totalXp: newTotalXp,
          mode: levelMode,
        };

        if (user) {
          const updatedUser = { ...user, level: levelData };

          // Save to localStorage
          const storedUsers = localStorage.getItem('anime-game-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users[user.username.toLowerCase()]) {
              users[user.username.toLowerCase()].profile = updatedUser;
              localStorage.setItem('anime-game-users', JSON.stringify(users));
            }
          }

          set({
            level: newLevel,
            xp: xpInCurrentLevel,
            totalXp: newTotalXp,
            user: updatedUser,
          });
        } else {
          set({
            level: newLevel,
            xp: xpInCurrentLevel,
            totalXp: newTotalXp,
          });
        }
      },

      setLevelMode: (mode: LevelMode) => {
        const { user, totalXp } = get();

        // Recalculate level with new mode
        const { level, xpInCurrentLevel } = getLevelFromXp(totalXp, mode);
        const xpToNextLevel = getXpForLevel(level);

        const levelData: UserLevel = {
          current: level,
          xp: xpInCurrentLevel,
          xpToNextLevel,
          totalXp,
          mode,
        };

        if (user) {
          const updatedUser = { ...user, level: levelData };

          // Save to localStorage
          const storedUsers = localStorage.getItem('anime-game-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users[user.username.toLowerCase()]) {
              users[user.username.toLowerCase()].profile = updatedUser;
              localStorage.setItem('anime-game-users', JSON.stringify(users));
            }
          }

          set({
            levelMode: mode,
            level,
            xp: xpInCurrentLevel,
            user: updatedUser,
          });
        } else {
          set({
            levelMode: mode,
            level,
            xp: xpInCurrentLevel,
          });
        }
      },

      // ======================================================================
      // STATS ACTIONS
      // ======================================================================

      incrementGamesPlayed: () => {
        const { user, stats } = get();
        const newStats = { ...stats, gamesPlayed: stats.gamesPlayed + 1 };

        if (user) {
          const updatedUser = { ...user, stats: newStats };

          // Save to localStorage
          const storedUsers = localStorage.getItem('anime-game-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users[user.username.toLowerCase()]) {
              users[user.username.toLowerCase()].profile = updatedUser;
              localStorage.setItem('anime-game-users', JSON.stringify(users));
            }
          }

          set({ stats: newStats, user: updatedUser });
        } else {
          set({ stats: newStats });
        }
      },

      recordGuess: (isCorrect: boolean) => {
        const { user, stats } = get();
        const newStats = {
          ...stats,
          correctGuesses: isCorrect ? stats.correctGuesses + 1 : stats.correctGuesses,
          wrongGuesses: !isCorrect ? stats.wrongGuesses + 1 : stats.wrongGuesses,
        };

        if (user) {
          const updatedUser = { ...user, stats: newStats };

          // Save to localStorage
          const storedUsers = localStorage.getItem('anime-game-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users[user.username.toLowerCase()]) {
              users[user.username.toLowerCase()].profile = updatedUser;
              localStorage.setItem('anime-game-users', JSON.stringify(users));
            }
          }

          set({ stats: newStats, user: updatedUser });
        } else {
          set({ stats: newStats });
        }
      },

      updateHighestStreak: (streak: number) => {
        const { user, stats } = get();

        if (streak <= stats.highestStreak) return;

        const newStats = { ...stats, highestStreak: streak };

        if (user) {
          const updatedUser = { ...user, stats: newStats };

          // Save to localStorage
          const storedUsers = localStorage.getItem('anime-game-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users[user.username.toLowerCase()]) {
              users[user.username.toLowerCase()].profile = updatedUser;
              localStorage.setItem('anime-game-users', JSON.stringify(users));
            }
          }

          set({ stats: newStats, user: updatedUser });
        } else {
          set({ stats: newStats });
        }
      },

      addPoints: (points: number) => {
        const { user, stats } = get();
        const newStats = { ...stats, totalPoints: stats.totalPoints + points };

        if (user) {
          const updatedUser = { ...user, stats: newStats };

          // Save to localStorage
          const storedUsers = localStorage.getItem('anime-game-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users[user.username.toLowerCase()]) {
              users[user.username.toLowerCase()].profile = updatedUser;
              localStorage.setItem('anime-game-users', JSON.stringify(users));
            }
          }

          set({ stats: newStats, user: updatedUser });
        } else {
          set({ stats: newStats });
        }
      },

      incrementPerfectGames: () => {
        const { user, stats } = get();
        const newStats = { ...stats, perfectGames: stats.perfectGames + 1 };

        if (user) {
          const updatedUser = { ...user, stats: newStats };

          // Save to localStorage
          const storedUsers = localStorage.getItem('anime-game-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users[user.username.toLowerCase()]) {
              users[user.username.toLowerCase()].profile = updatedUser;
              localStorage.setItem('anime-game-users', JSON.stringify(users));
            }
          }

          set({ stats: newStats, user: updatedUser });
        } else {
          set({ stats: newStats });
        }
      },

      // ======================================================================
      // INVENTORY ACTIONS
      // ======================================================================

      addItem: (item, quantity = 1) => {
        const { user, inventory } = get();
        const existingIndex = inventory.findIndex((i) => i.id === item.id);

        let newInventory: InventoryItem[];

        if (existingIndex >= 0) {
          // Update existing item quantity
          newInventory = [...inventory];
          newInventory[existingIndex] = {
            ...newInventory[existingIndex],
            quantity: newInventory[existingIndex].quantity + quantity,
          };
        } else {
          // Add new item
          newInventory = [...inventory, { ...item, quantity }];
        }

        if (user) {
          const updatedUser = { ...user, inventory: newInventory };

          // Save to localStorage
          const storedUsers = localStorage.getItem('anime-game-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users[user.username.toLowerCase()]) {
              users[user.username.toLowerCase()].profile = updatedUser;
              localStorage.setItem('anime-game-users', JSON.stringify(users));
            }
          }

          set({ inventory: newInventory, user: updatedUser });
        } else {
          set({ inventory: newInventory });
        }
      },

      removeItem: (itemId, quantity = 1): boolean => {
        const { user, inventory } = get();
        const existingIndex = inventory.findIndex((i) => i.id === itemId);

        if (existingIndex < 0) return false;

        const item = inventory[existingIndex];
        if (item.quantity < quantity) return false;

        let newInventory: InventoryItem[];

        if (item.quantity === quantity) {
          // Remove item completely
          newInventory = inventory.filter((i) => i.id !== itemId);
        } else {
          // Reduce quantity
          newInventory = [...inventory];
          newInventory[existingIndex] = {
            ...item,
            quantity: item.quantity - quantity,
          };
        }

        if (user) {
          const updatedUser = { ...user, inventory: newInventory };

          // Save to localStorage
          const storedUsers = localStorage.getItem('anime-game-users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users[user.username.toLowerCase()]) {
              users[user.username.toLowerCase()].profile = updatedUser;
              localStorage.setItem('anime-game-users', JSON.stringify(users));
            }
          }

          set({ inventory: newInventory, user: updatedUser });
        } else {
          set({ inventory: newInventory });
        }

        return true;
      },

      useItem: (itemId): boolean => {
        return get().removeItem(itemId, 1);
      },

      getItem: (itemId) => {
        return get().inventory.find((i) => i.id === itemId);
      },
    }),

    // ========================================================================
    // PERSISTENCE CONFIG
    // ========================================================================
    {
      name: 'anime-game-profile',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        coins: state.coins,
        level: state.level,
        xp: state.xp,
        totalXp: state.totalXp,
        levelMode: state.levelMode,
        stats: state.stats,
        inventory: state.inventory,
      }),
    }
  )
);

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Get XP progress towards next level
 */
export function useXpProgress() {
  const xp = useProfileStore((state) => state.xp);
  const level = useProfileStore((state) => state.level);
  const levelMode = useProfileStore((state) => state.levelMode);

  const requiredXp = getXpForLevel(level);
  const isMaxLevel = levelMode === 'capped' && level >= MAX_CAPPED_LEVEL;
  const progress = isMaxLevel ? 100 : (xp / requiredXp) * 100;

  return {
    currentXp: xp,
    requiredXp,
    progress: Math.min(progress, 100),
    isMaxLevel,
  };
}

/**
 * Get user stats
 */
export function useUserStats() {
  const stats = useProfileStore((state) => state.stats);
  return stats;
}

/**
 * Check if user can afford something
 */
export function useCanAffordCoins(cost: number): boolean {
  const coins = useProfileStore((state) => state.coins);
  return coins >= cost;
}

/**
 * Get inventory item count
 */
export function useInventoryItemCount(itemId: string): number {
  const inventory = useProfileStore((state) => state.inventory);
  const item = inventory.find((i) => i.id === itemId);
  return item?.quantity || 0;
}

// Export helper functions for external use
export { getXpForLevel, getTotalXpForLevel, getLevelFromXp };
