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

export interface IAdPlacements {
  homeBanner: boolean;
  contentCard: boolean;
  contentDetails: boolean;
  unlockAction: boolean;
  betweenNav: boolean;
  popunder: boolean;
  premiumRewardArea: boolean;
  // Specific Monetag & Adsterra Placement Toggles
  nativeBannerHome?: boolean;
  nativeBannerContent?: boolean;
  banner728x90Desktop?: boolean;
  socialBarGlobal?: boolean;
  popunderGlobal?: boolean;
  monetagRewarded?: boolean;
  monetagInApp?: boolean;
}

export interface IABTestingConfig {
  enabled: boolean;
  experimentName: string;
  variantA: string;
  variantB: string;
}

export interface ISettings {
  appName: string;
  maintenanceMode: boolean;
  globalAdLink: string;
  primaryDirectLink?: string;
  secondaryDirectLink?: string;
  bannerScriptCode?: string;
  popunderScriptCode?: string;
  defaultAdsRequired: number;
  announcementBannerText: string;
  telegramChannelUrl?: string;
  forceJoinChannel?: boolean;
  isMaintenanceBypassAllowed?: boolean;
  // Monetag Configuration (Telegram Mini App)
  monetagZoneId?: string;
  monetagEnabled?: boolean;
  inAppFrequency?: number;
  inAppCapping?: number;
  inAppInterval?: number;
  inAppTimeout?: number;
  // Adsterra Configuration (Normal Web)
  adsterraEnabled?: boolean;
  adsterraPopunderUrl?: string;
  adsterraSmartlinkUrl?: string;
  adsterraSocialBarUrl?: string;
  adsterraNativeBannerUrl?: string;
  adsterraNativeBannerContainer?: string;
  adsterraBanner728x90Key?: string;
  // Growth & Referral Controls
  premiumRewardEnabled?: boolean;
  premiumRequiredAds?: number;
  premiumRequiredReferrals?: number;
  premiumDurationHours?: number;
  referralQualificationRule?: 'view_content' | 'ad_completion' | 'unlock_content';
  referralSystemEnabled?: boolean;
  channelVerificationEnabled?: boolean;
  // Ad Frequency & Abuse Prevention Controls
  adFrequencyEnabled?: boolean;
  maxAdsPerSession?: number;
  maxPopundersPerSession?: number;
  adCooldownSeconds?: number;
  maxAdsPerDay?: number;
  adPlacements?: IAdPlacements;
  abTesting?: IABTestingConfig;
  // Professional Intro / Hero & Community Section
  introTitle?: string;
  introSubtitle?: string;
  introDescription?: string;
  introPrimaryCtaText?: string;
  introPrimaryCtaUrl?: string;
  introSecondaryCtaText?: string;
  introSecondaryCtaUrl?: string;
  communitySectionTitle?: string;
  communitySectionSubtitle?: string;
  showIntroHero?: boolean;
}

export interface IUserProfile {
  telegramUserId: string;
  username: string;
  firstName: string;
  lastName: string;
  isTelegramPremium: boolean;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  qualifiedReferralCount: number;
  adActionsCompleted: number;
  premiumUntil: string | null;
  isPremiumActive: boolean;
  premiumClaimedCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface IReferralLeaderboardEntry {
  rank: number;
  displayName: string;
  referralCode: string;
  qualifiedReferrals: number;
  totalReferrals: number;
}

export type AnalyticsEventType =
  | 'app_open'
  | 'content_view'
  | 'content_click'
  | 'ad_impression'
  | 'ad_start'
  | 'ad_complete'
  | 'ad_click'
  | 'ad_completion'
  | 'reward_granted'
  | 'content_unlock'
  | 'share_click'
  | 'share_open'
  | 'referral_open'
  | 'qualified_referral'
  | 'bot_start'
  | 'channel_click'
  | 'channel_verification'
  | 'premium_reward'
  | 'premium_expired';

export interface IAnalyticsEvent {
  event: AnalyticsEventType;
  userId?: string | null;
  contentId?: string | null;
  referralCode?: string | null;
  campaign?: string | null;
  source?: string | null;
  placement?: string | null;
  network?: 'monetag' | 'adsterra' | 'direct' | string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
}

export interface IGrowthAnalytics {
  period: 'today' | '7d' | '30d' | 'all';
  mode: 'production' | 'demo';
  // User metrics
  totalUsers: number;
  newUsers: number;
  returningUsers: number;
  dailyActiveUsers: number;
  // Telegram funnel
  botStarts: number;
  miniAppOpens: number;
  channelClicks: number;
  channelVerifications: number;
  // Referral & Virality
  sharesCount: number;
  referralOpens: number;
  qualifiedReferrals: number;
  // Premium
  premiumRewardsClaimed: number;
  activePremiumUsers: number;
  // Monetization
  adImpressions: number;
  adClicks: number;
  adCompletions: number;
  contentUnlocks: number;
  ctr: number;
  unlockRate: number;
  topPlacement: string;
  // Top Lists
  topContent: Array<{ contentId: string; title: string; views: number; unlocks: number }>;
  topSharedContent: Array<{ contentId: string; title: string; shares: number }>;
  topReferralSources: Array<{ source: string; count: number }>;
  topCampaigns: Array<{ campaign: string; count: number }>;
  leaderboard: IReferralLeaderboardEntry[];
  abTestResults?: {
    variantA: { impressions: number; clicks: number; ctr: number };
    variantB: { impressions: number; clicks: number; ctr: number };
    winner?: string;
  };
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

export interface ITelegramEntity {
  id: string;
  type: 'channel' | 'group' | 'bot' | 'miniapp';
  title: string;
  identifier: string;
  chatId?: string;
  url: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt?: string;
}

export type TelegramDestinationType = 'channel' | 'group' | 'bot';

export interface ITelegramDestination {
  id: string;
  title: string;
  description: string;
  type: TelegramDestinationType;
  url: string;
  username: string;
  chatId: string;
  icon: string;
  isRequired: boolean;
  showOnWebsite: boolean;
  showOnMiniapp: boolean;
  orderIndex: number;
  isActive: boolean;
  memberCountDisplay?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITelegramVerificationResponse {
  verified: boolean;
  status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked' | 'unverified' | 'unconfigured' | 'error' | 'manual_required' | string;
  serverVerified: boolean;
  message: string;
  destinationId?: string;
  timestamp?: string;
}

export interface IGrowthMission {
  id: string;
  type: 'join_channel' | 'join_group' | 'start_bot' | 'open_miniapp' | 'invite_friends';
  title: string;
  description: string;
  targetUrl: string;
  chatId?: string;
  requiredCount: number;
  rewardAdCredits: number;
  rewardDescription: string;
  isActive: boolean;
  orderIndex: number;
  createdAt?: string;
}

export interface IUserMissionProgress {
  missionId: string;
  status: 'pending' | 'completed' | 'claimed';
  progressCount: number;
  completedAt?: string;
  verifiedVia: 'server_api' | 'client' | 'referral_system';
}

export interface ICampaign {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  source: string;
  isActive: boolean;
  clicksCount?: number;
  newUsersCount?: number;
  qualifiedCount?: number;
  conversionRate?: number;
  createdAt?: string;
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

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          user?: ITelegramUser;
        };
        expand: () => void;
        ready: () => void;
        openTelegramLink?: (url: string) => void;
        openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
        close?: () => void;
        themeParams?: Record<string, string>;
      };
    };
  }
}
