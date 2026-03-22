/* eslint-env jest, node */
/* global require, describe, it, expect, jest */

jest.mock(
  'winston',
  () => {
    const logger = {
      info: () => {},
      error: () => {},
      warn: () => {},
      debug: () => {},
      child: () => logger,
    };
    const format = {
      json: () => () => {},
      simple: () => () => {},
    };
    function Console() {}
    function File() {}
    return {
      createLogger: () => logger,
      format,
      transports: { Console, File },
    };
  },
  { virtual: true }
);

const Database = require('better-sqlite3');
const slackExceptions = require('../srv/blackroad-api/modules/slack_exceptions');

describe('slackExceptions legacy schema patch', () => {
  it('adds missing columns to exception_events', () => {
    const db = new Database(':memory:');
    db.prepare(
      `
      CREATE TABLE exception_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exception_id INTEGER NOT NULL,
        actor TEXT,
        detail TEXT,
        correlation_id TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `
    ).run();

    db.prepare(
      `
      INSERT INTO exception_events (exception_id, actor, detail, correlation_id)
      VALUES (1, 'tester', 'legacy event', 'abc')
    `
    ).run();

    const app = { post: jest.fn() };
    slackExceptions({ app, db });

    const columns = db
      .prepare("PRAGMA table_info('exception_events')")
      .all()
      .map((col) => col.name);
    expect(columns).toEqual(
      expect.arrayContaining([
        'event_type',
        'actor',
        'detail',
        'correlation_id',
      ])
    );

    const rows = db.prepare('SELECT event_type FROM exception_events').all();
    expect(rows.map((row) => row.event_type)).toEqual(['info']);

    db.close();
  });
});
