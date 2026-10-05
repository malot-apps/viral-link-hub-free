import { NextRequest, NextResponse } from 'next/server';
import { recordAdClickEvent } from '@/lib/data-service';
import { parseTelegramUser } from '@/lib/telegram-verify';

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  try {
    const body = await req.json();
    if (body.userId) userId = String(body.userId);
  } catch {
    // Body optional
  }

  const initDataHeader = req.headers.get('x-telegram-init-data');
  const tgUser = parseTelegramUser(initDataHeader);
  const effectiveUserId = tgUser?.id ? String(tgUser.id) : userId;

  const totalClicks = await recordAdClickEvent(effectiveUserId);

  return NextResponse.json({
    success: true,
    message: 'Ad click recorded',
    adClicks: totalClicks,
  });
}
