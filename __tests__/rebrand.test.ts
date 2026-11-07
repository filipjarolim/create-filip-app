import { rebrandContents, slugify } from '../scripts/rename';

describe('rename', () => {
  it('builds a package slug from the app name', () => {
    expect(slugify('Acme Notes')).toBe('acme-notes');
    expect(slugify('Lístek')).toBe('listek');
  });

  it('replaces the current brand without corrupting longer tokens', () => {
    const from = {
      appName: 'Universal Starter',
      slug: 'expo-universal-starter',
      bundleId: 'com.universal.starter',
      scheme: 'universalstarter',
      supabaseUrl: 'https://your-project.supabase.co',
      revenueCatIosKey: 'appl_REPLACE_ME',
      revenueCatAndroidKey: 'goog_REPLACE_ME',
    };
    const to = {
      ...from,
      appName: 'Acme',
      slug: 'acme',
      bundleId: 'com.acme.app',
      scheme: 'acme',
    };
    const output = rebrandContents(
      'Universal Starter expo-universal-starter universalstarter com.universal.starter',
      from,
      to,
    );
    expect(output).toBe('Acme acme acme com.acme.app');
  });

  it('does not replace a short token inside a longer one', () => {
    const output = rebrandContents('my-app app', { slug: 'my-app', appName: 'app' }, { slug: 'my-tool', appName: 'tool' });
    expect(output).toBe('my-tool tool');
  });
});
