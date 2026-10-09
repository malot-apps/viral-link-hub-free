import { IVideo, ISettings, IVisitorLog, ITelegramEntity, ITelegramDestination, IGrowthMission, IUserMissionProgress, ICampaign } from './types';
import { INITIAL_TELEGRAM_DESTINATIONS } from './catalog-seed';

/**
 * Isolated Demo Data Store
 * 
 * CRITICAL SAFETY GATE:
 * This file is ONLY used when APP_MODE === 'demo'.
 * It must NEVER be called, imported, or used as fallback in production mode.
 */

const demoVideos: IVideo[] = [
  {
    _id: 'demo-vid-neon-protocol',
    title: '[DEMO] Neon Protocol: Cyber Shadow',
    description: 'A rogue neural net hacker discovers an encrypted corporate conspiracy deep inside the neo-Tokyo megagrid. High-bitrate demo stream.',
    posterUrl: '/images/hero_viral_cyberpunk_1791064071681.jpg',
    bannerGifUrl: '/images/hero_viral_cyberpunk_1791064071681.jpg',
    bannerUrl: '/images/hero_viral_cyberpunk_1791064071681.jpg',
    category: 'Trending',
    streamUrl: 'https://fastcdn.stream/v/demo-neon-protocol',
    serverUrl: 'https://fastcdn.stream/v/demo-neon-protocol',
    hdSourceUrl: 'https://fastcdn.stream/v/demo-neon-protocol',
    targetLink: 'https://fastcdn.stream/v/demo-neon-protocol',
    targetType: 'direct_stream',
    directAdLink: 'https://monetag.com/direct?zone=78912',
    requiredAdsCount: 2,
    viewsCount: 14820,
    isFeatured: true,
    fileSize: '1.8 GB',
    quality: '4K Ultra HD',
    tags: ['Cyberpunk', 'Sci-Fi', 'Thriller', 'VIP Master'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-vid-shadow-heist',
    title: '[DEMO] Shadow Heist: Dark Protocol',
    description: 'A seasoned crew of black-ops specialists plan the infiltration of a sovereign underground vault in Geneva.',
    posterUrl: '/images/movie_action_heist_1791064084283.jpg',
    bannerGifUrl: '/images/movie_action_heist_1791064084283.jpg',
    bannerUrl: '/images/movie_action_heist_1791064084283.jpg',
    category: 'Action',
    streamUrl: 'https://fastcdn.stream/v/demo-shadow-heist',
    serverUrl: 'https://fastcdn.stream/v/demo-shadow-heist',
    hdSourceUrl: 'https://fastcdn.stream/v/demo-shadow-heist',
    targetLink: 'https://fastcdn.stream/v/demo-shadow-heist',
    targetType: 'direct_stream',
    directAdLink: 'https://adsterra.com/direct?zone=55219',
    requiredAdsCount: 2,
    viewsCount: 29400,
    isFeatured: false,
    fileSize: '1.4 GB',
    quality: '1080p HD',
    tags: ['Action', 'Heist', 'Crime'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-vid-celestial-blade',
    title: '[DEMO] Celestial Blade: Sovereign Chronicle',
    description: 'An ancient wandering warrior awakens a constellation blade to defend the broken kingdom from falling deities.',
    posterUrl: '/images/movie_anime_fantasy_1791064098414.jpg',
    bannerGifUrl: '/images/movie_anime_fantasy_1791064098414.jpg',
    bannerUrl: '/images/movie_anime_fantasy_1791064098414.jpg',
    category: 'Anime',
    streamUrl: 'https://fastcdn.stream/v/demo-celestial-blade',
    serverUrl: 'https://fastcdn.stream/v/demo-celestial-blade',
    hdSourceUrl: 'https://fastcdn.stream/v/demo-celestial-blade',
    targetLink: 'https://fastcdn.stream/v/demo-celestial-blade',
    targetType: 'direct_stream',
    directAdLink: '',
    requiredAdsCount: 1,
    viewsCount: 42100,
    isFeatured: false,
    fileSize: '2.4 GB',
    quality: '1080p Dual Audio',
    tags: ['Anime', 'Fantasy', 'Action'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-vid-dark-net',
    title: '[DEMO] The Dark Net Syndicate: Exposed',
    description: 'Investigative documentary deep dive into covert offshore server clusters, zero-day exploit markets, and encrypted data leaks.',
    posterUrl: '/images/movie_viral_documentary_1791064110177.jpg',
    bannerGifUrl: '/images/movie_viral_documentary_1791064110177.jpg',
    bannerUrl: '/images/movie_viral_documentary_1791064110177.jpg',
    category: 'Viral Clips',
    streamUrl: 'https://fastcdn.stream/v/demo-dark-net',
    serverUrl: 'https://fastcdn.stream/v/demo-dark-net',
    hdSourceUrl: 'https://fastcdn.stream/v/demo-dark-net',
    targetLink: 'https://fastcdn.stream/v/demo-dark-net',
    targetType: 'direct_stream',
    directAdLink: '',
    requiredAdsCount: 2,
    viewsCount: 63800,
    isFeatured: false,
    fileSize: '950 MB',
    quality: '1080p HD',
    tags: ['Documentary', 'Viral Leak', 'Tech'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const demoSettings: ISettings = {
  appName: 'VIRAL LINK HUB (DEMO)',
  maintenanceMode: false,
  globalAdLink: 'https://cheflobesofficer.com/cvdp4vvsma?key=fbecdf734cc50866fb1dcfa342c33a86',
  primaryDirectLink: 'https://cheflobesofficer.com/cvdp4vvsma?key=fbecdf734cc50866fb1dcfa342c33a86',
  secondaryDirectLink: 'https://cheflobesofficer.com/cvdp4vvsma?key=fbecdf734cc50866fb1dcfa342c33a86',
  bannerScriptCode: '',
  popunderScriptCode: '',
  defaultAdsRequired: 2,
  announcementBannerText: '⚠️ DEMO MODE ACTIVE: High-speed streaming simulation with demo catalog.',
  telegramChannelUrl: 'https://t.me/virallinkhub_official',
  forceJoinChannel: false,
  isMaintenanceBypassAllowed: true,
  // Monetag Configuration (Telegram Mini App)
  monetagZoneId: '11955914',
  monetagEnabled: true,
  inAppFrequency: 2,
  inAppCapping: 0.1,
  inAppInterval: 30,
  inAppTimeout: 5,
  // Adsterra Configuration (Normal Web)
  adsterraEnabled: true,
  adsterraPopunderUrl: 'https://cheflobesofficer.com/26/24/93/262493230301da17c67cbcf5a1d5e15b.js',
  adsterraSmartlinkUrl: 'https://cheflobesofficer.com/cvdp4vvsma?key=fbecdf734cc50866fb1dcfa342c33a86',
  adsterraSocialBarUrl: 'https://cheflobesofficer.com/db/ca/37/dbca37a0ea14e2da7c5826f0a5e6fbb9.js',
  adsterraNativeBannerUrl: 'https://cheflobesofficer.com/5f7e7c20bab3c9a4fa6f40424b458934/invoke.js',
  adsterraNativeBannerContainer: 'container-5f7e7c20bab3c9a4fa6f40424b458934',
  adsterraBanner728x90Key: 'd2a5e27ec28fef3e096f82c41992173b',
  // Growth & Referral Controls
  premiumRewardEnabled: true,
  premiumRequiredAds: 3,
  premiumRequiredReferrals: 3,
  premiumDurationHours: 24,
  referralQualificationRule: 'view_content',
  referralSystemEnabled: true,
  channelVerificationEnabled: false,
  // Ad Frequency & Rate Limit Controls
  adFrequencyEnabled: true,
  maxAdsPerSession: 5,
  maxPopundersPerSession: 1,
  adCooldownSeconds: 10,
  maxAdsPerDay: 30,
  adPlacements: {
    homeBanner: true,
    contentCard: true,
    contentDetails: true,
    unlockAction: true,
    betweenNav: true,
    popunder: true,
    premiumRewardArea: true,
    nativeBannerHome: true,
    nativeBannerContent: true,
    banner728x90Desktop: true,
    socialBarGlobal: true,
    popunderGlobal: true,
    monetagRewarded: true,
    monetagInApp: true,
  },
  abTesting: {
    enabled: true,
    experimentName: 'High CPM Sponsor vs Native Continue',
    variantA: 'Direct Link Sponsor',
    variantB: 'Native Unlock Gate',
  },
  // Professional Intro / Hero & Community Section
  introTitle: 'Unlimited Cloud Entertainment & Instant Streaming',
  introSubtitle: 'VIP Fast-Track Access · Official Telegram Community Hub',
  introDescription:
    'Discover exclusive high-speed cloud movies, viral anime releases, and direct VIP links. Join our verified Telegram ecosystem to unlock 4K content with instant direct access.',
  introPrimaryCtaText: 'Join Official Community',
  introPrimaryCtaUrl: 'https://t.me/virallinkhub_official',
  introSecondaryCtaText: 'Browse Movies',
  introSecondaryCtaUrl: '#browse-catalog',
  communitySectionTitle: 'Official Telegram Ecosystem',
  communitySectionSubtitle:
    'Join our verified channels, discussion groups, and interactive bots for direct links and member-only updates',
  showIntroHero: true,
};

declare global {
  var __DEMO_DATA_STORE__: {
    videos: IVideo[];
    settings: ISettings;
    activeSessions: Map<string, number>;
    uniqueVisitors: Set<string>;
    totalViews: number;
    adClicks: number;
    auditLogs: IVisitorLog[];
    adminAuditLogs: {
      _id: string;
      admin: string;
      action: string;
      target?: string;
      metadata?: Record<string, any>;
      ip: string;
      userAgent: string;
      createdAt: string;
    }[];
    users: Map<string, any>;
    events: any[];
    userAdSessions: Map<string, number[]>;
    entities: ITelegramEntity[];
    destinations: ITelegramDestination[];
    missions: IGrowthMission[];
    userMissionProgress: Map<string, IUserMissionProgress[]>;
    campaigns: ICampaign[];
  } | undefined;
}

if (!global.__DEMO_DATA_STORE__) {
  const visitors = new Set<string>();
  for (let i = 1; i <= 1240; i++) {
    visitors.add(`demo_tg_${10000000 + i}`);
  }

  const initialLogs: IVisitorLog[] = [
    {
      id: 'demo-log-1',
      userId: 'demo_user_1',
      ip: '127.0.0.1',
      userAgent: 'TelegramMiniApp/1.0',
      path: '/api/v1/movies',
      timestamp: new Date(Date.now() - 45000).toISOString(),
    },
    {
      id: 'demo-log-2',
      userId: 'demo_user_2',
      ip: '127.0.0.1',
      userAgent: 'TelegramMiniApp/1.0',
      path: '/api/v1/movies/demo-vid-neon-protocol/click-ad',
      timestamp: new Date(Date.now() - 90000).toISOString(),
    },
  ];

  const sessions = new Map<string, number>();
  sessions.set('demo_tg_108492041', Date.now() - 30000);
  sessions.set('demo_tg_593810294', Date.now() - 75000);

  const initialUsers = new Map<string, any>();
  // Seed demo primary user
  initialUsers.set('108492041', {
    telegramUserId: '108492041',
    username: 'alex_cyber',
    firstName: 'Alex',
    lastName: 'Vance',
    isTelegramPremium: true,
    referralCode: 'ref_alex77',
    referredBy: null,
    referredByUserId: null,
    referralCount: 2,
    qualifiedReferralCount: 2,
    adActionsCompleted: 2,
    premiumUntil: null,
    premiumClaimedCount: 0,
    channelJoined: true,
    firstSeenAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastSeenAt: new Date().toISOString(),
    viewsCount: 18,
    adClicksCount: 7,
  });

  // Seed leaderboard users for realistic demo leaderboard
  initialUsers.set('8829104', {
    telegramUserId: '8829104',
    username: 'dmitry_v',
    firstName: 'Dmitry',
    lastName: 'K',
    isTelegramPremium: true,
    referralCode: 'ref_dmitry99',
    referredBy: null,
    referredByUserId: null,
    referralCount: 47,
    qualifiedReferralCount: 42,
    adActionsCompleted: 25,
    premiumUntil: new Date(Date.now() + 3600000 * 18).toISOString(),
    premiumClaimedCount: 4,
    channelJoined: true,
    firstSeenAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    lastSeenAt: new Date().toISOString(),
    viewsCount: 88,
    adClicksCount: 34,
  });

  initialUsers.set('9102834', {
    telegramUserId: '9102834',
    username: 'sarah_sky',
    firstName: 'Sarah',
    lastName: 'L',
    isTelegramPremium: false,
    referralCode: 'ref_sarah31',
    referredBy: null,
    referredByUserId: null,
    referralCount: 36,
    qualifiedReferralCount: 31,
    adActionsCompleted: 19,
    premiumUntil: new Date(Date.now() + 3600000 * 12).toISOString(),
    premiumClaimedCount: 3,
    channelJoined: true,
    firstSeenAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    lastSeenAt: new Date().toISOString(),
    viewsCount: 52,
    adClicksCount: 21,
  });

  initialUsers.set('7748291', {
    telegramUserId: '7748291',
    username: 'cipher_guru',
    firstName: 'Elena',
    lastName: 'R',
    isTelegramPremium: true,
    referralCode: 'ref_elena27',
    referredBy: null,
    referredByUserId: null,
    referralCount: 30,
    qualifiedReferralCount: 27,
    adActionsCompleted: 14,
    premiumUntil: null,
    premiumClaimedCount: 2,
    channelJoined: true,
    firstSeenAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    lastSeenAt: new Date().toISOString(),
    viewsCount: 41,
    adClicksCount: 15,
  });

  const initialEvents: any[] = [
    {
      event: 'app_open',
      userId: '108492041',
      campaign: 'telegram_bot',
      source: 'direct',
      timestamp: new Date(Date.now() - 120000).toISOString(),
    },
    {
      event: 'ad_impression',
      userId: '108492041',
      placement: 'home_banner',
      timestamp: new Date(Date.now() - 110000).toISOString(),
    },
    {
      event: 'ad_click',
      userId: '108492041',
      placement: 'unlock_action',
      contentId: 'demo-vid-neon-protocol',
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
    {
      event: 'ad_completion',
      userId: '108492041',
      placement: 'unlock_action',
      contentId: 'demo-vid-neon-protocol',
      timestamp: new Date(Date.now() - 55000).toISOString(),
    },
    {
      event: 'content_unlock',
      userId: '108492041',
      contentId: 'demo-vid-neon-protocol',
      timestamp: new Date(Date.now() - 50000).toISOString(),
    },
  ];

  global.__DEMO_DATA_STORE__ = {
    videos: [...demoVideos],
    settings: { ...demoSettings },
    activeSessions: sessions,
    uniqueVisitors: visitors,
    totalViews: 84320,
    adClicks: 14290,
    auditLogs: initialLogs,
    adminAuditLogs: [
      {
        _id: 'demo-audit-1',
        admin: 'demo_admin',
        action: 'system_initialized',
        target: 'VIRAL LINK HUB',
        metadata: { engine: 'Supabase Architecture' },
        ip: '127.0.0.1',
        userAgent: 'TelegramMiniApp/1.0',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    users: initialUsers,
    events: initialEvents,
    userAdSessions: new Map(),
    entities: [
      {
        id: 'demo-entity-1',
        type: 'miniapp',
        title: 'Viral Link Hub Primary Mini App',
        identifier: 'viral_link_hub_free_bot/viral',
        chatId: '',
        url: 'https://t.me/viral_link_hub_free_bot/viral',
        isPrimary: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-entity-2',
        type: 'bot',
        title: 'Viral Link Hub Distribution Bot',
        identifier: 'viral_link_hub_free_bot',
        chatId: '',
        url: 'https://t.me/viral_link_hub_free_bot',
        isPrimary: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-entity-3',
        type: 'channel',
        title: 'Official Viral Link Hub Channel',
        identifier: 'virallinkhub_official',
        chatId: '@virallinkhub_official',
        url: 'https://t.me/virallinkhub_official',
        isPrimary: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-entity-4',
        type: 'group',
        title: 'VIP Community & Discussion Chat',
        identifier: 'virallinkhub_chat',
        chatId: '@virallinkhub_chat',
        url: 'https://t.me/virallinkhub_chat',
        isPrimary: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ],
    destinations: [...INITIAL_TELEGRAM_DESTINATIONS],
    missions: [
      {
        id: 'demo-mission-1',
        type: 'join_channel',
        title: 'Join Official Telegram Channel',
        description: 'Subscribe to get cloud direct updates and bypass link limits.',
        targetUrl: 'https://t.me/virallinkhub_official',
        chatId: '@virallinkhub_official',
        requiredCount: 1,
        rewardAdCredits: 1,
        rewardDescription: '+1 VIP Credit',
        isActive: true,
        orderIndex: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-mission-2',
        type: 'join_group',
        title: 'Join VIP Discussion Community',
        description: 'Connect with members and request new viral movies.',
        targetUrl: 'https://t.me/virallinkhub_chat',
        chatId: '@virallinkhub_chat',
        requiredCount: 1,
        rewardAdCredits: 1,
        rewardDescription: '+1 VIP Credit',
        isActive: true,
        orderIndex: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-mission-3',
        type: 'start_bot',
        title: 'Start Official Telegram Bot',
        description: 'Activate cloud notification and link generator bot.',
        targetUrl: 'https://t.me/viral_link_hub_free_bot?start=mission_bonus',
        chatId: '',
        requiredCount: 1,
        rewardAdCredits: 1,
        rewardDescription: '+1 VIP Credit',
        isActive: true,
        orderIndex: 3,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-mission-4',
        type: 'invite_friends',
        title: 'Invite 3 Friends via Referral Link',
        description: 'Share your personal mini app link with 3 friends.',
        targetUrl: 'https://t.me/viral_link_hub_free_bot/viral',
        chatId: '',
        requiredCount: 3,
        rewardAdCredits: 3,
        rewardDescription: '24h VIP Unlock',
        isActive: true,
        orderIndex: 4,
        createdAt: new Date().toISOString(),
      },
    ],
    userMissionProgress: new Map(),
    campaigns: [
      {
        id: 'demo-camp-1',
        campaignId: 'tiktok_viral',
        name: 'TikTok Viral Clips',
        description: 'Organic short-form clips and bio links on TikTok',
        source: 'tiktok',
        isActive: true,
        clicksCount: 3420,
        newUsersCount: 1240,
        qualifiedCount: 480,
        conversionRate: 36.2,
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      },
      {
        id: 'demo-camp-2',
        campaignId: 'tg_channel_promo',
        name: 'Telegram Channel Sponsorships',
        description: 'Partner cross-channel broadcast promotions',
        source: 'telegram',
        isActive: true,
        clicksCount: 2890,
        newUsersCount: 980,
        qualifiedCount: 410,
        conversionRate: 33.9,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
      {
        id: 'demo-camp-3',
        campaignId: 'youtube_shorts',
        name: 'YouTube Shorts Discovery',
        description: 'Discovery traffic from YouTube video descriptions',
        source: 'youtube',
        isActive: true,
        clicksCount: 1720,
        newUsersCount: 610,
        qualifiedCount: 210,
        conversionRate: 35.5,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
  };
}

export const demoStore = global.__DEMO_DATA_STORE__;
