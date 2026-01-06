'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  avatarImage?: string;
  createdAt: string;
  profile: {
    level: number;
    xp: number;
    totalXp: number;
    coins: number;
    gamesPlayed: number;
    totalGuesses: number;
    correctGuesses: number;
    highestStreak: number;
    achievements: string[];
    titles: string[];
    selectedTitle: string | null;
  };
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    animationsEnabled: boolean;
    theme: 'dark' | 'light' | 'system';
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserStats: (stats: {
    xpToAdd?: number;
    coinsToAdd?: number;
    gameWon?: boolean;
    correctGuess?: boolean;
    newStreak?: number;
  }) => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

async function loginApi(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

async function signupApi(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || 'Signup failed' };
    }

    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

async function logoutApi(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore errors
  }
}

async function updateStatsApi(stats: {
  xpToAdd?: number;
  coinsToAdd?: number;
  gameWon?: boolean;
  correctGuess?: boolean;
  newStreak?: number;
}): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/profile/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.profile || null;
  } catch {
    return null;
  }
}

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user on mount
  useEffect(() => {
    fetchCurrentUser().then((user) => {
      setUser(user);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginApi(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    const result = await signupApi(username, email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const user = await fetchCurrentUser();
    setUser(user);
  }, []);

  const updateUserStats = useCallback(async (stats: Parameters<typeof updateStatsApi>[0]) => {
    const updatedUser = await updateStatsApi(stats);
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
    updateUserStats,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// LEADERBOARD API
// ============================================================================

export interface LeaderboardEntry {
  id: string;
  odId: string;
  username: string;
  avatar: string;
  avatarImage?: string;
  streak: number;
  points: number;
  difficulty: string;
  level: number;
  accuracy: number;
  date: string;
  rank: number;
}

export interface LeaderboardStats {
  totalEntries: number;
  highestStreak: number;
  highestPoints: number;
  totalPlayers: number;
}

export async function fetchLeaderboard(options?: {
  timeFrame?: 'all' | 'today' | 'week' | 'month';
  difficulty?: 'all' | 'easy' | 'medium' | 'hard' | 'timed';
  limit?: number;
  offset?: number;
}): Promise<{
  entries: LeaderboardEntry[];
  total: number;
  stats: LeaderboardStats;
  userRank: { rank: number; totalPlayers: number } | null;
}> {
  const params = new URLSearchParams();
  if (options?.timeFrame) params.set('timeFrame', options.timeFrame);
  if (options?.difficulty) params.set('difficulty', options.difficulty);
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));

  const res = await fetch(`/api/leaderboard?${params.toString()}`);
  const data = await res.json();

  return {
    entries: data.entries || [],
    total: data.total || 0,
    stats: data.stats || { totalEntries: 0, highestStreak: 0, highestPoints: 0, totalPlayers: 0 },
    userRank: data.userRank || null,
  };
}

export async function submitScore(score: {
  streak: number;
  points: number;
  difficulty: string;
  accuracy?: number;
  isSuspicious?: boolean;
  tabSwitches?: number;
}): Promise<{ success: boolean; rank?: { rank: number; totalPlayers: number } }> {
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(score),
    });

    if (!res.ok) {
      return { success: false };
    }

    const data = await res.json();
    return { success: true, rank: data.rank };
  } catch {
    return { success: false };
  }
}

// ============================================================================
// INVENTORY API
// ============================================================================

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  quantity: number;
  maxOwnable: number;
  effect: { type: string; value: number };
  purchasedAt: string;
  lastUsedAt: string | null;
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  try {
    const res = await fetch('/api/inventory');
    if (!res.ok) return [];
    const data = await res.json();
    return data.inventory || [];
  } catch {
    return [];
  }
}

export async function purchaseItem(itemId: string, quantity = 1): Promise<{
  success: boolean;
  error?: string;
  updatedCoins?: number;
}> {
  try {
    const res = await fetch('/api/shop/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error };
    }

    return { success: true, updatedCoins: data.updatedCoins };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function useInventoryItem(itemId: string, quantity = 1): Promise<{
  success: boolean;
  error?: string;
  remainingQuantity?: number;
}> {
  try {
    const res = await fetch('/api/inventory/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error };
    }

    return { success: true, remainingQuantity: data.remainingQuantity };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// ============================================================================
// SETTINGS API
// ============================================================================

export async function updateSettings(settings: {
  soundEnabled?: boolean;
  musicEnabled?: boolean;
  animationsEnabled?: boolean;
  theme?: 'dark' | 'light' | 'system';
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/profile/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update settings' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}
