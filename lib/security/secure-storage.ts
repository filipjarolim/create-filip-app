import * as SecureStore from 'expo-secure-store';

import { secureStoreAdapter } from '@/lib/secure-store';

export const secureStore = secureStoreAdapter;

const ENTITLEMENT_KEY = 'entitlement-cache';
const GRACE_MS = 14 * 24 * 60 * 60 * 1000;

type EntitlementCache = {
  active: boolean;
  at: number;
};

export async function saveEntitlementCache(active: boolean): Promise<void> {
  const payload: EntitlementCache = { active, at: Date.now() };
  await SecureStore.setItemAsync(ENTITLEMENT_KEY, JSON.stringify(payload));
}

export async function readEntitlementCache(): Promise<boolean | null> {
  const raw = await SecureStore.getItemAsync(ENTITLEMENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as EntitlementCache;
    if (Date.now() - parsed.at > GRACE_MS) return null;
    return parsed.active;
  } catch {
    return null;
  }
}

export async function clearEntitlementCache(): Promise<void> {
  await SecureStore.deleteItemAsync(ENTITLEMENT_KEY);
}
