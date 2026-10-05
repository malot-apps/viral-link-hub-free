import { NextRequest, NextResponse } from 'next/server';
import { getReferralLeaderboard } from '@/lib/data-service';

export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || 10)));
    const leaderboard = await getReferralLeaderboard(limit);

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    console.error('[Leaderboard GET Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to load leaderboard' },
      { status: 500 }
    );
  }
}
