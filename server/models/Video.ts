import mongoose, { Schema, Document } from 'mongoose';

export interface IVideoDocument extends Document {
  title: string;
  description: string;
  posterUrl: string;
  bannerGifUrl: string;
  category: string;
  streamUrl: string;
  serverUrl?: string;
  hdSourceUrl?: string;
  directAdLink: string;
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
      default: '/images/hero_viral_cyberpunk.jpg',
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
    directAdLink: {
      type: String,
      trim: true,
      default: '',
    },
    requiredAdsCount: {
      type: Number,
      default: 2,
      min: [0, 'Required ads count cannot be negative'],
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
        // Enforce alias masking: provide serverUrl and hdSourceUrl aliases
        ret.serverUrl = ret.streamUrl;
        ret.hdSourceUrl = ret.streamUrl;
        // Never expose internal database __v
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual aliases for stream URL
VideoSchema.virtual('serverUrl').get(function (this: IVideoDocument) {
  return this.streamUrl;
});
VideoSchema.virtual('hdSourceUrl').get(function (this: IVideoDocument) {
  return this.streamUrl;
});

// Indexes for high-throughput reads
VideoSchema.index({ category: 1, isFeatured: -1, viewsCount: -1 });
VideoSchema.index({ title: 'text', description: 'text' });

export const Video = mongoose.models.Video || mongoose.model<IVideoDocument>('Video', VideoSchema);
export default Video;
