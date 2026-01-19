import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS } from '@/lib/mongodb';

// Debug endpoint to check leaderboard data quality
// GET /api/leaderboard/debug?timeFrame=today
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFrame = searchParams.get('timeFrame') || 'today';

    const db = await getDatabase();
    const leaderboard = db.collection(COLLECTIONS.LEADERBOARD);

    // Get current time info for debugging
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Get sample entries with their raw date values
    const allEntries = await leaderboard.find({}).limit(20).toArray();

    // Check data types
    const entrySamples = allEntries.map((entry) => ({
      username: entry.username,
      createdAt: entry.createdAt,
      createdAtType: typeof entry.createdAt,
      createdAtIsDate: entry.createdAt instanceof Date,
      lastPlayedAt: entry.lastPlayedAt,
      lastPlayedAtType: typeof entry.lastPlayedAt,
      lastPlayedAtIsDate: entry.lastPlayedAt instanceof Date,
    }));

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

    // Test the query
    const matchingByCreatedAt = await leaderboard.countDocuments({
      isSuspicious: false,
      createdAt: { $gte: startDate },
    });

    const matchingByLastPlayedAt = await leaderboard.countDocuments({
      isSuspicious: false,
      lastPlayedAt: { $gte: startDate },
    });

    const totalEntries = await leaderboard.countDocuments({ isSuspicious: false });

    return NextResponse.json({
      debug: true,
      currentTime: {
        now: now.toISOString(),
        nowUTC: now.toUTCString(),
        todayStartUTC: todayStart.toISOString(),
        filterStartDate: startDate.toISOString(),
      },
      timeFrame,
      counts: {
        total: totalEntries,
        matchingByCreatedAt,
        matchingByLastPlayedAt,
      },
      sampleEntries: entrySamples,
      note: 'If createdAtIsDate is false for any entry, dates are stored as strings and need migration',
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ error: 'Debug failed', details: String(error) }, { status: 500 });
  }
}
