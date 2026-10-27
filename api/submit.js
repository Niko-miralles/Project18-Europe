import { randomUUID } from 'node:crypto';
import { formConfirmationEmail, notificationEmail, resend } from './_email.js';
import { EMAIL_PATTERN, FORMS, onlyMethod, rateLimited, redis, sameOrigin, send, text } from './_lib.js';

export default async function handler(req, res) {
  if (!onlyMethod(req, res, 'POST')) return;
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });

  const body = req.body ?? {};
  const form = FORMS[body.type];
  if (!form) return send(res, 400, { error: 'Unknown form' });

  const entry = { id: randomUUID(), type: body.type };
  for (const [field, max] of Object.entries(form.fields)) entry[field] = text(body[field], max);
  entry.email = entry.email.toLowerCase();
  if (!EMAIL_PATTERN.test(entry.email) || form.required.some(field => !entry[field])) {
    return send(res, 400, { error: 'Missing fields' });
  }
  entry.submittedAt = new Date().toISOString();

  try {
    if (await rateLimited(req, `submit-${body.type}`, 30, 3600)) return send(res, 429, { error: 'Too many requests' });
    await redis('HSET', form.key, entry.id, JSON.stringify(entry));
    const results = await Promise.allSettled([
      resend('/emails', notificationEmail(entry)),
      resend('/emails', formConfirmationEmail(entry))
    ]);
    for (const r of results) if (r.status === 'rejected') console.error('submit email failed:', r.reason?.message);
    send(res, 200, { ok: true });
  } catch {
    send(res, 500, { error: 'Could not save' });
  }
}
