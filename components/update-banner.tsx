import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { readPublicEnv } from '@/config/env';
import { updateRequired } from '@/lib/semver';

export function UpdateBanner() {
  const { t } = useTranslation();
  const env = readPublicEnv();
  const updatesUrl = env.success ? (env.data.EXPO_PUBLIC_UPDATES_URL ?? '') : '';
  const standalone = Constants.executionEnvironment === 'standalone' || Constants.executionEnvironment === 'bare';
  const versionBlocked =
    env.success && standalone && updateRequired(Application.nativeApplicationVersion, env.data.EXPO_PUBLIC_MIN_APP_VERSION);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!updatesUrl) return;
    let cancelled = false;
    void import('expo-updates')
      .then(async (Updates) => {
        const result = await Updates.checkForUpdateAsync();
        if (!cancelled && result.isAvailable) setUpdateAvailable(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [updatesUrl]);

  if (!versionBlocked && !updateAvailable) return null;

  return (
    <View className="absolute inset-x-4 top-16 z-10 rounded-3xl bg-slate-900 px-4 py-3">
      <Text className="font-semibold text-white">{t('updates.title')}</Text>
      <Text className="mt-1 text-sm text-slate-200">{t('updates.body')}</Text>
    </View>
  );
}
