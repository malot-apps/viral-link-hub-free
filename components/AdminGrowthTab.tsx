'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  Film,
  Sparkles,
  Trophy,
  Activity,
  Send,
  Share2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Lock,
  Layers,
  BarChart3,
  Percent,
  Check,
  Sliders,
  Flame,
} from 'lucide-react';
import { IGrowthAnalytics, ISettings } from '@/lib/types';

interface AdminGrowthTabProps {
  settings: ISettings;
  onUpdateSettings: (newSettings: Partial<ISettings>) => Promise<boolean>;
  appMode: 'production' | 'demo';
}

export default function AdminGrowthTab({
  settings,
  onUpdateSettings,
  appMode,
}: AdminGrowthTabProps) {
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [growthData, setGrowthData] = useState<IGrowthAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingControls, setIsSavingControls] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local settings controls
  const [controls, setControls] = useState({
    premiumRewardEnabled: settings.premiumRewardEnabled ?? true,
    premiumRequiredAds: settings.premiumRequiredAds ?? 3,
    premiumRequiredReferrals: settings.premiumRequiredReferrals ?? 3,
    premiumDurationHours: settings.premiumDurationHours ?? 24,
    referralQualificationRule: settings.referralQualificationRule ?? 'view_content',
    adFrequencyEnabled: settings.adFrequencyEnabled ?? true,
    maxAdsPerSession: settings.maxAdsPerSession ?? 5,
    maxPopundersPerSession: settings.maxPopundersPerSession ?? 1,
    adCooldownSeconds: settings.adCooldownSeconds ?? 30,
    maxAdsPerDay: settings.maxAdsPerDay ?? 20,
    adPlacements: settings.adPlacements ?? {
      homeBanner: true,
      contentCard: true,
      contentDetails: true,
      unlockAction: true,
      betweenNav: true,
      popunder: true,
      premiumRewardArea: true,
    },
  });

  const loadGrowthData = useCallback(async (p: 'today' | '7d' | '30d' | 'all') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/growth?period=${p}`);
      const data = await res.json();
      if (data.success && data.data) {
        setGrowthData(data.data);
      }
    } catch {
      // non-fatal
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrowthData(period);
  }, [period, loadGrowthData]);

  const handleSaveControls = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingControls(true);
    setSaveSuccess(false);

    const success = await onUpdateSettings(controls);
    setIsSavingControls(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const isDemo = appMode === 'demo' || growthData?.mode === 'demo';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Period Filter & Mode Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-white/5 bg-[#121520] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Growth & Telegram Funnel</h2>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                  isDemo
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                }`}
              >
                {isDemo ? 'DEMO DATA' : 'REAL DATA (MONGODB)'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Real-time user referrals, Telegram engagement, 24h VIP rewards & monetization
            </p>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['today', '7d', '30d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                period === p
                  ? 'bg-[#e50914] text-white shadow-sm'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {p === 'today' ? 'Today' : p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
          <button
            onClick={() => loadGrowthData(period)}
            className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white transition ml-1"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid 1: User & Funnel KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="rounded-xl border border-white/5 bg-[#121520] p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Telegram Users</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {growthData ? growthData.totalUsers.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>+{growthData?.newUsers ?? 0}</span>
            <span className="text-zinc-500">in selected period</span>
          </div>
        </div>

        {/* Returning Users & DAU */}
        <div className="rounded-xl border border-white/5 bg-[#121520] p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Daily Active Users (DAU)</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {growthData ? growthData.dailyActiveUsers.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-zinc-400">
            <span>{growthData?.returningUsers ?? 0} returning visitors</span>
          </div>
        </div>

        {/* Qualified Referrals */}
        <div className="rounded-xl border border-white/5 bg-[#121520] p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Qualified Referrals</span>
            <CheckCircle2 className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {growthData ? growthData.qualifiedReferrals.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-zinc-400">
            <span>from {growthData?.referralOpens ?? 0} referral opens</span>
          </div>
        </div>

        {/* Premium VIP Pass Holders */}
        <div className="rounded-xl border border-white/5 bg-[#121520] p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Active 24h VIP Passes</span>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-yellow-300">
            {growthData ? growthData.activePremiumUsers.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-zinc-400">
            <span>{growthData?.premiumRewardsClaimed ?? 0} total passes claimed</span>
          </div>
        </div>
      </div>

      {/* Grid 2: Telegram Growth Funnel & Ad Monetization Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Telegram Growth Funnel */}
        <div className="rounded-xl border border-white/5 bg-[#121520] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-[#2AABEE]" />
              <span>Telegram Growth Funnel</span>
            </h3>
            <span className="text-xs text-zinc-500">Bot & Channel Conversion</span>
          </div>

          <div className="space-y-3">
            {/* Step 1: Bot Starts */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-white/5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2AABEE]/20 text-[#2AABEE] font-bold text-[11px]">
                  1
                </span>
                <span className="font-medium text-zinc-200">Bot Starts (/start commands)</span>
              </div>
              <span className="font-mono font-bold text-white">
                {growthData?.botStarts ?? 0}
              </span>
            </div>

            {/* Step 2: Mini App Opens */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-white/5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                  2
                </span>
                <span className="font-medium text-zinc-200">Telegram Mini App Launches</span>
              </div>
              <span className="font-mono font-bold text-white">
                {growthData?.miniAppOpens ?? 0}
              </span>
            </div>

            {/* Step 3: Channel Clicks */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-white/5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/20 text-purple-400 font-bold text-[11px]">
                  3
                </span>
                <span className="font-medium text-zinc-200">Channel CTA Clicks & Verifications</span>
              </div>
              <span className="font-mono font-bold text-white">
                {growthData?.channelClicks ?? 0} clicks · {growthData?.channelVerifications ?? 0} joins
              </span>
            </div>

            {/* Step 4: Viral Shares */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-white/5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/20 text-sky-400 font-bold text-[11px]">
                  4
                </span>
                <span className="font-medium text-zinc-200">Trackable Content Shares</span>
              </div>
              <span className="font-mono font-bold text-white">
                {growthData?.sharesCount ?? 0} shares
              </span>
            </div>
          </div>
        </div>

        {/* Professional Ad Monetization Performance */}
        <div className="rounded-xl border border-white/5 bg-[#121520] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span>Ad Monetization & Conversions</span>
            </h3>
            <span className="text-xs text-zinc-500">Live CPM Telemetry</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5">
              <div className="text-[11px] text-zinc-400">Ad Impressions</div>
              <div className="text-xl font-black text-white mt-1">
                {growthData?.adImpressions.toLocaleString() ?? '—'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5">
              <div className="text-[11px] text-zinc-400">Ad Clicks</div>
              <div className="text-xl font-black text-emerald-400 mt-1">
                {growthData?.adClicks.toLocaleString() ?? '—'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5">
              <div className="text-[11px] text-zinc-400">Ad Actions Completed</div>
              <div className="text-xl font-black text-amber-300 mt-1">
                {growthData?.adCompletions.toLocaleString() ?? '—'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5">
              <div className="text-[11px] text-zinc-400">Overall CTR</div>
              <div className="text-xl font-black text-sky-400 mt-1">
                {growthData ? `${growthData.ctr}%` : '—'}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/40 border border-white/5 p-3 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Top Ad Placement</span>
            <span className="font-semibold text-white">{growthData?.topPlacement || 'Unlock Gate'}</span>
          </div>

          <div className="rounded-lg bg-zinc-900/40 border border-white/5 p-3 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Content Unlock Rate</span>
            <span className="font-semibold text-emerald-400">{growthData ? `${growthData.unlockRate}%` : '—'}</span>
          </div>
        </div>
      </div>

      {/* Grid 3: Leaderboard & Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Referrers Leaderboard */}
        <div className="rounded-xl border border-white/5 bg-[#121520] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>Top Referrers Leaderboard</span>
            </h3>
            <span className="text-[11px] text-zinc-500">Anti-abuse verified</span>
          </div>

          {growthData?.leaderboard && growthData.leaderboard.length > 0 ? (
            <div className="divide-y divide-white/5 rounded-lg border border-white/5 bg-zinc-950/60 overflow-hidden">
              {growthData.leaderboard.map((u) => (
                <div key={u.rank} className="flex items-center justify-between px-3.5 py-2.5 text-xs">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                        u.rank === 1
                          ? 'bg-amber-400 text-black'
                          : u.rank === 2
                          ? 'bg-zinc-300 text-black'
                          : u.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {u.rank}
                    </span>
                    <div>
                      <div className="font-semibold text-white">{u.displayName}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{u.referralCode}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-300 font-mono">
                      {u.qualifiedReferrals} qualified
                    </div>
                    <div className="text-[10px] text-zinc-500">{u.totalReferrals} total</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-950/40 rounded-lg">
              No referral data recorded for this period yet.
            </div>
          )}
        </div>

        {/* Top Shared Content & Campaigns */}
        <div className="rounded-xl border border-white/5 bg-[#121520] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#e50914]" />
              <span>Top Shared Content & Sources</span>
            </h3>
            <span className="text-[11px] text-zinc-500">Viral distribution</span>
          </div>

          <div className="space-y-3">
            {growthData?.topSharedContent && growthData.topSharedContent.length > 0 ? (
              growthData.topSharedContent.map((c) => (
                <div
                  key={c.contentId}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-white/5 text-xs"
                >
                  <span className="font-medium text-white truncate max-w-[220px]">
                    {c.title}
                  </span>
                  <span className="font-bold text-sky-400 font-mono">
                    {c.shares} shares
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-zinc-500 bg-zinc-950/40 rounded-lg">
                No content shares recorded yet.
              </div>
            )}

            <div className="pt-2 border-t border-white/5">
              <div className="text-xs font-semibold text-zinc-400 mb-2">Top Referral Sources</div>
              <div className="flex flex-wrap gap-2">
                {growthData?.topReferralSources && growthData.topReferralSources.length > 0 ? (
                  growthData.topReferralSources.map((s) => (
                    <span
                      key={s.source}
                      className="px-2.5 py-1 rounded-md bg-white/5 text-zinc-300 text-xs border border-white/5"
                    >
                      {s.source}: <strong className="text-white">{s.count}</strong>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">No external referral sources logged yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 4: Growth, Referral & Ad Frequency Controls Form */}
      <div className="rounded-xl border border-white/10 bg-[#121520] p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-base">Growth & Ad Placement Rules</h3>
              <p className="text-xs text-zinc-400">
                Configure 24-hr VIP Premium reward thresholds, anti-abuse rules, and frequency caps
              </p>
            </div>
          </div>
          {saveSuccess && (
            <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              <Check className="h-3.5 w-3.5" />
              <span>Saved Successfully</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveControls} className="space-y-6">
          {/* Section 1: Premium Reward Rules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              1. 24-Hour VIP Premium Reward Thresholds
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-300 font-medium">Required Ad Actions</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={controls.premiumRequiredAds}
                  onChange={(e) =>
                    setControls({ ...controls, premiumRequiredAds: parseInt(e.target.value) || 3 })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Default: 3 eligible ads</p>
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium">Required Qualified Friends</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={controls.premiumRequiredReferrals}
                  onChange={(e) =>
                    setControls({ ...controls, premiumRequiredReferrals: parseInt(e.target.value) || 3 })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Default: 3 qualified friends</p>
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium">Premium Duration (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={controls.premiumDurationHours}
                  onChange={(e) =>
                    setControls({ ...controls, premiumDurationHours: parseInt(e.target.value) || 24 })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Default: 24 hours</p>
              </div>
            </div>
          </div>

          {/* Section 2: Ad Frequency & Cooldown Controls */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              2. Ad Frequency Capping & User Retention Protection
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-300 font-medium">Max Ads Per Session</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={controls.maxAdsPerSession}
                  onChange={(e) =>
                    setControls({ ...controls, maxAdsPerSession: parseInt(e.target.value) || 5 })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Prevents ad bombardment</p>
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium">Ad Cooldown (Seconds)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={controls.adCooldownSeconds}
                  onChange={(e) =>
                    setControls({ ...controls, adCooldownSeconds: parseInt(e.target.value) || 30 })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Min interval between sponsor actions</p>
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium">Referral Qualification Rule</label>
                <select
                  value={controls.referralQualificationRule}
                  onChange={(e) =>
                    setControls({
                      ...controls,
                      referralQualificationRule: e.target.value as any,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white"
                >
                  <option value="view_content">Watching any content stream</option>
                  <option value="ad_completion">Completing an ad action</option>
                  <option value="unlock_content">Unlocking a full title</option>
                </select>
                <p className="text-[10px] text-zinc-500 mt-1">Defines qualified referral</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingControls}
              className="rounded-xl bg-[#e50914] hover:bg-[#b80710] px-6 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50"
            >
              {isSavingControls ? 'Saving Changes...' : 'Save Growth & Ad Rules'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
