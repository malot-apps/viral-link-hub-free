import { NextRequest, NextResponse } from 'next/server';
import { fetchGrowthMissions, fetchUserMissionProgress } from '@/lib/data-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get('userId');

    const missions = await fetchGrowthMissions(true);
    let progressMap: Record<string, any> = {};

    if (userId) {
      progressMap = await fetchUserMissionProgress(userId);
    }

    const payload = missions.map((m) => {
      const userProg = progressMap[m.id];
      return {
        ...m,
        status: userProg?.status || 'pending',
        progressCount: userProg?.progressCount || 0,
        completedAt: userProg?.completedAt || null,
        isCompleted: userProg?.status === 'completed',
      };
    });

    return NextResponse.json({
      success: true,
      count: payload.length,
      data: payload,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
