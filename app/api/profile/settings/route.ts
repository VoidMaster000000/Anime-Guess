import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateUserSettings } from '@/lib/db/users';

// Update user settings
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
    const { soundEnabled, musicEnabled, animationsEnabled, theme } = body;

    // Validate theme if provided
    if (theme && !['dark', 'light', 'system'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme value' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserSettings(user.id, {
      soundEnabled,
      musicEnabled,
      animationsEnabled,
      theme,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: updatedUser.settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
