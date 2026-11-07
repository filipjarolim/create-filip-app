import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { signInWithProvider } from '@/features/auth/service';
import { errorMessage } from '@/lib/utils';

export function OAuthButtons() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);

  const start = async (provider: 'apple' | 'google') => {
    setBusy(provider);
    setError(null);
    try {
      await signInWithProvider(provider);
    } catch (caught) {
      setError(errorMessage(caught, t('auth.requestFailed')));
    } finally {
      setBusy(null);
    }
  };

  return (
    <View className="gap-3">
      <Button label={t('auth.apple')} variant="secondary" loading={busy === 'apple'} onPress={() => void start('apple')} />
      <Button label={t('auth.google')} variant="secondary" loading={busy === 'google'} onPress={() => void start('google')} />
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
