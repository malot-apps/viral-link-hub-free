import { NextResponse } from 'next/server';
import { fetchSettings } from '@/lib/data-service';

export async function GET() {
  try {
    const settings = await fetchSettings();
    return NextResponse.json({
      success: true,
      data: {
        appName: settings.appName,
        maintenanceMode: Boolean(settings.maintenanceMode),
        globalAdLink: settings.globalAdLink,
        primaryDirectLink: settings.primaryDirectLink || settings.globalAdLink,
        secondaryDirectLink: settings.secondaryDirectLink,
        defaultAdsRequired: settings.defaultAdsRequired ?? 2,
        announcementBannerText: settings.announcementBannerText,
        telegramChannelUrl: settings.telegramChannelUrl || 'https://t.me/virallinkhub_official',
        forceJoinChannel: Boolean(settings.forceJoinChannel),
      },
    });
  } catch (error: any) {
    console.error('[Public App Config Error]:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve application configuration',
      },
      { status: 500 }
    );
  }
}
