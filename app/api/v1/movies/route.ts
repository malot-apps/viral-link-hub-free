import { NextRequest, NextResponse } from 'next/server';
import { getVideos } from '@/lib/db-store';
import { handleRequestMetrics } from '@/lib/extract-client';

export async function GET(req: NextRequest) {
  handleRequestMetrics(req);

  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');

  let videos = getVideos();

  if (category && category !== 'All') {
    videos = videos.filter((v) => v.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    videos = videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (featured === 'true') {
    videos = videos.filter((v) => v.isFeatured);
  }

  const allCategories = ['All', 'Viral Movies', 'VIP Cloud', 'Trending Now', 'Recommended', 'Action', 'Anime'];

  // Map and mask all video records
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
    targetType: 'direct_stream',
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
    total: getVideos().length,
    categories: allCategories,
    data: maskedVideos,
  });
}
