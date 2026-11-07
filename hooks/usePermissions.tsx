import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { PrePermissionModal } from '@/components/native/PrePermissionModal';
import { PermissionModal, type PermissionKind } from '@/components/permission-modal';
import { errorMessage } from '@/lib/utils';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

type PendingRequest = {
  kind: PermissionKind;
  resolve: (status: string) => void;
};

type PermissionContextValue = {
  requestTracking: () => Promise<string>;
  requestNotifications: () => Promise<string>;
  requestCamera: () => Promise<string>;
  requestPhotos: () => Promise<string>;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

async function runSystemPrompt(kind: PermissionKind): Promise<string> {
  try {
    if (kind === 'tracking') {
      if (Platform.OS !== 'ios') {
        return 'unavailable';
      }
      const TrackingTransparency = await import('expo-tracking-transparency');
      const result = await TrackingTransparency.requestTrackingPermissionsAsync();
      return result.status;
    }
    if (kind === 'notifications') {
      const result = await Notifications.requestPermissionsAsync();
      return result.status;
    }
    if (kind === 'camera') {
      const result = await Camera.requestCameraPermissionsAsync();
      return result.status;
    }
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return result.status;
  } catch (error) {
    return errorMessage(error, 'The permission request failed.');
  }
}

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<PendingRequest | null>(null);
  const pendingRef = useRef<PendingRequest | null>(null);

  const request = useCallback((kind: PermissionKind) => {
    if (pendingRef.current) {
      return Promise.resolve('Another permission request is already open.');
    }
    return new Promise<string>((resolve) => {
      const next = { kind, resolve };
      pendingRef.current = next;
      setPending(next);
    });
  }, []);

  const finish = useCallback((status: string) => {
    pendingRef.current?.resolve(status);
    pendingRef.current = null;
    setPending(null);
  }, []);

  const confirm = useCallback(async () => {
    const kind = pendingRef.current?.kind;
    if (!kind) {
      return;
    }
    if (kind === 'tracking' && Platform.OS !== 'ios') {
      finish('unavailable');
      return;
    }
    const status = await runSystemPrompt(kind);
    finish(status);
  }, [finish]);

  const value = useMemo<PermissionContextValue>(
    () => ({
      requestTracking: () => request('tracking'),
      requestNotifications: () => request('notifications'),
      requestCamera: () => request('camera'),
      requestPhotos: () => request('photos'),
    }),
    [request],
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
      <PrePermissionModal
        visible={pending?.kind === 'tracking'}
        title={t('permissions.trackingTitle')}
        body={t('permissions.trackingBody')}
        actionLabel={t('common.continue')}
        onContinue={() => void confirm()}
      />
      <PermissionModal
        kind={pending && pending.kind !== 'tracking' ? pending.kind : null}
        onConfirm={() => void confirm()}
        onDismiss={() => finish('dismissed')}
      />
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const value = useContext(PermissionContext);
  if (!value) {
    throw new Error('usePermissions must be used within PermissionProvider.');
  }
  return value;
}
