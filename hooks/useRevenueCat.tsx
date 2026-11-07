import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import { readPublicEnv } from '@/config/env';
import { logEvent } from '@/lib/analytics';
import { DeviceCompromisedError } from '@/lib/security/device';
import { readEntitlementCache, saveEntitlementCache } from '@/lib/security/secure-storage';
import { errorMessage } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useSecurityStore } from '@/store/security-store';

type RevenueCatContextValue = {
  isSubscribed: boolean;
  isReady: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  error: string | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<CustomerInfo>;
  restorePurchases: () => Promise<CustomerInfo>;
};

const RevenueCatContext = createContext<RevenueCatContextValue | null>(null);

export class StoreUnavailableError extends Error {
  constructor(readonly reason: 'preview' | 'web') {
    super(reason);
    this.name = 'StoreUnavailableError';
  }
}

const supported = Platform.OS === 'ios' || Platform.OS === 'android';
let configuredKey: string | null = null;

function configurePurchases(apiKey: string) {
  if (configuredKey === apiKey) {
    return;
  }
  if (__DEV__) {
    void Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  Purchases.configure({ apiKey });
  configuredKey = apiKey;
}

function isCancelled(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  );
}

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const { session, isPreview } = useAuth();
  const userId = session?.user.id ?? null;
  const previousUserId = useRef<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [cachedActive, setCachedActive] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isReady, setReady] = useState(!supported || isPreview);
  const [error, setError] = useState<string | null>(null);

  const env = readPublicEnv();
  const entitlementId = env.success ? env.data.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID : 'pro';
  const apiKey = env.success
    ? Platform.OS === 'ios'
      ? env.data.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
      : env.data.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
    : null;

  useEffect(() => {
    if (isPreview || !supported || !apiKey) {
      return;
    }

    const listener = (info: CustomerInfo) => setCustomerInfo(info);
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [apiKey, isPreview]);

  useEffect(() => {
    if (isPreview || !supported || !apiKey) {
      return;
    }

    let cancelled = false;
    setReady(false);

    const sync = async () => {
      try {
        configurePurchases(apiKey);
        if (previousUserId.current && !userId) {
          await Purchases.logOut();
        }
        const info = userId ? (await Purchases.logIn(userId)).customerInfo : await Purchases.getCustomerInfo();
        const current = await Purchases.getOfferings();
        if (!cancelled) {
          setCustomerInfo(info);
          setOfferings(current.current);
          setError(null);
          void saveEntitlementCache(Boolean(info.entitlements.active[entitlementId]));
        }
      } catch (caught) {
        const cached = await readEntitlementCache();
        if (!cancelled && cached) setCachedActive(true);
        if (!cancelled) {
          setError(errorMessage(caught, 'RevenueCat is not ready yet.'));
        }
      } finally {
        if (!cancelled) {
          previousUserId.current = userId;
          setReady(true);
        }
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [apiKey, entitlementId, isPreview, userId]);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    if (useSecurityStore.getState().compromised) {
      throw new DeviceCompromisedError();
    }
    if (isPreview) {
      throw new StoreUnavailableError('preview');
    }
    if (!supported || !apiKey) {
      throw new StoreUnavailableError('web');
    }
    try {
      logEvent('purchase_started');
      configurePurchases(apiKey);
      const result = await Purchases.purchasePackage(pkg);
      setCustomerInfo(result.customerInfo);
      void saveEntitlementCache(Boolean(result.customerInfo.entitlements.active[entitlementId]));
      setError(null);
      return result.customerInfo;
    } catch (caught) {
      if (isCancelled(caught)) {
        throw new Error('Purchase cancelled.');
      }
      const message = errorMessage(caught, 'The purchase could not be completed.');
      setError(message);
      throw new Error(message);
    }
  }, [apiKey, entitlementId, isPreview]);

  const restorePurchases = useCallback(async () => {
    if (isPreview) {
      throw new StoreUnavailableError('preview');
    }
    if (!supported || !apiKey) {
      throw new StoreUnavailableError('web');
    }
    try {
      configurePurchases(apiKey);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      setError(null);
      logEvent('purchase_restored');
      void saveEntitlementCache(Boolean(info.entitlements.active[entitlementId]));
      return info;
    } catch (caught) {
      const message = errorMessage(caught, 'Purchases could not be restored.');
      setError(message);
      throw new Error(message);
    }
  }, [apiKey, entitlementId, isPreview]);

  const value = useMemo<RevenueCatContextValue>(
    () => ({
      isSubscribed: Boolean(customerInfo?.entitlements.active[entitlementId]) || cachedActive,
      isReady,
      customerInfo,
      offerings,
      error,
      purchasePackage,
      restorePurchases,
    }),
    [cachedActive, customerInfo, entitlementId, error, isReady, offerings, purchasePackage, restorePurchases],
  );

  return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>;
}

export function useRevenueCat() {
  const value = useContext(RevenueCatContext);
  if (!value) {
    throw new Error('useRevenueCat must be used within RevenueCatProvider.');
  }
  return value;
}
