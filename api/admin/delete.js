import { removeContact } from '../_email.js';
import {
  APPS_KEY,
  FORMS,
  DRAFTS_KEY,
  EMAIL_PATTERN,
  REMINDED_KEY,
  WAITLIST_KEY,
  isAdmin,
  onlyMethod,
  redis,
  sameOrigin,
  send,
  text
} from '../_lib.js';

export default async function handler(req, res) {
  if (!onlyMethod(req, res, 'POST')) return;
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });
  if (!isAdmin(req)) return send(res, 401, { error: 'Unauthorized' });

  const form = FORMS[req.body?.type];
  if (form) {
    const id = text(req.body?.id, 64);
    if (!id) return send(res, 400, { error: 'Missing id' });
    try {
      await redis('HDEL', form.key, id);
      return send(res, 200, { ok: true });
    } catch {
      return send(res, 500, { error: 'Could not delete' });
    }
  }

  const email = text(req.body?.email, 200).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return send(res, 400, { error: 'Invalid email' });

  try {
    await Promise.all([
      ...[APPS_KEY, WAITLIST_KEY, DRAFTS_KEY, REMINDED_KEY].map(key => redis('HDEL', key, email))
    ]);
    await removeContact(email);
    send(res, 200, { ok: true });
  } catch {
    send(res, 500, { error: 'Could not delete' });
  }
}
