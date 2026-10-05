import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
  fetchCampaignsWithStats,
  createCampaign,
  removeCampaign,
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
    const campaigns = await fetchCampaignsWithStats();
    return NextResponse.json({ success: true, count: campaigns.length, data: campaigns });
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
    if (!body.campaignId || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID and Name are required' },
        { status: 400 }
      );
    }

    const created = await createCampaign({
      campaignId: body.campaignId.trim(),
      name: body.name.trim(),
      description: (body.description || '').trim(),
      source: body.source || 'telegram',
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    await logAdminAction({
      admin: admin.username,
      action: 'campaign_created',
      target: `${created.name} (${created.campaignId})`,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
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
      return NextResponse.json({ success: false, error: 'Campaign ID is required' }, { status: 400 });
    }

    const removed = await removeCampaign(id);
    await logAdminAction({
      admin: admin.username,
      action: 'campaign_deleted',
      target: id,
    });

    return NextResponse.json({ success: true, removed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
