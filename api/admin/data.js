import {
  AMBASSADORS_KEY,
  APPS_KEY,
  SPONSORS_KEY,
  STATS_PREFIX,
  dayKey,
  pipeline,
  DRAFTS_KEY,
  REMINDED_KEY,
  WAITLIST_KEY,
  applyToken,
  hashValues,
  isAdmin,
  onlyMethod,
  redis,
  send,
  siteOrigin
} from '../_lib.js';

const DAYS = 30;

const pairs = list => {
  const out = {};
  for (let i = 0; i < (list?.length ?? 0); i += 2) out[list[i]] = Number(list[i + 1]);
  return out;
};

const merge = (target, source) => {
  for (const [k, v] of Object.entries(source)) target[k] = (target[k] || 0) + v;
  return target;
};

const loadStats = async () => {
  const dates = Array.from({ length: DAYS }, (_, i) => dayKey(new Date(Date.now() - i * 86400000))).reverse();
  const keys = dates.map(d => `${STATS_PREFIX}${d}`);
  const perDay = ['pv', 'uv', 'ref', 'country', 'device', 'sessions'];
  const commands = keys.flatMap(k => [
    ['HGETALL', `${k}:pv`],
    ['PFCOUNT', `${k}:uv`],
    ['HGETALL', `${k}:ref`],
    ['HGETALL', `${k}:country`],
    ['HGETALL', `${k}:device`],
    ['GET', `${k}:sessions`]
  ]);
  commands.push(
    ['PFCOUNT', ...keys.slice(-7).map(k => `${k}:uv`)],
    ['PFCOUNT', ...keys.map(k => `${k}:uv`)],
    ['PFCOUNT', `${STATS_PREFIX}uv:all`],
    ['GET', `${STATS_PREFIX}pv:all`]
  );
  const results = await pipeline(commands);
  const pages = {};
  const referrers = {};
  const countries = {};
  const devices = {};
  const days = dates.map((date, i) => {
    const [pv, uv, ref, country, device, sessions] = results.slice(i * perDay.length, (i + 1) * perDay.length);
    const views = pairs(pv);
    merge(pages, views);
    merge(referrers, pairs(ref));
    merge(countries, pairs(country));
    merge(devices, pairs(device));
    return { date, views: Object.values(views).reduce((a, b) => a + b, 0), visitors: Number(uv) || 0, sessions: Number(sessions) || 0 };
  });
  const [visitors7, visitors30, visitorsAll, viewsAll] = results.slice(-4).map(v => Number(v) || 0);
  return { days, visitors7, visitors30, visitorsAll, viewsAll, pages, referrers, countries, devices };
};

export default async function handler(req, res) {
  if (!onlyMethod(req, res, 'GET')) return;
  if (!isAdmin(req)) return send(res, 401, { error: 'Unauthorized' });

  try {
    const [apps, waitlist, drafts, reminded, ambassadors, sponsors, stats] = await Promise.all([
      redis('HGETALL', APPS_KEY),
      redis('HGETALL', WAITLIST_KEY),
      redis('HGETALL', DRAFTS_KEY),
      redis('HKEYS', REMINDED_KEY),
      redis('HGETALL', AMBASSADORS_KEY),
      redis('HGETALL', SPONSORS_KEY),
      loadStats().catch(() => null)
    ]);
    const origin = siteOrigin(req);
    const editUrl = email => `${origin}/?apply=${applyToken(email)}`;
    const draftOf = new Map(hashValues(drafts).map(d => [d.email, d]));
    send(res, 200, {
      applications: hashValues(apps).map(a => ({ ...a, interest: a.interest || 'Both', editUrl: editUrl(a.email) })),
      waitlist: hashValues(waitlist).map(w => ({
        ...w,
        interest: draftOf.get(w.email)?.answers?.interest || 'Both',
        editUrl: editUrl(w.email),
        answered: Object.keys(draftOf.get(w.email)?.answers || {}).length,
        answers: draftOf.get(w.email)?.answers || {},
        draftUpdatedAt: draftOf.get(w.email)?.updatedAt || null,
        reminded: reminded.includes(w.email)
      })),
      ambassadors: hashValues(ambassadors),
      sponsors: hashValues(sponsors),
      stats
    });
  } catch {
    send(res, 500, { error: 'Could not load' });
  }
}
