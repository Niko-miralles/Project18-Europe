import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { randomBytes } from 'node:crypto';

const DB_FILE = path.resolve('.local-db.json');

const createStore = () => {
  const db = new Map();
  try {
    for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(DB_FILE, 'utf8')))) {
      db.set(k, v.t === 'hash' ? new Map(Object.entries(v.v)) : v.t === 'set' ? new Set(v.v) : v.v);
    }
  } catch {
    /* fresh db */
  }
  const save = () => {
    const out = {};
    for (const [k, v] of db) {
      out[k] = v instanceof Map ? { t: 'hash', v: Object.fromEntries(v) } : v instanceof Set ? { t: 'set', v: [...v] } : { t: 'str', v };
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(out));
  };
  const hash = k => (db.get(k) instanceof Map ? db.get(k) : (db.set(k, new Map()), db.get(k)));
  const run = ([cmd, ...a]) => {
    switch (String(cmd).toUpperCase()) {
      case 'HSET': hash(a[0]).set(a[1], String(a[2])); return 1;
      case 'HSETNX': if (hash(a[0]).has(a[1])) return 0; hash(a[0]).set(a[1], String(a[2])); return 1;
      case 'HGET': return hash(a[0]).get(a[1]) ?? null;
      case 'HGETALL': return [...hash(a[0])].flat();
      case 'HKEYS': return [...hash(a[0]).keys()];
      case 'HDEL': return hash(a[0]).delete(a[1]) ? 1 : 0;
      case 'HEXISTS': return hash(a[0]).has(a[1]) ? 1 : 0;
      case 'HINCRBY': { const m = hash(a[0]); const v = Number(m.get(a[1]) || 0) + Number(a[2]); m.set(a[1], String(v)); return v; }
      case 'INCR': { const v = Number(db.get(a[0]) || 0) + 1; db.set(a[0], String(v)); return v; }
      case 'GET': return db.get(a[0]) ?? null;
      case 'SET': db.set(a[0], String(a[1])); return 'OK';
      case 'DEL': return a.filter(k => db.delete(k)).length;
      case 'EXPIRE': return 1;
      case 'PFADD': { const s = db.get(a[0]) instanceof Set ? db.get(a[0]) : new Set(); a.slice(1).forEach(x => s.add(x)); db.set(a[0], s); return 1; }
      case 'PFCOUNT': { const u = new Set(); a.forEach(k => db.get(k) instanceof Set && db.get(k).forEach(x => u.add(x))); return u.size; }
      default: throw new Error(`Local Redis: unsupported ${cmd}`);
    }
  };
  return { run, save };
};

const readBody = req =>
  new Promise(resolve => {
    let data = '';
    req.on('data', c => (data += c));
    req.on('end', () => resolve(data));
  });

export default function localApi() {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      const store = createStore();
      let redisUrl = '';
      server.middlewares.use('/__redis', async (req, res) => {
        const commands = JSON.parse((await readBody(req)) || 'null');
        res.setHeader('Content-Type', 'application/json');
        try {
          const out = req.url.startsWith('/pipeline') ? commands.map(c => ({ result: store.run(c) })) : { result: store.run(commands) };
          store.save();
          res.end(JSON.stringify(out));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      server.httpServer?.once('listening', () => {
        const { port } = server.httpServer.address();
        redisUrl = `http://localhost:${port}/__redis`;
      });

      server.middlewares.use('/api', async (req, res, next) => {
        const route = req.url.split('?')[0].replace(/\/+$/, '');
        const file = path.resolve('api', `.${route}.js`);
        if (route.includes('_') || !fs.existsSync(file)) return next();
        if (!process.env.KV_REST_API_URL && !process.env.STORAGE_KV_REST_API_URL) {
          process.env.KV_REST_API_URL = redisUrl;
          process.env.KV_REST_API_TOKEN = 'local';
        }
        process.env.ADMIN_PASSWORD ||= 'admin';
        process.env.ADMIN_SESSION_SECRET ||= randomBytes(24).toString('hex');

        const raw = await readBody(req);
        let body = raw;
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          /* keep raw */
        }
        const url = new URL(req.url, 'http://localhost');
        const shim = {
          statusCode: 200,
          setHeader: (k, v) => res.setHeader(k, v),
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(data) {
            res.statusCode = this.statusCode;
            res.setHeader('Content-Type', 'application/json');
            res.end(this.statusCode === 204 ? '' : JSON.stringify(data));
          }
        };
        try {
          const mod = await server.ssrLoadModule(file);
          await mod.default({ method: req.method, headers: req.headers, body, query: Object.fromEntries(url.searchParams) }, shim);
        } catch (err) {
          server.config.logger.error(`[local-api] ${route}: ${err.stack || err}`);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Local API error' }));
        }
      });
    }
  };
}
