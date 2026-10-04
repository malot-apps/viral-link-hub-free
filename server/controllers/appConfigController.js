/**
 * App Config Controller
 * Serves dynamic frontend configuration and maintenance mode status
 */
const Settings = require('../models/Settings');

exports.getAppConfig = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        appName: 'VIRAL LINK HUB',
        maintenanceMode: false,
        globalAdLink: 'https://example-sponsor.com/direct?ref=virallinkhub',
        defaultAdsRequired: 2,
        announcementBannerText: '🚀 High-Speed Terabox Links active! Complete sponsor task to unlock.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        appName: settings.appName || 'VIRAL LINK HUB',
        maintenanceMode: Boolean(settings.maintenanceMode),
        globalAdLink: settings.globalAdLink,
        defaultAdsRequired: settings.defaultAdsRequired,
        announcementBannerText: settings.announcementBannerText,
        telegramChannelUrl: settings.telegramChannelUrl,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[getAppConfig] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve application configuration',
    });
  }
};
