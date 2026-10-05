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
        // Monetag Config
        monetagZoneId: settings.monetagZoneId || '11955914',
        monetagEnabled: settings.monetagEnabled !== false,
        inAppFrequency: settings.inAppFrequency ?? 2,
        inAppCapping: settings.inAppCapping ?? 0.1,
        inAppInterval: settings.inAppInterval ?? 30,
        inAppTimeout: settings.inAppTimeout ?? 5,
        // Adsterra Config
        adsterraEnabled: settings.adsterraEnabled !== false,
        adsterraPopunderUrl: settings.adsterraPopunderUrl || 'https://cheflobesofficer.com/26/24/93/262493230301da17c67cbcf5a1d5e15b.js',
        adsterraSmartlinkUrl: settings.adsterraSmartlinkUrl || 'https://cheflobesofficer.com/cvdp4vvsma?key=fbecdf734cc50866fb1dcfa342c33a86',
        adsterraSocialBarUrl: settings.adsterraSocialBarUrl || 'https://cheflobesofficer.com/db/ca/37/dbca37a0ea14e2da7c5826f0a5e6fbb9.js',
        adsterraNativeBannerUrl: settings.adsterraNativeBannerUrl || 'https://cheflobesofficer.com/5f7e7c20bab3c9a4fa6f40424b458934/invoke.js',
        adsterraNativeBannerContainer: settings.adsterraNativeBannerContainer || 'container-5f7e7c20bab3c9a4fa6f40424b458934',
        adsterraBanner728x90Key: settings.adsterraBanner728x90Key || 'd2a5e27ec28fef3e096f82c41992173b',
        // Placement & Frequency Controls
        adCooldownSeconds: settings.adCooldownSeconds ?? 10,
        maxAdsPerSession: settings.maxAdsPerSession ?? 5,
        maxPopundersPerSession: settings.maxPopundersPerSession ?? 1,
        adPlacements: settings.adPlacements || {
          homeBanner: true,
          contentCard: true,
          contentDetails: true,
          unlockAction: true,
          betweenNav: true,
          popunder: true,
          premiumRewardArea: true,
          nativeBannerHome: true,
          nativeBannerContent: true,
          banner728x90Desktop: true,
          socialBarGlobal: true,
          popunderGlobal: true,
          monetagRewarded: true,
          monetagInApp: true,
        },
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
