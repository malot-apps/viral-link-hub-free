import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoById, modifyVideo, removeVideo, logAdminAction } from '@/lib/data-service';
import { verifyAdminSession } from '@/lib/admin-auth';
import { isValidHttpUrl, sanitizeString } from '@/lib/security';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminSession(req);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const video = await fetchVideoById(id);
    if (!video) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: video });
  } catch (error: any) {
    console.error('[Admin Video Detail Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve video details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminSession(req);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'AdminBrowser/1.0';

  try {
    const body = await req.json();
    const updatePayload: Record<string, any> = {};

    if (body.title !== undefined) updatePayload.title = sanitizeString(body.title);
    if (body.description !== undefined) updatePayload.description = sanitizeString(body.description);
    if (body.category !== undefined) updatePayload.category = sanitizeString(body.category);
    if (body.quality !== undefined) updatePayload.quality = sanitizeString(body.quality);
    if (body.fileSize !== undefined) updatePayload.fileSize = sanitizeString(body.fileSize);
    if (body.isFeatured !== undefined) updatePayload.isFeatured = Boolean(body.isFeatured);
    if (body.requiredAdsCount !== undefined) {
      updatePayload.requiredAdsCount = Math.max(0, Math.min(10, Number(body.requiredAdsCount)));
    }
    if (Array.isArray(body.tags)) {
      updatePayload.tags = body.tags.map(sanitizeString);
    }

    // URL validations
    const stream = (body.streamUrl || body.targetLink || '').trim();
    if (stream) {
      if (!isValidHttpUrl(stream)) {
        return NextResponse.json(
          { success: false, error: 'Stream URL must be a valid HTTP or HTTPS address' },
          { status: 400 }
        );
      }
      updatePayload.streamUrl = stream;
      updatePayload.targetLink = stream;
    }

    if (body.posterUrl !== undefined) {
      const poster = String(body.posterUrl).trim();
      if (!isValidHttpUrl(poster)) {
        return NextResponse.json(
          { success: false, error: 'Poster URL must be a valid HTTP/HTTPS address or asset path' },
          { status: 400 }
        );
      }
      updatePayload.posterUrl = poster;
    }

    if (body.bannerUrl !== undefined) {
      const banner = String(body.bannerUrl).trim();
      if (banner && !isValidHttpUrl(banner)) {
        return NextResponse.json(
          { success: false, error: 'Banner URL must be a valid HTTP/HTTPS address or asset path' },
          { status: 400 }
        );
      }
      updatePayload.bannerUrl = banner;
      updatePayload.bannerGifUrl = banner;
    }

    if (body.directAdLink !== undefined) {
      const directAd = String(body.directAdLink).trim();
      if (directAd && !isValidHttpUrl(directAd)) {
        return NextResponse.json(
          { success: false, error: 'Direct Ad Link must be a valid HTTP or HTTPS address' },
          { status: 400 }
        );
      }
      updatePayload.directAdLink = directAd;
    }

    const updated = await modifyVideo(id, updatePayload);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    await logAdminAction({
      admin: admin.username,
      action: 'video_updated',
      target: `${updated.title} (${updated._id})`,
      metadata: { fields: Object.keys(updatePayload) },
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('[Admin Video PUT Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to update video record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminSession(req);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'AdminBrowser/1.0';

  try {
    const existing = await fetchVideoById(id);
    const deleted = await removeVideo(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    await logAdminAction({
      admin: admin.username,
      action: 'video_deleted',
      target: existing ? `${existing.title} (${id})` : id,
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error: any) {
    console.error('[Admin Video DELETE Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to delete video record' },
      { status: 500 }
    );
  }
}
