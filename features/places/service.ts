export type PlaceMatch = {
  name: string;
  latitude: number;
  longitude: number;
};

export async function searchPlace(query: string): Promise<PlaceMatch | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&accept-language=en&q=${encodeURIComponent(query)}&limit=1`,
    { headers: { Accept: 'application/json', 'User-Agent': 'ExpoUniversalStarter/1.0' } },
  );
  if (!res.ok) throw new Error('Search failed');
  const data = (await res.json()) as { display_name: string; lat: string; lon: string }[];
  const match = data[0];
  if (!match) return null;
  return {
    name: match.display_name.split(',')[0] ?? query,
    latitude: Number(match.lat),
    longitude: Number(match.lon),
  };
}
