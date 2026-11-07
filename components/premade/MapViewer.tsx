import { Compass, MapPin, Minus, Plus } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, PanResponder, Platform, Pressable, View } from 'react-native';

import { MediaImage } from '@/components/MediaImage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { searchPlace } from '@/features/places/service';
import { pointToLatLon, visibleTiles, worldPoint } from '@/lib/geo/web-mercator';

export type MapLocation = {
  name: string;
  latitude: number;
  longitude: number;
  zoom: number;
};

const PRESETS: MapLocation[] = [
  { name: 'Prague', latitude: 50.0755, longitude: 14.4378, zoom: 13 },
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522, zoom: 13 },
  { name: 'New York', latitude: 40.7128, longitude: -74.006, zoom: 13 },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, zoom: 13 },
  { name: 'San Francisco', latitude: 37.7749, longitude: -122.4194, zoom: 13 },
];

export function MapViewer() {
  const { t } = useTranslation();
  const [currentLocation, setCurrentLocation] = useState<MapLocation>(PRESETS[0]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ width: 320, height: 240 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const locationRef = useRef(currentLocation);
  const viewportRef = useRef<HTMLElement | null>(null);
  locationRef.current = currentLocation;

  const tiles = useMemo(
    () => visibleTiles(currentLocation.latitude, currentLocation.longitude, currentLocation.zoom, viewport.width, viewport.height),
    [currentLocation, viewport],
  );

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,
      onPanResponderMove: (_, gesture) => setOffset({ x: gesture.dx, y: gesture.dy }),
      onPanResponderRelease: (_, gesture) => {
        const current = locationRef.current;
        const center = worldPoint(current.latitude, current.longitude, current.zoom);
        const next = pointToLatLon(center.x - gesture.dx, center.y - gesture.dy, current.zoom);
        setCurrentLocation({ ...current, latitude: next.latitude, longitude: next.longitude });
        setOffset({ x: 0, y: 0 });
      },
      onPanResponderTerminate: () => setOffset({ x: 0, y: 0 }),
    }),
  ).current;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = viewportRef.current;
    if (!node?.addEventListener) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setCurrentLocation((prev) => ({ ...prev, zoom: Math.min(18, Math.max(3, prev.zoom + (event.deltaY < 0 ? 1 : -1))) }));
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const match = await searchPlace(query);
      if (!match) {
        setSearchError(t('map.notFound'));
        return;
      }
      setCurrentLocation({ ...match, zoom: 13 });
      setSearchQuery('');
    } catch {
      setSearchError(t('map.offline'));
    } finally {
      setIsSearching(false);
    }
  };

  const openInMaps = () => {
    const { latitude, longitude, name } = currentLocation;
    const label = encodeURIComponent(name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${currentLocation.zoom}/${latitude}/${longitude}`,
    });
    void Linking.openURL(url);
  };

  return (
    <Card className="gap-4">
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <MapPin size={22} className="text-indigo-600 dark:text-indigo-400" />
          <Text variant="heading">{t('map.title')}</Text>
        </View>
        <Text variant="muted">{t('map.source')}</Text>
      </View>
      <View className="flex-row gap-2">
        <Input
          className="flex-1"
          placeholder={t('map.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => void handleSearch()}
          returnKeyType="search"
        />
        <Button label={t('map.search')} variant="secondary" loading={isSearching} onPress={() => void handleSearch()} className="px-4" />
      </View>
      {searchError ? <Text variant="muted" className="text-red-500">{searchError}</Text> : null}
      <View className="flex-row flex-wrap gap-2">
        {PRESETS.map((loc) => {
          const selected = loc.name === currentLocation.name;
          return (
            <Pressable
              key={loc.name}
              onPress={() => setCurrentLocation(loc)}
              className={`rounded-full border px-3 py-1.5 ${selected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'}`}
            >
              <Text className={`text-xs font-medium ${selected ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{loc.name}</Text>
            </Pressable>
          );
        })}
      </View>
      <View
        ref={(node) => {
          viewportRef.current = node as unknown as HTMLElement | null;
        }}
        accessibilityLabel={t('map.dragHint')}
        className="relative h-60 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950"
        style={{ touchAction: 'none' }}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (width > 0 && height > 0) setViewport({ width, height });
        }}
        {...pan.panHandlers}
      >
        <View style={{ width: viewport.width, height: viewport.height, transform: [{ translateX: offset.x }, { translateY: offset.y }] }}>
          {tiles.map((tile) => (
            <View key={tile.key} style={{ position: 'absolute', width: 256, height: 256, left: tile.left, top: tile.top }}>
              <MediaImage source={{ uri: tile.uri }} contentFit="fill" style={{ width: 256, height: 256 }} />
            </View>
          ))}
        </View>
        <View pointerEvents="none" className="absolute left-3 top-3 flex-row items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 dark:bg-slate-900/90">
          <Compass size={14} className="text-indigo-600 dark:text-indigo-400" />
          <Text variant="label" className="text-xs">{currentLocation.name}</Text>
        </View>
        <View className="absolute bottom-3 right-3 gap-2">
          <Pressable accessibilityLabel={t('map.zoomIn')} onPress={() => setCurrentLocation((prev) => ({ ...prev, zoom: Math.min(18, prev.zoom + 1) }))} className="h-10 w-10 items-center justify-center rounded-xl bg-white/90 dark:bg-slate-900/90">
            <Plus size={18} className="text-slate-900 dark:text-slate-100" />
          </Pressable>
          <Pressable accessibilityLabel={t('map.zoomOut')} onPress={() => setCurrentLocation((prev) => ({ ...prev, zoom: Math.max(3, prev.zoom - 1) }))} className="h-10 w-10 items-center justify-center rounded-xl bg-white/90 dark:bg-slate-900/90">
            <Minus size={18} className="text-slate-900 dark:text-slate-100" />
          </Pressable>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <View>
          <Text variant="muted" className="text-xs">
            Lat: {currentLocation.latitude.toFixed(4)} | Lon: {currentLocation.longitude.toFixed(4)}
          </Text>
          <Text variant="muted" className="text-xs">{t('map.attribution')}</Text>
        </View>
        <Button label={t('map.open')} variant="ghost" onPress={openInMaps} className="min-h-9 px-3" />
      </View>
    </Card>
  );
}
