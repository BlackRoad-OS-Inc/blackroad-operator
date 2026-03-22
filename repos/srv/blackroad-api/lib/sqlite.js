let NativeDatabase;
try {
  NativeDatabase = require('better-sqlite3');
} catch (err) {
  NativeDatabase = null;
  console.warn(
    `[sqlite] WARNING: better-sqlite3 unavailable (${err.message}); using in-memory stub`
  );
}

const toIsoNow = () => new Date().toISOString();

class MemoryDatabase {
  constructor(dbPath) {
    this.path = dbPath;
    this.tables = new Map();
    this.autoIds = new Map();
  }

  ensureTable(name) {
    if (!this.tables.has(name)) {
      this.tables.set(name, []);
      this.autoIds.set(name, 1);
    }
  }

  pragma() {
    return null;
  }

  prepare(sql) {
    return new MemoryStatement(this, sql);
  }

  exec(sql) {
    if (!sql) return;
    const segments = sql
      .split(';')
      .map((segment) => segment.trim())
      .filter(Boolean);
    for (const statement of segments) {
      try {
        this.prepare(statement).run();
      } catch {
        // ignore unsupported statements (e.g., triggers) in the stub
      }
    }
  }
}

class MemoryStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql.trim();
  }

  run(...params) {
    return this._execute('run', params);
  }

  get(...params) {
    const result = this._execute('get', params);
    if (Array.isArray(result)) return result[0];
    return result;
  }

  all(...params) {
    const result = this._execute('all', params);
    return Array.isArray(result) ? result : [];
  }

  _execute(mode, params) {
    const upper = this.sql.toUpperCase();

    if (upper.startsWith('PRAGMA')) {
      return { changes: 0 };
    }

    const createMatch = this.sql.match(
      /^CREATE TABLE IF NOT EXISTS\s+([\w_]+)/i
    );
    if (createMatch) {
      const table = createMatch[1];
      this.db.ensureTable(table);
      return { changes: 0 };
    }

    const insertMatch = this.sql.match(
      /^INSERT( OR IGNORE)? INTO\s+([\w_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i
    );
    if (insertMatch) {
      const ignore = Boolean(insertMatch[1]);
      const table = insertMatch[2];
      const cols = insertMatch[3].split(',').map((c) => c.trim());
      const tokens = insertMatch[4].split(',').map((v) => v.trim());
      this.db.ensureTable(table);
      const rows = this.db.tables.get(table);
      const row = {};
      let paramIdx = 0;
      cols.forEach((col, idx) => {
        const token = tokens[idx] ?? '?';
        row[col] = resolveValue(token, params, paramIdx);
        if (token === '?') paramIdx += 1;
      });
      if (row.id === undefined || row.id === null) {
        row.id = this.db.autoIds.get(table) || 1;
        this.db.autoIds.set(table, row.id + 1);
      }
      if (ignore && rows.some((r) => r.id === row.id)) {
        return { changes: 0, lastInsertRowid: row.id };
      }
      rows.push(row);
      return { changes: 1, lastInsertRowid: row.id };
    }

    const updateMatch = this.sql.match(
      /^UPDATE\s+([\w_]+)\s+SET\s+(.+)\s+WHERE\s+id\s*=\s*\?/i
    );
    if (updateMatch) {
      const table = updateMatch[1];
      const assignments = updateMatch[2].split(',').map((s) => s.trim());
      const idParam = params[params.length - 1];
      const rows = this.db.tables.get(table) || [];
      const row = rows.find((r) => r.id === idParam);
      if (!row) return { changes: 0 };
      let paramIdx = 0;
      for (const assignment of assignments) {
        const [colRaw, exprRaw] = assignment.split('=').map((s) => s.trim());
        const col = colRaw.replace(/[`"']/g, '');
        const expr = exprRaw.toUpperCase();
        if (expr.includes('COALESCE(')) {
          const value = params[paramIdx++];
          if (value !== null && value !== undefined) {
            row[col] = value;
          }
        } else if (expr.includes('DATETIME(')) {
          row[col] = toIsoNow();
        } else if (expr === '?') {
          row[col] = params[paramIdx++];
        } else {
          row[col] = stripQuotes(exprRaw);
        }
      }
      return { changes: 1 };
    }

    const deleteMatch = this.sql.match(
      /^DELETE FROM\s+([\w_]+)\s+WHERE\s+id\s*=\s*\?/i
    );
    if (deleteMatch) {
      const table = deleteMatch[1];
      const idParam = params[0];
      const rows = this.db.tables.get(table) || [];
      const idx = rows.findIndex((r) => r.id === idParam);
      if (idx >= 0) {
        rows.splice(idx, 1);
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    const countMatch = this.sql.match(
      /^SELECT\s+COUNT\(\*\)\s+AS\s+C\s+FROM\s+([\w_]+)/i
    );
    if (countMatch) {
      const table = countMatch[1];
      const rows = this.db.tables.get(table) || [];
      return { c: rows.length };
    }

    const selectListMatch = this.sql.match(
      /^SELECT\s+id,\s*name,\s*updated_at,\s*meta\s+FROM\s+([\w_]+)/i
    );
    if (selectListMatch) {
      const table = selectListMatch[1];
      const rows = this.db.tables.get(table) || [];
      return rows.map((row) => ({
        id: row.id,
        name: row.name ?? null,
        updated_at: row.updated_at ?? null,
        meta: row.meta ?? null,
      }));
    }

    if (upper.startsWith('SELECT S.PLAN')) {
      const email = params[0];
      const subscribers = this.db.tables.get('subscribers') || [];
      const subsRow = subscribers.find((row) => row.email === email);
      if (!subsRow) return undefined;
      const subs = this.db.tables.get('subscriptions') || [];
      const matches = subs
        .filter((row) => row.subscriber_id === subsRow.id)
        .sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
      return matches[0]
        ? {
            plan: matches[0].plan,
            cycle: matches[0].cycle,
            status: matches[0].status,
          }
        : undefined;
    }

    if (upper.startsWith('SELECT ID FROM SUBSCRIBERS WHERE EMAIL')) {
      const email = params[0];
      const table = this.db.tables.get('subscribers') || [];
      return table.find((row) => row.email === email);
    }

    if (upper.startsWith('SELECT ID, NAME, MONTHLY_PRICE_CENTS')) {
      const rows = this.db.tables.get('plans') || [];
      return rows
        .filter((row) => Number(row.is_active ?? 1) === 1)
        .map((row) => ({ ...row }));
    }

    return mode === 'all' ? [] : undefined;
  }
}

function resolveValue(token, params, paramIdx) {
  if (token === '?') {
    return params[paramIdx];
  }
  if (/^datetime\(/i.test(token)) {
    return toIsoNow();
  }
  if (/^null$/i.test(token)) {
    return null;
  }
  if (/^'(.*)'$/.test(token) || /^"(.*)"$/.test(token)) {
    return stripQuotes(token);
  }
  const numeric = Number(token);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }
  return token;
}

function stripQuotes(str) {
  return str.replace(/^['"]|['"]$/g, '');
}

function createDatabase(dbPath) {
  if (NativeDatabase) {
    try {
      return new NativeDatabase(dbPath);
    } catch (err) {
      console.warn(
        `[sqlite] WARNING: better-sqlite3 failed to initialize (${err.message}); using in-memory stub`
      );
      NativeDatabase = null;
    }
  }
  return new MemoryDatabase(dbPath);
}

module.exports = { createDatabase, MemoryDatabase };
