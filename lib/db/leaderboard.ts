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
  avatarImage?: string;
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
 * Add or update leaderboard entry (keeps only the best score per player PER DIFFICULTY)
 * This allows users to have separate best scores for each difficulty mode
 */
export async function addLeaderboardEntry(
  entry: LeaderboardEntryInput
): Promise<DBLeaderboardEntry> {
  const db = await getDatabase();
  const leaderboard = db.collection<DBLeaderboardEntry>(COLLECTIONS.LEADERBOARD);

  // Check if player already has an entry for THIS SPECIFIC DIFFICULTY
  const existingEntry = await leaderboard.findOne({
    odId: entry.odId,
    difficulty: entry.difficulty
  });

  const newEntryData: DBLeaderboardEntry = {
    odId: entry.odId,
    username: entry.username,
    avatar: entry.avatar,
    avatarImage: entry.avatarImage,
    streak: entry.streak,
    points: entry.points,
    difficulty: entry.difficulty,
    level: entry.level,
    accuracy: entry.accuracy,
    createdAt: new Date(),
    isSuspicious: entry.isSuspicious || false,
    tabSwitches: entry.tabSwitches || 0,
  };

  if (existingEntry) {
    // Only update if new score is better (higher streak, or same streak with higher points)
    const isBetterScore =
      entry.streak > existingEntry.streak ||
      (entry.streak === existingEntry.streak && entry.points > existingEntry.points);

    if (isBetterScore) {
      await leaderboard.updateOne(
        { _id: existingEntry._id },
        {
          $set: {
            username: entry.username,
            avatar: entry.avatar,
            avatarImage: entry.avatarImage,
            streak: entry.streak,
            points: entry.points,
            level: entry.level,
            accuracy: entry.accuracy,
            createdAt: new Date(),
            isSuspicious: entry.isSuspicious || false,
            tabSwitches: entry.tabSwitches || 0,
          },
        }
      );
      return { ...newEntryData, _id: existingEntry._id };
    }

    // Return existing entry if new score is not better
    return existingEntry;
  }

  // Create new entry if player doesn't have one for this difficulty
  const result = await leaderboard.insertOne(newEntryData);
  return { ...newEntryData, _id: result.insertedId };
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

  // Time filter (using UTC for consistency)
  if (timeFrame !== 'all') {
    const now = new Date();
    let startDate: Date;

    switch (timeFrame) {
      case 'today':
        // Start of today in UTC
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        break;
      case 'week':
        // 7 days ago from now
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        // Start of current month in UTC
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
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

  // Build time query (using UTC for consistency)
  const query: any = { isSuspicious: false };
  if (timeFrame !== 'all') {
    const now = new Date();
    let startDate: Date;

    switch (timeFrame) {
      case 'today':
        // Start of today in UTC
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        break;
      case 'week':
        // 7 days ago from now
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        // Start of current month in UTC
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
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
 * Update user's profile data on leaderboard (sync username, avatar, avatarImage)
 * Updates ALL entries for this user across all difficulties
 */
export async function syncLeaderboardProfile(
  odId: string,
  updates: {
    username?: string;
    avatar?: string;
    avatarImage?: string;
  }
): Promise<boolean> {
  const db = await getDatabase();
  const leaderboard = db.collection<DBLeaderboardEntry>(COLLECTIONS.LEADERBOARD);

  const setFields: Record<string, unknown> = {};

  if (updates.username !== undefined) {
    setFields.username = updates.username;
  }
  if (updates.avatar !== undefined) {
    setFields.avatar = updates.avatar;
  }
  if (updates.avatarImage !== undefined) {
    setFields.avatarImage = updates.avatarImage;
  }

  if (Object.keys(setFields).length === 0) {
    return true;
  }

  // Update ALL entries for this user (they may have entries for multiple difficulties)
  const result = await leaderboard.updateMany(
    { odId },
    { $set: setFields }
  );

  return result.matchedCount > 0 || result.modifiedCount > 0;
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

/**
 * Sync all leaderboard entries with current user data (username, avatar, avatarImage)
 */
export async function syncAllLeaderboardProfiles(): Promise<{ synced: number }> {
  const db = await getDatabase();
  const leaderboard = db.collection<DBLeaderboardEntry>(COLLECTIONS.LEADERBOARD);
  const users = db.collection(COLLECTIONS.USERS);

  // Get all leaderboard entries
  const entries = await leaderboard.find({}).toArray();
  let synced = 0;

  for (const entry of entries) {
    try {
      const user = await users.findOne({ _id: new ObjectId(entry.odId) });
      if (user) {
        // Update leaderboard entry with current user data
        await leaderboard.updateOne(
          { _id: entry._id },
          {
            $set: {
              username: user.username,
              avatar: user.avatar,
              avatarImage: user.avatarImage,
            },
          }
        );
        synced++;
      }
    } catch {
      // Skip invalid entries
    }
  }

  return { synced };
}

/**
 * Clean up orphaned leaderboard entries - removes entries for users that no longer exist
 */
export async function cleanupOrphanedEntries(): Promise<{ removed: number }> {
  const db = await getDatabase();
  const leaderboard = db.collection<DBLeaderboardEntry>(COLLECTIONS.LEADERBOARD);
  const users = db.collection(COLLECTIONS.USERS);

  // Get all unique odIds from leaderboard
  const leaderboardOdIds = await leaderboard.distinct('odId');

  // Check which ones don't exist in users collection
  const orphanedIds: string[] = [];

  for (const odId of leaderboardOdIds) {
    try {
      const userExists = await users.findOne({ _id: new ObjectId(odId) });
      if (!userExists) {
        orphanedIds.push(odId);
      }
    } catch {
      // Invalid ObjectId format - definitely orphaned
      orphanedIds.push(odId);
    }
  }

  // Delete orphaned entries
  let removed = 0;
  if (orphanedIds.length > 0) {
    const result = await leaderboard.deleteMany({ odId: { $in: orphanedIds } });
    removed = result.deletedCount;
  }

  return { removed };
}

/**
 * Clean up duplicate leaderboard entries - keeps only the best score per player PER DIFFICULTY
 * This should be run once to fix legacy data
 */
export async function cleanupDuplicateEntries(): Promise<{ removed: number; playersProcessed: number }> {
  const db = await getDatabase();
  const leaderboard = db.collection<DBLeaderboardEntry>(COLLECTIONS.LEADERBOARD);

  // Find all unique odId+difficulty combinations that have more than one entry
  const duplicates = await leaderboard.aggregate([
    { $group: { _id: { odId: '$odId', difficulty: '$difficulty' }, count: { $sum: 1 }, entries: { $push: '$$ROOT' } } },
    { $match: { count: { $gt: 1 } } },
  ]).toArray();

  let removed = 0;

  for (const dup of duplicates) {
    const entries = dup.entries as DBLeaderboardEntry[];

    // Sort by streak (desc), then points (desc) to find the best
    entries.sort((a, b) => {
      if (b.streak !== a.streak) return b.streak - a.streak;
      return b.points - a.points;
    });

    // Keep the first (best) entry, delete the rest
    const idsToDelete = entries.slice(1).map(e => e._id).filter((id): id is ObjectId => id !== undefined);

    if (idsToDelete.length > 0) {
      const result = await leaderboard.deleteMany({ _id: { $in: idsToDelete } });
      removed += result.deletedCount;
    }
  }

  // Create compound unique index on odId + difficulty to prevent future duplicates
  try {
    // First, drop the old index if it exists
    await leaderboard.dropIndex('odId_1').catch(() => {});
    // Create new compound unique index
    await leaderboard.createIndex({ odId: 1, difficulty: 1 }, { unique: true });
  } catch {
    // Index may already exist or other error
  }

  return { removed, playersProcessed: duplicates.length };
}
