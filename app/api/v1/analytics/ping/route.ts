import { NextRequest, NextResponse } from 'next/server';
import { recordPing } from '@/lib/analytics-core';
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

  const result = recordPing({
    userId: effectiveUserId,
    ip,
  });

  return NextResponse.json({
    success: true,
    message: 'Heartbeat acknowledged',
    activeUsers: result.activeUsers,
    timestamp: result.timestamp,
  });
}
