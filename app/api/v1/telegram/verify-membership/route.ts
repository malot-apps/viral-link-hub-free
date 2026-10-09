import { NextRequest, NextResponse } from 'next/server';
import { fetchTelegramDestinationById, recordAnalyticsEvent } from '@/lib/data-service';
import { verifyTelegramChannelMembership, parseTelegramUser } from '@/lib/telegram-verify';
import { ITelegramVerificationResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Server-Side Telegram Membership Verification API
 *
 * POST /api/v1/telegram/verify-membership
 * Body: { destinationId?: string, chatId?: string, userId?: string | number, initData?: string }
 *
 * Requirements:
 * - Real server-side getChatMember check via Telegram Bot API
 * - Fails closed: Never falsely reports success on error or missing permissions
 * - Honest handling of bot limitations (bots do not support getChatMember)
 * - Safe error reporting
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { destinationId, initData } = body;

    // Resolve userId: from body or parsed from initData
    let userId: string | number | undefined = body.userId;
    if (!userId && initData) {
      const parsedUser = parseTelegramUser(initData);
      if (parsedUser?.id) {
        userId = parsedUser.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Telegram User ID is required. Please open this app inside Telegram or provide your user ID.',
        },
        { status: 400 }
      );
    }

    let targetChatId = body.chatId ? String(body.chatId).trim() : '';
    let destinationType = 'channel';

    if (destinationId) {
      const destination = await fetchTelegramDestinationById(destinationId);
      if (!destination) {
        return NextResponse.json(
          {
            success: false,
            error: 'Specified Telegram destination could not be found.',
          },
          { status: 404 }
        );
      }

      destinationType = destination.type;
      targetChatId =
        destination.chatId?.trim() ||
        destination.username?.trim() ||
        targetChatId;

      // Handle Bot-Start limitation honestly
      if (destination.type === 'bot') {
        const response: ITelegramVerificationResponse = {
          verified: false,
          status: 'manual_required',
          serverVerified: false,
          message:
            'Telegram Bot API does not support remote getChatMember verification on bots. Please open the bot directly and click "Start" (/start).',
          destinationId: destination.id,
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: response,
        });
      }
    }

    if (!targetChatId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'A valid Channel/Group Chat ID or @username is required for membership verification.',
        },
        { status: 400 }
      );
    }

    // Server-side check via Telegram Bot API
    const result = await verifyTelegramChannelMembership(targetChatId, userId);

    const verificationResponse: ITelegramVerificationResponse = {
      verified: result.verified,
      status: result.status,
      serverVerified: result.serverVerified,
      message: result.message,
      destinationId,
      timestamp: new Date().toISOString(),
    };

    // Telemetry tracking
    if (result.verified) {
      recordAnalyticsEvent({
        event: 'channel_verification',
        userId: String(userId),
        metadata: {
          destinationId,
          targetChatId,
          type: destinationType,
          status: result.status,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: verificationResponse,
    });
  } catch (error: any) {
    console.error('[Verify Membership Error]:', error?.message);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during Telegram verification.',
      },
      { status: 500 }
    );
  }
}
