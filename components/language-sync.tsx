import { getLocales } from 'expo-localization';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';

import i18n, { isRtlLanguage, resolveLanguage } from '@/config/i18n';
import { useUiStore } from '@/store/ui-store';

export function LanguageSync() {
  const language = useUiStore((state) => state.language);
  const hydrated = useUiStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hydrated) return;
    const next = language === 'system' ? resolveLanguage(getLocales()[0]?.languageCode) : language;
    if (isRtlLanguage(next) !== I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(isRtlLanguage(next));
    }
    void i18n.changeLanguage(next);
  }, [hydrated, language]);

  return null;
}
