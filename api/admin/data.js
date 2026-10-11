import {
  APPS_KEY,
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

export default async function handler(req, res) {
  if (!onlyMethod(req, res, 'GET')) return;
  if (!isAdmin(req)) return send(res, 401, { error: 'Unauthorized' });

  try {
    const [apps, waitlist, drafts, reminded] = await Promise.all([
      redis('HGETALL', APPS_KEY),
      redis('HGETALL', WAITLIST_KEY),
      redis('HGETALL', DRAFTS_KEY),
      redis('HKEYS', REMINDED_KEY)
    ]);
    const origin = siteOrigin(req);
    const editUrl = email => `${origin}/?apply=${applyToken(email)}`;
    const draftOf = new Map(hashValues(drafts).map(d => [d.email, d]));
    send(res, 200, {
      applications: hashValues(apps).map(a => ({ ...a, editUrl: editUrl(a.email) })),
      waitlist: hashValues(waitlist).map(w => ({
        ...w,
        editUrl: editUrl(w.email),
        answered: Object.keys(draftOf.get(w.email)?.answers || {}).length,
        answers: draftOf.get(w.email)?.answers || {},
        draftUpdatedAt: draftOf.get(w.email)?.updatedAt || null,
        reminded: reminded.includes(w.email)
      }))
    });
  } catch {
    send(res, 500, { error: 'Could not load' });
  }
}
