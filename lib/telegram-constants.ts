/**
 * Telegram Mini App & Growth Configuration
 */

export const PRIMARY_BOT_USERNAME = 'viral_link_hub_free_bot';
export const PRIMARY_MINI_APP_SHORT_NAME = 'viral';
export const PRIMARY_MINI_APP_URL = `https://t.me/${PRIMARY_BOT_USERNAME}/${PRIMARY_MINI_APP_SHORT_NAME}`;
export const OFFICIAL_CHANNEL_URL = 'https://t.me/virallinkhub_official';

/**
 * Builds a trackable Telegram Mini App referral link using the standard startapp query parameter.
 * Example output: https://t.me/viral_link_hub_free_bot/viral?startapp=ref_VLH9041
 * Or with campaign: https://t.me/viral_link_hub_free_bot/viral?startapp=c_tiktok_ref_VLH9041
 */
export function buildTelegramReferralLink(referralCode?: string | null, campaign?: string | null): string {
  const cleanCode = (referralCode || '').replace(/^ref_/, '').trim();
  const cleanCamp = (campaign || '').replace(/^c_/, '').trim();

  let startappParam = '';

  if (cleanCamp && cleanCode) {
    startappParam = `c_${cleanCamp}_ref_${cleanCode}`;
  } else if (cleanCode) {
    startappParam = `ref_${cleanCode}`;
  } else if (cleanCamp) {
    startappParam = `c_${cleanCamp}`;
  }

  return startappParam
    ? `${PRIMARY_MINI_APP_URL}?startapp=${startappParam}`
    : PRIMARY_MINI_APP_URL;
}

/**
 * Parses startapp parameter into campaign and referral code components.
 */
export function parseStartappParam(rawParam?: string | null): {
  referralCode: string | null;
  campaign: string | null;
} {
  if (!rawParam || typeof rawParam !== 'string') {
    return { referralCode: null, campaign: null };
  }

  const clean = rawParam.trim();

  // Pattern 1: c_CAMPID_ref_REFCODE
  const combinedMatch = clean.match(/^c_([a-zA-Z0-9_-]+)_ref_([a-zA-Z0-9_-]+)$/);
  if (combinedMatch) {
    return {
      campaign: combinedMatch[1],
      referralCode: combinedMatch[2],
    };
  }

  // Pattern 2: ref_REFCODE
  const refMatch = clean.match(/^ref_([a-zA-Z0-9_-]+)$/);
  if (refMatch) {
    return {
      campaign: null,
      referralCode: refMatch[1],
    };
  }

  // Pattern 3: c_CAMPID
  const campMatch = clean.match(/^c_([a-zA-Z0-9_-]+)$/);
  if (campMatch) {
    return {
      campaign: campMatch[1],
      referralCode: null,
    };
  }

  // Fallback if plain code passed
  return {
    referralCode: clean.startsWith('VLH') ? clean : null,
    campaign: null,
  };
}
