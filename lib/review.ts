import * as StoreReview from 'expo-store-review';

import { logEvent } from '@/lib/analytics';
import { useUiStore } from '@/store/ui-store';

/** Asks the platform for an in-app review after the third positive moment. */
export async function recordPositiveMilestone(): Promise<boolean> {
  const count = useUiStore.getState().recordPositiveAction();
  if (count < 3) return false;
  logEvent('review_eligible');
  return maybeRequestReview();
}

/** Asks the platform for an in-app review. The store decides whether the prompt appears. */
export async function maybeRequestReview(): Promise<boolean> {
  try {
    const available = await StoreReview.isAvailableAsync();
    if (!available) {
      return false;
    }
    await StoreReview.requestReview();
    return true;
  } catch {
    return false;
  }
}
