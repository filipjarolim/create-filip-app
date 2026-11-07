import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export function useImageCompressor() {
  return async (uri: string) => {
    try {
      const webp = await manipulateAsync(uri, [{ resize: { width: 1600 } }], {
        compress: 0.7,
        format: SaveFormat.WEBP,
      });
      return webp.uri;
    } catch {
      const jpeg = await manipulateAsync(uri, [{ resize: { width: 1600 } }], {
        compress: 0.7,
        format: SaveFormat.JPEG,
      });
      return jpeg.uri;
    }
  };
}
