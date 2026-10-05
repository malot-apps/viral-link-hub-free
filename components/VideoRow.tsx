'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Cloud, ShieldAlert, Share2 } from 'lucide-react';
import { IVideo } from '@/lib/types';

interface VideoRowProps {
  title: string;
  videos: IVideo[];
  onOpenUnlockModal: (video: IVideo) => void;
  onOpenShare?: (video: IVideo) => void;
}

export default function VideoRow({ title, videos, onOpenUnlockModal, onOpenShare }: VideoRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!videos || videos.length === 0) return null;

  return (
    <section className="relative px-4 py-5 sm:px-6 lg:px-8">
      {/* Row Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
          {title}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrolling Content Cards */}
      <div
        ref={rowRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth"
      >
        {videos.map((video) => (
          <div
            key={video._id}
            onClick={() => onOpenUnlockModal(video)}
            className="group relative flex-none w-[170px] sm:w-[210px] md:w-[240px] cursor-pointer rounded-lg overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-200 hover:scale-[1.03] hover:border-white/20 hover:shadow-xl"
          >
            {/* Poster Image Container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
              <Image
                src={video.posterUrl}
                alt={video.title}
                fill
                sizes="(max-width: 640px) 170px, (max-width: 768px) 210px, 240px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              {/* Hover Quick Play Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e50914] text-white shadow-lg transition-transform group-hover:scale-110">
                  <Play className="h-5 w-5 fill-white ml-0.5" />
                </div>
              </div>

              {/* Target Type badge top-right */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                {onOpenShare && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenShare(video);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-black/70 hover:bg-[#2AABEE] text-zinc-300 hover:text-white backdrop-blur-sm transition"
                    title="Share with Friends"
                  >
                    <Share2 className="h-3 w-3" />
                  </button>
                )}
                <div className="flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 backdrop-blur-sm">
                  <Cloud className="h-2.5 w-2.5" />
                  <span>Terabox</span>
                </div>
              </div>
            </div>

            {/* Content Meta */}
            <div className="p-3 space-y-1">
              <h3 className="line-clamp-1 text-sm font-semibold text-white group-hover:text-[#e50914] transition-colors">
                {video.title}
              </h3>

              {/* Clean metadata without pill clutter */}
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span>{video.quality || '1080p'}</span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span>{video.fileSize || '1.4 GB'}</span>
              </div>

              {/* Bottom status */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                <span className="tabular-nums">
                  {video.viewsCount.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                  <ShieldAlert className="h-3 w-3" />
                  {video.requiredAdsCount} Ads
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
