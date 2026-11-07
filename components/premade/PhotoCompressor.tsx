import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon, SlidersHorizontal, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { MediaImage } from '@/components/MediaImage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

const SAMPLE_IMAGE_URL = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=85';

type QualityPreset = {
  label: string;
  value: number;
};

const QUALITY_PRESETS: QualityPreset[] = [
  { label: 'High (85%)', value: 0.85 },
  { label: 'Balanced (60%)', value: 0.6 },
  { label: 'Compact (35%)', value: 0.35 },
  { label: 'Tiny (15%)', value: 0.15 },
];

const RESIZE_PRESETS = [
  { label: 'Original', width: undefined },
  { label: '1600px', width: 1600 },
  { label: '1080px', width: 1080 },
  { label: '600px', width: 600 },
];

export function PhotoCompressor() {
  const [originalUri, setOriginalUri] = useState<string>(SAMPLE_IMAGE_URL);
  const [originalSize, setOriginalSize] = useState<number | null>(1450000); // Sample ~1.45MB
  const [compressedUri, setCompressedUri] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressedDimensions, setCompressedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [quality, setQuality] = useState<number>(0.6);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(1080);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTimeMs, setProcessingTimeMs] = useState<number | null>(null);

  const formatBytes = (bytes: number | null) => {
    if (!bytes || bytes <= 0) return '–';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const calculateFileSize = async (uri: string): Promise<number | null> => {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      return blob.size;
    } catch {
      return null;
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setOriginalUri(asset.uri);
        setCompressedUri(null);
        setCompressedSize(null);
        setProcessingTimeMs(null);

        const size = asset.fileSize ?? (await calculateFileSize(asset.uri));
        setOriginalSize(size);
      }
    } catch {
      Alert.alert('Permission needed', 'Please allow gallery access to pick photos.');
    }
  };

  const handleCompress = async () => {
    if (!originalUri) return;

    setIsProcessing(true);
    const startTime = performance.now();

    try {
      const actions: ImageManipulator.Action[] = [];
      if (maxWidth) {
        actions.push({ resize: { width: maxWidth } });
      }

      const result = await ImageManipulator.manipulateAsync(
        originalUri,
        actions,
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      const endTime = performance.now();
      setProcessingTimeMs(Math.round(endTime - startTime));
      setCompressedUri(result.uri);
      setCompressedDimensions({ width: result.width, height: result.height });

      const newSize = await calculateFileSize(result.uri);
      setCompressedSize(newSize);
    } catch (err) {
      Alert.alert('Compression Error', err instanceof Error ? err.message : 'Failed to compress image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const savingsPercent =
    originalSize && compressedSize && originalSize > compressedSize
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : null;

  return (
    <Card className="gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <ImageIcon size={22} className="text-indigo-600 dark:text-indigo-400" />
          <Text variant="heading">Photo Compressor</Text>
        </View>
        <Text variant="muted">Client-side & Free</Text>
      </View>

      {/* Action Buttons to Select Photo */}
      <View className="flex-row gap-2">
        <Button
          label="Pick Photo"
          variant="secondary"
          onPress={() => void handlePickFromGallery()}
          className="flex-1"
        />
        <Button
          label="Sample Photo"
          variant="ghost"
          onPress={() => {
            setOriginalUri(SAMPLE_IMAGE_URL);
            setOriginalSize(1450000);
            setCompressedUri(null);
            setCompressedSize(null);
          }}
          className="flex-1"
        />
      </View>

      {/* Quality Controls */}
      <View className="gap-1.5">
        <View className="flex-row items-center gap-1.5">
          <SlidersHorizontal size={16} className="text-slate-500" />
          <Text variant="label">Compression Quality</Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {QUALITY_PRESETS.map((preset) => {
            const isSelected = quality === preset.value;
            return (
              <Pressable
                key={preset.label}
                onPress={() => setQuality(preset.value)}
                className={`rounded-xl px-3 py-1.5 border ${
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
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Resize Controls */}
      <View className="gap-1.5">
        <Text variant="label">Max Width Resize</Text>
        <View className="flex-row flex-wrap gap-2">
          {RESIZE_PRESETS.map((preset) => {
            const isSelected = maxWidth === preset.width;
            return (
              <Pressable
                key={preset.label}
                onPress={() => setMaxWidth(preset.width)}
                className={`rounded-xl px-3 py-1.5 border ${
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
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Trigger Button */}
      <Button
        label={isProcessing ? 'Compressing…' : 'Run Compression'}
        loading={isProcessing}
        onPress={() => void handleCompress()}
      />

      {/* Preview Section */}
      <View className="gap-2">
        <View className="flex-row gap-3">
          {/* Original Viewport */}
          <View className="flex-1 gap-1">
            <Text variant="muted" className="text-xs">
              Original: {formatBytes(originalSize)}
            </Text>
            <View className="h-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
              <MediaImage
                source={{ uri: originalUri }}
                className="h-full w-full"
                contentFit="cover"
              />
            </View>
          </View>

          {/* Compressed Viewport */}
          <View className="flex-1 gap-1">
            <Text variant="muted" className="text-xs">
              {compressedSize ? `Output: ${formatBytes(compressedSize)}` : 'Compressed'}
            </Text>
            <View className="h-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
              {compressedUri ? (
                <MediaImage
                  source={{ uri: compressedUri }}
                  className="h-full w-full"
                  contentFit="cover"
                />
              ) : (
                <View className="h-full w-full items-center justify-center p-3">
                  <Text variant="muted" className="text-center text-xs">
                    Tap Run Compression to see output
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Compression Statistics Banner */}
        {compressedSize ? (
          <View className="mt-2 rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
                <Text variant="label" className="text-emerald-900 dark:text-emerald-200">
                  {savingsPercent ? `Saved ${savingsPercent}% file size!` : 'Optimized successfully'}
                </Text>
              </View>
              {processingTimeMs ? (
                <Text variant="muted" className="text-xs text-emerald-700 dark:text-emerald-300">
                  {processingTimeMs} ms
                </Text>
              ) : null}
            </View>
            {compressedDimensions ? (
              <Text variant="muted" className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
                Resolution: {compressedDimensions.width} × {compressedDimensions.height} px
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Card>
  );
}
