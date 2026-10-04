/**
 * Video Model Schema
 * Represents content listed in VIRAL LINK HUB with monetization parameters
 */
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true,
    },
    bannerUrl: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Trending', 'Terabox Cloud', 'Action', 'Viral Clips', 'Anime', 'Web Series', 'VIP Exclusive'],
      default: 'Trending',
      index: true,
    },
    targetLink: {
      type: String,
      required: [true, 'Target link (Terabox / stream URL) is required'],
      trim: true,
    },
    targetType: {
      type: String,
      enum: ['terabox', 'direct_stream', 'cloud_drive', 'magnet', 'external'],
      default: 'terabox',
    },
    directAdLink: {
      type: String,
      default: '',
      trim: true,
      description: 'Custom CPM sponsor/monetization direct link (overrides globalAdLink if set)',
    },
    requiredAdsCount: {
      type: Number,
      default: 2,
      min: 0,
      max: 10,
    },
    viewsCount: {
      type: Number,
      default: 0,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    fileSize: {
      type: String,
      default: '1.2 GB',
    },
    quality: {
      type: String,
      default: '1080p HD',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted views display
videoSchema.virtual('formattedViews').get(function () {
  if (this.viewsCount >= 1000000) {
    return (this.viewsCount / 1000000).toFixed(1) + 'M';
  }
  if (this.viewsCount >= 1000) {
    return (this.viewsCount / 1000).toFixed(1) + 'K';
  }
  return this.viewsCount.toString();
});

module.exports = mongoose.models.Video || mongoose.model('Video', videoSchema);
