#!/usr/bin/env node
/**
 * BlackRoad Worker-to-Node Runner
 * Takes a Cloudflare Worker (src/worker.js) and runs it as a Node.js HTTP server.
 * Wraps the Worker's fetch() handler with a lightweight http server.
 *
 * Usage: node worker-to-node.js <worker-dir> <port> [--env KEY=VALUE ...]
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node worker-to-node.js <worker-dir> <port> [--env KEY=VALUE ...]');
  process.exit(1);
}

const workerDir = path.resolve(args[0]);
const port = parseInt(args[1]);
const env = {};

// Parse --env flags
for (let i = 2; i < args.length; i++) {
  if (args[i] === '--env' && args[i + 1]) {
    const [k, ...v] = args[i + 1].split('=');
    env[k] = v.join('=');
    i++;
  }
}

// Find worker entry point
const candidates = [
  path.join(workerDir, 'src', 'worker.js'),
  path.join(workerDir, 'src', 'index.js'),
  path.join(workerDir, 'src', 'index.ts'),
  path.join(workerDir, 'worker.js'),
];

let workerPath = candidates.find(f => fs.existsSync(f));
if (!workerPath) {
  console.error(`No worker entry found in ${workerDir}`);
  process.exit(1);
}

// Read and wrap the worker code
let workerCode = fs.readFileSync(workerPath, 'utf-8');

// Strip ESM export default and convert to module.exports
workerCode = workerCode.replace(/export\s+default\s*\{/, 'module.exports = {');
// Handle "export default" object at end
workerCode = workerCode.replace(/export\s+default\s+(\w+)/, 'module.exports = $1');

// Write temp file
const tmpPath = path.join(workerDir, '.worker-node-tmp.js');
fs.writeFileSync(tmpPath, workerCode);

let worker;
try {
  worker = require(tmpPath);
} catch (e) {
  console.error(`Failed to load worker: ${e.message}`);
  // Try evaluating with globalThis shims
  console.error('Worker may use ESM syntax not supported in CJS mode');
  process.exit(1);
}

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  try {
    // Build a Request-like object
    const url = `http://localhost:${port}${req.url}`;
    const headers = new Map(Object.entries(req.headers));

    // Read body for POST/PUT
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await new Promise((resolve) => {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks)));
      });
    }

    // Build fetch-compatible Request
    const request = {
      method: req.method,
      url,
      headers: {
        get: (k) => req.headers[k.toLowerCase()] || null,
        has: (k) => k.toLowerCase() in req.headers,
        entries: () => Object.entries(req.headers),
      },
      json: async () => JSON.parse(body.toString()),
      text: async () => body.toString(),
      arrayBuffer: async () => body,
    };

    // Call the worker's fetch handler
    const response = await worker.fetch(request, env);

    // Convert Response to Node.js response
    const status = response.status || 200;
    const respHeaders = {};

    if (response.headers) {
      if (response.headers instanceof Map) {
        response.headers.forEach((v, k) => { respHeaders[k] = v; });
      } else if (typeof response.headers.entries === 'function') {
        for (const [k, v] of response.headers.entries()) {
          respHeaders[k] = v;
        }
      } else if (typeof response.headers === 'object') {
        Object.assign(respHeaders, response.headers);
      }
    }

    res.writeHead(status, respHeaders);

    if (response.body) {
      if (typeof response.body === 'string') {
        res.end(response.body);
      } else if (Buffer.isBuffer(response.body)) {
        res.end(response.body);
      } else if (response.body.getReader) {
        // ReadableStream
        const reader = response.body.getReader();
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) { res.end(); return; }
          res.write(value);
          await pump();
        };
        await pump();
      } else {
        res.end(String(response.body));
      }
    } else {
      res.end();
    }

  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[worker-to-node] ${path.basename(workerDir)} running on :${port}`);
});

// Cleanup on exit
process.on('SIGTERM', () => { fs.unlinkSync(tmpPath); process.exit(0); });
process.on('SIGINT', () => { fs.unlinkSync(tmpPath); process.exit(0); });
