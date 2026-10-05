import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { APP_MODE } from '@/lib/config';

export async function GET(req: NextRequest) {
  const admin = verifyAdminSession(req);

  if (!admin) {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        mode: APP_MODE,
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    admin: {
      username: admin.username,
      role: admin.role,
    },
    mode: APP_MODE,
  });
}
