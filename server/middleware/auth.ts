import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'viral_link_hub_production_secret_2026_superkey!';

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    username: string;
    role: string;
  };
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or malformed Bearer token',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
    req.adminUser = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Token has expired or is invalid',
    });
  }
}

export function signAdminToken(payload: { username: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
