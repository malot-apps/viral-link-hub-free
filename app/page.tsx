'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import HeroFeatured from '@/components/HeroFeatured';
import VideoRow from '@/components/VideoRow';
import UnlockModal from '@/components/UnlockModal';
import TelegramUserSelector from '@/components/TelegramUserSelector';
import AdminDashboard from '@/components/AdminDashboard';
import MaintenanceScreen from '@/components/MaintenanceScreen';
import MobileBottomNav from '@/components/MobileBottomNav';
import { IVideo, ISettings, ITelegramUser } from '@/lib/types';
import { Search, Cloud, Send } from 'lucide-react';

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
        themeParams?: Record<string, string>;
      };
    };
  }
}

export default function HomePage() {
  // Application Settings
  const [settings, setSettings] = useState<ISettings>({
    appName: 'VIRAL LINK HUB',
    maintenanceMode: false,
    globalAdLink: 'https://monetag.com/direct?zone=98765&ref=virallinkhub',
    defaultAdsRequired: 2,
    announcementBannerText: '🔥 High-Speed Terabox Links active! Complete sponsor task to unlock.',
    telegramChannelUrl: 'https://t.me/virallinkhub',
  });

  // Movie Catalog
  const [movies, setMovies] = useState<IVideo[]>([]);
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
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [maintenanceBypassed, setMaintenanceBypassed] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<string>('home');

  // Live Stats & Heartbeat
  const [liveUsersCount, setLiveUsersCount] = useState<number>(3);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Initialize Telegram WebApp or local storage asynchronously
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        if (tg.initDataUnsafe?.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        }
      }

      const savedToken = localStorage.getItem('vlh_admin_token');
      if (savedToken) {
        setAdminToken(savedToken);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch App Configuration
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/app-config');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch {
      // non-fatal
    }
  }, []);

  // Fetch Movies
  const loadMovies = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/movies');
      const data = await res.json();
      if (data.success && data.data) {
        setMovies(data.data);
      }
    } catch {
      // non-fatal
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

  useEffect(() => {
    loadConfig();
    loadMovies();
    sendPing();

    // Ping every 30 seconds to maintain 5-minute sliding session window
    const pingInterval = setInterval(sendPing, 30000);
    return () => clearInterval(pingInterval);
  }, [loadConfig, loadMovies, sendPing]);

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

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('vlh_admin_token', token);
  };

  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('vlh_admin_token');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col font-sans">
      {/* Dynamic Announcement Banner */}
      <AnnouncementBanner text={settings.announcementBannerText} />

      {/* Top Bar Navigation */}
      <Navbar
        appName={settings.appName}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        telegramUser={telegramUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        isAdminLoggedIn={Boolean(adminToken)}
        liveUsersCount={liveUsersCount}
      />

      {/* Maintenance Mode Handling */}
      {settings.maintenanceMode && !adminToken && !maintenanceBypassed ? (
        <MaintenanceScreen
          appName={settings.appName}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onBypass={() => setMaintenanceBypassed(true)}
        />
      ) : (
        <main className="flex-1 pb-16">
          {/* Hero Featured Video Section (Shown when viewing Browse/All and no search query) */}
          {activeCategory === 'All' && !searchQuery.trim() && (
            <HeroFeatured
              video={featuredVideo}
              onOpenUnlockModal={handleOpenUnlockModal}
            />
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
              />

              <VideoRow
                title="☁️ Terabox Exclusives"
                videos={teraboxExclusives}
                onOpenUnlockModal={handleOpenUnlockModal}
              />

              <VideoRow
                title="🔥 Trending Now"
                videos={trendingNowVideos}
                onOpenUnlockModal={handleOpenUnlockModal}
              />

              <VideoRow
                title="⭐ Recommended"
                videos={recommendedVideos}
                onOpenUnlockModal={handleOpenUnlockModal}
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
        onViewIncremented={handleViewIncremented}
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

      {/* Admin Dashboard & Management Portal */}
      <AdminDashboard
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        adminToken={adminToken}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
        onVideosUpdated={loadMovies}
        allVideos={movies}
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
      />
    </div>
  );
}
