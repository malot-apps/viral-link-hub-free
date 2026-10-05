export type AppMode = 'production' | 'demo';

/**
 * Application Configuration & Explicit Demo-Mode Safety Gate
 * 
 * Rules:
 * - APP_MODE can be 'production' or 'demo'.
 * - When APP_MODE=production:
 *   Required production environment variables MUST be present.
 *   MongoDB failure causes fail-closed behavior (returns 500/503).
 *   In-memory fallback and demo credentials are strictly blocked.
 * - When APP_MODE=demo:
 *   Isolated demo credentials and simulated storage are used.
 *   Demo data is clearly marked and isolated.
 * - If APP_MODE is not explicitly set (e.g. initial preview environment):
 *   Defaults to 'demo' so preview and development operate out-of-the-box.
 */

export const getAppMode = (): AppMode => {
  if (process.env.APP_MODE === 'production') return 'production';
  if (process.env.APP_MODE === 'demo') return 'demo';
  // Default to demo mode in preview/development when not explicitly configured
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
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'APP_URL',
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
  get appUrl(): string {
    return process.env.APP_URL || (isDemo() ? 'http://localhost:3000' : '');
  },
  get adminAllowedOrigin(): string {
    return process.env.ADMIN_ALLOWED_ORIGIN || process.env.APP_URL || '';
  },
  get mongoUri(): string {
    return process.env.MONGODB_URI || '';
  },
  get jwtSecret(): string {
    return process.env.JWT_SECRET || (isDemo() ? 'demo_jwt_secret_do_not_use_in_prod' : '');
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
};
