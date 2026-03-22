#!/usr/bin/env node
/**
 * Seed the registry database from registries/*.json
 * Usage: node scripts/seed.js
 */
const path = require('path');
const { createDb } = require('../packages/db/src');
const { seedFromJson } = require('../services/registry/src/handlers/seed');
const { createLogger } = require('../packages/logger/src');

const log = createLogger('seed');
const dbPath = process.env.REGISTRY_DB_PATH || path.join(__dirname, '..', 'data', 'roadcode.db');
const registriesPath = path.join(__dirname, '..', 'registries');

// Ensure data dir exists
const fs = require('fs');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = createDb(dbPath);
seedFromJson(db, registriesPath, log);

log.info('Seed complete');
db.close();
