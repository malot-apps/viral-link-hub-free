import { NextRequest, NextResponse } from 'next/server';
import { syncTelegramUser } from '@/lib/data-service';
import { verifyTelegramInitData, parseTelegramUser } from '@/lib/telegram-verify';
import { config, isProduction } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const initDataHeader = req.headers.get('x-telegram-init-data') || '';
    const body = await req.json().catch(() => ({}));
    const rawInitData = body.initData || initDataHeader;
    const startParam = body.startParam || req.nextUrl.searchParams.get('startapp') || req.nextUrl.searchParams.get('start');

    // Parse Telegram user
    const tgUser = parseTelegramUser(rawInitData);

    if (!tgUser || !tgUser.id) {
      return NextResponse.json(
        { success: false, error: 'Telegram authentication data is required' },
        { status: 401 }
      );
    }

    // In production with bot token, strictly verify cryptographic signature
    if (isProduction() && config.telegramBotToken) {
      const isValid = verifyTelegramInitData(rawInitData, config.telegramBotToken);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid Telegram cryptographic signature' },
          { status: 403 }
        );
      }
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'TelegramMiniApp/1.0';

    const profile = await syncTelegramUser({
      tgUser,
      startParam,
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('[User Sync Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to sync user identity' },
      { status: 500 }
    );
  }
}
