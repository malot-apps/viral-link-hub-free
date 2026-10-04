import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db-store';

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({
      success: true,
      data: {
        appName: 'VIRAL LINK HUB',
        maintenanceMode: Boolean(settings.maintenanceMode),
        globalAdLink: settings.globalAdLink,
        defaultAdsRequired: settings.defaultAdsRequired ?? 2,
        announcementBannerText: settings.announcementBannerText,
        telegramChannelUrl: settings.telegramChannelUrl || 'https://t.me/virallinkhub_official',
        forceJoinChannel: Boolean(settings.forceJoinChannel),
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve application configuration',
      },
      { status: 500 }
    );
  }
}
