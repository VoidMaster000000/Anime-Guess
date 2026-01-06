import { NextResponse } from 'next/server';
import { cleanupDuplicateEntries } from '@/lib/db/leaderboard';

// Clean up duplicate leaderboard entries
export async function POST() {
  try {
    const result = await cleanupDuplicateEntries();

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.removed} duplicate entries from ${result.playersProcessed} players`,
      ...result,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup duplicates' },
      { status: 500 }
    );
  }
}
