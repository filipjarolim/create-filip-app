import * as Device from 'expo-device';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

import { isUiPreviewEnabled, readPublicEnv } from '@/config/env';
import { requireSupabase } from '@/config/supabase';
import { localModelFile } from '@/lib/ai/downloader';
import { getLocalRuntime } from '@/lib/ai/local-runtime';
import { renderSystemPrompt } from '@/lib/ai/prompts';
import { assessPrompt } from '@/lib/ai/safety';
import { pinnedFetch } from '@/lib/security/pinned-fetch';

const LOW_RAM_BYTES = 3_000_000_000;

export type ModelDriver = 'local' | 'cloud';

export class SafetyRejection extends Error {
  constructor(readonly reason: string) {
    super('The safety filter rejected this prompt.');
  }
}

export class AssistantUnavailableError extends Error {
  constructor(readonly reason: 'preview' | 'unconfigured' | 'signedOut') {
    super(reason);
  }
}

export async function selectDriver(): Promise<ModelDriver> {
  if (Platform.OS === 'web') return 'cloud';
  const memory = Device.totalMemory ?? 0;
  if (memory > 0 && memory < LOW_RAM_BYTES) return 'cloud';
  try {
    if (!localModelFile().exists || !getLocalRuntime()) return 'cloud';
  } catch {
    return 'cloud';
  }
  return 'local';
}

async function readStream(response: Response, onToken: (token: string) => void) {
  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    text.split(/(\s+)/).forEach((part) => {
      if (part) onToken(part);
    });
    return;
  }
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
}

export type ModelTurn = {
  role: 'user' | 'assistant';
  content: string;
};

async function streamFromCloud(messages: ModelTurn[], onToken: (token: string) => void, signal?: AbortSignal) {
  if (isUiPreviewEnabled()) {
    throw new AssistantUnavailableError('preview');
  }
  const env = readPublicEnv();
  if (!env.success) {
    throw new AssistantUnavailableError('unconfigured');
  }
  const { data } = await requireSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new AssistantUnavailableError('signedOut');
  }
  const response = await pinnedFetch(`${env.data.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-complete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.data.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      system: renderSystemPrompt({
        appName: Constants.expoConfig?.name ?? 'App',
        language: 'the user language',
      }),
    }),
    signal,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'The assistant request failed.');
  }
  await readStream(response, onToken);
}

export async function runModel(
  messages: ModelTurn[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<ModelDriver> {
  const latest = messages.filter((turn) => turn.role === 'user').at(-1)?.content ?? '';
  const verdict = assessPrompt(latest);
  if (!verdict.allowed) {
    throw new SafetyRejection(verdict.reason ?? 'blocked');
  }
  const driver = await selectDriver();
  if (driver === 'local') {
    const runtime = getLocalRuntime();
    if (runtime) {
      const transcript = messages.map((turn) => `${turn.role}: ${turn.content}`).join('\n');
      await runtime.generate(transcript, onToken);
      return driver;
    }
  }
  await streamFromCloud(messages, onToken, signal);
  return 'cloud';
}
