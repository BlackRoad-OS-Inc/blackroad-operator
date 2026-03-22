const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const crypto = require('crypto');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'web')));

// ── Config ──────────────────────────────────────────────────
const DATA_DIR = process.env.ROADWAY_DATA || path.join(__dirname, '..', 'data');
const APPS_DIR = path.join(DATA_DIR, 'apps');
const BUILDS_DIR = path.join(DATA_DIR, 'builds');
const LOGS_DIR = path.join(DATA_DIR, 'logs');
const PORT = process.env.PORT || 4400;
const DOMAIN = process.env.ROADWAY_DOMAIN || 'roadway.blackroad.io';
const BUILDPACKS_DIR = path.join(__dirname, '..', 'buildpacks', 'dockerfiles');
const DETECT_SCRIPT = path.join(__dirname, '..', 'buildpacks', 'detect.sh');
const FLEET_FILE = path.join(DATA_DIR, 'fleet-apps.json');

[DATA_DIR, APPS_DIR, BUILDS_DIR, LOGS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ── Fleet Config ────────────────────────────────────────────
const FLEET_NODES = {
  alice:      { ip: '192.168.4.49',  user: 'pi',        role: 'gateway' },
  octavia:    { ip: '192.168.4.101', user: 'pi',        role: 'compute/workers' },
  lucidia:    { ip: '192.168.4.38',  user: 'blackroad', role: 'web-apps/ai' },
  aria:       { ip: '192.168.4.98',  user: 'blackroad', role: 'compute' },
  cecilia:    { ip: '192.168.4.96',  user: 'blackroad', role: 'ai/storage' },
};

function ssh(node, cmd, timeout = 8000) {
  const n = FLEET_NODES[node];
  if (!n) throw new Error(`Unknown node: ${node}`);
  try {
    return execSync(
      `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes ${n.user}@${n.ip} "${cmd.replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', timeout }
    );
  } catch (err) {
    if (err.killed || err.signal === 'SIGTERM') throw new Error(`SSH timeout: ${node}`);
    throw err;
  }
}

// ── Fleet: Live Scan ────────────────────────────────────────
let fleetCache = null;
let fleetCacheTime = 0;
const FLEET_CACHE_TTL = 30000; // 30s

async function scanNode(name) {
  const n = FLEET_NODES[name];
  const result = { name, ip: n.ip, role: n.role, status: 'offline', apps: [], docker: [], systemd: [] };

  try {
    // Combined scan in one SSH call for speed
    const raw = ssh(name, [
      'echo "===DOCKER==="',
      'docker ps --format "{{.Names}}|{{.Status}}|{{.Ports}}|{{.Image}}" 2>/dev/null || true',
      'echo "===LISTEN==="',
      'ss -tlnp 2>/dev/null | grep LISTEN || true',
      'echo "===SYSTEMD==="',
      'systemctl list-units --type=service --state=running --no-pager --plain 2>/dev/null | grep -E "blackroad|road|lucidia|ollama|gitea|influx|grafana|nginx|postgres|redis|qdrant|pihole|pdns|headscale|nats|tor|portainer|octoprint|node_export|dispatch|prism|fail2ban|docker\\.service" || true',
      'echo "===PM2==="',
      'pm2 jlist 2>/dev/null || echo "[]"',
      'echo "===UPTIME==="',
      'uptime -s 2>/dev/null || uptime',
    ].join(' && '), 12000);

    result.status = 'online';

    const sections = {};
    let current = null;
    for (const line of raw.split('\n')) {
      if (line.startsWith('===') && line.endsWith('===')) {
        current = line.replace(/=/g, '');
        sections[current] = [];
      } else if (current && line.trim()) {
        sections[current].push(line.trim());
      }
    }

    // Parse Docker
    (sections.DOCKER || []).forEach(line => {
      const [cname, status, ports, image] = line.split('|');
      if (cname) {
        result.docker.push({ name: cname, status: status || '', ports: ports || '', image: image || '' });
        result.apps.push({
          name: cname, type: 'docker', status: status?.includes('Up') ? 'running' : 'stopped',
          port: (ports?.match(/:(\d+)->/)?.[1]) || null, image, node: name,
        });
      }
    });

    // Parse listening ports
    const listenApps = {};
    (sections.LISTEN || []).forEach(line => {
      const portMatch = line.match(/:(\d+)\s/);
      const procMatch = line.match(/users:\(\("([^"]+)",pid=(\d+)/);
      if (portMatch) {
        const port = parseInt(portMatch[1]);
        const proc = procMatch ? procMatch[1] : null;
        const pid = procMatch ? procMatch[2] : null;
        if (port > 1024 && !listenApps[port]) {
          listenApps[port] = { port, process: proc, pid };
        }
      }
    });

    // Parse systemd services
    (sections.SYSTEMD || []).forEach(line => {
      const match = line.match(/^\s*(\S+\.service)\s+loaded\s+active\s+running\s+(.+)/);
      if (match) {
        const svcName = match[1].replace('.service', '');
        const desc = match[2].trim();
        result.systemd.push({ name: svcName, description: desc });
        result.apps.push({ name: svcName, type: 'systemd', status: 'running', description: desc, node: name });
      }
    });

    // Parse PM2
    try {
      const pm2Line = (sections.PM2 || []).join('');
      if (pm2Line && pm2Line !== '[]') {
        const pm2Apps = JSON.parse(pm2Line);
        pm2Apps.forEach(p => {
          result.apps.push({
            name: p.name, type: 'pm2', status: p.pm2_env?.status || 'unknown',
            port: null, node: name,
          });
        });
      }
    } catch {}

    // Add port-only apps not already covered
    for (const [port, info] of Object.entries(listenApps)) {
      const p = parseInt(port);
      const alreadyCovered = result.apps.some(a => parseInt(a.port) === p);
      if (!alreadyCovered && info.process) {
        result.apps.push({
          name: `${info.process}:${p}`, type: info.process, status: 'running',
          port: p, pid: info.pid, node: name,
        });
      }
    }

    result.uptime = (sections.UPTIME || [])[0] || null;

  } catch (err) {
    result.status = 'offline';
    result.error = err.message;
  }

  return result;
}

async function scanFleet(force = false) {
  if (!force && fleetCache && (Date.now() - fleetCacheTime < FLEET_CACHE_TTL)) return fleetCache;

  const nodes = Object.keys(FLEET_NODES);
  const results = await Promise.allSettled(nodes.map(n => scanNode(n)));

  const fleet = { scanned_at: new Date().toISOString(), nodes: {} };
  let totalApps = 0, onlineNodes = 0;

  results.forEach((r, i) => {
    const node = r.status === 'fulfilled' ? r.value : { name: nodes[i], status: 'offline', apps: [], error: r.reason?.message };
    fleet.nodes[nodes[i]] = node;
    totalApps += node.apps.length;
    if (node.status === 'online') onlineNodes++;
  });

  fleet.summary = { total_nodes: nodes.length, online: onlineNodes, total_apps: totalApps };
  fleetCache = fleet;
  fleetCacheTime = Date.now();

  // Persist
  fs.writeFileSync(FLEET_FILE, JSON.stringify(fleet, null, 2));
  return fleet;
}

// ── Fleet: Remote Service Control ───────────────────────────
function fleetServiceAction(node, service, action) {
  // Determine service type and control method
  const validActions = ['start', 'stop', 'restart', 'status'];
  if (!validActions.includes(action)) throw new Error(`Invalid action: ${action}`);

  // Try systemctl first, then docker, then pm2
  const commands = [
    `sudo systemctl ${action} ${service} 2>&1 && echo "OK:systemd"`,
    `docker ${action} ${service} 2>&1 && echo "OK:docker"`,
    `pm2 ${action} ${service} 2>&1 && echo "OK:pm2"`,
  ];

  for (const cmd of commands) {
    try {
      const out = ssh(node, cmd, 10000);
      if (out.includes('OK:')) return { ok: true, method: out.match(/OK:(\w+)/)[1], output: out };
    } catch {}
  }
  throw new Error(`Could not ${action} ${service} on ${node}`);
}

function fleetServiceLogs(node, service, lines = 50) {
  // Try journalctl, docker logs, pm2 logs
  const attempts = [
    `sudo journalctl -u ${service} --no-pager -n ${lines} 2>&1`,
    `docker logs --tail ${lines} ${service} 2>&1`,
    `pm2 logs ${service} --lines ${lines} --nostream 2>&1`,
  ];

  for (const cmd of attempts) {
    try {
      const out = ssh(node, cmd, 10000);
      if (out && !out.includes('No such') && !out.includes('not found')) return out;
    } catch {}
  }
  return 'No logs available';
}

// ── State ───────────────────────────────────────────────────
function loadApps() {
  const file = path.join(DATA_DIR, 'apps.json');
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  return {};
}

function saveApps(apps) {
  fs.writeFileSync(path.join(DATA_DIR, 'apps.json'), JSON.stringify(apps, null, 2));
}

function getApp(name) {
  const apps = loadApps();
  return apps[name] || null;
}

function setApp(name, data) {
  const apps = loadApps();
  apps[name] = { ...apps[name], ...data, updated_at: new Date().toISOString() };
  saveApps(apps);
  return apps[name];
}

// ── WebSocket broadcast ─────────────────────────────────────
function broadcast(type, data) {
  const msg = JSON.stringify({ type, ...data, ts: Date.now() });
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
}

// ── Helpers ─────────────────────────────────────────────────
function genId() { return crypto.randomBytes(4).toString('hex'); }

function detectRuntime(projectDir) {
  try {
    return execSync(`bash ${DETECT_SCRIPT} "${projectDir}"`, { encoding: 'utf8' }).trim();
  } catch { return 'unknown'; }
}

function getDockerfile(runtime) {
  const map = {
    node: 'node.Dockerfile', nextjs: 'nextjs.Dockerfile',
    python: 'python.Dockerfile', fastapi: 'fastapi.Dockerfile',
    django: 'django.Dockerfile', flask: 'flask.Dockerfile',
    go: 'go.Dockerfile', rust: 'rust.Dockerfile',
    static: 'static.Dockerfile', deno: 'deno.Dockerfile',
    bun: 'bun.Dockerfile', nuxt: 'nextjs.Dockerfile',
    astro: 'node.Dockerfile',
  };
  return map[runtime] || null;
}

function assignPort(appName) {
  const apps = loadApps();
  const usedPorts = new Set(Object.values(apps).map(a => a.port).filter(Boolean));
  let port = 5000;
  while (usedPorts.has(port)) port++;
  return port;
}

function getStartCommand(runtime, projectDir) {
  const pkg = path.join(projectDir, 'package.json');
  if (fs.existsSync(pkg)) {
    const p = JSON.parse(fs.readFileSync(pkg, 'utf8'));
    if (p.scripts?.start) return null; // Dockerfile CMD handles it
  }
  // For python without explicit entry
  if (['python', 'fastapi', 'flask', 'django'].includes(runtime)) return null;
  return null;
}

// ── Build & Deploy ──────────────────────────────────────────
async function buildAndDeploy(appName, sourceDir, opts = {}) {
  const buildId = genId();
  const logFile = path.join(LOGS_DIR, `${appName}-${buildId}.log`);
  const logStream = fs.createWriteStream(logFile);

  function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    logStream.write(line + '\n');
    broadcast('build_log', { app: appName, build: buildId, msg });
  }

  try {
    log(`Starting build ${buildId} for ${appName}`);
    broadcast('build_start', { app: appName, build: buildId });

    // Detect runtime
    const runtime = opts.runtime || detectRuntime(sourceDir);
    log(`Detected runtime: ${runtime}`);

    if (runtime === 'unknown') {
      log('ERROR: Could not detect runtime. Add a Dockerfile or supported project files.');
      broadcast('build_fail', { app: appName, build: buildId, error: 'unknown runtime' });
      return { ok: false, error: 'Could not detect runtime' };
    }

    // Get or generate Dockerfile
    let dockerfilePath;
    const userDockerfile = path.join(sourceDir, 'Dockerfile');
    if (runtime === 'docker' && fs.existsSync(userDockerfile)) {
      dockerfilePath = userDockerfile;
      log('Using project Dockerfile');
    } else {
      const dfName = getDockerfile(runtime);
      if (!dfName) {
        log(`ERROR: No buildpack for runtime "${runtime}"`);
        broadcast('build_fail', { app: appName, build: buildId, error: `no buildpack for ${runtime}` });
        return { ok: false, error: `No buildpack for runtime: ${runtime}` };
      }
      // Copy buildpack Dockerfile into source
      dockerfilePath = path.join(sourceDir, 'Dockerfile.roadway');
      fs.copyFileSync(path.join(BUILDPACKS_DIR, dfName), dockerfilePath);
      log(`Using buildpack: ${dfName}`);
    }

    // Assign port
    const hostPort = opts.port || assignPort(appName);
    const imageTag = `roadway/${appName}:${buildId}`;

    // Docker build
    log('Building container...');
    const dfFlag = dockerfilePath !== userDockerfile ? `-f ${dockerfilePath}` : '';
    execSync(`docker build ${dfFlag} -t ${imageTag} "${sourceDir}" 2>&1`, {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      timeout: 300000,
    }).split('\n').forEach(l => log(l));

    // Stop old container if exists
    try {
      execSync(`docker stop roadway-${appName} 2>/dev/null && docker rm roadway-${appName} 2>/dev/null`);
      log('Stopped previous deployment');
    } catch { /* no previous container */ }

    // Run new container
    log(`Deploying on port ${hostPort}...`);
    const envFlags = (opts.env || []).map(e => `-e "${e}"`).join(' ');
    const containerId = execSync(
      `docker run -d --name roadway-${appName} --restart unless-stopped -p ${hostPort}:3000 ${envFlags} ${imageTag}`,
      { encoding: 'utf8' }
    ).trim();

    log(`Container ${containerId.slice(0, 12)} running on :${hostPort}`);

    // Clean up generated Dockerfile
    if (fs.existsSync(path.join(sourceDir, 'Dockerfile.roadway'))) {
      fs.unlinkSync(path.join(sourceDir, 'Dockerfile.roadway'));
    }

    // Update app record
    const url = `https://${appName}.${DOMAIN}`;
    setApp(appName, {
      name: appName,
      runtime,
      port: hostPort,
      container_id: containerId.slice(0, 12),
      image: imageTag,
      build_id: buildId,
      status: 'running',
      url,
      source: sourceDir,
      deployed_at: new Date().toISOString(),
      created_at: getApp(appName)?.created_at || new Date().toISOString(),
    });

    log(`Live at ${url} (local: http://localhost:${hostPort})`);
    broadcast('build_success', { app: appName, build: buildId, url, port: hostPort });

    logStream.end();
    return { ok: true, url, port: hostPort, build: buildId, runtime, container: containerId.slice(0, 12) };

  } catch (err) {
    log(`BUILD FAILED: ${err.message}`);
    broadcast('build_fail', { app: appName, build: buildId, error: err.message });
    logStream.end();
    return { ok: false, error: err.message };
  }
}

// ── API Routes ──────────────────────────────────────────────

// List all apps
app.get('/api/apps', (req, res) => {
  res.json({ apps: Object.values(loadApps()) });
});

// Get single app
app.get('/api/apps/:name', (req, res) => {
  const a = getApp(req.params.name);
  if (!a) return res.status(404).json({ error: 'App not found' });
  res.json(a);
});

// Create + deploy from local path
app.post('/api/deploy', async (req, res) => {
  const { name, path: srcPath, runtime, env, port } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40);
  const sourceDir = srcPath || path.join(APPS_DIR, cleanName);

  if (!fs.existsSync(sourceDir)) {
    return res.status(400).json({ error: `Source not found: ${sourceDir}` });
  }

  const result = await buildAndDeploy(cleanName, sourceDir, { runtime, env, port });
  res.status(result.ok ? 200 : 500).json(result);
});

// Deploy from git URL
app.post('/api/deploy/git', async (req, res) => {
  const { name, repo, branch, env, port } = req.body;
  if (!name || !repo) return res.status(400).json({ error: 'name and repo required' });

  const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40);
  const cloneDir = path.join(APPS_DIR, cleanName);

  try {
    if (fs.existsSync(cloneDir)) {
      execSync(`cd "${cloneDir}" && git fetch origin && git reset --hard origin/${branch || 'main'}`, { encoding: 'utf8' });
    } else {
      execSync(`git clone --depth 1 ${branch ? `-b ${branch}` : ''} "${repo}" "${cloneDir}"`, { encoding: 'utf8' });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: `Git clone failed: ${err.message}` });
  }

  const result = await buildAndDeploy(cleanName, cloneDir, { env, port });
  res.status(result.ok ? 200 : 500).json(result);
});

// Gitea/GitHub webhook — auto-deploy on push
app.post('/api/webhook/:name', async (req, res) => {
  const appName = req.params.name;
  const a = getApp(appName);
  if (!a) return res.status(404).json({ error: 'App not found' });

  const sourceDir = a.source || path.join(APPS_DIR, appName);
  if (fs.existsSync(path.join(sourceDir, '.git'))) {
    try { execSync(`cd "${sourceDir}" && git pull`, { encoding: 'utf8' }); } catch {}
  }

  const result = await buildAndDeploy(appName, sourceDir);
  res.json(result);
});

// Stop app
app.post('/api/apps/:name/stop', (req, res) => {
  const a = getApp(req.params.name);
  if (!a) return res.status(404).json({ error: 'App not found' });
  try {
    execSync(`docker stop roadway-${req.params.name}`);
    setApp(req.params.name, { status: 'stopped' });
    broadcast('app_stopped', { app: req.params.name });
    res.json({ ok: true, status: 'stopped' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Start stopped app
app.post('/api/apps/:name/start', (req, res) => {
  const a = getApp(req.params.name);
  if (!a) return res.status(404).json({ error: 'App not found' });
  try {
    execSync(`docker start roadway-${req.params.name}`);
    setApp(req.params.name, { status: 'running' });
    broadcast('app_started', { app: req.params.name });
    res.json({ ok: true, status: 'running' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Restart
app.post('/api/apps/:name/restart', (req, res) => {
  const a = getApp(req.params.name);
  if (!a) return res.status(404).json({ error: 'App not found' });
  try {
    execSync(`docker restart roadway-${req.params.name}`);
    setApp(req.params.name, { status: 'running' });
    broadcast('app_restarted', { app: req.params.name });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Delete app
app.delete('/api/apps/:name', (req, res) => {
  const a = getApp(req.params.name);
  if (!a) return res.status(404).json({ error: 'App not found' });
  try {
    execSync(`docker stop roadway-${req.params.name} 2>/dev/null; docker rm roadway-${req.params.name} 2>/dev/null`);
  } catch {}
  const apps = loadApps();
  delete apps[req.params.name];
  saveApps(apps);
  broadcast('app_deleted', { app: req.params.name });
  res.json({ ok: true });
});

// Logs
app.get('/api/apps/:name/logs', (req, res) => {
  const a = getApp(req.params.name);
  if (!a) return res.status(404).json({ error: 'App not found' });
  try {
    const lines = req.query.lines || 100;
    const logs = execSync(`docker logs --tail ${lines} roadway-${req.params.name} 2>&1`, { encoding: 'utf8' });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Build logs
app.get('/api/apps/:name/build-logs', (req, res) => {
  const logFiles = fs.readdirSync(LOGS_DIR).filter(f => f.startsWith(req.params.name));
  if (!logFiles.length) return res.status(404).json({ error: 'No build logs' });
  const latest = logFiles.sort().pop();
  const content = fs.readFileSync(path.join(LOGS_DIR, latest), 'utf8');
  res.json({ file: latest, logs: content });
});

// Env vars
app.post('/api/apps/:name/env', (req, res) => {
  const a = getApp(req.params.name);
  if (!a) return res.status(404).json({ error: 'App not found' });
  setApp(req.params.name, { env: req.body.env });
  res.json({ ok: true, message: 'Env updated. Redeploy to apply.' });
});

// ── Fleet API Routes ────────────────────────────────────────

// Full fleet scan
app.get('/api/fleet', async (req, res) => {
  try {
    const force = req.query.refresh === 'true';
    const fleet = await scanFleet(force);
    res.json(fleet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single node scan
app.get('/api/fleet/:node', async (req, res) => {
  try {
    const node = await scanNode(req.params.node);
    res.json(node);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Control a service on a node
app.post('/api/fleet/:node/:service/:action', (req, res) => {
  try {
    const result = fleetServiceAction(req.params.node, req.params.service, req.params.action);
    broadcast('fleet_action', { node: req.params.node, service: req.params.service, action: req.params.action });
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get logs from a service on a node
app.get('/api/fleet/:node/:service/logs', (req, res) => {
  try {
    const lines = parseInt(req.query.lines) || 50;
    const logs = fleetServiceLogs(req.params.node, req.params.service, lines);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deploy to a specific node via SSH
app.post('/api/fleet/:node/deploy', async (req, res) => {
  const { name, repo, branch, path: srcPath } = req.body;
  const node = req.params.node;
  if (!FLEET_NODES[node]) return res.status(404).json({ error: 'Unknown node' });
  if (!name) return res.status(400).json({ error: 'name required' });

  try {
    const n = FLEET_NODES[node];
    const remoteDir = `/opt/roadway/${name}`;

    if (repo) {
      // Clone and deploy remotely
      ssh(node, `mkdir -p ${remoteDir} && cd ${remoteDir} && (git pull 2>/dev/null || git clone --depth 1 ${branch ? `-b ${branch}` : ''} '${repo}' .)`, 30000);
    } else if (srcPath) {
      // SCP local dir to remote
      execSync(`scp -r -o StrictHostKeyChecking=no "${srcPath}" ${n.user}@${n.ip}:${remoteDir}`, { timeout: 60000 });
    }

    // Detect runtime and build on remote
    const runtime = ssh(node, `cd ${remoteDir} && if [ -f Dockerfile ]; then echo docker; elif [ -f package.json ]; then echo node; elif [ -f requirements.txt ]; then echo python; elif [ -f go.mod ]; then echo go; else echo unknown; fi`).trim();

    if (runtime === 'docker' || runtime !== 'unknown') {
      // Build and run via Docker on remote node
      ssh(node, `cd ${remoteDir} && docker build -t roadway-${name} . 2>&1 | tail -5`, 120000);
      try { ssh(node, `docker stop roadway-${name} 2>/dev/null; docker rm roadway-${name} 2>/dev/null`); } catch {}
      ssh(node, `docker run -d --name roadway-${name} --restart unless-stopped --network host roadway-${name}`, 15000);
    }

    broadcast('fleet_deploy', { node, app: name, runtime });
    fleetCache = null; // bust cache
    res.json({ ok: true, node, name, runtime, remote_dir: remoteDir });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  const apps = loadApps();
  const running = Object.values(apps).filter(a => a.status === 'running').length;
  let fleet = null;
  try { fleet = fleetCache?.summary || null; } catch {}
  res.json({ status: 'ok', apps: Object.keys(apps).length, running, uptime: process.uptime(), fleet });
});

// ── Dashboard (catch-all) ───────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'index.html'));
});

// ── Start ───────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\x1b[38;5;205mRoadWay\x1b[0m — Deploy any code, instantly`);
  console.log(`  http://localhost:${PORT}`);
});
