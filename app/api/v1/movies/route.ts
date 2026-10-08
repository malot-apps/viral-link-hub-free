import { NextRequest, NextResponse } from 'next/server';
import { fetchVideos, recordVisitorHeartbeat } from '@/lib/data-service';
import { parseTelegramUser } from '@/lib/telegram-verify';
import { CURATED_FALLBACK_VIDEOS } from '@/lib/catalog-seed';

export async function GET(req: NextRequest) {
  // Extract and record visitor heartbeat silently
  const initDataHeader =
    req.headers.get('x-telegram-init-data') ||
    req.headers.get('authorization')?.replace(/^Telegram\s+/i, '');
  const tgUser = parseTelegramUser(initDataHeader);

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'Telegram-Webview';

  recordVisitorHeartbeat({
    userId: tgUser?.id ? String(tgUser.id) : null,
    ip,
    userAgent,
  }).catch(() => {});

  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const featured = searchParams.has('featured') ? searchParams.get('featured') === 'true' : undefined;
  const allCategories = ['All', 'Viral Movies', 'VIP Cloud', 'Trending', 'Recommended', 'Action', 'Anime'];

  try {
    const videos = await fetchVideos({ category, search, featured });
    const finalVideos = (videos && videos.length > 0) ? videos : CURATED_FALLBACK_VIDEOS;

    return NextResponse.json({
      success: true,
      count: finalVideos.length,
      categories: allCategories,
      data: finalVideos,
    });
  } catch (error: any) {
    console.warn('[Public Movies GET Error, returning curated catalog]:', error.message);
    return NextResponse.json({
      success: true,
      count: CURATED_FALLBACK_VIDEOS.length,
      categories: allCategories,
      data: CURATED_FALLBACK_VIDEOS,
      isFallback: true,
    });
  }
}
