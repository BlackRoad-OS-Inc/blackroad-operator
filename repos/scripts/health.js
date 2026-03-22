const http = require('http');

const port = process.env.PORT || 4000;
const timeoutMs = Number(process.env.HEALTH_TIMEOUT_MS || 5000);

// Exit codes:
// 0: API healthy and all dependent services report ok
// 1: API unreachable, timed out, or returned a non-200 / malformed payload
// 2: API reachable but at least one dependent service reported unhealthy

const req = http.request(
  { hostname: '127.0.0.1', port, path: '/api/health', method: 'GET' },
  (res) => {
    if (res.statusCode !== 200) {
      process.exit(1);
      return;
    }

    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
      try {
        const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (payload?.ok !== true) {
          process.exit(1);
          return;
        }
        if (payload?.services && Object.values(payload.services).includes(false)) {
          process.exit(2);
          return;
        }
        process.exit(0);
      } catch (err) {
        console.error('Failed to parse /api/health response', err);
        process.exit(1);
      }
    });
  },
);

req.setTimeout(timeoutMs, () => {
  req.destroy(new Error('timeout'));
});

req.on('error', (err) => {
  if (err && err.message === 'timeout') {
    console.error(`Health check timed out after ${timeoutMs}ms`);
  }
  process.exit(1);
});

req.end();
