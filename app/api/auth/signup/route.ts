import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db/users';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate username
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser(username, email, password);

    // Create token and set cookie
    const token = createToken(user);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Signup error:', error);

    // Handle known errors
    if (error.message === 'Email already registered') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    if (error.message === 'Username already taken') {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
