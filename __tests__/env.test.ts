import { envSchema, formatEnvIssues } from '../config/env';

const valid = {
  EXPO_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: 'appl_test',
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: 'goog_test',
};

describe('envSchema', () => {
  it('fills the entitlement id and scheme when they are omitted', () => {
    const parsed = envSchema.parse(valid);
    expect(parsed.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID).toBe('pro');
    expect(parsed.EXPO_PUBLIC_APP_SCHEME).toBe('createfilipapp');
  });

  it('rejects a non-https Supabase URL', () => {
    const result = envSchema.safeParse({ ...valid, EXPO_PUBLIC_SUPABASE_URL: 'http://abc.supabase.co' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatEnvIssues(result.error)).toContain('EXPO_PUBLIC_SUPABASE_URL');
    }
  });
});
