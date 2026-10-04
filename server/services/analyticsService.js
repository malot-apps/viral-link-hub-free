/**
 * Real-Time & Aggregate Visitor Analytics Service
 * Tracks 5-minute sliding window active users, unique Telegram user IDs, and total views
 */
const Analytics = require('../models/Analytics');

class AnalyticsService {
  constructor() {
    // In-memory sliding window map: userId -> lastSeenTimestamp (in ms)
    this.activeSessions = new Map();
    // Cache for quick lookups
    this.uniqueVisitorsSet = new Set();
    this.totalViewsCounter = 0;
    this.adClicksCounter = 0;
    this.recentAuditLogs = [];
    this.isInitialized = false;

    // 5-minute sliding window in milliseconds (300,000 ms)
    this.ACTIVE_WINDOW_MS = 5 * 60 * 1000;

    // Periodic cleanup of stale sessions every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.purgeStaleSessions();
    }, 30 * 1000);
  }

  /**
   * Initializes counters from MongoDB
   */
  async initFromDB() {
    try {
      const record = await Analytics.findOne({ key: 'global_metrics' });
      if (record) {
        this.totalViewsCounter = record.totalViews || 0;
        this.adClicksCounter = record.adClicks || 0;
        if (record.uniqueUserIds && Array.isArray(record.uniqueUserIds)) {
          record.uniqueUserIds.forEach((id) => this.uniqueVisitorsSet.add(String(id)));
        }
        if (record.recentLogs && Array.isArray(record.recentLogs)) {
          this.recentAuditLogs = record.recentLogs.slice(0, 50);
        }
      } else {
        await Analytics.create({
          key: 'global_metrics',
          totalVisitors: 0,
          totalViews: 0,
          activeUsers: 0,
          adClicks: 0,
          uniqueUserIds: [],
        });
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn('[AnalyticsService] DB sync deferred or offline:', err.message);
    }
  }

  /**
   * Records a user request:
   * - Increments total page views
   * - Registers active session for the 5-min sliding window
   * - Tracks unique Telegram User ID
   * - Stores audit log
   */
  async recordRequest({ userId, ip, userAgent, path = '/' }) {
    const now = Date.now();

    // Increment pageviews
    this.totalViewsCounter += 1;

    // Track session (if userId exists, otherwise track by IP)
    const sessionKey = userId ? `tg_${userId}` : `ip_${ip}`;
    this.activeSessions.set(sessionKey, now);

    // Track unique visitor if valid Telegram User ID
    let isNewUniqueVisitor = false;
    if (userId) {
      const stringId = String(userId);
      if (!this.uniqueVisitorsSet.has(stringId)) {
        this.uniqueVisitorsSet.add(stringId);
        isNewUniqueVisitor = true;
      }
    }

    // Maintain recent audit log
    const logItem = {
      userId: userId ? String(userId) : 'guest',
      ip: ip || '127.0.0.1',
      userAgent: userAgent || 'Unknown',
      path,
      timestamp: new Date(),
    };
    this.recentAuditLogs.unshift(logItem);
    if (this.recentAuditLogs.length > 50) {
      this.recentAuditLogs.pop();
    }

    // Persist to MongoDB asynchronously (non-blocking)
    this.syncToDB(isNewUniqueVisitor ? String(userId) : null, logItem).catch((err) => {
      // non-fatal
    });

    return {
      activeUsers: this.getActiveCount(),
      totalVisitors: this.getUniqueCount(),
      totalViews: this.totalViewsCounter,
    };
  }

  /**
   * Records a ping / heartbeat from an active client
   */
  async recordPing({ userId, ip }) {
    const now = Date.now();
    const sessionKey = userId ? `tg_${userId}` : `ip_${ip}`;
    this.activeSessions.set(sessionKey, now);

    if (userId) {
      const stringId = String(userId);
      if (!this.uniqueVisitorsSet.has(stringId)) {
        this.uniqueVisitorsSet.add(stringId);
        this.syncToDB(stringId).catch(() => {});
      }
    }

    return {
      activeUsers: this.getActiveCount(),
      timestamp: now,
    };
  }

  /**
   * Records an ad verification click
   */
  async recordAdClick({ videoId, userId }) {
    this.adClicksCounter += 1;
    try {
      await Analytics.updateOne(
        { key: 'global_metrics' },
        { $inc: { adClicks: 1 } },
        { upsert: true }
      );
    } catch (err) {
      // non-fatal
    }
    return this.adClicksCounter;
  }

  /**
   * Returns current active users within the 5-minute sliding window
   */
  getActiveCount() {
    const cutoff = Date.now() - this.ACTIVE_WINDOW_MS;
    let active = 0;
    for (const [_, lastSeen] of this.activeSessions.entries()) {
      if (lastSeen >= cutoff) {
        active++;
      }
    }
    // Return at least 1 if active, or ensure accurate count
    return active;
  }

  /**
   * Returns total unique visitors
   */
  getUniqueCount() {
    return this.uniqueVisitorsSet.size;
  }

  /**
   * Purges entries older than 5 minutes from memory map
   */
  purgeStaleSessions() {
    const cutoff = Date.now() - this.ACTIVE_WINDOW_MS;
    for (const [key, lastSeen] of this.activeSessions.entries()) {
      if (lastSeen < cutoff) {
        this.activeSessions.delete(key);
      }
    }
  }

  /**
   * Synchronizes current metrics with MongoDB
   */
  async syncToDB(newUserId = null, newLogItem = null) {
    try {
      const updateOps = {
        $set: {
          totalViews: this.totalViewsCounter,
          totalVisitors: this.uniqueVisitorsSet.size,
          activeUsers: this.getActiveCount(),
          adClicks: this.adClicksCounter,
          lastUpdated: new Date(),
        },
      };

      if (newUserId) {
        updateOps.$addToSet = { uniqueUserIds: newUserId };
      }

      if (newLogItem) {
        updateOps.$push = {
          recentLogs: {
            $each: [newLogItem],
            $slice: -100, // keep latest 100 in DB
          },
        };
      }

      await Analytics.updateOne({ key: 'global_metrics' }, updateOps, { upsert: true });
    } catch (err) {
      // non-blocking
    }
  }

  /**
   * Returns live stats for admin endpoint
   */
  async getStats() {
    return {
      activeUsers: this.getActiveCount(),
      totalVisitors: this.getUniqueCount(),
      totalViews: this.totalViewsCounter,
      adClicks: this.adClicksCounter,
      recentLogs: this.recentAuditLogs.slice(0, 15),
      activeWindowMinutes: 5,
    };
  }
}

// Export singleton instance
const analyticsService = new AnalyticsService();
module.exports = analyticsService;
