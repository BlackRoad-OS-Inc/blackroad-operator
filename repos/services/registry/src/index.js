const express = require('express');
const { createDb } = require('@roadcode/db');
const { loadConfig } = require('@roadcode/config');
const { createLogger } = require('@roadcode/logger');
const { createRoutes } = require('./routes');
const { seedFromJson } = require('./handlers/seed');

const log = createLogger('registry');
const config = loadConfig();
const db = createDb(config.registry.dbPath);

// Seed registries from JSON on startup
seedFromJson(db, config.registry.registriesPath, log);

const app = express();
app.use(express.json());

// CORS — allow Prism and external consumers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    log.info(`${req.method} ${req.path}`, { status: res.statusCode, ms: Date.now() - start });
  });
  next();
});

// Health check
app.get('/road/v1/health', (req, res) => {
  res.json({ service: 'registry', status: 'ok', ts: new Date().toISOString() });
});

// Registry routes
createRoutes(app, db, log);

app.listen(config.registry.port, () => {
  log.info(`Registry listening on :${config.registry.port}`);
});
