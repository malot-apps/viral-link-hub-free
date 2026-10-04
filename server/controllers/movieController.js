/**
 * Movie / Video Catalog Controller
 * Provides categorised listings, video details, view counters, and ad click tracking
 */
const Video = require('../models/Video');
const analyticsService = require('../services/analyticsService');

exports.getMovies = async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [videos, total] = await Promise.all([
      Video.find(filter).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Video.countDocuments(filter),
    ]);

    // Distinct categories available in database
    const categories = await Video.distinct('category');

    return res.status(200).json({
      success: true,
      count: videos.length,
      total,
      page: parseInt(page),
      categories: ['All', ...categories],
      data: videos,
    });
  } catch (error) {
    console.error('[getMovies] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve movie collection',
    });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch video details',
    });
  }
};

exports.recordMovieView = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    return res.status(200).json({
      success: true,
      viewsCount: video.viewsCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to increment view' });
  }
};

exports.recordMovieAdClick = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    const totalClicks = await analyticsService.recordAdClick({
      videoId: id,
      userId: req.telegramUser?.id,
    });

    return res.status(200).json({
      success: true,
      message: 'Ad click recorded successfully',
      adClicks: totalClicks,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to record ad click' });
  }
};
