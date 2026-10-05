import { IVideo, ISettings, IVisitorLog } from './types';

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
  globalAdLink: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
  primaryDirectLink: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
  secondaryDirectLink: 'https://profitablegatecpm.com/direct?zone=65432&ref=virallinkhub',
  bannerScriptCode: '',
  popunderScriptCode: '',
  defaultAdsRequired: 2,
  announcementBannerText: '⚠️ DEMO MODE ACTIVE: High-speed streaming simulation with demo catalog.',
  telegramChannelUrl: 'https://t.me/virallinkhub_official',
  forceJoinChannel: false,
  isMaintenanceBypassAllowed: true,
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

  global.__DEMO_DATA_STORE__ = {
    videos: [...demoVideos],
    settings: { ...demoSettings },
    activeSessions: sessions,
    uniqueVisitors: visitors,
    totalViews: 84320,
    adClicks: 14290,
    auditLogs: initialLogs,
  };
}

export const demoStore = global.__DEMO_DATA_STORE__;
