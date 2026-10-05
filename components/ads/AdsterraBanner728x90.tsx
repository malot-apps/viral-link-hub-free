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

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>body { margin: 0; padding: 0; background: transparent; display: flex; justify-content: center; align-items: center; }</style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : '${adKey}',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="//www.highperformanceformat.com/${adKey}/invoke.js"></script>
          </body>
        </html>
      `;

      containerRef.current.appendChild(iframe);
      iframe.contentWindow?.document.open();
      iframe.contentWindow?.document.write(htmlContent);
      iframe.contentWindow?.document.close();

      setHasRendered(true);

      // Track impression
      trackAdTelemetry({
        event: 'ad_impression',
        network: AD_NETWORKS.ADSTERRA,
        placement,
        userId,
        metadata: { format: 'banner_728x90', key: adKey },
      });
    } catch (err) {
      console.warn('[Adsterra 728x90 Banner Error]:', err);
    }
  }, [shouldShow, hasRendered, adKey, placement, userId]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={`hidden md:flex flex-col items-center justify-center my-6 w-full ${className}`}
    >
      <div className="w-[740px] rounded-xl border border-white/5 bg-[#0f121d]/80 p-2 shadow-md backdrop-blur-sm flex flex-col items-center">
        <div className="w-full flex items-center justify-between px-2 pb-1 border-b border-white/5 mb-1.5 text-[9px] text-zinc-400 uppercase tracking-widest font-semibold">
          <span>Sponsored Banner</span>
          <span>728 × 90 HD</span>
        </div>
        <div
          ref={containerRef}
          className="w-[728px] h-[90px] flex items-center justify-center bg-black/20 rounded overflow-hidden"
        />
      </div>
    </div>
  );
}
