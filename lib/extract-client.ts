import { NextRequest } from 'next/server';
import { parseTelegramUser } from './telegram-verify';
import { recordRequestAnalytics } from './analytics-core';

export function handleRequestMetrics(req: NextRequest) {
  const initDataHeader =
    req.headers.get('x-telegram-init-data') ||
    req.headers.get('authorization')?.replace(/^Telegram\s+/i, '');

  const user = parseTelegramUser(initDataHeader);

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const userAgent = req.headers.get('user-agent') || 'Telegram-Webview';
  const path = req.nextUrl.pathname;

  recordRequestAnalytics({
    userId: user?.id,
    ip,
    userAgent,
    path,
  });

  return {
    user,
    ip,
    userAgent,
  };
}
