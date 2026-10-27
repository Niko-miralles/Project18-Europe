import { ambassadorLaunchEmail, resend } from '../_email.js';
import { EMAIL_PATTERN, WAITLIST_KEY, hashValues, isAdmin, onlyMethod, redis, sameOrigin, send } from '../_lib.js';

const SENT_KEY = 'p18:broadcast:ambassadors-launch';
const TEST_TO = 'mirallesredes90@gmail.com';

export default async function handler(req, res) {
  if (!onlyMethod(req, res, 'POST')) return;
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });
  if (!isAdmin(req)) return send(res, 401, { error: 'Unauthorized' });

  const mode = req.body?.mode;
  try {
    const recipients = [...new Set(hashValues(await redis('HGETALL', WAITLIST_KEY)).map(w => String(w.email).toLowerCase()))].filter(e =>
      EMAIL_PATTERN.test(e)
    );
    const alreadySent = await redis('GET', SENT_KEY);

    if (mode === 'preview') return send(res, 200, { recipients: recipients.length, alreadySent: alreadySent ? JSON.parse(alreadySent) : null });

    if (mode === 'test') {
      const result = await resend('/emails', ambassadorLaunchEmail(TEST_TO));
      return send(res, 200, { sent: 1, to: TEST_TO, id: result?.id ?? null });
    }

    if (mode === 'send') {
      if (alreadySent) return send(res, 409, { error: 'Already sent', alreadySent: JSON.parse(alreadySent) });
      let sent = 0;
      for (let i = 0; i < recipients.length; i += 100) {
        const chunk = recipients.slice(i, i + 100);
        await resend('/emails/batch', chunk.map(ambassadorLaunchEmail));
        sent += chunk.length;
      }
      await redis('SET', SENT_KEY, JSON.stringify({ sent, at: new Date().toISOString() }));
      return send(res, 200, { sent });
    }

    send(res, 400, { error: 'Unknown mode' });
  } catch (err) {
    send(res, 500, { error: err.message || 'Could not send' });
  }
}
