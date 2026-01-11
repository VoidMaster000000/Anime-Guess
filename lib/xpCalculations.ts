// XP Calculation utilities - matches backend exactly
// Backend formula: XP needed per level = 100 + (level-1) * 50

/**
 * Get XP required to complete a specific level
 */
export function getXpForLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

/**
 * Calculate level and XP within level from total XP
 * Matches backend calculateLevel function exactly
 */
export function calculateLevelFromTotalXp(totalXp: number): {
  level: number;
  xpInLevel: number;
  xpNeededForLevel: number;
  progress: number;
} {
  let level = 1;
  let remainingXp = totalXp;
  let xpNeeded = getXpForLevel(level);

  while (remainingXp >= xpNeeded) {
    remainingXp -= xpNeeded;
    level++;
    xpNeeded = getXpForLevel(level);
  }

  const progress = xpNeeded > 0 ? Math.min((remainingXp / xpNeeded) * 100, 100) : 0;

  return {
    level,
    xpInLevel: remainingXp,
    xpNeededForLevel: xpNeeded,
    progress,
  };
}

/**
 * Get XP progress for display
 * Handles both old data (xp = totalXp) and new data (xp = xp within level)
 */
export function getXpProgress(profile: {
  level?: number;
  xp?: number;
  totalXp?: number;
} | null | undefined): {
  level: number;
  xpInLevel: number;
  xpNeeded: number;
  progress: number;
} {
  if (!profile) {
    return { level: 1, xpInLevel: 0, xpNeeded: 100, progress: 0 };
  }

  const level = profile.level ?? 1;
  const xp = profile.xp ?? 0;
  const totalXp = profile.totalXp ?? 0;

  // If totalXp is available and greater than xp, recalculate from totalXp
  // This handles both old and new data formats
  if (totalXp > 0) {
    const calc = calculateLevelFromTotalXp(totalXp);
    return {
      level: calc.level,
      xpInLevel: calc.xpInLevel,
      xpNeeded: calc.xpNeededForLevel,
      progress: calc.progress,
    };
  }

  // Fallback: use xp as XP within current level
  const xpNeeded = getXpForLevel(level);
  const progress = xpNeeded > 0 ? Math.min((xp / xpNeeded) * 100, 100) : 0;

  return {
    level,
    xpInLevel: xp,
    xpNeeded,
    progress,
  };
}
