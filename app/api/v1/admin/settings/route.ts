import { NextRequest, NextResponse } from 'next/server';
import { fetchSettings, modifySettings, logAdminAction } from '@/lib/data-service';
import { verifyAdminSession } from '@/lib/admin-auth';
import { isValidHttpUrl, sanitizeString } from '@/lib/security';

export async function GET(req: NextRequest) {
  const admin = verifyAdminSession(req);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  try {
    const settings = await fetchSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('[Admin Settings GET Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve settings' },
      { status: 503 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const admin = verifyAdminSession(req);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Administrator session required' },
      { status: 401 }
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'AdminBrowser/1.0';

  try {
    const body = await req.json();
    const updatePayload: Record<string, any> = {};

    if (body.appName !== undefined) {
      updatePayload.appName = sanitizeString(body.appName) || 'VIRAL LINK HUB';
    }

    if (body.announcementBannerText !== undefined) {
      updatePayload.announcementBannerText = sanitizeString(body.announcementBannerText);
    }

    if (body.maintenanceMode !== undefined) {
      updatePayload.maintenanceMode = Boolean(body.maintenanceMode);
    }

    if (body.forceJoinChannel !== undefined) {
      updatePayload.forceJoinChannel = Boolean(body.forceJoinChannel);
    }

    if (body.defaultAdsRequired !== undefined) {
      updatePayload.defaultAdsRequired = Math.max(0, Math.min(10, Number(body.defaultAdsRequired)));
    }

    if (body.bannerScriptCode !== undefined) {
      updatePayload.bannerScriptCode = String(body.bannerScriptCode).trim();
    }

    if (body.popunderScriptCode !== undefined) {
      updatePayload.popunderScriptCode = String(body.popunderScriptCode).trim();
    }

    // URL validations
    if (body.globalAdLink !== undefined) {
      const url = String(body.globalAdLink).trim();
      if (url && !isValidHttpUrl(url)) {
        return NextResponse.json(
          { success: false, error: 'Global Ad Link must be a valid HTTP or HTTPS address' },
          { status: 400 }
        );
      }
      updatePayload.globalAdLink = url;
    }

    if (body.primaryDirectLink !== undefined) {
      const url = String(body.primaryDirectLink).trim();
      if (url && !isValidHttpUrl(url)) {
        return NextResponse.json(
          { success: false, error: 'Primary Direct Link must be a valid HTTP or HTTPS address' },
          { status: 400 }
        );
      }
      updatePayload.primaryDirectLink = url;
    }

    if (body.secondaryDirectLink !== undefined) {
      const url = String(body.secondaryDirectLink).trim();
      if (url && !isValidHttpUrl(url)) {
        return NextResponse.json(
          { success: false, error: 'Secondary Direct Link must be a valid HTTP or HTTPS address' },
          { status: 400 }
        );
      }
      updatePayload.secondaryDirectLink = url;
    }

    if (body.telegramChannelUrl !== undefined) {
      const url = String(body.telegramChannelUrl).trim();
      if (url && !isValidHttpUrl(url)) {
        return NextResponse.json(
          { success: false, error: 'Telegram Channel URL must be a valid HTTP or HTTPS address' },
          { status: 400 }
        );
      }
      updatePayload.telegramChannelUrl = url;
    }

    const previousSettings = await fetchSettings();
    const updated = await modifySettings(updatePayload);

    // Audit log specific actions
    if (body.maintenanceMode !== undefined && previousSettings.maintenanceMode !== updated.maintenanceMode) {
      await logAdminAction({
        admin: admin.username,
        action: 'maintenance_changed',
        target: updated.maintenanceMode ? 'Enabled' : 'Disabled',
        ip,
        userAgent,
      });
    }

    if (
      body.globalAdLink !== undefined ||
      body.primaryDirectLink !== undefined ||
      body.secondaryDirectLink !== undefined
    ) {
      await logAdminAction({
        admin: admin.username,
        action: 'ad_settings_changed',
        target: 'Monetization URLs Updated',
        ip,
        userAgent,
      });
    }

    await logAdminAction({
      admin: admin.username,
      action: 'settings_updated',
      target: 'Application Settings',
      metadata: { fields: Object.keys(updatePayload) },
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'App settings updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('[Admin Settings PUT Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to update application settings' },
      { status: 500 }
    );
  }
}
