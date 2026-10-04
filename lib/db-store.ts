import { IVideo, ISettings, IVisitorLog } from './types';

// Initial Seed Videos (Strictly Masked: NO mention of Terabox)
const initialVideos: IVideo[] = [
  {
    _id: 'vid-neon-protocol-4k',
    title: 'Neon Protocol: Cyber Shadow',
    description: 'A rogue neural net hacker discovers an encrypted corporate conspiracy deep inside the neo-Tokyo megagrid. Features unreleased extended cut and high-bitrate master stream.',
    posterUrl: '/images/hero_viral_cyberpunk.jpg',
    bannerGifUrl: '/images/hero_viral_cyberpunk.jpg',
    bannerUrl: '/images/hero_viral_cyberpunk.jpg',
    category: 'Trending',
    streamUrl: 'https://fastcdn.stream/v/1e9xNeonProtocol4KUltra',
    serverUrl: 'https://fastcdn.stream/v/1e9xNeonProtocol4KUltra',
    hdSourceUrl: 'https://fastcdn.stream/v/1e9xNeonProtocol4KUltra',
    targetLink: 'https://fastcdn.stream/v/1e9xNeonProtocol4KUltra',
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
    _id: 'vid-shadow-heist-1080p',
    title: 'Shadow Heist: Dark Protocol',
    description: 'A seasoned crew of black-ops specialists plan the impossible infiltration of a sovereign underground vault in Geneva.',
    posterUrl: '/images/movie_action_heist.jpg',
    bannerGifUrl: '/images/movie_action_heist.jpg',
    bannerUrl: '/images/movie_action_heist.jpg',
    category: 'Action',
    streamUrl: 'https://fastcdn.stream/v/1m8xShadowHeist1080p',
    serverUrl: 'https://fastcdn.stream/v/1m8xShadowHeist1080p',
    hdSourceUrl: 'https://fastcdn.stream/v/1m8xShadowHeist1080p',
    targetLink: 'https://fastcdn.stream/v/1m8xShadowHeist1080p',
    targetType: 'direct_stream',
    directAdLink: 'https://adsterra.com/direct?zone=55219',
    requiredAdsCount: 2,
    viewsCount: 29400,
    isFeatured: false,
    fileSize: '1.4 GB',
    quality: '1080p HD',
    tags: ['Action', 'Heist', 'Crime', 'Full Movie'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'vid-celestial-blade-anime',
    title: 'Celestial Blade: Sovereign Chronicle',
    description: 'An ancient wandering warrior awakens a constellation blade to defend the broken kingdom from falling deities. Full 12-episode batch file.',
    posterUrl: '/images/movie_anime_fantasy.jpg',
    bannerGifUrl: '/images/movie_anime_fantasy.jpg',
    bannerUrl: '/images/movie_anime_fantasy.jpg',
    category: 'Anime',
    streamUrl: 'https://fastcdn.stream/v/1p0xCelestialBladeEp01-12',
    serverUrl: 'https://fastcdn.stream/v/1p0xCelestialBladeEp01-12',
    hdSourceUrl: 'https://fastcdn.stream/v/1p0xCelestialBladeEp01-12',
    targetLink: 'https://fastcdn.stream/v/1p0xCelestialBladeEp01-12',
    targetType: 'direct_stream',
    directAdLink: '',
    requiredAdsCount: 1,
    viewsCount: 42100,
    isFeatured: false,
    fileSize: '2.4 GB',
    quality: '1080p Dual Audio',
    tags: ['Anime', 'Fantasy', 'Action', 'Batch Download'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'vid-dark-net-docu',
    title: 'The Dark Net Syndicate: Exposed',
    description: 'Investigative documentary deep dive into covert offshore server clusters, zero-day exploit markets, and encrypted data leaks.',
    posterUrl: '/images/movie_viral_documentary.jpg',
    bannerGifUrl: '/images/movie_viral_documentary.jpg',
    bannerUrl: '/images/movie_viral_documentary.jpg',
    category: 'Viral Clips',
    streamUrl: 'https://fastcdn.stream/v/1k2xDarkNetDocuFullLeak',
    serverUrl: 'https://fastcdn.stream/v/1k2xDarkNetDocuFullLeak',
    hdSourceUrl: 'https://fastcdn.stream/v/1k2xDarkNetDocuFullLeak',
    targetLink: 'https://fastcdn.stream/v/1k2xDarkNetDocuFullLeak',
    targetType: 'direct_stream',
    directAdLink: '',
    requiredAdsCount: 2,
    viewsCount: 63800,
    isFeatured: false,
    fileSize: '950 MB',
    quality: '1080p HD',
    tags: ['Documentary', 'Viral Leak', 'Tech', 'FastCDN'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'vid-apex-velocity',
    title: 'Apex Extraction: Velocity',
    description: 'Fast-paced tactical survival through an abandoned high-security exclusion zone. Direct high-speed multi-mirror CDN stream.',
    posterUrl: '/images/movie_action_heist.jpg',
    bannerGifUrl: '/images/movie_action_heist.jpg',
    bannerUrl: '/images/movie_action_heist.jpg',
    category: 'VIP Cloud',
    streamUrl: 'https://fastcdn.stream/v/1z4xApexVelocityDirectSpeed',
    serverUrl: 'https://fastcdn.stream/v/1z4xApexVelocityDirectSpeed',
    hdSourceUrl: 'https://fastcdn.stream/v/1z4xApexVelocityDirectSpeed',
    targetLink: 'https://fastcdn.stream/v/1z4xApexVelocityDirectSpeed',
    targetType: 'direct_stream',
    directAdLink: 'https://monetag.com/direct?zone=78912',
    requiredAdsCount: 2,
    viewsCount: 18950,
    isFeatured: false,
    fileSize: '1.6 GB',
    quality: '1080p 60fps',
    tags: ['Action', 'Survival', 'High Speed', 'FastCDN'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'vid-quantum-horizon',
    title: 'Quantum Horizon: Interstellar Genesis',
    description: 'Deep-space exploration mission crosses an unmapped gravitational horizon into an ancient Dyson sphere network. Ultra high bitrate master.',
    posterUrl: '/images/hero_viral_cyberpunk.jpg',
    bannerGifUrl: '/images/hero_viral_cyberpunk.jpg',
    bannerUrl: '/images/hero_viral_cyberpunk.jpg',
    category: 'Trending',
    streamUrl: 'https://fastcdn.stream/v/1q9xQuantumHorizonSciFiFull',
    serverUrl: 'https://fastcdn.stream/v/1q9xQuantumHorizonSciFiFull',
    hdSourceUrl: 'https://fastcdn.stream/v/1q9xQuantumHorizonSciFiFull',
    targetLink: 'https://fastcdn.stream/v/1q9xQuantumHorizonSciFiFull',
    targetType: 'direct_stream',
    directAdLink: 'https://monetag.com/direct?zone=78912',
    requiredAdsCount: 2,
    viewsCount: 35120,
    isFeatured: false,
    fileSize: '2.1 GB',
    quality: '4K HDR',
    tags: ['Sci-Fi', 'Space', 'Dyson Sphere', 'VIP Master'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialSettings: ISettings = {
  appName: 'VIRAL LINK HUB',
  maintenanceMode: false,
  globalAdLink: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
  defaultAdsRequired: 2,
  announcementBannerText: '🚀 High-Speed Direct Cloud Streams active! Complete sponsor verification to unlock 4K masters.',
  telegramChannelUrl: 'https://t.me/virallinkhub_official',
  forceJoinChannel: false,
  isMaintenanceBypassAllowed: true,
};

// Global in-memory singleton to persist through HMR / serverless function invocations
declare global {
  var __VIRAL_HUB_DB__: {
    videos: IVideo[];
    settings: ISettings;
    activeSessions: Map<string, number>; // userId -> timestamp
    uniqueVisitors: Set<string>;
    totalViews: number;
    adClicks: number;
    auditLogs: IVisitorLog[];
  } | undefined;
}

if (!global.__VIRAL_HUB_DB__) {
  const visitorsSet = new Set<string>();
  // Pre-populate with realistic Telegram users
  for (let i = 1; i <= 1240; i++) {
    visitorsSet.add(`tg_${10000000 + i}`);
  }

  const initialLogs: IVisitorLog[] = [
    {
      id: 'log-1',
      userId: '108492041',
      ip: '194.26.29.112',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) Telegram/10.8',
      path: '/api/v1/movies',
      timestamp: new Date(Date.now() - 45000).toISOString(),
    },
    {
      id: 'log-2',
      userId: '593810294',
      ip: '82.165.197.1',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) Telegram/10.9.1',
      path: '/api/v1/movies/vid-neon-protocol-4k/click-ad',
      timestamp: new Date(Date.now() - 90000).toISOString(),
    },
    {
      id: 'log-3',
      userId: '849201948',
      ip: '45.134.140.23',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Telegram/10.9.2',
      path: '/api/v1/analytics/ping',
      timestamp: new Date(Date.now() - 145000).toISOString(),
    },
  ];

  const sessions = new Map<string, number>();
  sessions.set('tg_108492041', Date.now() - 30000);
  sessions.set('tg_593810294', Date.now() - 75000);
  sessions.set('tg_849201948', Date.now() - 120000);

  global.__VIRAL_HUB_DB__ = {
    videos: [...initialVideos],
    settings: { ...initialSettings },
    activeSessions: sessions,
    uniqueVisitors: visitorsSet,
    totalViews: 84320,
    adClicks: 14290,
    auditLogs: initialLogs,
  };
}

export const dbStore = global.__VIRAL_HUB_DB__;

// Helper getters and mutators
export const getVideos = () => dbStore.videos;

export const getVideoById = (id: string) => dbStore.videos.find((v) => v._id === id);

export const addVideo = (videoData: Omit<IVideo, '_id' | 'createdAt' | 'updatedAt' | 'viewsCount'>) => {
  const stream = videoData.streamUrl || videoData.targetLink || 'https://fastcdn.stream/v/sample';
  const newVideo: IVideo = {
    ...videoData,
    _id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    streamUrl: stream,
    serverUrl: stream,
    hdSourceUrl: stream,
    targetLink: stream,
    bannerGifUrl: videoData.bannerGifUrl || videoData.posterUrl,
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  dbStore.videos.unshift(newVideo);
  return newVideo;
};

export const updateVideo = (id: string, updates: Partial<IVideo>) => {
  const index = dbStore.videos.findIndex((v) => v._id === id);
  if (index === -1) return null;
  const stream = updates.streamUrl || updates.targetLink || dbStore.videos[index].streamUrl;
  dbStore.videos[index] = {
    ...dbStore.videos[index],
    ...updates,
    streamUrl: stream,
    serverUrl: stream,
    hdSourceUrl: stream,
    targetLink: stream,
    updatedAt: new Date().toISOString(),
  };
  return dbStore.videos[index];
};

export const deleteVideo = (id: string) => {
  const index = dbStore.videos.findIndex((v) => v._id === id);
  if (index === -1) return false;
  dbStore.videos.splice(index, 1);
  return true;
};

export const getSettings = () => dbStore.settings;

export const updateSettings = (updates: Partial<ISettings>) => {
  dbStore.settings = {
    ...dbStore.settings,
    ...updates,
    appName: 'VIRAL LINK HUB',
  };
  return dbStore.settings;
};

export const incrementVideoViews = (id: string) => {
  const video = dbStore.videos.find((v) => v._id === id);
  if (video) {
    video.viewsCount = (video.viewsCount || 0) + 1;
    dbStore.totalViews += 1;
    return video.viewsCount;
  }
  return 0;
};
