import * as Linking from 'expo-linking';
import { useEffect } from 'react';

import { readPublicEnv } from '@/config/env';
import { readInviteCode } from '@/lib/deep-link';
import { useUiStore } from '@/store/ui-store';

const HOST = 'your-domain.com';

export function ReferralCapture() {
  useEffect(() => {
    const env = readPublicEnv();
    if (!env.success) return;
    const scheme = env.data.EXPO_PUBLIC_APP_SCHEME;
    const remember = (url: string | null) => {
      if (!url) return;
      const code = readInviteCode(url, scheme, HOST);
      if (code) useUiStore.getState().setReferralCode(code);
    };
    void Linking.getInitialURL().then(remember);
    const subscription = Linking.addEventListener('url', (event) => remember(event.url));
    return () => subscription.remove();
  }, []);

  return null;
}
