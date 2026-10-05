import { NextRequest, NextResponse } from 'next/server';
import { recordAdClickEvent, fetchVideoById } from '@/lib/data-service';
import { parseTelegramUser } from '@/lib/telegram-verify';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const video = await fetchVideoById(id);

    if (!video) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    const initDataHeader = req.headers.get('x-telegram-init-data');
    const user = parseTelegramUser(initDataHeader);

    const totalAdClicks = await recordAdClickEvent(user?.id ? String(user.id) : null);

    return NextResponse.json({
      success: true,
      message: 'Ad click logged',
      adClicks: totalAdClicks,
    });
  } catch (error: any) {
    console.error('[Movie Click Ad Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to record ad click' },
      { status: 500 }
    );
  }
}
