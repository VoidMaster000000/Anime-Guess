import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateUserProfile } from '@/lib/db/users';

// Update user profile (username, avatar, avatarImage)
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
    const { username, avatar, avatarImage } = body;

    // Validate username if provided
    if (username) {
      if (username.length < 3) {
        return NextResponse.json(
          { error: 'Username must be at least 3 characters' },
          { status: 400 }
        );
      }
      if (username.length > 20) {
        return NextResponse.json(
          { error: 'Username must be 20 characters or less' },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json(
          { error: 'Username can only contain letters, numbers, and underscores' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await updateUserProfile(user.id, {
      username,
      avatar,
      avatarImage,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);

    // Handle username already taken error
    if (error instanceof Error && error.message === 'Username already taken') {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
