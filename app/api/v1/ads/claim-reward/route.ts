import { NextRequest, NextResponse } from 'next/server';
import { verifyAndClaimAdReward } from '@/lib/ad-reward-validator';
import { recordAnalyticsEvent, recordAdCompletionAction } from '@/lib/data-service';
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
    const sessionId = String(body.sessionId || '');

    if (!videoId || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Video and Ad Session IDs are required' },
        { status: 400 }
      );
    }

    // Verify cryptographic / in-memory ad session
    const verification = await verifyAndClaimAdReward({
      sessionId,
      userId: String(userId),
      videoId,
    });

    if (!verification.success || !verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Ad verification failed' },
        { status: 400 }
      );
    }

    const placement = verification.placement || 'unlock_action';
    const network = verification.network || 'monetag';
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'TelegramMiniApp/1.0';

    // 1. Record real 'ad_complete' event
    await recordAnalyticsEvent({
      event: 'ad_complete',
      userId: String(userId),
      contentId: videoId,
      placement,
      network,
      ip,
      userAgent,
      metadata: { sessionId, network, placement },
    }).catch(() => {});

    // 2. Record real 'reward_granted' event
    await recordAnalyticsEvent({
      event: 'reward_granted',
      userId: String(userId),
      contentId: videoId,
      placement,
      network,
      ip,
      userAgent,
      metadata: { sessionId, network, placement, rewardType: 'video_unlock_step' },
    }).catch(() => {});

    // 3. Increment user's ad_actions_completed and check referral/VIP eligibility
    const progress = await recordAdCompletionAction({
      userId: String(userId),
      placement,
      contentId: videoId,
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      rewardGranted: true,
      sessionId,
      network,
      placement,
      progress,
    });
  } catch (error: any) {
    console.error('[Ads Claim Reward Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to process ad reward claim' },
      { status: 500 }
    );
  }
}
