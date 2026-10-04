import { NextRequest, NextResponse } from 'next/server';
import { getVideos, addVideo } from '@/lib/db-store';
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

  const videos = getVideos();
  const maskedVideos = videos.map((v) => ({
    _id: v._id,
    title: v.title,
    description: v.description,
    posterUrl: v.posterUrl,
    bannerGifUrl: v.bannerGifUrl || v.posterUrl,
    bannerUrl: v.bannerUrl || v.posterUrl,
    category: v.category === 'Terabox Cloud' ? 'VIP Cloud' : v.category,
    streamUrl: v.streamUrl || v.targetLink,
    serverUrl: v.streamUrl || v.targetLink,
    hdSourceUrl: v.streamUrl || v.targetLink,
    targetLink: v.streamUrl || v.targetLink,
    directAdLink: v.directAdLink || '',
    requiredAdsCount: v.requiredAdsCount ?? 2,
    viewsCount: v.viewsCount || 0,
    isFeatured: Boolean(v.isFeatured),
    quality: v.quality || '1080p HD',
    fileSize: v.fileSize || '1.4 GB',
    tags: v.tags || [],
  }));

  return NextResponse.json({
    success: true,
    count: maskedVideos.length,
    data: maskedVideos,
  });
}

export async function POST(req: NextRequest) {
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
    const effectiveStreamUrl = body.streamUrl || body.targetLink;
    const { title, posterUrl } = body;

    if (!title || !effectiveStreamUrl || !posterUrl) {
      return NextResponse.json(
        { success: false, error: 'title, streamUrl, and posterUrl are required' },
        { status: 400 }
      );
    }

    const created = addVideo({
      title,
      description: body.description || '',
      posterUrl,
      bannerGifUrl: body.bannerGifUrl || body.bannerUrl || posterUrl,
      bannerUrl: body.bannerUrl || posterUrl,
      category: body.category || 'Viral Movies',
      streamUrl: effectiveStreamUrl,
      serverUrl: effectiveStreamUrl,
      hdSourceUrl: effectiveStreamUrl,
      targetLink: effectiveStreamUrl,
      targetType: 'direct_stream',
      directAdLink: body.directAdLink || '',
      requiredAdsCount: typeof body.requiredAdsCount === 'number' ? body.requiredAdsCount : 2,
      isFeatured: Boolean(body.isFeatured),
      fileSize: body.fileSize || '1.4 GB',
      quality: body.quality || '1080p HD',
      tags: Array.isArray(body.tags) ? body.tags : [],
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Video created successfully',
        data: created,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create video' },
      { status: 400 }
    );
  }
}
