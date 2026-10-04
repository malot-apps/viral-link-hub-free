'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Lock,
  LogOut,
  Users,
  Eye,
  MousePointerClick,
  Activity,
  Plus,
  Edit2,
  Trash2,
  Settings as SettingsIcon,
  RefreshCw,
  CheckCircle,
  Terminal,
  Shield,
  Film,
  Sparkles,
} from 'lucide-react';
import { IVideo, ISettings, IVisitorLog } from '@/lib/types';

interface AdminStats {
  liveActiveUsers: number;
  totalUniqueVisitors: number;
  totalViews: number;
  adsRevenueClicks: number;
  totalVideos: number;
  featuredVideos: number;
  activeWindowMinutes: number;
  recentLogs: IVisitorLog[];
  generatedAt: string;
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string | null;
  onLoginSuccess: (token: string) => void;
  onLogout: () => void;
  onSettingsUpdated: (newSettings: ISettings) => void;
  onVideosUpdated: () => void;
  allVideos: IVideo[];
}

export default function AdminDashboard({
  isOpen,
  onClose,
  adminToken,
  onLoginSuccess,
  onLogout,
  onSettingsUpdated,
  onVideosUpdated,
  allVideos,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'videos' | 'settings' | 'api-console'>('analytics');

  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('virallinkhub2026!');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Stats state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<ISettings>({
    appName: 'VIRAL LINK HUB',
    maintenanceMode: false,
    globalAdLink: 'https://monetag.com/direct?zone=98765&ref=virallinkhub',
    defaultAdsRequired: 2,
    announcementBannerText: '🔥 High-Speed Terabox Links active! Complete sponsor task to unlock.',
    telegramChannelUrl: 'https://t.me/virallinkhub',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Video modal state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    posterUrl: '/images/hero_viral_cyberpunk.jpg',
    bannerUrl: '/images/hero_viral_cyberpunk.jpg',
    category: 'Trending',
    targetLink: 'https://terabox.app/s/',
    targetType: 'terabox',
    directAdLink: '',
    requiredAdsCount: 2,
    isFeatured: false,
    fileSize: '1.4 GB',
    quality: '1080p HD',
  });
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // API Console State
  const [apiConsoleResult, setApiConsoleResult] = useState<{
    endpoint: string;
    status: number;
    data: unknown;
  } | null>(null);
  const [isLoadingConsole, setIsLoadingConsole] = useState(false);

  // Fetch admin stats
  const fetchStats = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/v1/admin/stats', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch {
      // non-fatal
    } finally {
      setIsLoadingStats(false);
    }
  }, [adminToken]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/v1/admin/settings', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSettingsForm(data.data);
      }
    } catch {
      // non-fatal
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken && isOpen) {
      fetchStats();
      fetchSettings();
      const interval = setInterval(fetchStats, 10000); // 10s auto-refresh
      return () => clearInterval(interval);
    }
  }, [adminToken, isOpen, fetchStats, fetchSettings]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        onLoginSuccess(data.token);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Server error during login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setIsSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSuccess(true);
        onSettingsUpdated(data.data);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch {
      // error
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Video Create/Update
  const handleOpenVideoModal = (video?: IVideo) => {
    if (video) {
      setEditingVideoId(video._id);
      setVideoForm({
        title: video.title,
        description: video.description,
        posterUrl: video.posterUrl,
        bannerUrl: video.bannerUrl || video.posterUrl,
        category: video.category,
        targetLink: video.streamUrl || video.targetLink || '',
        targetType: video.targetType || 'direct_stream',
        directAdLink: video.directAdLink || '',
        requiredAdsCount: video.requiredAdsCount ?? 2,
        isFeatured: Boolean(video.isFeatured),
        fileSize: video.fileSize || '1.4 GB',
        quality: video.quality || '1080p HD',
      });
    } else {
      setEditingVideoId(null);
      setVideoForm({
        title: '',
        description: '',
        posterUrl: '/images/hero_viral_cyberpunk.jpg',
        bannerUrl: '/images/hero_viral_cyberpunk.jpg',
        category: 'Trending',
        targetLink: 'https://terabox.app/s/',
        targetType: 'terabox',
        directAdLink: '',
        requiredAdsCount: 2,
        isFeatured: false,
        fileSize: '1.4 GB',
        quality: '1080p HD',
      });
    }
    setVideoModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setIsSavingVideo(true);

    try {
      const url = editingVideoId
        ? `/api/v1/admin/videos/${editingVideoId}`
        : '/api/v1/admin/videos';
      const method = editingVideoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(videoForm),
      });

      const data = await res.json();
      if (data.success) {
        setVideoModalOpen(false);
        onVideosUpdated();
        fetchStats();
      }
    } catch {
      // non-fatal
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!adminToken || !confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`/api/v1/admin/videos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        onVideosUpdated();
        fetchStats();
      }
    } catch {
      // error
    }
  };

  // Run test endpoint in API Console
  const handleTestEndpoint = async (endpoint: string, method: string = 'GET', body?: unknown) => {
    setIsLoadingConsole(true);
    try {
      const headers: Record<string, string> = {};
      if (endpoint.includes('/admin/')) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
      if (body) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();
      setApiConsoleResult({
        endpoint: `${method} ${endpoint}`,
        status: res.status,
        data,
      });
    } catch (err: unknown) {
      setApiConsoleResult({
        endpoint: `${method} ${endpoint}`,
        status: 500,
        data: { error: err instanceof Error ? err.message : 'Request failed' },
      });
    } finally {
      setIsLoadingConsole(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0e1017] shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#e50914] text-white font-black text-xs">
              VLH
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                VIRAL LINK HUB · Admin Operations Portal
              </h2>
              <p className="text-[11px] text-zinc-400">
                Real-Time Analytics &middot; Terabox Monetization &middot; JWT Protected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {adminToken && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-white/10 hover:text-white"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Not Logged In -> Show JWT Login */}
        {!adminToken ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-5 rounded-xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-sm">
              <div className="text-center space-y-1">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#e50914]/20 text-[#e50914]">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Admin Authentication</h3>
                <p className="text-xs text-zinc-400">
                  Enter credentials to access stats and backend controls.
                </p>
              </div>

              {loginError && (
                <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-300">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-[#e50914] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-[#e50914] focus:outline-none"
                  />
                </div>

                <div className="rounded border border-amber-500/20 bg-amber-500/10 p-2 text-[11px] text-amber-300">
                  Default credentials: <span className="font-mono font-semibold">admin</span> / <span className="font-mono font-semibold">virallinkhub2026!</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full rounded-lg bg-[#e50914] py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:bg-[#c70812] active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoggingIn ? 'Authenticating...' : 'Sign In with JWT'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 bg-zinc-900/40 px-5">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-[#e50914] text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Activity className="h-3.5 w-3.5 text-[#e50914]" />
                <span>Live Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === 'videos'
                    ? 'border-[#e50914] text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Film className="h-3.5 w-3.5 text-emerald-400" />
                <span>Video Catalog ({allVideos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'border-[#e50914] text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <SettingsIcon className="h-3.5 w-3.5 text-amber-400" />
                <span>App Settings & Ads</span>
              </button>

              <button
                onClick={() => setActiveTab('api-console')}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === 'api-console'
                    ? 'border-[#e50914] text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Terminal className="h-3.5 w-3.5 text-blue-400" />
                <span>API Tester</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* TAB 1: LIVE ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Live Active Users (last 5 min window) */}
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                          Live Active (5m)
                        </span>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                        </span>
                      </div>
                      <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                        {stats?.liveActiveUsers ?? 1}
                      </div>
                      <p className="mt-1 text-[10px] text-zinc-400">
                        Sliding window sessions
                      </p>
                    </div>

                    {/* Total Unique Visitors */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Unique Telegram IDs
                        </span>
                        <Users className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                        {stats?.totalUniqueVisitors?.toLocaleString() ?? 0}
                      </div>
                      <p className="mt-1 text-[10px] text-zinc-400">
                        Deduplicated user IDs
                      </p>
                    </div>

                    {/* Total Views */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Total Page Views
                        </span>
                        <Eye className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                        {stats?.totalViews?.toLocaleString() ?? 0}
                      </div>
                      <p className="mt-1 text-[10px] text-zinc-400">
                        Incremented on every request
                      </p>
                    </div>

                    {/* Ads Revenue Clicks */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Ad Revenue Clicks
                        </span>
                        <MousePointerClick className="h-4 w-4 text-[#e50914]" />
                      </div>
                      <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                        {stats?.adsRevenueClicks?.toLocaleString() ?? 0}
                      </div>
                      <p className="mt-1 text-[10px] text-zinc-400">
                        Direct CPM verification clicks
                      </p>
                    </div>
                  </div>

                  {/* Audit Logs Table */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Recent Telegram Request Logs (Middleware Capture)
                      </h3>
                      <button
                        onClick={fetchStats}
                        disabled={isLoadingStats}
                        className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                      >
                        <RefreshCw className={`h-3 w-3 ${isLoadingStats ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-white/10 bg-zinc-950/60">
                      <table className="w-full text-left text-xs text-zinc-300">
                        <thead className="border-b border-white/10 bg-zinc-900/60 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          <tr>
                            <th className="px-3.5 py-2.5">Telegram User ID</th>
                            <th className="px-3.5 py-2.5">IP Address</th>
                            <th className="px-3.5 py-2.5">Path</th>
                            <th className="px-3.5 py-2.5">Client User-Agent</th>
                            <th className="px-3.5 py-2.5">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                          {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                            stats.recentLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-3.5 py-2 text-[#e50914] font-semibold">
                                  {log.userId}
                                </td>
                                <td className="px-3.5 py-2 text-zinc-300">{log.ip}</td>
                                <td className="px-3.5 py-2 text-emerald-400">{log.path}</td>
                                <td className="px-3.5 py-2 text-zinc-400 truncate max-w-[200px]" title={log.userAgent}>
                                  {log.userAgent}
                                </td>
                                <td className="px-3.5 py-2 text-zinc-500 whitespace-nowrap">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-3.5 py-4 text-center text-zinc-500">
                                No visitor logs recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VIDEOS CRUD */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Video Catalog Management</h3>
                      <p className="text-xs text-zinc-400">
                        Configure Terabox links, categories, and custom sponsor ad links.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenVideoModal()}
                      className="flex items-center gap-1.5 rounded-lg bg-[#e50914] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c70812] active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add New Video</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-white/10 bg-zinc-950/60">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="border-b border-white/10 bg-zinc-900/60 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        <tr>
                          <th className="px-3.5 py-2.5">Title</th>
                          <th className="px-3.5 py-2.5">Category</th>
                          <th className="px-3.5 py-2.5">Quality / Size</th>
                          <th className="px-3.5 py-2.5">Required Ads</th>
                          <th className="px-3.5 py-2.5">Views</th>
                          <th className="px-3.5 py-2.5">Featured</th>
                          <th className="px-3.5 py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {allVideos.map((video) => (
                          <tr key={video._id} className="hover:bg-white/5 transition-colors">
                            <td className="px-3.5 py-2.5 font-medium text-white max-w-[200px] truncate">
                              {video.title}
                            </td>
                            <td className="px-3.5 py-2.5 text-zinc-400">{video.category}</td>
                            <td className="px-3.5 py-2.5 text-zinc-400 font-mono text-[11px]">
                              {video.quality || '1080p'} · {video.fileSize || '1.4 GB'}
                            </td>
                            <td className="px-3.5 py-2.5 text-amber-400 font-mono">
                              {video.requiredAdsCount} Ads
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-zinc-400 tabular-nums">
                              {video.viewsCount.toLocaleString()}
                            </td>
                            <td className="px-3.5 py-2.5">
                              {video.isFeatured ? (
                                <span className="text-[10px] text-emerald-400 font-bold uppercase">
                                  Featured
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-600">-</span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenVideoModal(video)}
                                  className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                                  title="Edit"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteVideo(video._id)}
                                  className="rounded p-1 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: APP SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Dynamic Application Settings</h3>
                    <p className="text-xs text-zinc-400">
                      Update runtime branding, toggle maintenance mode, and adjust monetization CPM links.
                    </p>
                  </div>

                  {settingsSuccess && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2.5 text-xs text-emerald-300">
                      <CheckCircle className="h-4 w-4" />
                      <span>Settings updated successfully across all clients!</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    {/* App Name */}
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        App Name
                      </label>
                      <input
                        type="text"
                        value={settingsForm.appName}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, appName: e.target.value })
                        }
                        required
                        className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-[#e50914] focus:outline-none"
                      />
                    </div>

                    {/* Maintenance Mode Toggle */}
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-900/60 p-3.5">
                      <div>
                        <div className="text-xs font-semibold text-white">Maintenance Mode</div>
                        <div className="text-[11px] text-zinc-400">
                          When enabled, non-admin visitors will see an official maintenance screen.
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={settingsForm.maintenanceMode}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              maintenanceMode: e.target.checked,
                            })
                          }
                          className="peer sr-only"
                        />
                        <div className="h-6 w-11 rounded-full bg-zinc-800 peer-checked:bg-[#e50914] peer-focus:outline-none after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>

                    {/* Global Ad Link */}
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Global Ad Link (Monetag / Adsterra / CPM URL)
                      </label>
                      <input
                        type="url"
                        value={settingsForm.globalAdLink}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, globalAdLink: e.target.value })
                        }
                        required
                        className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-[#e50914] focus:outline-none font-mono"
                      />
                    </div>

                    {/* Default Ads Required */}
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Default Sponsor Ads Required to Unlock
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={settingsForm.defaultAdsRequired}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            defaultAdsRequired: parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-[#e50914] focus:outline-none"
                      />
                    </div>

                    {/* Announcement Banner Text */}
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Announcement Banner Text
                      </label>
                      <input
                        type="text"
                        value={settingsForm.announcementBannerText}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            announcementBannerText: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-[#e50914] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="rounded-lg bg-[#e50914] px-5 py-2 text-xs font-semibold text-white shadow hover:bg-[#c70812] active:scale-95 disabled:opacity-50"
                    >
                      {isSavingSettings ? 'Saving...' : 'Save Settings'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: API TESTER CONSOLE */}
              {activeTab === 'api-console' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Interactive API Endpoint Explorer</h3>
                    <p className="text-xs text-zinc-400">
                      Execute real HTTP queries against all requirements directly and view response payloads.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleTestEndpoint('/api/v1/app-config', 'GET')}
                      className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 hover:border-white/20 hover:bg-zinc-800"
                    >
                      GET /api/v1/app-config
                    </button>
                    <button
                      onClick={() => handleTestEndpoint('/api/v1/movies', 'GET')}
                      className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 hover:border-white/20 hover:bg-zinc-800"
                    >
                      GET /api/v1/movies
                    </button>
                    <button
                      onClick={() =>
                        handleTestEndpoint('/api/v1/analytics/ping', 'POST', {
                          userId: '108492041',
                        })
                      }
                      className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/40"
                    >
                      POST /api/v1/analytics/ping
                    </button>
                    <button
                      onClick={() => handleTestEndpoint('/api/v1/admin/stats', 'GET')}
                      className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-950/40"
                    >
                      GET /api/v1/admin/stats (JWT)
                    </button>
                  </div>

                  {/* Result Terminal Box */}
                  <div className="rounded-xl border border-white/10 bg-black/80 p-4 font-mono text-xs">
                    <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-zinc-400">
                      <span>{apiConsoleResult ? apiConsoleResult.endpoint : 'Console Idle'}</span>
                      {apiConsoleResult && (
                        <span
                          className={`rounded px-1.5 py-0.5 font-bold ${
                            apiConsoleResult.status === 200
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          Status {apiConsoleResult.status}
                        </span>
                      )}
                    </div>

                    <pre className="max-h-[300px] overflow-y-auto text-zinc-300 whitespace-pre-wrap">
                      {isLoadingConsole
                        ? 'Sending request...'
                        : apiConsoleResult
                        ? JSON.stringify(apiConsoleResult.data, null, 2)
                        : '// Click any test button above to execute endpoint query'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Create/Edit Submodal */}
        {videoModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#141722] p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold text-white">
                  {editingVideoId ? 'Edit Video Link' : 'Add New Viral Terabox Video'}
                </h4>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="rounded p-1 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Title</label>
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    required
                    className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Description</label>
                  <textarea
                    rows={2}
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase">Category</label>
                    <select
                      value={videoForm.category}
                      onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                      className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Trending">Trending</option>
                      <option value="Terabox Cloud">Terabox Cloud</option>
                      <option value="Action">Action</option>
                      <option value="Viral Clips">Viral Clips</option>
                      <option value="Anime">Anime</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase">Required Ads</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={videoForm.requiredAdsCount}
                      onChange={(e) =>
                        setVideoForm({
                          ...videoForm,
                          requiredAdsCount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Target Link (Terabox / Stream)</label>
                  <input
                    type="url"
                    value={videoForm.targetLink}
                    onChange={(e) => setVideoForm({ ...videoForm, targetLink: e.target.value })}
                    required
                    className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Poster Image URL</label>
                  <input
                    type="text"
                    value={videoForm.posterUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, posterUrl: e.target.value })}
                    required
                    className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase">Quality</label>
                    <input
                      type="text"
                      value={videoForm.quality}
                      onChange={(e) => setVideoForm({ ...videoForm, quality: e.target.value })}
                      className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase">File Size</label>
                    <input
                      type="text"
                      value={videoForm.fileSize}
                      onChange={(e) => setVideoForm({ ...videoForm, fileSize: e.target.value })}
                      className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={videoForm.isFeatured}
                    onChange={(e) => setVideoForm({ ...videoForm, isFeatured: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 text-[#e50914]"
                  />
                  <label htmlFor="isFeatured" className="text-xs text-zinc-300">
                    Feature on Hero Carousel
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setVideoModalOpen(false)}
                    className="rounded px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingVideo}
                    className="rounded bg-[#e50914] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#c70812] active:scale-95"
                  >
                    {isSavingVideo ? 'Saving...' : 'Save Video'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
