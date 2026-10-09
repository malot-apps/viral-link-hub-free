'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  X,
  Users,
  Film,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Trophy,
  Flame,
} from 'lucide-react';
import { IUserProfile, IReferralLeaderboardEntry, ITelegramUser } from '@/lib/types';

interface PremiumRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramUser: ITelegramUser;
  userProfile: IUserProfile | null;
  onProfileUpdated: (updatedProfile: IUserProfile) => void;
  globalAdLink: string;
}

export default function PremiumRewardModal({
  isOpen,
  onClose,
  telegramUser,
  userProfile,
  onProfileUpdated,
  globalAdLink,
}: PremiumRewardModalProps) {
  const [leaderboard, setLeaderboard] = useState<IReferralLeaderboardEntry[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCooldownTimer, setAdCooldownTimer] = useState<number>(0);

  // Time remaining countdown for active premium
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const adsCount = userProfile?.adActionsCompleted ?? 0;
  const reqAds = 3;
  const friendsCount = userProfile?.qualifiedReferralCount ?? 0;
  const reqFriends = 3;
  const isEligible = adsCount >= reqAds && friendsCount >= reqFriends && !userProfile?.isPremiumActive;

  // Load Leaderboard
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/v1/referrals/leaderboard?limit=5')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLeaderboard(data.data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Update countdown timer
  useEffect(() => {
    if (!userProfile?.premiumUntil) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(userProfile.premiumUntil!).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [userProfile?.premiumUntil]);

  // Referral link
  const botUsername = 'virallinkhub_official';
  const refCode = userProfile?.referralCode || 'REF77';
  const referralUrl = `https://t.me/${botUsername}?startapp=ref_${refCode}`;

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(referralUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      '🔥 Join Viral Link Hub on Telegram for high-speed cloud streaming! Complete tasks to unlock 24h VIP Premium.'
    );
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${text}`;
    window.open(url, '_blank');
  };

  // Watch eligible ad action to increment ad count towards reward
  const handleWatchAdAction = async () => {
    setIsWatchingAd(true);
    setClaimMessage(null);

    // Open sponsor ad link
    const targetAdUrl = globalAdLink || 'https://monetag.com/direct?zone=78912';
    window.open(targetAdUrl, '_blank');

    try {
      const res = await fetch('/api/v1/analytics/ad-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: telegramUser.id,
          event: 'ad_completion',
          placement: 'premium_reward_area',
        }),
      });

      const data = await res.json();
      if (data.rateLimited) {
        setClaimMessage({
          text: `Please wait ${data.cooldownRemainingSeconds || 30}s before watching another ad.`,
          isError: true,
        });
      } else if (data.success && data.data) {
        if (userProfile) {
          onProfileUpdated({
            ...userProfile,
            adActionsCompleted: data.data.adActionsCompleted,
          });
        }
        setClaimMessage({
          text: `✅ Eligible ad completed! (${data.data.adActionsCompleted}/${reqAds})`,
          isError: false,
        });
      }
    } catch {
      // non-fatal
    } finally {
      setIsWatchingAd(false);
    }
  };

  // Claim 24h Premium
  const handleClaimReward = async () => {
    setIsClaiming(true);
    setClaimMessage(null);

    try {
      const res = await fetch('/api/v1/premium/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: telegramUser.id }),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        onProfileUpdated(data.profile);
        setClaimMessage({ text: data.message || '🎉 24-Hour Premium Unlocked!', isError: false });
      } else {
        setClaimMessage({ text: data.error || 'Failed to claim premium reward.', isError: true });
      }
    } catch (err: any) {
      setClaimMessage({ text: err.message || 'Network error.', isError: true });
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-amber-500/30 bg-[#0d0f18] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-black shadow-lg shadow-amber-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                <span>VIP Premium Reward</span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  24H PASS
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Unlock 100% ad-free instant cloud streaming
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Premium Status Banner */}
        {userProfile?.isPremiumActive ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-sm text-white">✓ Premium VIP Access Active</span>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <Clock className="h-3 w-3" />
                <span>{timeRemaining || 'Active'}</span>
              </span>
            </div>
            <p className="text-xs text-emerald-300/80">
              Enjoy zero ads, instant bufferless ⚡ mirrors, and high-bitrate 4K streaming until expiration.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90 space-y-1">
            <div className="font-bold text-amber-300">How to Unlock 24 Hours Premium:</div>
            <p className="text-zinc-400">
              Watch <span className="text-white font-semibold">3 eligible ads</span> + invite <span className="text-white font-semibold">3 qualified friends</span> on Telegram to unlock a 24-hour pass with zero ads!
            </p>
          </div>
        )}

        {/* Requirements & Real-Time Progress */}
        <div className="space-y-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Requirement Progress
          </div>

          {/* 1. Ads Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-zinc-300">
                <Film className="h-4 w-4 text-amber-400" />
                <span>Eligible Ads Watched</span>
              </span>
              <span className="font-mono font-bold text-white">
                {Math.min(adsCount, reqAds)} / {reqAds}
              </span>
            </div>
            {/* Visual Box Tracker [■■□] */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((idx) => {
                const filled = idx < adsCount;
                return (
                  <div
                    key={idx}
                    className={`h-2.5 flex-1 rounded-sm transition-all duration-300 ${
                      filled
                        ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                        : 'bg-zinc-800 border border-white/10'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* 2. Friends Progress */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-zinc-300">
                <Users className="h-4 w-4 text-sky-400" />
                <span>Qualified Friends Referred</span>
              </span>
              <span className="font-mono font-bold text-white">
                {Math.min(friendsCount, reqFriends)} / {reqFriends}
              </span>
            </div>
            {/* Visual Box Tracker [■■□] */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((idx) => {
                const filled = idx < friendsCount;
                return (
                  <div
                    key={idx}
                    className={`h-2.5 flex-1 rounded-sm transition-all duration-300 ${
                      filled
                        ? 'bg-sky-400 shadow-sm shadow-sky-400/50'
                        : 'bg-zinc-800 border border-white/10'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Action Button: Watch Ad */}
          {!userProfile?.isPremiumActive && adsCount < reqAds && (
            <button
              onClick={handleWatchAdAction}
              disabled={isWatchingAd}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-semibold text-white border border-white/10 transition"
            >
              <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
              <span>{isWatchingAd ? 'Opening Sponsor Task...' : `Complete Ad Action (${adsCount}/3)`}</span>
            </button>
          )}

          {/* Claim Button */}
          {!userProfile?.isPremiumActive && (
            <button
              onClick={handleClaimReward}
              disabled={!isEligible || isClaiming}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg ${
                isEligible
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110 shadow-amber-500/25 cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isClaiming
                  ? 'Verifying Claim...'
                  : isEligible
                  ? 'Unlock 24 Hours VIP Premium'
                  : 'Complete Both Requirements to Unlock'}
              </span>
            </button>
          )}

          {/* Feedback Message */}
          {claimMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                claimMessage.isError
                  ? 'bg-red-950/40 text-red-300 border border-red-500/30'
                  : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {claimMessage.text}
            </div>
          )}
        </div>

        {/* Your Unique Telegram Referral Link */}
        <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">Your Referral Deep Link</span>
            <span className="text-[11px] text-zinc-500">Code: <span className="text-white font-mono">{refCode}</span></span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <button
            onClick={handleShareTelegram}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] py-2.5 text-xs font-bold text-white transition shadow-md shadow-[#2AABEE]/20"
          >
            <Send className="h-4 w-4" />
            <span>Invite Telegram Friends (+1 Friend Progress)</span>
          </button>
        </div>

        {/* Top Referrers Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>Top Referrers Leaderboard</span>
              </span>
              <span className="text-[10px] text-zinc-500">Verified Growth</span>
            </div>

            <div className="divide-y divide-white/5 rounded-lg border border-white/5 bg-zinc-950/60 overflow-hidden">
              {leaderboard.map((user) => (
                <div key={user.rank} className="flex items-center justify-between px-3 py-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        user.rank === 1
                          ? 'bg-amber-400 text-black'
                          : user.rank === 2
                          ? 'bg-zinc-300 text-black'
                          : user.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {user.rank}
                    </span>
                    <span className="font-medium text-zinc-200 truncate max-w-[160px]">
                      {user.displayName}
                    </span>
                  </div>
                  <span className="font-mono text-zinc-400 font-semibold">
                    <span className="text-white">{user.qualifiedReferrals}</span> referrals
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
