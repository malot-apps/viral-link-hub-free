import { NextRequest, NextResponse } from 'next/server';
import { recordAdClick } from '@/lib/analytics-core';
import { parseTelegramUser } from '@/lib/telegram-verify';

export async function POST(req: NextRequest) {
  let bodyUserId: string | null = null;
  try {
    const body = await req.json();
    bodyUserId = body.userId ? String(body.userId) : null;
  } catch {
    // optional
  }

  const tgUser = parseTelegramUser(req.headers.get('x-telegram-init-data'));
  const effectiveUserId = tgUser?.id ? String(tgUser.id) : bodyUserId;

  const totalClicks = recordAdClick(effectiveUserId);

  return NextResponse.json({
    success: true,
    adClicks: totalClicks,
  });
}
