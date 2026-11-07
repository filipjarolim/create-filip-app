import * as Device from 'expo-device';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import { useEffect, useState } from 'react';
import { AppState, Modal, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useSecurityStore } from '@/store/security-store';
import { useUiStore } from '@/store/ui-store';

const CAPTURE_KEY = 'privacy-shield';

export function useSecurityGuard() {
  const privacyShield = useUiStore((state) => state.privacyShield);
  const biometricLock = useUiStore((state) => state.biometricLock);
  const setCompromised = useSecurityStore((state) => state.setCompromised);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    void Device.isRootedExperimentalAsync()
      .then(setCompromised)
      .catch(() => setCompromised(false));
  }, [setCompromised]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const apply = async () => {
      if (privacyShield) {
        await ScreenCapture.preventScreenCaptureAsync(CAPTURE_KEY);
        await ScreenCapture.enableAppSwitcherProtectionAsync(60);
        return;
      }
      await ScreenCapture.allowScreenCaptureAsync(CAPTURE_KEY);
      await ScreenCapture.disableAppSwitcherProtectionAsync();
    };
    void apply().catch(() => undefined);
  }, [privacyShield]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (!biometricLock) return;
      if (next === 'background') setLocked(true);
    });
    return () => subscription.remove();
  }, [biometricLock]);

  const unlock = async () => {
    const hardware = await LocalAuthentication.hasHardwareAsync().catch(() => false);
    if (!hardware) {
      setLocked(false);
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock',
      cancelLabel: 'Cancel',
    });
    if (result.success) setLocked(false);
  };

  return { locked: biometricLock && locked, unlock };
}

export function SecurityGuard() {
  const { t } = useTranslation();
  const { locked, unlock } = useSecurityGuard();
  if (!locked) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-slate-950 px-6">
        <Text variant="title" className="text-white">
          {t('profile.biometric')}
        </Text>
        <Button className="mt-5" label={t('common.continue')} onPress={() => void unlock()} />
      </View>
    </Modal>
  );
}
