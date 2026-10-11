import {
  APPLICATION_FIELDS,
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
import { addContact } from './_email.js';

export default async function handler(req, res) {
  if (!onlyMethod(req, res, 'POST')) return;
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });

  const body = req.body ?? {};
  const email = text(body.email, 200).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return send(res, 400, { error: 'Invalid email' });

  const answers = {};
  for (const [field, max] of Object.entries(APPLICATION_FIELDS)) {
    const value = text(body.answers?.[field], max);
    if (value) answers[field] = value;
  }
  const step = Math.max(0, Math.min(50, Number.parseInt(body.step, 10) || 0));
  const now = new Date().toISOString();

  try {
    if (await rateLimited(req, 'draft', 120, 3600)) return send(res, 429, { error: 'Too many requests' });
    await redis('HSET', DRAFTS_KEY, email, JSON.stringify({ email, answers, step, updatedAt: now }));
    const added = await redis('HSETNX', WAITLIST_KEY, email, JSON.stringify({ email, joinedAt: now }));
    if (added) await addContact(email);
    send(res, 200, { ok: true });
  } catch {
    send(res, 500, { error: 'Could not save' });
  }
}
