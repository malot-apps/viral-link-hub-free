import { NextRequest, NextResponse } from 'next/server';
import { claimPremiumReward } from '@/lib/data-service';
import { parseTelegramUser } from '@/lib/telegram-verify';

export async function POST(req: NextRequest) {
  try {
    const initDataHeader = req.headers.get('x-telegram-init-data') || '';
    const body = await req.json().catch(() => ({}));

    let userId = body.userId;
    if (!userId && initDataHeader) {
      const tgUser = parseTelegramUser(initDataHeader);
      if (tgUser?.id) userId = String(tgUser.id);
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User identifier is required to claim reward' },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'TelegramMiniApp/1.0';

    const result = await claimPremiumReward({
      userId: String(userId),
      ip,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message, premiumUntil: result.premiumUntil },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      premiumUntil: result.premiumUntil,
      profile: result.profile,
    });
  } catch (error: any) {
    console.error('[Premium Claim Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Internal error processing premium reward' },
      { status: 500 }
    );
  }
}
