// Guard for JSON parsing + X-BlackRoad-Key auth (loopback allowed)
const fs = require('fs');

module.exports = function requestGuard(app) {
  const keyPath = process.env.ORIGIN_KEY_PATH || '/srv/secrets/origin.key';
  let ORIGIN_KEY = '';
  try {
    ORIGIN_KEY = fs.readFileSync(keyPath, 'utf8').trim();
  } catch {
    // missing key is fine; fall back to header auth only
  }
  const SKIP = [
    '/api/normalize',
    '/slack/command',
    '/slack/interact',
    '/health',
    '/health/live',
    '/health/ready',
    '/api/health',
  ];
  const skip = (p) => SKIP.some(s => p === s || p.startsWith(s + '/'));
  app.use((req, res, next) => {
    if (skip(req.path)) return next();
    // parse JSON (small, safe) while preserving the raw payload for webhook validation
    const contentType = req.headers['content-type'] || '';
    const shouldParse =
      req.method !== 'GET' && contentType.includes('application/json');
    if (!shouldParse) return next();

    const chunks = [];
    let finished = false;
    const finalize = (err) => {
      if (finished) return;
      finished = true;
      if (err) return next(err);
      next();
    };

    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('error', (err) => finalize(err));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      req.rawBody = raw;
      if (!raw) {
        req.body = {};
        return finalize();
      }
      try {
        req.body = JSON.parse(raw);
      } catch {
        req.body = {};
      }
      finalize();
    });
  const SKIP = ['/api/normalize'];
  const skip = (p) => SKIP.some(s => p === s || p.startsWith(s + '/'));
  app.use((req,res,next)=>{
    if (skip(req.path)) return next();
function isLocal(ip) {
  if (!ip) return false;
  if (ip === '::1' || ip.startsWith('127.')) return true;
  if (ip.startsWith('::ffff:')) {
    const mapped = ip.slice('::ffff:'.length);
    if (mapped === '127.0.0.1' || mapped.startsWith('127.')) {
      return true;
    }
  }
  return false;
}

module.exports = function requestGuard(app) {
  const keyPath = process.env.ORIGIN_KEY_PATH || '/srv/secrets/origin.key';
  let ORIGIN_KEY = '';
  try {
    ORIGIN_KEY = fs.readFileSync(keyPath, 'utf8').trim();
  } catch {}
  app.use((req, res, next) => {
    // parse JSON (small, safe)
  } catch {}

  const SKIP = ['/api/normalize', '/slack/command', '/slack/interact'];
  const skip = (p) => SKIP.some((s) => p === s || p.startsWith(`${s}/`));

  const disableGuardFlag = String(
    process.env.BR_TEST_DISABLE_DB || process.env.BRC_DISABLE_NATIVE_DB || ''
  ).toLowerCase();
  const shouldBypassAuth =
    disableGuardFlag === '1' || disableGuardFlag === 'true';

  app.use((req, res, next) => {
    if (skip(req.path)) return next();
    if (
      req.method !== 'GET' &&
      (req.headers['content-type'] || '').includes('application/json')
    ) {
      let b = '';
      req.on('data', (d) => (b += d));
      req.on('end', () => {
        try {
          req.body = JSON.parse(b || '{}');
      let body = '';
      req.on('data', (d) => {
        body += d;
      });
      req.on('end', () => {
        try {
          req.body = JSON.parse(body || '{}');
        } catch {
          req.body = {};
        }
        next();
      });
    } else next();
    } else {
      next();
    }
  });

  if (shouldBypassAuth) {
    return;
  }

  app.use((req, res, next) => {
    if (skip(req.path)) return next();
  app.use((req, res, next) => {
    const ip = req.socket.remoteAddress || '';
    const loopback =
      ip === '::1' ||
      ip === '127.0.0.1' ||
      ip.startsWith('127.') ||
      ip.startsWith('::ffff:127.');
    if (loopback) return next();
  app.use((req, res, next) => {
    const ip = req.socket.remoteAddress || '';
    if (isLocal(ip)) return next();
    if (
      ip === '::1' ||
      ip === '::ffff:127.0.0.1' ||
      ip.startsWith('127.') ||
      ip.startsWith('::ffff:127.')
    ) {
      return next();
    }
    const k = req.get('X-BlackRoad-Key') || '';
    return ORIGIN_KEY && k === ORIGIN_KEY
      ? next()
      : res.status(401).json({ ok: false, data: null, error: 'unauthorized' });
    if (ip.startsWith('127.') || ip === '::1' || ip.startsWith('::ffff:127.'))
      return next();
    const k = req.get('X-BlackRoad-Key') || '';
    if (ORIGIN_KEY && k === ORIGIN_KEY) return next();
    return res
      .status(401)
      .json({ ok: false, data: null, error: 'unauthorized' });
  });
};
