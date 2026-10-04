export interface IVideo {
  _id: string;
  title: string;
  description: string;
  posterUrl: string;
  bannerGifUrl: string;
  bannerUrl?: string;
  category: 'Viral Movies' | 'VIP Cloud' | 'Trending' | 'Action' | 'Viral Clips' | 'Anime' | 'Recommended' | string;
  streamUrl: string;
  serverUrl?: string;
  hdSourceUrl?: string;
  targetLink?: string; // backwards compatibility alias for streamUrl
  targetType?: string;
  directAdLink: string;
  requiredAdsCount: number;
  viewsCount: number;
  isFeatured: boolean;
  fileSize?: string;
  quality?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ISettings {
  appName: string;
  maintenanceMode: boolean;
  globalAdLink: string;
  defaultAdsRequired: number;
  announcementBannerText: string;
  telegramChannelUrl?: string;
  forceJoinChannel?: boolean;
  isMaintenanceBypassAllowed?: boolean;
}

export interface IVisitorLog {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  path: string;
  timestamp: string;
}

export interface IAnalytics {
  totalVisitors: number;
  totalViews: number;
  activeUsers: number;
  adClicks: number;
  uniqueUserIds: string[];
  recentLogs: IVisitorLog[];
  activeWindowMinutes: number;
}

export interface ITelegramUser {
  id: number | string;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}
