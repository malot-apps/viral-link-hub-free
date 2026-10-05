export type AppMode = 'production' | 'demo';

/**
 * Application Configuration & Safety Gates
 *
 * Primary production architecture: Next.js + Supabase.
 * - When APP_MODE=production:
 *   Supabase credentials & Admin credentials are required.
 * - When APP_MODE=demo:
 *   Demo data & simulated flows are provided with clear UI indicator.
 */

export const getAppMode = (): AppMode => {
  if (process.env.APP_MODE === 'production' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return 'production';
  }
  if (process.env.APP_MODE === 'demo') return 'demo';
  // Default to demo mode in preview/development when Supabase is not yet configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return 'demo';
  return 'production';
};

export const APP_MODE: AppMode = getAppMode();

export const isProduction = (): boolean => getAppMode() === 'production';
export const isDemo = (): boolean => getAppMode() === 'demo';

export interface ProductionConfigValidation {
  valid: boolean;
  missing: string[];
}

export function validateProductionConfig(): ProductionConfigValidation {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'ADMIN_SESSION_SECRET',
  ];

  const missing = requiredVars.filter((varName) => {
    const val = process.env[varName];
    return !val || val.trim().length === 0;
  });

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
  get supabaseAnonKey(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
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
