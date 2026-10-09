import { NextRequest, NextResponse } from 'next/server';
import {
  fetchTelegramDestinations,
  createTelegramDestination,
  logAdminAction,
} from '@/lib/data-service';
import { verifyAdminSession } from '@/lib/admin-auth';
import { isValidTelegramUrl, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

/**
 * Admin Telegram Destinations API
 *
 * GET  /api/v1/admin/destinations — List all destinations (active & inactive)
 * POST /api/v1/admin/destinations — Create a new destination
 */
export async function GET(req: NextRequest) {
  const admin = verifyAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  try {
    const destinations = await fetchTelegramDestinations({ activeOnly: false });
    return NextResponse.json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error: any) {
    console.error('[Admin Destinations GET Error]:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve destinations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = verifyAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'AdminBrowser/1.0';

  try {
    const body = await req.json();

    const title = sanitizeString(body.title);
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const type = body.type;
    if (!['channel', 'group', 'bot'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be one of: channel, group, bot' },
        { status: 400 }
      );
    }

    const rawUrl = String(body.url || '').trim();
    if (!rawUrl || !isValidTelegramUrl(rawUrl)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'A valid Telegram URL is required (e.g. https://t.me/your_channel or tg://...)',
        },
        { status: 400 }
      );
    }

    const username = sanitizeString(body.username) || '';
    const chatId = sanitizeString(body.chatId) || '';
    const icon = sanitizeString(body.icon) || 'send';
    const description = sanitizeString(body.description) || '';
    const memberCountDisplay = sanitizeString(body.memberCountDisplay) || '';
    const isRequired = Boolean(body.isRequired);
    const showOnWebsite = body.showOnWebsite !== false;
    const showOnMiniapp = body.showOnMiniapp !== false;
    const isActive = body.isActive !== false;
    const orderIndex = Number(body.orderIndex) || 0;

    const created = await createTelegramDestination({
      title,
      description,
      type,
      url: rawUrl,
      username,
      chatId,
      icon,
      isRequired,
      showOnWebsite,
      showOnMiniapp,
      orderIndex,
      isActive,
      memberCountDisplay,
    });

    await logAdminAction({
      admin: admin.username,
      action: 'destination_created',
      target: title,
      metadata: { id: created.id, type, url: rawUrl, isRequired },
      ip,
      userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Admin Destination POST Error]:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create destination' },
      { status: 500 }
    );
  }
}
