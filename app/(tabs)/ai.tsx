import { FlashList } from '@shopify/flash-list';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChatBubble } from '@/components/ai/ChatBubble';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAI } from '@/hooks/useAI';

export default function AssistantScreen() {
  const { t } = useTranslation();
  const { messages, pending, driver, send, stop, clear } = useAI();
  const [draft, setDraft] = useState('');

  return (
    <Screen scroll={false} bottomInset={150} contentClassName="grow">
      <Text variant="title">{t('ai.title')}</Text>
      <Text variant="muted" className="mt-1">
        {driver === 'local' ? t('ai.driverLocal') : t('ai.driverCloud')}
      </Text>
      <View className="mt-4 min-h-0 flex-1">
        {messages.length === 0 ? (
          <Text variant="muted">{t('ai.empty')}</Text>
        ) : (
          <FlashList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 12 }}
            renderItem={({ item }) => (
              <View className="mb-3">
                <ChatBubble role={item.role} text={item.text || '…'} />
              </View>
            )}
          />
        )}
      </View>
      <View className="gap-3 pt-3">
        <Input
          accessibilityLabel={t('ai.placeholder')}
          placeholder={t('ai.placeholder')}
          value={draft}
          onChangeText={setDraft}
        />
        <Button
          label={pending ? t('ai.stop') : t('common.send')}
          loading={false}
          onPress={() => {
            if (pending) {
              stop();
              return;
            }
            const value = draft;
            setDraft('');
            void send(value);
          }}
        />
        {messages.length > 0 ? <Button label={t('ai.clear')} variant="ghost" onPress={clear} /> : null}
        <Link href="/modal/ugc-report" asChild>
          <Text accessibilityRole="link" className="text-center text-sm font-medium text-indigo-600 dark:text-indigo-300">
            {t('ai.report')}
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
