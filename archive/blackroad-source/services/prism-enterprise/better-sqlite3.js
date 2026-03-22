class MockStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
  }

  run(params = []) {
    return this.db._run(this.sql, params);
  }

  all(params = []) {
    return this.db._all(this.sql, params);
  }

  get(params = []) {
    const rows = this.db._all(this.sql, params);
    return rows[0];
  }
}

class MockDatabase {
  constructor() {
    this.tables = new Map();
    this.autoIds = new Map();
  }

  _ensure(table) {
    const key = table.toLowerCase();
    if (!this.tables.has(key)) this.tables.set(key, []);
    if (!this.autoIds.has(key)) this.autoIds.set(key, 0);
    return this.tables.get(key);
  }

  _nextId(table) {
    const key = table.toLowerCase();
    const next = (this.autoIds.get(key) || 0) + 1;
    this.autoIds.set(key, next);
    return next;
  }

  pragma() {}

  exec() {
    return this;
  }

  close() {}

  prepare(sql) {
    return new MockStatement(this, sql);
  }

  _parseInsert(sql, params) {
    const match = /INSERT INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i.exec(sql);
    if (!match) return null;
    const [, tableRaw, columnsRaw, valuesRaw] = match;
    const columns = columnsRaw.split(',').map((c) => c.trim().replace(/[`"]/g, ''));
    const values = valuesRaw.split(',').map((v) => v.trim());
    const row = {};
    let paramIndex = 0;
    for (let i = 0; i < columns.length; i++) {
      const expr = values[i] || '?';
      const column = columns[i];
      if (expr === '?' || /^\?\d+$/.test(expr)) {
        row[column] = params[paramIndex++];
      } else if (/datetime/i.test(expr)) {
        row[column] = new Date().toISOString();
      } else if (/null/i.test(expr)) {
        row[column] = null;
      } else if (/^'.*'$/.test(expr)) {
        row[column] = expr.slice(1, -1);
      } else if (/^-?\d+(\.\d+)?$/.test(expr)) {
        row[column] = Number(expr);
      } else {
        row[column] = params[paramIndex++] ?? null;
      }
    }
    return { table: tableRaw.toLowerCase(), row };
  }

  _run(sql, params) {
    const normalized = sql.replace(/\s+/g, ' ').trim();
    const upper = normalized.toUpperCase();
    if (upper.startsWith('CREATE TABLE')) {
      const match = /CREATE TABLE IF NOT EXISTS\s+(\w+)/i.exec(normalized);
      if (match) this._ensure(match[1]);
      return { changes: 0, lastInsertRowid: 0 };
    }
    if (upper.startsWith('PRAGMA')) {
      return { changes: 0, lastInsertRowid: 0 };
    }
    if (upper.startsWith('INSERT INTO')) {
      const parsed = this._parseInsert(normalized, params);
      if (!parsed) return { changes: 0, lastInsertRowid: 0 };
      const rows = this._ensure(parsed.table);
      const record = { ...parsed.row };
      if (record.id === undefined || record.id === null) {
        record.id = this._nextId(parsed.table);
      }
      rows.push(record);
      return { changes: 1, lastInsertRowid: record.id };
    }
    if (upper.startsWith('UPDATE')) {
      const tableMatch = /UPDATE\s+(\w+)/i.exec(normalized);
      const table = tableMatch ? tableMatch[1].toLowerCase() : '';
      const rows = this._ensure(table);
      const id = params[params.length - 1];
      const row = rows.find((r) => r.id === id);
      if (row) {
        const setters = normalized.split('SET')[1].split('WHERE')[0].split(',');
        let paramIdx = 0;
        for (const set of setters) {
          const [colRaw, expr] = set.split('=').map((s) => s.trim());
          const col = colRaw.replace(/[`"]/g, '');
          if (/COALESCE\(\?,/i.test(expr) || expr === '?') {
            const value = params[paramIdx++];
            if (value !== undefined) row[col] = value;
          } else if (/datetime/i.test(expr)) {
            row[col] = new Date().toISOString();
          }
        }
      }
      return { changes: row ? 1 : 0, lastInsertRowid: id };
    }
    if (upper.startsWith('DELETE FROM')) {
      const match = /DELETE FROM\s+(\w+)/i.exec(normalized);
      const table = match ? match[1].toLowerCase() : '';
      const rows = this._ensure(table);
      const id = params[0];
      const index = rows.findIndex((r) => r.id === id);
      if (index >= 0) rows.splice(index, 1);
      return { changes: index >= 0 ? 1 : 0, lastInsertRowid: id };
    }
    return { changes: 0, lastInsertRowid: 0 };
  }

  _all(sql, params) {
    const normalized = sql.replace(/\s+/g, ' ').trim();
    const upper = normalized.toUpperCase();
    if (upper.includes('SELECT COUNT(*) AS C FROM PLANS')) {
      const plans = this._ensure('plans');
      return [{ c: plans.length }];
    }
    if (upper.startsWith('SELECT ID, NAME, MONTHLY_PRICE_CENTS')) {
      const plans = this._ensure('plans');
      return plans.filter((p) => p.is_active !== 0);
    }
    if (upper.startsWith('SELECT ID, NAME, UPDATED_AT, META FROM')) {
      const match = /FROM\s+(\w+)/i.exec(normalized);
      const table = match ? match[1].toLowerCase() : '';
      return [...this._ensure(table)];
    }
    if (upper.startsWith('SELECT ID FROM SUBSCRIBERS WHERE EMAIL')) {
      const email = params[0];
      const rows = this._ensure('subscribers');
      const row = rows.find((r) => r.email === email);
      return row ? [row] : [];
    }
    if (upper.startsWith('SELECT S.PLAN, S.CYCLE, S.STATUS FROM SUBSCRIBERS')) {
      const email = params[0];
      const subscribers = this._ensure('subscribers');
      const subs = this._ensure('subscriptions');
      const subscriber = subscribers.find((r) => r.email === email);
      if (!subscriber) return [];
      const sub = [...subs].reverse().find((r) => r.subscriber_id === subscriber.id);
      return sub ? [{ plan: sub.plan, cycle: sub.cycle, status: sub.status }] : [];
    }
    if (upper.startsWith('SELECT SUMMARY FROM QUANTUM_AI')) {
      return [];
    }
    if (upper.startsWith('SELECT * FROM EXCEPTION_REQUESTS WHERE ID')) {
      const id = params[0];
      const rows = this._ensure('exception_requests');
      const row = rows.find((r) => r.id === id);
      return row ? [row] : [];
    }
    return [];
  }
}

module.exports = MockDatabase;
