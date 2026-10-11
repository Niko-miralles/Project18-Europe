import { CITY, CITY_DOT, DOT, TERRAIN, hash, valueNoise } from './shared';

const SPIRES = [
  [0.5, 0, 0.07],
  [0.37, 0.1, 0.05],
  [0.63, 0.1, 0.05],
  [0.56, 0.16, 0.045],
  [0.08, 0.37, 0.035],
  [0.15, 0.31, 0.038],
  [0.22, 0.31, 0.038],
  [0.29, 0.37, 0.035],
  [0.71, 0.37, 0.035],
  [0.78, 0.31, 0.038],
  [0.85, 0.31, 0.038],
  [0.92, 0.37, 0.035]
];

const NEAR = '#f00';
const FAR = '#0f0';
const OPENING = '#f0f';

const spire = (ctx, cx, top, base, hw) => {
  const half = k => hw * (1 - k) ** 0.85 * (1 + 0.18 * Math.sin(k * Math.PI));
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) ctx.lineTo(cx - half(i / 24), base - (base - top) * (i / 24));
  for (let i = 24; i >= 0; i--) ctx.lineTo(cx + half(i / 24), base - (base - top) * (i / 24));
  ctx.closePath();
  ctx.fill();
};

const drawScene = (w, h, step) => {
  const hz = Math.round(h * 0.82);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const tips = [];

  ctx.fillStyle = FAR;
  ctx.beginPath();
  ctx.moveTo(0, hz);
  ctx.lineTo(0, hz - h * 0.07);
  ctx.bezierCurveTo(w * 0.08, hz - h * 0.12, w * 0.14, hz - h * 0.17, w * 0.22, hz - h * 0.17);
  ctx.bezierCurveTo(w * 0.32, hz - h * 0.17, w * 0.4, hz - h * 0.1, w * 0.55, hz - h * 0.08);
  ctx.bezierCurveTo(w * 0.75, hz - h * 0.06, w * 0.9, hz - h * 0.1, w, hz - h * 0.08);
  ctx.lineTo(w, hz);
  ctx.closePath();
  ctx.fill();

  const mx = w * 0.22;
  const my = hz - h * 0.17;
  ctx.fillRect(mx - step / 2, my - h * 0.09, step, h * 0.09);
  ctx.beginPath();
  ctx.ellipse(mx, my - h * 0.055, step * 1.6, step * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  tips.push([mx, my - h * 0.09]);

  for (let i = 0; i < 46; i++) {
    const bw = (0.015 + hash(i, 2) * 0.035) * w;
    const bh = (0.02 + hash(i, 3) * 0.055) * h;
    ctx.fillRect(hash(i, 1) * w, hz - bh, bw, bh);
  }

  ctx.fillStyle = NEAR;
  const boxW = Math.min(w * 0.4, h * 0.5);
  const top = h * 0.05;
  const boxH = hz - top;
  const bx = w * 0.6 - boxW / 2;
  const base = hz - boxH * 0.14;
  for (const [sx, st, shw] of SPIRES) {
    const cx = bx + sx * boxW;
    const t = top + st * boxH;
    spire(ctx, cx, t, base, Math.max(shw * boxW, step * 1.1));
    tips.push([cx, t]);
  }
  ctx.beginPath();
  ctx.moveTo(bx + boxW * 0.03, hz);
  ctx.lineTo(bx + boxW * 0.03, hz - boxH * 0.2);
  ctx.lineTo(bx + boxW * 0.5, hz - boxH * 0.34);
  ctx.lineTo(bx + boxW * 0.97, hz - boxH * 0.2);
  ctx.lineTo(bx + boxW * 0.97, hz);
  ctx.closePath();
  ctx.fill();

  const tw = Math.max(step * 2, w * 0.028);
  for (const [tx, th] of [
    [0.27, 0.21],
    [0.32, 0.19]
  ]) {
    ctx.fillRect(w * tx - tw / 2, hz - h * th, tw, h * th);
    tips.push([w * tx, hz - h * th]);
  }

  const gw = Math.max(step * 3, w * 0.05);
  const gx = w * 0.91;
  const gTop = hz - h * 0.22;
  ctx.beginPath();
  ctx.moveTo(gx - gw / 2, hz);
  ctx.lineTo(gx - gw / 2, gTop + gw / 2);
  ctx.arc(gx, gTop + gw / 2, gw / 2, Math.PI, 0);
  ctx.lineTo(gx + gw / 2, hz);
  ctx.closePath();
  ctx.fill();
  tips.push([gx, gTop]);

  for (let i = 0; i < 34; i++) {
    const bw = (0.012 + hash(i, 5) * 0.03) * w;
    const bh = (0.012 + hash(i, 6) * 0.045) * h;
    ctx.fillRect(hash(i, 4) * w, hz - bh, bw, bh);
  }

  ctx.fillStyle = OPENING;
  for (const [sx, st, shw] of SPIRES) {
    const cx = bx + sx * boxW;
    const span = base - (top + st * boxH);
    const sw = Math.max(step, shw * boxW * 0.3);
    for (let k = 0.15; k < 0.6; k += 0.11) ctx.fillRect(cx - sw / 2, base - span * k, sw, step * 1.5);
  }

  return { data: ctx.getImageData(0, 0, w, h).data, tips, hz };
};

const build = (_, w, h) => {
  const step = w < 500 ? 6 : 7;
  const { data, tips, hz } = drawScene(w, h, step);

  const kind = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= hz) return 0;
    const i = ((y | 0) * w + (x | 0)) * 4;
    if (data[i] > 127) return data[i + 2] > 127 ? 3 : 2;
    return data[i + 1] > 127 ? 1 : 0;
  };

  const dots = [];
  for (let y = step / 2; y < hz; y += step) {
    for (let x = step / 2; x < w; x += step) {
      const k = kind(x, y);
      if (!k) continue;
      const n = valueNoise(x / 90 + 3.7, y / 90 + 1.9);
      const t = k === 3 ? 0 : k === 2 ? 0.35 + n * 0.65 : n * 0.4;
      const level = Math.round(t * (TERRAIN.length - 1) + (hash(x, y) - 0.5) * 0.9);
      dots.push({ x, y, base: TERRAIN[Math.min(TERRAIN.length - 1, Math.max(0, level))], size: DOT });
    }
  }

  for (const [tx, ty] of tips) {
    let best = null;
    for (const dot of dots) {
      const d = (dot.x - tx) ** 2 + (dot.y - ty) ** 2;
      if (!best || d < best.d) best = { dot, d };
    }
    if (best) Object.assign(best.dot, { base: CITY, size: CITY_DOT, city: true });
  }
  return dots;
};

export const skyline = { load: async () => null, build };
