import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
  fetchTelegramEntities,
  createTelegramEntity,
  modifyTelegramEntity,
  removeTelegramEntity,
  logAdminAction,
} from '@/lib/data-service';

export async function GET(req: NextRequest) {
  const admin = verifyAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  try {
    const entities = await fetchTelegramEntities();
    return NextResponse.json({ success: true, count: entities.length, data: entities });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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

  try {
    const body = await req.json();
    if (!body.title || !body.type || !body.url) {
      return NextResponse.json(
        { success: false, error: 'Title, type, and URL are required' },
        { status: 400 }
      );
    }

    const created = await createTelegramEntity({
      type: body.type,
      title: body.title.trim(),
      identifier: (body.identifier || body.title).trim(),
      chatId: (body.chatId || '').trim(),
      url: body.url.trim(),
      isPrimary: Boolean(body.isPrimary),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    await logAdminAction({
      admin: admin.username,
      action: 'telegram_entity_created',
      target: `${created.type.toUpperCase()}: ${created.title}`,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = verifyAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Entity ID is required' }, { status: 400 });
    }

    const updated = await modifyTelegramEntity(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    await logAdminAction({
      admin: admin.username,
      action: 'telegram_entity_updated',
      target: `${updated.type.toUpperCase()}: ${updated.title}`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = verifyAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Entity ID is required' }, { status: 400 });
    }

    const removed = await removeTelegramEntity(id);
    await logAdminAction({
      admin: admin.username,
      action: 'telegram_entity_deleted',
      target: id,
    });

    return NextResponse.json({ success: true, removed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
