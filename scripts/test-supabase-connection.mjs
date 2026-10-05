// Test Supabase Connection & Configuration Safety
import { isSupabaseConfigured, getSupabaseClient, getSupabaseAdminClient } from '../lib/supabase.ts';

console.log('Testing Supabase Client...');
console.log('Is Supabase Configured in current environment?', isSupabaseConfigured());

if (isSupabaseConfigured()) {
  const client = getSupabaseClient();
  const admin = getSupabaseAdminClient();
  console.log('Supabase Browser Client initialized:', Boolean(client));
  console.log('Supabase Admin Client initialized:', Boolean(admin));
} else {
  console.log('Notice: NEXT_PUBLIC_SUPABASE_URL not populated in local environment.');
  console.log('App running safely in demo/preview mode.');
}
