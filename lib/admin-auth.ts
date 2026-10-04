import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'viral_link_hub_jwt_super_secret_key_2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'virallinkhub2026!';

export interface IAdminPayload {
  username: string;
  isAdmin: boolean;
  role: string;
}

export function generateAdminToken(username: string): string {
  return jwt.sign(
    {
      username,
      isAdmin: true,
      role: 'superadmin',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAdminToken(token?: string | null): IAdminPayload | null {
  if (!token) return null;
  try {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(cleanToken, JWT_SECRET) as IAdminPayload;
    if (decoded && decoded.isAdmin) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export function validateAdminCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
