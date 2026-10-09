# 🎬 VIRAL LINK HUB — Next.js 15 & Supabase Streaming Portal & Telegram Mini App

[![Next.js 15](https://img.shields.io/badge/Next.js-15.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Telegram WebApp](https://img.shields.io/badge/Telegram_Mini_App-SDK_v8.0-26A5E4?style=for-the-badge&logo=telegram)](https://core.telegram.org/bots/webapps)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_RLS-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deploy_Free-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Monetization](https://img.shields.io/badge/Monetization-Monetag_%26_Adsterra-FF5722?style=for-the-badge)](https://monetag.com/)

**VIRAL LINK HUB** is a production-grade, full-stack video streaming portal and Telegram Mini App engineered for maximum ad CPM conversion, viral referral distribution, and high-speed cloud stream delivery. 

Built with **Next.js 15 (App Router)**, **Tailwind CSS v4**, **TypeScript**, and **Supabase (PostgreSQL with Row Level Security)**, the application operates in two distinct modes: a cinematic consumer-facing Netflix-style streaming experience for visitors and Telegram users, and an enterprise Executive Administration Operations Dashboard for site owners.

---

## 📑 Table of Contents

1. [Overview & Key Features](#-overview--key-features)
2. [Platform Architecture](#-platform-architecture)
3. [Repository File Structure](#-repository-file-structure)
4. [Visitor App Experience](#-visitor-app-experience)
5. [Executive Admin Dashboard](#-executive-admin-dashboard)
6. [Complete API Routes Reference](#-complete-api-routes-reference)
7. [Supabase Setup & Database Schema](#-supabase-setup--database-schema)
8. [Environment Variables](#-environment-variables)
9. [Authentication & Security Architecture](#-authentication--security-architecture)
10. [Telegram Mini App & Bot Integration](#-telegram-mini-app--bot-integration)
11. [Monetization & Ad Architecture](#-monetization--ad-architecture)
12. [Viral Referral & VIP Premium Reward System](#-viral-referral--vip-premium-reward-system)
13. [Telemetry & Analytics Engine](#-telemetry--analytics-engine)
14. [Local Development](#-local-development)
15. [Production Deployment (Vercel + Supabase)](#-production-deployment-vercel--supabase)
16. [Troubleshooting & FAQs](#-troubleshooting--faqs)
17. [Production Pre-Flight Checklist](#-production-pre-flight-checklist)
18. [Developer Guide](#-developer-guide)
19. [বাংলা সেটআপ গাইড (Bengali Setup Guide)](#-বাংলা-সেটআপ-গাইড-bengali-setup-guide)

---

## ✨ Overview & Key Features

- **Cinematic Visitor UI**: Pitch-black Netflix theme (`#0b0d13` / `#e50914`), animated hero carousel with auto-playing video/GIF backdrops, category filtering, search, and responsive mobile bottom navigation.
- **Strict Destination Masking**: Internal proxy streaming endpoints mask direct cloud and external file hosts so users never see raw host URLs (such as TeraBox or direct cloud mirrors).
- **Stepped Ad Monetization**: Multi-step direct sponsor ad unlocks with customizable required ad counts (e.g. 2 or 3 sponsor views), cooldown timers, anti-cheat click verification, sticky banners, and initial session popunders.
- **Mandatory Anti-Bot Telegram Channel Gate**: Configurable channel membership popup requiring visitors to join your official Telegram channel before streaming access is granted.
- **Viral Referral & VIP Premium System**: Built-in 24-hour VIP pass unlocking all streams with zero ads when a visitor completes sponsor tasks and refers 3 active users.
- **Executive Admin Console**: Secure dashboard with live visitor telemetry (5-minute sliding session window), full Video Catalog CRUD with animated GIF/poster previews, remote monetization settings, growth analytics, and tamper-evident audit logs.
- **Serverless PostgreSQL Database**: Authoritative data layer powered by Supabase PostgreSQL with strict Row Level Security (RLS) policies.
- **Dual Runtime Support**: Operates in `APP_MODE=production` against Supabase, or in `APP_MODE=demo` with isolated sample memory catalogs for zero-config preview environments.

---

## 🏛 Platform Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VIRAL LINK HUB ARCHITECTURE                     │
├───────────────────────────────────┬────────────────────────────────────┤
│ 🎬 VISITOR APPLICATION            │ 🛠️ EXECUTIVE ADMIN PORTAL          │
│ Routes: / (Home)                  │ Route: /admin                      │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Responsive Next.js App Router   │ • HttpOnly Cookie + JWT Session    │
│ • Telegram WebApp SDK v8.0        │ • Timing-safe Password Auth        │
│ • Auto-Playing Hero Streaming GIF │ • Live Active Visitors (5m sliding)│
│ • Fast Category & Keyword Search  │ • Video CRUD + GIF Banner Upload   │
│ • Ad-Gate Unlock Countdown        │ • Monetization & Direct Ad Links   │
│ • Mandatory Channel Join Gate     │ • Channel Join Enforcement Toggle  │
│ • 24h VIP Ad-Free Pass Claim      │ • Tamper-evident Audit Trail       │
│ • Silent 30s Heartbeat Telemetry  │ • Diagnostic API Tester Console    │
└───────────────────────────────────┴────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│             NEXT.JS 15 ROUTE HANDLERS (/api/v1/*)                      │
│ Public APIs: /app-config, /movies, /analytics, /user, /premium, /bot   │
│ Admin APIs:  /admin/auth/*, /admin/videos, /admin/settings, /stats     │
└────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SUPABASE POSTGRESQL (DATABASE LAYER)                 │
│ Public Anon Access: SELECT (videos, settings, users), INSERT (events)  │
│ Service Role Privileged: Full CRUD on all 8 tables                     │
│ Tables: videos, settings, admins, analytics_events, referrals,         │
│         premium_rewards, audit_logs, users                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository File Structure

```text
├── app/
│   ├── admin/
│   │   ├── layout.tsx             # Admin metadata & container layout
│   │   └── page.tsx               # Admin operations page (mounts AdminDashboard)
│   ├── api/
│   │   └── v1/
│   │       ├── admin/
│   │       │   ├── audit-logs/    # GET admin audit trails
│   │       │   ├── auth/
│   │       │   │   ├── login/     # POST admin login (HttpOnly cookie)
│   │       │   │   ├── logout/    # POST admin session termination
│   │       │   │   └── me/        # GET admin session verification
│   │       │   ├── growth/        # GET referral & funnel growth metrics
│   │       │   ├── settings/      # GET / PUT platform & monetization config
│   │       │   ├── stats/         # GET aggregated dashboard stats & telemetry
│   │       │   └── videos/        # GET / POST video catalog items
│   │       │       └── [id]/      # GET / PUT / DELETE single video
│   │       ├── analytics/
│   │       │   ├── ad-click/      # POST sponsor ad click tracking
│   │       │   ├── ad-event/      # POST impression, click, unlock event ingestion
│   │       │   ├── ping/          # POST / GET 30s sliding-window session heartbeat
│   │       │   └── share/         # POST viral share click tracker
│   │       ├── app-config/        # GET public sanitized configuration & ad links
│   │       ├── movies/
│   │       │   ├── route.ts       # GET public video catalog with link masking
│   │       │   └── [id]/
│   │       │       ├── route.ts   # GET single movie details
│   │       │       ├── click-ad/  # POST record sponsor ad click on movie
│   │       │       └── view/      # POST increment verified view count
│   │       ├── premium/
│   │       │   └── claim/         # POST claim 24h VIP ad-free reward
│   │       ├── referrals/
│   │       │   └── leaderboard/   # GET top referrers ranking
│   │       ├── telegram/
│   │       │   └── bot/           # POST / GET Telegram bot webhook (/start handler)
│   │       └── user/
│   │           ├── profile/       # GET Telegram user profile, referrals, & VIP status
│   │           └── sync/          # POST sync Telegram WebApp initData user profile
│   ├── globals.css                # Tailwind CSS v4 directives & styling
│   ├── layout.tsx                 # Root layout with Telegram WebApp script
│   ├── not-found.tsx              # Clean 404 handler
│   └── page.tsx                   # Public streaming home page
├── components/
│   ├── AdminDashboard.tsx         # Complete admin dashboard with tabs & diagnostics
│   ├── AdminGrowthTab.tsx         # Viral funnel, referral leaderboard, & VIP passes
│   ├── AnnouncementBanner.tsx     # Dynamic announcement bar from settings
│   ├── HeroFeatured.tsx           # Auto-playing GIF/video hero banner carousel
│   ├── MaintenanceScreen.tsx      # Full-page maintenance mode lockdown screen
│   ├── MobileBottomNav.tsx        # Fixed mobile navigation bar for Telegram WebApp
│   ├── Navbar.tsx                 # Public header with search, categories, & Telegram ID
│   ├── PremiumRewardModal.tsx     # VIP 24h pass progress & unlock modal
│   ├── ShareModal.tsx             # One-click Telegram viral referral share modal
│   ├── TelegramUserSelector.tsx   # Telegram WebApp profile indicator & simulation
│   ├── UnlockModal.tsx            # Stepped ad gate modal with 5-second countdown timer
│   └── VideoRow.tsx               # Responsive video grid cards with hover animations
├── lib/
│   ├── admin-auth.ts              # Constant-time password validation & JWT session cookie
│   ├── config.ts                  # Centralized config, safety gates, & AppMode gating
│   ├── data-service.ts            # Supabase PostgreSQL data layer & demo fallback
│   ├── demo-store.ts              # In-memory demo store for zero-config preview mode
│   ├── rate-limit.ts              # In-memory IP rate limiter for brute-force protection
│   ├── security.ts                # Timing-safe comparison & security helpers
│   ├── supabase.ts                # Supabase browser & service role admin clients
│   ├── telegram-verify.ts         # Telegram WebApp initData HMAC verification
│   ├── types.ts                   # Authoritative TypeScript data interfaces
│   └── utils.ts                   # Utility functions (cn class merging)
├── public/
│   ├── images/                    # Local movie posters & GIF backdrop assets
│   └── viral-link-hub.html        # Legacy static preview asset
├── scripts/
│   ├── test-architecture.mjs      # Comprehensive automated API architecture test suite
│   └── test-supabase-connection.mjs # Supabase configuration & connection tester
├── next.config.ts                 # Next.js standalone build & image domains config
├── package.json                   # Dependencies, scripts, and runtime engines
├── supabase-schema.sql            # Authoritative PostgreSQL schema, indexes, & RLS policies
└── tsconfig.json                  # Strict TypeScript configuration
```

---

## 🎬 Visitor App Experience

The visitor interface (`/`) is optimized for mobile touchscreens and desktop viewports:

1. **Auto-Playing Hero Banner**: Loops high-frame-rate animated video/GIF streaming backdrops with title typography, tags, quality badges (`4K Ultra HD`, `Dolby 5.1`), and a glowing `"Play Stream"` call-to-action.
2. **Instant Search & Category Filtering**: Real-time filtering across genres including `Trending`, `Action`, `Anime`, `Sci-Fi`, and `Documentaries`.
3. **Link Masking Engine**: Internal destination URLs are displayed as high-speed streaming proxies (`https://fastcdn.stream/v/...`). External download or cloud hosting names are completely hidden from the visitor.
4. **Mandatory Channel Join Modal**: If enabled by the admin, prompts visitors to join the official Telegram channel with an anti-bot justification before video access is unlocked.
5. **Stepped Ad Gate**: Clicking to stream opens an interactive modal showing progress (e.g. `Ad 1 of 2`). Visitors complete the required sponsor links with a mandatory 5-second countdown timer before receiving direct access to the stream.
6. **Mobile Bottom Navigation**: Dedicated bar providing instant access to Home, Search, Trending, and the VIP Rewards modal.

---

## 🛠️ Executive Admin Dashboard

Accessible at `/admin`:

- **Real-Time Analytics Tab**:
  - Live Active Visitors (sliding 5-minute window).
  - Lifetime Unique Visitors (deduplicated Telegram IDs).
  - Total Video Views across the catalog.
  - Total Sponsor Ad Unlocks & conversion rate.
  - Hourly & daily engagement bar charts.
- **Growth & Referral Tab**:
  - Top referrers leaderboard with total invited users and qualified users.
  - Active 24-hour VIP pass tracking.
  - Referral acquisition funnel conversion metrics.
- **Video Catalog Management (CRUD)**:
  - Create new videos with Title, Description, Category, Poster URL, Banner/GIF URL, Stream URL, Direct Sponsor Link, Required Ads Count (0–6), Resolution, and Tags.
  - Edit existing entries with real-time preview.
  - Delete entries with confirmation modals and audit logging.
- **Monetization & Settings Tab**:
  - Site App Name & Announcement Banner text.
  - 1-Click Maintenance Mode kill-switch.
  - Primary & Secondary Fallback Direct Sponsor Ad Smartlinks.
  - Global Default Required Ads count slider.
  - Official Telegram Channel URL and Force Channel Join toggle.
- **Tamper-Evident Audit Trail**:
  - Logs all administrator logins, video creations, updates, deletions, and settings modifications with administrative username, action type, IP address, and timestamp.
- **System Diagnostics Console**:
  - Interactive API route runner testing `/api/v1/app-config`, `/api/v1/movies`, `/api/v1/admin/stats`, and database connectivity directly in the UI.

---

## 📡 Complete API Routes Reference

All endpoints are built using Next.js 15 Route Handlers and return standardized JSON responses:

### 1. Public Visitor Endpoints

| Method | Endpoint | Description | Query / Body Parameters |
|:---|:---|:---|:---|
| `GET` | `/api/v1/app-config` | Public sanitized configuration | None |
| `GET` | `/api/v1/movies` | Filterable video catalog with masked links | `?category=Action&search=Cyber&featured=true` |
| `GET` | `/api/v1/movies/:id` | Single movie metadata | None |
| `POST`| `/api/v1/movies/:id/view` | Increments verified view count | None |
| `POST`| `/api/v1/movies/:id/click-ad`| Logs sponsor ad click on movie | None |
| `GET` | `/api/v1/telegram/destinations` | Active Telegram channels, groups, & bots | `?platform=website` or `?platform=miniapp` |
| `POST`| `/api/v1/telegram/verify-membership` | Server-side getChatMember membership check | `{ "destinationId": "...", "userId": "..." }` |
| `POST`| `/api/v1/analytics/ping` | 30s heartbeat tracking active sessions | Body: `{ "userId": "108492041" }` |
| `POST`| `/api/v1/analytics/ad-event` | Tracks impression, click, unlock events | Body: `{ "event": "ad_click", "userId": "..." }` |
| `POST`| `/api/v1/analytics/ad-click` | Legacy ad click tracker | Body: `{ "userId": "..." }` |
| `POST`| `/api/v1/analytics/share` | Tracks viral share actions | Body: `{ "userId": "...", "platform": "telegram" }` |
| `POST`| `/api/v1/user/sync` | Syncs Telegram WebApp user profile | Body: `{ "user": { "id": 123, "first_name": "..." } }` |
| `GET` | `/api/v1/user/profile` | Fetches user profile, referrals, & VIP status | `?userId=123456789` |
| `POST`| `/api/v1/premium/claim` | Claims 24-hour VIP ad-free pass | Body: `{ "userId": "123456789" }` |
| `GET` | `/api/v1/referrals/leaderboard` | Top referrers ranking list | `?limit=10` |
| `POST`| `/api/v1/telegram/bot` | Telegram bot webhook (/start handler) | Telegram Update JSON payload |

### 2. Protected Admin Endpoints

Protected via `vlh_admin_session` HttpOnly cookie or `Authorization: Bearer <token>`:

| Method | Endpoint | Description | Body / Payload |
|:---|:---|:---|:---|
| `POST` | `/api/v1/admin/auth/login` | Authenticates admin & sets HttpOnly cookie | `{ "username": "admin", "password": "..." }` |
| `POST` | `/api/v1/admin/auth/logout`| Clears authentication session cookie | None |
| `GET`  | `/api/v1/admin/auth/me` | Validates session token & returns admin user | None |
| `GET`  | `/api/v1/admin/stats` | Live active users, views, visitors, ad clicks | None |
| `GET`  | `/api/v1/admin/growth` | Referral funnel, conversion rates, VIP passes | `?period=30d` |
| `GET`  | `/api/v1/admin/destinations` | List all Telegram channels, groups, bots | None |
| `POST` | `/api/v1/admin/destinations` | Create a new Telegram destination | Destination JSON payload |
| `PUT`  | `/api/v1/admin/destinations/:id` | Update an existing destination | Partial destination updates |
| `DELETE`| `/api/v1/admin/destinations/:id`| Delete destination from database | None |
| `POST` | `/api/v1/admin/destinations/reorder` | Update display order of destinations | `{ "orderedIds": ["..."] }` |
| `GET`  | `/api/v1/admin/settings` | Retrieves administrative platform config | None |
| `PUT`  | `/api/v1/admin/settings` | Updates ad links, channel rules, intro hero | `{ "globalAdLink": "...", ... }` |
| `GET`  | `/api/v1/admin/videos` | Full video catalog (unmasked stream URLs) | `?search=...` |
| `POST` | `/api/v1/admin/videos` | Creates a new video entry | `{ "title": "...", "streamUrl": "...", ... }` |
| `PUT`  | `/api/v1/admin/videos/:id` | Updates an existing video entry | `{ "title": "Updated", ... }` |
| `DELETE`| `/api/v1/admin/videos/:id`| Permanently deletes a video from database | None |
| `GET`  | `/api/v1/admin/audit-logs` | Tamper-evident admin audit history | `?limit=50` |

---

## 🗄️ Supabase Setup & Database Schema

The database runs on **PostgreSQL** via Supabase. All schemas, triggers, initial seed data, and Row Level Security policies are located in `supabase-schema.sql`.

### The 8 Tables

1. **`videos`**:
   - `id` (UUID PRIMARY KEY)
   - `title`, `description`, `poster_url`, `banner_url`, `category`, `stream_url`, `target_link`, `direct_ad_link`
   - `required_ads_count` (INTEGER, default 2)
   - `quality`, `file_size`, `tags` (TEXT[])
   - `views_count` (BIGINT, default 0)
   - `is_featured` (BOOLEAN, default false)
   - `created_at`, `updated_at` (TIMESTAMPTZ)
2. **`settings`**:
   - Singleton row (`id = 1`) storing app name, maintenance mode, announcement banner, ad smartlinks, required ad counts, Telegram channel URLs, and premium reward criteria.
3. **`admins`**:
   - `id` (UUID), `username` (UNIQUE), `password_hash`, `role`, `created_at`.
4. **`analytics_events`**:
   - Event log recording `event`, `user_id`, `content_id`, `placement`, `metadata` (JSONB), and `created_at`.
5. **`referrals`**:
   - Tracks viral invites: `referrer_id`, `referred_user_id` (UNIQUE), `referral_code`, `status` (`pending` | `qualified`), `qualified_at`.
6. **`premium_rewards`**:
   - 24-hour VIP access passes: `user_id`, `duration_hours`, `claimed_at`, `expires_at`, `status` (`active` | `expired`).
7. **`audit_logs`**:
   - Security audit trails: `admin`, `action`, `target`, `ip`, `user_agent`, `metadata` (JSONB), `created_at`.
8. **`users`**:
   - Telegram user profiles: `telegram_user_id` (PRIMARY KEY), `username`, `first_name`, `referral_code` (UNIQUE), `ad_actions_completed`, `premium_until`.

### How to Initialize in Supabase

1. Create a free account at [supabase.com](https://supabase.com) and create a new project.
2. In your Supabase Dashboard, navigate to **SQL Editor**.
3. Open `supabase-schema.sql` from this repository, paste the entire content, and click **Run**.
4. All tables, performance indexes, Row Level Security policies, and starter movies will be created instantly.
5. In your Supabase Dashboard, go to **Project Settings -> API** and copy:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (keep secret; used by Next.js server APIs)

---

## 🔑 Environment Variables

Configure these variables in your `.env.local` file or in your hosting provider's settings (e.g. Vercel):

```env
# =============================================================================
# SUPABASE CONFIGURATION (PostgreSQL Database)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# =============================================================================
# ADMIN AUTHENTICATION (ENV-based)
# =============================================================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_SESSION_SECRET=your_random_32_character_session_secret

# =============================================================================
# APPLICATION MODE
# =============================================================================
# 'production' = Uses real Supabase database only (strict safety gates)
# 'demo'       = Runs in preview mode with simulated in-memory catalog
APP_MODE=production

# =============================================================================
# TELEGRAM BOT INTEGRATION (Optional)
# =============================================================================
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRstuVWXyz
TELEGRAM_CHANNEL_ID=@virallinkhub_official

# =============================================================================
# DEPLOYMENT URL & ORIGIN CHECKS (Optional)
# =============================================================================
APP_URL=https://your-domain.vercel.app
ADMIN_ALLOWED_ORIGIN=https://your-domain.vercel.app
```

---

## 🛡️ Authentication & Security Architecture

1. **HttpOnly Session Cookie (`vlh_admin_session`)**:
   - Admin authentication does **not** store JWT tokens or credentials in browser `localStorage`.
   - Successful login generates a signed JWT and issues a secure `Set-Cookie` with `HttpOnly`, `SameSite=Lax`, and `Path=/`.
2. **Timing-Safe Password Validation**:
   - Credential comparison uses `crypto.timingSafeEqual` in `lib/admin-auth.ts` to neutralize timing attack vulnerabilities.
3. **Brute-Force Rate Limiting**:
   - An IP-based rate limiter in `lib/rate-limit.ts` enforces a strict threshold (5 failed attempts per 15-minute window) on `/api/v1/admin/auth/login`.
4. **Production Fail-Closed Safety Gate**:
   - In `APP_MODE=production`, if Supabase credentials or admin secrets are absent, the application refuses to boot into unauthenticated or insecure states.
5. **Destination Masking**:
   - Sensitive streaming source URLs are filtered out from public `/api/v1/movies` responses and replaced with internal fastCDN streaming handles.
6. **Row Level Security (RLS)**:
   - PostgreSQL policies enforce that public anonymous users can only read content catalogs and insert analytics events. Administrative updates require service-role permissions.

---

## 🤖 Telegram Mini App & Bot Integration

### Setting Up via @BotFather

1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Create a new bot by sending `/newbot`. Enter your bot display name and a unique username (e.g. `ViralLinkHubBot`).
3. Note the HTTP API Token provided and set it as `TELEGRAM_BOT_TOKEN`.
4. Configure the Telegram Mini App by sending:
   ```text
   /newapp
   ```
5. Select your newly created bot.
6. Enter the requested app details:
   - **Title**: `VIRAL LINK HUB`
   - **Description**: `Watch 4K HD Viral Movies & Cloud Streams`
   - **Photo**: Upload a 640x640 poster image.
   - **Web App URL**: Enter your production deployment URL (e.g. `https://your-app.vercel.app`).
   - **Short Name**: `hub`
7. Set the Menu Button so visitors can launch your Mini App in 1 tap:
   - Send `/setmenubutton` to @BotFather.
   - Select your bot.
   - Enter button text: `🎬 Open VIRAL HUB`
   - Enter WebApp URL: `https://your-app.vercel.app`
8. (Optional) Set up the Telegram Webhook for `/start` referral attribution:
   - Call the Telegram webhook setup endpoint:
     ```bash
     curl -F "url=https://your-app.vercel.app/api/v1/telegram/bot" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
     ```

---

## 💰 Monetization & Ad Architecture

The platform supports direct CPM ad formats compatible with Monetag, Adsterra, PropellerAds, and custom ad networks:

| Placement | Format | Trigger & Behavior | Target Network |
|:---|:---|:---|:---|
| **Initial Touch Popunder** | Full Page Popunder | Fires on the visitor's first touch/click anywhere on the app per session | Monetag / Adsterra Smartlink |
| **Sticky Header Banner** | 320x50 / 468x60 / Native | Anchored at top of catalog | Monetag / Adsterra / Custom script |
| **Sticky Footer Banner** | 320x50 Banner | Anchored at bottom of catalog | Monetag / Adsterra / Custom script |
| **Channel Join Interstitial** | Direct Smartlink | Opens sponsor link before redirecting to the official Telegram channel | Monetag Direct Smartlink |
| **Stream Unlock Gate** | Stepped Ad Counter | 5-second anti-bot countdown per ad click before stream access is granted | Primary & Secondary Direct Links |

Ad links and required click counts can be updated in real time from `/admin` under **Monetization & Settings** without redeploying code.

---

## 🎁 Viral Referral & VIP Premium Reward System

To generate organic referral loops, the app includes a self-serve VIP pass mechanism:

1. **Unique Referral Links**: Every visitor is assigned an invitation code (`ref_<ID>`). Clicking `"Share"` opens the Telegram native share sheet with a pre-filled invitation message.
2. **Server-Side Qualification**: When an invited friend opens the Mini App and completes their first ad interaction, the referral is marked as `qualified`. Self-referrals and duplicate device fingerprints are automatically blocked.
3. **VIP Claim Rule**:
   - Complete 3 sponsor ad actions.
   - Refer 3 qualified friends.
   - Click `"Claim VIP Pass"` to activate 24 hours of ad-free streaming.
4. During active VIP status, all ad counters and popunders are bypassed, giving users direct 1-tap playback.

---

## 📈 Telemetry & Analytics Engine

The platform includes an internal analytics system that does not rely on third-party tracking scripts:

- **Sliding Window Session Tracker**: Visitors send a lightweight 30-second heartbeat to `/api/v1/analytics/ping`. The server aggregates active visitors within a 5-minute sliding window.
- **Event Stream**: Every impression, ad click, stream unlock, and viral share is logged to `analytics_events`.
- **Deduplication**: Visitor metrics are deduplicated by Telegram User ID and hashed client identifiers.

---

## 💻 Local Development

### Prerequisites

- Node.js 18.18+ or 20+
- npm, pnpm, or bun

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/malot-apps/viral-link-hub-free.git
cd viral-link-hub-free
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

For zero-config local testing, the application defaults to `APP_MODE=demo` if Supabase credentials are not set, allowing you to test all UI components and mock APIs immediately.

To connect to your real database, provide your `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the visitor streaming portal, or [http://localhost:3000/admin](http://localhost:3000/admin) for the administrative console.

### 4. Run Automated Test Suite

Run the full architecture test script to verify all public and admin endpoints:

```bash
node scripts/test-architecture.mjs
```

---

## 🚀 Production Deployment (Vercel + Supabase)

### Step 1: Deploy Database on Supabase (100% Free)
1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. In the **SQL Editor**, paste and execute `supabase-schema.sql`.
3. Go to **Settings -> API** and copy your Project URL, publishable key, and service_role key.

### Step 2: Deploy to Vercel (100% Free)
1. Push your repository to your GitHub account.
2. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_USERNAME` (e.g. `admin`)
   - `ADMIN_PASSWORD` (strong password)
   - `ADMIN_SESSION_SECRET` (random 32+ character string)
   - `APP_MODE` (`production`)
   - `TELEGRAM_BOT_TOKEN` (optional)
   - `TELEGRAM_CHANNEL_ID` (optional)
5. Click **Deploy**. Vercel will build the standalone Next.js 15 application.

---

## ❓ Troubleshooting & FAQs

### 1. "Application running in Demo Mode" indicator is shown
- **Cause**: `NEXT_PUBLIC_SUPABASE_URL` is empty or `APP_MODE=demo`.
- **Solution**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` or your Vercel settings and set `APP_MODE=production`.

### 2. Admin login fails with 401 Unauthorized
- **Cause**: The entered password does not match `ADMIN_PASSWORD` in your environment variables.
- **Solution**: Verify the value of `ADMIN_USERNAME` and `ADMIN_PASSWORD` in your deployment environment variables. Note that in demo mode, default credentials are `demo_admin` / `ViralDemo2026!`.

### 3. Telegram WebApp does not expand to full screen
- **Solution**: Ensure your Telegram bot settings in @BotFather have the Mini App configured with the modern WebApp mode. The layout automatically executes `window.Telegram.WebApp.expand()`.

### 4. Supabase error: "new row violates row-level security policy"
- **Solution**: Ensure you are using `SUPABASE_SERVICE_ROLE_KEY` for server-side admin operations in `lib/supabase.ts` and that you ran the complete policy block from `supabase-schema.sql`.

---

## 📋 Production Pre-Flight Checklist

Before launching to live traffic:

- [ ] Executed `supabase-schema.sql` in the Supabase SQL editor.
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Vercel.
- [ ] Changed `ADMIN_USERNAME` and `ADMIN_PASSWORD` from default values.
- [ ] Generated a unique `ADMIN_SESSION_SECRET`.
- [ ] Set `APP_MODE=production`.
- [ ] Configured Monetag / Adsterra direct sponsor links in `/admin`.
- [ ] Tested video playback and stream link masking.
- [ ] Connected Telegram Mini App URL in @BotFather.
- [ ] Ran `node scripts/test-architecture.mjs` with all tests passing.

---

## 👨‍💻 Developer Guide

### Adding New Videos Programmatically

Videos can be added via the Admin Dashboard UI at `/admin` or by making a POST request to `/api/v1/admin/videos`:

```bash
curl -X POST https://your-domain.vercel.app/api/v1/admin/videos \
  -H "Content-Type: application/json" \
  -H "Cookie: vlh_admin_session=<YOUR_JWT_TOKEN>" \
  -d '{
    "title": "Cyberpunk: Edgerunners Special",
    "description": "High-octane anime stream.",
    "posterUrl": "/images/movie_anime_fantasy.jpg",
    "bannerUrl": "/images/movie_anime_fantasy.jpg",
    "category": "Anime",
    "streamUrl": "https://fastcdn.stream/v/sample-stream",
    "directAdLink": "https://monetag.com/direct?zone=78912",
    "requiredAdsCount": 2,
    "quality": "1080p HD",
    "fileSize": "1.2 GB",
    "tags": ["Anime", "Action"],
    "isFeatured": true
  }'
```

---

## 🇧🇩 বাংলা সেটআপ গাইড (Bengali Setup Guide)

### ১. কীভাবে Vercel এবং Supabase দিয়ে সম্পূর্ণ ফ্রিতে হোস্ট করবেন?

1. **GitHub-এ কোড তুলুন**: আপনার GitHub অ্যাকাউন্টে একটি রিপোজিটরি বানিয়ে এই কোডগুলো পুশ করুন।
2. **Supabase ডাটাবেস তৈরি করুন**:
   - [supabase.com](https://supabase.com)-এ ফ্রি অ্যাকাউন্ট খুলে **New Project** তৈরি করুন।
   - প্রোজেক্ট ড্যাশবোর্ডের বাম পাশের **SQL Editor**-এ যান।
   - এই রিপোজিটরির `supabase-schema.sql` ফাইলের পুরো কোড কপি করে পেস্ট করুন এবং **Run** বাটনে চাপ দিন।
   - সব টেবিল, ইনডেক্স এবং সিকিউরিটি পলিসি সাথে সাথে তৈরি হয়ে যাবে।
   - **Project Settings -> API** থেকে **Project URL**, **publishable key**, এবং **service_role key** কপি করে রাখুন।
3. **Vercel-এ ডিপ্লয় করুন**:
   - [vercel.com](https://vercel.com)-এ গিয়ে **Add New Project** দিন এবং আপনার GitHub রিপোজিটরি সিলেক্ট করুন।
   - **Environment Variables** সেকশনে নিচের ভ্যারিয়েবলগুলো যোগ করুন:
     - `NEXT_PUBLIC_SUPABASE_URL` = (আপনার Supabase URL)
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = (আপনার publishable key)
     - `SUPABASE_SERVICE_ROLE_KEY` = (আপনার service_role key)
     - `ADMIN_USERNAME` = `admin`
     - `ADMIN_PASSWORD` = (আপনার নিজের গোপন পাসওয়ার্ড)
     - `ADMIN_SESSION_SECRET` = (যেকোনো বড় সিক্রেট টেক্সট)
     - `APP_MODE` = `production`
   - **Deploy** বাটনে চাপ দিন। ১ মিনিটের মধ্যে আপনার ওয়েবসাইট লাইভ হয়ে যাবে।

### ২. টেলিগ্রাম বট ও মিনি অ্যাপ সেটআপ

1. টেলিগ্রামে [@BotFather](https://t.me/BotFather)-এ গিয়ে `/newbot` দিয়ে একটি বট তৈরি করুন।
2. এরপর `/newapp` লিখে আপনার বট সিলেক্ট করে অ্যাপের নাম দিন `VIRAL LINK HUB`।
3. Web App URL হিসেবে আপনার Vercel-এর লাইভ লিংকটি দিন (যেমন: `https://your-domain.vercel.app`)।
4. `/setmenubutton` কমান্ড দিয়ে বটের মেনু বাটনে অ্যাপের লিংক যুক্ত করে দিন।
5. এখন যে কেউই আপনার টেলিগ্রাম বটে ঢুকলে এক ক্লিকে সম্পূর্ণ নেটফ্লিক্স স্টাইলে ভিডিও স্ট্রিমিং অ্যাপ দেখতে পাবে।

---

## 📄 License

This project is licensed under the MIT License. Developed for high-conversion media streaming, compliant web monetization, and viral Telegram distribution.
