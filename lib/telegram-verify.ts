import crypto from 'crypto';
import { ITelegramUser } from './types';

/**
 * Validates Telegram WebApp initData HMAC-SHA256 signature
 */
export function verifyTelegramInitData(initData: string, botToken: string): boolean {
  if (!initData || !botToken) return false;

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;

    urlParams.delete('hash');
    const params = Array.from(urlParams.entries());
    params.sort(([a], [b]) => a.localeCompare(b));

    const dataCheckString = params.map(([key, val]) => `${key}=${val}`).join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return calculatedHash === hash;
  } catch {
    return false;
  }
}

/**
 * Parses user object from initData query string
 */
export function parseTelegramUser(initData?: string | null): ITelegramUser | null {
  if (!initData) return null;
  try {
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    if (userStr) {
      return JSON.parse(decodeURIComponent(userStr));
    }
    // Attempt raw json parse if directly encoded
    return JSON.parse(initData);
  } catch {
    return null;
  }
}

/**
 * Verifies if a Telegram user is a member/subscriber of a given Channel or Group
 * using the Telegram Bot API getChatMember endpoint.
 */
export interface TelegramMembershipResult {
  verified: boolean;
  status:
    | 'creator'
    | 'administrator'
    | 'member'
    | 'restricted'
    | 'left'
    | 'kicked'
    | 'unverified'
    | 'unconfigured'
    | 'error'
    | 'manual_required'
    | 'unknown';
  serverVerified: boolean;
  message: string;
}

export async function verifyTelegramChannelMembership(
  chatId: string,
  userId: string | number,
  customBotToken?: string
): Promise<TelegramMembershipResult> {
  const token = customBotToken || process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return {
      verified: false,
      status: 'unconfigured',
      serverVerified: false,
      message:
        'Server bot token (TELEGRAM_BOT_TOKEN) is not configured in environment. Automated server-side membership verification requires a bot token with admin access to the channel or group.',
    };
  }

  if (!chatId || !chatId.trim()) {
    return {
      verified: false,
      status: 'error',
      serverVerified: false,
      message: 'Chat ID or channel username is missing for this destination.',
    };
  }

  if (!userId) {
    return {
      verified: false,
      status: 'error',
      serverVerified: false,
      message: 'Telegram User ID is required to verify membership.',
    };
  }

  try {
    const trimmedChatId = chatId.trim();
    const formattedChatId =
      trimmedChatId.startsWith('@') || trimmedChatId.startsWith('-')
        ? trimmedChatId
        : `@${trimmedChatId}`;

    const url = `https://api.telegram.org/bot${token}/getChatMember?chat_id=${encodeURIComponent(
      formattedChatId
    )}&user_id=${encodeURIComponent(userId)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    const data = await res.json().catch(() => ({}));

    if (data.ok && data.result) {
      const status = data.result.status;
      const isMember = ['creator', 'administrator', 'member', 'restricted'].includes(status);

      return {
        verified: isMember,
        status,
        serverVerified: true,
        message: isMember
          ? `Membership verified! (Telegram status: ${status})`
          : `You are not detected as an active member in ${formattedChatId} (Telegram status: ${status}). Please join the channel and try again.`,
      };
    }

    // Telegram Bot API returned an error (e.g. Chat not found, bot not in chat, user not found)
    const apiError = data.description || 'Unknown Telegram API error';
    return {
      verified: false,
      status: 'error',
      serverVerified: false,
      message: `Could not verify membership: ${apiError}. Note: Ensure the bot is added as an administrator to ${formattedChatId}.`,
    };
  } catch (err: any) {
    // Network / timeout error: NEVER bypass verification on error
    return {
      verified: false,
      status: 'error',
      serverVerified: false,
      message: `Verification network request failed (${err?.message || 'Timeout'}). Verification could not be confirmed.`,
    };
  }
}

/**
 * Helper to generate mock valid initData for preview / simulation
 */
export function createMockTelegramInitData(user: ITelegramUser): string {
  const userJson = encodeURIComponent(JSON.stringify(user));
  const authDate = Math.floor(Date.now() / 1000);
  const queryId = `AAG_${Math.floor(Math.random() * 1000000)}`;
  return `query_id=${queryId}&user=${userJson}&auth_date=${authDate}&hash=simulated_valid_hash_${user.id}`;
}
