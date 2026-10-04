/**
 * Analytics Controller
 * Handles client heartbeats and ad click events
 */
const analyticsService = require('../services/analyticsService');

exports.ping = async (req, res) => {
  try {
    const userId = req.body.userId || req.telegramUser?.id;
    const ip = req.clientIp || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;

    const result = await analyticsService.recordPing({
      userId,
      ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Heartbeat acknowledged',
      activeUsers: result.activeUsers,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error('[Analytics ping] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Ping failed',
    });
  }
};

exports.trackAdClick = async (req, res) => {
  try {
    const { videoId, adNetwork } = req.body;
    const userId = req.telegramUser?.id || req.body.userId;

    const totalClicks = await analyticsService.recordAdClick({
      videoId,
      userId,
    });

    return res.status(200).json({
      success: true,
      adClicks: totalClicks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to record ad click',
    });
  }
};
