const ALLOWED = new Set(['app_opened', 'purchase_started', 'purchase_restored', 'review_eligible']);

export function logEvent(name: string): void {
  if (!ALLOWED.has(name)) return;
  if (__DEV__) {
    console.info(`[analytics] ${name}`);
  }
}
