import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { isAllowedMimeType, uploadVideoImage, MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '@/lib/storage';
import { logAdminAction } from '@/lib/data-service';

export async function POST(req: NextRequest) {
  // 1. Strict Server-Side Authentication
  const admin = verifyAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required to upload images' },
      { status: 401 }
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'AdminBrowser/1.0';

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const imageType = (formData.get('imageType') as string) || 'poster';
    const videoId = (formData.get('videoId') as string) || '';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided in form data' },
        { status: 400 }
      );
    }

    // 2. MIME Type Validation
    const mimeType = file.type?.toLowerCase();
    if (!isAllowedMimeType(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file format (${mimeType || 'unknown'}). Allowed formats: JPG, PNG, WEBP, and GIF.`,
          allowedMimes: ALLOWED_MIME_TYPES,
        },
        { status: 400 }
      );
    }

    // 3. File Size Validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 10MB`,
        },
        { status: 400 }
      );
    }

    // 4. File Extension Verification
    const filename = file.name || 'image';
    const ext = filename.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!ext || !validExtensions.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file extension (.${ext || ''}). Allowed: .jpg, .jpeg, .png, .webp, .gif`,
        },
        { status: 400 }
      );
    }

    // 5. Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Upload directly to Supabase Storage
    const result = await uploadVideoImage({
      buffer,
      mimeType,
      videoId: videoId || undefined,
      imageType: imageType === 'banner' ? 'banner' : 'poster',
      originalFilename: file.name,
    });

    // 7. Audit log action
    await logAdminAction({
      admin: admin.username,
      action: 'image_uploaded',
      target: `${imageType.toUpperCase()} uploaded: ${file.name}`,
      metadata: {
        url: result.publicUrl,
        size: result.size,
        mimeType: result.mimeType,
        isGif: mimeType === 'image/gif',
      },
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: `${imageType.toUpperCase()} uploaded successfully`,
      data: {
        url: result.publicUrl,
        storagePath: result.storagePath,
        mimeType: result.mimeType,
        size: result.size,
        isGif: mimeType === 'image/gif',
      },
    });
  } catch (error: any) {
    console.error('[Admin Upload Image Error]:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed. Please verify storage configuration.' },
      { status: 500 }
    );
  }
}
