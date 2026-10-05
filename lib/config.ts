export type AppMode = 'production' | 'demo';

/**
 * Application Configuration & Safety Gates
 *
 * Architecture: Next.js 15 + Supabase PostgreSQL + ENV-based Admin Auth.
 * - When APP_MODE=production:
 *   Supabase credentials & Admin credentials are required.
 *   Production mode NEVER silently falls back to demo mode.
 * - When APP_MODE=demo:
 *   Demo data & simulated flows are provided with clear UI indicators.
 */

export const getAppMode = (): AppMode => {
  if (process.env.APP_MODE === 'production') {
    return 'production';
  }
  if (process.env.APP_MODE === 'demo') {
    return 'demo';
  }
  // Default based on presence of production Supabase credentials
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const hasSupabaseKey = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );

  if (hasSupabaseUrl && hasSupabaseKey) {
    return 'production';
  }

  return 'demo';
};

export const APP_MODE: AppMode = getAppMode();

export const isProduction = (): boolean => getAppMode() === 'production';
export const isDemo = (): boolean => getAppMode() === 'demo';

export interface ProductionConfigValidation {
  valid: boolean;
  missing: string[];
}

export function validateProductionConfig(): ProductionConfigValidation {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  const hasPublishable = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
  if (!hasPublishable && !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  if (!process.env.ADMIN_USERNAME?.trim()) {
    missing.push('ADMIN_USERNAME');
  }

  if (!process.env.ADMIN_PASSWORD?.trim()) {
    missing.push('ADMIN_PASSWORD');
  }

  const hasSessionSecret = Boolean(
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim()
  );
  if (!hasSessionSecret) {
    missing.push('ADMIN_SESSION_SECRET');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

export const config = {
  get mode(): AppMode {
    return getAppMode();
  },
  get supabaseUrl(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  },
  get supabasePublishableKey(): string {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ''
    );
  },
  // Alias for backward compatibility
  get supabaseAnonKey(): string {
    return this.supabasePublishableKey;
  },
  get supabaseServiceRoleKey(): string {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  },
  get adminSessionSecret(): string {
    return (
      process.env.ADMIN_SESSION_SECRET ||
      process.env.JWT_SECRET ||
      (isDemo() ? 'demo_admin_session_secret_2026' : '')
    );
  },
  get adminUsername(): string {
    return process.env.ADMIN_USERNAME || '';
  },
  get adminPassword(): string {
    return process.env.ADMIN_PASSWORD || '';
  },
  get demoAdminUsername(): string {
    return process.env.DEMO_ADMIN_USERNAME || 'demo_admin';
  },
  get demoAdminPassword(): string {
    return process.env.DEMO_ADMIN_PASSWORD || 'ViralDemo2026!';
  },
  get telegramBotToken(): string {
    return process.env.TELEGRAM_BOT_TOKEN || '';
  },
  get telegramChannelId(): string {
    return process.env.TELEGRAM_CHANNEL_ID || '';
  },
  get appUrl(): string {
    return process.env.APP_URL || '';
  },
  get adminAllowedOrigin(): string {
    return process.env.ADMIN_ALLOWED_ORIGIN || process.env.APP_URL || '';
  },
};
