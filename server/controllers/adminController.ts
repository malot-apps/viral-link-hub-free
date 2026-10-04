import { Request, Response } from 'express';
import { signAdminToken } from '../middleware/auth';
import { Video } from '../models/Video';
import { Settings } from '../models/Settings';
import { initialSeedVideos } from '../config/db';

let memoryVideos = [...initialSeedVideos];

export async function loginAdmin(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body || {};

  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'virallinkhub2026!';

  if (username === validUsername && password === validPassword) {
    const token = signAdminToken({ username, role: 'super_admin' });
    res.json({
      success: true,
      token,
      admin: { username, role: 'super_admin' },
      message: 'Authentication successful',
    });
    return;
  }

  res.status(401).json({
    success: false,
    error: 'Invalid administrator credentials',
  });
}

export async function getSettings(_req: Request, res: Response): Promise<void> {
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
      data: settings,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve administrative settings',
    });
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const { maintenanceMode, globalAdLink, defaultAdsRequired, announcementBannerText, telegramChannelUrl, forceJoinChannel } = req.body;

    const updated = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          appName: 'VIRAL LINK HUB',
          ...(maintenanceMode !== undefined && { maintenanceMode: Boolean(maintenanceMode) }),
          ...(globalAdLink !== undefined && { globalAdLink: String(globalAdLink).trim() }),
          ...(defaultAdsRequired !== undefined && { defaultAdsRequired: Number(defaultAdsRequired) }),
          ...(announcementBannerText !== undefined && {
            announcementBannerText: String(announcementBannerText).trim(),
          }),
          ...(telegramChannelUrl !== undefined && {
            telegramChannelUrl: String(telegramChannelUrl).trim(),
          }),
          ...(forceJoinChannel !== undefined && {
            forceJoinChannel: Boolean(forceJoinChannel),
          }),
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Global settings updated successfully',
      data: updated,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: 'Failed to update administrative settings',
    });
  }
}

export async function createVideo(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      description,
      posterUrl,
      bannerGifUrl,
      category,
      streamUrl,
      targetLink,
      directAdLink,
      requiredAdsCount,
      quality,
      fileSize,
      isFeatured,
      tags,
    } = req.body;

    const effectiveStreamUrl = streamUrl || targetLink;

    if (!title || !posterUrl || !effectiveStreamUrl) {
      res.status(400).json({
        success: false,
        error: 'Title, poster image, and stream URL are required fields',
      });
      return;
    }

    const newVideoData = {
      title: String(title).trim(),
      description: String(description || '').trim(),
      posterUrl: String(posterUrl).trim(),
      bannerGifUrl: String(bannerGifUrl || posterUrl).trim(),
      category: String(category || 'Viral Movies').trim(),
      streamUrl: String(effectiveStreamUrl).trim(),
      directAdLink: String(directAdLink || '').trim(),
      requiredAdsCount: Number(requiredAdsCount ?? 2),
      viewsCount: 0,
      isFeatured: Boolean(isFeatured),
      quality: String(quality || '1080p HD').trim(),
      fileSize: String(fileSize || '1.4 GB').trim(),
      tags: Array.isArray(tags) ? tags : [],
    };

    let createdVideo;
    try {
      createdVideo = await Video.create(newVideoData);
    } catch {
      const mockCreated = {
        _id: `vid-${Date.now()}`,
        ...newVideoData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryVideos.unshift(mockCreated as any);
      createdVideo = mockCreated;
    }

    res.status(201).json({
      success: true,
      message: 'Video added to catalog successfully',
      data: createdVideo,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: 'Failed to create new video',
    });
  }
}

export async function updateVideo(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Support targetLink as alias for streamUrl
    if (updateData.targetLink && !updateData.streamUrl) {
      updateData.streamUrl = updateData.targetLink;
      delete updateData.targetLink;
    }

    let updatedVideo;
    try {
      updatedVideo = await Video.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    } catch {
      const idx = memoryVideos.findIndex((v) => v._id === id);
      if (idx !== -1) {
        memoryVideos[idx] = { ...memoryVideos[idx], ...updateData };
        updatedVideo = memoryVideos[idx];
      }
    }

    if (!updatedVideo) {
      res.status(404).json({
        success: false,
        error: 'Video not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: updatedVideo,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: 'Failed to update video record',
    });
  }
}

export async function deleteVideo(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    try {
      await Video.findByIdAndDelete(id);
    } catch {
      memoryVideos = memoryVideos.filter((v) => v._id !== id);
    }

    res.json({
      success: true,
      message: 'Video deleted from catalog successfully',
      id,
    });
  } catch {
    res.status(500).json({
      success: false,
      error: 'Failed to delete video',
    });
  }
}
