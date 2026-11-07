import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { inboxMessages } from '@/features/inbox/messages';
import { useAppQuery } from '@/hooks/useAppQuery';
import { useRenderProfiler } from '@/hooks/useRenderProfiler';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { recordPositiveMilestone } from '@/lib/review';
import { useAuth } from '@/providers/auth-provider';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { client, session, isPreview } = useAuth();
  const { isSubscribed, isReady } = useRevenueCat();
  useRenderProfiler('Dashboard');
  const account = useAppQuery({
    queryKey: ['account', session?.user.id],
    enabled: Boolean(session?.user.id) && !isPreview,
    queryFn: async () => {
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      return data.user;
    },
  });

  return (
    <Screen bottomInset={140}>
      <Text variant="title">{t('dashboard.title')}</Text>
      {account.isLoading ? <Skeleton className="mt-3 h-5 w-48" /> : null}
      <Text variant="muted" className="mt-2">
        {account.data?.email ?? session?.user.email
          ? t('dashboard.signedIn', { email: account.data?.email ?? session?.user.email })
          : t('dashboard.ready')}
      </Text>

      <GlassCard className="mt-5">
        <Text variant="heading">{isSubscribed ? t('dashboard.premiumActive') : t('dashboard.standardPlan')}</Text>
        <Text variant="muted" className="mt-2">
          {isReady ? t('dashboard.statusHint') : t('dashboard.checking')}
        </Text>
        <Link href="/(tabs)/paywall" asChild>
          <Text accessibilityRole="link" className="mt-3 text-base font-semibold text-indigo-600 dark:text-indigo-300">
            {isSubscribed ? t('dashboard.manage') : t('dashboard.viewPlans')}
          </Text>
        </Link>
      </GlassCard>

      <View className="mt-4 flex-row gap-3">
        <Card className="flex-1">
          <Text variant="muted">{t('dashboard.cache')}</Text>
          <Text variant="heading" className="mt-1">
            {account.isLoading ? t('common.loading') : t('dashboard.cacheReady')}
          </Text>
        </Card>
        <Card className="flex-1">
          <Text variant="muted">{t('dashboard.plan')}</Text>
          <Text variant="heading" className="mt-1">
            {isSubscribed ? t('dashboard.pro') : t('dashboard.standard')}
          </Text>
        </Card>
      </View>

      <Card className="mt-4 border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <Text variant="heading">Premade API Components</Text>
        <Text variant="muted" className="mt-1">
          Explore interactive maps, client-side photo compression, live weather, and currency converter wired to free APIs.
        </Text>
        <Link href="/(tabs)/components" asChild>
          <Text accessibilityRole="link" className="mt-3 text-base font-semibold text-indigo-600 dark:text-indigo-400">
            Explore Components Tab →
          </Text>
        </Link>
      </Card>

      <View className="mt-5 gap-3">
        <Text variant="label">{t('dashboard.inbox')}</Text>
        {inboxMessages.map((item) => (
          <Card key={item.id}>
            <Text variant="heading">{t(item.titleKey)}</Text>
            <Text variant="muted" className="mt-1">
              {t(item.bodyKey)}
            </Text>
          </Card>
        ))}
      </View>

      <View className="mt-6 gap-3">
        <Button label={t('dashboard.useful')} onPress={() => void recordPositiveMilestone()} />
        <Text variant="muted">{t('dashboard.reviewHint')}</Text>
      </View>
    </Screen>
  );
}
