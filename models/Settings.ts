import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingsDocument extends Document {
  appName: string;
  maintenanceMode: boolean;
  globalAdLink: string;
  primaryDirectLink: string;
  secondaryDirectLink: string;
  bannerScriptCode: string;
  popunderScriptCode: string;
  defaultAdsRequired: number;
  announcementBannerText: string;
  telegramChannelUrl: string;
  forceJoinChannel: boolean;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    appName: {
      type: String,
      default: 'VIRAL LINK HUB',
      trim: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    globalAdLink: {
      type: String,
      default: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
      trim: true,
    },
    primaryDirectLink: {
      type: String,
      default: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
      trim: true,
    },
    secondaryDirectLink: {
      type: String,
      default: 'https://profitablegatecpm.com/direct?zone=65432&ref=virallinkhub',
      trim: true,
    },
    bannerScriptCode: {
      type: String,
      default: '',
      trim: true,
    },
    popunderScriptCode: {
      type: String,
      default: '',
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
      default: '🚀 High-Speed Direct Cloud Streams active! Complete sponsor verification to unlock 4K masters.',
      trim: true,
    },
    telegramChannelUrl: {
      type: String,
      default: 'https://t.me/virallinkhub_official',
      trim: true,
    },
    forceJoinChannel: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Settings =
  mongoose.models.Settings || mongoose.model<ISettingsDocument>('Settings', SettingsSchema);

export default Settings;
