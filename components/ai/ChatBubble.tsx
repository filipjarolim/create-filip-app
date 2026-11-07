import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type ChatBubbleProps = {
  role: 'user' | 'assistant';
  text: string;
};

export function ChatBubble({ role, text }: ChatBubbleProps) {
  const mine = role === 'user';
  return (
    <View
      accessibilityRole="text"
      className={cn('max-w-[85%] rounded-3xl px-4 py-3', mine ? 'self-end bg-indigo-600' : 'self-start bg-white dark:bg-slate-900')}
    >
      <Text className={mine ? 'text-white' : ''}>{text}</Text>
    </View>
  );
}
