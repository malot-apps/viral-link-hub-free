import { NextRequest, NextResponse } from 'next/server';
import { startAdSession } from '@/lib/ad-reward-validator';
import { recordAnalyticsEvent } from '@/lib/data-service';
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
        { success: false, error: 'User identifier is required' },
        { status: 400 }
      );
    }

    const videoId = String(body.videoId || '');
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Video identifier is required' },
        { status: 400 }
      );
    }

    const placement = body.placement || 'unlock_action';
    const network = body.network === 'adsterra' ? 'adsterra' : 'monetag';

    const sessionResult = await startAdSession({
      userId: String(userId),
      videoId,
      placement,
      network,
    });

    if (!sessionResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: sessionResult.error,
          cooldownRemainingSeconds: sessionResult.cooldownRemainingSeconds,
        },
        { status: 429 }
      );
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'TelegramMiniApp/1.0';

    // Record real 'ad_start' telemetry event
    await recordAnalyticsEvent({
      event: 'ad_start',
      userId: String(userId),
      contentId: videoId,
      placement,
      network,
      ip,
      userAgent,
      metadata: {
        sessionId: sessionResult.sessionId,
        network,
        placement,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      sessionId: sessionResult.sessionId,
      minDurationSeconds: sessionResult.minDurationSeconds,
      network,
      placement,
    });
  } catch (error: any) {
    console.error('[Ads Start Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate ad session' },
      { status: 500 }
    );
  }
}
