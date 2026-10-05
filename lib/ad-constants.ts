/**
 * Centralized Monetization Constants for Monetag & Adsterra
 *
 * All ad network scripts, zone IDs, placement names, and default URLs
 * are centralized here to prevent hardcoding throughout components.
 */

export const AD_NETWORKS = {
  MONETAG: 'monetag',
  ADSTERRA: 'adsterra',
  DIRECT: 'direct',
} as const;

export type AdNetworkType = typeof AD_NETWORKS[keyof typeof AD_NETWORKS];

export const MONETAG_CONFIG = {
  ZONE_ID: '11955914',
  SDK_URL: '//libtl.com/sdk.js',
  SDK_FUNCTION: 'show_11955914',
  DEFAULT_IN_APP_SETTINGS: {
    frequency: 2,
    capping: 0.1,
    interval: 30,
    timeout: 5,
    everyPage: false,
  },
} as const;

export const ADSTERRA_CONFIG = {
  POPUNDER_URL: 'https://cheflobesofficer.com/26/24/93/262493230301da17c67cbcf5a1d5e15b.js',
  SMARTLINK_URL: 'https://cheflobesofficer.com/cvdp4vvsma?key=fbecdf734cc50866fb1dcfa342c33a86',
  SOCIAL_BAR_URL: 'https://cheflobesofficer.com/db/ca/37/dbca37a0ea14e2da7c5826f0a5e6fbb9.js',
  NATIVE_BANNER_URL: 'https://cheflobesofficer.com/5f7e7c20bab3c9a4fa6f40424b458934/invoke.js',
  NATIVE_BANNER_CONTAINER_ID: 'container-5f7e7c20bab3c9a4fa6f40424b458934',
  BANNER_728X90_KEY: 'd2a5e27ec28fef3e096f82c41992173b',
  BANNER_728X90_INVOKE_URL: '//www.highperformanceformat.com/d2a5e27ec28fef3e096f82c41992173b/invoke.js',
} as const;

export const AD_PLACEMENTS = {
  HOME_HERO_BANNER: 'home_hero_banner',
  HOME_NATIVE_BANNER: 'home_native_banner',
  CONTENT_SECTION_BANNER_1: 'content_section_banner_1',
  CONTENT_SECTION_BANNER_2: 'content_section_banner_2',
  DESKTOP_728X90: 'desktop_728x90',
  SOCIAL_BAR: 'social_bar',
  POPUNDER: 'popunder',
  UNLOCK_ACTION: 'unlock_action',
  SMARTLINK_SPONSOR: 'smartlink_sponsor',
  PREMIUM_REWARD: 'premium_reward',
} as const;
