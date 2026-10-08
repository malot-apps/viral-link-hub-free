'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Script from 'next/script';
import { ISettings, IUserProfile } from '@/lib/types';
import { MONETAG_CONFIG, ADSTERRA_CONFIG, AD_NETWORKS } from '@/lib/ad-constants';
import { isTelegramWebApp, initMonetagInAppInterstitial, trackAdTelemetry } from '@/lib/ad-manager';

interface GlobalAdManagerProps {
  settings: ISettings;
  userProfile?: IUserProfile | null;
  telegramUserId?: string | number | null;
}

/**
 * GlobalAdManager: Handles non-blocking third-party ad script initialization (Monetag & Adsterra).
 *
 * Requirements:
 * 1. All third-party scripts loaded via Next.js <Script strategy="lazyOnload">.
 * 2. Scripts are injected ONLY after the main application UI has finished rendering & painting
 *    to guarantee 0 main-thread blocking, no hydration stalls, and instant initial page load.
 * 3. Telegram WebApp routes to Monetag; standard Web routes to Adsterra.
 * 4. Frequency/session caps strictly respected (e.g., Popunder max 1 per session).
 * 5. Ad block failsafe & telemetry tracking.
 */
export default function GlobalAdManager({
  settings,
  userProfile,
  telegramUserId,
}: GlobalAdManagerProps) {
  const [canInjectScripts, setCanInjectScripts] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [popunderAllowed, setPopunderAllowed] = useState(false);

  const isPremium = Boolean(userProfile?.isPremiumActive);

  // Defer script injection until AFTER the main application UI is completely mounted and idle
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const allowScriptInjection = () => {
      const inTg = isTelegramWebApp();
      setIsTelegram(inTg);

      // Check popunder session quota (max 1 per session/day)
      if (!inTg && !isPremium && settings.adsterraEnabled !== false && settings.adPlacements?.popunderGlobal !== false) {
        const sessionKey = `adsterra_popunder_fired_${new Date().toISOString().slice(0, 10)}`;
        try {
          const alreadyFired = sessionStorage.getItem(sessionKey);
          if (!alreadyFired) {
            setPopunderAllowed(true);
          }
        } catch {
          // sessionStorage restricted in private browsing
          setPopunderAllowed(false);
        }
      }

      // Main UI finished painting; safe to inject lazy scripts without blocking user interaction
      setCanInjectScripts(true);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(
        () => {
          timer = setTimeout(allowScriptInjection, 800);
        },
        { timeout: 3000 }
      );
      return () => {
        if (timer) clearTimeout(timer);
        if ('cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(handle);
        }
      };
    } else {
      timer = setTimeout(allowScriptInjection, 1200);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isPremium, settings.adsterraEnabled, settings.adPlacements?.popunderGlobal]);

  // Determine which scripts should be injected
  const shouldLoadMonetag = useMemo(() => {
    if (!canInjectScripts) return false;
    // Telegram Mini App flow: Monetag prioritized
    return isTelegram && settings.monetagEnabled !== false;
  }, [canInjectScripts, isTelegram, settings.monetagEnabled]);

  const shouldLoadSocialBar = useMemo(() => {
    if (!canInjectScripts) return false;
    // Normal web flow: Adsterra suite
    return (
      !isTelegram &&
      !isPremium &&
      settings.adsterraEnabled !== false &&
      settings.adPlacements?.socialBarGlobal !== false
    );
  }, [canInjectScripts, isTelegram, isPremium, settings.adsterraEnabled, settings.adPlacements?.socialBarGlobal]);

  const shouldLoadPopunder = useMemo(() => {
    if (!canInjectScripts) return false;
    return (
      !isTelegram &&
      !isPremium &&
      popunderAllowed &&
      settings.adsterraEnabled !== false &&
      settings.adPlacements?.popunderGlobal !== false
    );
  }, [canInjectScripts, isTelegram, isPremium, popunderAllowed, settings.adsterraEnabled, settings.adPlacements?.popunderGlobal]);

  // If UI has not finished rendering yet, inject nothing
  if (!canInjectScripts) {
    return null;
  }

  const monetagZoneId = settings.monetagZoneId || MONETAG_CONFIG.ZONE_ID;
  const monetagSdkUrl = MONETAG_CONFIG.SDK_URL.startsWith('//')
    ? `https:${MONETAG_CONFIG.SDK_URL}`
    : MONETAG_CONFIG.SDK_URL;

  const socialBarUrl = settings.adsterraSocialBarUrl || ADSTERRA_CONFIG.SOCIAL_BAR_URL;
  const popunderUrl = settings.adsterraPopunderUrl || ADSTERRA_CONFIG.POPUNDER_URL;

  return (
    <>
      {/* Monetag SDK: Injected with strategy="lazyOnload" for Telegram WebApp */}
      {shouldLoadMonetag && (
        <Script
          id="monetag-sdk"
          src={monetagSdkUrl}
          strategy="lazyOnload"
          data-zone={monetagZoneId}
          data-sdk={`show_${monetagZoneId}`}
          onLoad={() => {
            trackAdTelemetry({
              event: 'ad_impression',
              network: AD_NETWORKS.MONETAG,
              placement: 'telegram_in_app',
              userId: telegramUserId,
            });

            if (!isPremium && settings.adPlacements?.monetagInApp !== false) {
              initMonetagInAppInterstitial(
                {
                  frequency: settings.inAppFrequency ?? 2,
                  capping: settings.inAppCapping ?? 0.1,
                  interval: settings.inAppInterval ?? 30,
                  timeout: settings.inAppTimeout ?? 5,
                  everyPage: false,
                },
                monetagZoneId
              );
            }
          }}
          onError={(err) => {
            console.warn('[Monetag SDK Load Blocked/Failed]:', err);
          }}
        />
      )}

      {/* Adsterra Social Bar: Injected with strategy="lazyOnload" for Normal Web */}
      {shouldLoadSocialBar && (
        <Script
          id="adsterra-social-bar"
          src={socialBarUrl}
          strategy="lazyOnload"
          data-cfasync="false"
          onLoad={() => {
            trackAdTelemetry({
              event: 'ad_impression',
              network: AD_NETWORKS.ADSTERRA,
              placement: 'social_bar',
              userId: telegramUserId,
            });
          }}
          onError={() => {
            console.warn('[Adsterra Social Bar Load Blocked/Failed]');
          }}
        />
      )}

      {/* Adsterra Popunder: Injected with strategy="lazyOnload" with session capping */}
      {shouldLoadPopunder && (
        <Script
          id="adsterra-popunder"
          src={popunderUrl}
          strategy="lazyOnload"
          data-cfasync="false"
          onLoad={() => {
            const sessionKey = `adsterra_popunder_fired_${new Date().toISOString().slice(0, 10)}`;
            try {
              sessionStorage.setItem(sessionKey, '1');
            } catch {
              // ignore
            }
            trackAdTelemetry({
              event: 'ad_impression',
              network: AD_NETWORKS.ADSTERRA,
              placement: 'popunder',
              userId: telegramUserId,
            });
          }}
          onError={() => {
            console.warn('[Adsterra Popunder Load Blocked/Failed]');
          }}
        />
      )}
    </>
  );
}
