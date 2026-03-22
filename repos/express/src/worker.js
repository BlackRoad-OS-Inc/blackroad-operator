// Express v1.0.0 — BlackRoad One-Click Deploy
// express.blackroad.io
// From v4 Plan: "RoadSide — Connections & deploy portal, per-deployment fees"
// Express is the fast lane — deploy anything to any node in one API call.

const VERSION = '1.0.0';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } }); }

const FLEET = {
  alice:     { ip: '192.168.4.49',  services: ['nginx','pihole','postgres','redis'], ssh: 'pi@192.168.4.49' },
  octavia:   { ip: '192.168.4.101', services: ['gitea','docker','nats','workers'], ssh: 'pi@192.168.4.101' },
  lucidia:   { ip: '192.168.4.38',  services: ['nginx','powerdns','ollama'], ssh: 'blackroad@192.168.4.38' },
  gematria:  { ip: 'gematria',      services: ['caddy','ollama','powerdns'], ssh: 'root@gematria' },
};

const DEPLOY_TYPES = {
  worker:  { desc: 'Cloudflare Worker', cmd: 'npx wrangler deploy' },
  site:    { desc: 'Static site to Caddy', cmd: 'rsync -avz ./ {ssh}:/var/www/{name}/' },
  docker:  { desc: 'Docker container', cmd: 'ssh {ssh} "cd /opt/{name} && docker compose pull && docker compose up -d"' },
  script:  { desc: 'Run deploy script', cmd: 'ssh {ssh} "cd ~/repos/{name} && git pull && ./deploy.sh"' },
  git:     { desc: 'Git push to Gitea', cmd: 'git push roadcode main' },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (path === '/api/health') return json({ status: 'alive', service: 'express', version: VERSION, nodes: Object.keys(FLEET).length, deploy_types: Object.keys(DEPLOY_TYPES).length, description: 'One-click deploy to any fleet node' });

    // Deploy
    if (path === '/api/deploy' && request.method === 'POST') {
      const body = await request.json();
      const { name, node, type, repo, branch } = body;
      if (!name && !repo) return json({ error: 'name or repo required' }, 400);
      const projectName = name || repo?.split('/').pop();
      const targetNode = node || 'octavia';
      const deployType = type || 'worker';
      const target = FLEET[targetNode];
      if (!target) return json({ error: `Unknown node: ${targetNode}`, available: Object.keys(FLEET) }, 400);
      const tmpl = DEPLOY_TYPES[deployType];
      if (!tmpl) return json({ error: `Unknown type: ${deployType}`, available: Object.keys(DEPLOY_TYPES) }, 400);

      const command = tmpl.cmd.replace(/\{ssh\}/g, target.ssh).replace(/\{name\}/g, projectName);
      const deploy = { id: crypto.randomUUID().slice(0, 8), name: projectName, node: targetNode, type: deployType, branch: branch || 'main', command, target_ip: target.ip, timestamp: new Date().toISOString(), status: 'queued' };

      // Store deploy record
      if (env?.DB) {
        try {
          await env.DB.prepare(`CREATE TABLE IF NOT EXISTS deploys (id TEXT PRIMARY KEY, name TEXT, node TEXT, type TEXT, command TEXT, status TEXT, timestamp TEXT)`).run();
          await env.DB.prepare('INSERT INTO deploys (id, name, node, type, command, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(deploy.id, projectName, targetNode, deployType, command, 'queued', deploy.timestamp).run();
        } catch {}
      }

      // Notify Signal
      try {
        await fetch('https://signal.blackroad.io/api/publish', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: 'deploys', event: 'deploy.queued', data: deploy, source: 'express' }),
          signal: AbortSignal.timeout(3000),
        });
      } catch {}

      return json({ ok: true, deploy, message: `Deploy ${projectName} to ${targetNode} (${deployType}). Run: ${command}` });
    }

    // Deploy history
    if (path === '/api/deploys') {
      if (!env?.DB) return json({ deploys: [] });
      try {
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS deploys (id TEXT PRIMARY KEY, name TEXT, node TEXT, type TEXT, command TEXT, status TEXT, timestamp TEXT)`).run();
        const r = await env.DB.prepare('SELECT * FROM deploys ORDER BY timestamp DESC LIMIT 50').all();
        return json({ deploys: r.results || [] });
      } catch (e) { return json({ deploys: [], error: e.message }); }
    }

    // Fleet nodes
    if (path === '/api/nodes') return json(Object.entries(FLEET).map(([id, n]) => ({ id, ...n })));

    // Deploy types
    if (path === '/api/types') return json(Object.entries(DEPLOY_TYPES).map(([id, t]) => ({ id, ...t })));

    return json({ service: 'Express — One-Click Deploy', version: VERSION, tagline: 'Fast lane to production.', endpoints: { 'POST /api/deploy': 'Deploy {name, node, type, repo, branch}', 'GET /api/deploys': 'Deploy history', 'GET /api/nodes': 'Fleet nodes', 'GET /api/types': 'Deploy types' } });
  }
};
