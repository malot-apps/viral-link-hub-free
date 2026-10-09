import { NextRequest, NextResponse } from 'next/server';
import {
  fetchTelegramDestinationById,
  modifyTelegramDestination,
  removeTelegramDestination,
  logAdminAction,
} from '@/lib/data-service';
import { verifyAdminSession } from '@/lib/admin-auth';
import { isValidTelegramUrl, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const admin = verifyAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'AdminBrowser/1.0';

  try {
    const existing = await fetchTelegramDestinationById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Telegram destination not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updatePayload: Record<string, any> = {};

    if (body.title !== undefined) {
      const cleanTitle = sanitizeString(body.title);
      if (!cleanTitle) {
        return NextResponse.json(
          { success: false, error: 'Title cannot be empty' },
          { status: 400 }
        );
      }
      updatePayload.title = cleanTitle;
    }

    if (body.type !== undefined) {
      if (!['channel', 'group', 'bot'].includes(body.type)) {
        return NextResponse.json(
          { success: false, error: 'Type must be one of: channel, group, bot' },
          { status: 400 }
        );
      }
      updatePayload.type = body.type;
    }

    if (body.url !== undefined) {
      const rawUrl = String(body.url).trim();
      if (!isValidTelegramUrl(rawUrl)) {
        return NextResponse.json(
          { success: false, error: 'Invalid Telegram URL' },
          { status: 400 }
        );
      }
      updatePayload.url = rawUrl;
    }

    if (body.username !== undefined) updatePayload.username = sanitizeString(body.username);
    if (body.chatId !== undefined) updatePayload.chatId = sanitizeString(body.chatId);
    if (body.description !== undefined) updatePayload.description = sanitizeString(body.description);
    if (body.icon !== undefined) updatePayload.icon = sanitizeString(body.icon) || 'send';
    if (body.memberCountDisplay !== undefined) updatePayload.memberCountDisplay = sanitizeString(body.memberCountDisplay);
    if (body.isRequired !== undefined) updatePayload.isRequired = Boolean(body.isRequired);
    if (body.showOnWebsite !== undefined) updatePayload.showOnWebsite = Boolean(body.showOnWebsite);
    if (body.showOnMiniapp !== undefined) updatePayload.showOnMiniapp = Boolean(body.showOnMiniapp);
    if (body.isActive !== undefined) updatePayload.isActive = Boolean(body.isActive);
    if (body.orderIndex !== undefined) updatePayload.orderIndex = Number(body.orderIndex);

    const updated = await modifyTelegramDestination(id, updatePayload);

    await logAdminAction({
      admin: admin.username,
      action: 'destination_updated',
      target: updated?.title || existing.title,
      metadata: { id, updates: Object.keys(updatePayload) },
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('[Admin Destination PUT Error]:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update destination' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const admin = verifyAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'AdminBrowser/1.0';

  try {
    const existing = await fetchTelegramDestinationById(id);
    const removed = await removeTelegramDestination(id);

    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'Destination not found or already deleted' },
        { status: 404 }
      );
    }

    await logAdminAction({
      admin: admin.username,
      action: 'destination_deleted',
      target: existing?.title || id,
      metadata: { id, type: existing?.type },
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Destination deleted successfully',
    });
  } catch (error: any) {
    console.error('[Admin Destination DELETE Error]:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete destination' },
      { status: 500 }
    );
  }
}
