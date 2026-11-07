import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { blockUser, ModerationUnavailableError, reportContent, type ReportReason } from '@/features/moderation/service';
import { useModerationStore } from '@/store/moderation-store';

const REASON_KEY = {
  harassment: 'moderation.reasons.harassment',
  sexual: 'moderation.reasons.sexual',
  violence: 'moderation.reasons.violence',
  other: 'moderation.reasons.other',
} as const;

const REASONS = Object.keys(REASON_KEY) as ReportReason[];

export default function UgcReportScreen() {
  const { t } = useTranslation();
  const blockLocally = useModerationStore((state) => state.block);
  const [reason, setReason] = useState<ReportReason>('other');
  const [details, setDetails] = useState('');
  const [target, setTarget] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await reportContent({ reason, details, targetUserId: target || undefined });
      setMessage(t('moderation.sent'));
    } catch (error) {
      setMessage(error instanceof ModerationUnavailableError ? t('moderation.preview') : t('errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  const block = async () => {
    if (!/^[0-9a-f-]{36}$/i.test(target)) {
      setMessage(t('moderation.targetInvalid'));
      return;
    }
    setBusy(true);
    try {
      await blockUser(target);
      blockLocally(target);
      setMessage(t('moderation.blocked'));
    } catch (error) {
      setMessage(error instanceof ModerationUnavailableError ? t('moderation.preview') : t('errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['bottom', 'left', 'right']}>
      <Text variant="title">{t('moderation.title')}</Text>
      <Text variant="muted" className="mt-2">
        {t('moderation.reason')}
      </Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {REASONS.map((item) => (
          <Button
            key={item}
            label={t(REASON_KEY[item])}
            variant={reason === item ? 'primary' : 'secondary'}
            aria-selected={reason === item}
            onPress={() => setReason(item)}
          />
        ))}
      </View>
      <Input
        className="mt-4"
        accessibilityLabel={t('moderation.details')}
        placeholder={t('moderation.details')}
        value={details}
        onChangeText={setDetails}
      />
      <Input
        className="mt-3"
        accessibilityLabel={t('moderation.target')}
        autoCapitalize="none"
        placeholder={t('moderation.target')}
        value={target}
        onChangeText={setTarget}
      />
      <View className="mt-4 gap-3">
        <Button label={t('common.report')} loading={busy} onPress={() => void submit()} />
        <Button label={t('common.block')} variant="destructive" onPress={() => void block()} />
      </View>
      {message ? <Text className="mt-4">{message}</Text> : null}
    </Screen>
  );
}
