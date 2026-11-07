import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { readPublicEnv } from '@/config/env';
import { secureStoreAdapter } from '@/lib/secure-store';

function createSupabaseClient(): SupabaseClient | null {
  const parsed = readPublicEnv();
  if (!parsed.success) {
    return null;
  }

  return createClient(parsed.data.EXPO_PUBLIC_SUPABASE_URL, parsed.data.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      storage: secureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = createSupabaseClient();

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the keys from .env.example.');
  }
  return supabase;
}
