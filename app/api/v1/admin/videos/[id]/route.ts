import { NextRequest, NextResponse } from 'next/server';
import { updateVideo, deleteVideo, getVideoById } from '@/lib/db-store';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get('authorization');
  const admin = verifyAdminToken(authHeader);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Valid Admin Bearer JWT required' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const video = getVideoById(id);

  if (!video) {
    return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
  }

  const masked = {
    _id: video._id,
    title: video.title,
    description: video.description,
    posterUrl: video.posterUrl,
    bannerGifUrl: video.bannerGifUrl || video.posterUrl,
    bannerUrl: video.bannerUrl || video.posterUrl,
    category: video.category === 'Terabox Cloud' ? 'VIP Cloud' : video.category,
    streamUrl: video.streamUrl || video.targetLink,
    serverUrl: video.streamUrl || video.targetLink,
    hdSourceUrl: video.streamUrl || video.targetLink,
    targetLink: video.streamUrl || video.targetLink,
    directAdLink: video.directAdLink || '',
    requiredAdsCount: video.requiredAdsCount ?? 2,
    viewsCount: video.viewsCount || 0,
    isFeatured: Boolean(video.isFeatured),
    quality: video.quality || '1080p HD',
    fileSize: video.fileSize || '1.4 GB',
    tags: video.tags || [],
  };

  return NextResponse.json({ success: true, data: masked });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get('authorization');
  const admin = verifyAdminToken(authHeader);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Valid Admin Bearer JWT required' },
      { status: 401 }
    );
  }

  const { id } = await params;
  try {
    const body = await req.json();
    if (body.targetLink && !body.streamUrl) {
      body.streamUrl = body.targetLink;
    }
    if (body.streamUrl) {
      body.serverUrl = body.streamUrl;
      body.hdSourceUrl = body.streamUrl;
      body.targetLink = body.streamUrl;
    }

    const updated = updateVideo(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully',
      data: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update video' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get('authorization');
  const admin = verifyAdminToken(authHeader);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Valid Admin Bearer JWT required' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const deleted = deleteVideo(id);

  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Video deleted successfully',
  });
}
