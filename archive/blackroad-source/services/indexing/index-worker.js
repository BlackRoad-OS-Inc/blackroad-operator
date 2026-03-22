const LANG_MAP = {
  js: 'javascript', ts: 'typescript', py: 'python', rb: 'ruby', go: 'go',
  rs: 'rust', sh: 'shell', bash: 'shell', zsh: 'shell', md: 'markdown',
  json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml', css: 'css',
  html: 'html', sql: 'sql', c: 'c', h: 'c', cpp: 'cpp', java: 'java',
  jsx: 'javascript', tsx: 'typescript', vue: 'vue', svelte: 'svelte',
  dockerfile: 'docker', makefile: 'makefile',
};

function detectLang(path) {
  const ext = path.split('.').pop().toLowerCase();
  return LANG_MAP[ext] || ext;
}

// Truncate file content for indexing (keep first 50KB)
function truncate(text, max = 50000) {
  return text && text.length > max ? text.slice(0, max) : (text || '');
}

// ── GitHub API ──
async function fetchGitHubRepos(env) {
  const repos = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/users/${env.GITHUB_USER}/repos?per_page=100&page=${page}&sort=updated`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'index-blackroad',
        ...(env.GITHUB_TOKEN ? { Authorization: `token ${env.GITHUB_TOKEN}` } : {}),
      },
    });
    if (!res.ok) break;
    const data = await res.json();
    if (!data.length) break;
    repos.push(...data);
    page++;
  }
  return repos.map((r) => ({
    source: 'github',
    owner: r.owner.login,
    name: r.name,
    full_name: r.full_name,
    description: r.description || '',
    language: (r.language || '').toLowerCase(),
    default_branch: r.default_branch || 'main',
    stars: r.stargazers_count,
    forks: r.forks_count,
    topics: JSON.stringify(r.topics || []),
    html_url: r.html_url,
    clone_url: r.clone_url,
    updated_at: r.updated_at,
  }));
}

async function fetchGitHubTree(repo, env) {
  const url = `https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'index-blackroad',
      ...(env.GITHUB_TOKEN ? { Authorization: `token ${env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.tree || []).filter((f) => f.type === 'blob' && f.size < 200000);
}

async function fetchGitHubFile(repo, path, env) {
  const url = `https://api.github.com/repos/${repo.full_name}/contents/${encodeURIComponent(path)}?ref=${repo.default_branch}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'index-blackroad',
      Accept: 'application/vnd.github.v3.raw',
      ...(env.GITHUB_TOKEN ? { Authorization: `token ${env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) return null;
  return truncate(await res.text());
}

// ── Gitea API (via Cloudflare Tunnel or direct) ──
async function fetchGiteaRepos(env) {
  const base = env.GITEA_PUBLIC_URL || env.GITEA_URL;
  const repos = [];
  let page = 1;
  while (true) {
    const url = `${base}/api/v1/repos/search?limit=50&page=${page}&sort=updated`;
    const headers = {};
    if (env.GITEA_TOKEN) headers.Authorization = `token ${env.GITEA_TOKEN}`;
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) break;
      const body = await res.json();
      const data = body.data || body;
      if (!data.length) break;
      repos.push(...data);
      page++;
    } catch {
      break;
    }
  }
  return repos.map((r) => ({
    source: 'gitea',
    owner: r.owner?.login || r.owner?.username || '',
    name: r.name,
    full_name: r.full_name,
    description: r.description || '',
    language: (r.language || '').toLowerCase(),
    default_branch: r.default_branch || 'main',
    stars: r.stars_count || 0,
    forks: r.forks_count || 0,
    topics: JSON.stringify(r.topics || []),
    html_url: r.html_url,
    clone_url: r.clone_url,
    updated_at: r.updated_at,
  }));
}

async function fetchGiteaTree(repo, env) {
  const base = env.GITEA_PUBLIC_URL || env.GITEA_URL;
  const url = `${base}/api/v1/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=true`;
  const headers = {};
  if (env.GITEA_TOKEN) headers.Authorization = `token ${env.GITEA_TOKEN}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.tree || []).filter((f) => f.type === 'blob' && (f.size || 0) < 200000);
  } catch {
    return [];
  }
}

async function fetchGiteaFile(repo, path, env) {
  const base = env.GITEA_PUBLIC_URL || env.GITEA_URL;
  const url = `${base}/api/v1/repos/${repo.full_name}/raw/${encodeURIComponent(path)}?ref=${repo.default_branch}`;
  const headers = {};
  if (env.GITEA_TOKEN) headers.Authorization = `token ${env.GITEA_TOKEN}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return truncate(await res.text());
  } catch {
    return null;
  }
}

// ── Indexer ──
const INDEXABLE_EXTS = new Set([
  'js', 'ts', 'jsx', 'tsx', 'py', 'go', 'rs', 'rb', 'sh', 'bash', 'zsh',
  'c', 'h', 'cpp', 'java', 'sql', 'md', 'txt', 'json', 'yaml', 'yml',
  'toml', 'css', 'html', 'vue', 'svelte', 'dockerfile', 'makefile',
  'env', 'conf', 'cfg', 'ini', 'xml',
]);

function shouldIndex(path) {
  const name = path.split('/').pop().toLowerCase();
  if (['readme.md', 'readme', 'license', 'makefile', 'dockerfile'].includes(name)) return true;
  const ext = name.split('.').pop();
  return INDEXABLE_EXTS.has(ext);
}

// Index repo metadata only (fast — no file fetching)
async function indexRepoMeta(env, source) {
  const db = env.DB;
  const now = new Date().toISOString();
  const repos = source === 'github' ? await fetchGitHubRepos(env) : await fetchGiteaRepos(env);

  // Batch upsert using D1 batch API
  const stmts = repos.map((repo) =>
    db.prepare(`
      INSERT INTO repos (source, owner, name, full_name, description, language, default_branch, stars, forks, topics, html_url, clone_url, updated_at, indexed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source, full_name) DO UPDATE SET
        description=excluded.description, language=excluded.language,
        stars=excluded.stars, forks=excluded.forks, topics=excluded.topics,
        html_url=excluded.html_url, updated_at=excluded.updated_at, indexed_at=excluded.indexed_at
    `).bind(
      repo.source, repo.owner, repo.name, repo.full_name,
      repo.description, repo.language, repo.default_branch,
      repo.stars, repo.forks, repo.topics,
      repo.html_url, repo.clone_url, repo.updated_at, now,
    )
  );

  // D1 batch: up to 100 statements at a time
  for (let i = 0; i < stmts.length; i += 100) {
    await db.batch(stmts.slice(i, i + 100));
  }

  return repos.length;
}

// Index files for a batch of repos (offset/limit based)
async function indexRepoFiles(env, source, offset = 0, limit = 5) {
  const db = env.DB;
  const now = new Date().toISOString();

  const repos = await db.prepare(
    'SELECT id, full_name, default_branch, source FROM repos WHERE source = ? ORDER BY id LIMIT ? OFFSET ?'
  ).bind(source, limit, offset).all();

  let filesIndexed = 0;
  for (const repo of (repos.results || [])) {
    const tree = source === 'github'
      ? await fetchGitHubTree(repo, env)
      : await fetchGiteaTree(repo, env);

    const indexable = tree.filter((f) => shouldIndex(f.path));
    const toIndex = indexable.slice(0, 15); // cap per repo to stay in CPU budget

    const stmts = [];
    for (const file of toIndex) {
      const content = source === 'github'
        ? await fetchGitHubFile(repo, file.path, env)
        : await fetchGiteaFile(repo, file.path, env);

      if (content === null) continue;

      stmts.push(
        db.prepare(`
          INSERT INTO files (repo_id, path, content, language, size, indexed_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(repo_id, path) DO UPDATE SET
            content=excluded.content, language=excluded.language,
            size=excluded.size, indexed_at=excluded.indexed_at
        `).bind(repo.id, file.path, content, detectLang(file.path), file.size || content.length, now)
      );
    }

    if (stmts.length) {
      for (let i = 0; i < stmts.length; i += 100) {
        await db.batch(stmts.slice(i, i + 100));
      }
      filesIndexed += stmts.length;
    }
  }

  const total = await db.prepare('SELECT COUNT(*) as c FROM repos WHERE source = ?').bind(source).first();
  return { files_indexed: filesIndexed, repos_processed: (repos.results || []).length, total_repos: total?.c || 0, next_offset: offset + limit };
}

// ── Search ──
async function search(db, query, opts = {}) {
  const { type = 'all', language = '', source = '', page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;
  const results = { repos: [], files: [], total: 0, query, page };

  // Sanitize FTS query
  const ftsQuery = query.replace(/[^\w\s\-_.]/g, '').split(/\s+/).filter(Boolean).map((w) => `"${w}"`).join(' OR ');
  if (!ftsQuery) return results;

  if (type === 'all' || type === 'repos') {
    let sql = `
      SELECT r.*, repos_fts.rank
      FROM repos_fts
      JOIN repos r ON r.id = repos_fts.rowid
      WHERE repos_fts MATCH ?
    `;
    const params = [ftsQuery];
    if (language) { sql += ' AND r.language = ?'; params.push(language); }
    if (source) { sql += ' AND r.source = ?'; params.push(source); }
    sql += ' ORDER BY repos_fts.rank LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const res = await db.prepare(sql).bind(...params).all();
    results.repos = res.results || [];
  }

  if (type === 'all' || type === 'code') {
    let sql = `
      SELECT f.id, f.path, f.language, f.size, f.repo_id,
             snippet(files_fts, 1, '<mark>', '</mark>', '...', 40) as snippet,
             r.full_name, r.source, r.html_url,
             files_fts.rank
      FROM files_fts
      JOIN files f ON f.id = files_fts.rowid
      JOIN repos r ON r.id = f.repo_id
      WHERE files_fts MATCH ?
    `;
    const params = [ftsQuery];
    if (language) { sql += ' AND f.language = ?'; params.push(language); }
    if (source) { sql += ' AND r.source = ?'; params.push(source); }
    sql += ' ORDER BY files_fts.rank LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const res = await db.prepare(sql).bind(...params).all();
    results.files = res.results || [];
  }

  // Get total count
  const countRes = await db.prepare('SELECT COUNT(*) as c FROM repos').first();
  results.total_repos = countRes?.c || 0;
  const fileCount = await db.prepare('SELECT COUNT(*) as c FROM files').first();
  results.total_files = fileCount?.c || 0;

  return results;
}

// ── Stats ──
async function getStats(db) {
  const repos = await db.prepare('SELECT COUNT(*) as c FROM repos').first();
  const files = await db.prepare('SELECT COUNT(*) as c FROM files').first();
  const bySource = await db.prepare('SELECT source, COUNT(*) as c FROM repos GROUP BY source').all();
  const byLang = await db.prepare('SELECT language, COUNT(*) as c FROM repos WHERE language != "" GROUP BY language ORDER BY c DESC LIMIT 15').all();
  const recent = await db.prepare('SELECT full_name, source, description, language, updated_at FROM repos ORDER BY updated_at DESC LIMIT 10').all();
  return {
    total_repos: repos?.c || 0,
    total_files: files?.c || 0,
    by_source: bySource?.results || [],
    by_language: byLang?.results || [],
    recent: recent?.results || [],
  };
}

// ── HTML UI ──
function renderHTML(stats = null, results = null, query = '') {
  const statsHTML = stats ? `
    <div class="stats-bar">
      <span>${stats.total_repos} repos indexed</span>
      <span>${stats.total_files} files searchable</span>
      ${(stats.by_source || []).map((s) => `<span>${s.source}: ${s.c}</span>`).join('')}
    </div>
    <div class="lang-tags">
      ${(stats.by_language || []).map((l) => `<a href="?q=*&language=${l.language}" class="tag">${l.language} <small>${l.c}</small></a>`).join('')}
    </div>
  ` : '';

  const repoResults = results?.repos?.length ? `
    <h2>Repos (${results.repos.length})</h2>
    ${results.repos.map((r) => `
      <div class="result repo-result">
        <div class="result-header">
          <span class="source-badge ${r.source}">${r.source}</span>
          <a href="${r.html_url}" target="_blank" class="repo-name">${r.full_name}</a>
          ${r.language ? `<span class="lang-badge">${r.language}</span>` : ''}
          ${r.stars ? `<span class="stars">${r.stars}</span>` : ''}
        </div>
        <p class="description">${r.description || 'No description'}</p>
        ${r.topics && r.topics !== '[]' ? `<div class="topics">${JSON.parse(r.topics).map((t) => `<span class="topic">${t}</span>`).join('')}</div>` : ''}
      </div>
    `).join('')}
  ` : '';

  const fileResults = results?.files?.length ? `
    <h2>Code (${results.files.length})</h2>
    ${results.files.map((f) => `
      <div class="result file-result">
        <div class="result-header">
          <span class="source-badge ${f.source}">${f.source}</span>
          <a href="${f.html_url}/src/branch/main/${f.path}" target="_blank" class="file-path">${f.full_name}/${f.path}</a>
          <span class="lang-badge">${f.language}</span>
        </div>
        <pre class="snippet">${f.snippet || ''}</pre>
      </div>
    `).join('')}
  ` : '';

  const recentHTML = stats && !results ? `
    <h2>Recently Updated</h2>
    ${(stats.recent || []).map((r) => `
      <div class="result repo-result">
        <div class="result-header">
          <span class="source-badge ${r.source}">${r.source}</span>
          <span class="repo-name">${r.full_name}</span>
          ${r.language ? `<span class="lang-badge">${r.language}</span>` : ''}
        </div>
        <p class="description">${r.description || ''}</p>
        <small class="updated">Updated ${r.updated_at?.split('T')[0] || 'unknown'}</small>
      </div>
    `).join('')}
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>index.blackroad.io</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --grad: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF);
    --bg: #000; --card: #0a0a0a; --border: #222; --border-hover: #444;
    --text: #fff; --muted: #888; --dim: #555;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--bg); color: var(--text); font-family: 'Space Grotesk', -apple-system, sans-serif; min-height: 100vh; }
  .container { max-width: 960px; margin: 0 auto; padding: 20px; }

  /* ── Header ── */
  .header { text-align: center; padding: 48px 0 20px; position: relative; }
  .header h1 {
    font-family: 'Space Grotesk', sans-serif; font-size: 2.6rem; font-weight: 700;
    color: #f5f5f5;
  }
  .tagline { font-family: 'Space Grotesk'; font-size: 0.95rem; color: var(--muted); letter-spacing: 0.5px; margin: 4px 0; }
  .manifesto { font-family: 'Space Grotesk'; font-size: 0.72rem; color: var(--dim); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
  .header p { color: #666; font-size: 0.8rem; }
  .pulse { display: inline-block; width: 6px; height: 6px; background: #00D4FF; border-radius: 50%; animation: pulse 2s ease infinite; margin-right: 6px; vertical-align: middle; }
  @keyframes pulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,212,255,0.4); } 50% { opacity: 0.6; box-shadow: 0 0 0 8px rgba(0,212,255,0); } }

  /* ── Search ── */
  .search-wrap { position: relative; margin: 20px 0; }
  .search-box {
    display: flex; border: 1px solid #333; border-radius: 10px; overflow: hidden;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .search-box:focus-within { border-color: #FF2255; box-shadow: 0 0 20px rgba(255,34,85,0.15); }
  .search-box input {
    flex: 1; padding: 16px 20px; background: #0a0a0a; color: #fff; border: none; outline: none;
    font-size: 1rem; font-family: 'JetBrains Mono', monospace;
  }
  .search-box input::placeholder { color: #444; }
  .search-box button {
    padding: 16px 28px; background: var(--grad); color: #fff; border: none; cursor: pointer;
    font-weight: 600; font-size: 0.95rem; font-family: 'Space Grotesk'; transition: opacity 0.2s;
  }
  .search-box button:hover { opacity: 0.85; }
  .kbd-hint { position: absolute; right: 140px; top: 50%; transform: translateY(-50%); color: #333; font-size: 0.7rem; font-family: 'JetBrains Mono'; pointer-events: none; }
  .filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
  .filters select {
    padding: 8px 14px; background: #111; color: #aaa; border: 1px solid #1a1a1a; border-radius: 8px;
    font-size: 0.8rem; font-family: 'JetBrains Mono'; cursor: pointer; transition: border-color 0.2s;
  }
  .filters select:hover { border-color: #444; }
  .search-status { text-align: center; padding: 8px; color: #444; font-size: 0.75rem; font-family: 'JetBrains Mono'; min-height: 24px; }
  .loading { display: none; }
  .loading.active { display: block; }
  .loading .bar { height: 2px; background: var(--grad); border-radius: 2px; animation: loadBar 1s ease infinite; }
  @keyframes loadBar { 0% { width: 0; } 50% { width: 70%; } 100% { width: 100%; opacity: 0; } }

  /* ── Stats ── */
  .stats-bar {
    display: flex; gap: 24px; justify-content: center; padding: 14px 0; color: var(--muted);
    font-size: 0.8rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    margin-bottom: 16px; font-family: 'JetBrains Mono';
  }
  .stats-bar span { transition: color 0.2s; cursor: default; }
  .stats-bar span:hover { color: #fff; }
  .stat-num { color: #f5f5f5; font-weight: 600; }
  .lang-tags { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 20px; }
  .tag {
    padding: 5px 14px; background: #111; border: 1px solid #1a1a1a; border-radius: 16px;
    color: #aaa; text-decoration: none; font-size: 0.78rem; font-family: 'JetBrains Mono';
    cursor: pointer; transition: all 0.2s; user-select: none;
  }
  .tag:hover { border-color: #FF2255; color: #fff; transform: translateY(-1px); }
  .tag.active { border-color: #8844FF; color: #f5f5f5; background: #8844FF11; }
  .tag small { color: #444; margin-left: 4px; }

  /* ── Results ── */
  #results { min-height: 200px; }
  .result {
    border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; margin-bottom: 10px;
    background: var(--card); transition: all 0.25s ease; cursor: pointer; position: relative; overflow: hidden;
    animation: fadeSlide 0.3s ease both;
  }
  .result::before {
    content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%;
    background: var(--grad); opacity: 0; transition: opacity 0.2s;
  }
  .result:hover { border-color: var(--border-hover); transform: translateX(4px); }
  .result:hover::before { opacity: 1; }
  .result.selected { border-color: #8844FF; background: #8844FF08; }
  @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .result-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
  .source-badge {
    padding: 3px 10px; border-radius: 5px; font-size: 0.65rem; font-weight: 600;
    text-transform: uppercase; font-family: 'JetBrains Mono'; letter-spacing: 0.5px;
  }
  /* ── Shared Nav ── */
  .topnav {
    display: flex; align-items: center; justify-content: space-between; padding: 12px 24px;
    border-bottom: 1px solid #111; position: sticky; top: 0; background: rgba(0,0,0,0.92);
    backdrop-filter: blur(12px); z-index: 100;
  }
  .topnav-brand { font-family: 'Space Grotesk'; font-weight: 700; font-size: 0.85rem; color: #fff; text-decoration: none; }
  .topnav-brand span { color: #f5f5f5; }
  .topnav-links { display: flex; gap: 4px; align-items: center; }
  .topnav-links a {
    padding: 5px 12px; border-radius: 6px; font-size: 0.72rem; font-family: 'JetBrains Mono';
    color: #555; text-decoration: none; transition: all 0.2s; border: 1px solid transparent;
  }
  .topnav-links a:hover { color: #fff; border-color: #333; background: #111; }
  .topnav-links a.active { color: #fff; border-color: #FF225533; background: #FF225508; }
  .topnav-sep { width: 1px; height: 14px; background: #222; margin: 0 4px; }

  /* ── Blacklinks ── */
  .result-backlinks, .blacklinks {
    display: flex; gap: 6px; margin-top: 8px; padding-top: 6px; border-top: 1px solid #111; flex-wrap: wrap; align-items: center;
  }
  .blacklinks-label {
    font-family: 'JetBrains Mono'; font-size: 0.55rem; color: #222; text-transform: uppercase; letter-spacing: 1px; margin-right: 2px;
  }
  .result-backlinks a, .blacklinks a, .bl {
    font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #444; text-decoration: none;
    padding: 2px 8px; border: 1px solid #1a1a1a; border-radius: 4px; transition: all 0.2s;
  }
  .result-backlinks a:hover, .blacklinks a:hover, .bl:hover { color: #ccc; border-color: #4488FF33; background: #4488FF08; }
  .bl-portal { border-color: #FF225518 !important; color: #999 !important; }
  .bl-portal::before { content: ''; display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #FF2255; margin-right: 4px; vertical-align: middle; }
  .bl-portal:hover { background: #FF225508 !important; border-color: #FF225533 !important; color: #ccc !important; }
  .bl-index { border-color: #4488FF18 !important; color: #999 !important; }
  .bl-index::before { content: ''; display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #4488FF; margin-right: 4px; vertical-align: middle; }
  .bl-index:hover { background: #4488FF08 !important; border-color: #4488FF33 !important; color: #ccc !important; }
  .bl-images { border-color: #CC00AA18 !important; color: #999 !important; }
  .bl-images::before { content: ''; display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #CC00AA; margin-right: 4px; vertical-align: middle; }
  .bl-images:hover { background: #CC00AA08 !important; border-color: #CC00AA33 !important; color: #ccc !important; }
  .bl-git { border-color: #7bc43c18 !important; color: #999 !important; }
  .bl-git::before { content: ''; display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #7bc43c; margin-right: 4px; vertical-align: middle; }
  .bl-git:hover { background: #7bc43c08 !important; border-color: #7bc43c33 !important; color: #ccc !important; }
  .bl-lang { border-color: #8844FF18 !important; color: #999 !important; }
  .bl-lang::before { content: ''; display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #8844FF; margin-right: 4px; vertical-align: middle; }
  .bl-lang:hover { background: #8844FF08 !important; border-color: #8844FF33 !important; color: #ccc !important; }
  .bl-ext { border-color: #00D4FF18 !important; color: #999 !important; }
  .bl-ext::before { content: ''; display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #00D4FF; margin-right: 4px; vertical-align: middle; }
  .bl-ext:hover { background: #00D4FF08 !important; border-color: #00D4FF33 !important; color: #ccc !important; }
  .bl-owner { border-color: #FF6B2B18 !important; color: #999 !important; }
  .bl-owner::before { content: ''; display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #FF6B2B; margin-right: 4px; vertical-align: middle; }
  .bl-owner:hover { background: #FF6B2B08 !important; border-color: #FF6B2B33 !important; color: #ccc !important; }
  .bl-sep { display: inline-block; width: 1px; height: 10px; background: #1a1a1a; }

  .source-badge.github { border: 1px solid #444; color: #999; }
  .source-badge.gitea { border: 1px solid #609926; color: #999; }
  .repo-name { font-family: 'JetBrains Mono'; color: #f5f5f5; text-decoration: none; font-weight: 600; transition: color 0.2s; border-bottom: 1px solid #4488FF; }
  .repo-name:hover { color: #fff; border-bottom-color: #00D4FF; }
  .file-path { font-family: 'JetBrains Mono'; color: #ccc; text-decoration: none; font-size: 0.85rem; transition: color 0.2s; border-bottom: 1px solid #CC00AA; }
  .file-path:hover { color: #fff; border-bottom-color: #FF2255; }
  .lang-badge { padding: 3px 10px; border-radius: 5px; font-size: 0.65rem; border: 1px solid #1a1a1a; color: #777; font-family: 'JetBrains Mono'; }
  .stars { color: #ccc; font-size: 0.8rem; }
  .stars::before { content: '\\2605 '; }
  .description { color: #999; font-size: 0.82rem; line-height: 1.5; }
  .topics { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
  .topic { padding: 3px 10px; background: #1a1a2e; border-radius: 12px; font-size: 0.68rem; color: #aaa; font-family: 'JetBrains Mono'; border-left: 2px solid #8844FF; }
  .snippet {
    background: #0a0a0a; padding: 14px; border-radius: 8px; font-size: 0.78rem; overflow-x: auto;
    line-height: 1.6; font-family: 'JetBrains Mono'; color: #bbb; border: 1px solid #1a1a1a;
    max-height: 200px; transition: max-height 0.3s;
  }
  .snippet:hover { max-height: 600px; }
  .snippet mark { background: rgba(255,34,85,0.15); color: #f5f5f5; padding: 1px 3px; border-radius: 3px; border-bottom: 1px solid #FF2255; }
  .updated { color: var(--dim); font-size: 0.75rem; }
  h2 {
    font-family: 'Space Grotesk'; font-size: 1rem; color: var(--muted); font-weight: 600;
    border-bottom: 1px solid var(--border); padding-bottom: 8px; margin: 28px 0 14px;
    display: flex; align-items: center; gap: 8px;
  }
  h2 .count { color: #f5f5f5; font-size: 0.85rem; }

  /* ── API Panel ── */
  .api-toggle {
    background: none; border: 1px solid #222; color: #555; padding: 8px 16px; border-radius: 8px;
    font-size: 0.75rem; cursor: pointer; font-family: 'JetBrains Mono'; transition: all 0.2s;
    display: block; margin: 30px auto 0; width: fit-content;
  }
  .api-toggle:hover { border-color: #444; color: #aaa; }
  .api-panel {
    max-height: 0; overflow: hidden; transition: max-height 0.4s ease;
    margin-top: 10px; border: 1px solid transparent; border-radius: 8px;
  }
  .api-panel.open { max-height: 300px; border-color: #222; }
  .api-panel-inner { padding: 16px; color: #555; font-size: 0.78rem; }
  .api-panel code { background: #111; padding: 3px 8px; border-radius: 4px; font-family: 'JetBrains Mono'; color: #888; }

  /* ── Footer ── */
  .footer {
    text-align: center; margin-top: 40px; padding: 28px 0; border-top: 1px solid var(--border);
    font-family: 'Space Grotesk'; line-height: 1.9;
  }
  .footer .l1 { font-size: 0.85rem; color: #555; }
  .footer .l2 { font-size: 0.78rem; color: #444; }
  .footer .l3 { font-size: 0.65rem; color: #333; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }

  /* ── No results ── */
  .empty { text-align: center; padding: 60px 20px; }
  .empty h3 { font-family: 'Space Grotesk'; color: #333; font-size: 1.1rem; margin-bottom: 8px; }
  .empty p { color: #333; font-size: 0.85rem; }

  @media (max-width: 600px) {
    .header h1 { font-size: 1.8rem; }
    .search-box input { padding: 14px; }
    .stats-bar { gap: 12px; font-size: 0.7rem; }
    .kbd-hint { display: none; }
  }
</style>
</head>
<body>
<nav class="topnav">
  <a href="https://portal.blackroad.io" class="topnav-brand"><span>BlackRoad</span></a>
  <div class="topnav-links">
    <a href="https://portal.blackroad.io">portal</a>
    <div class="topnav-sep"></div>
    <a href="/" class="active">index</a>
    <a href="https://images.blackroad.io">images</a>
    <div class="topnav-sep"></div>
    <a href="https://git.blackroad.io">git</a>
    <a href="https://chat.blackroad.io">chat</a>
    <a href="https://docs.blackroad.io">docs</a>
    <a href="https://api.blackroad.io">api</a>
  </div>
</nav>
<div class="container">
  <div class="header">
    <h1>index.blackroad.io</h1>
    <div class="tagline">Ride the BlackRoad.</div>
    <div class="manifesto">Remember the Road &middot; Pave Tomorrow</div>
    <p><span class="pulse"></span><span class="stat-num" id="repoCount">${stats?.total_repos || 0}</span> repos &middot; <span class="stat-num" id="fileCount">${stats?.total_files || 0}</span> files &middot; Gitea + GitHub</p>
  </div>

  <div class="search-wrap">
    <div class="search-box">
      <input type="text" id="searchInput" value="${query}" placeholder="Search repos, code, docs..." autofocus>
      <button type="button" id="searchBtn">Search</button>
    </div>
    <span class="kbd-hint" id="kbdHint">/</span>
  </div>

  <div class="filters">
    <select id="filterType">
      <option value="all">All</option>
      <option value="repos">Repos</option>
      <option value="code">Code</option>
    </select>
    <select id="filterSource">
      <option value="">All Sources</option>
      <option value="github">GitHub</option>
      <option value="gitea">Gitea</option>
    </select>
    <select id="filterLang">
      <option value="">All Languages</option>
      ${(stats?.by_language || []).map((l) => `<option value="${l.language}">${l.language} (${l.c})</option>`).join('')}
    </select>
  </div>

  <div class="loading" id="loading"><div class="bar"></div></div>
  <div class="search-status" id="searchStatus"></div>

  <div class="stats-bar" id="statsBar">
    ${(stats?.by_source || []).map((s) => `<span>${s.source}: <span class="stat-num">${s.c}</span></span>`).join('')}
    <span><span class="stat-num">${(stats?.by_language || []).length}</span> languages</span>
  </div>

  <div class="lang-tags" id="langTags">
    ${(stats?.by_language || []).map((l) => `<span class="tag" data-lang="${l.language}">${l.language} <small>${l.c}</small></span>`).join('')}
  </div>

  <div id="results">
    ${repoResults}
    ${fileResults}
    ${recentHTML}
  </div>

  <button class="api-toggle" id="apiToggle">API Reference</button>
  <div class="api-panel" id="apiPanel">
    <div class="api-panel-inner">
      <code>GET /api/search?q=query&type=all|repos|code&language=python&source=github</code><br><br>
      <code>GET /api/stats</code><br><br>
      <code>POST /api/index?source=github|gitea</code> &mdash; trigger re-index<br><br>
      <code>POST /api/webhook</code> &mdash; Gitea/GitHub push webhook
    </div>
  </div>

  <div class="footer">
    <div class="l1">Pick up your agent. Ride the BlackRoad together.</div>
    <div class="l2">Remember the Road. Pave Tomorrow.</div>
    <div class="l3">The Prompt Legend of All Time</div>
    <div style="margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <a href="https://portal.blackroad.io" class="bl bl-portal" style="text-decoration:none">portal</a>
      <a href="https://images.blackroad.io" class="bl bl-images" style="text-decoration:none">images</a>
      <a href="https://git.blackroad.io" class="bl bl-git" style="text-decoration:none">git</a>
      <a href="https://chat.blackroad.io" style="color:#555;font-size:0.6rem;text-decoration:none;font-family:JetBrains Mono;padding:2px 8px;border:1px solid #1a1a1a;border-radius:4px;transition:all 0.2s" onmouseover="this.style.color='#ccc';this.style.borderColor='#4488FF33'" onmouseout="this.style.color='#555';this.style.borderColor='#1a1a1a'">chat</a>
      <a href="https://docs.blackroad.io" style="color:#555;font-size:0.6rem;text-decoration:none;font-family:JetBrains Mono;padding:2px 8px;border:1px solid #1a1a1a;border-radius:4px;transition:all 0.2s" onmouseover="this.style.color='#ccc';this.style.borderColor='#4488FF33'" onmouseout="this.style.color='#555';this.style.borderColor='#1a1a1a'">docs</a>
      <a href="https://github.com/blackboxprogramming" style="color:#555;font-size:0.6rem;text-decoration:none;font-family:JetBrains Mono;padding:2px 8px;border:1px solid #1a1a1a;border-radius:4px;transition:all 0.2s" onmouseover="this.style.color='#ccc';this.style.borderColor='#4488FF33'" onmouseout="this.style.color='#555';this.style.borderColor='#1a1a1a'">github</a>
    </div>
    <div style="margin-top:8px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <a href="https://fleet.blackroad.io" style="color:#333;font-size:0.55rem;text-decoration:none;font-family:JetBrains Mono;padding:2px 8px;border:1px solid #111;border-radius:4px;transition:all 0.2s" onmouseover="this.style.color='#999';this.style.borderColor='#333'" onmouseout="this.style.color='#333';this.style.borderColor='#111'">fleet</a>
      <a href="https://mesh.blackroad.io" style="color:#333;font-size:0.55rem;text-decoration:none;font-family:JetBrains Mono;padding:2px 8px;border:1px solid #111;border-radius:4px;transition:all 0.2s" onmouseover="this.style.color='#999';this.style.borderColor='#333'" onmouseout="this.style.color='#333';this.style.borderColor='#111'">mesh</a>
      <a href="https://mcp.blackroad.io" style="color:#333;font-size:0.55rem;text-decoration:none;font-family:JetBrains Mono;padding:2px 8px;border:1px solid #111;border-radius:4px;transition:all 0.2s" onmouseover="this.style.color='#999';this.style.borderColor='#333'" onmouseout="this.style.color='#333';this.style.borderColor='#111'">mcp</a>
      <a href="https://os.blackroad.io" style="color:#333;font-size:0.55rem;text-decoration:none;font-family:JetBrains Mono;padding:2px 8px;border:1px solid #111;border-radius:4px;transition:all 0.2s" onmouseover="this.style.color='#999';this.style.borderColor='#333'" onmouseout="this.style.color='#333';this.style.borderColor='#111'">os</a>
      <a href="https://brand.blackroad.io" style="color:#333;font-size:0.55rem;text-decoration:none;font-family:JetBrains Mono;padding:2px 8px;border:1px solid #111;border-radius:4px;transition:all 0.2s" onmouseover="this.style.color='#999';this.style.borderColor='#333'" onmouseout="this.style.color='#333';this.style.borderColor='#111'">brand</a>
    </div>
  </div>
</div>

<script>
const $=s=>document.querySelector(s);
const input=$('#searchInput'), btn=$('#searchBtn'), results=$('#results');
const filterType=$('#filterType'), filterSource=$('#filterSource'), filterLang=$('#filterLang');
const loading=$('#loading'), status=$('#searchStatus'), kbdHint=$('#kbdHint');
let debounceTimer, selectedIdx=-1;

// Live search
function doSearch() {
  const q = input.value.trim();
  if (!q) { location.href='/'; return; }
  const params = new URLSearchParams({q, type: filterType.value, source: filterSource.value, language: filterLang.value});
  loading.classList.add('active');
  status.textContent='Searching...';
  history.replaceState(null,'','/?'+params);

  fetch('/api/search?'+params).then(r=>r.json()).then(data=>{
    loading.classList.remove('active');
    selectedIdx=-1;
    let html='';
    const repos=data.repos||[], files=data.files||[];
    if(repos.length){
      html+='<h2>Repos <span class="count">'+repos.length+'</span></h2>';
      repos.forEach((r,i)=>{
        const topics=r.topics&&r.topics!=='[]'?JSON.parse(r.topics):[];
        html+='<div class="result repo-result" data-idx="'+i+'" data-url="'+r.html_url+'" style="animation-delay:'+(i*0.04)+'s">'
          +'<div class="result-header">'
          +'<span class="source-badge '+r.source+'">'+r.source+'</span>'
          +'<a href="'+r.html_url+'" target="_blank" class="repo-name">'+r.full_name+'</a>'
          +(r.language?'<span class="lang-badge">'+r.language+'</span>':'')
          +(r.stars?'<span class="stars">'+r.stars+'</span>':'')
          +'</div>'
          +'<p class="description">'+(r.description||'No description')+'</p>'
          +(topics.length?'<div class="topics">'+topics.map(t=>'<span class="topic">'+t+'</span>').join('')+'</div>':'')
          +'<div class="blacklinks"><span class="blacklinks-label">blacklinks</span>'
          +'<a href="https://portal.blackroad.io/?q='+encodeURIComponent(r.full_name)+'" target="_blank" class="bl bl-portal">portal/'+r.name+'</a>'
          +'<a href="'+r.html_url+'" target="_blank" class="bl bl-'+(r.source==='gitea'?'git':'owner')+'">'+r.source+'</a>'
          +(r.source==='gitea'?'<a href="https://git.blackroad.io/'+r.full_name+'" target="_blank" class="bl bl-git">gitea/'+r.name+'</a>':'')
          +'<a href="https://images.blackroad.io/?q='+encodeURIComponent(r.name)+'" target="_blank" class="bl bl-images">images/'+r.name+'</a>'
          +'<span class="bl-sep"></span>'
          +'<a href="https://portal.blackroad.io/?q='+encodeURIComponent(r.full_name.split("/")[0]||"")+'" target="_blank" class="bl bl-owner">@'+(r.full_name.split("/")[0]||"")+'</a>'
          +(r.language?'<a href="/?q='+encodeURIComponent(r.language)+'&type=repos&language='+encodeURIComponent(r.language)+'" class="bl bl-lang">lang:'+r.language+'</a>':'')
          +'<a href="/?q='+encodeURIComponent(r.name)+'&type=code" class="bl bl-ext">code/'+r.name+'</a>'
          +'</div>'
          +'</div>';
      });
    }
    if(files.length){
      html+='<h2>Code <span class="count">'+files.length+'</span></h2>';
      files.forEach((f,i)=>{
        html+='<div class="result file-result" data-idx="'+(repos.length+i)+'" style="animation-delay:'+((repos.length+i)*0.04)+'s">'
          +'<div class="result-header">'
          +'<span class="source-badge '+f.source+'">'+f.source+'</span>'
          +'<a href="'+f.html_url+'/src/branch/main/'+f.path+'" target="_blank" class="file-path">'+f.full_name+'/'+f.path+'</a>'
          +'<span class="lang-badge">'+f.language+'</span>'
          +'</div>'
          +'<pre class="snippet">'+(f.snippet||'')+'</pre>'
          +'<div class="blacklinks"><span class="blacklinks-label">blacklinks</span>'
          +'<a href="https://portal.blackroad.io/?q='+encodeURIComponent(f.name||f.full_name)+'" target="_blank" class="bl bl-portal">portal/'+(f.name||f.full_name.split("/")[1]||"")+'</a>'
          +'<a href="/?q='+encodeURIComponent(f.full_name)+'&type=repos" class="bl bl-index">repo/'+(f.full_name.split("/")[1]||"")+'</a>'
          +'<a href="/?q='+encodeURIComponent(f.path.split("/").pop())+'&type=code" class="bl bl-ext">file/'+f.path.split("/").pop()+'</a>'
          +'<a href="https://images.blackroad.io/?q='+encodeURIComponent(f.path.split("/").pop().split(".")[0]||"")+'" target="_blank" class="bl bl-images">images</a>'
          +'<span class="bl-sep"></span>'
          +(f.language?'<a href="/?q=*.'+encodeURIComponent(f.path.split(".").pop()||"")+'&type=code" class="bl bl-lang">*.'+f.path.split(".").pop()+'</a>':'')
          +'<a href="/?q='+encodeURIComponent(f.path.split("/").slice(0,-1).pop()||"")+'&type=code" class="bl bl-ext">dir/'+f.path.split("/").slice(0,-1).pop()+'</a>'
          +(f.source==='gitea'?'<a href="https://git.blackroad.io/'+f.full_name+'/src/branch/main/'+f.path+'" target="_blank" class="bl bl-git">raw</a>':'')
          +'</div>'
          +'</div>';
      });
    }
    if(!repos.length&&!files.length){
      html='<div class="empty"><h3>No results for "'+q+'"</h3><p>Try different keywords or filters</p></div>';
    }
    results.innerHTML=html;
    status.textContent=repos.length+' repos, '+files.length+' files';

    // Click to open
    results.querySelectorAll('.result').forEach(el=>{
      el.addEventListener('click',e=>{
        if(e.target.tagName==='A') return;
        const a=el.querySelector('a');
        if(a) window.open(a.href,'_blank');
      });
    });
  }).catch(()=>{
    loading.classList.remove('active');
    status.textContent='Search failed';
  });
}

// Debounced live search
input.addEventListener('input',()=>{
  kbdHint.style.display='none';
  clearTimeout(debounceTimer);
  debounceTimer=setTimeout(()=>{
    if(input.value.trim().length>=2) doSearch();
    else if(!input.value.trim()) { status.textContent=''; }
  },300);
});
btn.addEventListener('click',doSearch);
input.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();doSearch();}
  // Arrow key nav through results
  const items=results.querySelectorAll('.result');
  if(e.key==='ArrowDown'&&items.length){e.preventDefault();selectedIdx=Math.min(selectedIdx+1,items.length-1);highlightResult(items);}
  if(e.key==='ArrowUp'&&items.length){e.preventDefault();selectedIdx=Math.max(selectedIdx-1,-1);highlightResult(items);}
  if(e.key==='Enter'&&selectedIdx>=0&&items[selectedIdx]){
    const a=items[selectedIdx].querySelector('a');
    if(a) window.open(a.href,'_blank');
  }
});

function highlightResult(items){
  items.forEach((el,i)=>{el.classList.toggle('selected',i===selectedIdx);});
  if(selectedIdx>=0&&items[selectedIdx]) items[selectedIdx].scrollIntoView({block:'nearest',behavior:'smooth'});
}

// Filters trigger search
[filterType,filterSource,filterLang].forEach(el=>el.addEventListener('change',()=>{if(input.value.trim())doSearch();}));

// Language tag click
document.querySelectorAll('.tag[data-lang]').forEach(tag=>{
  tag.addEventListener('click',()=>{
    const lang=tag.dataset.lang;
    document.querySelectorAll('.tag').forEach(t=>t.classList.remove('active'));
    if(filterLang.value===lang){filterLang.value='';} else {filterLang.value=lang;tag.classList.add('active');}
    if(input.value.trim()) doSearch();
    else { input.value='*'; doSearch(); }
  });
});

// Keyboard shortcut: / to focus search
document.addEventListener('keydown',e=>{
  if(e.key==='/'&&document.activeElement!==input){e.preventDefault();input.focus();input.select();}
  if(e.key==='Escape'){input.blur();selectedIdx=-1;results.querySelectorAll('.result').forEach(r=>r.classList.remove('selected'));}
});

// API panel toggle
$('#apiToggle').addEventListener('click',()=>$('#apiPanel').classList.toggle('open'));

// Click results
results.querySelectorAll('.result').forEach(el=>{
  el.addEventListener('click',e=>{
    if(e.target.tagName==='A') return;
    const a=el.querySelector('a');
    if(a) window.open(a.href,'_blank');
  });
});

// Initial state
if('${query}') { status.textContent='Showing results for "${query}"'; }
input.addEventListener('focus',()=>{kbdHint.style.display='none';});
input.addEventListener('blur',()=>{if(!input.value)kbdHint.style.display='';});
</script>
</body>
</html>`;
}

// ── Request Handler ──
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API: Search
      if (path === '/api/search') {
        const q = url.searchParams.get('q') || '';
        const type = url.searchParams.get('type') || 'all';
        const language = url.searchParams.get('language') || '';
        const source = url.searchParams.get('source') || '';
        const page = parseInt(url.searchParams.get('page') || '1');
        const results = await search(env.DB, q, { type, language, source, page });
        return Response.json(results, { headers: corsHeaders });
      }

      // API: Health
      if (path === '/api/health') {
        return Response.json({ status: 'up', service: 'index-blackroad', version: '1.0.0' }, { headers: corsHeaders });
      }

      // API: Stats
      if (path === '/api/stats') {
        const stats = await getStats(env.DB);
        return Response.json(stats, { headers: corsHeaders });
      }

      // API: Index repo metadata (phase 1 — fast)
      if (path === '/api/index' && request.method === 'POST') {
        const source = url.searchParams.get('source') || 'github';
        const count = await indexRepoMeta(env, source);
        return Response.json({ ok: true, source, repos_indexed: count }, { headers: corsHeaders });
      }

      // API: Index files batch (phase 2 — call repeatedly with offset)
      if (path === '/api/index-files' && request.method === 'POST') {
        const source = url.searchParams.get('source') || 'github';
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const limit = parseInt(url.searchParams.get('limit') || '5');
        const result = await indexRepoFiles(env, source, offset, limit);
        return Response.json({ ok: true, source, ...result }, { headers: corsHeaders });
      }

      // API: Webhook (Gitea or GitHub push events) — just re-index metadata
      if (path === '/api/webhook' && request.method === 'POST') {
        const body = await request.json();
        const repoName = body.repository?.full_name;
        if (repoName) {
          const source = body.repository?.html_url?.includes('github.com') ? 'github' : 'gitea';
          await indexRepoMeta(env, source);
        }
        return Response.json({ ok: true }, { headers: corsHeaders });
      }

      // HTML UI
      if (path === '/' || path === '') {
        const q = url.searchParams.get('q') || '';
        const stats = await getStats(env.DB);
        let results = null;
        if (q) {
          const type = url.searchParams.get('type') || 'all';
          const language = url.searchParams.get('language') || '';
          const source = url.searchParams.get('source') || '';
          results = await search(env.DB, q, { type, language, source });
        }
        return new Response(renderHTML(stats, results, q), {
          headers: { 'Content-Type': 'text/html;charset=utf-8', ...corsHeaders },
        });
      }

      return new Response('Not found', { status: 404 });
    } catch (err) {
      console.error(err);
      return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
  },

  // Cron handler — re-index metadata every 30 minutes
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      console.log('[cron] Indexing GitHub repo metadata...');
      const gh = await indexRepoMeta(env, 'github');
      console.log(`[cron] GitHub: ${gh} repos indexed`);

      // Index files for 5 repos per cron run (rolling window)
      // Use a simple modulo based on timestamp to rotate through repos
      const batch = Math.floor(Date.now() / 1800000) % 100; // changes every 30min
      const offset = (batch * 5) % Math.max(gh, 1);
      const files = await indexRepoFiles(env, 'github', offset, 5);
      console.log(`[cron] GitHub files: ${files.files_indexed} files from offset ${offset}`);
    })());
  },
};
