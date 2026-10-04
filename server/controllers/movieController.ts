import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { Settings } from '../models/Settings';
import { Visitor } from '../models/Visitor';
import { initialSeedVideos } from '../config/db';

// Fallback in-memory cache if MongoDB is disconnected
let memoryVideos = [...initialSeedVideos];

export async function getAppConfig(_req: Request, res: Response): Promise<void> {
  try {
    let settings = await Settings.findOne().lean();

    if (!settings) {
      settings = {
        appName: 'VIRAL LINK HUB',
        maintenanceMode: false,
        globalAdLink: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
        defaultAdsRequired: 2,
        announcementBannerText: '🚀 High-Speed Direct Cloud Streams active! Complete sponsor verification to unlock.',
      };
    }

    res.json({
      success: true,
      data: {
        appName: settings.appName || 'VIRAL LINK HUB',
        maintenanceMode: Boolean(settings.maintenanceMode),
        globalAdLink: settings.globalAdLink,
        defaultAdsRequired: settings.defaultAdsRequired ?? 2,
        announcementBannerText: settings.announcementBannerText,
        telegramChannelUrl: settings.telegramChannelUrl || 'https://t.me/virallinkhub_official',
        forceJoinChannel: Boolean(settings.forceJoinChannel),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve application configuration',
    });
  }
}

export async function getMovies(req: Request, res: Response): Promise<void> {
  try {
    const { category, search } = req.query;
    let query: Record<string, unknown> = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && typeof search === 'string') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { description: regex }, { category: regex }];
    }

    let videos;
    try {
      videos = await Video.find(query).sort({ isFeatured: -1, viewsCount: -1 }).lean();
    } catch {
      videos = memoryVideos.filter((v) => {
        const matchesCategory = !category || category === 'All' || v.category === category;
        const matchesSearch =
          !search ||
          v.title.toLowerCase().includes((search as string).toLowerCase()) ||
          v.category.toLowerCase().includes((search as string).toLowerCase());
        return matchesCategory && matchesSearch;
      });
    }

    // Ensure all response items mask links as streamUrl, serverUrl, hdSourceUrl
    const maskedVideos = (videos || []).map((v) => ({
      _id: v._id,
      title: v.title,
      description: v.description,
      posterUrl: v.posterUrl,
      bannerGifUrl: v.bannerGifUrl || v.posterUrl,
      category: v.category,
      streamUrl: v.streamUrl,
      serverUrl: v.streamUrl,
      hdSourceUrl: v.streamUrl,
      directAdLink: v.directAdLink || '',
      requiredAdsCount: v.requiredAdsCount ?? 2,
      viewsCount: v.viewsCount || 0,
      isFeatured: Boolean(v.isFeatured),
      quality: v.quality || '1080p HD',
      fileSize: v.fileSize || '1.4 GB',
      tags: v.tags || [],
    }));

    res.json({
      success: true,
      count: maskedVideos.length,
      data: maskedVideos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to query movie catalog',
    });
  }
}

export async function getMovieById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    let video;

    try {
      video = await Video.findById(id).lean();
    } catch {
      video = memoryVideos.find((v) => v._id === id);
    }

    if (!video) {
      res.status(404).json({
        success: false,
        error: 'Video not found in catalog',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        _id: video._id,
        title: video.title,
        description: video.description,
        posterUrl: video.posterUrl,
        bannerGifUrl: video.bannerGifUrl || video.posterUrl,
        category: video.category,
        streamUrl: video.streamUrl,
        serverUrl: video.streamUrl,
        hdSourceUrl: video.streamUrl,
        directAdLink: video.directAdLink || '',
        requiredAdsCount: video.requiredAdsCount ?? 2,
        viewsCount: video.viewsCount || 0,
        isFeatured: Boolean(video.isFeatured),
        quality: video.quality || '1080p HD',
        fileSize: video.fileSize || '1.4 GB',
        tags: video.tags || [],
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve movie details',
    });
  }
}

export async function incrementMovieView(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    let updatedViews = 0;

    try {
      const vid = await Video.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } }, { new: true });
      if (vid) updatedViews = vid.viewsCount;
    } catch {
      const idx = memoryVideos.findIndex((v) => v._id === id);
      if (idx !== -1) {
        memoryVideos[idx].viewsCount += 1;
        updatedViews = memoryVideos[idx].viewsCount;
      }
    }

    res.json({
      success: true,
      viewsCount: updatedViews,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: 'Failed to increment view counter',
    });
  }
}

export async function registerMovieAdClick(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const tgHeader = req.headers['x-telegram-init-data'];

    if (tgHeader && typeof tgHeader === 'string') {
      try {
        const parsed = JSON.parse(tgHeader);
        if (parsed.id) {
          await Visitor.findOneAndUpdate(
            { telegramUserId: String(parsed.id) },
            { $inc: { adClicksCount: 1 }, $set: { lastActiveAt: new Date() } }
          );
        }
      } catch {
        // non-fatal
      }
    }

    res.json({
      success: true,
      message: 'Ad click registered for monetization tracking',
      videoId: id,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: 'Failed to register ad telemetry',
    });
  }
}
