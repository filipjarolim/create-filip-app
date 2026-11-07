import { BlurView } from 'expo-blur';
import { GlassView as LiquidGlass, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, StyleSheet, useColorScheme, View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

type GlassViewProps = ViewProps & {
  children: React.ReactNode;
};

export function GlassView({ children, className, style, ...props }: GlassViewProps) {
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? 'systemUltraThinMaterialDark' : 'systemUltraThinMaterialLight';

  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <LiquidGlass
        glassEffectStyle="regular"
        colorScheme={scheme === 'dark' ? 'dark' : 'light'}
        style={style}
        className={cn('overflow-hidden rounded-3xl', className)}
        {...props}
      >
        {children}
      </LiquidGlass>
    );
  }

  return (
    <View
      style={style}
      className={cn(
        'overflow-hidden rounded-3xl border',
        Platform.OS === 'android'
          ? 'border-slate-300/80 bg-white/90 dark:border-white/15 dark:bg-slate-900/85'
          : 'border-white/40 dark:border-white/10',
        className,
      )}
      {...props}
    >
      {Platform.OS === 'ios' ? <BlurView intensity={80} tint={tint} style={StyleSheet.absoluteFill} /> : null}
      {children}
    </View>
  );
}
