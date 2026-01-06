import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateUserStats } from '@/lib/db/users';

// Update user game stats
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { xpToAdd, coinsToAdd, gameWon, correctGuess, newStreak } = body;

    const updatedUser = await updateUserStats(user.id, {
      xpToAdd,
      coinsToAdd,
      gameWon,
      correctGuess,
      newStreak,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedUser,
    });
  } catch (error) {
    console.error('Update stats error:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}
