import { NextRequest, NextResponse } from 'next/server';
import {
  fetchGrowthMissions,
  getUserProfile,
  completeUserMission,
  logAdminAction,
} from '@/lib/data-service';
import { verifyTelegramChannelMembership } from '@/lib/telegram-verify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, missionId } = body;

    if (!userId || !missionId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Mission ID are required' },
        { status: 400 }
      );
    }

    const missions = await fetchGrowthMissions();
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) {
      return NextResponse.json({ success: false, error: 'Mission not found' }, { status: 404 });
    }

    let verificationResult = { verified: true, message: 'Verified via client intent' };
    let verifiedVia: 'server_api' | 'client' | 'referral_system' = 'client';

    // 1. Channel / Group membership verification via Telegram Bot API
    if ((mission.type === 'join_channel' || mission.type === 'join_group') && mission.chatId) {
      const membership = await verifyTelegramChannelMembership(mission.chatId, userId);
      verificationResult = {
        verified: membership.verified,
        message: membership.message,
      };
      if (membership.serverVerified) {
        verifiedVia = 'server_api';
      }
    }

    // 2. Invite Friends verification based on actual qualified referrals count
    if (mission.type === 'invite_friends') {
      const profile = await getUserProfile(userId);
      const qualCount = profile?.qualifiedReferralCount || 0;
      if (qualCount < mission.requiredCount) {
        return NextResponse.json(
          {
            success: false,
            error: `Requirement not yet met: You have ${qualCount}/${mission.requiredCount} qualified referrals.`,
            currentCount: qualCount,
            requiredCount: mission.requiredCount,
          },
          { status: 400 }
        );
      }
      verifiedVia = 'referral_system';
    }

    if (!verificationResult.verified) {
      return NextResponse.json(
        {
          success: false,
          error: verificationResult.message || 'Please join the channel first, then click verify.',
        },
        { status: 400 }
      );
    }

    // Complete mission and award credits
    const completion = await completeUserMission(userId, missionId, verifiedVia);
    const updatedProfile = await getUserProfile(userId);

    return NextResponse.json({
      success: true,
      message: completion.message,
      adCreditsAwarded: completion.adCreditsAwarded,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('[Mission Verification Error]:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
