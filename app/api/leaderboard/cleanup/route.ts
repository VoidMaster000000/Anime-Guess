import { NextResponse } from 'next/server';
import { cleanupDuplicateEntries, cleanupOrphanedEntries, syncAllLeaderboardProfiles } from '@/lib/db/leaderboard';

// Clean up and sync leaderboard entries
export async function POST() {
  try {
    // First, sync all profiles with current user data
    const syncResult = await syncAllLeaderboardProfiles();

    // Then, remove orphaned entries (users that no longer exist)
    const orphanedResult = await cleanupOrphanedEntries();

    // Finally, remove duplicates (keep only best score per player)
    const duplicateResult = await cleanupDuplicateEntries();

    return NextResponse.json({
      success: true,
      message: `Synced ${syncResult.synced} profiles, removed ${orphanedResult.removed} orphaned and ${duplicateResult.removed} duplicate entries`,
      profilesSynced: syncResult.synced,
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
