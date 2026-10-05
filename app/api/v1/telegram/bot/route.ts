import { NextRequest, NextResponse } from 'next/server';
import {
  fetchVideos,
  fetchSettings,
  syncTelegramUser,
  recordAnalyticsEvent,
  getUserProfile,
} from '@/lib/data-service';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json().catch(() => ({}));
    const message = update.message || update.edited_message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true, status: 'ignored_no_message' });
    }

    const text = message.text.trim();
    const from = message.from || {};
    const userId = String(from.id || '');
    const chatId = message.chat?.id || from.id;

    const settings = await fetchSettings();
    const botUsername =
      settings.telegramChannelUrl?.split('/').pop()?.replace(/^@/, '') || 'virallinkhub_bot';
    const appUrl = settings.telegramChannelUrl || 'https://t.me/virallinkhub_official';

    // Parse commands
    const [command, ...args] = text.split(' ');
    const startParam = args.join(' ').trim();

    // Sync user if valid telegram user
    if (userId) {
      await syncTelegramUser({
        tgUser: {
          id: from.id,
          first_name: from.first_name || '',
          last_name: from.last_name || '',
          username: from.username || '',
          is_premium: Boolean(from.is_premium),
        },
        startParam,
      });

      await recordAnalyticsEvent({
        event: 'bot_start',
        userId,
        campaign: startParam || 'direct',
        source: 'telegram_bot',
        metadata: { command },
      });
    }

    const profile = userId ? await getUserProfile(userId) : null;
    const refCode = profile?.referralCode || 'VIP';
    const refLink = `https://t.me/${botUsername}?startapp=ref_${refCode}`;

    let replyText = '';
    let replyMarkup: any = null;

    if (command === '/start') {
      replyText = `🎬 Welcome to *${settings.appName}*!\n\nStream, unlock, and download viral movies, high-speed direct cloud links, and trending series.\n\n🎁 *24-Hour VIP Premium Reward:*\nWatch 3 Ads + Refer 3 Friends → Unlock 24h Premium!\n\nYour Referral Link:\n\`${refLink}\``;
      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: '🚀 Open Mini App',
              web_app: { url: `https://t.me/${botUsername}/app` },
            },
          ],
          [
            {
              text: '📢 Join Official Channel',
              url: settings.telegramChannelUrl || 'https://t.me/virallinkhub_official',
            },
          ],
          [
            {
              text: '👥 Invite Friends (Get VIP)',
              url: `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(
                'Join Viral Link Hub for high-speed cloud streaming!'
              )}`,
            },
          ],
        ],
      };
    } else if (command === '/invite') {
      replyText = `👥 *Invite Friends & Get VIP Premium*\n\nYour unique referral link:\n\`${refLink}\`\n\nProgress:\n• Friends Qualified: *${profile?.qualifiedReferralCount || 0} / 3*\n• Ads Completed: *${profile?.adActionsCompleted || 0} / 3*\n\nComplete both requirements to enjoy 24 hours of completely ad-free streaming!`;
      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: '🔗 Share via Telegram',
              url: `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(
                'Watch viral movies and cloud masters on Viral Link Hub!'
              )}`,
            },
          ],
        ],
      };
    } else if (command === '/profile') {
      const isPrem = profile?.isPremiumActive;
      const premText = isPrem
        ? `✅ *Active VIP Premium* (Expires: ${new Date(profile!.premiumUntil!).toLocaleTimeString()})`
        : '❌ Standard Access';

      replyText = `👤 *Your Profile*\n\n• ID: \`${userId}\`\n• Status: ${premText}\n• Total Referrals: *${profile?.referralCount || 0}*\n• Qualified Friends: *${profile?.qualifiedReferralCount || 0}*\n• Ads Watched: *${profile?.adActionsCompleted || 0} / 3*\n• Referral Code: \`${refCode}\``;
      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: '🚀 Open Mini App',
              web_app: { url: `https://t.me/${botUsername}/app` },
            },
          ],
        ],
      };
    } else if (command === '/trending' || command === '/latest') {
      const movies = await fetchVideos({ featured: command === '/trending' ? true : undefined });
      const top3 = movies.slice(0, 3);
      const listText = top3.map((m, i) => `${i + 1}. *${m.title}* (${m.quality || '1080p'})`).join('\n');

      replyText = `🔥 *${command === '/trending' ? 'Trending Now' : 'Latest Releases'}*\n\n${listText}\n\nOpen the Mini App to stream now:`;
      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: '▶️ Stream Now in App',
              web_app: { url: `https://t.me/${botUsername}/app` },
            },
          ],
        ],
      };
    } else {
      replyText = `🤖 Available commands:\n/open - Launch Mini App\n/trending - Top movies\n/latest - Fresh releases\n/invite - Referral link & VIP progress\n/profile - Your account & status`;
    }

    return NextResponse.json({
      ok: true,
      result: {
        chatId,
        text: replyText,
        replyMarkup,
      },
    });
  } catch (error: any) {
    console.error('[Telegram Bot Webhook Error]:', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
