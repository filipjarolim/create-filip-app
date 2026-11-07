const TILE = 256;

export function worldPoint(latitude: number, longitude: number, zoom: number) {
  const scale = TILE * 2 ** zoom;
  const sine = Math.min(Math.max(Math.sin((latitude * Math.PI) / 180), -0.9999), 0.9999);
  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * scale,
  };
}

export function pointToLatLon(x: number, y: number, zoom: number) {
  const scale = TILE * 2 ** zoom;
  const longitude = (x / scale) * 360 - 180;
  const mercator = Math.PI - (2 * Math.PI * y) / scale;
  const latitude = (180 / Math.PI) * Math.atan(Math.sinh(mercator));
  return {
    latitude: Math.min(85, Math.max(-85, latitude)),
    longitude,
  };
}

export type MapTile = {
  key: string;
  uri: string;
  left: number;
  top: number;
};

export function visibleTiles(latitude: number, longitude: number, zoom: number, width: number, height: number): MapTile[] {
  const z = Math.round(zoom);
  const center = worldPoint(latitude, longitude, z);
  const left = center.x - width / 2;
  const top = center.y - height / 2;
  const count = 2 ** z;
  const tiles: MapTile[] = [];
  const xStart = Math.floor(left / TILE) - 1;
  const xEnd = Math.floor((left + width) / TILE) + 1;
  const yStart = Math.floor(top / TILE) - 1;
  const yEnd = Math.floor((top + height) / TILE) + 1;

  for (let x = xStart; x <= xEnd; x += 1) {
    for (let y = yStart; y <= yEnd; y += 1) {
      if (y < 0 || y >= count) continue;
      const wrapped = ((x % count) + count) % count;
      tiles.push({
        key: `${z}/${x}/${y}`,
        uri: `https://tile.openstreetmap.org/${z}/${wrapped}/${y}.png`,
        left: x * TILE - left,
        top: y * TILE - top,
      });
    }
  }
  return tiles;
}
