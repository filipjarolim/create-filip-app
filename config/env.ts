import { z } from 'zod';

const httpsUrl = z.string().refine((value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}, 'Enter an https URL');

const optionalText = (fallback: string) =>
  z.preprocess(
    (value) => (value == null || value === '' ? undefined : value),
    z.string().min(1).default(fallback),
  );

const optionalHttps = z.preprocess(
  (value) => (value == null || value === '' ? undefined : value),
  httpsUrl.optional(),
);

export const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: httpsUrl,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: z.string().min(1),
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: z.string().min(1),
  EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID: optionalText('pro'),
  EXPO_PUBLIC_APP_SCHEME: optionalText('createfilipapp'),
  EXPO_PUBLIC_MIN_APP_VERSION: optionalText('1.0.0'),
  EXPO_PUBLIC_PAYWALL_VARIANT: z.preprocess(
    (value) => (value == null || value === '' ? undefined : value),
    z.enum(['control', 'annual-first']).default('annual-first'),
  ),
  EXPO_PUBLIC_TLS_PINS: z.preprocess((value) => (value == null ? undefined : value), z.string().default('')),
  EXPO_PUBLIC_UPDATES_URL: optionalHttps,
});

export type PublicEnv = z.infer<typeof envSchema>;

export function isUiPreviewEnabled() {
  return process.env.EXPO_PUBLIC_UI_PREVIEW === '1' && process.env.EXPO_PUBLIC_APP_ENV !== 'production';
}

export function readPublicEnv(source: NodeJS.ProcessEnv = process.env) {
  return envSchema.safeParse({
    EXPO_PUBLIC_SUPABASE_URL: source.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: source.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: source.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: source.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID: source.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID,
    EXPO_PUBLIC_APP_SCHEME: source.EXPO_PUBLIC_APP_SCHEME,
    EXPO_PUBLIC_MIN_APP_VERSION: source.EXPO_PUBLIC_MIN_APP_VERSION,
    EXPO_PUBLIC_PAYWALL_VARIANT: source.EXPO_PUBLIC_PAYWALL_VARIANT,
    EXPO_PUBLIC_TLS_PINS: source.EXPO_PUBLIC_TLS_PINS,
    EXPO_PUBLIC_UPDATES_URL: source.EXPO_PUBLIC_UPDATES_URL,
  });
}

export function formatEnvIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
}
