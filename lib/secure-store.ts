import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CHUNK_SIZE = 1800;
const memory = new Map<string, string>();

/**
 * Supabase sessions are larger than the 2048-byte SecureStore value limit.
 * Native apps split the value into numbered chunks in the Keychain or Keystore.
 * Web and server rendering have no Keychain module, so they use localStorage in the
 * browser and an empty memory map during server rendering.
 */
function browserStorage(): Storage | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

async function readRaw(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return browserStorage()?.getItem(key) ?? memory.get(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function writeRaw(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    const storage = browserStorage();
    if (storage) storage.setItem(key, value);
    else memory.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteRaw(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    browserStorage()?.removeItem(key);
    memory.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const secureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const countRaw = await readRaw(`${key}.count`);
    if (!countRaw) {
      return readRaw(key);
    }

    const count = Number(countRaw);
    let value = '';
    for (let index = 0; index < count; index += 1) {
      const part = await readRaw(`${key}.${index}`);
      if (part == null) {
        return null;
      }
      value += part;
    }
    return value;
  },

  async setItem(key: string, value: string): Promise<void> {
    const count = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));
    await writeRaw(`${key}.count`, String(count));
    for (let index = 0; index < count; index += 1) {
      await writeRaw(`${key}.${index}`, value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE));
    }
  },

  async removeItem(key: string): Promise<void> {
    const countRaw = await readRaw(`${key}.count`);
    if (countRaw) {
      const count = Number(countRaw);
      for (let index = 0; index < count; index += 1) {
        await deleteRaw(`${key}.${index}`);
      }
      await deleteRaw(`${key}.count`);
    }
    await deleteRaw(key);
  },
};
