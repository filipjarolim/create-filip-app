import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { PrivacyControls } from '@/components/profile/privacy-controls';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { deleteCurrentAccount } from '@/features/auth/service';
import { usePermissions } from '@/hooks/usePermissions';
import { StoreUnavailableError, useRevenueCat } from '@/hooks/useRevenueCat';
import { errorMessage } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useUiStore, type ColorSchemePreference } from '@/store/ui-store';

const SCHEMES: ColorSchemePreference[] = ['system', 'light', 'dark'];

const SCHEME_LABEL: Record<ColorSchemePreference, 'profile.system' | 'profile.light' | 'profile.dark'> = {
  system: 'profile.system',
  light: 'profile.light',
  dark: 'profile.dark',
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { session, signOut } = useAuth();
  const { isSubscribed, restorePurchases } = useRevenueCat();
  const permissions = usePermissions();
  const hapticsEnabled = useUiStore((state) => state.hapticsEnabled);
  const setHapticsEnabled = useUiStore((state) => state.setHapticsEnabled);
  const colorScheme = useUiStore((state) => state.colorScheme);
  const setColorScheme = useUiStore((state) => state.setColorScheme);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const runPermission = async (request: () => Promise<string>) => {
    const status = await request();
    setPermissionStatus(status);
  };

  const deleteAccount = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await deleteCurrentAccount();
      await signOut();
    } catch (error) {
      setMessage(errorMessage(error, t('profile.deleteFailed')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen bottomInset={140}>
      <Text variant="title">{t('profile.title')}</Text>
      <Text variant="muted" className="mt-2">{session?.user.email ?? t('profile.signedIn')}</Text>
      <Text className="mt-3 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
        {isSubscribed ? t('profile.premium') : t('profile.standard')}
      </Text>

      <Card className="mt-5">
        <Text variant="label">{t('profile.appearance')}</Text>
        <View className="mt-3 flex-row gap-2">
          {SCHEMES.map((scheme) => {
            const selected = colorScheme === scheme;
            return (
              <Pressable
                key={scheme}
                accessibilityRole="button"
                aria-selected={selected}
                accessibilityState={{ selected }}
                className={`min-h-11 flex-1 items-center justify-center rounded-2xl ${selected ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'}`}
                onPress={() => setColorScheme(scheme)}
              >
                <Text className={`text-sm font-semibold ${selected ? 'text-white' : ''}`}>{t(SCHEME_LABEL[scheme])}</Text>
              </Pressable>
            );
          })}
        </View>
        <Switch label={t('profile.haptics')} description={t('profile.hapticsHint')} value={hapticsEnabled} onValueChange={setHapticsEnabled} />
      </Card>

      <PrivacyControls userId={session?.user.id} />

      <Card className="mt-4">
        <Text variant="label">{t('profile.permissions')}</Text>
        <Text variant="muted" className="mt-1">
          {t('profile.permissionsHint')}
        </Text>
        <View className="mt-3 gap-2">
          <Button label={t('profile.notifications')} variant="secondary" onPress={() => void runPermission(permissions.requestNotifications)} />
          <Button label={t('profile.camera')} variant="secondary" onPress={() => void runPermission(permissions.requestCamera)} />
          <Button label={t('profile.photos')} variant="secondary" onPress={() => void runPermission(permissions.requestPhotos)} />
          <Button label={t('profile.tracking')} variant="secondary" onPress={() => void runPermission(permissions.requestTracking)} />
        </View>
        {permissionStatus ? <Text variant="muted" className="mt-3">{t('profile.lastResult', { status: permissionStatus })}</Text> : null}
      </Card>

      <Card className="mt-4 gap-3">
        <Link href="/modal/privacy" asChild>
          <Text accessibilityRole="link" className="text-base font-medium text-indigo-600 dark:text-indigo-300">{t('profile.privacyPolicy')}</Text>
        </Link>
        <Link href="/modal/terms" asChild>
          <Text accessibilityRole="link" className="text-base font-medium text-indigo-600 dark:text-indigo-300">{t('profile.terms')}</Text>
        </Link>
        <Button
          label={t('common.restore')}
          variant="secondary"
          onPress={() => {
            void restorePurchases()
              .then(() => setMessage(t('profile.restored')))
              .catch((error: unknown) =>
                setMessage(
                  error instanceof StoreUnavailableError
                    ? t(error.reason === 'preview' ? 'paywall.preview' : 'paywall.storeOnly')
                    : errorMessage(error),
                ),
              );
          }}
        />
        <Button
          label={t('common.signOut')}
          variant="ghost"
          onPress={() => {
            void signOut();
          }}
        />
      </Card>

      <Card className="mt-4">
        <Text variant="heading">{t('profile.deleteTitle')}</Text>
        <Text variant="muted" className="mt-2">
          {t('profile.deleteBody')}
        </Text>
        {deleteStep === 0 ? (
          <Button className="mt-4" label={t('profile.delete')} variant="destructive" onPress={() => setDeleteStep(1)} />
        ) : null}
        {deleteStep === 1 ? (
          <View className="mt-4 gap-3">
            <Text>{t('profile.deleteWarn')}</Text>
            <Button label={t('profile.deleteContinue')} variant="destructive" onPress={() => setDeleteStep(2)} />
            <Button label={t('common.cancel')} variant="ghost" onPress={() => setDeleteStep(0)} />
          </View>
        ) : null}
        {deleteStep === 2 ? (
          <View className="mt-4 gap-3">
            <Text>{t('profile.deleteType')}</Text>
            <TextInput
              accessibilityLabel={t('profile.deleteConfirmLabel')}
              autoCapitalize="characters"
              className="min-h-12 rounded-2xl border border-slate-300 px-4 text-base text-slate-900 dark:border-slate-700 dark:text-slate-50"
              value={confirmation}
              onChangeText={setConfirmation}
            />
            <Button
              label={t('profile.deleteFinal')}
              variant="destructive"
              loading={busy}
              disabled={confirmation !== 'DELETE'}
              onPress={() => void deleteAccount()}
            />
            <Button
              label={t('common.cancel')}
              variant="ghost"
              onPress={() => {
                setDeleteStep(0);
                setConfirmation('');
              }}
            />
          </View>
        ) : null}
      </Card>
      {message ? <Text className="mt-4 text-sm text-slate-600 dark:text-slate-300">{message}</Text> : null}
    </Screen>
  );
}
