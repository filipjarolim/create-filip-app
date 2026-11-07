export const supportedLanguages = ['en', 'cs', 'es'] as const;

export type AppLanguage = (typeof supportedLanguages)[number];

export function resolveLanguage(code: string | null | undefined): AppLanguage {
  return supportedLanguages.find((language) => language === code) ?? 'en';
}

export function isRtlLanguage(code: string): boolean {
  return code === 'ar' || code === 'he';
}
