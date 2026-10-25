import { CITY, TERRAIN, dotGrid, hash } from './shared';
import { AMBASSADOR_COUNTRIES, COUNTRIES } from '../data/countries';

const BOUNDS = { west: -11, east: 41, south: 34.5, north: 71.5 };
const COS_LAT = Math.cos((52 * Math.PI) / 180);

const ACTIVE = new Set(COUNTRIES.filter(c => AMBASSADOR_COUNTRIES.includes(c.name)).map(c => c.mapName));
const EUROPE = new Set(COUNTRIES.map(c => c.mapName));

const load = async () => {
  const [{ feature }, { default: world }] = await Promise.all([
    import('topojson-client'),
    import('world-atlas/countries-50m.json')
  ]);
  return feature(world, world.objects.countries).features;
};

const build = (features, w, h) => {
  const spanX = (BOUNDS.east - BOUNDS.west) * COS_LAT;
  const spanY = BOUNDS.north - BOUNDS.south;
  const scale = Math.min((h * 0.96) / spanY, (w * 0.96) / spanX);
  const ox = (w - spanX * scale) / 2;
  const oy = (h - spanY * scale) / 2;
  const project = (lon, lat) => [ox + (lon - BOUNDS.west) * COS_LAT * scale, oy + (BOUNDS.north - lat) * scale];

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const names = [];
  for (const f of features) {
    if (!f.geometry || !EUROPE.has(f.properties.name)) continue;
    names.push(f.properties.name);
    ctx.fillStyle = `rgb(${names.length}, 0, 0)`;
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) {
      const lons = poly[0].map(([lon]) => lon);
      if (Math.max(...lons) < -30 || Math.min(...lons) > 60 || Math.max(...lons) - Math.min(...lons) > 180) continue;
      ctx.beginPath();
      for (const ring of poly) {
        ring.forEach(([lon, lat], i) => {
          const [x, y] = project(lon, lat);
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        });
        ctx.closePath();
      }
      ctx.fill('evenodd');
    }
  }
  const { data } = ctx.getImageData(0, 0, w, h);
  const nameAt = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return null;
    const i = (Math.floor(y) * w + Math.floor(x)) * 4;
    return data[i + 3] > 200 ? names[data[i] - 1] ?? null : null;
  };
  hitTest = { w, h, nameAt };

  const grid = dotGrid(w, h, (x, y, c, r) => {
    const name = nameAt(x, y);
    if (!name) return 0;
    if (ACTIVE.has(name)) return 0xd8 + Math.floor(hash(c, r) * 0x27);
    return TERRAIN[3 + Math.floor(hash(c, r) * 3)];
  });
  return [...grid.grid.values()].map(dot => (dot.base >= 0xd8 ? { ...dot, base: Math.min(CITY, dot.base), size: 2.2 } : dot));
};

let hitTest = null;

const NEAR = [[0, 0], [4, 0], [-4, 0], [0, 4], [0, -4], [7, 7], [-7, -7], [7, -7], [-7, 7]];

export const countryAt = (x, y) => {
  if (!hitTest) return null;
  for (const [dx, dy] of NEAR) {
    const name = hitTest.nameAt(x + dx, y + dy);
    if (name) return COUNTRIES.find(c => c.mapName === name) ?? null;
  }
  return null;
};

export const ambassadorsMap = { load, build };
