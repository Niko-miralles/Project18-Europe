import { useEffect, useRef } from 'react';
import { CITY, valueNoise } from '../maps/shared';

const ENTER_MS = 900;
const EXIT_MS = 460;

const CITY_FLASH = 0xff - CITY;

const PUSH_MAX = 1.5;
const PUSH_SIGMA = 30;
const SPRING = 0.11;
const DAMPING = 0.8;

const WAVE_SPEED = 0.32;
const WAVE_LIFE = 550;
const WAVE_BAND = 5;
const WAVE_GAIN = 7;
const WAVE_JITTER = 34;
const WAVE_EVERY = 140;
const MAX_WAVES = 2;
const CELL = 48;
const PAD = 8;
const HALO = 5;

const GRAYS = Array.from({ length: 256 }, (_, v) => `rgb(${v}, ${v}, ${v})`);

const prepare = (grid, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dots = grid.map(dot => {
    const angle = Math.atan2(dot.y - cy, dot.x - cx) + (Math.random() - 0.5) * 1.6;
    const dist = 60 + Math.random() * 220;
    return {
      ...dot,
      sx: Math.cos(angle) * dist,
      sy: Math.sin(angle) * dist,
      reach: 0.55 + Math.random() * 0.9,
      jit: (valueNoise(dot.x / 46 + 11.3, dot.y / 46 + 4.9) - 0.5) * WAVE_JITTER,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      sig: 0,
      flash: 0
    };
  });
  const cells = new Map();
  for (const dot of dots) {
    const k = Math.floor(dot.y / CELL) * 4096 + Math.floor(dot.x / CELL);
    if (!cells.has(k)) cells.set(k, []);
    cells.get(k).push(dot);
  }
  return { dots, cells };
};

const forCells = (cells, [x0, y0, x1, y1], fn) => {
  for (let cy = Math.floor(y0 / CELL); cy <= Math.floor(y1 / CELL); cy++) {
    for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++) {
      const list = cells.get(cy * 4096 + cx);
      if (list) list.forEach(fn);
    }
  }
};

const drawDots = (ctx, dots, spread) => {
  const buckets = new Map();
  for (const { x, y, base, size, sx, sy, ox, oy, sig, flash } of dots) {
    const s = size + flash * 0.5;
    const g = Math.min(255, Math.round(base + sig + flash * CITY_FLASH * 0.5));
    let list = buckets.get(g);
    if (!list) buckets.set(g, (list = []));
    list.push(x + sx * spread + ox - s / 2, y + sy * spread + oy - s / 2, s);
  }
  for (const [g, list] of buckets) {
    ctx.fillStyle = GRAYS[g];
    ctx.beginPath();
    for (let i = 0; i < list.length; i += 3) ctx.rect(list[i], list[i + 1], list[i + 2], list[i + 2]);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.beginPath();
  for (const { x, y, sx, sy, ox, oy, city, flash } of dots) {
    if (!city) continue;
    const cx = x + sx * spread + ox;
    const cy = y + sy * spread + oy;
    const r = HALO + flash * 3;
    ctx.moveTo(cx + r, cy);
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  ctx.fill();
};

const easeOut = t => 1 - (1 - t) ** 3;
const easeIn = t => t ** 2;

const DotMap = ({ className = '', leaving = false, map, enter = 'scatter', interactive = true }) => {
  const canvasRef = useRef(null);
  const state = useRef({
    dots: null,
    cells: null,
    progress: 0,
    raf: 0,
    hoverRaf: 0,
    pointer: null,
    waves: [],
    lastWave: null,
    live: new Set(),
    prevDirty: null
  });

  const paint = () => {
    const canvas = canvasRef.current;
    const { dots, progress, w, h, dpr } = state.current;
    if (!canvas || !dots) return;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = progress;
    drawDots(ctx, dots, enter === 'fade' ? 0 : 1 - progress);
    ctx.globalAlpha = 1;
  };

  const animateTo = (target, duration, ease) => {
    const s = state.current;
    cancelAnimationFrame(s.raf);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      s.progress = target;
      paint();
      return;
    }
    const from = s.progress;
    const start = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      s.progress = from + (target - from) * ease(t);
      paint();
      if (t < 1) s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
  };

  const repaintRegion = ([bx0, by0, bx1, by1]) => {
    const canvas = canvasRef.current;
    const { cells, dpr, w, h } = state.current;
    const x0 = Math.max(0, Math.floor(bx0 * dpr));
    const y0 = Math.max(0, Math.floor(by0 * dpr));
    const x1 = Math.min(w * dpr, Math.ceil(bx1 * dpr));
    const y1 = Math.min(h * dpr, Math.ceil(by1 * dpr));
    if (x1 <= x0 || y1 <= y0) return;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(x0, y0, x1 - x0, y1 - y0);
    ctx.beginPath();
    ctx.rect(x0, y0, x1 - x0, y1 - y0);
    ctx.clip();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const list = [];
    forCells(cells, [x0 / dpr - PAD, y0 / dpr - PAD, x1 / dpr + PAD, y1 / dpr + PAD], dot => list.push(dot));
    drawDots(ctx, list, 0);
    ctx.restore();
  };

  const hoverTick = now => {
    const s = state.current;
    if (!s.dots) return;
    const p = s.pointer;
    const sigma2 = 2 * PUSH_SIGMA * PUSH_SIGMA;
    const reach = PUSH_SIGMA * 3;
    s.waves = s.waves.filter(w => now - w.t0 < WAVE_LIFE);
    const waves = s.waves.map(w => {
      const age = (now - w.t0) / WAVE_LIFE;
      return { x: w.x, y: w.y, r: (now - w.t0) * WAVE_SPEED, amp: (1 - age) ** 2 };
    });

    const candidates = new Set(s.live);
    const add = dot => candidates.add(dot);
    if (p) forCells(s.cells, [p.x - reach, p.y - reach, p.x + reach, p.y + reach], add);
    for (const w of waves) {
      const e = w.r + WAVE_BAND + WAVE_JITTER / 2;
      forCells(s.cells, [w.x - e, w.y - e, w.x + e, w.y + e], add);
    }

    let box = s.prevDirty ? [...s.prevDirty] : null;
    for (const dot of candidates) {
      let tx = 0;
      let ty = 0;
      if (p) {
        const dx = dot.x - p.x;
        const dy = dot.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < reach * reach && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = PUSH_MAX * Math.exp(-d2 / sigma2) * (0.75 + dot.reach * 0.25);
          tx = (dx / d) * push;
          ty = (dy / d) * push;
        }
      }
      dot.vx = (dot.vx + (tx - dot.ox) * SPRING) * DAMPING;
      dot.vy = (dot.vy + (ty - dot.oy) * SPRING) * DAMPING;
      dot.ox += dot.vx;
      dot.oy += dot.vy;

      let sig = 0;
      for (const w of waves) {
        const dx = dot.x - w.x;
        const dy = dot.y - w.y;
        const off = Math.abs(Math.sqrt(dx * dx + dy * dy) + dot.jit - w.r);
        if (off < WAVE_BAND) {
          const hit = w.amp * (1 - off / WAVE_BAND);
          if (dot.city) dot.flash = Math.max(dot.flash, hit);
          else sig = Math.max(sig, hit * WAVE_GAIN * dot.reach);
        }
      }
      dot.sig = sig;
      if (dot.flash > 0) dot.flash = dot.flash < 0.01 ? 0 : dot.flash * 0.93;

      const moving = Math.abs(dot.ox) + Math.abs(dot.oy) + Math.abs(dot.vx) + Math.abs(dot.vy) >= 0.01 || tx || ty;
      if (!moving) dot.ox = dot.oy = dot.vx = dot.vy = 0;
      if (moving || dot.sig || dot.flash) {
        s.live.add(dot);
        if (!box) box = [dot.x, dot.y, dot.x, dot.y];
        box[0] = Math.min(box[0], dot.x - PAD);
        box[1] = Math.min(box[1], dot.y - PAD);
        box[2] = Math.max(box[2], dot.x + PAD);
        box[3] = Math.max(box[3], dot.y + PAD);
      } else {
        s.live.delete(dot);
      }
    }

    if (box) repaintRegion(box);
    let next = null;
    for (const dot of s.live) {
      if (!next) next = [dot.x - PAD, dot.y - PAD, dot.x + PAD, dot.y + PAD];
      next[0] = Math.min(next[0], dot.x - PAD);
      next[1] = Math.min(next[1], dot.y - PAD);
      next[2] = Math.max(next[2], dot.x + PAD);
      next[3] = Math.max(next[3], dot.y + PAD);
    }
    s.prevDirty = next;
    s.hoverRaf = p || waves.length || s.live.size ? requestAnimationFrame(hoverTick) : 0;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const s = state.current;
    let data = null;
    let ready = false;
    let cancelled = false;

    const setup = () => {
      if (!ready) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth);
      const h = Math.round(canvas.clientHeight);
      if (!w || !h) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const first = !s.dots;
      cancelAnimationFrame(s.hoverRaf);
      Object.assign(s, { ...prepare(map.build(data, w, h), w, h), w, h, dpr, hoverRaf: 0, live: new Set(), prevDirty: null, waves: [] });
      if (first) animateTo(1, ENTER_MS, easeOut);
      else paint();
    };

    map.load().then(d => {
      if (cancelled) return;
      data = d;
      ready = true;
      setup();
    });

    const observer = new ResizeObserver(setup);
    observer.observe(canvas);

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wake = () => {
      if (!s.hoverRaf && s.dots) s.hoverRaf = requestAnimationFrame(hoverTick);
    };
    const onMove = e => {
      if (s.progress < 1) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        if (s.pointer) {
          s.pointer = null;
          s.lastWave = null;
          wake();
        }
        return;
      }
      s.pointer = { x, y };
      const last = s.lastWave;
      if (!last || Math.hypot(x - last.x, y - last.y) > WAVE_EVERY) {
        s.lastWave = { x, y };
        if (last) {
          s.waves.push({ x, y, t0: performance.now() });
          if (s.waves.length > MAX_WAVES) s.waves.shift();
        }
      }
      wake();
    };
    const onLeave = () => {
      s.pointer = null;
      s.lastWave = null;
      wake();
    };
    if (interactive && finePointer && !reduced) {
      window.addEventListener('pointermove', onMove);
      document.documentElement.addEventListener('pointerleave', onLeave);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(s.raf);
      cancelAnimationFrame(s.hoverRaf);
      observer.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (leaving) {
      cancelAnimationFrame(state.current.hoverRaf);
      Object.assign(state.current, { pointer: null, waves: [], hoverRaf: 0 });
      animateTo(0, EXIT_MS, easeIn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default DotMap;
