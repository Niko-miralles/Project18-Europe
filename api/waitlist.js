import { addContact } from './_email.js';
import {
  APPS_KEY,
  DRAFTS_KEY,
  EMAIL_PATTERN,
  WAITLIST_KEY,
  onlyMethod,
  rateLimited,
  redis,
  sameOrigin,
  send,
  text
} from './_lib.js';

export default async function handler(req, res) {
  if (!onlyMethod(req, res, 'POST')) return;
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });

  const email = text(req.body?.email, 200).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return send(res, 400, { error: 'Invalid email' });

  try {
    if (await rateLimited(req, 'waitlist', 20, 3600)) return send(res, 429, { error: 'Too many requests' });
    const added = await redis('HSETNX', WAITLIST_KEY, email, JSON.stringify({ email, joinedAt: new Date().toISOString() }));
    if (!added) {
      if (await redis('HEXISTS', APPS_KEY, email)) return send(res, 409, { error: 'Email already used' });
      await redis('HDEL', DRAFTS_KEY, email);
      return send(res, 200, { ok: true });
    }
    await addContact(email);
    send(res, 200, { ok: true });
  } catch {
    send(res, 500, { error: 'Could not save' });
  }
}
