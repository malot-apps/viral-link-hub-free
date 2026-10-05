import { NextRequest, NextResponse } from 'next/server';
import {
  recordAnalyticsEvent,
  recordAdCompletionAction,
  checkAdFrequencyAllowed,
} from '@/lib/data-service';
import { parseTelegramUser } from '@/lib/telegram-verify';
import { AnalyticsEventType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const initDataHeader = req.headers.get('x-telegram-init-data') || '';
    const body = await req.json().catch(() => ({}));

    let userId = body.userId;
    if (!userId && initDataHeader) {
      const tgUser = parseTelegramUser(initDataHeader);
      if (tgUser?.id) userId = String(tgUser.id);
    }

    const eventType: AnalyticsEventType = body.event || 'ad_click';
    const placement = body.placement || 'unlock_action';
    const contentId = body.contentId || null;
    const campaign = body.campaign || null;

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'TelegramMiniApp/1.0';

    // Verify frequency limits
    const freqCheck = await checkAdFrequencyAllowed({
      userId,
      ip,
      placement,
    });

    if (!freqCheck.allowed) {
      return NextResponse.json({
        success: false,
        rateLimited: true,
        reason: freqCheck.reason,
        cooldownRemainingSeconds: freqCheck.cooldownRemainingSeconds,
      });
    }

    if (eventType === 'ad_completion' && userId) {
      const result = await recordAdCompletionAction({
        userId: String(userId),
        placement,
        contentId,
        ip,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        event: 'ad_completion',
        data: result,
      });
    }

    // Log impression or click
    await recordAnalyticsEvent({
      event: eventType,
      userId: userId ? String(userId) : null,
      contentId,
      placement,
      campaign,
      ip,
      userAgent,
      metadata: body.metadata || {},
    });

    return NextResponse.json({
      success: true,
      event: eventType,
    });
  } catch (error: any) {
    console.error('[Ad Event Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to record ad telemetry' },
      { status: 500 }
    );
  }
}
