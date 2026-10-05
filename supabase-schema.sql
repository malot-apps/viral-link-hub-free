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

-- ============================================================================
-- 11. TELEGRAM ENTITIES (Channels, Groups, Bots, and Mini Apps)
-- ============================================================================
CREATE TABLE IF NOT EXISTS telegram_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('channel', 'group', 'bot', 'miniapp')),
  title TEXT NOT NULL,
  identifier TEXT NOT NULL,
  chat_id TEXT,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entities_type ON telegram_entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_active ON telegram_entities(is_active);

-- Seed Primary Mini App & Core Entities
INSERT INTO telegram_entities (type, title, identifier, chat_id, url, is_primary, is_active)
SELECT 'miniapp', 'Viral Link Hub Primary Mini App', 'viral_link_hub_free_bot/viral', '', 'https://t.me/viral_link_hub_free_bot/viral', true, true
WHERE NOT EXISTS (SELECT 1 FROM telegram_entities WHERE identifier = 'viral_link_hub_free_bot/viral');

INSERT INTO telegram_entities (type, title, identifier, chat_id, url, is_primary, is_active)
SELECT 'bot', 'Viral Link Hub Distribution Bot', 'viral_link_hub_free_bot', '', 'https://t.me/viral_link_hub_free_bot', true, true
WHERE NOT EXISTS (SELECT 1 FROM telegram_entities WHERE identifier = 'viral_link_hub_free_bot');

INSERT INTO telegram_entities (type, title, identifier, chat_id, url, is_primary, is_active)
SELECT 'channel', 'Official Viral Link Hub Channel', 'virallinkhub_official', '@virallinkhub_official', 'https://t.me/virallinkhub_official', true, true
WHERE NOT EXISTS (SELECT 1 FROM telegram_entities WHERE identifier = 'virallinkhub_official');

INSERT INTO telegram_entities (type, title, identifier, chat_id, url, is_primary, is_active)
SELECT 'group', 'VIP Community & Discussion Chat', 'virallinkhub_chat', '@virallinkhub_chat', 'https://t.me/virallinkhub_chat', false, true
WHERE NOT EXISTS (SELECT 1 FROM telegram_entities WHERE identifier = 'virallinkhub_chat');

-- ============================================================================
-- 12. GROWTH MISSIONS (Configurable Viral Tasks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS growth_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('join_channel', 'join_group', 'start_bot', 'open_miniapp', 'invite_friends')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_url TEXT NOT NULL,
  chat_id TEXT,
  required_count INTEGER DEFAULT 1,
  reward_ad_credits INTEGER DEFAULT 1,
  reward_description TEXT DEFAULT '+1 VIP Credit',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_missions_active ON growth_missions(is_active);

-- Seed Starter Growth Missions
INSERT INTO growth_missions (type, title, description, target_url, chat_id, required_count, reward_ad_credits, reward_description, is_active, order_index)
SELECT 'join_channel', 'Join Official Telegram Channel', 'Subscribe to get cloud direct updates and bypass link limits.', 'https://t.me/virallinkhub_official', '@virallinkhub_official', 1, 1, '+1 VIP Credit', true, 1
WHERE NOT EXISTS (SELECT 1 FROM growth_missions WHERE title = 'Join Official Telegram Channel');

INSERT INTO growth_missions (type, title, description, target_url, chat_id, required_count, reward_ad_credits, reward_description, is_active, order_index)
SELECT 'join_group', 'Join VIP Discussion Community', 'Connect with members and request new viral movies.', 'https://t.me/virallinkhub_chat', '@virallinkhub_chat', 1, 1, '+1 VIP Credit', true, 2
WHERE NOT EXISTS (SELECT 1 FROM growth_missions WHERE title = 'Join VIP Discussion Community');

INSERT INTO growth_missions (type, title, description, target_url, chat_id, required_count, reward_ad_credits, reward_description, is_active, order_index)
SELECT 'start_bot', 'Start Official Telegram Bot', 'Activate the cloud notification and link generator bot.', 'https://t.me/viral_link_hub_free_bot?start=mission_bonus', '', 1, 1, '+1 VIP Credit', true, 3
WHERE NOT EXISTS (SELECT 1 FROM growth_missions WHERE title = 'Start Official Telegram Bot');

INSERT INTO growth_missions (type, title, description, target_url, chat_id, required_count, reward_ad_credits, reward_description, is_active, order_index)
SELECT 'invite_friends', 'Invite 3 Friends via Referral Link', 'Share your personal mini app link with friends.', 'https://t.me/viral_link_hub_free_bot/viral', '', 3, 3, '24h VIP Unlock', true, 4
WHERE NOT EXISTS (SELECT 1 FROM growth_missions WHERE title = 'Invite 3 Friends via Referral Link');

-- ============================================================================
-- 13. USER MISSION PROGRESS
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  mission_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'claimed')),
  progress_count INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  verified_via TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_mission UNIQUE (user_id, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_mission_progress(user_id);

-- ============================================================================
-- 14. CAMPAIGNS (Marketing & Traffic Acquisition Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  source TEXT DEFAULT 'telegram',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_id ON campaigns(campaign_id);

-- Seed Default Campaigns
INSERT INTO campaigns (campaign_id, name, description, source, is_active)
SELECT 'tiktok_viral', 'TikTok Viral Clips', 'Organic short-form clips and bio links on TikTok', 'tiktok', true
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE campaign_id = 'tiktok_viral');

INSERT INTO campaigns (campaign_id, name, description, source, is_active)
SELECT 'tg_channel_promo', 'Telegram Channel Sponsorships', 'Partner cross-channel broadcast promotions', 'telegram', true
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE campaign_id = 'tg_channel_promo');

INSERT INTO campaigns (campaign_id, name, description, source, is_active)
SELECT 'youtube_shorts', 'YouTube Shorts Traffic', 'Discovery traffic from YouTube video descriptions', 'youtube', true
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE campaign_id = 'youtube_shorts');

-- ============================================================================
-- 15. RLS POLICIES FOR GROWTH TABLES
-- ============================================================================
ALTER TABLE telegram_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Public can read active entities, missions, and campaigns
DROP POLICY IF EXISTS "Public Read Entities" ON telegram_entities;
CREATE POLICY "Public Read Entities" ON telegram_entities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Missions" ON growth_missions;
CREATE POLICY "Public Read Missions" ON growth_missions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Campaigns" ON campaigns;
CREATE POLICY "Public Read Campaigns" ON campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read User Missions" ON user_mission_progress;
CREATE POLICY "Public Read User Missions" ON user_mission_progress FOR SELECT USING (true);

-- Service Role Full Privileges
DROP POLICY IF EXISTS "Service Role Full Entities" ON telegram_entities;
CREATE POLICY "Service Role Full Entities" ON telegram_entities
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

DROP POLICY IF EXISTS "Service Role Full Missions" ON growth_missions;
CREATE POLICY "Service Role Full Missions" ON growth_missions
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

DROP POLICY IF EXISTS "Service Role Full User Missions" ON user_mission_progress;
CREATE POLICY "Service Role Full User Missions" ON user_mission_progress
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

DROP POLICY IF EXISTS "Service Role Full Campaigns" ON campaigns;
CREATE POLICY "Service Role Full Campaigns" ON campaigns
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');


