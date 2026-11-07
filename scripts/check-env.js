#!/usr/bin/env node

const required = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_REVENUECAT_IOS_API_KEY',
  'EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY',
];

const placeholders = ['your-project.supabase.co', 'your-anon-key', 'appl_REPLACE_ME', 'goog_REPLACE_ME'];

const production = process.env.EAS_BUILD_PROFILE === 'production' || process.env.EXPO_PUBLIC_APP_ENV === 'production';
if (!production) {
  process.exit(0);
}

if (process.env.EXPO_PUBLIC_UI_PREVIEW === '1') {
  console.error('EXPO_PUBLIC_UI_PREVIEW must stay unset for a production build.');
  process.exit(1);
}

const missing = required.filter((key) => {
  const value = process.env[key];
  return !value || placeholders.some((placeholder) => value.includes(placeholder));
});

if (missing.length > 0) {
  console.error(`Production environment is missing real values for: ${missing.join(', ')}`);
  process.exit(1);
}
