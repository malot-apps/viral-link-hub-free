-- ============================================================================
-- VIRAL LINK HUB — Migration: Telegram Destinations & Professional Intro
-- Migration File: supabase/migrations/20261008_telegram_destinations.sql
-- ============================================================================

-- 1. TELEGRAM DESTINATIONS TABLE
CREATE TABLE IF NOT EXISTS telegram_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('channel', 'group', 'bot')),
  url TEXT NOT NULL,
  username TEXT DEFAULT '',
  chat_id TEXT DEFAULT '',
  icon TEXT DEFAULT 'send',
  is_required BOOLEAN DEFAULT false,
  show_on_website BOOLEAN DEFAULT true,
  show_on_miniapp BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  member_count_display TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tg_dest_active ON telegram_destinations(is_active);
CREATE INDEX IF NOT EXISTS idx_tg_dest_order ON telegram_destinations(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_tg_dest_type ON telegram_destinations(type);

-- 2. ROW LEVEL SECURITY (RLS)
ALTER TABLE telegram_destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Telegram Destinations" ON telegram_destinations;
CREATE POLICY "Public Read Telegram Destinations" ON telegram_destinations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service Role Full Telegram Destinations" ON telegram_destinations;
CREATE POLICY "Service Role Full Telegram Destinations" ON telegram_destinations
  FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

-- 3. EXTEND SETTINGS TABLE WITH INTRO HERO & COMMUNITY FIELDS
ALTER TABLE settings ADD COLUMN IF NOT EXISTS intro_title TEXT DEFAULT 'Unlimited Cloud Entertainment & Instant Streaming';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS intro_subtitle TEXT DEFAULT 'VIP Fast-Track Access · Official Telegram Community Hub';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS intro_description TEXT DEFAULT 'Discover exclusive high-speed cloud movies, viral anime releases, and direct VIP links. Join our verified Telegram ecosystem to unlock 4K content with instant direct access.';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS intro_primary_cta_text TEXT DEFAULT 'Join Official Community';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS intro_primary_cta_url TEXT DEFAULT 'https://t.me/virallinkhub_official';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS intro_secondary_cta_text TEXT DEFAULT 'Browse Movies';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS intro_secondary_cta_url TEXT DEFAULT '#browse-catalog';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS community_section_title TEXT DEFAULT 'Official Telegram Ecosystem';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS community_section_subtitle TEXT DEFAULT 'Join our verified channels, discussion groups, and interactive bots for direct links and member-only updates';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS show_intro_hero BOOLEAN DEFAULT true;

-- 4. SEED STARTER DESTINATIONS (6 Channels, Groups & Bots)
INSERT INTO telegram_destinations (id, title, description, type, url, username, chat_id, icon, is_required, show_on_website, show_on_miniapp, order_index, is_active, member_count_display)
VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Viral Link Hub · Official Announcements', 'Daily direct cloud releases, 4K movies, server status & exclusive VIP links.', 'channel', 'https://t.me/virallinkhub_official', '@virallinkhub_official', '@virallinkhub_official', 'bell', true, true, true, 1, true, '54.2K members'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'VIP Community & Movie Requests', 'Chat with 18,000+ members, request viral movies, and share cloud direct links.', 'group', 'https://t.me/virallinkhub_chat', '@virallinkhub_chat', '@virallinkhub_chat', 'message-circle', false, true, true, 2, true, '18.4K members'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'FastCloud Stream & Notification Bot', 'Instant high-speed stream link generator & one-click cloud file delivery.', 'bot', 'https://t.me/viral_link_hub_free_bot', '@viral_link_hub_free_bot', '', 'bot', true, true, true, 3, true, 'Active 24/7'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Anime & Cultivation HD Releases', 'Dedicated subbed anime episodes, uncensored cuts, and 60fps high bitrate encodes.', 'channel', 'https://t.me/virallinkhub_anime', '@virallinkhub_anime', '@virallinkhub_anime', 'sparkles', false, true, true, 4, true, '32.1K members'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'bufferless ⚡ Cloud Link Bypass Bot', 'Auto-extract direct video streams from any bufferless ⚡ or cloud storage share URL.', 'bot', 'https://t.me/virallinkhub_bypass_bot', '@virallinkhub_bypass_bot', '', 'shield', false, true, true, 5, true, 'Free Tool'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Global Cinema Discussion & Spoilers', 'International movie enthusiasts, review threads, recommendations, and ratings.', 'group', 'https://t.me/virallinkhub_global', '@virallinkhub_global', '@virallinkhub_global', 'send', false, true, true, 6, true, '12.8K members')
ON CONFLICT (id) DO NOTHING;
