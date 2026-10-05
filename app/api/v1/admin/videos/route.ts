import { NextRequest, NextResponse } from 'next/server';
import { fetchVideos, createNewVideo, logAdminAction } from '@/lib/data-service';
import { verifyAdminSession } from '@/lib/admin-auth';
import { isValidHttpUrl, sanitizeString } from '@/lib/security';

export async function GET(req: NextRequest) {
  const admin = verifyAdminSession(req);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const featured = searchParams.has('featured')
      ? searchParams.get('featured') === 'true'
      : undefined;

    const videos = await fetchVideos({ category, search, featured });

    return NextResponse.json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error: any) {
    console.error('[Admin Videos GET Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve video catalog' },
      { status: 503 }
    );
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

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'AdminBrowser/1.0';

  try {
    const body = await req.json();
    const title = sanitizeString(body.title);
    const description = sanitizeString(body.description);
    const effectiveStreamUrl = (body.streamUrl || body.targetLink || '').trim();
    const posterUrl = (body.posterUrl || '').trim();
    const bannerUrl = (body.bannerUrl || posterUrl).trim();
    const category = sanitizeString(body.category || 'Viral Movies');
    const quality = sanitizeString(body.quality || '1080p HD');
    const fileSize = sanitizeString(body.fileSize || '1.4 GB');
    const directAdLink = (body.directAdLink || '').trim();

    // 1. Mandatory field checks
    if (!title || !effectiveStreamUrl || !posterUrl) {
      return NextResponse.json(
        { success: false, error: 'Title, stream URL, and poster URL are required' },
        { status: 400 }
      );
    }

    // 2. Security validation: HTTP/HTTPS URL verification
    if (!isValidHttpUrl(effectiveStreamUrl)) {
      return NextResponse.json(
        { success: false, error: 'Stream URL must be a valid HTTP or HTTPS address' },
        { status: 400 }
      );
    }

    if (!isValidHttpUrl(posterUrl)) {
      return NextResponse.json(
        { success: false, error: 'Poster URL must be a valid HTTP/HTTPS address or valid asset path' },
        { status: 400 }
      );
    }

    if (bannerUrl && !isValidHttpUrl(bannerUrl)) {
      return NextResponse.json(
        { success: false, error: 'Banner URL must be a valid HTTP/HTTPS address or valid asset path' },
        { status: 400 }
      );
    }

    if (directAdLink && !isValidHttpUrl(directAdLink)) {
      return NextResponse.json(
        { success: false, error: 'Direct Ad Link must be a valid HTTP or HTTPS address' },
        { status: 400 }
      );
    }

    const created = await createNewVideo({
      title,
      description,
      posterUrl,
      bannerUrl,
      bannerGifUrl: bannerUrl,
      category,
      streamUrl: effectiveStreamUrl,
      targetLink: effectiveStreamUrl,
      directAdLink,
      requiredAdsCount:
        typeof body.requiredAdsCount === 'number'
          ? Math.max(0, Math.min(10, body.requiredAdsCount))
          : 2,
      quality,
      fileSize,
      tags: Array.isArray(body.tags) ? body.tags.map(sanitizeString) : [],
      isFeatured: Boolean(body.isFeatured),
    });

    // Audit log
    await logAdminAction({
      admin: admin.username,
      action: 'video_created',
      target: `${created.title} (${created._id})`,
      metadata: { category: created.category, quality: created.quality },
      ip,
      userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Video created successfully',
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Admin Video POST Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to create video record' },
      { status: 500 }
    );
  }
}
