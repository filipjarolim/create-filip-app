import { Check, Images } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { MediaImage } from '@/components/MediaImage';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

export type PublicStockImage = {
  id: string;
  category: string;
  title: string;
  url: string;
  blurhash?: string;
};

const CURATED_IMAGES: PublicStockImage[] = [
  {
    id: 'nature-1',
    category: 'Nature',
    title: 'Misty Mountains',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
  },
  {
    id: 'nature-2',
    category: 'Nature',
    title: 'Forest Pathway',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    blurhash: 'L29~;v00_300~q%M_3-;00%M%M_3',
  },
  {
    id: 'arch-1',
    category: 'Architecture',
    title: 'Modern Geometric Facade',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
    blurhash: 'L9AB0j00_3%M~q%M_3-;00%M%M_3',
  },
  {
    id: 'arch-2',
    category: 'Architecture',
    title: 'Minimalist Staircase',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    blurhash: 'LIB#w_00~q_3_3%M_3%M00%M%M_3',
  },
  {
    id: 'tech-1',
    category: 'Tech',
    title: 'Workspace Desk',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    blurhash: 'L5G80j~q00%M_3%M_3%M00%M%M_3',
  },
  {
    id: 'tech-2',
    category: 'Tech',
    title: 'Hardware Circuitry',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    blurhash: 'L05#w_00~q_3_3%M_3%M00%M%M_3',
  },
];

const CATEGORIES = ['All', 'Nature', 'Architecture', 'Tech'];

export function PublicImagePicker({
  onSelectImage,
}: {
  onSelectImage?: (image: PublicStockImage) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImageId, setSelectedImageId] = useState<string>(CURATED_IMAGES[0].id);

  const filtered =
    selectedCategory === 'All'
      ? CURATED_IMAGES
      : CURATED_IMAGES.filter((img) => img.category === selectedCategory);

  const handleSelect = (img: PublicStockImage) => {
    setSelectedImageId(img.id);
    onSelectImage?.(img);
  };

  return (
    <Card className="gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Images size={22} className="text-indigo-600 dark:text-indigo-400" />
          <Text variant="heading">Stock Media Gallery</Text>
        </View>
        <Text variant="muted">Unsplash/Picsum (Free)</Text>
      </View>

      {/* Category Pills */}
      <View className="flex-row gap-1.5">
        {CATEGORIES.map((cat) => {
          const isSelected = cat === selectedCategory;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 border ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Image Grid */}
      <View className="flex-row flex-wrap gap-2.5">
        {filtered.map((img) => {
          const isSelected = img.id === selectedImageId;
          return (
            <Pressable
              key={img.id}
              onPress={() => handleSelect(img)}
              className="relative h-28 w-[48%] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <MediaImage
                source={{ uri: img.url }}
                blurhash={img.blurhash}
                className="h-full w-full"
                contentFit="cover"
              />

              {/* Title Overlay */}
              <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-1.5 backdrop-blur-xs">
                <Text className="text-[11px] font-medium text-white" numberOfLines={1}>
                  {img.title}
                </Text>
              </View>

              {/* Selection Checkmark */}
              {isSelected ? (
                <View className="absolute top-2 right-2 h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
                  <Check size={14} className="text-white" />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
