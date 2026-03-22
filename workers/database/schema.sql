CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  url TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  metadata TEXT DEFAULT '{}',
  icon TEXT DEFAULT '',
  updated_at INTEGER NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(name, description, tags, type, content=items, content_rowid=id);

CREATE TRIGGER items_ai AFTER INSERT ON items BEGIN
  INSERT INTO items_fts(rowid, name, description, tags, type) VALUES (new.id, new.name, new.description, new.tags, new.type);
END;

CREATE TRIGGER items_ad AFTER DELETE ON items BEGIN
  INSERT INTO items_fts(items_fts, rowid, name, description, tags, type) VALUES ('delete', old.id, old.name, old.description, old.tags, old.type);
END;

CREATE TRIGGER items_au AFTER UPDATE ON items BEGIN
  INSERT INTO items_fts(items_fts, rowid, name, description, tags, type) VALUES ('delete', old.id, old.name, old.description, old.tags, old.type);
  INSERT INTO items_fts(rowid, name, description, tags, type) VALUES (new.id, new.name, new.description, new.tags, new.type);
END;
