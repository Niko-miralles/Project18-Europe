import { addContact, confirmationEmail, resend } from './_email.js';
import { APPLICATION_FIELDS, APPS_KEY, DRAFTS_KEY, EMAIL_PATTERN, WAITLIST_KEY, onlyMethod, rateLimited, redis, sameOrigin, send, text } from './_lib.js';

export default async function handler(req, res) {
  if (!onlyMethod(req, res, 'POST')) return;
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });

  const body = req.body ?? {};
  const email = text(body.email, 200).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return send(res, 400, { error: 'Invalid email' });

  const entry = { email };
  for (const [field, max] of Object.entries(APPLICATION_FIELDS)) entry[field] = text(body[field], max);
  if (!entry.name || !entry.whatsapp) return send(res, 400, { error: 'Missing fields' });
  entry.submittedAt = new Date().toISOString();

  try {
    if (await rateLimited(req, 'apply', 10, 3600)) return send(res, 429, { error: 'Too many requests' });
    const isNew = !(await redis('HEXISTS', APPS_KEY, email));
    await redis('HSET', APPS_KEY, email, JSON.stringify(entry));
    const added = await redis('HSETNX', WAITLIST_KEY, email, JSON.stringify({ email, joinedAt: entry.submittedAt }));
    await redis('HDEL', DRAFTS_KEY, email);
    if (added) await addContact(email);
    if (isNew) await resend('/emails', confirmationEmail(email, entry.name)).catch(() => {});
    send(res, 200, { ok: true });
  } catch {
    send(res, 500, { error: 'Could not save' });
  }
}
