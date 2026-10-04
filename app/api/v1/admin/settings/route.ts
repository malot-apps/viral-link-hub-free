import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db-store';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const admin = verifyAdminToken(authHeader);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Valid Admin Bearer JWT required' },
      { status: 401 }
    );
  }

  const settings = getSettings();
  return NextResponse.json({
    success: true,
    data: settings,
  });
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const admin = verifyAdminToken(authHeader);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Valid Admin Bearer JWT required' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const updated = updateSettings(body);

    return NextResponse.json({
      success: true,
      message: 'App settings updated successfully',
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 400 }
    );
  }
}
