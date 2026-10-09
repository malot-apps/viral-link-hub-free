import { config } from './config';

/**
 * Validates that a string is a safe HTTP or HTTPS URL.
 * Rejects javascript:, data:, file:, and other unsafe protocols.
 */
export function isValidHttpUrl(urlString?: string | null): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    // Relative paths like /images/foo.jpg are allowed for assets
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return true;
    }
    return false;
  }
}

/**
 * Validates that a string is a legitimate Telegram link
 * (e.g., https://t.me/..., https://telegram.me/..., or tg://...)
 */
export function isValidTelegramUrl(urlString?: string | null): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('tg://')) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return (
      host === 't.me' ||
      host === 'telegram.me' ||
      host === 'telegram.dog' ||
      host.endsWith('.t.me') ||
      host.endsWith('.telegram.org')
    );
  } catch {
    return false;
  }
}

/**
 * Strips script tags and dangerous HTML constructs from user inputs
 */
export function sanitizeString(input?: string | null): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

/**
 * Validates CORS origin for admin routes
 */
export function isOriginAllowed(origin?: string | null): boolean {
  if (!origin) return true; // Same origin or non-browser client
  if (!config.adminAllowedOrigin) return true; // Default to permissive if unconfigured

  const allowedOrigins = config.adminAllowedOrigin
    .split(',')
    .map((o) => o.trim().toLowerCase());

  return allowedOrigins.includes(origin.toLowerCase());
}
