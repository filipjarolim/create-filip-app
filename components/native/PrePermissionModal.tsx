import { Modal, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

type PrePermissionModalProps = {
  visible: boolean;
  title: string;
  body: string;
  actionLabel: string;
  onContinue: () => void;
};

export function PrePermissionModal({ visible, title, body, actionLabel, onContinue }: PrePermissionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => undefined}>
      <View className="flex-1 items-center justify-center bg-slate-950/50 px-6">
        <View className="w-full max-w-md rounded-3xl bg-white p-5 dark:bg-slate-900">
          <Text className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</Text>
          <Text className="mt-3 text-base leading-6 text-slate-600 dark:text-slate-300">{body}</Text>
          <Button className="mt-5" label={actionLabel} onPress={onContinue} />
        </View>
      </View>
    </Modal>
  );
}
