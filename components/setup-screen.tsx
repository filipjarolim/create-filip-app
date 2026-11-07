import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import type { z } from 'zod';

import { formatEnvIssues } from '@/config/env';

export function SetupScreen({ error }: { error: z.ZodError }) {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView contentContainerClassName="px-5 py-8">
        <Text className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Add your keys</Text>
        <Text className="mt-3 text-base leading-6 text-slate-600 dark:text-slate-300">
          Copy .env.example to .env, fill in the Supabase and RevenueCat values, then restart Metro.
        </Text>
        <View className="mt-5 rounded-3xl bg-slate-900 p-4">
          <Text className="font-mono text-sm text-slate-100">{formatEnvIssues(error)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
