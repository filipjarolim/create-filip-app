import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: ViewProps) {
  return <View accessibilityRole="progressbar" className={cn('h-4 rounded-2xl bg-slate-200 dark:bg-slate-800', className)} {...props} />;
}
