import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

import { useUiStore } from '@/store/ui-store';

export function useHaptics() {
  const enabled = useUiStore((state) => state.hapticsEnabled);

  const impact = useCallback(
    async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
      if (!enabled) {
        return;
      }
      try {
        await Haptics.impactAsync(style);
      } catch {
        // Simulators and some Android devices do not provide a haptic motor.
      }
    },
    [enabled],
  );

  const selection = useCallback(async () => {
    if (!enabled) {
      return;
    }
    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignore devices that cannot play a selection click.
    }
  }, [enabled]);

  const notify = useCallback(
    async (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
      if (!enabled) {
        return;
      }
      try {
        await Haptics.notificationAsync(type);
      } catch {
        // Ignore devices that cannot play a notification haptic.
      }
    },
    [enabled],
  );

  return { impact, selection, notify };
}
