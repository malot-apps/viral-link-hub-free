/**
 * Analytics Model Schema
 * Persists aggregated site visitors, page views, real-time counters, and ad clicks
 */
const mongoose = require('mongoose');

const visitorLogSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    ip: { type: String, default: 'unknown' },
    userAgent: { type: String, default: 'unknown' },
    path: { type: String, default: '/' },
    timestamp: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 }, // TTL: 7 days
  },
  { _id: false }
);

const analyticsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_metrics',
      unique: true,
    },
    totalVisitors: {
      type: Number,
      default: 0,
      description: 'Total unique Telegram User IDs that have accessed the app',
    },
    totalViews: {
      type: Number,
      default: 0,
      description: 'Total page and content views registered',
    },
    activeUsers: {
      type: Number,
      default: 0,
      description: 'Snapshot of active users within the last 5 minutes',
    },
    adClicks: {
      type: Number,
      default: 0,
      description: 'Total monetization CPM direct ad clicks verified',
    },
    uniqueUserIds: {
      type: [String],
      default: [],
      index: true,
    },
    recentLogs: {
      type: [visitorLogSchema],
      default: [],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
