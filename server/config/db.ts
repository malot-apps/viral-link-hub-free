import mongoose from 'mongoose';
mongoose.set('bufferCommands', false);
import { Video } from '../models/Video';
import { Settings } from '../models/Settings';

export const initialSeedVideos = [
  {
    _id: 'vid-neon-protocol-4k',
    title: 'Neon Protocol: Cyber Shadow',
    description: 'A rogue neural net hacker discovers an encrypted corporate conspiracy deep inside the neo-Tokyo megagrid. Features unreleased extended cut and high-bitrate master stream.',
    posterUrl: '/images/hero_viral_cyberpunk.jpg',
    bannerGifUrl: '/images/hero_viral_cyberpunk.jpg',
    category: 'Trending',
    streamUrl: 'https://fastcdn.stream/v/1e9xNeonProtocol4KUltra',
    directAdLink: 'https://monetag.com/direct?zone=78912',
    requiredAdsCount: 2,
    viewsCount: 14820,
    isFeatured: true,
    fileSize: '1.8 GB',
    quality: '4K Ultra HD',
    tags: ['Cyberpunk', 'Sci-Fi', 'Thriller', 'VIP Master'],
  },
  {
    _id: 'vid-shadow-heist-1080p',
    title: 'Shadow Heist: Dark Protocol',
    description: 'A seasoned crew of black-ops specialists plan the impossible infiltration of a sovereign underground vault in Geneva.',
    posterUrl: '/images/movie_action_heist.jpg',
    bannerGifUrl: '/images/movie_action_heist.jpg',
    category: 'Action',
    streamUrl: 'https://fastcdn.stream/v/1m8xShadowHeist1080p',
    directAdLink: 'https://adsterra.com/direct?zone=55219',
    requiredAdsCount: 2,
    viewsCount: 29400,
    isFeatured: false,
    fileSize: '1.4 GB',
    quality: '1080p HD',
    tags: ['Action', 'Heist', 'Crime', 'Full Movie'],
  },
  {
    _id: 'vid-celestial-blade-anime',
    title: 'Celestial Blade: Sovereign Chronicle',
    description: 'An ancient wandering warrior awakens a constellation blade to defend the broken kingdom from falling deities. Full 12-episode batch file.',
    posterUrl: '/images/movie_anime_fantasy.jpg',
    bannerGifUrl: '/images/movie_anime_fantasy.jpg',
    category: 'Anime',
    streamUrl: 'https://fastcdn.stream/v/1p0xCelestialBladeEp01-12',
    directAdLink: '',
    requiredAdsCount: 1,
    viewsCount: 42100,
    isFeatured: false,
    fileSize: '2.4 GB',
    quality: '1080p Dual Audio',
    tags: ['Anime', 'Fantasy', 'Action', 'Batch Download'],
  },
  {
    _id: 'vid-dark-net-docu',
    title: 'The Dark Net Syndicate: Exposed',
    description: 'Investigative documentary deep dive into covert offshore server clusters, zero-day exploit markets, and encrypted data leaks.',
    posterUrl: '/images/movie_viral_documentary.jpg',
    bannerGifUrl: '/images/movie_viral_documentary.jpg',
    category: 'Viral Clips',
    streamUrl: 'https://fastcdn.stream/v/1k2xDarkNetDocuFullLeak',
    directAdLink: '',
    requiredAdsCount: 2,
    viewsCount: 63800,
    isFeatured: false,
    fileSize: '950 MB',
    quality: '1080p HD',
    tags: ['Documentary', 'Viral Leak', 'Tech', 'FastCDN'],
  },
  {
    _id: 'vid-apex-velocity',
    title: 'Apex Extraction: Velocity',
    description: 'Fast-paced tactical survival through an abandoned high-security exclusion zone. Direct high-speed multi-mirror CDN stream.',
    posterUrl: '/images/movie_action_heist.jpg',
    bannerGifUrl: '/images/movie_action_heist.jpg',
    category: 'VIP Cloud',
    streamUrl: 'https://fastcdn.stream/v/1z4xApexVelocityDirectSpeed',
    directAdLink: 'https://monetag.com/direct?zone=78912',
    requiredAdsCount: 2,
    viewsCount: 18950,
    isFeatured: false,
    fileSize: '1.6 GB',
    quality: '1080p 60fps',
    tags: ['Action', 'Survival', 'High Speed', 'FastCDN'],
  },
  {
    _id: 'vid-quantum-horizon',
    title: 'Quantum Horizon: Interstellar Genesis',
    description: 'Deep-space exploration mission crosses an unmapped gravitational horizon into an ancient Dyson sphere network.',
    posterUrl: '/images/hero_viral_cyberpunk.jpg',
    bannerGifUrl: '/images/hero_viral_cyberpunk.jpg',
    category: 'Trending',
    streamUrl: 'https://fastcdn.stream/v/1q9xQuantumHorizonSciFiFull',
    directAdLink: 'https://monetag.com/direct?zone=78912',
    requiredAdsCount: 2,
    viewsCount: 35120,
    isFeatured: false,
    fileSize: '2.1 GB',
    quality: '4K HDR',
    tags: ['Sci-Fi', 'Space', 'Dyson Sphere'],
  },
];

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // In environments without external MongoDB URI configured, gracefully operate
    return null;
  }

  if (isConnected) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);

    // Seed defaults if collection is empty
    const videoCount = await Video.countDocuments();
    if (videoCount === 0) {
      await Video.insertMany(initialSeedVideos);
      console.log(`[MongoDB] Seeded ${initialSeedVideos.length} initial videos`);
    }

    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        appName: 'VIRAL LINK HUB',
        maintenanceMode: false,
        globalAdLink: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
        defaultAdsRequired: 2,
        announcementBannerText: '🚀 High-Speed Direct Cloud Streams active! Complete sponsor verification to unlock.',
      });
      console.log('[MongoDB] Seeded default system settings');
    }

    return conn;
  } catch (err) {
    console.warn('[MongoDB] Connection failed, continuing with resilient memory store:', err);
    return null;
  }
}
