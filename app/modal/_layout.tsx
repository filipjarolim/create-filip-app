import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ModalLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: true }}>
      <Stack.Screen name="privacy" options={{ title: t('profile.privacyPolicy') }} />
      <Stack.Screen name="terms" options={{ title: t('profile.terms') }} />
      <Stack.Screen name="ugc-report" options={{ title: t('common.report') }} />
    </Stack>
  );
}
