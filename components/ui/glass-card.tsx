import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';

import { GlassView } from '@/components/native/GlassView';

type GlassCardProps = ViewProps & {
  children: React.ReactNode;
  onPress?: PressableProps['onPress'];
  accessibilityState?: PressableProps['accessibilityState'];
};

export function GlassCard({
  children,
  className,
  style,
  onPress,
  accessibilityState,
  accessibilityLabel,
  'aria-selected': ariaSelected,
  ...props
}: GlassCardProps) {
  const surface = (
    <GlassView style={style} className={className} {...props}>
      <View className="p-4">{children}</View>
    </GlassView>
  );

  if (!onPress) {
    return surface;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      aria-selected={ariaSelected}
      onPress={onPress}
    >
      {surface}
    </Pressable>
  );
}
