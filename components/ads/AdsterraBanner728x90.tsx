'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ADSTERRA_CONFIG, AD_NETWORKS } from '@/lib/ad-constants';
import { trackAdTelemetry } from '@/lib/ad-manager';

interface AdsterraBanner728x90Props {
  placement?: string;
  isTelegram?: boolean;
  isPremium?: boolean;
  enabled?: boolean;
  adKey?: string;
  userId?: string | number | null;
  className?: string;
}

export default function AdsterraBanner728x90({
  placement = 'desktop_728x90',
  isTelegram = false,
  isPremium = false,
  enabled = true,
  adKey = ADSTERRA_CONFIG.BANNER_728X90_KEY,
  userId,
  className = '',
}: AdsterraBanner728x90Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const shouldShow = !isTelegram && !isPremium && enabled;

  useEffect(() => {
    if (!shouldShow || hasRendered || !containerRef.current) return;

    try {
      // Create an isolated iframe to prevent document.write / atOptions global conflicts in React/Next.js
      const iframe = document.createElement('iframe');
      iframe.width = '728';
      iframe.height = '90';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.scrolling = 'no';
      iframe.title = 'Partner Advertisement';
      iframeRef.current = iframe;

      const activeKey = adKey || ADSTERRA_CONFIG.BANNER_728X90_KEY;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                margin: 0;
                padding: 0;
                background: transparent;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : '${activeKey}',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
            <\/script>
            <script type="text/javascript" src="https://cheflobesofficer.com/${activeKey}/invoke.js"><\/script>
          </body>
        </html>
      `;

      containerRef.current.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }

      setHasRendered(true);

      // Track impression
      trackAdTelemetry({
        event: 'ad_impression',
        network: AD_NETWORKS.ADSTERRA,
        placement,
        userId,
        metadata: { format: 'banner_728x90', key: activeKey },
      });
    } catch (err) {
      console.warn('[Adsterra 728x90 Banner Error]:', err);
      setHasError(true);
    }
  }, [shouldShow, hasRendered, adKey, placement, userId]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center my-4 w-full px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {/* Desktop 728x90 Leaderboard */}
      <div className="hidden md:flex w-[740px] rounded-xl border border-white/5 bg-[#0f121d]/80 p-2 shadow-md backdrop-blur-sm flex-col items-center">
        <div className="w-full flex items-center justify-between px-2 pb-1 border-b border-white/5 mb-1.5 text-[9px] text-zinc-400 uppercase tracking-widest font-semibold">
          <span>Sponsored Banner</span>
          <span className="text-zinc-500">728 × 90 HD</span>
        </div>
        <div
          ref={containerRef}
          className="w-[728px] h-[90px] flex items-center justify-center bg-black/20 rounded overflow-hidden"
        >
          {!hasRendered && !hasError && (
            <div className="w-full h-full animate-pulse bg-white/5 flex items-center justify-center">
              <span className="text-[10px] text-zinc-500">Loading partner banner...</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Responsive Fallback Container (Prevents horizontal overflow and broken view) */}
      <div className="flex md:hidden w-full max-w-md rounded-xl border border-white/5 bg-[#0f121d]/80 p-3 shadow-md backdrop-blur-sm flex-col items-center text-center">
        <div className="w-full flex items-center justify-between border-b border-white/5 pb-1.5 mb-2 text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">
          <span>Sponsored Partner</span>
          <span className="text-amber-400 font-bold">Fast Mirror</span>
        </div>
        <p className="text-xs text-zinc-300 font-medium line-clamp-1">
          High-Speed 4K Cloud Streaming & Direct Download
        </p>
        <span className="mt-1 text-[10px] text-zinc-500">
          Ad-Free VIP unlocks available via tasks
        </span>
      </div>
    </div>
  );
}
