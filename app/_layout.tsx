import '../global.css';
import '@/config/i18n';

import { Image } from 'expo-image';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { NavigationBar } from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LanguageSync } from '@/components/language-sync';
import { OfflineReplay } from '@/components/offline-replay';
import { ReferralCapture } from '@/components/referral-capture';
import { SetupScreen } from '@/components/setup-screen';
import { UpdateBanner } from '@/components/update-banner';
import { AppErrorBoundary } from '@/components/ui/error-boundary';
import { readPublicEnv } from '@/config/env';
import { applyColorScheme } from '@/lib/color-scheme';
import { SecurityGuard } from '@/hooks/useSecurityGuard';
import { PermissionProvider } from '@/hooks/usePermissions';
import { RevenueCatProvider } from '@/hooks/useRevenueCat';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { useUiStore } from '@/store/ui-store';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#A5B4FC',
    background: '#020617',
    card: '#0F172A',
    text: '#F8FAFC',
    border: '#1E293B',
  },
};

function ThemeSync() {
  const preference = useUiStore((state) => state.colorScheme);
  const hydrated = useUiStore((state) => state.hasHydrated);

  useEffect(() => {
    const markReady = () => useUiStore.getState().setHasHydrated(true);
    const unsubscribe = useUiStore.persist.onFinishHydration(markReady);
    if (useUiStore.persist.hasHydrated()) {
      markReady();
    }
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyColorScheme(preference);
  }, [hydrated, preference]);

  return null;
}

function RootNavigator() {
  const { t } = useTranslation();
  const { isReady, session } = useAuth();
  const scheme = useAppColorScheme();

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={scheme === 'dark' ? darkTheme : lightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={session !== null} redirectTo="/(auth)/login">
          <Stack.Screen name="(tabs)" options={{ title: t('tabs.home') }} />
        </Stack.Protected>
        <Stack.Protected guard={session === null} redirectTo="/(tabs)">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

function ConfiguredApp() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RevenueCatProvider>
          <PermissionProvider>
            <ThemeSync />
            <LanguageSync />
            <SecurityGuard />
            <ReferralCapture />
            <OfflineReplay />
            <RootNavigator />
            <UpdateBanner />
          </PermissionProvider>
        </RevenueCatProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default function RootLayout() {
  const env = readPublicEnv();
  const scheme = useAppColorScheme();

  useEffect(() => {
    void Image.prefetch(require('../assets/images/icon.png'));
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: scheme === 'dark' ? '#020617' : '#F8FAFC' }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <NavigationBar style="auto" />
          <AppErrorBoundary>{env.success ? <ConfiguredApp /> : <SetupScreen error={env.error} />}</AppErrorBoundary>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
