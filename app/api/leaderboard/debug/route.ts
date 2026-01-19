import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';

// Debug endpoint to check leaderboard data quality
// GET /api/leaderboard/debug?timeFrame=today&difficulty=hard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFrame = searchParams.get('timeFrame') || 'today';
    const difficulty = searchParams.get('difficulty') || 'all';

    const db = await getDatabase();
    const leaderboard = db.collection(COLLECTIONS.LEADERBOARD);

    // Get current time info for debugging
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Get sample entries with their raw values including difficulty
    const allEntries = await leaderboard.find({}).limit(50).toArray();

    // Check data types and difficulty values
    const entrySamples = allEntries.map((entry) => ({
      username: entry.username,
      difficulty: entry.difficulty,
      difficultyType: typeof entry.difficulty,
      streak: entry.streak,
      points: entry.points,
      createdAt: entry.createdAt,
      createdAtType: typeof entry.createdAt,
      createdAtIsDate: entry.createdAt instanceof Date,
    }));

    // Count entries by difficulty
    const difficultyStats = {
      easy: await leaderboard.countDocuments({ difficulty: 'easy', isSuspicious: false }),
      medium: await leaderboard.countDocuments({ difficulty: 'medium', isSuspicious: false }),
      hard: await leaderboard.countDocuments({ difficulty: 'hard', isSuspicious: false }),
      timed: await leaderboard.countDocuments({ difficulty: 'timed', isSuspicious: false }),
      // Check for any unexpected values (case issues, etc.)
      EASY: await leaderboard.countDocuments({ difficulty: 'EASY', isSuspicious: false }),
      MEDIUM: await leaderboard.countDocuments({ difficulty: 'MEDIUM', isSuspicious: false }),
      HARD: await leaderboard.countDocuments({ difficulty: 'HARD', isSuspicious: false }),
      TIMED: await leaderboard.countDocuments({ difficulty: 'TIMED', isSuspicious: false }),
      undefined: await leaderboard.countDocuments({ difficulty: { $exists: false }, isSuspicious: false }),
      null: await leaderboard.countDocuments({ difficulty: null, isSuspicious: false }),
    };

    // Get unique difficulty values in database
    const uniqueDifficulties = await leaderboard.distinct('difficulty');

    // Count entries by time
    let startDate: Date;
    switch (timeFrame) {
      case 'today':
        startDate = todayStart;
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        break;
      default:
        startDate = new Date(0);
    }

    // Build query matching what the actual leaderboard uses
    const query: any = { isSuspicious: false };
    if (timeFrame !== 'all') {
      query.createdAt = { $gte: startDate };
    }
    if (difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    const matchingEntries = await leaderboard.countDocuments(query);
    const totalEntries = await leaderboard.countDocuments({ isSuspicious: false });

    return NextResponse.json({
      debug: true,
      currentTime: {
        now: now.toISOString(),
        nowUTC: now.toUTCString(),
        todayStartUTC: todayStart.toISOString(),
        filterStartDate: startDate.toISOString(),
      },
      filters: {
        timeFrame,
        difficulty,
      },
      counts: {
        total: totalEntries,
        matchingFilters: matchingEntries,
      },
      difficultyStats,
      uniqueDifficulties,
      sampleEntries: entrySamples,
      notes: [
        'If EASY/MEDIUM/HARD/TIMED counts are > 0, there are uppercase difficulty values that need fixing',
        'If undefined/null counts are > 0, some entries are missing difficulty',
        'uniqueDifficulties shows all distinct difficulty values in the database',
      ],
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ error: 'Debug failed', details: String(error) }, { status: 500 });
  }
}
