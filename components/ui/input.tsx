import { TextInput, useColorScheme, type TextInputProps } from 'react-native';

import { cn } from '@/lib/utils';

export function Input({ className, placeholderTextColor, ...props }: TextInputProps) {
  const scheme = useColorScheme();
  const placeholder = placeholderTextColor ?? (scheme === 'dark' ? '#94A3B8' : '#64748B');

  return (
    <TextInput
      placeholderTextColor={placeholder}
      autoCapitalize="none"
      className={cn(
        'min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
        className,
      )}
      {...props}
    />
  );
}
