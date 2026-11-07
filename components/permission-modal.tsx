import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

export type PermissionKind = 'tracking' | 'notifications' | 'camera' | 'photos';

const COPY_KEY = {
  notifications: { title: 'permissions.notificationsTitle', body: 'permissions.notificationsBody' },
  camera: { title: 'permissions.cameraTitle', body: 'permissions.cameraBody' },
  photos: { title: 'permissions.photosTitle', body: 'permissions.photosBody' },
} as const;

type PermissionModalProps = {
  kind: PermissionKind | null;
  onConfirm: () => void;
  onDismiss: () => void;
};

export function PermissionModal({ kind, onConfirm, onDismiss }: PermissionModalProps) {
  const { t } = useTranslation();
  const keys = kind && kind !== 'tracking' ? COPY_KEY[kind] : null;
  const copy = keys ? { title: t(keys.title), body: t(keys.body), confirm: t('common.continue') } : null;

  return (
    <Modal visible={kind !== null} transparent animationType="fade" onRequestClose={onDismiss}>
      <View className="flex-1 items-center justify-center px-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('permissions.dismiss')}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onDismiss}
        />
        <View className="z-10 w-full max-w-md rounded-3xl border border-white/20 bg-white p-5 dark:bg-slate-900">
          <Text className="text-xl font-semibold text-slate-900 dark:text-slate-50">{copy?.title}</Text>
          <Text className="mt-3 text-base leading-6 text-slate-600 dark:text-slate-300">{copy?.body}</Text>
          <View className="mt-5 gap-3">
            <Button label={copy?.confirm ?? t('common.continue')} onPress={onConfirm} />
            <Button label={t('permissions.notNow')} variant="ghost" onPress={onDismiss} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
  },
});
