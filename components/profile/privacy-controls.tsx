import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Share, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { readPublicEnv } from '@/config/env';
import { referralLink } from '@/lib/referral';
import { useUiStore, type LanguagePreference } from '@/store/ui-store';

const LANGUAGES: LanguagePreference[] = ['system', 'en', 'cs', 'es'];

export function PrivacyControls({ userId }: { userId?: string }) {
  const { t } = useTranslation();
  const language = useUiStore((state) => state.language);
  const setLanguage = useUiStore((state) => state.setLanguage);
  const privacyShield = useUiStore((state) => state.privacyShield);
  const setPrivacyShield = useUiStore((state) => state.setPrivacyShield);
  const biometricLock = useUiStore((state) => state.biometricLock);
  const setBiometricLock = useUiStore((state) => state.setBiometricLock);
  const env = readPublicEnv();
  const [notice, setNotice] = useState<string | null>(null);

  const shareInvite = async () => {
    if (!userId || !env.success) return;
    const message = referralLink(env.data.EXPO_PUBLIC_APP_SCHEME, userId);
    try {
      await Share.share({ message });
      setNotice(null);
    } catch {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(message);
          setNotice(t('profile.copied'));
          return;
        } catch {
          // Clipboard can be blocked; fall through to the visible failure.
        }
      }
      setNotice(t('profile.shareFailed'));
    }
  };

  return (
    <Card className="mt-4">
      <Text variant="label">{t('profile.language')}</Text>
      <View className="mt-3 flex-row gap-2">
        {LANGUAGES.map((item) => {
          const selected = language === item;
          const label = item === 'system' ? t('profile.system') : item.toUpperCase();
          return (
            <Button
              key={item}
              className="flex-1"
              label={label}
              variant={selected ? 'primary' : 'secondary'}
              aria-selected={selected}
              onPress={() => setLanguage(item)}
            />
          );
        })}
      </View>
      <Switch label={t('profile.privacyShield')} description={t('profile.privacyHint')} value={privacyShield} onValueChange={setPrivacyShield} />
      <Switch label={t('profile.biometric')} description={t('profile.biometricHint')} value={biometricLock} onValueChange={setBiometricLock} />
      <Button
        className="mt-3"
        label={t('common.share')}
        variant="secondary"
        disabled={!userId || !env.success}
        onPress={() => void shareInvite()}
      />
      {notice ? <Text variant="muted" className="mt-2">{notice}</Text> : null}
    </Card>
  );
}
