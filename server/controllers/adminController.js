/**
 * Admin Controller
 * Provides authenticated administration stats, video CRUD, and runtime configuration
 */
const jwt = require('jsonwebtoken');
const Video = require('../models/Video');
const Settings = require('../models/Settings');
const analyticsService = require('../services/analyticsService');

const JWT_SECRET = process.env.JWT_SECRET || 'viral_link_hub_jwt_super_secret_key_2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'virallinkhub2026!';

/**
 * Admin Login Endpoint
 * Generates JWT Bearer Token upon correct credentials
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both username and password',
      });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin username or password',
      });
    }

    const token = jwt.sign(
      {
        username,
        isAdmin: true,
        role: 'superadmin',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      admin: {
        username,
        role: 'superadmin',
      },
    });
  } catch (error) {
    console.error('[Admin Login] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed due to server error',
    });
  }
};

/**
 * GET /api/v1/admin/stats
 * Returns Live Active Users (last 5 mins), Total Unique Visitors, Total Views, and Ads Revenue Clicks
 */
exports.getStats = async (req, res) => {
  try {
    const stats = await analyticsService.getStats();
    const totalVideos = await Video.countDocuments();
    const featuredVideos = await Video.countDocuments({ isFeatured: true });

    return res.status(200).json({
      success: true,
      data: {
        liveActiveUsers: stats.activeUsers,
        totalUniqueVisitors: stats.totalVisitors,
        totalViews: stats.totalViews,
        adsRevenueClicks: stats.adClicks,
        totalVideos,
        featuredVideos,
        activeWindowMinutes: stats.activeWindowMinutes,
        recentLogs: stats.recentLogs,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Admin Stats] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve admin analytics',
    });
  }
};

/**
 * Settings Management
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const {
      appName,
      maintenanceMode,
      globalAdLink,
      defaultAdsRequired,
      announcementBannerText,
      telegramChannelUrl,
    } = req.body;

    const updateData = {};
    if (typeof appName === 'string') updateData.appName = appName;
    if (typeof maintenanceMode === 'boolean') updateData.maintenanceMode = maintenanceMode;
    if (typeof globalAdLink === 'string') updateData.globalAdLink = globalAdLink;
    if (typeof defaultAdsRequired === 'number') updateData.defaultAdsRequired = defaultAdsRequired;
    if (typeof announcementBannerText === 'string') updateData.announcementBannerText = announcementBannerText;
    if (typeof telegramChannelUrl === 'string') updateData.telegramChannelUrl = telegramChannelUrl;

    const settings = await Settings.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Video CRUD Management
 */
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      posterUrl,
      bannerUrl,
      category,
      targetLink,
      targetType,
      directAdLink,
      requiredAdsCount,
      isFeatured,
      fileSize,
      quality,
      tags,
    } = req.body;

    if (!title || !targetLink || !posterUrl) {
      return res.status(400).json({
        success: false,
        error: 'title, targetLink, and posterUrl are required',
      });
    }

    const video = await Video.create({
      title,
      description: description || '',
      posterUrl,
      bannerUrl: bannerUrl || posterUrl,
      category: category || 'Trending',
      targetLink,
      targetType: targetType || 'terabox',
      directAdLink: directAdLink || '',
      requiredAdsCount: typeof requiredAdsCount === 'number' ? requiredAdsCount : 2,
      isFeatured: Boolean(isFeatured),
      fileSize: fileSize || '1.4 GB',
      quality: quality || '1080p HD',
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: video,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
