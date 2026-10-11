import { dotGrid, markCities, terrainShade, valueNoise } from './shared';

const BOUNDS = { west: -25, east: 42, south: 35, north: 71.5 };
const COS_LAT = Math.cos((52 * Math.PI) / 180);

const CITIES = [
  [2.17, 41.39],
  [-3.7, 40.42],
  [-9.14, 38.72],
  [2.35, 48.86],
  [-0.13, 51.5],
  [4.9, 52.37],
  [13.4, 52.52],
  [9.19, 45.46],
  [21.01, 52.23],
  [18.07, 59.33],
  [12.5, 41.9]
];

const terrain = (lon, lat) => {
  const x = lon * COS_LAT;
  const n = valueNoise(x / 7 + 3.1, lat / 7 + 1.7) * 0.6 + valueNoise(x / 3 + 8.3, lat / 3 + 5.2) * 0.3 + valueNoise(x / 1.4, lat / 1.4) * 0.1;
  const east = Math.min(1, Math.max(0, (lon - 28) / 16));
  return Math.min(1, Math.max(0, (n - 0.2) / 0.62 - east * 0.45));
};

const loadLand = async () => {
  const [{ feature }, { default: land }] = await Promise.all([
    import('topojson-client'),
    import('world-atlas/land-50m.json')
  ]);
  return feature(land, land.objects.land).features;
};

const makeProjection = (w, h) => {
  const spanX = (BOUNDS.east - BOUNDS.west) * COS_LAT;
  const spanY = BOUNDS.north - BOUNDS.south;
  const scale = Math.min((h * 0.98) / spanY, (w * 1.3) / spanX);
  const ox = w * 0.01;
  const oy = (h - spanY * scale) / 2;
  return {
    project: (lon, lat) => [ox + (lon - BOUNDS.west) * COS_LAT * scale, oy + (BOUNDS.north - lat) * scale],
    unproject: (x, y) => [(x - ox) / (COS_LAT * scale) + BOUNDS.west, BOUNDS.north - (y - oy) / scale]
  };
};

const landMask = (features, project, w, h) => {
  const mask = document.createElement('canvas');
  mask.width = w;
  mask.height = h;
  const ctx = mask.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  for (const f of features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) {
      const lons = poly[0].map(([lon]) => lon);
      if (Math.min(...lons) < -40 && Math.max(...lons) < -10) continue;
      ctx.beginPath();
      for (const ring of poly) {
        const wraps = ring.some(([lon]) => lon > 150) && ring.some(([lon]) => lon < -150);
        ring.forEach(([lon, lat], i) => {
          const [x, y] = project(wraps && lon < -150 ? lon + 360 : lon, lat);
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        });
        ctx.closePath();
      }
      ctx.fill('evenodd');
    }
  }
  const { data } = ctx.getImageData(0, 0, w, h);
  return (x, y) => x >= 0 && y >= 0 && x < w && y < h && data[(Math.floor(y) * w + Math.floor(x)) * 4] > 127;
};

const build = (features, w, h) => {
  const { project, unproject } = makeProjection(w, h);
  const isLand = landMask(features, project, w, h);
  const field = dotGrid(w, h, (x, y, c, r) => {
    if (!isLand(x, y)) return 0;
    const [lon, lat] = unproject(x, y);
    return terrainShade(terrain(lon, lat), c, r);
  });
  return markCities(field, CITIES.map(([lon, lat]) => project(lon, lat)));
};

export const europe = { load: loadLand, build };
