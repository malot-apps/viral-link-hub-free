/**
 * VIRAL LINK HUB - Production Express Backend Server
 * Telegram Mini App API & Real-time Analytics Engine
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const structuredLogger = require('./middlewares/logger');
const { telegramAuthMiddleware } = require('./middlewares/telegramAuth');
const analyticsService = require('./services/analyticsService');
const v1Routes = require('./routes/v1');
const Video = require('./models/Video');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-init-data'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Structured Request Logger
app.use(structuredLogger);

// Global Telegram InitData & Visitor Logging Middleware (runs on all incoming requests)
app.use(telegramAuthMiddleware);

// API v1 Routes
app.use('/api/v1', v1Routes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'VIRAL LINK HUB API',
    tagline: 'Netflix-Style Telegram Mini App & Terabox Monetization Backend',
    version: '1.0.0',
    endpoints: {
      appConfig: 'GET /api/v1/app-config',
      movies: 'GET /api/v1/movies',
      ping: 'POST /api/v1/analytics/ping',
      adminStats: 'GET /api/v1/admin/stats',
    },
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Database Connection & Server Initialization
const startServer = async () => {
  try {
    await connectDB();
    await analyticsService.initFromDB();

    // Ensure default settings exist
    await Settings.getSettings();

    // Check if initial videos seed is needed
    const count = await Video.countDocuments();
    if (count === 0) {
      console.log('[Seed] Seeding initial viral movies catalog...');
      await Video.create([
        {
          title: 'Neon Protocol: Cyber Shadow',
          description: 'A rogue neural net hacker discovers an encrypted corporate conspiracy deep inside the neo-Tokyo megagrid.',
          posterUrl: '/images/hero_viral_cyberpunk.jpg',
          bannerUrl: '/images/hero_viral_cyberpunk.jpg',
          category: 'Trending',
          targetLink: 'https://terabox.app/s/1e9xNeonProtocol4KUltra',
          targetType: 'terabox',
          directAdLink: 'https://monetag.com/direct?zone=78912',
          requiredAdsCount: 2,
          viewsCount: 14820,
          isFeatured: true,
          fileSize: '1.8 GB',
          quality: '4K Ultra HD',
          tags: ['Cyberpunk', 'Sci-Fi', 'Thriller', 'Terabox Exclusive'],
        },
        {
          title: 'Shadow Heist: Dark Protocol',
          description: 'A seasoned crew of black-ops specialists plan the impossible infiltration of a sovereign underground vault.',
          posterUrl: '/images/movie_action_heist.jpg',
          bannerUrl: '/images/movie_action_heist.jpg',
          category: 'Action',
          targetLink: 'https://terabox.app/s/1m8xShadowHeist1080p',
          targetType: 'terabox',
          directAdLink: 'https://adsterra.com/direct?zone=55219',
          requiredAdsCount: 2,
          viewsCount: 29400,
          isFeatured: false,
          fileSize: '1.4 GB',
          quality: '1080p HD',
          tags: ['Action', 'Heist', 'Crime', 'Full Movie'],
        },
        {
          title: 'Celestial Blade: Sovereign Chronicle',
          description: 'An ancient wandering warrior awakens a constellation blade to defend the broken kingdom from falling deities.',
          posterUrl: '/images/movie_anime_fantasy.jpg',
          bannerUrl: '/images/movie_anime_fantasy.jpg',
          category: 'Anime',
          targetLink: 'https://terabox.app/s/1p0xCelestialBladeEp01-12',
          targetType: 'terabox',
          directAdLink: '',
          requiredAdsCount: 1,
          viewsCount: 42100,
          isFeatured: false,
          fileSize: '2.4 GB',
          quality: '1080p Uncensored',
          tags: ['Anime', 'Fantasy', 'Action', 'Batch Download'],
        },
        {
          title: 'The Dark Net Syndicate: Exposed',
          description: 'Investigative documentary deep dive into covert offshore server clusters and encrypted data leaks.',
          posterUrl: '/images/movie_viral_documentary.jpg',
          bannerUrl: '/images/movie_viral_documentary.jpg',
          category: 'Viral Clips',
          targetLink: 'https://terabox.app/s/1k2xDarkNetDocuFullLeak',
          targetType: 'terabox',
          directAdLink: '',
          requiredAdsCount: 2,
          viewsCount: 63800,
          isFeatured: false,
          fileSize: '950 MB',
          quality: '1080p HD',
          tags: ['Documentary', 'Viral Leak', 'Tech', 'Terabox'],
        },
      ]);
      console.log('[Seed] Default movies created.');
    }

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` VIRAL LINK HUB - Backend Server Running`);
      console.log(` Port: ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Real-time analytics sliding window: 5 minutes`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
