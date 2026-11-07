import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupabaseClient } from '@supabase/supabase-js';

import { readPublicEnv } from '@/config/env';
import { QUERY_CACHE_KEY, queryClient } from '@/lib/query-client';
import { secureStoreAdapter } from '@/lib/secure-store';
import { clearEntitlementCache } from '@/lib/security/secure-storage';
import { useModerationStore } from '@/store/moderation-store';
import { UI_STORAGE_KEY, useUiStore } from '@/store/ui-store';

function supabaseAuthKey(): string | null {
  const env = readPublicEnv();
  if (!env.success) return null;
  const ref = new URL(env.data.EXPO_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
  return ref ? `sb-${ref}-auth-token` : null;
}

export async function purgeSession(client?: SupabaseClient): Promise<void> {
  if (client) {
    await client.auth.signOut().catch(() => undefined);
  }

  const key = supabaseAuthKey();
  if (key) {
    await secureStoreAdapter.removeItem(key);
  }
  await clearEntitlementCache();
  queryClient.clear();
  await AsyncStorage.multiRemove([QUERY_CACHE_KEY, UI_STORAGE_KEY, 'offline-mutations']);
  useUiStore.getState().reset();
  useModerationStore.getState().reset();
}
