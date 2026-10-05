import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { deleteStorageFile } from '@/lib/storage';
import { logAdminAction } from '@/lib/data-service';

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
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'No image URL provided' },
        { status: 400 }
      );
    }

    const removed = await deleteStorageFile(imageUrl);

    await logAdminAction({
      admin: admin.username,
      action: 'image_deleted',
      target: imageUrl,
      metadata: { removed },
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Image removed from storage',
      removed,
    });
  } catch (error: any) {
    console.error('[Admin Delete Image Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
