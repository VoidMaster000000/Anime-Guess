import { NextResponse } from 'next/server';
import { cleanupDuplicateEntries, cleanupOrphanedEntries } from '@/lib/db/leaderboard';

// Clean up leaderboard entries (orphaned + duplicates)
export async function POST() {
  try {
    // First, remove orphaned entries (users that no longer exist)
    const orphanedResult = await cleanupOrphanedEntries();

    // Then, remove duplicates (keep only best score per player)
    const duplicateResult = await cleanupDuplicateEntries();

    return NextResponse.json({
      success: true,
      message: `Removed ${orphanedResult.removed} orphaned entries and ${duplicateResult.removed} duplicates from ${duplicateResult.playersProcessed} players`,
      orphanedRemoved: orphanedResult.removed,
      duplicatesRemoved: duplicateResult.removed,
      playersProcessed: duplicateResult.playersProcessed,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup leaderboard' },
      { status: 500 }
    );
  }
}
