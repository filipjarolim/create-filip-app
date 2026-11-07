import { Image, type ImageProps } from 'expo-image';

type MediaImageProps = ImageProps & {
  blurhash?: string;
  thumbhash?: string;
};

export function MediaImage({ blurhash, thumbhash, placeholder, ...props }: MediaImageProps) {
  const hash = thumbhash ? { thumbhash } : blurhash ? { blurhash } : undefined;
  return <Image placeholder={placeholder ?? hash} transition={200} contentFit="cover" {...props} />;
}
