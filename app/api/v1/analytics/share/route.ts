import { NextRequest, NextResponse } from 'next/server';
import { recordAnalyticsEvent, getUserProfile, fetchSettings } from '@/lib/data-service';
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

    const contentId = body.contentId || null;
    const campaign = body.campaign || 'viral_share';
    const source = body.source || 'content_details';

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'TelegramMiniApp/1.0';

    const [profile, settings] = await Promise.all([
      userId ? getUserProfile(String(userId)) : null,
      fetchSettings(),
    ]);

    const refCode = profile?.referralCode || 'VIP';
    const botUsername = settings.telegramChannelUrl?.split('/').pop()?.replace(/^@/, '') || 'virallinkhub_bot';

    // Generate trackable startapp param: e.g. c_vid123_ref_REF1234
    const startParam = contentId ? `c_${contentId}_ref_${refCode}` : `ref_${refCode}`;
    const deepLink = `https://t.me/${botUsername}?startapp=${startParam}`;
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      deepLink
    )}&text=${encodeURIComponent('🔥 Watch viral high-speed cloud master directly on Telegram Mini App! Complete sponsor task for 24h VIP.')}`;

    // Record share event
    await recordAnalyticsEvent({
      event: 'share_click',
      userId: userId ? String(userId) : null,
      contentId,
      referralCode: refCode,
      campaign,
      source,
      ip,
      userAgent,
      metadata: { deepLink },
    });

    return NextResponse.json({
      success: true,
      data: {
        deepLink,
        telegramShareUrl,
        referralCode: refCode,
      },
    });
  } catch (error: any) {
    console.error('[Share Analytics Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to record share event' },
      { status: 500 }
    );
  }
}
