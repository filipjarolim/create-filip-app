import { Text as NativeText, type TextProps } from 'react-native';

import { cn } from '@/lib/utils';

type AppTextProps = TextProps & {
  variant?: 'title' | 'heading' | 'body' | 'muted' | 'label';
};

const variants = {
  title: 'text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50',
  heading: 'text-xl font-semibold text-slate-900 dark:text-slate-50',
  body: 'text-base text-slate-700 dark:text-slate-200',
  muted: 'text-sm text-slate-500 dark:text-slate-400',
  label: 'text-sm font-medium text-slate-700 dark:text-slate-200',
} as const;

export function Text({ variant = 'body', className, maxFontSizeMultiplier = 1.6, ...props }: AppTextProps) {
  return (
    <NativeText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      className={cn(variants[variant], className)}
      {...props}
    />
  );
}
