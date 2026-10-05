'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Info, CloudDownload, Eye, Share2 } from 'lucide-react';
import { IVideo } from '@/lib/types';

interface HeroFeaturedProps {
  video?: IVideo;
  onOpenUnlockModal: (video: IVideo) => void;
  onOpenShare?: (video: IVideo) => void;
}

export default function HeroFeatured({ video, onOpenUnlockModal, onOpenShare }: HeroFeaturedProps) {
  if (!video) return null;

  return (
    <section className="relative h-[480px] sm:h-[540px] w-full overflow-hidden bg-zinc-950">
      {/* Background Image with Fallback and Gradients */}
      <div className="absolute inset-0">
        <Image
          src={video.bannerUrl || video.posterUrl}
          alt={video.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          referrerPolicy="no-referrer"
        />
        {/* Scrim Gradients for legible typography */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d13] via-[#0b0d13]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d13] via-[#0b0d13]/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Content Container */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3.5">
          {/* Unboxed Metadata with Typographic Separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            <span className="text-[#e50914] font-bold">Featured Exclusive</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{video.category}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{video.quality || '4K Ultra HD'}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CloudDownload className="h-3 w-3" />
              {video.fileSize || '1.8 GB'}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            {video.title}
          </h1>

          {/* Prose Description */}
          <p className="line-clamp-3 text-sm text-zinc-300 sm:text-base leading-relaxed">
            {video.description}
          </p>

          {/* Secondary stats */}
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-zinc-500" />
              <span className="tabular-nums font-medium text-zinc-300">
                {video.viewsCount.toLocaleString()}
              </span> views
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>
              {video.requiredAdsCount === 0
                ? 'No Ads'
                : `${video.requiredAdsCount} Sponsor Step${video.requiredAdsCount > 1 ? 's' : ''} to Unlock`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onOpenUnlockModal(video)}
              className="flex items-center gap-2 rounded-lg bg-[#e50914] px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#b80710] active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={() => onOpenUnlockModal(video)}
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-[0.98]"
            >
              <Info className="h-4 w-4" />
              <span>Details & Mirrors</span>
            </button>

            {onOpenShare && (
              <button
                onClick={() => onOpenShare(video)}
                className="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 px-4 py-2.5 text-sm font-semibold text-sky-300 transition-colors active:scale-[0.98]"
                title="Share & Earn Referral Credit"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
