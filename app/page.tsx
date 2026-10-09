'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import HeroFeatured from '@/components/HeroFeatured';
import VideoRow from '@/components/VideoRow';
import UnlockModal from '@/components/UnlockModal';
import TelegramUserSelector from '@/components/TelegramUserSelector';
import MaintenanceScreen from '@/components/MaintenanceScreen';
import MobileBottomNav from '@/components/MobileBottomNav';
import PremiumRewardModal from '@/components/PremiumRewardModal';
import ShareModal from '@/components/ShareModal';
import GlobalAdManager from '@/components/ads/GlobalAdManager';
import AdsterraNativeBanner from '@/components/ads/AdsterraNativeBanner';
import AdsterraBanner728x90 from '@/components/ads/AdsterraBanner728x90';
import HeroIntroSection from '@/components/HeroIntroSection';
import TelegramJoinCards from '@/components/TelegramJoinCards';
import { isTelegramWebApp } from '@/lib/ad-manager';
import { IVideo, ISettings, ITelegramUser, IUserProfile } from '@/lib/types';
import { CURATED_FALLBACK_VIDEOS, DEFAULT_APP_SETTINGS } from '@/lib/catalog-seed';
import { Search, Cloud, Send, Sparkles, Share2, ExternalLink } from 'lucide-react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          user?: ITelegramUser;
        };
        expand: () => void;
        ready: () => void;
        openTelegramLink?: (url: string) => void;
        openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
        close?: () => void;
        themeParams?: Record<string, string>;
      };
    };
  }
}

/**
 * Resilient fetcher with timeout and exponential backoff retry.
 * Prevents initial load failures caused by serverless/Supabase cold starts.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 2,
  baseDelay = 600
): Promise<any> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json;
        }
      }
    } catch (err: any) {
      clearTimeout(timer);
      console.warn(`[Network Retry] ${url} attempt ${attempt + 1}/${maxRetries + 1} failed:`, err?.message);
    }

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, baseDelay * (attempt + 1)));
    }
  }
  return null;
}

export default function HomePage() {
  // Application Settings (Seeded with production defaults so first render never breaks)
  const [settings, setSettings] = useState<ISettings>(DEFAULT_APP_SETTINGS);

  // Movie Catalog (Pre-seeded with instant curated catalog so site is never blank on cold start)
  const [movies, setMovies] = useState<IVideo[]>(CURATED_FALLBACK_VIDEOS);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Telegram User Identity
  const [telegramUser, setTelegramUser] = useState<ITelegramUser>({
    id: 108492041,
    first_name: 'Alex',
    last_name: 'Vance',
    username: 'alex_cyber',
    language_code: 'en',
    is_premium: true,
  });

  // Modals & Navigation
  const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [maintenanceBypassed, setMaintenanceBypassed] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<string>('home');

  // User Profile, Referral & VIP Premium States
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetVideo, setShareTargetVideo] = useState<IVideo | null>(null);

  // Live Stats & Heartbeat
  const [liveUsersCount, setLiveUsersCount] = useState<number>(1);
  const [isTelegram, setIsTelegram] = useState<boolean>(false);
  const [rawInitData, setRawInitData] = useState<string>('');

  // Initialize Telegram WebApp or local storage asynchronously
  useEffect(() => {
    setIsTelegram(isTelegramWebApp());
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        if (tg.initData) {
          setRawInitData(tg.initData);
        }
        if (tg.initDataUnsafe?.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch App Configuration with automatic retry & fallback
  const loadConfig = useCallback(async () => {
    try {
      const data = await fetchWithRetry('/api/v1/app-config', {}, 2, 600);
      if (data?.success && data?.data) {
        setSettings(data.data);
      }
    } catch {
      // Retains DEFAULT_APP_SETTINGS gracefully
    }
  }, []);

  // Fetch Movies with automatic retry & fail-safe fallback
  const loadMovies = useCallback(async () => {
    setIsCatalogLoading(true);
    try {
      const data = await fetchWithRetry('/api/v1/movies', {}, 2, 600);
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        setMovies(data.data);
      }
    } catch {
      // Retains pre-seeded CURATED_FALLBACK_VIDEOS gracefully
    } finally {
      setIsCatalogLoading(false);
    }
  }, []);

  // Heartbeat ping (POST /api/v1/analytics/ping)
  const sendPing = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/analytics/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': JSON.stringify(telegramUser),
        },
        body: JSON.stringify({ userId: telegramUser.id }),
      });
      const data = await res.json();
      if (data.success && typeof data.activeUsers === 'number') {
        setLiveUsersCount(data.activeUsers);
      }
    } catch {
      // non-fatal
    }
  }, [telegramUser]);

  // Sync User Profile (Referrals, Ads, Premium Status)
  const syncUser = useCallback(async () => {
    try {
      let startParam = '';
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        startParam =
          urlParams.get('startapp') ||
          urlParams.get('start') ||
          urlParams.get('tgWebAppStartParam') ||
          urlParams.get('ref') ||
          '';
      }

      const rawInitData =
        typeof window !== 'undefined' && window.Telegram?.WebApp?.initData
          ? window.Telegram.WebApp.initData
          : JSON.stringify(telegramUser);

      const res = await fetch('/api/v1/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': rawInitData,
        },
        body: JSON.stringify({
          initData: rawInitData,
          startParam,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUserProfile(data.data);
      }
    } catch {
      // non-fatal
    }
  }, [telegramUser]);

  // Initial catalog & app configuration load (runs once on mount)
  useEffect(() => {
    loadConfig();
    loadMovies();
  }, [loadConfig, loadMovies]);

  // Telegram session sync & heartbeat ping loop
  useEffect(() => {
    sendPing();
    syncUser();

    // Ping every 30 seconds to maintain 5-minute sliding session window
    const pingInterval = setInterval(sendPing, 30000);
    return () => clearInterval(pingInterval);
  }, [sendPing, syncUser]);

  // Featured video for Hero section
  const featuredVideo = useMemo(() => {
    return movies.find((m) => m.isFeatured) || movies[0];
  }, [movies]);

  // Filtered movies based on category and search
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (activeCategory !== 'All') {
      result = result.filter(
        (m) => m.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [movies, activeCategory, searchQuery]);

  // Categories for grouped rows
  const viralMovies = useMemo(
    () => movies.filter((m) => m.category === 'Action' || m.category === 'Viral Clips' || m.category === 'Trending' || m.category === 'Viral Movies'),
    [movies]
  );
  const teraboxExclusives = useMemo(
    () => movies.filter((m) => m.category === 'Terabox Cloud' || m.category === 'Terabox Exclusives' || m.targetType === 'terabox'),
    [movies]
  );
  const trendingNowVideos = useMemo(
    () => movies.filter((m) => m.isFeatured || m.viewsCount > 25000),
    [movies]
  );
  const recommendedVideos = useMemo(
    () => movies.filter((m) => m.category === 'Anime' || m.category === 'Recommended' || m.viewsCount <= 35000),
    [movies]
  );

  const handleOpenUnlockModal = (video: IVideo) => {
    setSelectedVideo(video);
    setIsUnlockModalOpen(true);
  };

  const handleViewIncremented = (videoId: string, newCount: number) => {
    setMovies((prev) =>
      prev.map((m) => (m._id === videoId ? { ...m, viewsCount: newCount } : m))
    );
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col font-sans">
      {/* Centralized Global Ad Manager (Monetag in Telegram Mini App, Adsterra on Web) */}
      <GlobalAdManager
        settings={settings}
        userProfile={userProfile}
        telegramUserId={telegramUser.id}
      />

      {/* Dynamic Announcement Banner */}
      <AnnouncementBanner text={settings.announcementBannerText} />

      {/* Top Bar Navigation */}
      <Navbar
        appName={settings.appName}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        telegramUser={telegramUser}
        userProfile={userProfile}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
        isAdminLoggedIn={false}
        liveUsersCount={liveUsersCount}
      />

      {/* Maintenance Mode Handling */}
      {settings.maintenanceMode && !maintenanceBypassed ? (
        <MaintenanceScreen
          appName={settings.appName}
          onBypass={() => setMaintenanceBypassed(true)}
        />
      ) : (
        <main className="flex-1 pb-16">
          {/* Professional Intro / Hero Section */}
          {activeCategory === 'All' && !searchQuery.trim() && (
            <HeroIntroSection
              settings={settings}
              isTelegram={isTelegram}
              onBrowseCatalog={() => {
                const el = document.getElementById('browse-catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          )}

          {/* Hero Featured Video Section (Shown when viewing Browse/All and no search query) */}
          {activeCategory === 'All' && !searchQuery.trim() && (
            <div id="browse-catalog">
              <HeroFeatured
                video={featuredVideo}
                onOpenUnlockModal={handleOpenUnlockModal}
                onOpenShare={(video) => {
                  setShareTargetVideo(video);
                  setIsShareModalOpen(true);
                }}
              />
            </div>
          )}

          {/* Search & Quick Filter Bar */}
          <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies, Terabox links, anime, clips..."
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/90 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 backdrop-blur-md transition-colors focus:border-[#e50914] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Status Info */}
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Direct Terabox Mirrors</span>
                </span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span>
                  {filteredMovies.length} Title{filteredMovies.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>

          {/* Adsterra Native Banner (Home: After Hero / Before Content Rows) */}
          <AdsterraNativeBanner
            placement="home_native_banner"
            isTelegram={isTelegram}
            isPremium={userProfile?.isPremiumActive}
            enabled={settings.adPlacements?.nativeBannerHome ?? true}
            scriptUrl={settings.adsterraNativeBannerUrl}
            containerId={settings.adsterraNativeBannerContainer}
            userId={telegramUser.id}
          />

          {/* Adsterra 728x90 Banner (Desktop Responsive Slot) */}
          <AdsterraBanner728x90
            placement="desktop_728x90"
            isTelegram={isTelegram}
            isPremium={userProfile?.isPremiumActive}
            enabled={settings.adPlacements?.banner728x90Desktop ?? true}
            adKey={settings.adsterraBanner728x90Key}
            userId={telegramUser.id}
          />

          {/* Home Banner Sponsor Ad Placement */}
          {(settings.adPlacements?.homeBanner ?? true) && !userProfile?.isPremiumActive && (
            <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-zinc-900/90 to-red-950/30 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-white font-black shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                        Sponsor Highlight
                      </span>
                      <span className="text-xs font-semibold text-white">Unlock Ultra Fast 4K CDN Mirrors</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Visit verified sponsor or complete 3 tasks + refer 3 friends to get 24-Hour VIP completely ad-free!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={settings.adsterraSmartlinkUrl || settings.globalAdLink || 'https://cheflobesofficer.com/cvdp4vvsma?key=fbecdf734cc50866fb1dcfa342c33a86'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      fetch('/api/v1/analytics/ad-event', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: telegramUser.id,
                          event: 'ad_click',
                          placement: 'home_banner',
                          network: 'adsterra',
                        }),
                      }).catch(() => {});
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 text-xs font-bold transition shadow"
                  >
                    <span>Check Sponsor</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => setIsPremiumModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-semibold transition"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>24h VIP</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search / Filter Results View */}
          {searchQuery.trim() || activeCategory !== 'All' ? (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <h2 className="mb-4 text-lg font-bold text-white">
                {searchQuery ? `Search Results for "${searchQuery}"` : `${activeCategory} Collection`}
              </h2>

              {filteredMovies.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-12 text-center text-zinc-400">
                  <p className="text-sm">No videos found matching your query.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('All');
                    }}
                    className="mt-3 text-xs font-semibold text-[#e50914] hover:underline"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
                  {filteredMovies.map((video) => (
                    <div
                      key={video._id}
                      onClick={() => handleOpenUnlockModal(video)}
                      className="group relative cursor-pointer overflow-hidden rounded-lg border border-white/5 bg-zinc-900 transition-all duration-200 hover:scale-[1.02] hover:border-white/20"
                    >
                      <div className="relative aspect-[3/4] w-full bg-zinc-950">
                        <Image
                          src={video.posterUrl}
                          alt={video.title}
                          fill
                          sizes="(max-width: 640px) 160px, 220px"
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareTargetVideo(video);
                            setIsShareModalOpen(true);
                          }}
                          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 hover:bg-[#2AABEE] text-zinc-300 hover:text-white backdrop-blur-sm transition"
                          title="Share Link"
                        >
                          <Share2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="line-clamp-1 text-xs font-semibold text-white group-hover:text-[#e50914]">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                          <span>{video.quality || '1080p'}</span>
                          <span aria-hidden="true" className="text-zinc-600">·</span>
                          <span>{video.fileSize || '1.4 GB'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Standard Netflix-style Catalog with Category Rows */
            <div className="mt-4 space-y-4">
              <VideoRow
                title="🎬 Viral Movies"
                videos={viralMovies}
                onOpenUnlockModal={handleOpenUnlockModal}
                onOpenShare={(video) => {
                  setShareTargetVideo(video);
                  setIsShareModalOpen(true);
                }}
              />

              {/* Between Content Sections: Native Banner Block 1 (Max 2) */}
              <AdsterraNativeBanner
                placement="content_section_banner_1"
                isTelegram={isTelegram}
                isPremium={userProfile?.isPremiumActive}
                enabled={settings.adPlacements?.nativeBannerContent ?? true}
                scriptUrl={settings.adsterraNativeBannerUrl}
                containerId={settings.adsterraNativeBannerContainer}
                userId={telegramUser.id}
              />

              <VideoRow
                title="☁️ Terabox Exclusives"
                videos={teraboxExclusives}
                onOpenUnlockModal={handleOpenUnlockModal}
                onOpenShare={(video) => {
                  setShareTargetVideo(video);
                  setIsShareModalOpen(true);
                }}
              />

              <VideoRow
                title="🔥 Trending Now"
                videos={trendingNowVideos}
                onOpenUnlockModal={handleOpenUnlockModal}
                onOpenShare={(video) => {
                  setShareTargetVideo(video);
                  setIsShareModalOpen(true);
                }}
              />

              {/* Between Content Sections: Native Banner Block 2 (Max 2) */}
              <AdsterraNativeBanner
                placement="content_section_banner_2"
                isTelegram={isTelegram}
                isPremium={userProfile?.isPremiumActive}
                enabled={settings.adPlacements?.nativeBannerContent ?? true}
                scriptUrl={settings.adsterraNativeBannerUrl}
                containerId={settings.adsterraNativeBannerContainer}
                userId={telegramUser.id}
              />

              <VideoRow
                title="⭐ Recommended"
                videos={recommendedVideos}
                onOpenUnlockModal={handleOpenUnlockModal}
                onOpenShare={(video) => {
                  setShareTargetVideo(video);
                  setIsShareModalOpen(true);
                }}
              />

              {/* Official Telegram Ecosystem Join Cards */}
              <TelegramJoinCards
                settings={settings}
                isTelegram={isTelegram}
                telegramUserId={telegramUser.id}
                initData={rawInitData}
              />
            </div>
          )}
        </main>
      )}

      {/* Terabox Link Unlocker & Ad Monetization Modal */}
      <UnlockModal
        video={selectedVideo}
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        globalAdLink={settings.globalAdLink}
        telegramUser={telegramUser}
        userProfile={userProfile}
        settings={settings}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
        onOpenShare={() => {
          setShareTargetVideo(selectedVideo);
          setIsShareModalOpen(true);
        }}
        onViewIncremented={(videoId, newCount) => {
          handleViewIncremented(videoId, newCount);
          syncUser();
        }}
      />

      {/* 24-Hour Premium Reward Modal */}
      <PremiumRewardModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        telegramUser={telegramUser}
        userProfile={userProfile}
        onProfileUpdated={(updated) => setUserProfile(updated)}
        globalAdLink={settings.globalAdLink}
      />

      {/* Social / Telegram Deep-Link Sharing Modal */}
      <ShareModal
        video={shareTargetVideo || selectedVideo || featuredVideo}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        telegramUser={telegramUser}
        userProfile={userProfile}
        telegramChannelUrl={settings.telegramChannelUrl}
      />

      {/* Telegram User Identity Simulator */}
      <TelegramUserSelector
        currentUser={telegramUser}
        onSelectUser={(user) => {
          setTelegramUser(user);
          sendPing();
        }}
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onTriggerPing={sendPing}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#07080c] py-6 pb-24 sm:pb-6 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#e50914]">{settings.appName}</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span aria-hidden="true">·</span>
            <span>Optimized for Telegram WebApp</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={settings.telegramChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <Send className="h-3.5 w-3.5 text-[#2AABEE]" />
              <span>Official Telegram Channel</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Persistent Bottom-Navigation Bar for Mobile View (< 640px) */}
      <MobileBottomNav
        activeTab={mobileActiveTab}
        onSelectTab={setMobileActiveTab}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        telegramUser={telegramUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
      />
    </div>
  );
}
