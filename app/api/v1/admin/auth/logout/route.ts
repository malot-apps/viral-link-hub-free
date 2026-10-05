import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/data-service';

export async function POST(req: NextRequest) {
  const admin = verifyAdminSession(req);
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'AdminBrowser/1.0';

  if (admin) {
    await logAdminAction({
      admin: admin.username,
      action: 'logout',
      target: 'Admin Dashboard',
      ip,
      userAgent,
    });
  }

  const response = NextResponse.json({
    success: true,
    message: 'Admin logged out successfully',
  });

  // Clear HttpOnly session cookie
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}
