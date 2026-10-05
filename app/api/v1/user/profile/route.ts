import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, fetchSettings } from '@/lib/data-service';
import { parseTelegramUser } from '@/lib/telegram-verify';

export async function GET(req: NextRequest) {
  try {
    const initDataHeader = req.headers.get('x-telegram-init-data') || '';
    const userIdParam = req.nextUrl.searchParams.get('userId');

    let effectiveUserId = userIdParam;
    if (!effectiveUserId && initDataHeader) {
      const tgUser = parseTelegramUser(initDataHeader);
      if (tgUser?.id) {
        effectiveUserId = String(tgUser.id);
      }
    }

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'User identifier is required' },
        { status: 400 }
      );
    }

    const [profile, settings] = await Promise.all([
      getUserProfile(effectiveUserId),
      fetchSettings(),
    ]);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Generate standard bot deep link
    const botUsername = settings.telegramChannelUrl?.split('/').pop()?.replace(/^@/, '') || 'virallinkhub_bot';
    const referralDeepLink = `https://t.me/${botUsername}?startapp=ref_${profile.referralCode}`;

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        referralDeepLink,
        requirements: {
          requiredAds: settings.premiumRequiredAds ?? 3,
          requiredReferrals: settings.premiumRequiredReferrals ?? 3,
          premiumDurationHours: settings.premiumDurationHours ?? 24,
          isEligibleForPremium:
            profile.adActionsCompleted >= (settings.premiumRequiredAds ?? 3) &&
            profile.qualifiedReferralCount >= (settings.premiumRequiredReferrals ?? 3) &&
            !profile.isPremiumActive,
        },
      },
    });
  } catch (error: any) {
    console.error('[User Profile Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
