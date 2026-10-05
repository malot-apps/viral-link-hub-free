# 🚀 VIRAL LINK HUB - Netflix-Style Telegram Mini App & Monetization Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Telegram WebApp](https://img.shields.io/badge/Telegram_Mini_App-SDK_v8.0-26A5E4?style=for-the-badge&logo=telegram)](https://core.telegram.org/bots/webapps)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deploy_Free-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Free_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Monetag & Adsterra](https://img.shields.io/badge/Monetization-Adsterra_%26_Monetag-FF5722?style=for-the-badge)](https://monetag.com/)

**VIRAL LINK HUB** is a high-performance, full-stack streaming portal and Telegram Mini App engineered for maximum ad CPM conversion and viral distribution. Designed with a pitch-black cinematic Netflix theme (`#141414` / `#E50914`), auto-playing animated GIF previews, a non-bypassable anti-bot Telegram channel verification gate, and a dedicated dark glassmorphic Executive Admin Operations Dashboard.

---

## 📑 Table of Contents
1. [Platform Architecture: Visitor App vs. Admin Dashboard](#-platform-architecture)
2. [Key Features](#-key-features)
3. [Maximum Revenue Ad Monetization Architecture](#-maximum-revenue-ad-monetization-architecture)
4. [How to Deploy 100% Free on Vercel](#-how-to-deploy-100-free-on-vercel)
5. [Telegram Bot Setup via @BotFather](#-telegram-bot-setup-via-botfather)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Environment Variables](#-environment-variables)
8. [বাংলা গাইড (Step-by-step Bengali Guide)](#-বাংলা-গাইড-step-by-step-bengali-guide)

---

## 🏛 Platform Architecture

The repository provides two independent, secure environments served seamlessly from a single unified Next.js + Vercel deployment:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VIRAL LINK HUB ARCHITECTURE                          │
├───────────────────────────────────┬────────────────────────────────────┤
│ 🎬 VISITOR TELEGRAM MINI APP      │ 🛠️ EXECUTIVE ADMIN DASHBOARD       │
│ Route: /app or /viral-link-hub.html│ Route: /admin or /admin.html      │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Pure consumer Netflix UI        │ • Password / JWT Authenticated    │
│ • No admin notes or debug text    │ • Real-time Active Visitors (5m)   │
│ • Auto-playing Hero GIF Stream    │ • Total Unique Visitors & Views    │
│ • Mandatory Channel Join + Ad     │ • Master 'Force Join Channel' ON/OFF│
│ • Initial Touch Popunder Trigger  │ • Global Direct Ad Smartlink Setup │
│ • Header & Footer Sticky Banners  │ • Global Required Ads Count Slider │
│ • 5s Anti-spam Ad Unlock Counter  │ • 1-Click Maintenance Mode Toggle  │
│ • Glowing "▶ Play HD Stream" CTA  │ • Video CRUD with live GIF preview │
│ • Silent 30s background ping      │ • Strict hidden stream link masking│
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. 🎬 Visitor Telegram Mini App (`/app` or `/viral-link-hub.html`)
- **Pitch-Black Cinematic Aesthetic**: Engineered with `#141414` dark background and Netflix Red accents (`#E50914`).
- **Auto-Playing GIF Hero Banner**: High frame-rate animated streaming backdrop loops automatically upon opening with dual vignette gradients, title typography, and resolution badges (`4K Ultra HD`, `Server 1 HD`, `Dolby 5.1`).
- **Zero Admin Artifacts**: Stripped of any debug logs, developer controls, or system references for an authentic consumer streaming feel.
- **Strict Link Masking**: All destination streams are auto-masked on the client as `streamUrl` (`https://fastcdn.stream/v/...`). The word *"Terabox"* is never exposed to visitors.
- **Card GIF Previews on Hover/Touch**: Movie catalog cards animate with live action GIFs upon interaction.

### 2. 🛡️ Mandatory Telegram Channel Join Popup
- Non-dismissible verification modal displayed on app launch if the user has not confirmed channel membership:
  - Header: `"Join Official Channel to Watch"`
  - Justification: Anti-bot security and 4K server speed protection.
  - **👉 Join Channel Button**: Opens a **Vignette/Interstitial ad smartlink** in a new tab first, then automatically forwards the user to your official Telegram Channel.
  - **✅ I Have Joined Button**: Simulates membership verification, triggers native Telegram haptic feedback, permanently saves confirmation to `localStorage`, and unblocks streaming access.

### 3. 🛠️ Standalone Executive Admin Panel (`/admin` or `/admin.html`)
- **Live Analytics Widgets**:
  - 🟢 **Live Active Visitors**: Real-time sliding 5-minute telemetry of active users.
  - 👥 **Total Unique Visitors**: Lifetime deduplicated Telegram users.
  - 👁️ **Total Views**: Cumulative video stream impressions.
  - 💰 **Total Ad Unlocks**: Number of verified Monetag/Adsterra CPM tasks completed.
- **Remote App Controls**:
  - **Force Telegram Channel Join**: Master toggle ON/OFF with custom Telegram channel URL.
  - **Global Direct Ad Link**: Direct smartlink input with instant `"Test Link"` preview.
  - **Global Default Ads Count**: Interactive slider (0 to 6 ads).
  - **Maintenance Mode**: 1-click master kill switch.
  - **Top Announcement Bar Text**: Real-time broadcast banner to all visitors.
- **Video & Animated GIF Content Manager (CRUD)**:
  - Add / Edit modal: Title, Description, Static Poster URL, Animated Banner GIF URL, Hidden Stream Link (Direct Video / Provider URL), Direct Ad Link URL, Required Ads Count, Quality, and File Size.
  - Searchable, filterable data table with hover previews, one-click copy of hidden stream links, and instant deletion with toast notifications.

---

## 💰 Maximum Revenue Ad Monetization Architecture

| Ad Placement | Format | Trigger Condition | Provider |
|---|---|---|---|
| **Header Banner** | 320x50 / 468x60 / Native | Sticky banner below top navigation | Adsterra / Monetag |
| **Footer Sticky Banner** | 320x50 Banner | Fixed bottom banner on home screen | Adsterra / Monetag |
| **Initial Click Popunder** | Full Page Popunder | Fires on the user's very first touch/click anywhere on the Mini App (once per session) | Monetag / Adsterra Smartlink |
| **Channel Join Interstitial** | Vignette / Direct Smartlink | User clicks "Join Channel" in the mandatory Telegram popup | Monetag Direct Link |
| **Stream Unlock Counter** | 5-Second Anti-Spam Timer | User clicks "Watch Ad to Unlock Stream" (1/2, 2/2) before unlocking the final video | Monetag / Adsterra Direct Link |

---

## 🚀 How to Deploy 100% Free on Vercel

You can host both the frontend and backend on **Vercel** with a free **MongoDB Atlas** database in less than 5 minutes:

### Step 1: Create a Free Database on MongoDB Atlas
1. Visit [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up for a free account.
2. Create a free shared cluster (**M0 Free Tier** - 512 MB storage, free forever).
3. Under **Database Access**, create a user (e.g., `hubadmin` with a secure password).
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Drivers** -> Copy your Connection String:
   ```
   mongodb+srv://hubadmin:<password>@cluster0.abcde.mongodb.net/virallinkhub?retryWrites=true&w=majority
   ```

### Step 2: Push this Repository to GitHub
1. Create a new repository on your GitHub account (e.g. `viral-link-hub`).
2. Push this project code:
   ```bash
   git init
   git add .
   git commit -m "feat: complete viral link hub telegram mini app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/viral-link-hub.git
   git push -u origin main
   ```

### Step 3: Deploy on Vercel
1. Log in to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
2. Select your `viral-link-hub` GitHub repository and click **Import**.
3. Under **Environment Variables**, add the following:
   - `MONGODB_URI` = `mongodb+srv://hubadmin:<password>@cluster0.abcde.mongodb.net/virallinkhub?retryWrites=true&w=majority`
   - `JWT_SECRET` = `super_secure_jwt_secret_key_2026_xyz`
   - `ADMIN_USERNAME` = `admin`
   - `ADMIN_PASSWORD` = `virallinkhub2026!`
4. Click **Deploy**.
5. Once deployment completes, Vercel gives you a free production URL:
   ```
   https://your-project-name.vercel.app
   ```

### Direct Access URLs:
- **Visitor Telegram Mini App**: `https://your-project-name.vercel.app/app` (or `/viral-link-hub.html`)
- **Admin Operations Dashboard**: `https://your-project-name.vercel.app/admin` (or `/admin.html`)

---

## 🤖 Telegram Bot Setup via @BotFather

To connect your Vercel URL to your Telegram Mini App:

1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Type `/newbot` and give your bot a name (e.g., `Viral Link Hub Bot`) and username (e.g., `ViralLinkHubOfficialBot`).
3. Create the WebApp by typing:
   ```
   /newapp
   ```
4. Select your bot, then enter:
   - **Title**: `VIRAL LINK HUB`
   - **Description**: `Watch 4K HD Viral Movies & Cloud Streams`
   - **Upload an avatar image** (640x640 poster)
   - **Web App URL**: `https://your-project-name.vercel.app/app`
   - **Short Name**: `hub`
5. Set the Menu Button so visitors can open the app in 1 tap:
   - Type `/setmenubutton`
   - Select your bot
   - Enter Button Text: `🎬 Open VIRAL HUB`
   - Enter WebApp URL: `https://your-project-name.vercel.app/app`
6. Done! Anyone opening your bot can tap the menu button to open your Netflix-style Mini App.

---

## 📡 API Endpoints Reference

### Public Client Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/app-config` | Dynamic app config (`appName`, `maintenanceMode`, `globalAdLink`, `defaultAdsRequired`, `telegramChannelUrl`, `forceJoinChannel`). |
| `GET` | `/api/v1/movies` | Fetch all movies with auto-masked `streamUrl` and GIF banner URLs. |
| `GET` | `/api/v1/movies/:id` | Fetch specific movie details. |
| `POST` | `/api/v1/movies/:id/click-ad` | Registers verified sponsor CPM ad click. |
| `POST` | `/api/v1/movies/:id/view` | Increments verified view count on movie. |
| `POST` | `/api/v1/analytics/ping` | Silent heartbeat endpoint recording active visitors (every 30s). |

### Admin Endpoints (Bearer JWT Required)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/admin/auth/login` | Issues admin JWT token (`admin` / `virallinkhub2026!`). |
| `GET` | `/api/v1/admin/stats` | Fetches live users (5m sliding window), total unique visitors, views, and ad clicks. |
| `GET` | `/api/v1/admin/settings` | Retrieves global configuration. |
| `PUT` | `/api/v1/admin/settings` | Updates channel join requirement, channel URL, ad smartlinks, and maintenance mode. |
| `GET` | `/api/v1/admin/videos` | Fetches all video catalog items for admin management. |
| `POST` | `/api/v1/admin/videos` | Create a new video entry (stores hidden stream link and GIF banner). |
| `PUT` | `/api/v1/admin/videos/:id` | Updates an existing video entry. |
| `DELETE`| `/api/v1/admin/videos/:id` | Deletes a video from the catalog. |

---

## 🔑 Environment Variables & Supabase Setup

### 1. Supabase Database Schema
1. Create a free project at [supabase.com](https://supabase.com).
2. Open your Supabase Project -> **SQL Editor**.
3. Copy and run the contents of `supabase-schema.sql` in this repository. It will automatically create all tables (`videos`, `settings`, `admins`, `analytics_events`, `referrals`, `premium_rewards`, `audit_logs`, `users`), RLS security policies, and initial starter movies.
4. Copy your **Project URL**, **Anon Key**, and **Service Role Key** from Supabase Settings -> API.

### 2. Configure Environment Variables
Create a `.env.local` file or configure in your deployment dashboard:

```env
# Supabase Database Configuration (Free Tier PostgreSQL)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=virallinkhub2026!
ADMIN_SESSION_SECRET=super_secret_session_key_viral_link_hub_2026

# Mode: 'production' for real Supabase data, 'demo' for preview simulation
APP_MODE=production

# Telegram Bot Integration (Optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=@virallinkhub_official
```

---

## 🇧🇩 বাংলা গাইড (Step-by-step Bengali Guide)

### ১. কীভাবে Vercel + Supabase দিয়ে সম্পূর্ণ ফ্রিতে হোস্ট করবেন?
1. **GitHub-এ কোড আপলোড করুন**: আপনার GitHub অ্যাকাউন্টে একটি রিপোজিটরি বানিয়ে পুরো কোডটি পুশ করুন।
2. **Supabase ডাটাবেস তৈরি করুন**: [supabase.com](https://supabase.com)-এ গিয়ে একটি ফ্রি প্রজেক্ট তৈরি করুন। **SQL Editor**-এ গিয়ে এই রিপোজিটরির `supabase-schema.sql` ফাইলটির কোড পেস্ট করে **Run** চাপুন। সব টেবিল এবং সিকিউরিটি পলিসি স্বয়ংক্রিয়ভাবে তৈরি হয়ে যাবে।
3. **Vercel-এ ডিপ্লয় করুন**: 
   - [vercel.com](https://vercel.com)-এ লগইন করে **Add New Project** দিন এবং GitHub রিপো সিলেক্ট করুন।
   - Environment Variables অপশনে `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` সেট করে **Deploy** বাটনে চাপ দিন।
   - কয়েক সেকেন্ডের মধ্যে Vercel আপনাকে একটি লাইভ ফ্রি ডোমেইন দিয়ে দিবে (যেমন: `https://your-app.vercel.app`)।

### ২. ভিজিটর ও অ্যাডমিন সাইট কীভাবে কাজ করবে?
- **ভিজিটরদের জন্য ওয়েবসাইট (Telegram Mini App)**:
  - লিঙ্ক: `https://your-app.vercel.app/app` (অথবা `/viral-link-hub.html`)
  - এখানে কোনো প্রকার অ্যাডমিন লেখা, পাসওয়ার্ড বক্স বা ব্যাকএন্ড অপশন থাকবে না।
  - ইউজারদের জন্য নেটফ্লিক্স স্টাইল পোস্টার, জিআইএফ অটো-প্লে, অ্যাড দেখে ভিডিও আনলক করার সিস্টেম এবং বাধ্যতামূলক টেলিগ্রাম চ্যানেল জয়েন পপআপ থাকবে।
  - কোনো অবস্থাতেই 'Terabox' শব্দটি ভিজিটরের স্ক্রিনে শো করবে না।
- **অ্যাডমিনদের জন্য ড্যাশবোর্ড**:
  - লিঙ্ক: `https://your-app.vercel.app/admin` (অথবা `/admin.html`)
  - এখানে লাইভ ভিজিটর সংখ্যা (লাস্ট ৫ মিনিট), মোট ইউনিক ইউজার, ভিডিও ভিউ এবং অ্যাড ক্লিকে আর্নিং দেখতে পাবেন।
  - নতুন ভিডিও অ্যাড, এডিট, ডিলিট এবং টেলিগ্রাম চ্যানেল জয়েন অন/অফ করতে পারবেন।
  - ডিফল্ট লগইন ইউজারনেম: `admin` | পাসওয়ার্ড: `virallinkhub2026!`

### ৩. Telegram BotFather দিয়ে কীভাবে যুক্ত করবেন?
1. টেলিগ্রামে [@BotFather](https://t.me/BotFather) ওপেন করে `/newbot` লিখে একটি বট তৈরি করুন।
2. এরপর `/newapp` লিখে আপনার বটটি সিলেক্ট করে নাম দিন `VIRAL LINK HUB`।
3. WebApp URL হিসেবে আপনার Vercel লিঙ্কটি দিন: `https://your-app.vercel.app/app`।
4. এরপর `/setmenubutton` কমান্ড দিয়ে বটের মেনু বাটনে নাম দিন `🎬 Open VIRAL HUB` এবং একই URL দিন।
5. ব্যস! এখন আপনার টেলিগ্রাম বট থেকে যে কেউই এক ক্লিকে সরাসরি হাই-স্পিড স্ট্রিমিং অ্যাপ ওপেন করতে পারবে।

---

## 📄 License
This project is licensed under the MIT License. Developed for high-conversion web monetization and high-speed viral media streaming.
