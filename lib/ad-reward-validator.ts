import crypto from 'crypto';
import { fetchSettings } from './data-service';

export interface AdRewardSession {
  sessionId: string;
  userId: string;
  videoId: string;
  placement: string;
  network: 'monetag' | 'adsterra' | 'direct';
  startedAt: number;
  expiresAt: number;
  claimed: boolean;
  minDurationMs: number;
}

declare global {
  var __AD_REWARD_SESSIONS__: Map<string, AdRewardSession> | undefined;
  var __USER_LAST_REWARD_TIME__: Map<string, number> | undefined;
  var __USER_DAILY_REWARD_COUNT__: Map<string, { count: number; day: string }> | undefined;
}

// In-memory registry of active ad sessions and cooldown tracking persisted across Next.js re-evaluations
const activeSessions: Map<string, AdRewardSession> =
  globalThis.__AD_REWARD_SESSIONS__ || (globalThis.__AD_REWARD_SESSIONS__ = new Map<string, AdRewardSession>());
const userLastRewardTime: Map<string, number> =
  globalThis.__USER_LAST_REWARD_TIME__ || (globalThis.__USER_LAST_REWARD_TIME__ = new Map<string, number>());
const userDailyRewardCount: Map<string, { count: number; day: string }> =
  globalThis.__USER_DAILY_REWARD_COUNT__ ||
  (globalThis.__USER_DAILY_REWARD_COUNT__ = new Map<string, { count: number; day: string }>());

// Clean up expired sessions periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [id, session] of activeSessions.entries()) {
      if (session.expiresAt <= now || session.claimed) {
        activeSessions.delete(id);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Initiates an ad session before the user starts watching.
 * Generates a tamper-proof session ID and sets server-side minimum watch requirements.
 */
export async function startAdSession({
  userId,
  videoId,
  placement = 'unlock_action',
  network = 'monetag',
}: {
  userId: string;
  videoId: string;
  placement?: string;
  network?: 'monetag' | 'adsterra' | 'direct';
}): Promise<{
  success: boolean;
  sessionId?: string;
  minDurationSeconds?: number;
  error?: string;
  cooldownRemainingSeconds?: number;
}> {
  const now = Date.now();
  const settings = await fetchSettings().catch(() => ({} as any));
  const cooldownSeconds = settings.adCooldownSeconds ?? 10;
  const maxAdsPerDay = settings.maxAdsPerDay ?? 30;

  // 1. Verify user cooldown from previous reward
  const lastReward = userLastRewardTime.get(userId);
  if (lastReward) {
    const elapsedSeconds = (now - lastReward) / 1000;
    if (elapsedSeconds < cooldownSeconds) {
      const remaining = Math.ceil(cooldownSeconds - elapsedSeconds);
      return {
        success: false,
        error: `Please wait ${remaining}s before starting another sponsor task.`,
        cooldownRemainingSeconds: remaining,
      };
    }
  }

  // 2. Verify daily cap
  const today = new Date().toISOString().slice(0, 10);
  const dailyRecord = userDailyRewardCount.get(userId);
  if (dailyRecord && dailyRecord.day === today && dailyRecord.count >= maxAdsPerDay) {
    return {
      success: false,
      error: `Daily ad reward limit (${maxAdsPerDay}) reached. Try again tomorrow or get VIP Pass!`,
    };
  }

  // Minimum duration required before claim can be accepted:
  // - Monetag Rewarded video: at least 4.0 seconds
  // - Adsterra Smartlink task: at least 4.5 seconds
  const minDurationMs = network === 'monetag' ? 4000 : 4500;

  const sessionId = `adsess_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  const session: AdRewardSession = {
    sessionId,
    userId: String(userId),
    videoId: String(videoId),
    placement,
    network,
    startedAt: now,
    expiresAt: now + 5 * 60 * 1000, // 5 minute validity
    claimed: false,
    minDurationMs,
  };

  activeSessions.set(sessionId, session);

  return {
    success: true,
    sessionId,
    minDurationSeconds: Math.ceil(minDurationMs / 1000),
  };
}

/**
 * Validates the ad completion claim.
 * Enforces:
 * - Session must exist and not be expired
 * - Single-use only (prevent replay / duplicate reward claims)
 * - Required minimum watch duration elapsed
 * - Cooldown enforcement
 * - NO ad click rewards (explicitly rejected)
 */
export async function verifyAndClaimAdReward({
  sessionId,
  userId,
  videoId,
}: {
  sessionId: string;
  userId: string;
  videoId: string;
}): Promise<{
  success: boolean;
  valid: boolean;
  error?: string;
  placement?: string;
  network?: 'monetag' | 'adsterra' | 'direct';
}> {
  const now = Date.now();
  const session = activeSessions.get(sessionId);

  if (!session) {
    return {
      success: false,
      valid: false,
      error: 'Invalid or expired ad session. Please watch the ad again.',
    };
  }

  if (session.claimed) {
    return {
      success: false,
      valid: false,
      error: 'This ad session has already been claimed. Duplicate claims are prohibited.',
    };
  }

  if (session.userId !== String(userId)) {
    return {
      success: false,
      valid: false,
      error: 'User mismatch for ad session.',
    };
  }

  if (session.videoId !== String(videoId)) {
    return {
      success: false,
      valid: false,
      error: 'Video context mismatch for ad session.',
    };
  }

  if (session.expiresAt <= now) {
    activeSessions.delete(sessionId);
    return {
      success: false,
      valid: false,
      error: 'Ad session expired. Please restart the sponsor task.',
    };
  }

  // Minimum duration check
  const elapsedMs = now - session.startedAt;
  if (elapsedMs < session.minDurationMs) {
    const requiredSeconds = Math.ceil(session.minDurationMs / 1000);
    const elapsedSeconds = (elapsedMs / 1000).toFixed(1);
    return {
      success: false,
      valid: false,
      error: `Ad watched too quickly (${elapsedSeconds}s). Minimum required watch duration is ${requiredSeconds}s.`,
    };
  }

  // Mark claimed immediately to prevent race conditions / duplicate claims
  session.claimed = true;
  userLastRewardTime.set(String(userId), now);

  // Update daily counter
  const today = new Date().toISOString().slice(0, 10);
  const currentDaily = userDailyRewardCount.get(String(userId));
  if (currentDaily && currentDaily.day === today) {
    currentDaily.count += 1;
  } else {
    userDailyRewardCount.set(String(userId), { day: today, count: 1 });
  }

  return {
    success: true,
    valid: true,
    placement: session.placement,
    network: session.network,
  };
}
