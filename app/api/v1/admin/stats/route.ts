import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/analytics-core';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const admin = verifyAdminToken(authHeader);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Valid Admin Bearer JWT required' },
      { status: 401 }
    );
  }

  const stats = getAdminStats();

  return NextResponse.json({
    success: true,
    data: stats,
  });
}
