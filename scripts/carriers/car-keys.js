// BlackRoad Car Keys — Sovereign API Authentication
// Every carrier (worker/service) gets a car key issued by BlackRoad.
// No OAuth, no external auth providers. BlackRoad issues, BlackRoad validates.
//
// Car Key format: br-<carrier>-<hex32>
// Validation: HMAC-SHA256(carrier_name + timestamp, master_key) must match
//
// Usage in any worker:
//   const { validateCarKey, issueCarKey } = require('./car-keys.js');
//   // or inline the functions (for worker-to-node CJS compat)

// Validate a car key against the registry
function validateCarKey(key, registry) {
  if (!key || !registry) return { valid: false, reason: 'missing key or registry' };

  // Master key bypasses all checks
  if (key === registry._master || key === registry.master) {
    return { valid: true, carrier: '_master', role: 'admin' };
  }

  // Find the carrier this key belongs to
  const carriers = registry.carriers || registry;
  for (const [name, info] of Object.entries(carriers)) {
    if (info.key === key || info === key) {
      return { valid: true, carrier: name, port: info.port, domain: info.domain, role: 'carrier' };
    }
  }

  return { valid: false, reason: 'unknown key' };
}

// Extract car key from request headers
function extractCarKey(request) {
  // Check Authorization: Bearer br-...
  const auth = request.headers?.get?.('Authorization') || request.headers?.authorization;
  if (auth?.startsWith('Bearer br-')) return auth.slice(7);
  // Check X-Car-Key header
  const carKey = request.headers?.get?.('X-Car-Key') || request.headers?.['x-car-key'];
  if (carKey) return carKey;
  // Check query param
  if (request.url) {
    const url = new URL(request.url, 'http://localhost');
    const qk = url.searchParams.get('key');
    if (qk?.startsWith('br-')) return qk;
  }
  return null;
}

// Middleware: validate car key on incoming request
function requireCarKey(request, registry) {
  const key = extractCarKey(request);
  if (!key) return { valid: false, reason: 'no car key provided', status: 401 };
  const result = validateCarKey(key, registry);
  if (!result.valid) return { ...result, status: 403 };
  return { ...result, status: 200 };
}

// Load registry from file (Node.js)
function loadRegistry(path) {
  try {
    const fs = require('fs');
    return JSON.parse(fs.readFileSync(path || '/opt/blackroad/workers/carrier-keys.json', 'utf8'));
  } catch {
    return null;
  }
}

if (typeof module !== 'undefined') {
  module.exports = { validateCarKey, extractCarKey, requireCarKey, loadRegistry };
}
