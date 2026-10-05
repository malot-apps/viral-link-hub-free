import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns true if Supabase is configured with URL and at least one key
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const pubKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return Boolean(
    url &&
    url.startsWith('http') &&
    (pubKey || serviceKey)
  );
}

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client for client-side / browser operations.
 * CRITICAL SECURITY: ONLY uses public publishable key.
 * NEVER exposes SUPABASE_SERVICE_ROLE_KEY to client components.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const pubKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!url || !pubKey || !url.startsWith('http')) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(url, pubKey, {
      auth: {
        persistSession: false,
      },
    });
  }
  return browserClient;
}

/**
 * Returns a privileged Supabase client for server-side / admin API route operations.
 * This function is ONLY called in server-side route handlers / Node runtime.
 * Uses SUPABASE_SERVICE_ROLE_KEY if provided, falling back to publishable key.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const pubKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  const key = serviceKey || pubKey;
  if (!url || !key || !url.startsWith('http')) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return adminClient;
}
