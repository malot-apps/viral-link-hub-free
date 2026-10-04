import { dbStore } from './db-store';
import { IVisitorLog } from './types';

const ACTIVE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function recordRequestAnalytics({
  userId,
  ip,
  userAgent,
  path = '/',
}: {
  userId?: string | number | null;
  ip?: string | null;
  userAgent?: string | null;
  path?: string;
}) {
  const now = Date.now();

  // Increment total page views
  dbStore.totalViews += 1;

  // Track session for 5-minute sliding window
  const cleanUserId = userId ? String(userId) : null;
  const sessionKey = cleanUserId ? `tg_${cleanUserId}` : `ip_${ip || 'unknown'}`;
  dbStore.activeSessions.set(sessionKey, now);

  // Track unique Telegram User ID
  if (cleanUserId && cleanUserId !== 'guest') {
    dbStore.uniqueVisitors.add(cleanUserId);
  }

  // Record audit log
  const logItem: IVisitorLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: cleanUserId || 'guest',
    ip: ip || '127.0.0.1',
    userAgent: userAgent || 'Telegram-Mini-App',
    path,
    timestamp: new Date().toISOString(),
  };

  dbStore.auditLogs.unshift(logItem);
  if (dbStore.auditLogs.length > 50) {
    dbStore.auditLogs.pop();
  }

  return {
    activeUsers: getLiveActiveUsersCount(),
    totalVisitors: dbStore.uniqueVisitors.size,
    totalViews: dbStore.totalViews,
  };
}

export function recordPing({
  userId,
  ip,
}: {
  userId?: string | number | null;
  ip?: string | null;
}) {
  const now = Date.now();
  const cleanUserId = userId ? String(userId) : null;
  const sessionKey = cleanUserId ? `tg_${cleanUserId}` : `ip_${ip || 'unknown'}`;
  dbStore.activeSessions.set(sessionKey, now);

  if (cleanUserId && cleanUserId !== 'guest') {
    dbStore.uniqueVisitors.add(cleanUserId);
  }

  return {
    activeUsers: getLiveActiveUsersCount(),
    timestamp: now,
  };
}

export function recordAdClick(userId?: string | number | null) {
  dbStore.adClicks += 1;
  if (userId) {
    dbStore.uniqueVisitors.add(String(userId));
  }
  return dbStore.adClicks;
}

export function getLiveActiveUsersCount(): number {
  const cutoff = Date.now() - ACTIVE_WINDOW_MS;
  let active = 0;
  for (const [key, lastSeen] of dbStore.activeSessions.entries()) {
    if (lastSeen >= cutoff) {
      active++;
    } else {
      dbStore.activeSessions.delete(key);
    }
  }
  // Ensure at least 1 when active user is browsing
  return Math.max(1, active);
}

export function getAdminStats() {
  return {
    liveActiveUsers: getLiveActiveUsersCount(),
    totalUniqueVisitors: dbStore.uniqueVisitors.size,
    totalViews: dbStore.totalViews,
    adsRevenueClicks: dbStore.adClicks,
    totalVideos: dbStore.videos.length,
    featuredVideos: dbStore.videos.filter((v) => v.isFeatured).length,
    recentLogs: dbStore.auditLogs.slice(0, 15),
    activeWindowMinutes: 5,
    generatedAt: new Date().toISOString(),
  };
}
