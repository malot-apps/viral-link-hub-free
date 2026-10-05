import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
  fetchGrowthMissions,
  createGrowthMission,
  modifyGrowthMission,
  removeGrowthMission,
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
    const missions = await fetchGrowthMissions(false);
    return NextResponse.json({ success: true, count: missions.length, data: missions });
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
    if (!body.title || !body.type || !body.targetUrl) {
      return NextResponse.json(
        { success: false, error: 'Title, type, and target URL are required' },
        { status: 400 }
      );
    }

    const created = await createGrowthMission({
      type: body.type,
      title: body.title.trim(),
      description: (body.description || '').trim(),
      targetUrl: body.targetUrl.trim(),
      chatId: (body.chatId || '').trim(),
      requiredCount: Number(body.requiredCount) || 1,
      rewardAdCredits: Number(body.rewardAdCredits) || 1,
      rewardDescription: body.rewardDescription || '+1 VIP Credit',
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      orderIndex: Number(body.orderIndex) || 0,
    });

    await logAdminAction({
      admin: admin.username,
      action: 'growth_mission_created',
      target: created.title,
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
      return NextResponse.json({ success: false, error: 'Mission ID is required' }, { status: 400 });
    }

    const updated = await modifyGrowthMission(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Mission not found' }, { status: 404 });
    }

    await logAdminAction({
      admin: admin.username,
      action: 'growth_mission_updated',
      target: updated.title,
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
      return NextResponse.json({ success: false, error: 'Mission ID is required' }, { status: 400 });
    }

    const removed = await removeGrowthMission(id);
    await logAdminAction({
      admin: admin.username,
      action: 'growth_mission_deleted',
      target: id,
    });

    return NextResponse.json({ success: true, removed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
