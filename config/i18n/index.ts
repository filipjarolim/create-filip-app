import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import cs from '@/config/i18n/locales/cs.json';
import en from '@/config/i18n/locales/en.json';
import es from '@/config/i18n/locales/es.json';
import { resolveLanguage } from '@/lib/locale';

export { isRtlLanguage, resolveLanguage, type AppLanguage } from '@/lib/locale';

export const resources = {
  en: { translation: en },
  cs: { translation: cs },
  es: { translation: es },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: resolveLanguage(getLocales()[0]?.languageCode ?? null),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}

export default i18n;
