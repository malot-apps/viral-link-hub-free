import { NextRequest, NextResponse } from 'next/server';
import { recordVisitorHeartbeat } from '@/lib/data-service';
import { parseTelegramUser } from '@/lib/telegram-verify';

export async function POST(req: NextRequest) {
  let bodyUserId: string | null = null;
  try {
    const body = await req.json();
    bodyUserId = body.userId ? String(body.userId) : null;
  } catch {
    // Body optional
  }

  const initDataHeader = req.headers.get('x-telegram-init-data');
  const tgUser = parseTelegramUser(initDataHeader);

  const effectiveUserId = tgUser?.id ? String(tgUser.id) : bodyUserId;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'Telegram-Webview';

  const result = await recordVisitorHeartbeat({
    userId: effectiveUserId,
    ip,
    userAgent,
  });

  return NextResponse.json({
    success: true,
    message: 'Heartbeat acknowledged',
    activeUsers: result.activeUsers,
    timestamp: result.timestamp,
  });
}
