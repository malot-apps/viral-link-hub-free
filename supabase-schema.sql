-- ============================================================================
-- VIRAL LINK HUB — Authoritative Supabase PostgreSQL Schema
-- Next.js 15 + Supabase PostgreSQL + ENV-based Admin Auth
-- Repository: https://github.com/malot-apps/viral-link-hub-free
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. VIDEOS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  poster_url TEXT NOT NULL,
  banner_url TEXT,
  category TEXT NOT NULL,
  stream_url TEXT NOT NULL,
  target_link TEXT,
  direct_ad_link TEXT,
  required_ads_count INTEGER DEFAULT 2,
  quality TEXT DEFAULT '1080p HD',
  file_size TEXT DEFAULT '1.4 GB',
  tags TEXT[] DEFAULT '{}',
  views_count BIGINT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_is_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- ============================================================================
-- 2. SETTINGS TABLE (Singleton Configuration Row: id = 1)
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  app_name TEXT DEFAULT 'VIRAL LINK HUB',
  maintenance_mode BOOLEAN DEFAULT false,
  announcement_banner TEXT DEFAULT '🔥 High-Speed Direct Cloud Streams active!',
  global_ad_url TEXT DEFAULT 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
  primary_ad_url TEXT DEFAULT 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
  secondary_ad_url TEXT DEFAULT '',
  required_ads INTEGER DEFAULT 2,
  telegram_channel_url TEXT DEFAULT 'https://t.me/virallinkhub_official',
  force_join_channel BOOLEAN DEFAULT false,
  
  -- Growth & Premium Reward Configuration
  premium_reward_enabled BOOLEAN DEFAULT true,
  premium_required_ads INTEGER DEFAULT 3,
  premium_required_referrals INTEGER DEFAULT 3,
  premium_duration_hours INTEGER DEFAULT 24,
  
  -- Ad Frequency Caps & Placement limits
  ad_frequency_limit INTEGER DEFAULT 5,
  ad_cooldown_seconds INTEGER DEFAULT 30,
  max_ads_per_session INTEGER DEFAULT 5,
  max_popunders_per_session INTEGER DEFAULT 1,
  max_ads_per_day INTEGER DEFAULT 20,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_settings_row CHECK (id = 1)
);

-- Seed default settings row if not present
INSERT INTO settings (id, app_name)
VALUES (1, 'VIRAL LINK HUB')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. USERS TABLE (Telegram Profiles & Viral Reward Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  telegram_user_id TEXT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  is_premium BOOLEAN DEFAULT false,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  ad_actions_completed INTEGER DEFAULT 0,
  premium_until TIMESTAMPTZ,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- ============================================================================
-- 4. REFERRALS TABLE (Viral Attribution & Qualification)
-- ============================================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'qualified'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  qualified_at TIMESTAMPTZ,
  CONSTRAINT unique_referred_user UNIQUE (referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- ============================================================================
-- 5. ANALYTICS EVENTS TABLE (High-Throughput Telemetry Stream)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content_id TEXT,
  placement TEXT,
  campaign TEXT,
  source TEXT,
  referral_code TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_placement ON analytics_events(placement);

-- ============================================================================
-- 6. PREMIUM REWARDS TABLE (24-Hour VIP Passes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS premium_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  duration_hours INTEGER DEFAULT 24,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' -- 'active' | 'expired'
);

CREATE INDEX IF NOT EXISTS idx_premium_user ON premium_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_expires ON premium_rewards(expires_at DESC);

-- ============================================================================
-- 7. AUDIT LOGS TABLE (Tamper-Evident Admin Action Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================================
-- 8. INITIAL STARTER SEED MOVIES (Populated only if table is empty)
-- ============================================================================
INSERT INTO videos (title, description, poster_url, banner_url, category, stream_url, target_link, direct_ad_link, required_ads_count, quality, file_size, tags, views_count, is_featured)
SELECT 
  'Neon Protocol: Cyber Shadow',
  'A rogue neural net hacker discovers an encrypted corporate conspiracy deep inside the neo-Tokyo megagrid. High-bitrate demo stream.',
  '/images/hero_viral_cyberpunk.jpg',
  '/images/hero_viral_cyberpunk.jpg',
  'Trending',
  'https://fastcdn.stream/v/demo-neon-protocol',
  'https://fastcdn.stream/v/demo-neon-protocol',
  'https://monetag.com/direct?zone=78912',
  2,
  '4K Ultra HD',
  '1.8 GB',
  ARRAY['Cyberpunk', 'Sci-Fi', 'Thriller', 'VIP Master'],
  14820,
  true
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Neon Protocol: Cyber Shadow');

INSERT INTO videos (title, description, poster_url, banner_url, category, stream_url, target_link, direct_ad_link, required_ads_count, quality, file_size, tags, views_count, is_featured)
SELECT 
  'Shadow Heist: Dark Protocol',
  'A seasoned crew of black-ops specialists plan the infiltration of a sovereign underground vault in Geneva.',
  '/images/movie_action_heist.jpg',
  '/images/movie_action_heist.jpg',
  'Action',
  'https://fastcdn.stream/v/demo-shadow-heist',
  'https://fastcdn.stream/v/demo-shadow-heist',
  'https://monetag.com/direct?zone=78912',
  2,
  '1080p HD',
  '1.4 GB',
  ARRAY['Action', 'Heist', 'Crime'],
  29400,
  false
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Shadow Heist: Dark Protocol');

INSERT INTO videos (title, description, poster_url, banner_url, category, stream_url, target_link, direct_ad_link, required_ads_count, quality, file_size, tags, views_count, is_featured)
SELECT 
  'Celestial Blade: Sovereign Chronicle',
  'In ancient celestial realms, legendary blade masters fight to preserve cosmic balance against shadow dragons.',
  '/images/movie_anime_fantasy.jpg',
  '/images/movie_anime_fantasy.jpg',
  'Anime',
  'https://fastcdn.stream/v/demo-celestial-blade',
  'https://fastcdn.stream/v/demo-celestial-blade',
  'https://monetag.com/direct?zone=78912',
  2,
  '1080p HD 60fps',
  '1.2 GB',
  ARRAY['Anime', 'Fantasy', 'Action', 'Cultivation'],
  42100,
  true
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Celestial Blade: Sovereign Chronicle');

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all 7 tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop prior policies to ensure clean idempotency
DROP POLICY IF EXISTS "Public Read Videos" ON videos;
DROP POLICY IF EXISTS "Public Read Settings" ON settings;
DROP POLICY IF EXISTS "Public Read Users" ON users;
DROP POLICY IF EXISTS "Public Insert Analytics" ON analytics_events;
DROP POLICY IF EXISTS "Service Role Full Videos" ON videos;
DROP POLICY IF EXISTS "Service Role Full Settings" ON settings;
DROP POLICY IF EXISTS "Service Role Full Users" ON users;
DROP POLICY IF EXISTS "Service Role Full Referrals" ON referrals;
DROP POLICY IF EXISTS "Service Role Full Analytics" ON analytics_events;
DROP POLICY IF EXISTS "Service Role Full Rewards" ON premium_rewards;
DROP POLICY IF EXISTS "Service Role Full Audit" ON audit_logs;

-- PUBLIC POLICIES (Anonymous / Visitor access)
-- Public users may ONLY read data that the public app actually needs:
CREATE POLICY "Public Read Videos" ON videos
  FOR SELECT USING (true);

CREATE POLICY "Public Read Settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Public Read Users" ON users
  FOR SELECT USING (true);

-- Public users may insert client analytics telemetry events
CREATE POLICY "Public Insert Analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- PRIVILEGED POLICIES (Server-side / Service Role access)
-- All privileged writes/updates/deletes happen strictly server-side via service_role:
CREATE POLICY "Service Role Full Videos" ON videos
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service Role Full Settings" ON settings
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service Role Full Users" ON users
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service Role Full Referrals" ON referrals
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service Role Full Analytics" ON analytics_events
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service Role Full Rewards" ON premium_rewards
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service Role Full Audit" ON audit_logs
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

-- ============================================================================
-- 10. SUPABASE STORAGE: video-images BUCKET & POLICIES
-- ============================================================================
-- Provision video-images public bucket for CDN distribution
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'video-images',
  'video-images',
  true,
  10485760, -- 10 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage Object Policies (Public read, Service Role write/update/delete)
DROP POLICY IF EXISTS "Public Read Video Images" ON storage.objects;
CREATE POLICY "Public Read Video Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'video-images');

DROP POLICY IF EXISTS "Service Role Upload Video Images" ON storage.objects;
CREATE POLICY "Service Role Upload Video Images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'video-images' AND (auth.role() = 'service_role' OR current_user = 'postgres')
  );

DROP POLICY IF EXISTS "Service Role Update Video Images" ON storage.objects;
CREATE POLICY "Service Role Update Video Images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'video-images' AND (auth.role() = 'service_role' OR current_user = 'postgres')
  );

DROP POLICY IF EXISTS "Service Role Delete Video Images" ON storage.objects;
CREATE POLICY "Service Role Delete Video Images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'video-images' AND (auth.role() = 'service_role' OR current_user = 'postgres')
  );

