import { getSupabaseAdminClient, isSupabaseConfigured } from './supabase';
import { isProduction, isDemo, config, validateProductionConfig } from './config';
import { demoStore } from './demo-store';
import {
  IVideo,
  ISettings,
  IUserProfile,
  IAnalyticsEvent,
  IReferralLeaderboardEntry,
  IGrowthAnalytics,
} from './types';

/**
 * Authoritative Data Service — Powered by Supabase PostgreSQL
 *
 * Implements:
 * - Next.js + Supabase as primary production architecture
 * - Fail-closed production security gate
 * - Isolated Demo Mode fallback with explicit UI tagging
 */

// Helper to map Supabase video row to IVideo interface
export function mapVideoFromDb(row: any): IVideo {
  if (!row) return {} as IVideo;
  return {
    _id: row.id,
    title: row.title,
    description: row.description || '',
    posterUrl: row.poster_url || '/images/hero_viral_cyberpunk.jpg',
    bannerGifUrl: row.banner_url || row.poster_url || '/images/hero_viral_cyberpunk.jpg',
    bannerUrl: row.banner_url || row.poster_url || '/images/hero_viral_cyberpunk.jpg',
    category: row.category || 'Trending',
    streamUrl: row.stream_url || '',
    serverUrl: row.stream_url || '',
    hdSourceUrl: row.stream_url || '',
    targetLink: row.target_link || row.stream_url || '',
    targetType: 'direct_stream',
    directAdLink: row.direct_ad_link || '',
    requiredAdsCount: typeof row.required_ads_count === 'number' ? row.required_ads_count : 2,
    viewsCount: Number(row.views_count) || 0,
    isFeatured: Boolean(row.is_featured),
    fileSize: row.file_size || '1.4 GB',
    quality: row.quality || '1080p HD',
    tags: Array.isArray(row.tags)
      ? row.tags
      : typeof row.tags === 'string'
      ? row.tags.split(',').map((t: string) => t.trim())
      : [],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

// Helper to map Supabase settings row to ISettings interface
export function mapSettingsFromDb(row: any): ISettings {
  if (!row) {
    return {
      appName: 'VIRAL LINK HUB',
      maintenanceMode: false,
      globalAdLink: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
      primaryDirectLink: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
      secondaryDirectLink: '',
      defaultAdsRequired: 2,
      announcementBannerText: '🔥 High-Speed Direct Cloud Streams active!',
      telegramChannelUrl: 'https://t.me/virallinkhub_official',
      forceJoinChannel: false,
      premiumRewardEnabled: true,
      premiumRequiredAds: 3,
      premiumRequiredReferrals: 3,
      premiumDurationHours: 24,
      adFrequencyEnabled: true,
      maxAdsPerSession: 5,
      maxPopundersPerSession: 1,
      adCooldownSeconds: 30,
      maxAdsPerDay: 20,
      adPlacements: {
        homeBanner: true,
        contentCard: true,
        contentDetails: true,
        unlockAction: true,
        betweenNav: true,
        popunder: true,
        premiumRewardArea: true,
      },
    };
  }

  return {
    appName: row.app_name || 'VIRAL LINK HUB',
    maintenanceMode: Boolean(row.maintenance_mode),
    globalAdLink: row.global_ad_url || 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
    primaryDirectLink: row.primary_ad_url || row.global_ad_url || '',
    secondaryDirectLink: row.secondary_ad_url || '',
    defaultAdsRequired: row.required_ads ?? 2,
    announcementBannerText: row.announcement_banner || '🔥 High-Speed Direct Cloud Streams active!',
    telegramChannelUrl: row.telegram_channel_url || 'https://t.me/virallinkhub_official',
    forceJoinChannel: Boolean(row.force_join_channel),
    premiumRewardEnabled: row.premium_reward_enabled ?? true,
    premiumRequiredAds: row.premium_required_ads ?? 3,
    premiumRequiredReferrals: row.premium_required_referrals ?? 3,
    premiumDurationHours: row.premium_duration_hours ?? 24,
    adFrequencyEnabled: true,
    maxAdsPerSession: row.max_ads_per_session ?? row.ad_frequency_limit ?? 5,
    maxPopundersPerSession: row.max_popunders_per_session ?? 1,
    adCooldownSeconds: row.ad_cooldown_seconds ?? 30,
    maxAdsPerDay: row.max_ads_per_day ?? 20,
    adPlacements: {
      homeBanner: true,
      contentCard: true,
      contentDetails: true,
      unlockAction: true,
      betweenNav: true,
      popunder: true,
      premiumRewardArea: true,
    },
  };
}

/**
 * Returns the Supabase client or handles production vs demo gating
 */
function getActiveClient() {
  const client = getSupabaseAdminClient();
  if (client) return client;

  if (isProduction()) {
    const validation = validateProductionConfig();
    const missingVars = validation.missing.length > 0
      ? validation.missing.join(', ')
      : 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SERVICE_ROLE_KEY';
    throw new Error(
      `[Production Safety Gate] APP_MODE is set to 'production' but required configuration is missing or incomplete: ${missingVars}. Please configure these variables in your deployment environment.`
    );
  }

  return null;
}

// ============================================================================
// 1. VIDEOS CRUD (Supabase: videos)
// ============================================================================

export async function fetchVideos(filter?: {
  category?: string;
  featured?: boolean;
  search?: string;
}): Promise<IVideo[]> {
  const client = getActiveClient();
  if (client) {
    let query = client.from('videos').select('*');

    if (filter?.category && filter.category !== 'All') {
      query = query.ilike('category', filter.category);
    }
    if (typeof filter?.featured === 'boolean') {
      query = query.eq('is_featured', filter.featured);
    }
    if (filter?.search?.trim()) {
      const term = `%${filter.search.trim()}%`;
      query = query.or(`title.ilike.${term},description.ilike.${term}`);
    }

    const { data, error } = await query
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase fetchVideos error]:', error.message);
      if (isProduction()) throw error;
      return demoStore.videos;
    }

    return (data || []).map(mapVideoFromDb);
  }

  // Demo fallback
  let result = [...demoStore.videos];
  if (filter?.category && filter.category !== 'All') {
    result = result.filter(
      (v) => v.category.toLowerCase() === filter.category!.toLowerCase()
    );
  }
  if (typeof filter?.featured === 'boolean') {
    result = result.filter((v) => v.isFeatured === filter.featured);
  }
  if (filter?.search?.trim()) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }
  return result;
}

export async function fetchVideoById(id: string): Promise<IVideo | null> {
  const client = getActiveClient();
  if (client) {
    const { data, error } = await client
      .from('videos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[Supabase fetchVideoById error]:', error.message);
      if (isProduction()) throw error;
      return demoStore.videos.find((v) => v._id === id) || null;
    }

    return data ? mapVideoFromDb(data) : null;
  }

  return demoStore.videos.find((v) => v._id === id) || null;
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
  isFeatured?: boolean;
  fileSize?: string;
  quality?: string;
  tags?: string[] | string;
}): Promise<IVideo> {
  const tagsArray = Array.isArray(data.tags)
    ? data.tags
    : typeof data.tags === 'string'
    ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const client = getActiveClient();
  if (client) {
    const payload = {
      title: data.title,
      description: data.description || '',
      poster_url: data.posterUrl,
      banner_url: data.bannerUrl || data.posterUrl,
      category: data.category || 'Trending',
      stream_url: data.streamUrl,
      target_link: data.streamUrl,
      direct_ad_link: data.directAdLink || '',
      required_ads_count: data.requiredAdsCount ?? 2,
      is_featured: Boolean(data.isFeatured),
      file_size: data.fileSize || '1.4 GB',
      quality: data.quality || '1080p HD',
      tags: tagsArray,
      views_count: 0,
    };

    const { data: created, error } = await client
      .from('videos')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[Supabase createNewVideo error]:', error.message);
      throw error;
    }

    return mapVideoFromDb(created);
  }

  // Demo fallback
  const newVid: IVideo = {
    _id: `demo-vid-${Date.now()}`,
    title: data.title,
    description: data.description || '',
    posterUrl: data.posterUrl,
    bannerGifUrl: data.bannerUrl || data.posterUrl,
    bannerUrl: data.bannerUrl || data.posterUrl,
    category: data.category,
    streamUrl: data.streamUrl,
    serverUrl: data.streamUrl,
    hdSourceUrl: data.streamUrl,
    targetLink: data.streamUrl,
    targetType: 'direct_stream',
    directAdLink: data.directAdLink || '',
    requiredAdsCount: data.requiredAdsCount ?? 2,
    viewsCount: 0,
    isFeatured: Boolean(data.isFeatured),
    fileSize: data.fileSize || '1.4 GB',
    quality: data.quality || '1080p HD',
    tags: tagsArray,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  demoStore.videos.unshift(newVid);
  return newVid;
}

export async function modifyVideo(
  id: string,
  updates: Partial<IVideo>
): Promise<IVideo | null> {
  const client = getActiveClient();
  if (client) {
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.posterUrl !== undefined) dbUpdates.poster_url = updates.posterUrl;
    if (updates.bannerUrl !== undefined) dbUpdates.banner_url = updates.bannerUrl;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.streamUrl !== undefined) {
      dbUpdates.stream_url = updates.streamUrl;
      dbUpdates.target_link = updates.streamUrl;
    }
    if (updates.directAdLink !== undefined) dbUpdates.direct_ad_link = updates.directAdLink;
    if (updates.requiredAdsCount !== undefined) dbUpdates.required_ads_count = updates.requiredAdsCount;
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
    if (updates.fileSize !== undefined) dbUpdates.file_size = updates.fileSize;
    if (updates.quality !== undefined) dbUpdates.quality = updates.quality;
    if (updates.tags !== undefined) {
      dbUpdates.tags = Array.isArray(updates.tags)
        ? updates.tags
        : typeof updates.tags === 'string'
        ? (updates.tags as string).split(',').map((t) => t.trim())
        : [];
    }

    const { data, error } = await client
      .from('videos')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Supabase modifyVideo error]:', error.message);
      throw error;
    }

    return data ? mapVideoFromDb(data) : null;
  }

  // Demo fallback
  const idx = demoStore.videos.findIndex((v) => v._id === id);
  if (idx === -1) return null;
  const updated = {
    ...demoStore.videos[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  demoStore.videos[idx] = updated;
  return updated;
}

export async function removeVideo(id: string): Promise<boolean> {
  const client = getActiveClient();
  if (client) {
    const { error } = await client.from('videos').delete().eq('id', id);
    if (error) {
      console.error('[Supabase removeVideo error]:', error.message);
      throw error;
    }
    return true;
  }

  const initialLen = demoStore.videos.length;
  demoStore.videos = demoStore.videos.filter((v) => v._id !== id);
  return demoStore.videos.length < initialLen;
}

// ============================================================================
// 2. SETTINGS (Supabase: settings)
// ============================================================================

export async function fetchSettings(): Promise<ISettings> {
  const client = getActiveClient();
  if (client) {
    const { data, error } = await client
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('[Supabase fetchSettings error]:', error.message);
      if (isProduction()) throw error;
      return demoStore.settings;
    }

    if (!data) {
      // Seed default row if empty
      const defaultSettings = mapSettingsFromDb(null);
      await client.from('settings').insert({
        id: 1,
        app_name: defaultSettings.appName,
      });
      return defaultSettings;
    }

    return mapSettingsFromDb(data);
  }

  return demoStore.settings;
}

export async function modifySettings(updates: Partial<ISettings>): Promise<ISettings> {
  const client = getActiveClient();
  if (client) {
    const dbPayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.appName !== undefined) dbPayload.app_name = updates.appName;
    if (updates.maintenanceMode !== undefined) dbPayload.maintenance_mode = updates.maintenanceMode;
    if (updates.announcementBannerText !== undefined) dbPayload.announcement_banner = updates.announcementBannerText;
    if (updates.globalAdLink !== undefined) dbPayload.global_ad_url = updates.globalAdLink;
    if (updates.primaryDirectLink !== undefined) dbPayload.primary_ad_url = updates.primaryDirectLink;
    if (updates.secondaryDirectLink !== undefined) dbPayload.secondary_ad_url = updates.secondaryDirectLink;
    if (updates.defaultAdsRequired !== undefined) dbPayload.required_ads = updates.defaultAdsRequired;
    if (updates.telegramChannelUrl !== undefined) dbPayload.telegram_channel_url = updates.telegramChannelUrl;
    if (updates.forceJoinChannel !== undefined) dbPayload.force_join_channel = updates.forceJoinChannel;
    if (updates.premiumRewardEnabled !== undefined) dbPayload.premium_reward_enabled = updates.premiumRewardEnabled;
    if (updates.premiumRequiredAds !== undefined) dbPayload.premium_required_ads = updates.premiumRequiredAds;
    if (updates.premiumRequiredReferrals !== undefined) dbPayload.premium_required_referrals = updates.premiumRequiredReferrals;
    if (updates.premiumDurationHours !== undefined) dbPayload.premium_duration_hours = updates.premiumDurationHours;
    if (updates.maxAdsPerSession !== undefined) dbPayload.max_ads_per_session = updates.maxAdsPerSession;
    if (updates.maxPopundersPerSession !== undefined) dbPayload.max_popunders_per_session = updates.maxPopundersPerSession;
    if (updates.adCooldownSeconds !== undefined) dbPayload.ad_cooldown_seconds = updates.adCooldownSeconds;
    if (updates.maxAdsPerDay !== undefined) dbPayload.max_ads_per_day = updates.maxAdsPerDay;

    const { data, error } = await client
      .from('settings')
      .upsert({ id: 1, ...dbPayload })
      .select()
      .single();

    if (error) {
      console.error('[Supabase modifySettings error]:', error.message);
      throw error;
    }

    return mapSettingsFromDb(data);
  }

  demoStore.settings = {
    ...demoStore.settings,
    ...updates,
  };
  return demoStore.settings;
}

// ============================================================================
// 3. ANALYTICS & HEARTBEAT (Supabase: analytics_events & users)
// ============================================================================

export async function recordVisitorHeartbeat({
  userId,
  ip = '127.0.0.1',
  userAgent = 'TelegramMiniApp',
}: {
  userId?: string | number | null;
  ip?: string;
  userAgent?: string;
}): Promise<{ activeUsers: number; timestamp: string }> {
  const cleanUserId = userId ? String(userId) : 'guest';
  const now = new Date();

  const client = getActiveClient();
  if (client) {
    // 1. Insert heartbeat ping into analytics_events
    await client.from('analytics_events').insert({
      event: 'app_open',
      user_id: cleanUserId,
      source: 'ping_heartbeat',
      placement: 'navbar_heartbeat',
      created_at: now.toISOString(),
      metadata: { ip, userAgent },
    });

    // 2. Count distinct active users in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data } = await client
      .from('analytics_events')
      .select('user_id')
      .gte('created_at', fiveMinutesAgo)
      .limit(100);

    const distinct = new Set((data || []).map((d: any) => d.user_id));
    return {
      activeUsers: Math.max(1, distinct.size),
      timestamp: now.toISOString(),
    };
  }

  // Demo fallback
  return { activeUsers: 42, timestamp: now.toISOString() };
}

export async function incrementVideoViewCount(videoId: string): Promise<number> {
  const client = getActiveClient();
  if (client) {
    // Increment in Supabase
    const { data: vid } = await client
      .from('videos')
      .select('views_count')
      .eq('id', videoId)
      .maybeSingle();

    const newCount = (Number(vid?.views_count) || 0) + 1;
    await client.from('videos').update({ views_count: newCount }).eq('id', videoId);

    // Track analytics event
    await client.from('analytics_events').insert({
      event: 'content_view',
      user_id: 'viewer',
      content_id: videoId,
      created_at: new Date().toISOString(),
    });

    return newCount;
  }

  const v = demoStore.videos.find((item) => item._id === videoId);
  if (v) {
    v.viewsCount += 1;
    return v.viewsCount;
  }
  return 1;
}

export async function recordAdClickEvent(userId?: string | null): Promise<number> {
  const cleanId = userId ? String(userId) : 'guest';
  const client = getActiveClient();
  if (client) {
    await client.from('analytics_events').insert({
      event: 'ad_click',
      user_id: cleanId,
      placement: 'unlock_modal',
      created_at: new Date().toISOString(),
    });
    return 1;
  }
  return 1;
}

export function getLiveUsersCount(): number {
  return 42;
}

export async function recordAnalyticsEvent(eventData: IAnalyticsEvent): Promise<void> {
  const client = getActiveClient();
  if (client) {
    await client.from('analytics_events').insert({
      event: eventData.event,
      user_id: eventData.userId ? String(eventData.userId) : 'guest',
      content_id: eventData.contentId || null,
      referral_code: eventData.referralCode || null,
      campaign: eventData.campaign || null,
      source: eventData.source || null,
      placement: eventData.placement || null,
      metadata: eventData.metadata || {},
      created_at: eventData.timestamp || new Date().toISOString(),
    });
    return;
  }

  demoStore.events.unshift({
    event: eventData.event,
    userId: eventData.userId ? String(eventData.userId) : 'guest',
    contentId: eventData.contentId,
    timestamp: eventData.timestamp || new Date().toISOString(),
  });
}

// ============================================================================
// 4. ADMIN DASHBOARD & AUDIT LOGS (Supabase: audit_logs & aggregations)
// ============================================================================

export async function logAdminAction({
  admin,
  action,
  target,
  metadata = {},
  ip = '127.0.0.1',
  userAgent = 'AdminBrowser',
}: {
  admin: string;
  action: string;
  target?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  const client = getActiveClient();
  if (client) {
    await client.from('audit_logs').insert({
      admin,
      action,
      target: target || null,
      metadata,
      ip,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    });
    return;
  }

  demoStore.adminAuditLogs.unshift({
    _id: `audit-${Date.now()}`,
    admin,
    action,
    target,
    metadata,
    ip,
    userAgent,
    createdAt: new Date().toISOString(),
  });
}

export async function fetchAuditLogs(limit = 50): Promise<any[]> {
  const client = getActiveClient();
  if (client) {
    const { data } = await client
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data || []).map((log: any) => ({
      _id: log.id,
      admin: log.admin,
      action: log.action,
      target: log.target,
      metadata: log.metadata,
      ip: log.ip,
      userAgent: log.user_agent,
      createdAt: log.created_at,
    }));
  }

  return demoStore.adminAuditLogs.slice(0, limit);
}

export async function fetchAdminStats(): Promise<{
  liveActiveUsers: number;
  totalUniqueVisitors: number | string;
  totalViews: number | string;
  adsRevenueClicks: number | string;
  totalVideos: number;
  featuredVideos: number;
  activeWindowMinutes: number;
  recentLogs: any[];
  generatedAt: string;
  mode: 'production' | 'demo';
}> {
  const client = getActiveClient();
  if (client) {
    const [
      { count: videosCount },
      { count: featuredCount },
      { count: totalAdClicks },
      { count: totalViewsCount },
      { data: recentAudit },
    ] = await Promise.all([
      client.from('videos').select('*', { count: 'exact', head: true }),
      client.from('videos').select('*', { count: 'exact', head: true }).eq('is_featured', true),
      client.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event', 'ad_click'),
      client.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event', 'content_view'),
      client.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    // Distinct visitors count
    const { count: usersCount } = await client
      .from('users')
      .select('*', { count: 'exact', head: true });

    return {
      liveActiveUsers: 1,
      totalUniqueVisitors: usersCount || 1,
      totalViews: totalViewsCount || 0,
      adsRevenueClicks: totalAdClicks || 0,
      totalVideos: videosCount || 0,
      featuredVideos: featuredCount || 0,
      activeWindowMinutes: 5,
      recentLogs: recentAudit || [],
      generatedAt: new Date().toISOString(),
      mode: 'production',
    };
  }

  // Demo stats
  return {
    liveActiveUsers: 48,
    totalUniqueVisitors: 12480,
    totalViews: 98450,
    adsRevenueClicks: 3412,
    totalVideos: demoStore.videos.length,
    featuredVideos: demoStore.videos.filter((v) => v.isFeatured).length,
    activeWindowMinutes: 5,
    recentLogs: demoStore.auditLogs.slice(0, 5),
    generatedAt: new Date().toISOString(),
    mode: 'demo',
  };
}

// ============================================================================
// 5. REFERRAL & TELEGRAM USER SYSTEM (Supabase: users & referrals)
// ============================================================================

export function generateReferralCode(telegramUserId: string): string {
  const cleanId = String(telegramUserId).replace(/\D/g, '');
  const suffix = cleanId.slice(-4) || '777';
  const prefix = 'VLH';
  return `${prefix}${suffix}`;
}

export function normalizeUserProfile(doc: any): IUserProfile {
  const isPremActive = Boolean(
    doc.premium_until && new Date(doc.premium_until).getTime() > Date.now()
  );

  return {
    telegramUserId: String(doc.telegram_user_id || doc.telegramUserId),
    username: doc.username || '',
    firstName: doc.first_name || doc.firstName || '',
    lastName: doc.last_name || doc.lastName || '',
    isTelegramPremium: Boolean(doc.is_premium || doc.isTelegramPremium),
    referralCode: doc.referral_code || doc.referralCode || 'VIP',
    referredBy: doc.referred_by || doc.referredBy || null,
    referralCount: typeof doc.referral_count === 'number' ? doc.referral_count : doc.referralCount || 0,
    qualifiedReferralCount:
      typeof doc.qualified_referral_count === 'number'
        ? doc.qualified_referral_count
        : doc.qualifiedReferralCount || 0,
    adActionsCompleted:
      typeof doc.ad_actions_completed === 'number'
        ? doc.ad_actions_completed
        : doc.adActionsCompleted || 0,
    premiumUntil: doc.premium_until || doc.premiumUntil || null,
    isPremiumActive: isPremActive,
    premiumClaimedCount: doc.premium_claimed_count || doc.premiumClaimedCount || 0,
    firstSeenAt: doc.first_seen_at || doc.firstSeenAt || new Date().toISOString(),
    lastSeenAt: doc.last_seen_at || doc.lastSeenAt || new Date().toISOString(),
  };
}

export async function syncTelegramUser({
  tgUser,
  startParam,
  ip = '127.0.0.1',
  userAgent = 'TelegramMiniApp',
}: {
  tgUser: {
    id: number | string;
    first_name?: string;
    last_name?: string;
    username?: string;
    is_premium?: boolean;
  };
  startParam?: string | null;
  ip?: string;
  userAgent?: string;
}): Promise<IUserProfile> {
  const userId = String(tgUser.id);
  const now = new Date().toISOString();

  // Extract referral code if startParam formatted like ref_VLH1234
  let incomingRefCode: string | null = null;
  if (startParam) {
    const match = startParam.match(/ref_([A-Za-z0-9_]+)/i);
    if (match) incomingRefCode = match[1].toUpperCase();
    else if (/^[A-Za-z0-9_]{3,12}$/.test(startParam)) {
      incomingRefCode = startParam.toUpperCase();
    }
  }

  const client = getActiveClient();
  if (client) {
    // 1. Check existing user
    const { data: existingUser } = await client
      .from('users')
      .select('*')
      .eq('telegram_user_id', userId)
      .maybeSingle();

    if (existingUser) {
      // Update last active
      await client
        .from('users')
        .update({
          last_seen_at: now,
          username: tgUser.username || existingUser.username,
          first_name: tgUser.first_name || existingUser.first_name,
          last_name: tgUser.last_name || existingUser.last_name,
        })
        .eq('telegram_user_id', userId);

      // Fetch referral counts
      const [{ count: refCount }, { count: qualCount }] = await Promise.all([
        client.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId),
        client.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId).eq('status', 'qualified'),
      ]);

      return normalizeUserProfile({
        ...existingUser,
        referral_count: refCount || 0,
        qualified_referral_count: qualCount || 0,
      });
    }

    // 2. New user registration
    let referrerUserId: string | null = null;
    let validReferredByCode: string | null = null;

    if (incomingRefCode) {
      // Find referrer user, strictly preventing self-referral
      const { data: referrerDoc } = await client
        .from('users')
        .select('telegram_user_id, referral_code')
        .eq('referral_code', incomingRefCode)
        .neq('telegram_user_id', userId)
        .maybeSingle();

      if (referrerDoc) {
        referrerUserId = referrerDoc.telegram_user_id;
        validReferredByCode = referrerDoc.referral_code;

        // Record pending referral
        await client.from('referrals').insert({
          referrer_id: referrerUserId,
          referred_user_id: userId,
          referral_code: validReferredByCode,
          status: 'pending',
          created_at: now,
        });

        // Track referral open
        await client.from('analytics_events').insert({
          event: 'referral_open',
          user_id: userId,
          referral_code: validReferredByCode,
          campaign: startParam || 'direct',
          created_at: now,
        });
      }
    }

    const genCode = generateReferralCode(userId);
    const { data: newUser, error } = await client
      .from('users')
      .insert({
        telegram_user_id: userId,
        username: tgUser.username || '',
        first_name: tgUser.first_name || '',
        last_name: tgUser.last_name || '',
        is_premium: Boolean(tgUser.is_premium),
        referral_code: genCode,
        referred_by: validReferredByCode,
        ad_actions_completed: 0,
        premium_until: null,
        first_seen_at: now,
        last_seen_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('[Supabase syncTelegramUser error]:', error.message);
      throw error;
    }

    // Log app_open
    await client.from('analytics_events').insert({
      event: 'app_open',
      user_id: userId,
      referral_code: validReferredByCode,
      campaign: startParam || 'direct',
      source: 'telegram_miniapp',
      created_at: now,
    });

    return normalizeUserProfile(newUser);
  }

  // Demo fallback
  let demoUser = demoStore.users.get(userId);
  if (!demoUser) {
    let referredByCode: string | null = null;
    let referrerUserId: string | null = null;

    if (incomingRefCode) {
      for (const [, existing] of demoStore.users.entries()) {
        if (
          existing.referralCode?.toUpperCase() === incomingRefCode &&
          existing.telegramUserId !== userId
        ) {
          referredByCode = existing.referralCode;
          referrerUserId = existing.telegramUserId;
          existing.referralCount = (existing.referralCount || 0) + 1;
          break;
        }
      }
    }

    demoUser = {
      telegramUserId: userId,
      username: tgUser.username || '',
      firstName: tgUser.first_name || '',
      lastName: tgUser.last_name || '',
      isTelegramPremium: Boolean(tgUser.is_premium),
      referralCode: generateReferralCode(userId),
      referredBy: referredByCode,
      referralCount: 0,
      qualifiedReferralCount: 0,
      adActionsCompleted: 0,
      premiumUntil: null,
      premiumClaimedCount: 0,
      firstSeenAt: now,
      lastSeenAt: now,
      isPremiumActive: false,
    };
    demoStore.users.set(userId, demoUser);
  }

  return normalizeUserProfile(demoUser);
}

export async function getUserProfile(userId: string): Promise<IUserProfile | null> {
  const client = getActiveClient();
  if (client) {
    const { data: user } = await client
      .from('users')
      .select('*')
      .eq('telegram_user_id', userId)
      .maybeSingle();

    if (!user) return null;

    const [{ count: refCount }, { count: qualCount }] = await Promise.all([
      client.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId),
      client.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId).eq('status', 'qualified'),
    ]);

    return normalizeUserProfile({
      ...user,
      referral_count: refCount || 0,
      qualified_referral_count: qualCount || 0,
    });
  }

  const demoUser = demoStore.users.get(userId);
  return demoUser ? normalizeUserProfile(demoUser) : null;
}

// Qualify referral after a real server-side engagement event (e.g. content view or ad completion)
export async function qualifyReferralIfEligible({
  userId,
  action,
  contentId,
}: {
  userId: string;
  action: 'view_content' | 'ad_completion' | 'unlock_content';
  contentId?: string;
}): Promise<boolean> {
  const client = getActiveClient();
  if (client) {
    // Check pending referral for this user
    const { data: referral } = await client
      .from('referrals')
      .select('*')
      .eq('referred_user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (!referral) return false;

    // Update status to qualified
    await client
      .from('referrals')
      .update({
        status: 'qualified',
        qualified_at: new Date().toISOString(),
      })
      .eq('id', referral.id);

    // Record qualified_referral event
    await client.from('analytics_events').insert({
      event: 'qualified_referral',
      user_id: userId,
      referral_code: referral.referral_code,
      content_id: contentId || null,
      metadata: { referrerId: referral.referrer_id, triggerAction: action },
      created_at: new Date().toISOString(),
    });

    return true;
  }

  // Demo fallback
  return true;
}

export async function checkAdFrequencyAllowed({
  userId,
  ip,
  placement,
}: {
  userId?: string | number | null;
  ip?: string;
  placement: string;
}): Promise<{
  allowed: boolean;
  reason?: string;
  cooldownRemaining?: number;
  cooldownRemainingSeconds?: number;
}> {
  return { allowed: true, cooldownRemainingSeconds: 0 };
}

export async function recordAdCompletionAction({
  userId,
  placement = 'unlock_action',
  contentId,
  ip,
  userAgent,
}: {
  userId: string;
  placement?: string;
  contentId?: string;
  ip?: string;
  userAgent?: string;
}): Promise<{
  adActionsCompleted: number;
  qualifiedReferralCount: number;
  isEligibleForPremium: boolean;
}> {
  const now = new Date().toISOString();
  const client = getActiveClient();
  if (client) {
    // 1. Log ad_completion event
    await client.from('analytics_events').insert({
      event: 'ad_completion',
      user_id: userId,
      content_id: contentId || null,
      placement,
      created_at: now,
    });

    // 2. Increment ad_actions_completed in users table
    const { data: user } = await client
      .from('users')
      .select('ad_actions_completed')
      .eq('telegram_user_id', userId)
      .maybeSingle();

    const currentAds = (user?.ad_actions_completed || 0) + 1;
    await client
      .from('users')
      .update({ ad_actions_completed: currentAds })
      .eq('telegram_user_id', userId);

    // 3. Trigger referral qualification if user was referred
    await qualifyReferralIfEligible({
      userId,
      action: 'ad_completion',
      contentId,
    });

    // 4. Check requirements
    const settings = await fetchSettings();
    const reqAds = settings.premiumRequiredAds || 3;
    const reqRefs = settings.premiumRequiredReferrals || 3;

    const { count: qualCount } = await client
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'qualified');

    const qualifiedCount = qualCount || 0;

    return {
      adActionsCompleted: currentAds,
      qualifiedReferralCount: qualifiedCount,
      isEligibleForPremium: currentAds >= reqAds && qualifiedCount >= reqRefs,
    };
  }

  // Demo fallback
  let demoUser = demoStore.users.get(userId);
  if (demoUser) {
    demoUser.adActionsCompleted = (demoUser.adActionsCompleted || 0) + 1;
    return {
      adActionsCompleted: demoUser.adActionsCompleted,
      qualifiedReferralCount: demoUser.qualifiedReferralCount || 0,
      isEligibleForPremium: demoUser.adActionsCompleted >= 3 && (demoUser.qualifiedReferralCount || 0) >= 3,
    };
  }
  return { adActionsCompleted: 1, qualifiedReferralCount: 0, isEligibleForPremium: false };
}

// ============================================================================
// 6. PREMIUM REWARD (Supabase: premium_rewards)
// ============================================================================

export async function claimPremiumReward({
  userId,
  ip = '127.0.0.1',
  userAgent = 'TelegramMiniApp',
}: {
  userId: string;
  ip?: string;
  userAgent?: string;
}): Promise<{
  success: boolean;
  message: string;
  premiumUntil?: string;
  profile?: IUserProfile;
}> {
  const settings = await fetchSettings();
  if (!settings.premiumRewardEnabled) {
    return { success: false, message: 'Premium Reward System is currently paused.' };
  }

  const reqAds = settings.premiumRequiredAds || 3;
  const reqRefs = settings.premiumRequiredReferrals || 3;
  const durationHours = settings.premiumDurationHours || 24;
  const now = Date.now();
  const newExpiry = new Date(now + durationHours * 3600000).toISOString();

  const client = getActiveClient();
  if (client) {
    const { data: user } = await client
      .from('users')
      .select('*')
      .eq('telegram_user_id', userId)
      .maybeSingle();

    if (!user) {
      return { success: false, message: 'User profile not found.' };
    }

    // Check if user already has active VIP
    if (user.premium_until && new Date(user.premium_until).getTime() > now) {
      return {
        success: false,
        message: 'You already have an active VIP Premium subscription.',
        premiumUntil: user.premium_until,
        profile: normalizeUserProfile(user),
      };
    }

    const { count: qualCount } = await client
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'qualified');

    const qualifiedRefs = qualCount || 0;
    const adsCompleted = user.ad_actions_completed || 0;

    if (adsCompleted < reqAds) {
      return {
        success: false,
        message: `Requirement not met: Watch ${reqAds - adsCompleted} more ad(s).`,
      };
    }

    if (qualifiedRefs < reqRefs) {
      return {
        success: false,
        message: `Requirement not met: Refer ${reqRefs - qualifiedRefs} more qualified friend(s).`,
      };
    }

    // Atomic updates: set premium_until, reset ad_actions_completed
    const { data: updatedUser, error } = await client
      .from('users')
      .update({
        premium_until: newExpiry,
        ad_actions_completed: 0,
      })
      .eq('telegram_user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Supabase claimPremiumReward error]:', error.message);
      throw error;
    }

    // Insert into premium_rewards
    await client.from('premium_rewards').insert({
      user_id: userId,
      duration_hours: durationHours,
      claimed_at: new Date().toISOString(),
      expires_at: newExpiry,
      status: 'active',
    });

    // Insert analytics event
    await client.from('analytics_events').insert({
      event: 'premium_reward',
      user_id: userId,
      metadata: { durationHours, expiresAt: newExpiry, ip, userAgent },
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      message: `🎉 Premium Access Unlocked for ${durationHours} hours!`,
      premiumUntil: newExpiry,
      profile: normalizeUserProfile(updatedUser),
    };
  }

  // Demo fallback
  let demoUser = demoStore.users.get(userId);
  if (!demoUser) return { success: false, message: 'Demo user not found.' };

  demoUser.premiumUntil = newExpiry;
  demoUser.adActionsCompleted = 0;
  demoUser.isPremiumActive = true;

  return {
    success: true,
    message: `🎉 Premium Access Unlocked for ${durationHours} hours!`,
    premiumUntil: newExpiry,
    profile: normalizeUserProfile(demoUser),
  };
}

export async function getReferralLeaderboard(limit = 10): Promise<IReferralLeaderboardEntry[]> {
  const client = getActiveClient();
  if (client) {
    const { data: referrals } = await client
      .from('referrals')
      .select('referrer_id, status')
      .eq('status', 'qualified');

    const counts: Record<string, number> = {};
    (referrals || []).forEach((r: any) => {
      counts[r.referrer_id] = (counts[r.referrer_id] || 0) + 1;
    });

    const sortedIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, limit);

    return sortedIds.map((id, index) => ({
      rank: index + 1,
      displayName: `User #${id.slice(-4)}`,
      referralCode: `VLH${id.slice(-4)}`,
      qualifiedReferrals: counts[id],
      totalReferrals: counts[id],
    }));
  }

  // Demo leaderboard
  return [
    { rank: 1, displayName: 'Alex Vance', referralCode: 'VLH9041', qualifiedReferrals: 18, totalReferrals: 24 },
    { rank: 2, displayName: 'Sarah Connor', referralCode: 'VLH8102', qualifiedReferrals: 14, totalReferrals: 19 },
    { rank: 3, displayName: 'Elena Rostova', referralCode: 'VLH7021', qualifiedReferrals: 11, totalReferrals: 15 },
    { rank: 4, displayName: 'Marcus Brody', referralCode: 'VLH5510', qualifiedReferrals: 8, totalReferrals: 12 },
    { rank: 5, displayName: 'David Kim', referralCode: 'VLH4011', qualifiedReferrals: 6, totalReferrals: 9 },
  ];
}

export async function getGrowthAnalytics(
  period: 'today' | '7d' | '30d' | 'all' = '7d'
): Promise<IGrowthAnalytics> {
  const client = getActiveClient();
  if (client) {
    let since = new Date(Date.now() - 7 * 86400000).toISOString();
    if (period === 'today') since = new Date(Date.now() - 86400000).toISOString();
    else if (period === '30d') since = new Date(Date.now() - 30 * 86400000).toISOString();
    else if (period === 'all') since = new Date(0).toISOString();

    const { data: events } = await client
      .from('analytics_events')
      .select('event, placement, content_id')
      .gte('created_at', since);

    const eventCounts: Record<string, number> = {};
    (events || []).forEach((e: any) => {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    });

    const impressions = eventCounts['ad_impression'] || 0;
    const clicks = eventCounts['ad_click'] || 0;
    const completions = eventCounts['ad_completion'] || 0;
    const unlocks = eventCounts['content_unlock'] || 0;
    const views = eventCounts['content_view'] || 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const unlockRate = views > 0 ? (unlocks / views) * 100 : 0;

    return {
      period,
      mode: 'production',
      totalUsers: 1,
      newUsers: 1,
      returningUsers: 0,
      dailyActiveUsers: 1,
      botStarts: eventCounts['bot_start'] || 0,
      miniAppOpens: eventCounts['app_open'] || 0,
      channelClicks: eventCounts['channel_click'] || 0,
      channelVerifications: 0,
      sharesCount: eventCounts['share_click'] || 0,
      referralOpens: eventCounts['referral_open'] || 0,
      qualifiedReferrals: eventCounts['qualified_referral'] || 0,
      premiumRewardsClaimed: eventCounts['premium_reward'] || 0,
      activePremiumUsers: 0,
      adImpressions: impressions,
      adClicks: clicks,
      adCompletions: completions,
      contentUnlocks: unlocks,
      ctr: Number(ctr.toFixed(2)),
      unlockRate: Number(unlockRate.toFixed(2)),
      topPlacement: 'Unlock Action Modal',
      topContent: [],
      topSharedContent: [],
      topReferralSources: [],
      topCampaigns: [],
      leaderboard: await getReferralLeaderboard(5),
    };
  }

  // Demo analytics
  return {
    period,
    mode: 'demo',
    totalUsers: 12480,
    newUsers: 840,
    returningUsers: 11640,
    dailyActiveUsers: 3420,
    botStarts: 4210,
    miniAppOpens: 14200,
    channelClicks: 1280,
    channelVerifications: 1150,
    sharesCount: 2150,
    referralOpens: 1890,
    qualifiedReferrals: 142,
    premiumRewardsClaimed: 89,
    activePremiumUsers: 64,
    adImpressions: 26800,
    adClicks: 3412,
    adCompletions: 3120,
    contentUnlocks: 4890,
    ctr: 12.73,
    unlockRate: 18.25,
    topPlacement: 'Unlock Action Modal',
    topContent: [
      { contentId: '1', title: 'Neon Protocol: Cyber Shadow', views: 14820, unlocks: 1420 },
      { contentId: '2', title: 'Shadow Heist: Dark Protocol', views: 29400, unlocks: 2100 },
      { contentId: '3', title: 'Celestial Blade: Sovereign Chronicle', views: 42100, unlocks: 3890 },
    ],
    topSharedContent: [
      { contentId: '1', title: 'Neon Protocol: Cyber Shadow', shares: 340 },
      { contentId: '2', title: 'Shadow Heist: Dark Protocol', shares: 520 },
    ],
    topReferralSources: [
      { source: 'Telegram Chat / DM', count: 1280 },
      { source: 'Telegram Groups', count: 540 },
      { source: 'Direct Links', count: 330 },
    ],
    topCampaigns: [
      { campaign: 'viral_spring_2026', count: 940 },
      { campaign: 'telegram_bot_start', count: 680 },
    ],
    leaderboard: await getReferralLeaderboard(5),
  };
}
