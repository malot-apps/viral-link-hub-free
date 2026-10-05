import { NextRequest, NextResponse } from 'next/server';
import { getGrowthAnalytics } from '@/lib/data-service';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = verifyAdminSession(req);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  const periodParam = (req.nextUrl.searchParams.get('period') || '7d') as 'today' | '7d' | '30d' | 'all';
  const period = ['today', '7d', '30d', 'all'].includes(periodParam) ? periodParam : '7d';

  try {
    const growthStats = await getGrowthAnalytics(period);

    return NextResponse.json({
      success: true,
      data: growthStats,
    });
  } catch (error: any) {
    console.error('[Admin Growth Analytics Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve growth analytics' },
      { status: 503 }
    );
  }
}
