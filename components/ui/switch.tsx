import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

type AppSwitchProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function Switch({ label, description, value, onValueChange }: AppSwitchProps) {
  const { selection } = useHaptics();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 160 });
  }, [progress, value]);

  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 20 }],
  }));

  const toggle = () => {
    void selection();
    onValueChange(!value);
  };

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={toggle}
      className="min-h-12 flex-row items-center justify-between gap-4 py-2"
    >
      <View className="flex-1">
        <Text variant="label">{label}</Text>
        {description ? <Text variant="muted" className="mt-1">{description}</Text> : null}
      </View>
      <View className={cn('h-8 w-12 justify-center rounded-full p-1', value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600')}>
        <Animated.View style={thumb} className="h-6 w-6 rounded-full bg-white shadow-sm" />
      </View>
    </Pressable>
  );
}
