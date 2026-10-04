/**
 * Telegram Mini App WebApp Authentication & Visitor Logging Middleware
 * Validates initData HMAC-SHA256 signature and records user request analytics
 */
const crypto = require('crypto');
const analyticsService = require('../services/analyticsService');

/**
 * Validates Telegram initData hash according to official Telegram Bot API specification
 * @param {string} initData - Raw initData query string
 * @param {string} botToken - Telegram Bot Token
 * @returns {boolean}
 */
const verifyTelegramHash = (initData, botToken) => {
  if (!initData || !botToken) return false;

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;

    urlParams.delete('hash');
    const params = Array.from(urlParams.entries());
    params.sort(([a], [b]) => a.localeCompare(b));

    const dataCheckString = params.map(([key, val]) => `${key}=${val}`).join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return calculatedHash === hash;
  } catch (err) {
    return false;
  }
};

/**
 * Parses user object from initData query string
 */
const parseTelegramUser = (initData) => {
  if (!initData) return null;
  try {
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    if (userStr) {
      return JSON.parse(decodeURIComponent(userStr));
    }
  } catch (err) {
    // try direct JSON
    try {
      return JSON.parse(initData);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Express Middleware
 */
const telegramAuthMiddleware = async (req, res, next) => {
  const initData =
    req.headers['x-telegram-init-data'] ||
    req.headers['authorization']?.replace(/^Telegram\s+/i, '') ||
    req.query.initData ||
    req.body?.initData;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  let user = null;
  let isSignatureValid = false;

  if (initData) {
    user = parseTelegramUser(initData);

    // If bot token is set, check signature; otherwise allow in dev/staging mode
    if (botToken && botToken !== '123456789:ABCdefGHIjklMNOpqrSTUvwxYZ') {
      isSignatureValid = verifyTelegramHash(initData, botToken);
      if (!isSignatureValid && process.env.NODE_ENV === 'production') {
        return res.status(401).json({
          success: false,
          error: 'Invalid Telegram initData signature',
        });
      }
    } else {
      // Development or test bypass mode
      isSignatureValid = true;
    }
  }

  // Extract client details
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown-UserAgent';

  // Attach to request
  req.telegramUser = user;
  req.isTelegramAuthValid = isSignatureValid;
  req.clientIp = ip;
  req.userAgent = userAgent;

  // Log user request via Telegram analytics
  try {
    await analyticsService.recordRequest({
      userId: user?.id,
      ip,
      userAgent,
      path: req.originalUrl || req.url,
    });
  } catch (err) {
    console.error('[telegramAuthMiddleware] Logging error:', err.message);
  }

  next();
};

module.exports = {
  telegramAuthMiddleware,
  verifyTelegramHash,
  parseTelegramUser,
};
