/**
 * Zustand Profile Store - MongoDB Only
 * No local storage - all data synced with MongoDB
 */

import { create } from 'zustand';
import { type InventoryItem, type LevelMode } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface ProfileState {
  // Quick access to commonly used values (synced from MongoDB user)
  coins: number;
  level: number;
  xp: number;
  totalXp: number;
  levelMode: LevelMode;

  // Stats
  stats: {
    gamesPlayed: number;
    correctGuesses: number;
    wrongGuesses: number;
    highestStreak: number;
    totalPoints: number;
    perfectGames: number;
  };

  // Inventory (local copy for quick access during gameplay)
  inventory: InventoryItem[];

  // Actions - Sync from MongoDB user data
  syncFromUser: (userData: {
    coins: number;
    level: number;
    xp: number;
    totalXp: number;
    inventory?: InventoryItem[];
    stats?: {
      gamesPlayed: number;
      correctGuesses: number;
      wrongGuesses: number;
      highestStreak: number;
      totalPoints: number;
      perfectGames: number;
    };
  }) => void;

  // Actions - Local state updates (will be synced to MongoDB by calling components)
  setCoins: (coins: number) => void;
  setLevel: (level: number) => void;
  setXp: (xp: number) => void;
  setInventory: (inventory: InventoryItem[]) => void;

  // Actions - Inventory helpers
  addItem: (item: Omit<InventoryItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => boolean;
  useItem: (itemId: string) => boolean;
  getItem: (itemId: string) => InventoryItem | undefined;

  // Reset state (on logout)
  reset: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const initialStats = {
  gamesPlayed: 0,
  correctGuesses: 0,
  wrongGuesses: 0,
  highestStreak: 0,
  totalPoints: 0,
  perfectGames: 0,
};

// ============================================================================
// STORE - No persistence, all data from MongoDB
// ============================================================================

export const useProfileStore = create<ProfileState>()((set, get) => ({
  // Initial State
  coins: 0,
  level: 1,
  xp: 0,
  totalXp: 0,
  levelMode: 'infinite',
  stats: { ...initialStats },
  inventory: [],

  // ======================================================================
  // SYNC FROM MONGODB USER DATA
  // ======================================================================

  syncFromUser: (userData) => {
    set({
      coins: userData.coins || 0,
      level: userData.level || 1,
      xp: userData.xp || 0,
      totalXp: userData.totalXp || 0,
      inventory: userData.inventory || [],
      stats: userData.stats || { ...initialStats },
    });
  },

  // ======================================================================
  // STATE SETTERS
  // ======================================================================

  setCoins: (coins) => set({ coins }),
  setLevel: (level) => set({ level }),
  setXp: (xp) => set({ xp }),
  setInventory: (inventory) => set({ inventory }),

  // ======================================================================
  // INVENTORY ACTIONS
  // ======================================================================

  addItem: (item, quantity = 1) => {
    const { inventory } = get();
    const existingIndex = inventory.findIndex((i) => i.id === item.id);

    let newInventory: InventoryItem[];

    if (existingIndex >= 0) {
      newInventory = [...inventory];
      newInventory[existingIndex] = {
        ...newInventory[existingIndex],
        quantity: newInventory[existingIndex].quantity + quantity,
      };
    } else {
      newInventory = [...inventory, { ...item, quantity }];
    }

    set({ inventory: newInventory });
  },

  removeItem: (itemId, quantity = 1): boolean => {
    const { inventory } = get();
    const existingIndex = inventory.findIndex((i) => i.id === itemId);

    if (existingIndex < 0) return false;

    const item = inventory[existingIndex];
    if (item.quantity < quantity) return false;

    let newInventory: InventoryItem[];

    if (item.quantity === quantity) {
      newInventory = inventory.filter((i) => i.id !== itemId);
    } else {
      newInventory = [...inventory];
      newInventory[existingIndex] = {
        ...item,
        quantity: item.quantity - quantity,
      };
    }

    set({ inventory: newInventory });
    return true;
  },

  useItem: (itemId): boolean => {
    return get().removeItem(itemId, 1);
  },

  getItem: (itemId) => {
    return get().inventory.find((i) => i.id === itemId);
  },

  // ======================================================================
  // RESET
  // ======================================================================

  reset: () => {
    set({
      coins: 0,
      level: 1,
      xp: 0,
      totalXp: 0,
      levelMode: 'infinite',
      stats: { ...initialStats },
      inventory: [],
    });
  },
}));

// ============================================================================
// HELPER HOOKS
// ============================================================================

const BASE_XP_PER_LEVEL = 100;
const XP_SCALING_FACTOR = 1.15;
const MAX_CAPPED_LEVEL = 100;

function getXpForLevel(level: number): number {
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(XP_SCALING_FACTOR, level - 1));
}

function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

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

    if (mode === 'capped' && level >= MAX_CAPPED_LEVEL) {
      return { level: MAX_CAPPED_LEVEL, xpInCurrentLevel: remainingXp };
    }
  }
}

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

export function useUserStats() {
  return useProfileStore((state) => state.stats);
}

export function useCanAffordCoins(cost: number): boolean {
  const coins = useProfileStore((state) => state.coins);
  return coins >= cost;
}

export function useInventoryItemCount(itemId: string): number {
  const inventory = useProfileStore((state) => state.inventory);
  const item = inventory.find((i) => i.id === itemId);
  return item?.quantity || 0;
}

export { getXpForLevel, getTotalXpForLevel, getLevelFromXp };
