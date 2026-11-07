import * as Crypto from 'expo-crypto';
import { Directory, DownloadTask, File, Paths } from 'expo-file-system';

export function modelDirectory(): Directory {
  const directory = new Directory(Paths.document, 'models');
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  return directory;
}

export function localModelFile(): File {
  return new File(modelDirectory(), 'model.gguf');
}

export async function sha256Of(file: File): Promise<string> {
  const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, new Uint8Array(await file.arrayBuffer()));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createModelDownload(url: string) {
  return new DownloadTask(url, localModelFile());
}

export async function verifyModel(file: File, expectedSha256: string) {
  const actual = await sha256Of(file);
  if (actual !== expectedSha256.toLowerCase()) {
    file.delete();
    throw new Error('The model hash did not match.');
  }
  return file;
}

export async function downloadModel(url: string, expectedSha256: string) {
  const file = await createModelDownload(url).downloadAsync();
  if (!file) {
    throw new Error('The model download was paused. Call resumeAsync() on the task from createModelDownload().');
  }
  return verifyModel(file, expectedSha256);
}
