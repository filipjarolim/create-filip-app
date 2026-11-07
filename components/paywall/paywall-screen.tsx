import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases';

import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Text } from '@/components/ui/text';
import { readPublicEnv } from '@/config/env';
import { useHaptics } from '@/hooks/useHaptics';
import { StoreUnavailableError, useRevenueCat } from '@/hooks/useRevenueCat';
import { useAuth } from '@/providers/auth-provider';
import { DeviceCompromisedError } from '@/lib/security/device';
import { orderPackages } from '@/lib/paywall-order';
import { recordPositiveMilestone } from '@/lib/review';
import { cn, errorMessage } from '@/lib/utils';

function packageTitle(pkg: PurchasesPackage, labels: { annual: string; monthly: string; weekly: string }): string {
  if (pkg.packageType === PACKAGE_TYPE.ANNUAL) return labels.annual;
  if (pkg.packageType === PACKAGE_TYPE.MONTHLY) return labels.monthly;
  if (pkg.packageType === PACKAGE_TYPE.WEEKLY) return labels.weekly;
  return pkg.product.title;
}

function storeMessage(error: unknown, preview: string, web: string, fallback: (error: unknown) => string) {
  if (error instanceof StoreUnavailableError) {
    return error.reason === 'preview' ? preview : web;
  }
  return fallback(error);
}
function trialBadge(pkg: PurchasesPackage, labels: { trial: string; intro: string }): string | null {
  const intro = pkg.product.introPrice;
  if (!intro) return null;
  return intro.price === 0 ? labels.trial : labels.intro;
}

export function PaywallScreen() {
  const { t } = useTranslation();
  const { isPreview } = useAuth();
  const { offerings, isReady, isSubscribed, purchasePackage, restorePurchases } = useRevenueCat();
  const { notify } = useHaptics();
  const packages = offerings?.availablePackages ?? [];
  const env = readPublicEnv();
  const variant = env.success ? env.data.EXPO_PUBLIC_PAYWALL_VARIANT : 'annual-first';
  const ranked = orderPackages(packages, variant);
  const preferred = ranked.filter((pkg) =>
    [PACKAGE_TYPE.ANNUAL, PACKAGE_TYPE.MONTHLY, PACKAGE_TYPE.WEEKLY].includes(pkg.packageType),
  );
  const visible = preferred.length > 0 ? preferred : ranked;
  const annual = packages.find((pkg) => pkg.packageType === PACKAGE_TYPE.ANNUAL);
  const monthly = packages.find((pkg) => pkg.packageType === PACKAGE_TYPE.MONTHLY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [working, setWorking] = useState<'purchase' | 'restore' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selected = visible.find((pkg) => pkg.identifier === selectedId) ?? visible[0] ?? null;
  const savings =
    annual && monthly && monthly.product.price > 0
      ? Math.round((1 - annual.product.price / (monthly.product.price * 12)) * 100)
      : null;

  const purchase = async () => {
    if (!selected) return;
    setWorking('purchase');
    setMessage(null);
    try {
      await purchasePackage(selected);
      await notify();
      setMessage(t('paywall.subscribed'));
      await recordPositiveMilestone();
    } catch (error) {
      if (error instanceof DeviceCompromisedError) {
        setMessage(t('paywall.compromised'));
        return;
      }
      const text = storeMessage(error, t('paywall.preview'), t('paywall.storeOnly'), errorMessage);
      if (text !== 'Purchase cancelled.') {
        setMessage(text);
      }
    } finally {
      setWorking(null);
    }
  };

  const restore = async () => {
    setWorking('restore');
    setMessage(null);
    try {
      const info = await restorePurchases();
      const active = Object.keys(info.entitlements.active).length > 0;
      setMessage(active ? t('paywall.restoreDone') : t('paywall.restoreEmpty'));
    } catch (error) {
      setMessage(storeMessage(error, t('paywall.preview'), t('paywall.storeOnly'), errorMessage));
    } finally {
      setWorking(null);
    }
  };

  return (
    <Screen bottomInset={128}>
      <Text variant="title">{t('paywall.title')}</Text>
      <Text variant="muted" className="mt-2">
        {t('paywall.subtitle')}
      </Text>

      {isSubscribed ? (
        <GlassCard className="mt-5">
          <Text variant="heading">{t('paywall.activeTitle')}</Text>
          <Text variant="muted" className="mt-2">
            {t('paywall.activeBody')}
          </Text>
        </GlassCard>
      ) : null}

      <View className="mt-5 gap-3">
        {visible.length === 0 && isReady ? (
          <GlassCard>
            <Text variant="heading">{isPreview ? t('paywall.previewEmpty') : t('paywall.emptyTitle')}</Text>
            <Text variant="muted" className="mt-2">
              {isPreview ? t('paywall.previewEmptyBody') : t('paywall.emptyBody')}
            </Text>
          </GlassCard>
        ) : null}
        {!isReady ? <Text variant="muted">{t('paywall.loading')}</Text> : null}
        {visible.map((pkg) => {
          const labels = {
            annual: t('paywall.annual'),
            monthly: t('paywall.monthly'),
            weekly: t('paywall.weekly'),
          };
          const active = selected?.identifier === pkg.identifier;
          const badge = trialBadge(pkg, { trial: t('paywall.trial'), intro: t('paywall.intro') });
          const bestValue = pkg.packageType === PACKAGE_TYPE.ANNUAL && savings !== null && savings > 0;
          return (
            <GlassCard
              key={pkg.identifier}
              accessibilityLabel={packageTitle(pkg, labels)}
              accessibilityState={{ selected: active }}
              aria-selected={active}
              className={cn(active && 'border-indigo-500')}
              onPress={() => setSelectedId(pkg.identifier)}
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text variant="heading">{packageTitle(pkg, labels)}</Text>
                  <Text variant="muted" className="mt-1">
                    {pkg.product.description || t('paywall.fullAccess')}
                  </Text>
                </View>
                <Text className="text-lg font-semibold text-slate-900 dark:text-slate-50">{pkg.product.priceString}</Text>
              </View>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {badge ? (
                  <View className="rounded-full bg-emerald-100 px-3 py-1 dark:bg-emerald-950">
                    <Text className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">{badge}</Text>
                  </View>
                ) : null}
                {bestValue ? (
                  <View className="rounded-full bg-indigo-100 px-3 py-1 dark:bg-indigo-950">
                    <Text className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">{t('paywall.save', { percent: savings })}</Text>
                  </View>
                ) : null}
              </View>
            </GlassCard>
          );
        })}
      </View>

      {message ? <Text className="mt-4 text-sm text-slate-600 dark:text-slate-300">{message}</Text> : null}

      <View className="mt-5 gap-3">
        <Button
          label={t('common.continue')}
          loading={working === 'purchase'}
          disabled={!selected || isSubscribed}
          onPress={() => void purchase()}
        />
        <Button label={t('common.restore')} variant="secondary" loading={working === 'restore'} onPress={() => void restore()} />
      </View>

      <Text variant="muted" className="mt-4">
        {t('paywall.legal')}
      </Text>
      <View className="mt-3 flex-row gap-4">
        <Link href="/modal/terms" asChild>
          <Text accessibilityRole="link" className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
            {t('auth.terms')}
          </Text>
        </Link>
        <Link href="/modal/privacy" asChild>
          <Text accessibilityRole="link" className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
            {t('auth.privacy')}
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
