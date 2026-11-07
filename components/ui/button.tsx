import { cva, type VariantProps } from 'class-variance-authority';
import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

const buttonVariants = cva('min-h-12 flex-row items-center justify-center rounded-2xl px-4', {
  variants: {
    variant: {
      primary: 'bg-indigo-600',
      secondary: 'bg-slate-200 dark:bg-slate-800',
      ghost: 'bg-transparent',
      destructive: 'bg-red-600',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

const labelVariants = {
  primary: 'text-white',
  secondary: 'text-slate-900 dark:text-slate-50',
  ghost: 'text-indigo-600 dark:text-indigo-300',
  destructive: 'text-white',
} as const;

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    label: string;
    loading?: boolean;
  };

export function Button({ label, variant = 'primary', loading = false, disabled, onPress, className, ...props }: ButtonProps) {
  const { impact } = useHaptics();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(isDisabled), busy: loading }}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant }), isDisabled && 'opacity-50', className)}
      onPress={(event) => {
        void impact();
        onPress?.(event);
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#4F46E5' : '#FFFFFF'} />
      ) : (
        <Text className={cn('text-base font-semibold', labelVariants[variant ?? 'primary'])}>{label}</Text>
      )}
    </Pressable>
  );
}
