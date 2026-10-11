import { clearedCookie, onlyMethod, send } from '../_lib.js';

export default function handler(req, res) {
  if (!onlyMethod(req, res, 'POST')) return;
  res.setHeader('Set-Cookie', clearedCookie());
  send(res, 200, { ok: true });
}
