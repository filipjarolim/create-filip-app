import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'offline-mutations';

type QueuedMutation = {
  name: string;
  variables: unknown;
  at: number;
};

const handlers = new Map<string, (variables: unknown) => Promise<void>>();

export function registerMutationReplay(name: string, handler: (variables: unknown) => Promise<void>) {
  handlers.set(name, handler);
}

export function isOfflineError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /network|offline|fetch|internet/i.test(message);
}

export async function enqueueFailedMutation(name: string, variables: unknown): Promise<void> {
  const current = await readQueue();
  current.push({ name, variables, at: Date.now() });
  await AsyncStorage.setItem(KEY, JSON.stringify(current.slice(-50)));
}

async function readQueue(): Promise<QueuedMutation[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as QueuedMutation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function replayOfflineMutations(): Promise<void> {
  const current = await readQueue();
  const remaining: QueuedMutation[] = [];
  for (const item of current) {
    const handler = handlers.get(item.name);
    if (!handler) {
      remaining.push(item);
      continue;
    }
    try {
      await handler(item.variables);
    } catch {
      remaining.push(item);
    }
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(remaining));
}
