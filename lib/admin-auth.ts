import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { config, isProduction, isDemo, validateProductionConfig } from './config';

export const ADMIN_COOKIE_NAME = 'vlh_admin_session';

export interface IAdminPayload {
  username: string;
  isAdmin: boolean;
  role: string;
  mode: 'production' | 'demo';
  iat?: number;
  exp?: number;
}

/**
 * Constant-time string comparison using SHA256 hashes
 */
function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Validates admin credentials against environment configuration.
 * Fails closed in production if credentials are not configured.
 * Demo credentials NEVER authenticate in production.
 */
export function validateAdminCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;

  if (isProduction()) {
    const prodValid = validateProductionConfig();
    if (!prodValid.valid) {
      console.error(
        '[Security Fail-Closed] Missing required production credentials:',
        prodValid.missing.join(', ')
      );
      return false;
    }

    const expectedUser = config.adminUsername;
    const expectedPass = config.adminPassword;

    if (!expectedUser || !expectedPass) return false;

    return (
      secureCompare(username.trim(), expectedUser.trim()) &&
      secureCompare(password.trim(), expectedPass.trim())
    );
  }

  // Demo mode authentication: strictly uses isolated demo credentials
  if (isDemo()) {
    return (
      secureCompare(username.trim(), config.demoAdminUsername.trim()) &&
      secureCompare(password.trim(), config.demoAdminPassword.trim())
    );
  }

  return false;
}

/**
 * Generates a signed JWT session token for an authenticated administrator.
 */
export function generateAdminToken(username: string): string {
  const secret = config.jwtSecret;

  if (!secret) {
    throw new Error('[Security Gate] JWT_SECRET is not configured.');
  }

  const payload: IAdminPayload = {
    username,
    isAdmin: true,
    role: 'superadmin',
    mode: isProduction() ? 'production' : 'demo',
  };

  return jwt.sign(payload, secret, {
    expiresIn: '7d',
    issuer: 'viral-link-hub',
    audience: 'viral-link-hub-admin',
  });
}

/**
 * Verifies an admin JWT string and enforces that demo tokens cannot be used in production.
 */
export function verifyAdminToken(token?: string | null): IAdminPayload | null {
  if (!token) return null;

  const secret = config.jwtSecret;
  if (!secret) return null;

  try {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(cleanToken, secret, {
      issuer: 'viral-link-hub',
      audience: 'viral-link-hub-admin',
    }) as IAdminPayload;

    if (!decoded || !decoded.isAdmin) {
      return null;
    }

    // In production mode, REJECT any tokens generated under demo mode
    if (isProduction() && decoded.mode !== 'production') {
      console.warn('[Security Gate] Rejected demo token attempted in production mode');
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Verifies admin session from Request.
 * Priority 1: HttpOnly cookie 'vlh_admin_session'
 * Priority 2: Authorization: Bearer <token>
 */
export function verifyAdminSession(req: NextRequest): IAdminPayload | null {
  // Check HttpOnly Cookie first (standard web flow)
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookieToken) {
    const fromCookie = verifyAdminToken(cookieToken);
    if (fromCookie) return fromCookie;
  }

  // Fallback to Bearer header (for automated scripts / API tests)
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    return verifyAdminToken(authHeader);
  }

  return null;
}
