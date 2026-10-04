import { NextRequest, NextResponse } from 'next/server';
import { getVideoById } from '@/lib/db-store';
import { handleRequestMetrics } from '@/lib/extract-client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  handleRequestMetrics(req);
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
    targetType: 'direct_stream',
    directAdLink: video.directAdLink || '',
    requiredAdsCount: video.requiredAdsCount ?? 2,
    viewsCount: video.viewsCount || 0,
    isFeatured: Boolean(video.isFeatured),
    quality: video.quality || '1080p HD',
    fileSize: video.fileSize || '1.4 GB',
    tags: video.tags || [],
  };

  return NextResponse.json({
    success: true,
    data: masked,
  });
}
