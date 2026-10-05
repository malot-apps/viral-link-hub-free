'use client';

import { MONETAG_CONFIG, ADSTERRA_CONFIG, AD_NETWORKS } from './ad-constants';
import { AnalyticsEventType } from './types';

declare global {
  interface Window {
    [key: string]: any;
    show_11955914?: (options?: any) => Promise<any>;
  }
}

/**
 * Checks if the current environment is running inside the Telegram Mini App / WebApp.
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const hasTgObject = Boolean(
      window.Telegram?.WebApp?.initData ||
      window.Telegram?.WebApp?.initDataUnsafe?.user?.id
    );
    if (hasTgObject) return true;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('tgWebAppPlatform') || urlParams.has('tgWebAppData')) {
      return true;
    }

    if (window.location.hash.includes('tgWebAppData') || window.location.hash.includes('tgWebAppPlatform')) {
      return true;
    }

    if (typeof navigator !== 'undefined' && /Telegram/i.test(navigator.userAgent)) {
      return true;
    }
  } catch {
    // fallback
  }

  return false;
}

// Singleton state trackers
let monetagSdkPromise: Promise<boolean> | null = null;
let monetagInAppInitialized = false;

/**
 * Loads the Monetag SDK script dynamically with a single-load guard.
 */
export function loadMonetagSdk(zoneId: string = MONETAG_CONFIG.ZONE_ID): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  const sdkFnName = `show_${zoneId}`;
  if (typeof window[sdkFnName] === 'function') {
    return Promise.resolve(true);
  }

  if (monetagSdkPromise) {
    return monetagSdkPromise;
  }

  monetagSdkPromise = new Promise((resolve) => {
    // Check if script element already exists
    const existing = document.querySelector(`script[data-zone="${zoneId}"]`);
    if (existing) {
      if (typeof window[sdkFnName] === 'function') {
        resolve(true);
        return;
      }
    }

    const script = document.createElement('script');
    script.src = MONETAG_CONFIG.SDK_URL;
    script.dataset.zone = zoneId;
    script.dataset.sdk = sdkFnName;
    script.async = true;

    let timeoutId: any = null;

    script.onload = () => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve(true);
    };

    script.onerror = () => {
      if (timeoutId) clearTimeout(timeoutId);
      console.warn(`[Monetag] Failed to load SDK for zone ${zoneId} (ad-blocker may be active).`);
      resolve(false);
    };

    // 6-second timeout failsafe so caller isn't hung forever
    timeoutId = setTimeout(() => {
      const ready = typeof window[sdkFnName] === 'function';
      resolve(ready);
    }, 6000);

    document.head.appendChild(script);
  });

  return monetagSdkPromise;
}

/**
 * Executes Monetag Rewarded Interstitial for explicit 'Watch Ad to Unlock' action.
 * Returns a Promise that resolves ONLY when the ad completion callback resolves.
 */
export async function showMonetagRewardedInterstitial(
  zoneId: string = MONETAG_CONFIG.ZONE_ID
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Browser window unavailable' };
  }

  await loadMonetagSdk(zoneId);
  const sdkFn = window[`show_${zoneId}`];

  if (typeof sdkFn !== 'function') {
    return {
      success: false,
      error: 'Monetag SDK not loaded. Ad-blocker may be active.',
    };
  }

  try {
    // Calling show_11955914() returns a Promise per Monetag specifications
    const result = await sdkFn();
    return { success: true };
  } catch (err: any) {
    console.warn('[Monetag Rewarded Error]:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Ad playback was interrupted or skipped.',
    };
  }
}

/**
 * Executes Monetag Rewarded Popup: show_11955914('pop')
 */
export async function showMonetagRewardedPopup(
  zoneId: string = MONETAG_CONFIG.ZONE_ID
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Browser window unavailable' };
  }

  await loadMonetagSdk(zoneId);
  const sdkFn = window[`show_${zoneId}`];

  if (typeof sdkFn !== 'function') {
    return {
      success: false,
      error: 'Monetag SDK not loaded.',
    };
  }

  try {
    await sdkFn('pop');
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Rewarded popup was dismissed.',
    };
  }
}

/**
 * Initializes Monetag In-App Interstitial inside Telegram Mini App.
 * show_11955914({ type: 'inApp', inAppSettings: { frequency, capping, interval, timeout, everyPage } })
 */
export async function initMonetagInAppInterstitial(
  options?: Partial<{
    frequency: number;
    capping: number;
    interval: number;
    timeout: number;
    everyPage: boolean;
  }>,
  zoneId: string = MONETAG_CONFIG.ZONE_ID
): Promise<boolean> {
  if (monetagInAppInitialized || typeof window === 'undefined') return true;

  await loadMonetagSdk(zoneId);
  const sdkFn = window[`show_${zoneId}`];

  if (typeof sdkFn !== 'function') return false;

  try {
    const inAppSettings = {
      ...MONETAG_CONFIG.DEFAULT_IN_APP_SETTINGS,
      ...options,
    };

    sdkFn({
      type: 'inApp',
      inAppSettings,
    });

    monetagInAppInitialized = true;
    return true;
  } catch (err) {
    console.warn('[Monetag In-App Interstitial Error]:', err);
    return false;
  }
}

/**
 * Centralized telemetry dispatcher
 */
export async function trackAdTelemetry({
  event,
  network,
  placement,
  contentId,
  userId,
  metadata = {},
}: {
  event: AnalyticsEventType;
  network: string;
  placement: string;
  contentId?: string | null;
  userId?: string | number | null;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await fetch('/api/v1/analytics/ad-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        network,
        placement,
        contentId: contentId || null,
        userId: userId ? String(userId) : null,
        metadata: {
          isTelegram: isTelegramWebApp(),
          ...metadata,
        },
      }),
    });
  } catch {
    // Non-fatal telemetry error
  }
}
