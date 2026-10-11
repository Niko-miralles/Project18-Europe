import { addContact, reminderEmail, resend } from '../_email.js';
import process from 'node:process';
import { APPS_KEY, DRAFTS_KEY, REMINDED_KEY, WAITLIST_KEY, hashValues, redis, safeEqual, send } from '../_lib.js';

const DELAY_MS = 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !safeEqual(req.headers.authorization || '', `Bearer ${secret}`)) {
    return send(res, 401, { error: 'Unauthorized' });
  }

  try {
    const [waitlist, applied, drafts, reminded] = await Promise.all([
      redis('HGETALL', WAITLIST_KEY),
      redis('HKEYS', APPS_KEY),
      redis('HGETALL', DRAFTS_KEY),
      redis('HKEYS', REMINDED_KEY)
    ]);
    const skip = new Set([...applied, ...reminded]);
    const draftOf = new Map(hashValues(drafts).map(d => [d.email, d]));
    const cutoff = Date.now() - DELAY_MS;
    const due = hashValues(waitlist)
      .filter(w => !skip.has(w.email) && Date.parse(w.joinedAt) < cutoff)
      .slice(0, 100);
    if (!due.length) return send(res, 200, { sent: 0 });

    await Promise.all(due.map(w => addContact(w.email)));
    await resend('/emails/batch', due.map(w => reminderEmail(w.email, draftOf.get(w.email)?.answers?.name)));
    const now = new Date().toISOString();
    await redis('HSET', REMINDED_KEY, ...due.flatMap(w => [w.email, now]));
    send(res, 200, { sent: due.length });
  } catch {
    send(res, 500, { error: 'Could not send reminders' });
  }
}
