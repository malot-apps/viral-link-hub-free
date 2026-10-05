'use client';

import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { IVideo, IUserProfile, ITelegramUser } from '@/lib/types';

interface ShareModalProps {
  video: IVideo | null;
  isOpen: boolean;
  onClose: () => void;
  telegramUser: ITelegramUser;
  userProfile: IUserProfile | null;
  telegramChannelUrl?: string;
}

export default function ShareModal({
  video,
  isOpen,
  onClose,
  telegramUser,
  userProfile,
  telegramChannelUrl = 'https://t.me/virallinkhub_official',
}: ShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !video) return null;

  const botUsername = telegramChannelUrl.split('/').pop()?.replace(/^@/, '') || 'virallinkhub_official';
  const refCode = userProfile?.referralCode || 'VIP';
  const startParam = `c_${video._id}_ref_${refCode}`;
  const shareDeepLink = `https://t.me/${botUsername}?startapp=${startParam}`;

  const shareText = `🎬 Watch "${video.title}" in 1080p HD on Viral Link Hub Telegram Mini App! Complete sponsor task to unlock full speed stream.`;

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareDeepLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);

      // Record share click telemetry
      fetch('/api/v1/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: telegramUser.id,
          contentId: video._id,
          source: 'copy_link',
        }),
      }).catch(() => {});
    }
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareDeepLink)}&text=${encodeURIComponent(shareText)}`;
    
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && typeof tg.openTelegramLink === 'function') {
        tg.openTelegramLink(url);
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }

    fetch('/api/v1/analytics/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: telegramUser.id,
        contentId: video._id,
        source: 'telegram_share_button',
      }),
    }).catch(() => {});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0f18] p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#e50914]" />
            <h3 className="font-bold text-white text-base">Share with Friends</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Thumbnail & Info */}
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-900/60 p-3">
          <div className="h-16 w-12 rounded-lg bg-zinc-800 overflow-hidden relative border border-white/10 shrink-0">
            {video.posterUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={video.posterUrl}
                alt={video.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-white truncate">{video.title}</h4>
            <div className="text-xs text-zinc-400">{video.category} · {video.quality || '1080p'}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400 font-medium">
              <Sparkles className="h-3 w-3" />
              <span>Earns +1 Friend Referral Progress</span>
            </div>
          </div>
        </div>

        {/* Trackable Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">Trackable Telegram Deep Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareDeepLink}
              className="flex-1 rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleTelegramShare}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] py-3 text-xs font-bold text-white transition shadow-md shadow-[#2AABEE]/20"
          >
            <Send className="h-4 w-4" />
            <span>Share to Telegram Chat / Channel</span>
          </button>
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 py-2.5 text-xs font-semibold text-zinc-300 transition"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Direct Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}
