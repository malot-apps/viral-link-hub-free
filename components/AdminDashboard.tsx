'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
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
  Search,
  ExternalLink,
  AlertTriangle,
  Radio,
  Clock,
  Database,
  ArrowLeft,
  ChevronRight,
  Info,
  TrendingUp,
} from 'lucide-react';
import { IVideo, ISettings, IVisitorLog } from '@/lib/types';
import AdminGrowthTab from '@/components/AdminGrowthTab';
import ImageUploader from '@/components/ImageUploader';

interface AdminStats {
  liveActiveUsers: number;
  totalUniqueVisitors: number | string;
  totalViews: number | string;
  adsRevenueClicks: number | string;
  totalVideos: number;
  featuredVideos: number;
  activeWindowMinutes: number;
  recentLogs: IVisitorLog[];
  generatedAt: string;
  mode: 'production' | 'demo';
}

interface AuditLogItem {
  _id: string;
  admin: string;
  action: string;
  target?: string;
  metadata?: Record<string, any>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

interface AdminDashboardProps {
  standalone?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onSettingsUpdated?: (newSettings: ISettings) => void;
  onVideosUpdated?: () => void;
}

export default function AdminDashboard({
  standalone = false,
  isOpen = true,
  onClose,
  onSettingsUpdated,
  onVideosUpdated,
}: AdminDashboardProps) {
  // Authentication & Session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ username: string; role: string } | null>(null);
  const [appMode, setAppMode] = useState<'production' | 'demo'>('production');

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'growth' | 'videos' | 'settings' | 'audit' | 'api-console'>('analytics');

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Stats state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Video catalog state
  const [videosList, setVideosList] = useState<IVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [videoCategoryFilter, setVideoCategoryFilter] = useState('All');
  const [videoFeaturedFilter, setVideoFeaturedFilter] = useState<boolean | null>(null);

  // Video modal & delete confirmation
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoFormError, setVideoFormError] = useState('');
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [deleteConfirmVideo, setDeleteConfirmVideo] = useState<IVideo | null>(null);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);

  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    posterUrl: '/images/hero_viral_cyberpunk.jpg',
    bannerUrl: '/images/hero_viral_cyberpunk.jpg',
    category: 'Trending',
    streamUrl: '',
    directAdLink: '',
    requiredAdsCount: 2,
    isFeatured: false,
    fileSize: '1.4 GB',
    quality: '1080p HD',
    tags: 'Action, Viral',
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<ISettings>({
    appName: 'VIRAL LINK HUB',
    maintenanceMode: false,
    globalAdLink: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
    primaryDirectLink: 'https://monetag.com/direct?zone=78912&ref=virallinkhub',
    secondaryDirectLink: '',
    defaultAdsRequired: 2,
    announcementBannerText: '🔥 High-Speed Direct Cloud Streams active!',
    telegramChannelUrl: 'https://t.me/virallinkhub_official',
    forceJoinChannel: false,
    bannerScriptCode: '',
    popunderScriptCode: '',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // API Console State
  const [apiConsoleResult, setApiConsoleResult] = useState<{
    endpoint: string;
    status: number;
    data: unknown;
  } | null>(null);
  const [isLoadingConsole, setIsLoadingConsole] = useState(false);

  // Check existing session via HttpOnly Cookie
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/auth/me');
      const data = await res.json();
      if (data.success && data.authenticated) {
        setIsAuthenticated(true);
        setAdminUser(data.admin);
        setAppMode(data.mode);
      } else {
        setIsAuthenticated(false);
        if (data.mode) setAppMode(data.mode);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Fetch admin stats
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/v1/admin/stats');
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
        if (data.data.mode) setAppMode(data.data.mode);
      }
    } catch {
      // non-fatal
    } finally {
      setIsLoadingStats(false);
    }
  }, [isAuthenticated]);

  // Fetch videos
  const fetchVideosList = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingVideos(true);
    try {
      const res = await fetch('/api/v1/admin/videos');
      const data = await res.json();
      if (data.success && data.data) {
        setVideosList(data.data);
      }
    } catch {
      // non-fatal
    } finally {
      setIsLoadingVideos(false);
    }
  }, [isAuthenticated]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/v1/admin/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettingsForm(data.data);
      }
    } catch {
      // non-fatal
    }
  }, [isAuthenticated]);

  // Fetch audit logs
  const fetchAuditLogsList = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingAudit(true);
    try {
      const res = await fetch('/api/v1/admin/audit-logs?limit=50');
      const data = await res.json();
      if (data.success && data.data) {
        setAuditLogs(data.data);
      }
    } catch {
      // non-fatal
    } finally {
      setIsLoadingAudit(false);
    }
  }, [isAuthenticated]);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchVideosList();
      fetchSettings();
      fetchAuditLogsList();

      const interval = setInterval(fetchStats, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchStats, fetchVideosList, fetchSettings, fetchAuditLogsList]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        setAdminUser(data.admin);
        if (data.mode) setAppMode(data.mode);
        setPasswordInput('');
        fetchStats();
        fetchVideosList();
        fetchSettings();
      } else {
        setLoginError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setLoginError('Server network error during authentication.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/v1/admin/auth/logout', { method: 'POST' });
    } catch {
      // non-fatal
    }
    setIsAuthenticated(false);
    setAdminUser(null);
    setStats(null);
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(false);
    setSettingsError('');

    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSuccess(true);
        if (onSettingsUpdated) onSettingsUpdated(data.data);
        fetchAuditLogsList();
        setTimeout(() => setSettingsSuccess(false), 4000);
      } else {
        setSettingsError(data.error || 'Failed to update settings');
      }
    } catch {
      setSettingsError('Network failure saving settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Update Partial Settings (for Growth & Placements tab)
  const handleUpdatePartialSettings = async (partialSettings: Partial<ISettings>): Promise<boolean> => {
    try {
      const merged = { ...settingsForm, ...partialSettings };
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSettingsForm(data.data);
        if (onSettingsUpdated) onSettingsUpdated(data.data);
        fetchAuditLogsList();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Open Video Modal
  const handleOpenVideoModal = (video?: IVideo) => {
    setVideoFormError('');
    if (video) {
      setEditingVideoId(video._id);
      setVideoForm({
        title: video.title,
        description: video.description || '',
        posterUrl: video.posterUrl,
        bannerUrl: video.bannerUrl || video.posterUrl,
        category: video.category,
        streamUrl: video.streamUrl || video.targetLink || '',
        directAdLink: video.directAdLink || '',
        requiredAdsCount: video.requiredAdsCount ?? 2,
        isFeatured: Boolean(video.isFeatured),
        fileSize: video.fileSize || '1.4 GB',
        quality: video.quality || '1080p HD',
        tags: Array.isArray(video.tags) ? video.tags.join(', ') : '',
      });
    } else {
      setEditingVideoId(null);
      setVideoForm({
        title: '',
        description: '',
        posterUrl: '',
        bannerUrl: '',
        category: 'Trending',
        streamUrl: '',
        directAdLink: '',
        requiredAdsCount: 2,
        isFeatured: false,
        fileSize: '1.4 GB',
        quality: '1080p HD',
        tags: 'Viral, Streaming, HD',
      });
    }
    setVideoModalOpen(true);
  };

  // Save Video
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoFormError('');

    if (!videoForm.title.trim() || !videoForm.streamUrl.trim() || !videoForm.posterUrl.trim()) {
      setVideoFormError('Title, Stream URL, and Poster Image are required. Please upload a poster.');
      return;
    }

    setIsSavingVideo(true);

    try {
      const url = editingVideoId
        ? `/api/v1/admin/videos/${editingVideoId}`
        : '/api/v1/admin/videos';
      const method = editingVideoId ? 'PUT' : 'POST';

      const payload = {
        title: videoForm.title.trim(),
        description: videoForm.description.trim(),
        posterUrl: videoForm.posterUrl.trim(),
        bannerUrl: videoForm.bannerUrl.trim() || videoForm.posterUrl.trim(),
        category: videoForm.category,
        streamUrl: videoForm.streamUrl.trim(),
        targetLink: videoForm.streamUrl.trim(),
        directAdLink: videoForm.directAdLink.trim(),
        requiredAdsCount: Number(videoForm.requiredAdsCount),
        isFeatured: Boolean(videoForm.isFeatured),
        fileSize: videoForm.fileSize.trim(),
        quality: videoForm.quality.trim(),
        tags: videoForm.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setVideoModalOpen(false);
        fetchVideosList();
        fetchStats();
        fetchAuditLogsList();
        if (onVideosUpdated) onVideosUpdated();
      } else {
        setVideoFormError(data.error || 'Failed to save video record.');
      }
    } catch {
      setVideoFormError('Network communication error saving video.');
    } finally {
      setIsSavingVideo(false);
    }
  };

  // Delete Video
  const handleConfirmDelete = async () => {
    if (!deleteConfirmVideo) return;
    setIsDeletingVideo(true);

    try {
      const res = await fetch(`/api/v1/admin/videos/${deleteConfirmVideo._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmVideo(null);
        fetchVideosList();
        fetchStats();
        fetchAuditLogsList();
        if (onVideosUpdated) onVideosUpdated();
      }
    } catch {
      // non-fatal
    } finally {
      setIsDeletingVideo(false);
    }
  };

  // API Console Runner
  const handleTestEndpoint = async (endpoint: string, method = 'GET', body?: unknown) => {
    setIsLoadingConsole(true);
    setApiConsoleResult(null);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      setApiConsoleResult({
        endpoint,
        status: res.status,
        data,
      });
    } catch (err: any) {
      setApiConsoleResult({
        endpoint,
        status: 500,
        data: { error: err.message || 'Execution error' },
      });
    } finally {
      setIsLoadingConsole(false);
    }
  };

  // Filtered video list for UI
  const filteredVideos = useMemo(() => {
    return videosList.filter((v) => {
      const matchesSearch =
        !videoSearchQuery.trim() ||
        v.title.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
        v.tags?.some((t) => t.toLowerCase().includes(videoSearchQuery.toLowerCase()));

      const matchesCategory =
        videoCategoryFilter === 'All' ||
        v.category.toLowerCase() === videoCategoryFilter.toLowerCase();

      const matchesFeatured =
        videoFeaturedFilter === null || v.isFeatured === videoFeaturedFilter;

      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [videosList, videoSearchQuery, videoCategoryFilter, videoFeaturedFilter]);

  if (!isOpen && !standalone) return null;

  // -------------------------------------------------------------
  // VIEW: LOGIN SCREEN (When Unauthenticated)
  // -------------------------------------------------------------
  if (isAuthenticated === false) {
    return (
      <div className={`${standalone ? 'min-h-screen' : 'fixed inset-0 z-50'} flex items-center justify-center bg-[#0b0d13] p-4`}>
        <div className="w-full max-w-md bg-[#131722]/90 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e50914] to-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white uppercase">
                  Viral Link Hub
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  Executive Security Portal
                </span>
              </div>
            </div>

            {/* Application Mode Badge */}
            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                appMode === 'demo'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  appMode === 'demo' ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              {appMode}
            </div>
          </div>

          {/* Demo helper banner if in demo mode */}
          {appMode === 'demo' && (
            <div className="mb-6 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-200/90 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Demo Mode Active</p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Demo credentials: <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300 font-mono">demo_admin</code> / <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300 font-mono">ViralDemo2026!</code>
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {loginError && (
            <div className="mb-6 p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Administrator Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter admin username"
                required
                autoComplete="username"
                className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Security Passphrase
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-red-600/30 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Open Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Hub</span>
            </Link>
            <span className="font-mono text-[11px]">v1.0 Production</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: LOADING SESSION
  // -------------------------------------------------------------
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0d13]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-[#e50914]" />
          <span className="text-xs uppercase tracking-widest font-mono">Initializing Console...</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: AUTHENTICATED DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className={`${standalone ? 'min-h-screen' : 'fixed inset-0 z-50 overflow-y-auto'} bg-[#0b0d13] text-[#e2e8f0]`}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0e121b]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!standalone && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e50914] flex items-center justify-center font-black text-white text-base shadow-md shadow-red-600/30">
              V
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-none uppercase">
                Viral Link Hub
              </h1>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Production Admin Engine
              </span>
            </div>
          </Link>

          {/* Mode Pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${
              appMode === 'demo'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                appMode === 'demo' ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            {appMode === 'demo' ? 'Demo Mode Active' : 'Production Mode (Supabase)'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>

          <button
            onClick={() => {
              fetchStats();
              fetchVideosList();
              fetchAuditLogsList();
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin text-red-500' : ''}`} />
          </button>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">
              {adminUser?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-300">
              {adminUser?.username || 'Admin'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 p-1 bg-[#131722] rounded-xl border border-white/5 mb-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('growth')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition whitespace-nowrap ${
              activeTab === 'growth'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Growth & Monetization Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition whitespace-nowrap ${
              activeTab === 'videos'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Video Catalog ({videosList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Monetization & Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('api-console')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition whitespace-nowrap ${
              activeTab === 'api-console'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>System Diagnostics</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & ANALYTICS                                   */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#131722]/80 border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Live Active Users</span>
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {stats?.liveActiveUsers ?? 1}
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>5-minute sliding session window</span>
                </div>
              </div>

              <div className="bg-[#131722]/80 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Unique Visitors</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {stats ? Number(stats.totalUniqueVisitors).toLocaleString() : 'N/A'}
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  Total unique Telegram IDs tracked
                </div>
              </div>

              <div className="bg-[#131722]/80 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Video Views</span>
                  <Eye className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {stats ? Number(stats.totalViews).toLocaleString() : 'N/A'}
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  Aggregated public streaming views
                </div>
              </div>

              <div className="bg-[#131722]/80 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Monetization Ad Clicks</span>
                  <MousePointerClick className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {stats ? Number(stats.adsRevenueClicks).toLocaleString() : 'N/A'}
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  Verified unlock task clicks
                </div>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#131722]/50 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Catalog Volume</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {stats?.totalVideos ?? videosList.length} Videos
                  </div>
                </div>
                <Film className="w-8 h-8 text-slate-600" />
              </div>

              <div className="bg-[#131722]/50 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Featured Hero Spots</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {stats?.featuredVideos ?? videosList.filter((v) => v.isFeatured).length} Active
                  </div>
                </div>
                <Sparkles className="w-8 h-8 text-amber-500/50" />
              </div>

              <div className="bg-[#131722]/50 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Database Layer</div>
                  <div className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>{appMode === 'production' ? 'Supabase PostgreSQL' : 'Demo Mode (Simulated)'}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    appMode === 'production'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {appMode.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Recent Audit & System Stream */}
            <div className="bg-[#131722]/80 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#e50914]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Recent Activity Stream
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
                >
                  <span>View All Logs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                  stats.recentLogs.slice(0, 6).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-[#181d2c]/60 border border-white/5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div>
                          <span className="font-semibold text-white">{log.userId}</span>
                          <span className="text-slate-400 ml-2 font-mono">{log.path}</span>
                        </div>
                      </div>
                      <div className="text-slate-500 text-[11px] font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No activity logs recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: GROWTH & MONETIZATION ENGINE                           */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'growth' && (
          <div className="space-y-6">
            <AdminGrowthTab
              settings={settingsForm}
              onUpdateSettings={handleUpdatePartialSettings}
              appMode={appMode}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: VIDEO CATALOG                                          */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            {/* Action Bar: Search, Filters, Add Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131722]/80 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={videoSearchQuery}
                    onChange={(e) => setVideoSearchQuery(e.target.value)}
                    placeholder="Search by title, tags, or description..."
                    className="w-full bg-[#181d2c] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e50914] transition"
                  />
                </div>

                <select
                  value={videoCategoryFilter}
                  onChange={(e) => setVideoCategoryFilter(e.target.value)}
                  className="bg-[#181d2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition"
                >
                  <option value="All">All Categories</option>
                  <option value="Trending">Trending</option>
                  <option value="Action">Action</option>
                  <option value="Anime">Anime</option>
                  <option value="Viral Clips">Viral Clips</option>
                  <option value="VIP Cloud">VIP Cloud</option>
                  <option value="Recommended">Recommended</option>
                </select>

                <button
                  onClick={() =>
                    setVideoFeaturedFilter(
                      videoFeaturedFilter === null ? true : videoFeaturedFilter ? false : null
                    )
                  }
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                    videoFeaturedFilter === true
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : videoFeaturedFilter === false
                      ? 'bg-slate-800 text-slate-300 border-white/10'
                      : 'bg-[#181d2c] text-slate-400 border-white/5'
                  }`}
                  title="Filter Featured"
                >
                  ★ {videoFeaturedFilter === true ? 'Featured Only' : videoFeaturedFilter === false ? 'Standard' : 'All'}
                </button>
              </div>

              <button
                onClick={() => handleOpenVideoModal()}
                className="px-4 py-2.5 bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-md shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Video</span>
              </button>
            </div>

            {/* Video List Table */}
            <div className="bg-[#131722]/80 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181d2c] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/5">
                    <tr>
                      <th className="py-3.5 px-4">Video Asset</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Views</th>
                      <th className="py-3.5 px-4">Quality & Size</th>
                      <th className="py-3.5 px-4">Featured</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {isLoadingVideos ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e50914]" />
                          <span>Loading Video Catalog...</span>
                        </td>
                      </tr>
                    ) : filteredVideos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No videos match your current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredVideos.map((video) => (
                        <tr key={video._id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-9 rounded-lg bg-black/40 overflow-hidden relative border border-white/10 shrink-0">
                                {video.posterUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={video.posterUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Film className="w-5 h-5 m-auto text-slate-600" />
                                )}
                              </div>
                              <div className="max-w-xs">
                                <div className="font-bold text-white truncate">{video.title}</div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {video.description || 'No description provided'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[11px]">
                              {video.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-300">
                            {Number(video.viewsCount || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            <span className="font-semibold text-white">{video.quality || '1080p HD'}</span>
                            <span className="ml-1 text-[11px]">({video.fileSize || '1.4 GB'})</span>
                          </td>
                          <td className="py-3 px-4">
                            {video.isFeatured ? (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                FEATURED
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenVideoModal(video)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                                title="Edit Video"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmVideo(video)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
                                title="Delete Video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: SETTINGS & MONETIZATION                                */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl bg-[#131722]/80 border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  System Settings & Ad Monetization
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure direct sponsor ad links, maintenance switches, and Telegram parameters.
                </p>
              </div>

              {settingsSuccess && (
                <div className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Settings Saved</span>
                </div>
              )}
            </div>

            {settingsError && (
              <div className="mb-6 p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Application Name & Maintenance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Application Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.appName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, appName: e.target.value })}
                    className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Maintenance Mode
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSettingsForm({ ...settingsForm, maintenanceMode: !settingsForm.maintenanceMode })
                    }
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                      settingsForm.maintenanceMode
                        ? 'bg-red-500/20 border-red-500/40 text-red-300'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    <span>{settingsForm.maintenanceMode ? 'ACTIVE (Hub Locked)' : 'DISABLED (Hub Operational)'}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${settingsForm.maintenanceMode ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  </button>
                </div>
              </div>

              {/* Announcement Banner */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Announcement Banner Headline
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementBannerText}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, announcementBannerText: e.target.value })
                  }
                  className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] transition"
                />
              </div>

              {/* Monetization Direct Links */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-[#e50914] uppercase tracking-wider">
                  Ad Monetization Gateways
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Primary Direct Sponsor Link
                    </label>
                    <input
                      type="url"
                      value={settingsForm.primaryDirectLink}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, primaryDirectLink: e.target.value })
                      }
                      placeholder="https://monetag.com/direct?zone=..."
                      className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Secondary Fallback Ad Link
                    </label>
                    <input
                      type="url"
                      value={settingsForm.secondaryDirectLink || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, secondaryDirectLink: e.target.value })
                      }
                      placeholder="https://adsterra.com/direct?zone=..."
                      className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] transition font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Default Ads Required Before Link Unlock ({settingsForm.defaultAdsRequired} task/s)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={settingsForm.defaultAdsRequired}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, defaultAdsRequired: Number(e.target.value) })
                    }
                    className="w-full accent-[#e50914]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>0 (Free Direct)</span>
                    <span>1 Ad</span>
                    <span>2 Ads (Recommended)</span>
                    <span>3 Ads</span>
                    <span>4 Ads</span>
                    <span>5 Ads</span>
                  </div>
                </div>
              </div>

              {/* Telegram Channel Integration */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Telegram Integration
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Official Channel URL
                    </label>
                    <input
                      type="url"
                      value={settingsForm.telegramChannelUrl}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, telegramChannelUrl: e.target.value })
                      }
                      className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Force Channel Membership
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          forceJoinChannel: !settingsForm.forceJoinChannel,
                        })
                      }
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                        settingsForm.forceJoinChannel
                          ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                          : 'bg-slate-800 border-white/10 text-slate-400'
                      }`}
                    >
                      <span>{settingsForm.forceJoinChannel ? 'Forced Subscription Required' : 'Optional'}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${settingsForm.forceJoinChannel ? 'bg-sky-400' : 'bg-slate-600'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3 bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-red-600/30 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving System Settings...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Apply Changes to Production</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: AUDIT TRAIL                                            */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#131722]/80 border border-white/10 rounded-2xl p-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Security Audit Logs ({auditLogs.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tamper-resistant audit log of administrator operations, auth events, and setting updates.
                </p>
              </div>
              <button
                onClick={fetchAuditLogsList}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? 'animate-spin' : ''}`} />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="bg-[#131722]/80 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181d2c] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/5">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Operator</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target Resource</th>
                      <th className="py-3 px-4">Client IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-mono text-[11px]">
                    {isLoadingAudit ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500 font-sans">
                          Loading audit records...
                        </td>
                      </tr>
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500 font-sans">
                          No audit events recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-white font-semibold">{log.admin}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 uppercase text-[10px]">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-sans">{log.target || '—'}</td>
                          <td className="py-3 px-4 text-slate-500">{log.ip}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: SYSTEM DIAGNOSTICS & API CONSOLE                       */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'api-console' && (
          <div className="space-y-6">
            {/* System Status Panel */}
            <div className="bg-[#131722]/80 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Production Security & Architecture Status</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#181d2c]/60 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Application Mode:</span>
                    <span className="font-bold text-white font-mono uppercase">{appMode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Authentication Scheme:</span>
                    <span className="font-bold text-emerald-400 font-mono">HttpOnly Cookie + JWT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Session Cookie Name:</span>
                    <span className="font-bold text-slate-300 font-mono">vlh_admin_session</span>
                  </div>
                </div>

                <div className="p-4 bg-[#181d2c]/60 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Database Layer:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {appMode === 'production' ? 'Supabase PostgreSQL (@supabase/supabase-js)' : 'Demo Mode (Isolated Catalog)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Fail-Closed Safety Gate:</span>
                    <span className="font-bold text-emerald-400 font-mono">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Login Brute-Force Rate Limiter:</span>
                    <span className="font-bold text-emerald-400 font-mono">Enabled (5 attempts / 15m)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* API Endpoint Tester */}
            <div className="bg-[#131722]/80 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#e50914]" />
                <span>Live Route Handler Diagnostic Tester</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <button
                  onClick={() => handleTestEndpoint('/api/v1/app-config', 'GET')}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition"
                >
                  <span className="text-[10px] font-bold text-emerald-400 block font-mono">GET</span>
                  <span className="text-xs text-white font-medium">/api/v1/app-config</span>
                </button>

                <button
                  onClick={() => handleTestEndpoint('/api/v1/movies', 'GET')}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition"
                >
                  <span className="text-[10px] font-bold text-emerald-400 block font-mono">GET</span>
                  <span className="text-xs text-white font-medium">/api/v1/movies</span>
                </button>

                <button
                  onClick={() =>
                    handleTestEndpoint('/api/v1/analytics/ping', 'POST', { userId: 108492041 })
                  }
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition"
                >
                  <span className="text-[10px] font-bold text-sky-400 block font-mono">POST</span>
                  <span className="text-xs text-white font-medium">/api/v1/analytics/ping</span>
                </button>

                <button
                  onClick={() => handleTestEndpoint('/api/v1/admin/stats', 'GET')}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition"
                >
                  <span className="text-[10px] font-bold text-amber-400 block font-mono">GET (Auth)</span>
                  <span className="text-xs text-white font-medium">/api/v1/admin/stats</span>
                </button>
              </div>

              {isLoadingConsole && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e50914]" />
                  <span>Executing endpoint call...</span>
                </div>
              )}

              {apiConsoleResult && (
                <div className="mt-4 p-4 bg-[#0a0d14] rounded-xl border border-white/10 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="text-slate-400">{apiConsoleResult.endpoint}</span>
                    <span
                      className={`font-bold ${
                        apiConsoleResult.status >= 200 && apiConsoleResult.status < 300
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      HTTP {apiConsoleResult.status}
                    </span>
                  </div>
                  <pre className="text-slate-300 max-h-60 overflow-y-auto scrollbar-none whitespace-pre-wrap">
                    {JSON.stringify(apiConsoleResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT VIDEO                                       */}
      {/* ------------------------------------------------------------- */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-[#131722] border border-white/10 rounded-2xl p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingVideoId ? 'Edit Video Catalog Asset' : 'Add New Video to Hub'}
              </h3>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {videoFormError && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{videoFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Title *</label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="e.g. Neon Protocol: Cyber Shadow"
                  className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  placeholder="Plot summary, release notes..."
                  className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
                  <select
                    value={videoForm.category}
                    onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                    className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition"
                  >
                    <option value="Trending">Trending</option>
                    <option value="Action">Action</option>
                    <option value="Anime">Anime</option>
                    <option value="Viral Clips">Viral Clips</option>
                    <option value="VIP Cloud">VIP Cloud</option>
                    <option value="Recommended">Recommended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Stream Quality</label>
                  <input
                    type="text"
                    value={videoForm.quality}
                    onChange={(e) => setVideoForm({ ...videoForm, quality: e.target.value })}
                    placeholder="4K Ultra HD / 1080p HD"
                    className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Stream URL / Master Cloud Link *
                </label>
                <input
                  type="url"
                  required
                  value={videoForm.streamUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, streamUrl: e.target.value })}
                  placeholder="https://fastcdn.stream/v/sample"
                  className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition font-mono"
                />
              </div>

              {/* Media Image Uploaders: Poster & Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <ImageUploader
                  label="Movie Poster Image"
                  imageType="poster"
                  value={videoForm.posterUrl}
                  onChange={(url) => setVideoForm((prev) => ({ ...prev, posterUrl: url }))}
                  videoId={editingVideoId || undefined}
                  required={true}
                  helpText="Recommended: 2:3 vertical (e.g. 600x900) or animated GIF"
                />

                <ImageUploader
                  label="Banner / Backdrop Image"
                  imageType="banner"
                  value={videoForm.bannerUrl}
                  onChange={(url) => setVideoForm((prev) => ({ ...prev, bannerUrl: url }))}
                  videoId={editingVideoId || undefined}
                  required={false}
                  helpText="Recommended: 16:9 landscape or animated GIF"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Direct Ad Link (Override)</label>
                  <input
                    type="url"
                    value={videoForm.directAdLink}
                    onChange={(e) => setVideoForm({ ...videoForm, directAdLink: e.target.value })}
                    placeholder="https://monetag.com/direct?zone=..."
                    className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">File Size</label>
                  <input
                    type="text"
                    value={videoForm.fileSize}
                    onChange={(e) => setVideoForm({ ...videoForm, fileSize: e.target.value })}
                    placeholder="1.4 GB"
                    className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={videoForm.tags}
                  onChange={(e) => setVideoForm({ ...videoForm, tags: e.target.value })}
                  placeholder="Action, Sci-Fi, Cyberpunk"
                  className="w-full bg-[#181d2c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e50914] transition"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={videoForm.isFeatured}
                  onChange={(e) => setVideoForm({ ...videoForm, isFeatured: e.target.checked })}
                  className="rounded accent-[#e50914] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="featured-checkbox" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Feature this movie on the Public Hero Banner
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingVideo}
                  className="px-5 py-2 bg-[#e50914] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  {isSavingVideo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{editingVideoId ? 'Save Video Changes' : 'Create Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE CONFIRMATION                                    */}
      {/* ------------------------------------------------------------- */}
      {deleteConfirmVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#131722] border border-red-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-2">Delete Video Asset?</h3>
            <p className="text-xs text-slate-400 mb-4">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-white">&ldquo;{deleteConfirmVideo.title}&rdquo;</span>? This
              action cannot be undone and will remove it from the public streaming catalog immediately.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmVideo(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingVideo}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition flex items-center gap-1.5"
              >
                {isDeletingVideo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Permanent Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
