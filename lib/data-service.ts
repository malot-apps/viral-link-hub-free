import { connectToDatabase } from './mongodb';
import { Video, IVideoDocument } from '@/models/Video';
import { Settings, ISettingsDocument } from '@/models/Settings';
import { Visitor, IVisitorDocument } from '@/models/Visitor';
import { AuditLog, AuditActionType } from '@/models/AuditLog';
import { demoStore } from './demo-store';
import { isProduction, isDemo, APP_MODE } from './config';
import { IVideo, ISettings, IVisitorLog } from './types';

const ACTIVE_SESSION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// In-memory sliding session tracker for live users (used in conjunction with DB)
const liveActiveSessionCache = new Map<string, number>();

/**
 * Normalizes a Mongoose Video document or plain video object
 */
export function normalizeVideo(doc: any): IVideo {
  const id = doc._id ? String(doc._id) : (doc.id ? String(doc.id) : '');
  const stream = doc.streamUrl || doc.targetLink || '';

  return {
    _id: id,
    title: doc.title || '',
    description: doc.description || '',
    posterUrl: doc.posterUrl || '',
    bannerGifUrl: doc.bannerGifUrl || doc.posterUrl || '',
    bannerUrl: doc.bannerUrl || doc.posterUrl || '',
    category: doc.category || 'Viral Movies',
    streamUrl: stream,
    serverUrl: stream,
    hdSourceUrl: stream,
    targetLink: stream,
    targetType: doc.targetType || 'direct_stream',
    directAdLink: doc.directAdLink || '',
    requiredAdsCount: typeof doc.requiredAdsCount === 'number' ? doc.requiredAdsCount : 2,
    viewsCount: typeof doc.viewsCount === 'number' ? doc.viewsCount : 0,
    isFeatured: Boolean(doc.isFeatured),
    quality: doc.quality || '1080p HD',
    fileSize: doc.fileSize || '1.4 GB',
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * -------------------------------------------------------------
 * VIDEOS DATA ACCESS
 * -------------------------------------------------------------
 */

export async function fetchVideos(filter?: {
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<IVideo[]> {
  const conn = await connectToDatabase();

  if (conn) {
    const query: Record<string, any> = {};

    if (filter?.category && filter.category !== 'All') {
      query.category = { $regex: new RegExp(`^${filter.category}$`, 'i') };
    }

    if (filter?.featured !== undefined) {
      query.isFeatured = filter.featured;
    }

    if (filter?.search?.trim()) {
      const q = filter.search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const docs = await Video.find(query).sort({ isFeatured: -1, createdAt: -1 }).lean();
    return docs.map(normalizeVideo);
  }

  // Demo fallback strictly when in demo mode
  if (isDemo()) {
    let list = [...demoStore.videos];

    if (filter?.category && filter.category !== 'All') {
      list = list.filter((v) => v.category.toLowerCase() === filter.category!.toLowerCase());
    }

    if (filter?.featured !== undefined) {
      list = list.filter((v) => v.isFeatured === filter.featured);
    }

    if (filter?.search?.trim()) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }

  throw new Error('[Data Service] Production database unavailable');
}

export async function fetchVideoById(id: string): Promise<IVideo | null> {
  const conn = await connectToDatabase();

  if (conn) {
    try {
      const doc = await Video.findById(id).lean();
      return doc ? normalizeVideo(doc) : null;
    } catch {
      // In case ID is not a valid Mongo ObjectId, search by string field or null
      return null;
    }
  }

  if (isDemo()) {
    const found = demoStore.videos.find((v) => v._id === id);
    return found ? { ...found } : null;
  }

  throw new Error('[Data Service] Production database unavailable');
}

export async function createNewVideo(data: {
  title: string;
  description?: string;
  posterUrl: string;
  bannerUrl?: string;
  bannerGifUrl?: string;
  category: string;
  streamUrl: string;
  targetLink?: string;
  directAdLink?: string;
  requiredAdsCount?: number;
  quality?: string;
  fileSize?: string;
  tags?: string[];
  isFeatured?: boolean;
}): Promise<IVideo> {
  const conn = await connectToDatabase();
  const effectiveStream = data.streamUrl || data.targetLink || '';

  if (conn) {
    const doc = await Video.create({
      title: data.title,
      description: data.description || '',
      posterUrl: data.posterUrl,
      bannerUrl: data.bannerUrl || data.posterUrl,
      bannerGifUrl: data.bannerGifUrl || data.bannerUrl || data.posterUrl,
      category: data.category || 'Viral Movies',
      streamUrl: effectiveStream,
      targetLink: effectiveStream,
      targetType: 'direct_stream',
      directAdLink: data.directAdLink || '',
      requiredAdsCount: typeof data.requiredAdsCount === 'number' ? data.requiredAdsCount : 2,
      quality: data.quality || '1080p HD',
      fileSize: data.fileSize || '1.4 GB',
      tags: Array.isArray(data.tags) ? data.tags : [],
      isFeatured: Boolean(data.isFeatured),
      viewsCount: 0,
    });

    return normalizeVideo(doc.toObject());
  }

  if (isDemo()) {
    const newVideo: IVideo = {
      _id: `demo-vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: data.title,
      description: data.description || '',
      posterUrl: data.posterUrl,
      bannerUrl: data.bannerUrl || data.posterUrl,
      bannerGifUrl: data.bannerGifUrl || data.bannerUrl || data.posterUrl,
      category: data.category || 'Viral Movies',
      streamUrl: effectiveStream,
      serverUrl: effectiveStream,
      hdSourceUrl: effectiveStream,
      targetLink: effectiveStream,
      targetType: 'direct_stream',
      directAdLink: data.directAdLink || '',
      requiredAdsCount: typeof data.requiredAdsCount === 'number' ? data.requiredAdsCount : 2,
      quality: data.quality || '1080p HD',
      fileSize: data.fileSize || '1.4 GB',
      tags: Array.isArray(data.tags) ? data.tags : [],
      isFeatured: Boolean(data.isFeatured),
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    demoStore.videos.unshift(newVideo);
    return newVideo;
  }

  throw new Error('[Data Service] Production database unavailable');
}

export async function modifyVideo(id: string, updates: Partial<IVideo>): Promise<IVideo | null> {
  const conn = await connectToDatabase();

  if (conn) {
    const updateData: Record<string, any> = { ...updates };
    if (updates.streamUrl || updates.targetLink) {
      const stream = updates.streamUrl || updates.targetLink;
      updateData.streamUrl = stream;
      updateData.targetLink = stream;
    }

    const doc = await Video.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    return doc ? normalizeVideo(doc) : null;
  }

  if (isDemo()) {
    const index = demoStore.videos.findIndex((v) => v._id === id);
    if (index === -1) return null;

    demoStore.videos[index] = {
      ...demoStore.videos[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...demoStore.videos[index] };
  }

  throw new Error('[Data Service] Production database unavailable');
}

export async function removeVideo(id: string): Promise<boolean> {
  const conn = await connectToDatabase();

  if (conn) {
    const res = await Video.findByIdAndDelete(id);
    return Boolean(res);
  }

  if (isDemo()) {
    const idx = demoStore.videos.findIndex((v) => v._id === id);
    if (idx === -1) return false;
    demoStore.videos.splice(idx, 1);
    return true;
  }

  throw new Error('[Data Service] Production database unavailable');
}

/**
 * -------------------------------------------------------------
 * SETTINGS DATA ACCESS
 * -------------------------------------------------------------
 */

export async function fetchSettings(): Promise<ISettings> {
  const conn = await connectToDatabase();

  if (conn) {
    let doc = await Settings.findOne().lean();
    if (!doc) {
      const created = await Settings.create({
        appName: 'VIRAL LINK HUB',
        maintenanceMode: false,
        globalAdLink: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
        primaryDirectLink: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
        secondaryDirectLink: 'https://profitablegatecpm.com/direct?zone=65432&ref=virallinkhub',
        defaultAdsRequired: 2,
        announcementBannerText: '🚀 High-Speed Direct Cloud Streams active! Complete sponsor verification to unlock 4K masters.',
        telegramChannelUrl: 'https://t.me/virallinkhub_official',
        forceJoinChannel: false,
      });
      doc = created.toObject();
    }

    return {
      appName: doc.appName || 'VIRAL LINK HUB',
      maintenanceMode: Boolean(doc.maintenanceMode),
      globalAdLink: doc.globalAdLink || '',
      primaryDirectLink: doc.primaryDirectLink || doc.globalAdLink || '',
      secondaryDirectLink: doc.secondaryDirectLink || '',
      bannerScriptCode: doc.bannerScriptCode || '',
      popunderScriptCode: doc.popunderScriptCode || '',
      defaultAdsRequired: typeof doc.defaultAdsRequired === 'number' ? doc.defaultAdsRequired : 2,
      announcementBannerText: doc.announcementBannerText || '',
      telegramChannelUrl: doc.telegramChannelUrl || '',
      forceJoinChannel: Boolean(doc.forceJoinChannel),
    };
  }

  if (isDemo()) {
    return { ...demoStore.settings };
  }

  throw new Error('[Data Service] Production database unavailable');
}

export async function modifySettings(updates: Partial<ISettings>): Promise<ISettings> {
  const conn = await connectToDatabase();

  if (conn) {
    const doc = await Settings.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true,
      runValidators: true,
    }).lean();

    return {
      appName: doc.appName || 'VIRAL LINK HUB',
      maintenanceMode: Boolean(doc.maintenanceMode),
      globalAdLink: doc.globalAdLink || '',
      primaryDirectLink: doc.primaryDirectLink || doc.globalAdLink || '',
      secondaryDirectLink: doc.secondaryDirectLink || '',
      bannerScriptCode: doc.bannerScriptCode || '',
      popunderScriptCode: doc.popunderScriptCode || '',
      defaultAdsRequired: typeof doc.defaultAdsRequired === 'number' ? doc.defaultAdsRequired : 2,
      announcementBannerText: doc.announcementBannerText || '',
      telegramChannelUrl: doc.telegramChannelUrl || '',
      forceJoinChannel: Boolean(doc.forceJoinChannel),
    };
  }

  if (isDemo()) {
    demoStore.settings = {
      ...demoStore.settings,
      ...updates,
    };
    return { ...demoStore.settings };
  }

  throw new Error('[Data Service] Production database unavailable');
}

/**
 * -------------------------------------------------------------
 * ANALYTICS & VISITOR METRICS
 * -------------------------------------------------------------
 */

export async function recordVisitorHeartbeat({
  userId,
  ip,
  userAgent,
}: {
  userId?: string | null;
  ip?: string;
  userAgent?: string;
}): Promise<{ activeUsers: number; timestamp: number }> {
  const now = Date.now();
  const sessionKey = userId ? `tg_${userId}` : `ip_${ip || 'unknown'}`;
  liveActiveSessionCache.set(sessionKey, now);

  const conn = await connectToDatabase();

  if (conn && userId && userId !== 'guest') {
    try {
      await Visitor.findOneAndUpdate(
        { telegramUserId: String(userId) },
        {
          $set: {
            lastActiveAt: new Date(now),
            ip: ip || '127.0.0.1',
            userAgent: userAgent || 'TelegramMiniApp/1.0',
          },
          $setOnInsert: {
            viewsCount: 0,
            adClicksCount: 0,
          },
        },
        { upsert: true }
      );
    } catch {
      // Non-fatal visitor tracking update
    }
  } else if (isDemo()) {
    demoStore.activeSessions.set(sessionKey, now);
    if (userId) demoStore.uniqueVisitors.add(String(userId));
  }

  return {
    activeUsers: getLiveUsersCount(),
    timestamp: now,
  };
}

export async function incrementVideoViewCount(videoId: string): Promise<number> {
  const conn = await connectToDatabase();

  if (conn) {
    try {
      const updated = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { viewsCount: 1 } },
        { new: true }
      ).lean();
      return updated?.viewsCount ?? 0;
    } catch {
      return 0;
    }
  }

  if (isDemo()) {
    const video = demoStore.videos.find((v) => v._id === videoId);
    if (video) {
      video.viewsCount = (video.viewsCount || 0) + 1;
      demoStore.totalViews += 1;
      return video.viewsCount;
    }
  }

  return 0;
}

export async function recordAdClickEvent(userId?: string | null): Promise<number> {
  const conn = await connectToDatabase();

  if (conn && userId && userId !== 'guest') {
    try {
      const visitor = await Visitor.findOneAndUpdate(
        { telegramUserId: String(userId) },
        { $inc: { adClicksCount: 1 } },
        { upsert: true, new: true }
      ).lean();
      return visitor?.adClicksCount ?? 1;
    } catch {
      return 1;
    }
  }

  if (isDemo()) {
    demoStore.adClicks += 1;
    return demoStore.adClicks;
  }

  return 1;
}

export function getLiveUsersCount(): number {
  const cutoff = Date.now() - ACTIVE_SESSION_WINDOW_MS;
  let count = 0;

  for (const [key, timestamp] of liveActiveSessionCache.entries()) {
    if (timestamp >= cutoff) {
      count++;
    } else {
      liveActiveSessionCache.delete(key);
    }
  }

  return Math.max(1, count);
}

export async function fetchAdminStats(): Promise<{
  liveActiveUsers: number;
  totalUniqueVisitors: number | string;
  totalViews: number | string;
  adsRevenueClicks: number | string;
  totalVideos: number;
  featuredVideos: number;
  activeWindowMinutes: number;
  recentLogs: IVisitorLog[];
  generatedAt: string;
  mode: 'production' | 'demo';
}> {
  const conn = await connectToDatabase();

  if (conn) {
    const [totalVideos, featuredVideos, visitorCount, viewAgg, clickAgg, recentLogs] =
      await Promise.all([
        Video.countDocuments(),
        Video.countDocuments({ isFeatured: true }),
        Visitor.countDocuments(),
        Video.aggregate([{ $group: { _id: null, total: { $sum: '$viewsCount' } } }]),
        Visitor.aggregate([{ $group: { _id: null, total: { $sum: '$adClicksCount' } } }]),
        AuditLog.find().sort({ createdAt: -1 }).limit(15).lean(),
      ]);

    const totalViews = viewAgg.length > 0 ? (viewAgg[0].total ?? 0) : 0;
    const adsRevenueClicks = clickAgg.length > 0 ? (clickAgg[0].total ?? 0) : 0;

    const formattedLogs: IVisitorLog[] = recentLogs.map((log: any) => ({
      id: String(log._id),
      userId: log.admin,
      ip: log.ip,
      userAgent: log.userAgent,
      path: log.action + (log.target ? ` (${log.target})` : ''),
      timestamp: log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString(),
    }));

    return {
      liveActiveUsers: getLiveUsersCount(),
      totalUniqueVisitors: visitorCount,
      totalViews,
      adsRevenueClicks,
      totalVideos,
      featuredVideos,
      activeWindowMinutes: 5,
      recentLogs: formattedLogs,
      generatedAt: new Date().toISOString(),
      mode: 'production',
    };
  }

  if (isDemo()) {
    return {
      liveActiveUsers: Math.max(demoStore.uniqueVisitors.size > 0 ? 3 : 1, getLiveUsersCount()),
      totalUniqueVisitors: demoStore.uniqueVisitors.size,
      totalViews: demoStore.totalViews,
      adsRevenueClicks: demoStore.adClicks,
      totalVideos: demoStore.videos.length,
      featuredVideos: demoStore.videos.filter((v) => v.isFeatured).length,
      activeWindowMinutes: 5,
      recentLogs: demoStore.auditLogs.slice(0, 15),
      generatedAt: new Date().toISOString(),
      mode: 'demo',
    };
  }

  throw new Error('[Data Service] Production database unavailable');
}

/**
 * -------------------------------------------------------------
 * AUDIT LOGS
 * -------------------------------------------------------------
 */

export async function logAdminAction({
  admin,
  action,
  target = '',
  metadata = {},
  ip = '127.0.0.1',
  userAgent = 'Admin/1.0',
}: {
  admin: string;
  action: AuditActionType;
  target?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  const conn = await connectToDatabase();

  if (conn) {
    try {
      await AuditLog.create({
        admin,
        action,
        target,
        metadata,
        ip,
        userAgent,
      });
    } catch (err) {
      console.error('[Audit Log] Failed to save audit log:', err);
    }
  } else if (isDemo()) {
    const demoLog: IVisitorLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: admin,
      ip,
      userAgent,
      path: `${action}: ${target}`,
      timestamp: new Date().toISOString(),
    };
    demoStore.auditLogs.unshift(demoLog);
  }
}

export async function fetchAuditLogs(limit = 50): Promise<any[]> {
  const conn = await connectToDatabase();

  if (conn) {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
    return logs.map((l: any) => ({
      _id: String(l._id),
      admin: l.admin,
      action: l.action,
      target: l.target || '',
      metadata: l.metadata || {},
      ip: l.ip,
      userAgent: l.userAgent,
      createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
    }));
  }

  if (isDemo()) {
    return demoStore.auditLogs.slice(0, limit).map((l) => ({
      _id: l.id,
      admin: l.userId,
      action: l.path.split(':')[0] || 'activity',
      target: l.path.split(':')[1]?.trim() || '',
      metadata: {},
      ip: l.ip,
      userAgent: l.userAgent,
      createdAt: l.timestamp,
    }));
  }

  throw new Error('[Data Service] Production database unavailable');
}
