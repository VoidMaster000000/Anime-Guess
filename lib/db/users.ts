import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getDatabase, COLLECTIONS } from '../mongodb';
import { DBUser, SafeUser, calculateLevel } from './models';

// ============================================================================
// USER SERVICE
// ============================================================================

/**
 * Create a new user
 */
export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<SafeUser> {
  const db = await getDatabase();
  const users = db.collection<DBUser>(COLLECTIONS.USERS);

  // Check if username or email already exists
  const existingUser = await users.findOne({
    $or: [
      { username: username.toLowerCase() },
      { email: email.toLowerCase() },
    ],
  });

  if (existingUser) {
    if (existingUser.email.toLowerCase() === email.toLowerCase()) {
      throw new Error('Email already registered');
    }
    throw new Error('Username already taken');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Generate random avatar
  const avatars = ['😊', '😎', '🥳', '🤓', '😇', '🦊', '🐱', '🐼', '🦁', '🐸'];
  const avatar = avatars[Math.floor(Math.random() * avatars.length)];

  const now = new Date();

  const newUser: DBUser = {
    username,
    email: email.toLowerCase(),
    passwordHash,
    avatar,
    createdAt: now,
    updatedAt: now,
    profile: {
      level: 1,
      xp: 0,
      totalXp: 0,
      coins: 100, // Starting coins
      gamesPlayed: 0,
      totalGuesses: 0,
      correctGuesses: 0,
      highestStreak: 0,
      achievements: [],
      titles: ['Newcomer'],
      selectedTitle: 'Newcomer',
    },
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      animationsEnabled: true,
      theme: 'dark',
    },
  };

  const result = await users.insertOne(newUser);

  return toSafeUser({ ...newUser, _id: result.insertedId });
}

/**
 * Find user by email and verify password
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<SafeUser | null> {
  const db = await getDatabase();
  const users = db.collection<DBUser>(COLLECTIONS.USERS);

  const user = await users.findOne({ email: email.toLowerCase() });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return toSafeUser(user);
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  const db = await getDatabase();
  const users = db.collection<DBUser>(COLLECTIONS.USERS);

  try {
    const user = await users.findOne({ _id: new ObjectId(userId) });
    return user ? toSafeUser(user) : null;
  } catch {
    return null;
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<SafeUser | null> {
  const db = await getDatabase();
  const users = db.collection<DBUser>(COLLECTIONS.USERS);

  const user = await users.findOne({ username: username.toLowerCase() });
  return user ? toSafeUser(user) : null;
}

/**
 * Update user profile stats
 */
export async function updateUserStats(
  userId: string,
  updates: {
    xpToAdd?: number;
    coinsToAdd?: number;
    gameWon?: boolean;
    correctGuess?: boolean;
    newStreak?: number;
  }
): Promise<SafeUser | null> {
  const db = await getDatabase();
  const users = db.collection<DBUser>(COLLECTIONS.USERS);

  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) return null;

  const updateDoc: any = {
    $set: { updatedAt: new Date() },
  };

  const incDoc: any = {};

  if (updates.xpToAdd) {
    incDoc['profile.xp'] = updates.xpToAdd;
    incDoc['profile.totalXp'] = updates.xpToAdd;

    // Calculate new level
    const newTotalXp = user.profile.totalXp + updates.xpToAdd;
    const { level } = calculateLevel(newTotalXp);
    updateDoc.$set['profile.level'] = level;
  }

  if (updates.coinsToAdd) {
    incDoc['profile.coins'] = updates.coinsToAdd;
  }

  if (updates.gameWon !== undefined) {
    incDoc['profile.gamesPlayed'] = 1;
  }

  if (updates.correctGuess !== undefined) {
    incDoc['profile.totalGuesses'] = 1;
    if (updates.correctGuess) {
      incDoc['profile.correctGuesses'] = 1;
    }
  }

  if (updates.newStreak && updates.newStreak > user.profile.highestStreak) {
    updateDoc.$set['profile.highestStreak'] = updates.newStreak;
  }

  if (Object.keys(incDoc).length > 0) {
    updateDoc.$inc = incDoc;
  }

  await users.updateOne({ _id: new ObjectId(userId) }, updateDoc);

  return getUserById(userId);
}

/**
 * Update user coins (for purchases)
 */
export async function updateUserCoins(
  userId: string,
  amount: number
): Promise<boolean> {
  const db = await getDatabase();
  const users = db.collection<DBUser>(COLLECTIONS.USERS);

  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) return false;

  // Check if user has enough coins (if subtracting)
  if (amount < 0 && user.profile.coins < Math.abs(amount)) {
    return false;
  }

  await users.updateOne(
    { _id: new ObjectId(userId) },
    {
      $inc: { 'profile.coins': amount },
      $set: { updatedAt: new Date() },
    }
  );

  return true;
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<DBUser['settings']>
): Promise<SafeUser | null> {
  const db = await getDatabase();
  const users = db.collection<DBUser>(COLLECTIONS.USERS);

  const updateFields: any = {};
  for (const [key, value] of Object.entries(settings)) {
    updateFields[`settings.${key}`] = value;
  }

  await users.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        ...updateFields,
        updatedAt: new Date(),
      },
    }
  );

  return getUserById(userId);
}

/**
 * Update user avatar
 */
export async function updateUserAvatar(
  userId: string,
  avatar: string
): Promise<SafeUser | null> {
  const db = await getDatabase();
  const users = db.collection<DBUser>(COLLECTIONS.USERS);

  await users.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        avatar,
        updatedAt: new Date(),
      },
    }
  );

  return getUserById(userId);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert DB user to safe user (remove sensitive data)
 */
function toSafeUser(user: DBUser): SafeUser {
  return {
    id: user._id!.toString(),
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
    profile: user.profile,
    settings: user.settings,
  };
}
