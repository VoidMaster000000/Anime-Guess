import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('Please add your MongoDB URI to .env.local');
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

// Export a module-scoped MongoClient promise getter
export default getClientPromise;

// Helper to get the database
export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db('anime-guess-game');
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  LEADERBOARD: 'leaderboard',
  INVENTORY: 'inventory',
  GAME_SESSIONS: 'game_sessions',
} as const;
