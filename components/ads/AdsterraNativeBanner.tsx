'use client';

import React, { useEffect, useRef, useState, useId } from 'react';
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
  const mountRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, '');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const scriptInjectedRef = useRef(false);

  const shouldShow = !isTelegram && !isPremium && enabled;

  // 1. Lazy-load via IntersectionObserver
  useEffect(() => {
    if (!shouldShow || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldShow]);

  // 2. Controlled script execution with unique container & sandbox
  useEffect(() => {
    if (!shouldShow || !isVisible || scriptInjectedRef.current || !mountRef.current) return;
    scriptInjectedRef.current = true;

    try {
      // Use isolated iframe sandbox so each Native Banner placement
      // can load the invoke.js script safely without global ID collision
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.minHeight = '110px';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.scrolling = 'no';
      iframe.title = 'Partner Recommendations';

      const targetContainerId = containerId || ADSTERRA_CONFIG.NATIVE_BANNER_CONTAINER_ID;
      const targetScriptUrl = scriptUrl || ADSTERRA_CONFIG.NATIVE_BANNER_URL;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                margin: 0;
                padding: 0;
                background: transparent;
                font-family: system-ui, -apple-system, sans-serif;
                overflow: hidden;
              }
              #${targetContainerId} {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 90px;
                width: 100%;
              }
            </style>
          </head>
          <body>
            <script async="async" data-cfasync="false" src="${targetScriptUrl}"><\/script>
            <div id="${targetContainerId}"></div>
          </body>
        </html>
      `;

      mountRef.current.appendChild(iframe);

      iframe.onload = () => {
        setHasLoaded(true);
        trackAdTelemetry({
          event: 'ad_impression',
          network: AD_NETWORKS.ADSTERRA,
          placement,
          userId,
          metadata: { format: 'native_banner', containerId: targetContainerId },
        });
      };

      iframe.onerror = () => {
        setHasFailed(true);
      };

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }

      // Safety timeout in case ad blocked or network drops
      const timeoutTimer = setTimeout(() => {
        if (!hasLoaded) {
          setHasLoaded(true); // Stop pulsing
        }
      }, 5000);

      return () => clearTimeout(timeoutTimer);
    } catch (err) {
      console.warn('[Adsterra Native Banner Inject Error]:', err);
      setHasFailed(true);
    }
  }, [shouldShow, isVisible, scriptUrl, containerId, placement, userId, hasLoaded]);

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
          <span className="text-[9px] text-zinc-500 font-medium">Promoted Partner</span>
        </div>

        {/* Adsterra Mount Container */}
        <div ref={mountRef} className="min-h-[90px] w-full flex items-center justify-center">
          {!hasLoaded && !hasFailed && (
            <div className="h-20 w-full animate-pulse rounded bg-white/5 flex items-center justify-center">
              <span className="text-[11px] text-zinc-400">Loading partner recommendations...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
