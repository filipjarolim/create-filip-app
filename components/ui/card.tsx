import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900', className)}
      {...props}
    />
  );
}
