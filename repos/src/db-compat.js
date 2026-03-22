'use strict';
const path = require('path');
const fs = require('fs');

let db;
try {
  const Database = require('better-sqlite3');
  const dbPath = process.env.DB_PATH || path.resolve(__dirname, '..', 'data', 'blackroad.db');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  console.log('[db] SQLite loaded:', dbPath);
} catch(e) {
  console.warn('[db] SQLite failed, using mock:', e.message);
  const noop = () => {};
  const stmt = { run: () => ({lastInsertRowid:0,changes:0}), get: () => undefined, all: () => [], iterate: function*(){} };
  db = { pragma: noop, exec: noop, close: noop, prepare: () => ({...stmt}), __mock: true };
}
module.exports = db;
