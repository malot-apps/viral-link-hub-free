import { NextRequest, NextResponse } from 'next/server';
import { generateAdminToken, validateAdminCredentials, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { checkLoginRateLimit, recordFailedLogin, resetLoginAttempts } from '@/lib/rate-limit';
import { logAdminAction } from '@/lib/data-service';
import { APP_MODE, isProduction } from '@/lib/config';

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const userAgent = req.headers.get('user-agent') || 'AdminBrowser/1.0';

  // 1. Rate-limit check
  const rateLimit = checkLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many failed login attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
      },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(username, password);

    if (!isValid) {
      recordFailedLogin(ip);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid admin credentials',
          remainingAttempts: Math.max(0, rateLimit.remainingAttempts - 1),
        },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful authentication
    resetLoginAttempts(ip);

    const token = generateAdminToken(username);

    // Record audit log
    await logAdminAction({
      admin: username,
      action: 'login',
      target: 'Admin Dashboard',
      ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      mode: APP_MODE,
      admin: {
        username,
        role: 'superadmin',
      },
    });

    // Set secure HttpOnly session cookie
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction(),
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[Admin Login Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed. Please verify system configuration.' },
      { status: 500 }
    );
  }
}
