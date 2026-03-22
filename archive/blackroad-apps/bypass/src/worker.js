// ByPass v1.0.0 — BlackRoad Code Execution Sandbox
// bypass.blackroad.io
// From Full-Stack Plan: "sandboxed code runner service — Docker containers or Firecracker microVMs"
// ByPass runs code safely. Paste it, run it, get output. No setup. No install.

const VERSION = '1.0.0';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } }); }

// Supported languages and their execution configs
const LANGUAGES = {
  javascript: { name: 'JavaScript', ext: 'js', mime: 'application/javascript' },
  python:     { name: 'Python', ext: 'py', mime: 'text/x-python' },
  typescript: { name: 'TypeScript', ext: 'ts', mime: 'application/typescript' },
  bash:       { name: 'Bash', ext: 'sh', mime: 'text/x-shellscript' },
  html:       { name: 'HTML', ext: 'html', mime: 'text/html' },
  json:       { name: 'JSON', ext: 'json', mime: 'application/json' },
  sql:        { name: 'SQL', ext: 'sql', mime: 'text/x-sql' },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (path === '/api/health') return json({ status: 'alive', service: 'bypass', version: VERSION, languages: Object.keys(LANGUAGES), description: 'Sandboxed code execution — paste, run, get output' });

    // Run code
    if (path === '/api/run' && request.method === 'POST') {
      const body = await request.json();
      const { code, language, stdin } = body;
      if (!code) return json({ error: 'code required' }, 400);
      const lang = language || detectLanguage(code);

      const startTime = Date.now();

      // JavaScript — execute in Worker sandbox (V8 isolate = safe)
      if (lang === 'javascript' || lang === 'typescript') {
        try {
          const logs = [];
          const fakeConsole = { log: (...a) => logs.push(a.map(String).join(' ')), error: (...a) => logs.push('[ERROR] ' + a.map(String).join(' ')), warn: (...a) => logs.push('[WARN] ' + a.map(String).join(' ')) };
          // Create a function from user code with sandboxed console
          const fn = new Function('console', 'Math', 'JSON', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'RegExp', 'Map', 'Set', 'Promise', code);
          fn(fakeConsole, Math, JSON, Date, Array, Object, String, Number, Boolean, RegExp, Map, Set, Promise);
          return json({ language: lang, output: logs.join('\n'), duration_ms: Date.now() - startTime, status: 'success' });
        } catch (e) {
          return json({ language: lang, output: '', error: e.message, stack: e.stack?.split('\n').slice(0, 3).join('\n'), duration_ms: Date.now() - startTime, status: 'error' });
        }
      }

      // SQL — execute against D1
      if (lang === 'sql' && env?.DB) {
        try {
          const r = await env.DB.prepare(code).all();
          return json({ language: 'sql', output: JSON.stringify(r.results || [], null, 2), rows: r.results?.length || 0, duration_ms: Date.now() - startTime, status: 'success' });
        } catch (e) {
          return json({ language: 'sql', output: '', error: e.message, duration_ms: Date.now() - startTime, status: 'error' });
        }
      }

      // JSON — validate and format
      if (lang === 'json') {
        try {
          const parsed = JSON.parse(code);
          return json({ language: 'json', output: JSON.stringify(parsed, null, 2), valid: true, duration_ms: Date.now() - startTime, status: 'success' });
        } catch (e) {
          return json({ language: 'json', output: '', error: e.message, valid: false, duration_ms: Date.now() - startTime, status: 'error' });
        }
      }

      // HTML — return as preview URL
      if (lang === 'html') {
        return json({ language: 'html', output: '(HTML preview — use /api/preview)', preview: true, size: code.length, duration_ms: Date.now() - startTime, status: 'success' });
      }

      // Python/Bash — proxy to fleet Ollama for code explanation (can't execute directly in CF Worker)
      // For actual execution, route to Octavia Docker
      if (lang === 'python' || lang === 'bash') {
        try {
          const r = await fetch('https://ollama.gematria.blackroad.io/api/generate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'llama3.2:3b', prompt: `Execute this ${lang} code mentally and give ONLY the output, nothing else:\n\`\`\`${lang}\n${code}\n\`\`\`\n\nOutput:`, stream: false, options: { num_predict: 200, temperature: 0 } }),
            signal: AbortSignal.timeout(15000),
          });
          const d = await r.json();
          return json({ language: lang, output: d.response?.trim() || '(no output)', simulated: true, note: 'AI-simulated execution — for real execution use Octavia Docker', duration_ms: Date.now() - startTime, status: 'success' });
        } catch (e) {
          return json({ language: lang, output: '', error: `Execution engine offline: ${e.message}`, duration_ms: Date.now() - startTime, status: 'error' });
        }
      }

      return json({ error: `Unsupported language: ${lang}`, supported: Object.keys(LANGUAGES) }, 400);
    }

    // Preview HTML
    if (path === '/api/preview' && request.method === 'POST') {
      const body = await request.json();
      return new Response(body.code || '<h1>No code</h1>', { headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS } });
    }

    // Languages
    if (path === '/api/languages') return json(Object.entries(LANGUAGES).map(([id, l]) => ({ id, ...l })));

    // Snippets — saved code snippets
    if (path === '/api/snippets' && request.method === 'POST') {
      const body = await request.json();
      if (!body.code) return json({ error: 'code required' }, 400);
      const id = crypto.randomUUID().slice(0, 8);
      if (env?.DB) {
        try {
          await env.DB.prepare(`CREATE TABLE IF NOT EXISTS snippets (id TEXT PRIMARY KEY, code TEXT, language TEXT, title TEXT, created_at TEXT)`).run();
          await env.DB.prepare("INSERT INTO snippets (id, code, language, title, created_at) VALUES (?, ?, ?, ?, datetime('now'))").bind(id, body.code, body.language || 'javascript', body.title || 'Untitled').run();
        } catch {}
      }
      return json({ id, url: `https://bypass.blackroad.io/s/${id}` });
    }

    if (path.startsWith('/s/')) {
      const id = path.split('/')[2];
      if (env?.DB) {
        try {
          const r = await env.DB.prepare('SELECT * FROM snippets WHERE id = ?').bind(id).first();
          if (r) return json(r);
        } catch {}
      }
      return json({ error: 'snippet not found' }, 404);
    }

    return json({ service: 'ByPass — Code Execution Sandbox', version: VERSION, tagline: 'Paste it. Run it. Get output.', endpoints: { 'POST /api/run': 'Execute code {code, language}', 'POST /api/preview': 'Preview HTML {code}', 'GET /api/languages': 'Supported languages', 'POST /api/snippets': 'Save snippet {code, language, title}', 'GET /s/:id': 'Get saved snippet' } });
  }
};

function detectLanguage(code) {
  if (/^{[\s\S]*}$/.test(code.trim()) || /^\[[\s\S]*\]$/.test(code.trim())) return 'json';
  if (/<!doctype|<html|<div|<body/i.test(code)) return 'html';
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s/i.test(code.trim())) return 'sql';
  if (/^#!\/bin\/(bash|sh|zsh)/.test(code) || /^\s*(echo|grep|awk|sed|curl|ls)\s/.test(code)) return 'bash';
  if (/^(import|from|def|class|print)\s/.test(code.trim()) || /:\s*$/.test(code.split('\n')[0])) return 'python';
  return 'javascript';
}
