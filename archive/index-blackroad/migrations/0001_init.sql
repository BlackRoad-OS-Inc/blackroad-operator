-- Repos table
CREATE TABLE IF NOT EXISTS repos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,          -- 'gitea' or 'github'
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  language TEXT DEFAULT '',
  default_branch TEXT DEFAULT 'main',
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  topics TEXT DEFAULT '[]',
  html_url TEXT NOT NULL,
  clone_url TEXT DEFAULT '',
  updated_at TEXT,
  indexed_at TEXT,
  UNIQUE(source, full_name)
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id INTEGER NOT NULL,
  path TEXT NOT NULL,
  content TEXT DEFAULT '',
  language TEXT DEFAULT '',
  size INTEGER DEFAULT 0,
  indexed_at TEXT,
  FOREIGN KEY (repo_id) REFERENCES repos(id) ON DELETE CASCADE,
  UNIQUE(repo_id, path)
);

-- Full-text search on repos
CREATE VIRTUAL TABLE IF NOT EXISTS repos_fts USING fts5(
  full_name,
  name,
  description,
  topics,
  content='repos',
  content_rowid='id'
);

-- FTS triggers for repos
CREATE TRIGGER IF NOT EXISTS repos_ai AFTER INSERT ON repos BEGIN
  INSERT INTO repos_fts(rowid, full_name, name, description, topics)
  VALUES (new.id, new.full_name, new.name, new.description, new.topics);
END;

CREATE TRIGGER IF NOT EXISTS repos_ad AFTER DELETE ON repos BEGIN
  INSERT INTO repos_fts(repos_fts, rowid, full_name, name, description, topics)
  VALUES ('delete', old.id, old.full_name, old.name, old.description, old.topics);
END;

CREATE TRIGGER IF NOT EXISTS repos_au AFTER UPDATE ON repos BEGIN
  INSERT INTO repos_fts(repos_fts, rowid, full_name, name, description, topics)
  VALUES ('delete', old.id, old.full_name, old.name, old.description, old.topics);
  INSERT INTO repos_fts(rowid, full_name, name, description, topics)
  VALUES (new.id, new.full_name, new.name, new.description, new.topics);
END;

-- Full-text search on files
CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
  path,
  content,
  content='files',
  content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS files_ai AFTER INSERT ON files BEGIN
  INSERT INTO files_fts(rowid, path, content)
  VALUES (new.id, new.path, new.content);
END;

CREATE TRIGGER IF NOT EXISTS files_ad AFTER DELETE ON files BEGIN
  INSERT INTO files_fts(files_fts, rowid, path, content)
  VALUES ('delete', old.id, old.path, old.content);
END;

CREATE TRIGGER IF NOT EXISTS files_au AFTER UPDATE ON files BEGIN
  INSERT INTO files_fts(files_fts, rowid, path, content)
  VALUES ('delete', old.id, old.path, old.content);
  INSERT INTO files_fts(rowid, path, content)
  VALUES (new.id, new.path, new.content);
END;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_repos_source ON repos(source);
CREATE INDEX IF NOT EXISTS idx_repos_language ON repos(language);
CREATE INDEX IF NOT EXISTS idx_files_repo ON files(repo_id);
CREATE INDEX IF NOT EXISTS idx_files_language ON files(language);
