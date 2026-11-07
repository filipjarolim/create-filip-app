import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/components/screen';
import { Text } from '@/components/ui/text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: true }} />
      <Screen scroll={false}>
        <View className="flex-1 justify-center gap-3">
          <Text variant="title">This screen does not exist.</Text>
          <Link href="/" asChild>
            <Text accessibilityRole="link" className="text-base font-semibold text-indigo-600 dark:text-indigo-300">
              Go home
            </Text>
          </Link>
        </View>
      </Screen>
    </>
  );
}
