const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  {
    ignores: ['dist/**', 'coverage/**', 'supabase/functions/**', '.expo/**', 'scripts/**'],
  },
  expoConfig,
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'features/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@react-native-async-storage/async-storage',
              message: 'Keep AsyncStorage in the query cache and UI preferences. Tokens belong in expo-secure-store.',
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      'import/no-cycle': ['warn', { maxDepth: 1, ignoreExternal: true }],
    },
  },
]);
