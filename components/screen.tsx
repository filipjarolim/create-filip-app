import { ScrollView, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edges } from 'react-native-safe-area-context';

import { cn } from '@/lib/utils';

type ScreenProps = ViewProps & {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edges;
  contentClassName?: string;
  bottomInset?: number;
};

export function Screen({
  children,
  scroll = true,
  edges = ['top', 'left', 'right'],
  className,
  contentClassName,
  bottomInset = 24,
  ...props
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName={cn('px-5 pt-4', contentClassName)}
      contentContainerStyle={{ paddingBottom: bottomInset }}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={cn('flex-1 px-5 pt-4', contentClassName)} style={{ paddingBottom: bottomInset }}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} className={cn('flex-1 bg-slate-50 dark:bg-slate-950', className)} {...props}>
      {body}
    </SafeAreaView>
  );
}
