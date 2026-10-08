'use client';

import React, { useEffect, useRef } from 'react';
import { ISettings, IUserProfile } from '@/lib/types';
import { MONETAG_CONFIG, ADSTERRA_CONFIG, AD_NETWORKS } from '@/lib/ad-constants';
import { isTelegramWebApp, loadMonetagSdk, initMonetagInAppInterstitial, trackAdTelemetry } from '@/lib/ad-manager';

interface GlobalAdManagerProps {
  settings: ISettings;
  userProfile?: IUserProfile | null;
  telegramUserId?: string | number | null;
}

export default function GlobalAdManager({
  settings,
  userProfile,
  telegramUserId,
}: GlobalAdManagerProps) {
  const isInitializedRef = useRef(false);
  const isPremium = Boolean(userProfile?.isPremiumActive);

  useEffect(() => {
    if (isInitializedRef.current || typeof window === 'undefined') return;
    isInitializedRef.current = true;

    // Defend initial page render & hydration: lazy-load ad scripts after main thread is free
    const initAds = () => {
      try {
        const inTelegram = isTelegramWebApp();

        if (inTelegram) {
          // TELEGRAM MINI APP: PRIORITIZE MONETAG ONLY
          if (settings.monetagEnabled !== false) {
            const zoneId = settings.monetagZoneId || MONETAG_CONFIG.ZONE_ID;

            loadMonetagSdk(zoneId)
              .then((loaded) => {
                if (loaded && !isPremium && settings.adPlacements?.monetagInApp !== false) {
                  initMonetagInAppInterstitial(
                    {
                      frequency: settings.inAppFrequency ?? 2,
                      capping: settings.inAppCapping ?? 0.1,
                      interval: settings.inAppInterval ?? 30,
                      timeout: settings.inAppTimeout ?? 5,
                      everyPage: false,
                    },
                    zoneId
                  );
                }
              })
              .catch((err) => console.warn('[Monetag SDK Init Skipped]:', err));
          }
        } else {
          // NORMAL WEB / VERCEL: ADSTERRA SUITE
          if (settings.adsterraEnabled !== false && !isPremium) {
            // 1. Social Bar: global, load once
            if (settings.adPlacements?.socialBarGlobal !== false) {
              const socialBarUrl = settings.adsterraSocialBarUrl || ADSTERRA_CONFIG.SOCIAL_BAR_URL;
              if (!document.querySelector(`script[src="${socialBarUrl}"]`)) {
                const sBar = document.createElement('script');
                sBar.src = socialBarUrl;
                sBar.async = true;
                sBar.dataset.cfasync = 'false';
                sBar.onload = () => {
                  trackAdTelemetry({
                    event: 'ad_impression',
                    network: AD_NETWORKS.ADSTERRA,
                    placement: 'social_bar',
                    userId: telegramUserId,
                  });
                };
                sBar.onerror = () => {
                  console.warn('[Adsterra Social Bar Load Blocked/Failed]');
                };
                document.head.appendChild(sBar);
              }
            }

            // 2. Popunder: maximum once per session/page
            if (settings.adPlacements?.popunderGlobal !== false) {
              const popunderUrl = settings.adsterraPopunderUrl || ADSTERRA_CONFIG.POPUNDER_URL;
              const sessionKey = `adsterra_popunder_fired_${new Date().toISOString().slice(0, 10)}`;

              try {
                const alreadyFired = sessionStorage.getItem(sessionKey);
                if (!alreadyFired && !document.querySelector(`script[src="${popunderUrl}"]`)) {
                  const popScript = document.createElement('script');
                  popScript.src = popunderUrl;
                  popScript.async = true;
                  popScript.dataset.cfasync = 'false';
                  popScript.onload = () => {
                    sessionStorage.setItem(sessionKey, '1');
                    trackAdTelemetry({
                      event: 'ad_impression',
                      network: AD_NETWORKS.ADSTERRA,
                      placement: 'popunder',
                      userId: telegramUserId,
                    });
                  };
                  popScript.onerror = () => {
                    console.warn('[Adsterra Popunder Load Blocked/Failed]');
                  };
                  document.body.appendChild(popScript);
                }
              } catch {
                // sessionStorage might be restricted in private browsing
              }
            }
          }
        }
      } catch (err) {
        console.warn('[GlobalAdManager Init Warning]:', err);
      }
    };

    let timer: NodeJS.Timeout;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        timer = setTimeout(initAds, 1200);
      }, { timeout: 3000 });
    } else {
      timer = setTimeout(initAds, 1500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [settings, isPremium, telegramUserId]);

  return null;
}
