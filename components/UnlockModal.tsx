'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  CloudDownload,
  Eye,
  Loader2,
  RefreshCw,
  Sparkles,
  Share2,
  Play,
  AlertCircle,
} from 'lucide-react';
import { IVideo, ITelegramUser, IUserProfile, ISettings } from '@/lib/types';
import { MONETAG_CONFIG, ADSTERRA_CONFIG, AD_NETWORKS } from '@/lib/ad-constants';
import { isTelegramWebApp, showMonetagRewardedInterstitial, trackAdTelemetry } from '@/lib/ad-manager';

interface UnlockModalProps {
  video: IVideo | null;
  isOpen: boolean;
  onClose: () => void;
  globalAdLink?: string;
  telegramUser: ITelegramUser;
  userProfile?: IUserProfile | null;
  settings?: ISettings;
  onOpenPremium?: () => void;
  onOpenShare?: () => void;
  onViewIncremented: (videoId: string, newCount: number) => void;
}

function UnlockModalContent({
  video,
  onClose,
  globalAdLink,
  telegramUser,
  userProfile,
  settings,
  onOpenPremium,
  onOpenShare,
  onViewIncremented,
}: {
  video: IVideo;
  onClose: () => void;
  globalAdLink?: string;
  telegramUser: ITelegramUser;
  userProfile?: IUserProfile | null;
  settings?: ISettings;
  onOpenPremium?: () => void;
  onOpenShare?: () => void;
  onViewIncremented: (videoId: string, newCount: number) => void;
}) {
  const isPremiumUser = Boolean(userProfile?.isPremiumActive);
  const requiredAds = isPremiumUser ? 0 : (video.requiredAdsCount ?? 2);
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(requiredAds === 0);

  // Loading & Verification States
  const [isPlayingMonetagAd, setIsPlayingMonetagAd] = useState<boolean>(false);
  const [isVerifyingSponsor, setIsVerifyingSponsor] = useState<boolean>(false);
  const [verifyCountdown, setVerifyCountdown] = useState<number>(5);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showWebFallback, setShowWebFallback] = useState<boolean>(false);

  // Ad-Blocker Detection
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState<boolean>(false);
  const [isCheckingAdBlocker, setIsCheckingAdBlocker] = useState<boolean>(false);
  const [adBlockerDismissed, setAdBlockerDismissed] = useState<boolean>(false);

  // Environment check
  const [inTelegram, setInTelegram] = useState<boolean>(false);

  useEffect(() => {
    setInTelegram(isTelegramWebApp());
  }, []);

  const checkAdBlocker = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const bait = document.createElement('div');
    bait.className = 'pub_300x250 pub_728x90 text-ad text_ad ad-banner banner-ad adsbox';
    bait.id = 'ad-banner-detector';
    bait.setAttribute('aria-hidden', 'true');
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';
    bait.style.top = '-9999px';
    bait.style.width = '1px';
    bait.style.height = '1px';
    document.body.appendChild(bait);

    let isBlocked = false;
    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      const style = window.getComputedStyle(bait);
      if (
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.clientHeight === 0 ||
        style.display === 'none' ||
        style.visibility === 'hidden'
      ) {
        isBlocked = true;
      }
    } catch {
      // ignore
    } finally {
      bait.remove();
    }

    if (isBlocked) return true;

    try {
      await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
      });
      return false;
    } catch {
      return true;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    checkAdBlocker().then((detected) => {
      if (isMounted && detected) {
        setIsAdBlockerDetected(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [checkAdBlocker]);

  const handleRecheckAdBlocker = async () => {
    setIsCheckingAdBlocker(true);
    const stillBlocked = await checkAdBlocker();
    setIsCheckingAdBlocker(false);
    setIsAdBlockerDetected(stillBlocked);
    if (!stillBlocked) {
      setAdBlockerDismissed(true);
    }
  };

  const triggerView = useCallback(
    async (videoId: string) => {
      try {
        const res = await fetch(`/api/v1/movies/${videoId}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-telegram-init-data': JSON.stringify(telegramUser),
          },
        });
        const data = await res.json();
        if (data.success && data.viewsCount) {
          onViewIncremented(videoId, data.viewsCount);
        }
      } catch {
        // non-fatal
      }
    },
    [telegramUser, onViewIncremented]
  );

  // Complete a verified step and claim server-side reward
  const finalizeStepWithServer = useCallback(
    async (sessionId: string) => {
      try {
        const res = await fetch('/api/v1/ads/claim-reward', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-telegram-init-data': JSON.stringify(telegramUser),
          },
          body: JSON.stringify({
            userId: telegramUser.id,
            videoId: video._id,
            sessionId,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setErrorMessage(data.error || 'Reward validation failed. Please try again.');
          return false;
        }

        setErrorMessage('');
        const nextStep = completedSteps + 1;
        setCompletedSteps(nextStep);

        if (nextStep >= requiredAds) {
          setIsUnlocked(true);
          triggerView(video._id);
        }

        return true;
      } catch {
        setErrorMessage('Network error validating ad completion. Please retry.');
        return false;
      }
    },
    [completedSteps, requiredAds, telegramUser, triggerView, video._id]
  );

  // Countdown timer for Normal Web / Fallback Sponsor task
  useEffect(() => {
    if (!isVerifyingSponsor) return;

    if (verifyCountdown > 0) {
      const timer = setTimeout(() => {
        setVerifyCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Countdown reached 0 -> finalize verification with server
    const completeVerification = async () => {
      if (activeSessionId) {
        await finalizeStepWithServer(activeSessionId);
      }
      setIsVerifyingSponsor(false);
      setActiveSessionId(null);
    };

    completeVerification();
  }, [isVerifyingSponsor, verifyCountdown, activeSessionId, finalizeStepWithServer]);

  // ===========================================================================
  // FLOW 1: MONETAG REWARDED INTERSTITIAL (Telegram Mini App)
  // Rewarded Interstitial only for explicit "Watch Ad to Unlock" action.
  // Reward only after the SDK promise resolves!
  // ===========================================================================
  const handleWatchMonetagAd = async () => {
    if (isPlayingMonetagAd || isUnlocked) return;
    setErrorMessage('');
    setIsPlayingMonetagAd(true);

    try {
      // 1. Request server-side session token
      const startRes = await fetch('/api/v1/ads/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': JSON.stringify(telegramUser),
        },
        body: JSON.stringify({
          userId: telegramUser.id,
          videoId: video._id,
          placement: 'unlock_action',
          network: 'monetag',
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.success) {
        setErrorMessage(startData.error || 'Cannot start ad session. Please wait a moment.');
        setIsPlayingMonetagAd(false);
        return;
      }

      const sessionId = startData.sessionId;

      // 2. Play Monetag Rewarded Interstitial and await promise resolution
      const zoneId = settings?.monetagZoneId || MONETAG_CONFIG.ZONE_ID;
      const adResult = await showMonetagRewardedInterstitial(zoneId);

      if (!adResult.success) {
        setErrorMessage(
          adResult.error || 'Ad playback could not complete. You can use the sponsor task fallback below.'
        );
        setShowWebFallback(true);
        setIsPlayingMonetagAd(false);
        return;
      }

      // 3. Promise resolved! Claim reward on server
      await finalizeStepWithServer(sessionId);
    } catch (err: any) {
      setErrorMessage('Ad playback error. Please try again.');
      setShowWebFallback(true);
    } finally {
      setIsPlayingMonetagAd(false);
    }
  };

  // ===========================================================================
  // FLOW 2: ADSTERRA SMARTLINK SPONSOR TASK (Normal Web or Telegram Fallback)
  // Smartlink: only on dedicated Sponsor/Unlock CTA, never navigation buttons.
  // Never reward ad clicks. Reward only after the 5s verification completes.
  // ===========================================================================
  const handleStartSponsorStep = async () => {
    if (isVerifyingSponsor || isUnlocked) return;
    setErrorMessage('');

    try {
      // 1. Request ad session from server
      const startRes = await fetch('/api/v1/ads/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': JSON.stringify(telegramUser),
        },
        body: JSON.stringify({
          userId: telegramUser.id,
          videoId: video._id,
          placement: 'smartlink_sponsor',
          network: 'adsterra',
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.success) {
        setErrorMessage(startData.error || 'Please wait before starting another task.');
        return;
      }

      setActiveSessionId(startData.sessionId);

      // 2. Fire ad click telemetry (for analytics only — NOT granting reward!)
      trackAdTelemetry({
        event: 'ad_click',
        network: AD_NETWORKS.ADSTERRA,
        placement: 'smartlink_sponsor',
        contentId: video._id,
        userId: telegramUser.id,
      });

      // 3. Open dedicated Smartlink in new window
      const smartlink =
        settings?.adsterraSmartlinkUrl ||
        video.directAdLink ||
        globalAdLink ||
        ADSTERRA_CONFIG.SMARTLINK_URL;

      if (typeof window !== 'undefined') {
        const a = document.createElement('a');
        a.href = smartlink;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      // 4. Start 5-second verification countdown
      setVerifyCountdown(5);
      setIsVerifyingSponsor(true);
    } catch (err) {
      setErrorMessage('Failed to start sponsor task. Please try again.');
    }
  };

  const effectiveStreamUrl =
    video.streamUrl || video.serverUrl || video.hdSourceUrl || video.targetLink || '';

  const handleCopyLink = () => {
    if (effectiveStreamUrl) {
      navigator.clipboard.writeText(effectiveStreamUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const currentStep = completedSteps + 1;
  const isMonetagAvailable = inTelegram && (settings?.monetagEnabled !== false);

  return (
    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#10121a] shadow-2xl">
      {/* Header with Close */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#e50914] uppercase tracking-wider">
            Fast Stream Gateway
          </span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span className="text-xs text-zinc-400">{video.category}</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Video Overview Banner */}
      <div className="relative h-44 w-full bg-zinc-950">
        <Image
          src={video.bannerUrl || video.posterUrl}
          alt={video.title}
          fill
          sizes="500px"
          className="object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10121a] via-[#10121a]/60 to-transparent" />

        <div className="absolute bottom-3 left-4 right-4 space-y-1">
          <h3 className="text-lg font-bold text-white line-clamp-1">{video.title}</h3>
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="text-emerald-400 font-medium">{video.quality || '1080p HD'}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{video.fileSize || '1.4 GB'}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="flex items-center gap-1 text-zinc-400">
              <Eye className="h-3 w-3" />
              <span className="tabular-nums">{video.viewsCount.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Modal Body */}
      <div className="p-5 space-y-4">
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
          {video.description}
        </p>

        {/* Ad Unlock Status or VIP Status */}
        {isPremiumUser ? (
          <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-950/30 p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
              <Sparkles className="h-4 w-4" />
              <span>VIP Premium Active</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              Zero ads required. High-speed direct cloud mirror unlocked instantly!
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Ad Unlock Status</span>
              </span>
              <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded text-[11px]">
                Tasks Completed: [ {completedSteps} / {requiredAds} ]
              </span>
            </div>

            {/* Step Progress Visual Bar */}
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#e50914] h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (completedSteps / requiredAds) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200 flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Ad-Blocker Notice */}
        {isAdBlockerDetected && !adBlockerDismissed && !isUnlocked && (
          <div className="rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-zinc-900/90 to-amber-950/20 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldAlert className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                    Ad-Blocker Detected
                  </h4>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                    Action Recommended
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Our high-speed links are kept free through sponsor verification. Please pause your ad-blocker or claim a free VIP Pass below!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleRecheckAdBlocker}
                disabled={isCheckingAdBlocker}
                className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isCheckingAdBlocker ? 'animate-spin' : ''}`} />
                <span>{isCheckingAdBlocker ? 'Re-Checking...' : "I've Disabled It (Re-Check)"}</span>
              </button>

              <button
                type="button"
                onClick={() => setAdBlockerDismissed(true)}
                className="rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 px-3 py-2 text-xs font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Unlocked State */}
        {isUnlocked ? (
          <div className="space-y-3.5">
            <a
              href={effectiveStreamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.7)] hover:shadow-[0_0_35px_rgba(16,185,129,0.9)] transition-all active:scale-[0.98] animate-pulse"
            >
              <CloudDownload className="h-5 w-5" />
              <span>Go to Stream / Play Video</span>
              <ExternalLink className="h-4 w-4 opacity-80" />
            </a>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs">
              <span className="font-mono text-zinc-300 truncate max-w-[280px]">
                {effectiveStreamUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-white/20 active:scale-95"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Locked Action Flow */
          <div className="space-y-4">
            {/* Step Indicators */}
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: requiredAds }).map((_, index) => {
                const isDone = index < completedSteps;
                const isCurrent = index === completedSteps;
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                      isDone
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                        : isCurrent
                        ? 'border-[#e50914]/50 bg-[#e50914]/10 text-white'
                        : 'border-white/5 bg-zinc-900/40 text-zinc-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                        {index + 1}
                      </span>
                    )}
                    <span className="truncate font-medium">
                      {isDone ? 'Verified' : `Task ${index + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Countdown State for Sponsor Task */}
            {isVerifyingSponsor ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-semibold">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                  <span>Verifying sponsor task completion...</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Please wait <span className="tabular-nums font-mono font-bold text-white text-sm">{verifyCountdown}</span> seconds to validate task.
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800 mt-2">
                  <div
                    className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - verifyCountdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : isMonetagAvailable && !showWebFallback ? (
              /* MONETAG REWARDED INTERSTITIAL BUTTON (Telegram Mini App) */
              <button
                onClick={handleWatchMonetagAd}
                disabled={isPlayingMonetagAd}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e50914] to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                {isPlayingMonetagAd ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading Rewarded Ad...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>
                      Watch Ad to Unlock ({currentStep}/{requiredAds})
                    </span>
                  </>
                )}
              </button>
            ) : (
              /* ADSTERRA SPONSOR TASK BUTTON (Normal Web or Telegram Fallback) */
              <button
                onClick={handleStartSponsorStep}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e50914] hover:bg-[#c70812] px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
              >
                <ExternalLink className="h-4 w-4" />
                <span>
                  Complete Sponsor Step ({currentStep}/{requiredAds})
                </span>
              </button>
            )}

            {/* If in Telegram and fallback is displayed, allow switching back to video */}
            {inTelegram && showWebFallback && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowWebFallback(false)}
                  className="text-xs text-zinc-400 hover:text-white underline"
                >
                  ← Try Rewarded Video Ad instead
                </button>
              </div>
            )}

            {/* Growth & 24h VIP Access Bar */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              {onOpenShare && (
                <button
                  type="button"
                  onClick={onOpenShare}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-semibold text-zinc-300 transition"
                >
                  <Share2 className="h-3.5 w-3.5 text-sky-400" />
                  <span>Share (+1 Friend)</span>
                </button>
              )}
              {onOpenPremium && !isPremiumUser && (
                <button
                  type="button"
                  onClick={onOpenPremium}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 py-2.5 text-xs font-semibold text-amber-300 transition shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Get 24h VIP</span>
                </button>
              )}
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                <span>{inTelegram ? 'Telegram Mini App Secured' : 'Verified Secure Gateway'}</span>
              </span>
              <span className="text-[10px] text-zinc-500">
                {inTelegram ? 'Monetag Network' : 'Adsterra Network'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnlockModal({
  video,
  isOpen,
  onClose,
  globalAdLink,
  telegramUser,
  userProfile,
  settings,
  onOpenPremium,
  onOpenShare,
  onViewIncremented,
}: UnlockModalProps) {
  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <UnlockModalContent
        video={video}
        onClose={onClose}
        globalAdLink={globalAdLink}
        telegramUser={telegramUser}
        userProfile={userProfile}
        settings={settings}
        onOpenPremium={onOpenPremium}
        onOpenShare={onOpenShare}
        onViewIncremented={onViewIncremented}
      />
    </div>
  );
}
