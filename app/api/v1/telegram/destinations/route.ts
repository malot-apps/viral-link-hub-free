import { NextRequest, NextResponse } from 'next/server';
import { fetchTelegramDestinations } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

/**
 * Public Telegram Destinations API
 *
 * GET /api/v1/telegram/destinations?platform=website|miniapp
 *
 * Returns active, safe Telegram destinations ordered for public display.
 * Filterable by platform:
 * - 'website': only destinations configured with showOnWebsite: true
 * - 'miniapp': only destinations configured with showOnMiniapp: true
 * - default: all active destinations with visibility flags
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platformParam = searchParams.get('platform');
    const platform =
      platformParam === 'website' || platformParam === 'miniapp'
        ? platformParam
        : undefined;

    const destinations = await fetchTelegramDestinations({
      activeOnly: true,
      platform,
    });

    // Public sanitization: ensure clean fields
    const safeDestinations = destinations.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description || '',
      type: d.type,
      url: d.url,
      username: d.username || '',
      chatId: d.chatId || '',
      icon: d.icon || 'send',
      isRequired: Boolean(d.isRequired),
      showOnWebsite: d.showOnWebsite !== false,
      showOnMiniapp: d.showOnMiniapp !== false,
      orderIndex: d.orderIndex ?? 0,
      memberCountDisplay: d.memberCountDisplay || '',
    }));

    return NextResponse.json(
      {
        success: true,
        count: safeDestinations.length,
        data: safeDestinations,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    console.error('[Public Telegram Destinations GET error]:', error?.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve active Telegram destinations',
      },
      { status: 500 }
    );
  }
}
