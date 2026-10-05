import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoById, recordVisitorHeartbeat } from '@/lib/data-service';
import { parseTelegramUser } from '@/lib/telegram-verify';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const initDataHeader =
    req.headers.get('x-telegram-init-data') ||
    req.headers.get('authorization')?.replace(/^Telegram\s+/i, '');
  const tgUser = parseTelegramUser(initDataHeader);
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  recordVisitorHeartbeat({
    userId: tgUser?.id ? String(tgUser.id) : null,
    ip,
  }).catch(() => {});

  const { id } = await params;

  try {
    const video = await fetchVideoById(id);

    if (!video) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: video,
    });
  } catch (error: any) {
    console.error('[Public Movie Detail Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve movie details' },
      { status: 500 }
    );
  }
}
