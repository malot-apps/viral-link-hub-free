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
 * Helper to generate mock valid initData for preview / simulation
 */
export function createMockTelegramInitData(user: ITelegramUser): string {
  const userJson = encodeURIComponent(JSON.stringify(user));
  const authDate = Math.floor(Date.now() / 1000);
  const queryId = `AAG_${Math.floor(Math.random() * 1000000)}`;
  return `query_id=${queryId}&user=${userJson}&auth_date=${authDate}&hash=simulated_valid_hash_${user.id}`;
}
