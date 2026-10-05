'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ADSTERRA_CONFIG, AD_NETWORKS } from '@/lib/ad-constants';
import { trackAdTelemetry } from '@/lib/ad-manager';

interface AdsterraNativeBannerProps {
  placement?: string;
  isTelegram?: boolean;
  isPremium?: boolean;
  enabled?: boolean;
  scriptUrl?: string;
  containerId?: string;
  userId?: string | number | null;
  className?: string;
}

export default function AdsterraNativeBanner({
  placement = 'home_native_banner',
  isTelegram = false,
  isPremium = false,
  enabled = true,
  scriptUrl = ADSTERRA_CONFIG.NATIVE_BANNER_URL,
  containerId = ADSTERRA_CONFIG.NATIVE_BANNER_CONTAINER_ID,
  userId,
  className = '',
}: AdsterraNativeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const shouldShow = !isTelegram && !isPremium && enabled;

  // Lazy-load with IntersectionObserver
  useEffect(() => {
    if (!shouldShow || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldShow]);

  // Inject Adsterra Native Banner script when visible
  useEffect(() => {
    if (!shouldShow || !isVisible || hasLoaded || !containerRef.current) return;

    try {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.dataset.cfasync = 'false';

      script.onload = () => {
        setHasLoaded(true);
        // Record real ad impression telemetry
        trackAdTelemetry({
          event: 'ad_impression',
          network: AD_NETWORKS.ADSTERRA,
          placement,
          userId,
          metadata: { format: 'native_banner', containerId },
        });
      };

      containerRef.current.appendChild(script);
    } catch (err) {
      console.warn('[Adsterra Native Banner Inject Error]:', err);
    }
  }, [shouldShow, isVisible, hasLoaded, scriptUrl, containerId, placement, userId]);

  // Hidden inside Telegram Mini App, for Premium users, or when disabled in Admin
  if (!shouldShow) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-6 ${className}`}
    >
      <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0f121d]/80 p-4 shadow-md backdrop-blur-sm">
        {/* Subtle Label */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Sponsored Highlights
          </span>
          <span className="text-[9px] text-zinc-400">Promoted Partner</span>
        </div>

        {/* Adsterra Container Target */}
        <div
          id={containerId}
          className="min-h-[90px] flex items-center justify-center text-xs text-zinc-400"
        >
          {!hasLoaded && (
            <div className="h-20 w-full animate-pulse rounded bg-white/5 flex items-center justify-center">
              <span className="text-[11px] text-zinc-400">Loading partner recommendations...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
