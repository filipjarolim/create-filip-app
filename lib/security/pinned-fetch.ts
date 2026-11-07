import { readPublicEnv } from '@/config/env';

function allowedHosts(): Set<string> {
  const hosts = new Set<string>();
  const env = readPublicEnv();
  if (env.success) {
    hosts.add(new URL(env.data.EXPO_PUBLIC_SUPABASE_URL).hostname);
  }
  hosts.add('your-domain.com');
  return hosts;
}

export async function pinnedFetch(input: string, init?: RequestInit): Promise<Response> {
  const url = new URL(input);
  if (url.protocol !== 'https:') {
    throw new Error('Only https requests are allowed.');
  }
  if (!allowedHosts().has(url.hostname)) {
    throw new Error(`The host ${url.hostname} is not on the request allowlist.`);
  }
  return fetch(url, init);
}
