import mongoose, { Schema, Document } from 'mongoose';

export interface IVideoDocument extends Document {
  title: string;
  description: string;
  posterUrl: string;
  bannerGifUrl?: string;
  bannerUrl?: string;
  category: string;
  streamUrl: string;
  serverUrl?: string;
  hdSourceUrl?: string;
  targetLink?: string;
  targetType?: string;
  directAdLink?: string;
  requiredAdsCount: number;
  viewsCount: number;
  isFeatured: boolean;
  quality?: string;
  fileSize?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true,
    },
    bannerGifUrl: {
      type: String,
      trim: true,
      default: '',
    },
    bannerUrl: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    streamUrl: {
      type: String,
      required: [true, 'Target stream URL is required'],
      trim: true,
    },
    targetLink: {
      type: String,
      trim: true,
      default: '',
    },
    targetType: {
      type: String,
      trim: true,
      default: 'direct_stream',
    },
    directAdLink: {
      type: String,
      trim: true,
      default: '',
    },
    requiredAdsCount: {
      type: Number,
      default: 2,
      min: [0, 'Required ads count cannot be negative'],
      max: [10, 'Required ads count cannot exceed 10'],
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    quality: {
      type: String,
      default: '1080p HD',
      trim: true,
    },
    fileSize: {
      type: String,
      default: '1.4 GB',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.serverUrl = ret.streamUrl;
        ret.hdSourceUrl = ret.streamUrl;
        if (!ret.targetLink) ret.targetLink = ret.streamUrl;
        delete ret.__v;
        return ret;
      },
    },
  }
);

VideoSchema.index({ category: 1, isFeatured: -1, viewsCount: -1 });
VideoSchema.index({ title: 'text', description: 'text' });

export const Video =
  mongoose.models.Video || mongoose.model<IVideoDocument>('Video', VideoSchema);

export default Video;
