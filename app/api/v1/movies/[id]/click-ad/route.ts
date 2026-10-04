import { NextRequest, NextResponse } from 'next/server';
import { recordAdClick } from '@/lib/analytics-core';
import { parseTelegramUser } from '@/lib/telegram-verify';
import { getVideoById } from '@/lib/db-store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = getVideoById(id);

  if (!video) {
    return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
  }

  const initDataHeader = req.headers.get('x-telegram-init-data');
  const user = parseTelegramUser(initDataHeader);

  const totalAdClicks = recordAdClick(user?.id);

  return NextResponse.json({
    success: true,
    message: 'Ad click logged',
    adClicks: totalAdClicks,
  });
}
