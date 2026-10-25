import { TERRAIN, dotGrid, hash, markCities } from './shared';

const PEOPLE = [
  { x: 0.12, scale: 0.13, shade: 0.55 },
  { x: 0.31, scale: 0.16, shade: 0.8 },
  { x: 0.5, scale: 0.19, shade: 1 },
  { x: 0.69, scale: 0.16, shade: 0.8 },
  { x: 0.88, scale: 0.13, shade: 0.55 }
];

const BASE = 0.86;

const person = (ctx, x, y, s) => {
  ctx.beginPath();
  ctx.arc(x, y - s * 1.6, s * 0.52, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.82, y);
  ctx.bezierCurveTo(x - s * 0.82, y - s * 0.72, x - s * 0.52, y - s * 0.92, x, y - s * 0.92);
  ctx.bezierCurveTo(x + s * 0.52, y - s * 0.92, x + s * 0.82, y - s * 0.72, x + s * 0.82, y);
  ctx.closePath();
  ctx.fill();
};

const segDist = (px, py, [ax, ay], [bx, by]) => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};

const build = (_, w, h) => {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const size = Math.min(w, h * 1.3);
  const ox = (w - size) / 2;
  const y = h * BASE;

  const heads = PEOPLE.map(({ x, scale, shade }) => {
    const px = ox + x * size;
    const s = size * scale * 0.62;
    ctx.fillStyle = `rgba(255, 255, 255, ${shade})`;
    person(ctx, px, y, s);
    return [px, y - s * 1.6, s];
  });

  const links = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 2], [2, 4], [1, 3]].map(([a, b]) => [heads[a], heads[b]]);
  const arcs = links.map(([[ax, ay, as], [bx, by, bs]]) => [
    [ax, ay - as * 0.9],
    [(ax + bx) / 2, Math.min(ay, by) - Math.abs(bx - ax) * 0.38],
    [bx, by - bs * 0.9]
  ]);

  const { data } = ctx.getImageData(0, 0, w, h);
  const grid = dotGrid(w, h, (x, py, c, r) => {
    const a = data[(Math.floor(py) * w + Math.floor(x)) * 4 + 3] / 255;
    if (a > 0.2) {
      const level = Math.round(a * (TERRAIN.length - 1) + (hash(c, r) - 0.5) * 1.1);
      return TERRAIN[Math.min(TERRAIN.length - 1, Math.max(0, level))];
    }
    for (const [p0, p1, p2] of arcs) {
      if (segDist(x, py, p0, p1) < 2.6 || segDist(x, py, p1, p2) < 2.6) return TERRAIN[1 + Math.floor(hash(c, r) * 2)];
    }
    return 0;
  });
  return markCities(grid, heads.map(([hx, hy, s]) => [hx, hy - s * 0.9]));
};

export const network = { load: async () => null, build };
