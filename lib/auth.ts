import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { SafeUser } from './db/models';
import { getUserById } from './db/users';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_NAME = 'auth-token';
const TOKEN_EXPIRY = '7d'; // 7 days

// ============================================================================
// JWT TOKEN FUNCTIONS
// ============================================================================

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
}

/**
 * Create a JWT token for a user
 */
export function createToken(user: SafeUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// COOKIE FUNCTIONS
// ============================================================================

/**
 * Set auth cookie (server-side)
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Get auth cookie (server-side)
 */
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TOKEN_NAME);
  return cookie?.value || null;
}

/**
 * Remove auth cookie (server-side)
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

// ============================================================================
// AUTH HELPERS
// ============================================================================

/**
 * Get current user from auth cookie
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const token = await getAuthCookie();

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  return getUserById(payload.userId);
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Check if request is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
