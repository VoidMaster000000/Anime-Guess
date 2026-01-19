import { NextResponse } from 'next/server';
import { cleanupDuplicateEntries, cleanupOrphanedEntries, syncAllLeaderboardProfiles, migrateLastPlayedAt } from '@/lib/db/leaderboard';

// Clean up and sync leaderboard entries
export async function POST() {
  try {
    // First, migrate lastPlayedAt for existing entries
    const migrateResult = await migrateLastPlayedAt();

    // Then, sync all profiles with current user data
    const syncResult = await syncAllLeaderboardProfiles();

    // Then, remove orphaned entries (users that no longer exist)
    const orphanedResult = await cleanupOrphanedEntries();

    // Finally, remove duplicates (keep only best score per player)
    const duplicateResult = await cleanupDuplicateEntries();

    return NextResponse.json({
      success: true,
      message: `Migrated ${migrateResult.migrated} entries, fixed ${migrateResult.fixed} date fields, synced ${syncResult.synced} profiles, removed ${orphanedResult.removed} orphaned and ${duplicateResult.removed} duplicate entries`,
      entriesMigrated: migrateResult.migrated,
      dateFieldsFixed: migrateResult.fixed,
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
