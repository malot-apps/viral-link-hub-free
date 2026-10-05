import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseAdminClient, isSupabaseConfigured } from './supabase';

export const STORAGE_BUCKET = 'video-images';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

const MIME_TO_EXTENSION: Record<AllowedMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * Validates whether the given MIME type is strictly allowed.
 */
export function isAllowedMimeType(mime?: string): mime is AllowedMimeType {
  if (!mime) return false;
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime.toLowerCase());
}

/**
 * Returns extension for a given MIME type
 */
export function getExtensionForMime(mime: AllowedMimeType): string {
  return MIME_TO_EXTENSION[mime] || 'jpg';
}

/**
 * Ensures the 'video-images' bucket exists and is public in Supabase Storage.
 */
export async function ensureStorageBucket(): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client) return false;

  try {
    const { data: bucket, error } = await client.storage.getBucket(STORAGE_BUCKET);
    if (!bucket || error) {
      const { error: createError } = await client.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: [...ALLOWED_MIME_TYPES],
      });

      if (createError && !createError.message.includes('already exists')) {
        console.error('[Supabase Storage] Failed to create bucket:', createError.message);
        return false;
      }
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase Storage Bucket Error]:', err.message);
    return false;
  }
}

/**
 * Checks if a given URL is a Supabase Storage URL pointing to our bucket
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes(`/storage/v1/object/public/${STORAGE_BUCKET}/`) ||
    url.includes(`/${STORAGE_BUCKET}/`)
  );
}

/**
 * Extracts the storage file path from a Supabase storage URL or local upload URL
 */
export function extractStoragePath(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  // Supabase public URL pattern
  const publicMarker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const publicIndex = url.indexOf(publicMarker);
  if (publicIndex !== -1) {
    return decodeURIComponent(url.slice(publicIndex + publicMarker.length));
  }

  // Fallback bucket marker
  const bucketMarker = `/${STORAGE_BUCKET}/`;
  const bucketIndex = url.indexOf(bucketMarker);
  if (bucketIndex !== -1) {
    return decodeURIComponent(url.slice(bucketIndex + bucketMarker.length));
  }

  // Local demo uploads marker
  const localMarker = `/uploads/video-images/`;
  const localIndex = url.indexOf(localMarker);
  if (localIndex !== -1) {
    return decodeURIComponent(url.slice(localIndex + localMarker.length));
  }

  return null;
}

export interface UploadOptions {
  buffer: Buffer;
  mimeType: AllowedMimeType;
  videoId?: string;
  imageType: 'poster' | 'banner';
  originalFilename?: string;
}

export interface UploadResult {
  publicUrl: string;
  storagePath: string;
  mimeType: string;
  size: number;
}

/**
 * Uploads an image buffer securely to Supabase Storage (or isolated demo store).
 * Files are organized under:
 * video-images/{videoId-or-unique-id}/{poster-or-banner}-{timestamp}-{hash}.{ext}
 */
export async function uploadVideoImage(options: UploadOptions): Promise<UploadResult> {
  const { buffer, mimeType, videoId, imageType } = options;

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size (${(buffer.length / 1024 / 1024).toFixed(1)}MB) exceeds limit of 10MB.`);
  }

  const ext = getExtensionForMime(mimeType);
  const folderId = (videoId && videoId.trim()) || `vid_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const filename = `${imageType}-${Date.now()}-${randomSuffix}.${ext}`;
  const storagePath = `${folderId}/${filename}`;

  const client = getSupabaseAdminClient();

  // 1. SUPABASE STORAGE (Primary Production Mode)
  if (client && isSupabaseConfigured()) {
    await ensureStorageBucket();

    const { error: uploadError } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('[Supabase Storage Upload Error]:', uploadError.message);
      throw new Error(`Failed to upload image to Supabase Storage: ${uploadError.message}`);
    }

    const { data: urlData } = client.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return {
      publicUrl: urlData.publicUrl,
      storagePath,
      mimeType,
      size: buffer.length,
    };
  }

  // 2. LOCAL UPLOADS FALLBACK (For demo mode / preview without active Supabase keys)
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'video-images', folderId);
  await fs.promises.mkdir(uploadsDir, { recursive: true });

  const targetDiskPath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(targetDiskPath, buffer);

  const localPublicUrl = `/uploads/video-images/${folderId}/${filename}`;

  return {
    publicUrl: localPublicUrl,
    storagePath,
    mimeType,
    size: buffer.length,
  };
}

/**
 * Removes an existing file from Supabase Storage or local fallback storage.
 */
export async function deleteStorageFile(urlOrPath?: string | null): Promise<boolean> {
  if (!urlOrPath) return false;

  const storagePath = extractStoragePath(urlOrPath);
  if (!storagePath) return false;

  // 1. Try Supabase Storage deletion
  const client = getSupabaseAdminClient();
  if (client && isSupabaseConfigured() && isSupabaseStorageUrl(urlOrPath)) {
    try {
      const { error } = await client.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);

      if (error) {
        console.warn('[Supabase Storage Remove Warning]:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase Storage Remove Error]:', err.message);
      return false;
    }
  }

  // 2. Try Local File deletion
  if (urlOrPath.startsWith('/uploads/video-images/')) {
    try {
      const relativeDiskPath = path.join(process.cwd(), 'public', 'uploads', 'video-images', storagePath);
      if (fs.existsSync(relativeDiskPath)) {
        await fs.promises.unlink(relativeDiskPath);
        return true;
      }
    } catch (err: any) {
      console.warn('[Local Storage Remove Error]:', err.message);
    }
  }

  return false;
}
