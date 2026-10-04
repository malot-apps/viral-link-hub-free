/**
 * App Settings Model Schema
 * Dynamic configuration for VIRAL LINK HUB
 */
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: 'VIRAL LINK HUB',
      required: true,
      trim: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    globalAdLink: {
      type: String,
      default: 'https://example-sponsor.com/direct?ref=virallinkhub',
      trim: true,
    },
    defaultAdsRequired: {
      type: Number,
      default: 2,
      min: 0,
      max: 10,
    },
    announcementBannerText: {
      type: String,
      default: '🚀 High-Speed Terabox Links active! Complete sponsor task to unlock.',
      trim: true,
    },
    telegramChannelUrl: {
      type: String,
      default: 'https://t.me/virallinkhub',
      trim: true,
    },
    isMaintenanceBypassAllowed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper to get or initialize default settings singleton
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      appName: 'VIRAL LINK HUB',
      maintenanceMode: false,
      globalAdLink: 'https://example-sponsor.com/direct?ref=virallinkhub',
      defaultAdsRequired: 2,
      announcementBannerText: '🚀 High-Speed Terabox Links active! Complete sponsor task to unlock.',
    });
  }
  return settings;
};

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
