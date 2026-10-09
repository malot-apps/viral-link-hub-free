import { NextRequest, NextResponse } from 'next/server';
import { reorderTelegramDestinations, logAdminAction } from '@/lib/data-service';
import { verifyAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const admin = verifyAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'AdminBrowser/1.0';

  try {
    const body = await req.json();
    const orderedIds: string[] = body.orderedIds;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'orderedIds must be a non-empty array of destination IDs' },
        { status: 400 }
      );
    }

    await reorderTelegramDestinations(orderedIds);

    await logAdminAction({
      admin: admin.username,
      action: 'destinations_reordered',
      target: `${orderedIds.length} destinations`,
      metadata: { count: orderedIds.length },
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Destinations successfully reordered',
    });
  } catch (error: any) {
    console.error('[Admin Destinations Reorder Error]:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to reorder destinations' },
      { status: 500 }
    );
  }
}
