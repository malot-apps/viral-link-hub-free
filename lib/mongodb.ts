import mongoose from 'mongoose';
import { isProduction, isDemo, config } from './config';

/**
 * MongoDB Connection Handler
 * 
 * In production:
 * - Requires valid MONGODB_URI.
 * - Fails closed if MONGODB_URI is absent or if connection fails.
 * - Does NOT silently fallback to in-memory mocks.
 * 
 * In demo mode:
 * - If MONGODB_URI is present, attempts connection.
 * - If not present, returns null so demo in-memory storage handles requests.
 */

declare global {
  var _mongooseConnectionPromise: Promise<typeof mongoose | null> | null | undefined;
  var _mongoLastFailedTime: number | undefined;
}

const RETRY_COOLDOWN_MS = 15000; // 15s cooldown between retry attempts

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = config.mongoUri;

  if (!uri || (isDemo() && (uri.includes('localhost') || uri.includes('127.0.0.1')))) {
    if (isProduction()) {
      throw new Error(
        '[Production Safety Gate] MONGODB_URI environment variable is required in production mode. Database connection cannot be established.'
      );
    }
    // In demo mode with localhost or absent URI, use isolated demo store
    return null;
  }

  // Reuse existing connection if ready
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const now = Date.now();
  if (global._mongoLastFailedTime && now - global._mongoLastFailedTime < RETRY_COOLDOWN_MS) {
    if (isProduction()) {
      throw new Error(
        '[Production Database Error] MongoDB connection unreachable. Cooldown in progress.'
      );
    }
    return null;
  }

  if (!global._mongooseConnectionPromise) {
    mongoose.set('bufferCommands', false);

    global._mongooseConnectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 2000,
        maxPoolSize: 10,
      })
      .then((m) => {
        global._mongoLastFailedTime = 0;
        console.log(`[MongoDB] Connected successfully to ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        global._mongooseConnectionPromise = null;
        global._mongoLastFailedTime = Date.now();
        if (isProduction()) {
          console.error('[MongoDB] Connection error:', err.message);
          throw new Error(`[Production Database Error] Failed to connect to MongoDB: ${err.message}`);
        }
        console.warn('[MongoDB] Database not reachable in demo mode. Active: isolated demo store.');
        return null;
      });
  }

  return global._mongooseConnectionPromise;
}

export default connectToDatabase;
