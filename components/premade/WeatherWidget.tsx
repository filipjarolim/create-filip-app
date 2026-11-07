import {
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  Wind,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useAppQuery } from '@/hooks/useAppQuery';

type CityCoord = {
  name: string;
  lat: number;
  lon: number;
};

const POPULAR_CITIES: CityCoord[] = [
  { name: 'Prague', lat: 50.0755, lon: 14.4378 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
];

function WeatherIcon({ code, size, className }: { code: number; size: number; className?: string }) {
  if (code === 0 || code === 1) return <Sun size={size} className={className} />;
  if (code === 2) return <CloudSun size={size} className={className} />;
  if (code >= 3 && code <= 48) return <CloudFog size={size} className={className} />;
  if (code >= 51 && code <= 67) return <CloudRain size={size} className={className} />;
  if (code >= 71 && code <= 86) return <CloudSnow size={size} className={className} />;
  if (code >= 95) return <CloudLightning size={size} className={className} />;
  return <CloudSun size={size} className={className} />;
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowfall';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Fair Weather';
}

export function WeatherWidget() {
  const [selectedCity, setSelectedCity] = useState<CityCoord>(POPULAR_CITIES[0]);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  const weatherQuery = useAppQuery({
    queryKey: ['open-meteo-weather', selectedCity.name, selectedCity.lat, selectedCity.lon],
    queryFn: async () => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      return res.json() as Promise<{
        current: {
          temperature_2m: number;
          relative_humidity_2m: number;
          apparent_temperature: number;
          weather_code: number;
          wind_speed_10m: number;
        };
        daily: {
          time: string[];
          weather_code: number[];
          temperature_2m_max: number[];
          temperature_2m_min: number[];
        };
      }>;
    },
    staleTime: 1000 * 60 * 10,
  });

  const toDisplayTemp = (celsius: number) => {
    if (unit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const current = weatherQuery.data?.current;
  const daily = weatherQuery.data?.daily;

  return (
    <Card className="gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <CloudSun size={22} className="text-indigo-600 dark:text-indigo-400" />
          <Text variant="heading">Live Weather</Text>
        </View>
        <Text variant="muted">Open-Meteo (Free)</Text>
      </View>

      {/* City Switcher Chips & Units Toggle */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row flex-wrap gap-1.5 flex-1">
          {POPULAR_CITIES.map((city) => {
            const isSelected = city.name === selectedCity.name;
            return (
              <Pressable
                key={city.name}
                onPress={() => setSelectedCity(city)}
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
                  {city.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => setUnit((prev) => (prev === 'C' ? 'F' : 'C'))}
          className="ml-2 rounded-xl bg-slate-200 px-2.5 py-1 dark:bg-slate-800"
        >
          <Text variant="label" className="text-xs">
            °{unit}
          </Text>
        </Pressable>
      </View>

      {/* Main Weather Card */}
      {weatherQuery.isLoading ? (
        <View className="gap-2 py-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 w-48" />
        </View>
      ) : current ? (
        <View className="flex-row items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
          <View className="gap-1">
            <Text className="text-4xl font-bold text-slate-900 dark:text-slate-50">
              {toDisplayTemp(current.temperature_2m)}
            </Text>
            <Text variant="label" className="text-indigo-600 dark:text-indigo-300">
              {getWeatherDescription(current.weather_code)}
            </Text>
            <Text variant="muted" className="text-xs">
              Feels like {toDisplayTemp(current.apparent_temperature)}
            </Text>
          </View>

          <View className="items-center gap-2">
            <WeatherIcon code={current.weather_code} size={44} className="text-amber-500" />
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1">
                <Wind size={13} className="text-slate-400" />
                <Text variant="muted" className="text-xs">
                  {current.wind_speed_10m} km/h
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Droplets size={13} className="text-slate-400" />
                <Text variant="muted" className="text-xs">
                  {current.relative_humidity_2m}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {/* 5-Day Forecast Strip */}
      {daily ? (
        <View className="gap-2">
          <Text variant="label">5-Day Outlook</Text>
          <View className="flex-row justify-between gap-1">
            {daily.time.slice(1, 6).map((dateStr, idx) => {
              const code = daily.weather_code[idx + 1] ?? 0;
              const max = daily.temperature_2m_max[idx + 1] ?? 0;
              const min = daily.temperature_2m_min[idx + 1] ?? 0;
              const date = new Date(dateStr);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <View
                  key={dateStr}
                  className="flex-1 items-center rounded-xl bg-slate-100 p-2 dark:bg-slate-800/40"
                >
                  <Text variant="muted" className="text-xs">
                    {dayName}
                  </Text>
                  <View className="my-1.5">
                    <WeatherIcon code={code} size={18} className="text-slate-700 dark:text-slate-200" />
                  </View>
                  <Text className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {toDisplayTemp(max)}
                  </Text>
                  <Text variant="muted" className="text-[10px]">
                    {toDisplayTemp(min)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Refresh Footer */}
      <View className="flex-row items-center justify-between pt-1">
        <Text variant="muted" className="text-xs">
          Auto-cached with TanStack Query
        </Text>
        <Button
          label="Refresh"
          variant="ghost"
          loading={weatherQuery.isRefetching}
          onPress={() => void weatherQuery.refetch()}
          className="min-h-9 px-3"
        />
      </View>
    </Card>
  );
}
