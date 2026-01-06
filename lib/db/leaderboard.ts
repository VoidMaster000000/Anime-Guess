import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS } from '../mongodb';
import { DBLeaderboardEntry } from './models';

// ============================================================================
// LEADERBOARD SERVICE
// ============================================================================

export interface LeaderboardEntryInput {
  odId: string;
  username: string;
  avatar: string;
  streak: number;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'timed';
  level: number;
  accuracy: number;
  isSuspicious?: boolean;
  tabSwitches?: number;
}

export interface LeaderboardFilters {
  timeFrame?: 'all' | 'today' | 'week' | 'month';
  difficulty?: 'all' | 'easy' | 'medium' | 'hard' | 'timed';
  limit?: number;
  offset?: number;
}

/**
 * Add a new leaderboard entry
 */
export async function addLeaderboardEntry(
  entry: LeaderboardEntryInput
): Promise<DBLeaderboardEntry> {
  const db = await getDatabase();
  const leaderboard = db.collection<DBLeaderboardEntry>(COLLECTIONS.LEADERBOARD);

  const newEntry: DBLeaderboardEntry = {
    odId: entry.odId,
    username: entry.username,
    avatar: entry.avatar,
    streak: entry.streak,
    points: entry.points,
    difficulty: entry.difficulty,
    level: entry.level,
    accuracy: entry.accuracy,
    createdAt: new Date(),
    isSuspicious: entry.isSuspicious || false,
    tabSwitches: entry.tabSwitches || 0,
  };

  const result = await leaderboard.insertOne(newEntry);
  return { ...newEntry, _id: result.insertedId };
}

/**
 * Get global leaderboard
 */
export async function getLeaderboard(
  filters: LeaderboardFilters = {}
): Promise<{ entries: DBLeaderboardEntry[]; total: number }> {
  const db = await getDatabase();
  const leaderboard = db.collection<DBLeaderboardEntry>(COLLECTIONS.LEADERBOARD);

  const { timeFrame = 'all', difficulty = 'all', limit = 100, offset = 0 } = filters;

  // Build query
  const query: any = {
    isSuspicious: false, // Don't show suspicious entries
  };

  // Time filter
  if (timeFrame !== 'all') {
    const now = new Date();
    let startDate: Date;

    switch (timeFrame) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    query.createdAt = { $gte: startDate };
  }

  // Difficulty filter
  if (difficulty !== 'all') {
    query.difficulty = difficulty;
  }

  // Get total count
  const total = await leaderboard.countDocuments(query);

  // Get entries sorted by streak, then points
  const entries = await leaderboard
    .find(query)
    .sort({ streak: -1, points: -1, createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  return { entries, total };
}

/**
 * Get user's best scores
 */
export async function getUserBestScores(
  odId: string,
  limit = 10
): Promise<DBLeaderboardEntry[]> {
  const db = await getDatabase();
  const leaderboard = db.collection<DBLeaderboardEntry>(COLLECTIONS.LEADERBOARD);

  return leaderboard
    .find({ odId })
    .sort({ streak: -1, points: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Get user's rank on leaderboard
 */
export async function getUserRank(
  odId: string,
  timeFrame: 'all' | 'today' | 'week' | 'month' = 'all'
): Promise<{ rank: number; totalPlayers: number } | null> {
  const db = await getDatabase();
  const leaderboard = db.collection<DBLeaderboardEntry>(COLLECTIONS.LEADERBOARD);

  // Get user's best score
  const userBest = await leaderboard
    .find({ odId, isSuspicious: false })
    .sort({ streak: -1, points: -1 })
    .limit(1)
    .toArray();

  if (userBest.length === 0) {
    return null;
  }

  const best = userBest[0];

  // Build time query
  const query: any = { isSuspicious: false };
  if (timeFrame !== 'all') {
    const now = new Date();
    let startDate: Date;

    switch (timeFrame) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }
    query.createdAt = { $gte: startDate };
  }

  // Count players with higher scores
  const higherScores = await leaderboard.countDocuments({
    ...query,
    $or: [
      { streak: { $gt: best.streak } },
      { streak: best.streak, points: { $gt: best.points } },
    ],
  });

  const totalPlayers = await leaderboard.countDocuments(query);

  return {
    rank: higherScores + 1,
    totalPlayers,
  };
}

/**
 * Get leaderboard stats
 */
interface LeaderboardStats {
  totalEntries: number;
  highestStreak: number;
  highestPoints: number;
  totalPlayers: number;
}

export async function getLeaderboardStats(): Promise<LeaderboardStats> {
  const db = await getDatabase();
  const leaderboard = db.collection<DBLeaderboardEntry>(COLLECTIONS.LEADERBOARD);

  const [stats] = await leaderboard
    .aggregate<LeaderboardStats>([
      { $match: { isSuspicious: false } },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          highestStreak: { $max: '$streak' },
          highestPoints: { $max: '$points' },
          uniquePlayers: { $addToSet: '$odId' },
        },
      },
      {
        $project: {
          _id: 0,
          totalEntries: 1,
          highestStreak: 1,
          highestPoints: 1,
          totalPlayers: { $size: '$uniquePlayers' },
        },
      },
    ])
    .toArray();

  return stats ?? {
    totalEntries: 0,
    highestStreak: 0,
    highestPoints: 0,
    totalPlayers: 0,
  };
}

/**
 * Delete user's leaderboard entries (for account deletion)
 */
export async function deleteUserEntries(odId: string): Promise<number> {
  const db = await getDatabase();
  const leaderboard = db.collection<DBLeaderboardEntry>(COLLECTIONS.LEADERBOARD);

  const result = await leaderboard.deleteMany({ odId });
  return result.deletedCount;
}
