# VIRAL LINK HUB - Backend API & Telegram Mini App Architecture

Production-grade Node.js, Express, and MongoDB backend paired with a Netflix-style Telegram Mini App frontend for high-speed Terabox link monetization and real-time visitor analytics.

---

## 1. Database Collections (MongoDB Schemas)

### Video Collection (`/server/models/Video.js`)
- `title` (String, required, indexed)
- `description` (String)
- `posterUrl` (String, required)
- `bannerUrl` (String)
- `category` (String, enum: `['Trending', 'Terabox Cloud', 'Action', 'Viral Clips', 'Anime', 'Web Series', 'VIP Exclusive']`)
- `targetLink` (String, required, Terabox or direct video URL)
- `targetType` (String, enum: `['terabox', 'direct_stream', 'cloud_drive', 'magnet', 'external']`)
- `directAdLink` (String, custom CPM direct link)
- `requiredAdsCount` (Number, default 2)
- `viewsCount` (Number, default 0)
- `isFeatured` (Boolean, default false)
- `fileSize` (String, e.g. "1.8 GB")
- `quality` (String, e.g. "4K Ultra HD")
- `tags` ([String])
- `timestamps` (`createdAt`, `updatedAt`)

### Analytics Collection (`/server/models/Analytics.js`)
- `key`: "global_metrics"
- `totalVisitors`: Total unique Telegram User IDs that have accessed the app
- `totalViews`: Total request and video views registered
- `activeUsers`: Snapshot of active users in the last 5 minutes
- `adClicks`: Total CPM sponsor verification clicks
- `uniqueUserIds`: Array of unique Telegram user IDs
- `recentLogs`: Array of recent `{ userId, ip, userAgent, path, timestamp }`

### Settings Collection (`/server/models/Settings.js`)
- `appName`: "VIRAL LINK HUB"
- `maintenanceMode`: Boolean (default `false`)
- `globalAdLink`: String (Monetag / Adsterra sponsor URL)
- `defaultAdsRequired`: Number (default `2`)
- `announcementBannerText`: String
- `telegramChannelUrl`: String

---

## 2. API Endpoints Specification

### Public & Mini App Endpoints
- `GET /api/v1/app-config` - Returns dynamic app configuration, maintenance mode status, and ad settings.
- `GET /api/v1/movies` - Lists categories and videos with optional query filters (`?category=Action&search=protocol&featured=true`).
- `GET /api/v1/movies/:id` - Returns single video details.
- `POST /api/v1/movies/:id/view` - Increments video `viewsCount` and global page views.
- `POST /api/v1/movies/:id/click-ad` - Tracks ad click and CPM conversion.
- `POST /api/v1/analytics/ping` - Client heartbeat ping recording active sessions for the 5-minute sliding window.

### Admin Endpoints (JWT Bearer Token Required)
- `POST /api/v1/admin/auth/login` - Admin login with username & password (default: `admin` / `virallinkhub2026!`). Returns JWT.
- `GET /api/v1/admin/stats` - Returns Live Active Users (last 5 mins), Total Unique Visitors, Total Views, Ads Revenue Clicks, and recent audit logs.
- `GET /api/v1/admin/settings` - Fetches full dynamic settings.
- `PUT /api/v1/admin/settings` - Updates app name, toggles maintenance mode, changes ad links globally, and adjusts default ads required.
- `GET /api/v1/admin/videos` - Lists all video catalog items.
- `POST /api/v1/admin/videos` - Adds a new video with Terabox link, CPM ad link, and required ad steps.
- `PUT /api/v1/admin/videos/:id` - Updates an existing video.
- `DELETE /api/v1/admin/videos/:id` - Deletes a video.

---

## 3. Real-Time & Total Visitor Analytics Engine

- **Telegram `initData` Logging**: Middleware (`/server/middlewares/telegramAuth.js` and `/lib/extract-client.ts`) parses the Telegram `initData` query string on every request, extracts the user profile (`id`, `first_name`, `username`), checks the HMAC-SHA256 signature against `TELEGRAM_BOT_TOKEN`, captures IP and User-Agent, and writes an audit log entry.
- **5-Minute Sliding Window Active Users**: Active sessions are cached in a sliding window timestamp map. Sessions idle for more than 300,000ms (5 minutes) automatically expire.
- **Unique Visitor Count**: Telegram user IDs are stored in a persistent deduplicated set.
- **Heartbeat Heart**: The Telegram Mini App client pings `/api/v1/analytics/ping` every 30 seconds to maintain real-time status.

---

## 4. Running the Standalone Express Backend

```bash
cd server
npm install
cp ../.env.example .env
npm start
```
The server will start on port `5000` (or `process.env.PORT`).
When running inside Next.js, the exact same endpoints are served on port `3000` via App Router Route Handlers (`/app/api/v1/...`).
