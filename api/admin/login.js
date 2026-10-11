import { onlyMethod, passwordMatches, rateLimited, sameOrigin, send, sessionCookie } from '../_lib.js';

export default async function handler(req, res) {
  if (!onlyMethod(req, res, 'POST')) return;
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });

  try {
    if (await rateLimited(req, 'login', 5, 900)) return send(res, 429, { error: 'Too many attempts. Try again later.' });
  } catch {
    return send(res, 500, { error: 'Unavailable' });
  }

  if (!passwordMatches(req.body?.password)) return send(res, 401, { error: 'Wrong password.' });

  res.setHeader('Set-Cookie', sessionCookie());
  send(res, 200, { ok: true });
}
