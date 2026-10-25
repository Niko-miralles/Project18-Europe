import { Buffer } from 'node:buffer';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import process from 'node:process';

const PREFIX = 'p18:';
export const WAITLIST_KEY = `${PREFIX}waitlist`;
export const APPS_KEY = `${PREFIX}applications`;
export const DRAFTS_KEY = `${PREFIX}drafts`;

export const APPLICATION_FIELDS = {
  name: 200,
  dob: 20,
  location: 200,
  building: 4000,
  built: 1000,
  coolest: 4000,
  future: 4000,
  links: 1000,
  barcelona: 10,
  barcelonaNote: 4000,
  video: 1000,
  whatsapp: 40
};
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const redis = async (...command) => {
  const res = await fetch(process.env.STORAGE_KV_REST_API_URL || process.env.KV_REST_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.STORAGE_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN}` },
    body: JSON.stringify(command)
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || `Redis ${res.status}`);
  return data.result;
};

const clientIp = req =>
  String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'unknown')
    .split(',')[0]
    .trim();

export const rateLimited = async (req, kind, limit, windowSeconds) => {
  const key = `${PREFIX}rl:${kind}:${clientIp(req)}`;
  const count = await redis('INCR', key);
  if (count === 1) await redis('EXPIRE', key, windowSeconds);
  return count > limit;
};

export const send = (res, status, body) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
};

export const onlyMethod = (req, res, method) => {
  if (req.method === method) return true;
  res.setHeader('Allow', method);
  send(res, 405, { error: 'Method not allowed' });
  return false;
};

export const sameOrigin = req => {
  const origin = req.headers.origin;
  const host = String(req.headers['x-forwarded-host'] || req.headers.host).split(',')[0].trim();
  return !origin || new URL(origin).host === host;
};

export const text = (value, max) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const digest = value => createHash('sha256').update(String(value)).digest();

export const passwordMatches = password => {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== 'string') return false;
  return timingSafeEqual(digest(password), digest(expected));
};

const COOKIE = 'p18_admin';
const SESSION_SECONDS = 8 * 60 * 60;

const sign = value =>
  createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(value).digest('base64url');

export const sessionCookie = () => {
  const expires = String(Date.now() + SESSION_SECONDS * 1000);
  return `${COOKIE}=${expires}.${sign(expires)}; Path=/api/admin; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
};

export const clearedCookie = () =>
  `${COOKIE}=; Path=/api/admin; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

export const isAdmin = req => {
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  const match = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return false;
  const [expires, signature] = match[1].split('.');
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(expires));
  return a.length === b.length && timingSafeEqual(a, b);
};

const applySignature = email =>
  createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(`apply:${email}`).digest('base64url');

export const applyToken = email => `${Buffer.from(email).toString('base64url')}.${applySignature(email)}`;

export const emailFromToken = token => {
  if (typeof token !== 'string' || !process.env.ADMIN_SESSION_SECRET) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const email = Buffer.from(encoded, 'base64url').toString();
  if (!EMAIL_PATTERN.test(email)) return null;
  const a = Buffer.from(signature);
  const b = Buffer.from(applySignature(email));
  return a.length === b.length && timingSafeEqual(a, b) ? email : null;
};

export const siteOrigin = req => {
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host).split(',')[0].trim();
  return `${proto}://${host}`;
};

export const REMINDED_KEY = `${PREFIX}reminded`;

export const hashValues = list => {
  const out = [];
  for (let i = 1; i < (list?.length ?? 0); i += 2) out.push(JSON.parse(list[i]));
  return out;
};

export const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

