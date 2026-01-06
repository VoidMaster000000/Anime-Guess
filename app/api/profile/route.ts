import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateUserStats, updateUserSettings, updateUserAvatar } from '@/lib/db/users';

// Get current user's profile
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// Update profile (settings, avatar, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings, avatar } = body;

    let updatedUser = user;

    // Update settings if provided
    if (settings) {
      const result = await updateUserSettings(user.id, settings);
      if (result) updatedUser = result;
    }

    // Update avatar if provided
    if (avatar) {
      const result = await updateUserAvatar(user.id, avatar);
      if (result) updatedUser = result;
    }

    return NextResponse.json({
      success: true,
      profile: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
