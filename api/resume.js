import {
  APPLICATION_FIELDS,
  APPS_KEY,
  DRAFTS_KEY,
  emailFromToken,
  onlyMethod,
  rateLimited,
  redis,
  send
} from './_lib.js';

export default async function handler(req, res) {
  if (!onlyMethod(req, res, 'GET')) return;
  const email = emailFromToken(String(req.query?.token || ''));
  if (!email) return send(res, 404, { error: 'Invalid link' });

  try {
    if (await rateLimited(req, 'resume', 60, 3600)) return send(res, 429, { error: 'Too many requests' });
    const [app, draft] = await Promise.all([redis('HGET', APPS_KEY, email), redis('HGET', DRAFTS_KEY, email)]);
    const application = app ? JSON.parse(app) : null;
    const saved = draft ? JSON.parse(draft) : null;
    const useDraft = saved && (!application || saved.updatedAt > application.submittedAt);
    const source = useDraft ? saved.answers : application || {};
    const answers = {};
    for (const field of Object.keys(APPLICATION_FIELDS)) if (source[field]) answers[field] = source[field];
    send(res, 200, { email, answers, step: useDraft ? saved.step : 0, submitted: Boolean(application) });
  } catch {
    send(res, 500, { error: 'Could not load' });
  }
}
