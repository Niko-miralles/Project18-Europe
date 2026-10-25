import { STATS_PREFIX, dayKey, onlyMethod, pipeline, rateLimited, sameOrigin, send, text } from './_lib.js';

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor/i;
const TTL = 400 * 24 * 60 * 60;

const refHost = (ref, host) => {
  try {
    const h = new URL(ref).host.replace(/^www\./, '');
    return h && h !== host ? h : 'Direct';
  } catch {
    return 'Direct';
  }
};

export default async function handler(req, res) {
  if (!onlyMethod(req, res, 'POST')) return;
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });
  const ua = String(req.headers['user-agent'] || '');
  if (BOT.test(ua)) return send(res, 204, {});

  const body = req.body ?? {};
  const path = text(body.path, 120).split('?')[0] || '/';
  const vid = text(body.vid, 64);
  if (!/^[\w-]{8,64}$/.test(vid) || path.startsWith('/admin')) return send(res, 204, {});

  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').replace(/^www\./, '');
  const day = `${STATS_PREFIX}${dayKey()}`;
  const country = String(req.headers['x-vercel-ip-country'] || 'Unknown').slice(0, 8);
  const device = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
  const ref = body.landing ? refHost(text(body.referrer, 500), host) : null;

  try {
    if (await rateLimited(req, 'track', 600, 3600)) return send(res, 204, {});
    const commands = [
      ['HINCRBY', `${day}:pv`, path, 1],
      ['PFADD', `${day}:uv`, vid],
      ['PFADD', `${STATS_PREFIX}uv:all`, vid],
      ['INCR', `${STATS_PREFIX}pv:all`]
    ];
    if (body.landing) {
      commands.push(
        ['HINCRBY', `${day}:ref`, ref, 1],
        ['HINCRBY', `${day}:country`, country, 1],
        ['HINCRBY', `${day}:device`, device, 1],
        ['INCR', `${day}:sessions`]
      );
    }
    for (const suffix of ['pv', 'uv', 'ref', 'country', 'device', 'sessions']) commands.push(['EXPIRE', `${day}:${suffix}`, TTL]);
    await pipeline(commands);
    send(res, 204, {});
  } catch {
    send(res, 204, {});
  }
}
