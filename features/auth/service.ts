import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { requireSupabase } from '@/config/supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithPassword(email: string, password: string) {
  const { error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signUpWithPassword(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: Linking.createURL('login') },
  });
  if (error) throw new Error(error.message);
  if (data.session) return data.session;
  const signIn = await requireSupabase().auth.signInWithPassword({ email, password });
  if (signIn.error) {
    if (/confirm/i.test(signIn.error.message)) return null;
    throw new Error(signIn.error.message);
  }
  return signIn.data.session;
}

export async function deleteCurrentAccount() {
  const { error } = await requireSupabase().functions.invoke('delete-account', { method: 'POST' });
  if (error) throw error;
}

async function completeOAuthRedirect(url: string) {
  const parsed = new URL(url);
  const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const accessToken = hash.get('access_token') ?? parsed.searchParams.get('access_token');
  const refreshToken = hash.get('refresh_token') ?? parsed.searchParams.get('refresh_token');
  if (!accessToken || !refreshToken) {
    throw new Error(hash.get('error_description') ?? parsed.searchParams.get('error_description') ?? 'Sign-in did not return a session.');
  }
  const { error } = await requireSupabase().auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw new Error(error.message);
}

export async function signInWithProvider(provider: 'apple' | 'google') {
  const redirect = Linking.createURL('login');
  const { data, error } = await requireSupabase().auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirect, skipBrowserRedirect: true },
  });
  if (error) throw new Error(error.message);
  if (!data.url) throw new Error('The provider did not return a sign-in URL.');
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirect);
  if (result.type !== 'success') return;
  await completeOAuthRedirect(result.url);
}
