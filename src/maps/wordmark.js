import { TERRAIN, hash, valueNoise } from './shared';

const TEXT = 'YEF';

const load = async () => {
  try {
    await document.fonts.load('500 100px Inter');
  } catch {
    /* fall back to system font */
  }
};

const build = (_, w, h) => {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const left = w * 0.06;
  let size = h * 1.26;
  ctx.font = `500 ${size}px Inter, sans-serif`;
  const width = ctx.measureText(TEXT).width;
  if (width > w - left * 2) {
    size *= (w - left * 2) / width;
    ctx.font = `500 ${size}px Inter, sans-serif`;
  }
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(TEXT, left - size * 0.04, h * 0.97);
  const { data } = ctx.getImageData(0, 0, w, h);

  const step = w < 500 ? 6 : 7;
  const dots = [];
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      if (data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] < 128) continue;
      const t = valueNoise(x / 110 + 5.1, y / 110 + 1.3) * 0.8 + 0.2;
      const level = Math.round(t * (TERRAIN.length - 1) + (hash(x, y) - 0.5) * 0.9);
      dots.push({ x, y, base: TERRAIN[Math.min(TERRAIN.length - 1, Math.max(0, level))], size: 1.5 });
    }
  }
  return dots;
};

export const wordmark = { load, build };
