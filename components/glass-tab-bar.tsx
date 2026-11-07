import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Bot, CircleUser, House, Layers, Sparkles, type LucideIcon } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  index: House,
  components: Layers,
  ai: Bot,
  paywall: Sparkles,
  profile: CircleUser,
};

export function GlassTabBar({ state, descriptors, navigateToTab, insets }: BottomTabBarProps) {
  const scheme = useAppColorScheme();
  const { selection } = useHaptics();
  const liquid = Platform.OS === 'ios' && isLiquidGlassAvailable();
  const tint = scheme === 'dark' ? 'systemUltraThinMaterialDark' : 'systemUltraThinMaterialLight';
  const active = scheme === 'dark' ? '#C7D2FE' : '#4338CA';
  const inactive = scheme === 'dark' ? '#94A3B8' : '#64748B';

  const bar = (
    <View className="flex-row items-center justify-around px-2 py-2">
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const Icon = ICONS[route.name] ?? House;
        const label = descriptors[route.key]?.options.title ?? route.name;
        const color = focused ? active : inactive;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            aria-selected={focused}
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            className="min-h-12 min-w-16 items-center justify-center px-3"
            onPress={() => {
              void selection();
              if (!focused) {
                navigateToTab(route.key);
              }
            }}
          >
            <View
              className={cn(
                'items-center rounded-full px-4 py-1',
                focused && Platform.OS === 'android' && 'bg-indigo-100 dark:bg-indigo-950',
              )}
            >
              <Icon color={color} size={22} strokeWidth={2} />
            </View>
            <Text className="mt-1 text-xs font-medium" style={{ color }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View className="absolute bottom-0 left-0 right-0 px-4" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
        <View
          className={
            scheme === 'dark'
              ? 'overflow-hidden rounded-full border border-white/10 bg-slate-950/95'
              : 'overflow-hidden rounded-full border border-slate-200 bg-white/95'
          }
        >
          {bar}
        </View>
      </View>
    );
  }

  if (Platform.OS === 'android') {
    return (
      <View
        className="border-t border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        {bar}
      </View>
    );
  }

  return (
    <View className="absolute bottom-0 left-0 right-0 px-4" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      {liquid ? (
        <GlassView glassEffectStyle="regular" colorScheme={scheme === 'dark' ? 'dark' : 'auto'} className="overflow-hidden rounded-full">
          {bar}
        </GlassView>
      ) : (
        <View className="overflow-hidden rounded-full border border-white/40 dark:border-white/10">
          <BlurView intensity={80} tint={tint} style={StyleSheet.absoluteFill} />
          {bar}
        </View>
      )}
    </View>
  );
}
