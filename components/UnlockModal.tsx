'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Lock,
  Unlock,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  CloudDownload,
  Eye,
  Loader2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { IVideo, ITelegramUser } from '@/lib/types';

interface UnlockModalProps {
  video: IVideo | null;
  isOpen: boolean;
  onClose: () => void;
  globalAdLink: string;
  telegramUser: ITelegramUser;
  onViewIncremented: (videoId: string, newCount: number) => void;
}

function UnlockModalContent({
  video,
  onClose,
  globalAdLink,
  telegramUser,
  onViewIncremented,
}: {
  video: IVideo;
  onClose: () => void;
  globalAdLink: string;
  telegramUser: ITelegramUser;
  onViewIncremented: (videoId: string, newCount: number) => void;
}) {
  const requiredAds = video.requiredAdsCount ?? 2;
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyCountdown, setVerifyCountdown] = useState<number>(5);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(requiredAds === 0);

  // Ad-Blocker Detection State
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState<boolean>(false);
  const [isCheckingAdBlocker, setIsCheckingAdBlocker] = useState<boolean>(false);
  const [adBlockerDismissed, setAdBlockerDismissed] = useState<boolean>(false);

  const checkAdBlocker = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    // Method 1: Bait DOM element with common ad classes
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

    // Method 2: Network probe to well-known ad telemetry script
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

  // Run detection on modal mount
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

  const triggerView = useCallback(async (videoId: string) => {
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
  }, [telegramUser, onViewIncremented]);

  // Handle 5-second countdown during sponsor verification
  useEffect(() => {
    if (!isVerifying) return;

    if (verifyCountdown > 0) {
      const timer = setTimeout(() => {
        setVerifyCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Countdown reached 0 -> Step verified!
    const finishStep = () => {
      setIsVerifying(false);
      const nextStep = completedSteps + 1;
      setCompletedSteps(nextStep);

      if (nextStep >= requiredAds) {
        setIsUnlocked(true);
        triggerView(video._id);
      }
    };

    finishStep();
  }, [isVerifying, verifyCountdown, completedSteps, requiredAds, video._id, triggerView]);

  const currentStep = completedSteps + 1;
  const adUrl = video.directAdLink || globalAdLink || 'https://monetag.com/direct?ref=virallinkhub';

  const handleStartSponsorStep = async () => {
    if (isVerifying || isUnlocked) return;

    // 1. Fire ad click analytics endpoint to record CPM impression
    try {
      await fetch(`/api/v1/movies/${video._id}/click-ad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': JSON.stringify(telegramUser),
        },
      });
    } catch {
      // non-fatal
    }

    // 2. Open dynamic directAdLink in new tab
    window.open(adUrl, '_blank', 'noopener,noreferrer');

    // 3. Initiate 5-second verification countdown timer
    setVerifyCountdown(5);
    setIsVerifying(true);
  };

  const effectiveStreamUrl = video.streamUrl || video.serverUrl || video.hdSourceUrl || video.targetLink || '';

  const handleCopyLink = () => {
    if (effectiveStreamUrl) {
      navigator.clipboard.writeText(effectiveStreamUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

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

        {/* Ad Unlock Status & Dynamic Counter */}
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Ad Unlock Status</span>
            </span>
            {/* Dynamic Counter: Ads Watched: [ X / Required ] */}
            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded text-[11px]">
              Ads Watched: [ {completedSteps} / {requiredAds} ]
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

        {/* ================= GENTLE AD-BLOCKER NOTICE ================= */}
        {isAdBlockerDetected && !adBlockerDismissed && !isUnlocked && (
          <div className="rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-zinc-900/90 to-amber-950/20 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
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
                  Our high-speed Terabox links are kept <span className="font-semibold text-white">100% free</span> through sponsor verification. Please pause or disable your ad-blocker for this site so the sponsor task registers properly.
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
                title="Dismiss and continue"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Unlock State Check */}
        {isUnlocked ? (
          /* GLOWING UNLOCKED BUTTON: "Go to Stream / Play Video" */
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
          /* LOCKED / 5-SECOND COUNTDOWN & AD BUTTON FLOW */
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
                      {isDone ? 'Verified' : `Sponsor Task ${index + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 5-Second Verification in Progress State */}
            {isVerifying ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-semibold">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                  <span>Verifying sponsor ad click...</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Please wait <span className="tabular-nums font-mono font-bold text-white text-sm">{verifyCountdown}</span> seconds to register verification.
                </p>
                {/* Visual animated timer bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800 mt-2">
                  <div
                    className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - verifyCountdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Button 1: "Watch Ad to Unlock" */
              <button
                onClick={handleStartSponsorStep}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e50914] px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:bg-[#c70812] active:scale-[0.98]"
              >
                <ExternalLink className="h-4 w-4" />
                <span>
                  Watch Ad to Unlock ({currentStep}/{requiredAds})
                </span>
              </button>
            )}

            {/* Trust & anti-fraud badge */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                <span>Telegram WebApp Verified</span>
              </span>
              {/* Optional test button to simulate/toggle ad-blocker check */}
              <button
                type="button"
                onClick={() => {
                  setIsAdBlockerDetected(!isAdBlockerDetected);
                  setAdBlockerDismissed(false);
                }}
                className="text-zinc-500 hover:text-zinc-300 underline"
                title="Toggle ad-blocker simulation prompt"
              >
                {isAdBlockerDetected ? 'Hide Ad-Blocker Alert' : 'Test Ad-Blocker Alert'}
              </button>
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
  onViewIncremented,
}: UnlockModalProps) {
  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <UnlockModalContent
        key={video._id}
        video={video}
        onClose={onClose}
        globalAdLink={globalAdLink}
        telegramUser={telegramUser}
        onViewIncremented={onViewIncremented}
      />
    </div>
  );
}
