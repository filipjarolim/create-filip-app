import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { isUiPreviewEnabled } from '@/config/env';
import { requireSupabase, supabase } from '@/config/supabase';
import { purgeSession } from '@/lib/security/session-purge';

const SESSION_TIMEOUT_MS = 8000;

type AuthContextValue = {
  session: Session | null;
  isReady: boolean;
  isPreview: boolean;
  client: SupabaseClient;
  signOut: () => Promise<void>;
  enterPreview: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function previewSession(): Session {
  return {
    access_token: 'preview',
    refresh_token: 'preview',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: '00000000-0000-4000-8000-000000000001',
      aud: 'authenticated',
      email: 'preview@example.com',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date(0).toISOString(),
    },
  } as Session;
}

async function readSession(client: SupabaseClient): Promise<Session | null> {
  const timeout = new Promise<null>((resolve) => {
    setTimeout(resolve, SESSION_TIMEOUT_MS, null);
  });
  const request = client.auth.getSession().then(({ data }) => data.session);
  return Promise.race([request, timeout]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const previewEnabled = isUiPreviewEnabled();
  const [session, setSession] = useState<Session | null>(previewEnabled ? previewSession() : null);
  const [isReady, setReady] = useState(previewEnabled);
  const [previewPaused, setPreviewPaused] = useState(false);
  const client = supabase ?? requireSupabase();

  useEffect(() => {
    if (previewEnabled) return;
    let mounted = true;
    void readSession(client)
      .then((next) => {
        if (!mounted) return;
        setSession(next);
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setReady(true);
      });

    const { data } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [client, previewEnabled]);

  const enterPreview = useCallback(() => {
    if (!previewEnabled) return;
    setPreviewPaused(false);
    setSession(previewSession());
    setReady(true);
  }, [previewEnabled]);

  const signOut = useCallback(async () => {
    if (previewEnabled) {
      setPreviewPaused(true);
      setSession(null);
      return;
    }
    await purgeSession(client);
    setSession(null);
  }, [client, previewEnabled]);

  const value = useMemo(
    () => ({
      session,
      isReady,
      isPreview: previewEnabled && !previewPaused && session !== null,
      client,
      signOut,
      enterPreview,
    }),
    [client, enterPreview, isReady, previewEnabled, previewPaused, session, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return value;
}
