import { useEffect } from 'react';
import { AppState } from 'react-native';

import { replayOfflineMutations } from '@/lib/offline-queue';

export function OfflineReplay() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void replayOfflineMutations();
    });
    return () => subscription.remove();
  }, []);
  return null;
}
