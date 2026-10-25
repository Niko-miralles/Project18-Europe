export const TERRAIN = [0x30, 0x3e, 0x4c, 0x5c, 0x6e, 0x82];
export const CITY = 0xff;
export const DOT = 1.7;
export const CITY_DOT = 2.6;

export const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const valueNoise = (x, y) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

export const terrainShade = (t, c, r) => {
  const level = Math.round(t * (TERRAIN.length - 1) + (hash(c, r) - 0.5) * 0.9);
  return TERRAIN[Math.min(TERRAIN.length - 1, Math.max(0, level))];
};

export const dotGrid = (w, h, sample) => {
  const step = w < 500 ? 6 : 7;
  const cols = Math.ceil(w / step);
  const toPx = v => v * step + step / 2;
  const grid = new Map();
  for (let r = 0; toPx(r) < h; r++) {
    for (let c = 0; c < cols; c++) {
      const x = toPx(c);
      const y = toPx(r);
      const base = sample(x, y, c, r);
      if (base) grid.set(r * cols + c, { x, y, base, size: DOT });
    }
  }
  return { grid, step, cols };
};

export const markCities = ({ grid, step, cols }, points) => {
  for (const [px, py] of points) {
    const c0 = Math.round((px - step / 2) / step);
    const r0 = Math.round((py - step / 2) / step);
    let best = null;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const dot = grid.get((r0 + dr) * cols + c0 + dc);
        const d = dc * dc + dr * dr;
        if (dot && (!best || d < best.d)) best = { dot, d };
      }
    }
    if (best) Object.assign(best.dot, { base: CITY, size: CITY_DOT, city: true });
  }
  return [...grid.values()];
};
