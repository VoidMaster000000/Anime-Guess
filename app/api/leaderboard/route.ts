import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getLeaderboard,
  addLeaderboardEntry,
  getLeaderboardStats,
  getUserRank,
} from '@/lib/db/leaderboard';

// Get global leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const timeFrame = (searchParams.get('timeFrame') || 'all') as 'all' | 'today' | 'week' | 'month';
    const difficulty = (searchParams.get('difficulty') || 'all') as 'all' | 'easy' | 'medium' | 'hard' | 'timed';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { entries, total } = await getLeaderboard({
      timeFrame,
      difficulty,
      limit,
      offset,
    });

    const stats = await getLeaderboardStats();

    // Get current user's rank if authenticated
    let userRank = null;
    const user = await getCurrentUser();
    if (user) {
      userRank = await getUserRank(user.id, timeFrame);
    }

    // Transform entries for client
    const transformedEntries = entries.map((entry, index) => ({
      id: entry._id?.toString(),
      odId: entry.odId,
      username: entry.username,
      avatar: entry.avatar,
      streak: entry.streak,
      points: entry.points,
      difficulty: entry.difficulty,
      level: entry.level,
      accuracy: entry.accuracy,
      date: entry.createdAt.toISOString(),
      rank: offset + index + 1,
    }));

    return NextResponse.json({
      success: true,
      entries: transformedEntries,
      total,
      stats,
      userRank,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}

// Submit score to leaderboard
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to submit scores' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { streak, points, difficulty, accuracy, isSuspicious, tabSwitches } = body;

    // Validate required fields
    if (streak === undefined || points === undefined || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create leaderboard entry
    const entry = await addLeaderboardEntry({
      odId: user.id,
      username: user.username,
      avatar: user.avatar,
      streak,
      points,
      difficulty,
      level: user.profile.level,
      accuracy: accuracy || Math.round((user.profile.correctGuesses / Math.max(user.profile.totalGuesses, 1)) * 100),
      isSuspicious: isSuspicious || false,
      tabSwitches: tabSwitches || 0,
    });

    // Get updated rank
    const userRank = await getUserRank(user.id);

    return NextResponse.json({
      success: true,
      entry: {
        id: entry._id?.toString(),
        streak: entry.streak,
        points: entry.points,
        difficulty: entry.difficulty,
      },
      rank: userRank,
    });
  } catch (error) {
    console.error('Submit score error:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}
