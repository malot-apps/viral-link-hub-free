import { NextRequest, NextResponse } from 'next/server';
import { fetchAuditLogs } from '@/lib/data-service';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = verifyAdminSession(req);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = req.nextUrl;
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 50)));

    const logs = await fetchAuditLogs(limit);

    return NextResponse.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error: any) {
    console.error('[Admin Audit Logs GET Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve audit logs' },
      { status: 503 }
    );
  }
}
