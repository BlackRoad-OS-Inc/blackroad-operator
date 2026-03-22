CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  prompt TEXT DEFAULT '',
  negative_prompt TEXT DEFAULT '',
  provider TEXT DEFAULT '',
  model TEXT DEFAULT '',
  width INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  size INTEGER DEFAULT 0,
  format TEXT DEFAULT 'png',
  tags TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  source_node TEXT DEFAULT '',
  source_agent TEXT DEFAULT '',
  r2_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(r2_key)
);

CREATE VIRTUAL TABLE IF NOT EXISTS images_fts USING fts5(
  prompt,
  tags,
  filename,
  provider,
  model,
  content='images',
  content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS images_ai AFTER INSERT ON images BEGIN
  INSERT INTO images_fts(rowid, prompt, tags, filename, provider, model)
  VALUES (new.rowid, new.prompt, new.tags, new.filename, new.provider, new.model);
END;

CREATE TRIGGER IF NOT EXISTS images_ad AFTER DELETE ON images BEGIN
  INSERT INTO images_fts(images_fts, rowid, prompt, tags, filename, provider, model)
  VALUES ('delete', old.rowid, old.prompt, old.tags, old.filename, old.provider, old.model);
END;

CREATE INDEX IF NOT EXISTS idx_images_provider ON images(provider);
CREATE INDEX IF NOT EXISTS idx_images_model ON images(model);
CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at);
CREATE INDEX IF NOT EXISTS idx_images_source ON images(source_node);
