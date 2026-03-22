const http = require('http');
const crypto = require('crypto');
const data = require('./data');
const tickets = require('./tickets');
const { exec } = require('child_process');
const { rateLimitMiddleware } = require('./rate-limiter');
const { validate, schemas, sanitize } = require('./validators');

const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0';
const ALLOW_SHELL = process.env.ALLOW_SHELL === 'true';

const devMode = process.env.NODE_ENV !== 'production';
const warnedCredentialKeys = new Set();

function resolveCredential(envKey, fallbackFactory) {
  const value = process.env[envKey];
  if (value) {
    return value;
  }
  if (!devMode) {
    throw new Error(`Missing required environment variable: ${envKey}`);
  }
  const fallbackValue = fallbackFactory();
  if (!warnedCredentialKeys.has(envKey)) {
    warnedCredentialKeys.add(envKey);
    console.warn(
      `[security] ${envKey} not set; using generated development-only value: ${fallbackValue}`,
    );
  }
  return fallbackValue;
}

const VALID_USER = {
  username: resolveCredential('BACKEND_ADMIN_USERNAME', () => 'root'),
  password: resolveCredential('BACKEND_ADMIN_PASSWORD', () => 'Codex2025'),
  token: resolveCredential('BACKEND_ADMIN_TOKEN', () => 'test-token'),
// Load credentials from environment variables
  username: process.env.AUTH_USERNAME || 'admin',
  password: process.env.AUTH_PASSWORD,
  token: process.env.AUTH_TOKEN,
};

// Validate required environment variables
if (!VALID_USER.password || !VALID_USER.token) {
  console.error('ERROR: AUTH_PASSWORD and AUTH_TOKEN environment variables must be set');
  console.error('Please copy backend/.env.example to backend/.env and configure credentials');
  process.exit(1);
}

const tasks = [];

const securitySpotlights = {
  controlBarrier: {
    requiredSlack: 0.18,
    currentSlack: 0.24,
    infeasibilityRate: 0.008,
    interventionsToday: 3,
    lastFailsafe: '2025-03-08T11:24:00.000Z',
    killSwitchEngaged: false,
    manualOverride: false,
  },
  dpAccountant: {
    epsilonCap: 3.5,
    epsilonSpent: 1.62,
    delta: 1e-6,
    releasesToday: 42,
    momentsWindow: 1.2,
    freezeQueries: false,
    syntheticFallback: false,
  },
  pqHandshake: {
    keyRotationMinutes: 45,
    minutesSinceRotation: 32,
    hybridSuccessRate: 0.998,
    kemFailures: 1,
    transcriptPinnedRate: 0.92,
    haltChannel: false,
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function snapshotSpotlights() {
  const ctrl = securitySpotlights.controlBarrier;
  const dp = securitySpotlights.dpAccountant;
  const pq = securitySpotlights.pqHandshake;
  const residualSlack = Math.max(ctrl.currentSlack - ctrl.requiredSlack, 0);
  const residualEpsilon = Math.max(dp.epsilonCap - dp.epsilonSpent, 0);
  const budgetUtilization = dp.epsilonCap > 0 ? dp.epsilonSpent / dp.epsilonCap : 0;
  const timeToRotate = Math.max(pq.keyRotationMinutes - pq.minutesSinceRotation, 0);

  return {
    controlBarrier: {
      ...ctrl,
      residualSlack: Number(residualSlack.toFixed(3)),
    },
    dpAccountant: {
      ...dp,
      residualEpsilon: Number(residualEpsilon.toFixed(3)),
      budgetUtilization: Number(budgetUtilization.toFixed(3)),
    },
    pqHandshake: {
      ...pq,
      timeToRotate,
    },
  };
}

function ensureAuth(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${VALID_USER.token}`) {
    send(res, 401, { error: 'unauthorized' });
    return false;
  }
  return true;
}

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(obj));
'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
  getDb,
  addUser,
  addProject,
  getProjects,
  addTask,
  getTasks,
  getTask,
  updateTask,
  closeDb,
} = require('./data');

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const app = express();
app.use(express.json());

function findUserByUsername(username) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(username);
}

function ensureProjectForUser(userId, username) {
  const projects = getProjects(userId);
  if (projects.length > 0) return projects[0];
  return addProject(userId, `${username}'s project`);
}

function buildUserPayload(userRow, project) {
  return {
    id: userRow.id,
    username: userRow.email,
    projectId: project.id,
  };
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Start background tasks
data.expireApprovedExceptions();
setInterval(() => {
  try {
    data.expireApprovedExceptions();
  } catch (err) {
    console.error('exception expiry failed', err);
  }
}, ONE_DAY_MS);

tickets.startTicketWorker();

const app = http.createServer(async (req, res) => {
  // Apply rate limiting
  if (!rateLimitMiddleware(req, res)) {
    return; // Request was rate limited
  }

  const url = new URL(req.url, 'http://localhost');
  const segments = url.pathname.split('/').filter(Boolean);

  // Login endpoint
  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    try {
      const body = await parseBody(req);

      // Validate input
      const validation = validate(body, schemas.login);
      if (!validation.isValid()) {
        return send(res, 400, { error: 'validation failed', details: validation.getErrors() });
      }

      // Sanitize inputs
      const username = sanitize.trim(body.username);
      const password = body.password;

      if (username === VALID_USER.username && password === VALID_USER.password) {
        return send(res, 200, { token: VALID_USER.token });
      }
      return send(res, 401, { error: 'invalid credentials' });
    } catch {
      return send(res, 400, { error: 'invalid json' });
    }
  }

  // Tasks endpoints
  if (req.method === 'POST' && url.pathname === '/api/tasks') {
    if (!ensureAuth(req, res)) return;
    try {

      // Validate input
      const validation = validate(body, schemas.task);
      if (!validation.isValid()) {
        return send(res, 400, { error: 'validation failed', details: validation.getErrors() });
      }

      // Sanitize input
      const title = sanitize.trim(sanitize.escapeHtml(body.title));

      const task = { id: tasks.length + 1, title };
      tasks.push(task);
      return send(res, 201, { ok: true, task });
    } catch {
      return send(res, 400, { error: 'invalid json' });
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/tasks') {
    if (!ensureAuth(req, res)) return;
    return send(res, 200, { tasks });
  }

  // Security spotlights endpoint
  if (req.method === 'GET' && url.pathname === '/api/security/spotlights') {
    if (!ensureAuth(req, res)) return;
    return send(res, 200, { spotlights: snapshotSpotlights() });
  }

  // Security spotlight updates
  if (
    req.method === 'POST'
    && segments[0] === 'api'
    && segments[1] === 'security'
    && segments[2] === 'spotlights'
    && segments.length === 4
  ) {
    if (!ensureAuth(req, res)) return;
    let body;
    try {
      body = await parseBody(req);
    } catch {
      return send(res, 400, { error: 'invalid json' });
    }

    const panelMap = {
      'control-barrier': 'controlBarrier',
      'dp-accountant': 'dpAccountant',
      'pq-handshake': 'pqHandshake',
    };
    const panelKey = panelMap[segments[3]];
    if (!panelKey) {
      return send(res, 404, { error: 'not found' });
    }

    if (panelKey === 'controlBarrier') {
      if (typeof body.requiredSlack === 'number') {
        const value = clamp(body.requiredSlack, 0.05, 0.5);
        securitySpotlights.controlBarrier.requiredSlack = Number(value.toFixed(3));
        if (securitySpotlights.controlBarrier.requiredSlack > securitySpotlights.controlBarrier.currentSlack) {
          securitySpotlights.controlBarrier.currentSlack = Number(
            (securitySpotlights.controlBarrier.requiredSlack + 0.01).toFixed(3),
          );
        }
      }
      if (typeof body.killSwitchEngaged === 'boolean') {
        securitySpotlights.controlBarrier.killSwitchEngaged = body.killSwitchEngaged;
        securitySpotlights.controlBarrier.manualOverride = body.killSwitchEngaged;
        if (body.killSwitchEngaged) {
          securitySpotlights.controlBarrier.currentSlack = Number(
            Math.max(securitySpotlights.controlBarrier.requiredSlack + 0.02, 0.04).toFixed(3),
          );
          securitySpotlights.controlBarrier.interventionsToday += 1;
          securitySpotlights.controlBarrier.lastFailsafe = new Date().toISOString();
        }
      }
      if (body.logIntervention) {
        securitySpotlights.controlBarrier.interventionsToday += 1;
        securitySpotlights.controlBarrier.lastFailsafe = new Date().toISOString();
      }
      if (typeof body.currentSlack === 'number') {
        const value = clamp(body.currentSlack, 0, 0.6);
        securitySpotlights.controlBarrier.currentSlack = Number(value.toFixed(3));
      }
    } else if (panelKey === 'dpAccountant') {
      if (typeof body.epsilonCap === 'number') {
        const value = clamp(body.epsilonCap, 0.5, 15);
        securitySpotlights.dpAccountant.epsilonCap = Number(value.toFixed(2));
        if (securitySpotlights.dpAccountant.epsilonCap < securitySpotlights.dpAccountant.epsilonSpent) {
          securitySpotlights.dpAccountant.epsilonSpent = Number(
            Math.max(securitySpotlights.dpAccountant.epsilonCap - 0.05, 0).toFixed(2),
          );
        }
      }
      if (typeof body.freezeQueries === 'boolean') {
        securitySpotlights.dpAccountant.freezeQueries = body.freezeQueries;
      }
      if (typeof body.syntheticFallback === 'boolean') {
        securitySpotlights.dpAccountant.syntheticFallback = body.syntheticFallback;
      }
      if (typeof body.epsilonSpent === 'number') {
        const value = clamp(body.epsilonSpent, 0, 20);
        securitySpotlights.dpAccountant.epsilonSpent = Number(value.toFixed(3));
      }
    } else if (panelKey === 'pqHandshake') {
      if (typeof body.keyRotationMinutes === 'number') {
        const value = clamp(body.keyRotationMinutes, 5, 240);
        securitySpotlights.pqHandshake.keyRotationMinutes = Math.round(value);
      }
      if (typeof body.haltChannel === 'boolean') {
        securitySpotlights.pqHandshake.haltChannel = body.haltChannel;
      }
      if (body.forceRekey) {
        securitySpotlights.pqHandshake.minutesSinceRotation = 0;
        securitySpotlights.pqHandshake.kemFailures = 0;
      }
      if (typeof body.minutesSinceRotation === 'number') {
        const value = clamp(body.minutesSinceRotation, 0, 240);
        securitySpotlights.pqHandshake.minutesSinceRotation = Math.round(value);
      }
      if (typeof body.hybridSuccessRate === 'number') {
        const value = clamp(body.hybridSuccessRate, 0, 1);
        securitySpotlights.pqHandshake.hybridSuccessRate = Number(value.toFixed(3));
      }
    }

    const snapshot = snapshotSpotlights();
    return send(res, 200, { key: panelKey, spotlight: snapshot[panelKey] });
  }

  // Exception management endpoints
  if (req.method === 'POST' && url.pathname === '/exceptions') {
    try {
      body = await parseBody(req);
    } catch {
      return send(res, 400, { error: 'invalid json' });
    }
    const ruleId = typeof body.rule_id === 'string' && body.rule_id.trim();
    const subjectType = typeof body.subject_type === 'string' && body.subject_type.trim();
    const subjectId = typeof body.subject_id === 'string' && body.subject_id.trim();
    const reason = typeof body.reason === 'string' && body.reason.trim();
    const orgId = safeNumber(body.org_id);
    const requestedBy = safeNumber(body.requested_by);
    if (!ruleId || !subjectType || !subjectId || !reason || orgId == null || requestedBy == null) {
      return send(res, 400, { error: 'invalid exception payload' });
    }
    const validUntil = body.valid_until || null;
    const created = data.createException({
      ruleId,
      orgId,
      subjectType,
      subjectId,
      requestedBy,
      reason,
      validUntil,
    });
    return send(res, 201, created);
  }

  if (req.method === 'POST' && segments[0] === 'exceptions' && segments.length === 3) {
    const exceptionId = safeNumber(segments[1]);
    if (exceptionId == null) {
      return send(res, 404, { error: 'not found' });
    }
    try {
      body = await parseBody(req);
    } catch {
      return send(res, 400, { error: 'invalid json' });
    }
    const actor = safeNumber(body.actor);
    if (actor == null) {
      return send(res, 400, { error: 'actor required' });
    }
    const note = typeof body.note === 'string' ? body.note : undefined;
    if (segments[2] === 'approve') {
      const approved = data.approveException(exceptionId, {
        actor,
        note,
        valid_from: body.valid_from,
        valid_until: body.valid_until,
      });
      if (!approved) return send(res, 404, { error: 'not found' });
      tickets.scheduleTicketCreation(approved.id);
      return send(res, 200, approved);
    }
    if (segments[2] === 'deny') {
      const denied = data.denyException(exceptionId, { actor, note });
      if (!denied) return send(res, 404, { error: 'not found' });
      return send(res, 200, denied);
    }
    if (segments[2] === 'revoke') {
      const revoked = data.revokeException(exceptionId, { actor, note });
      if (!revoked) return send(res, 404, { error: 'not found' });
      return send(res, 200, revoked);
    }
  }

  if (req.method === 'GET' && url.pathname === '/exceptions/active') {
    const page = clamp(parseInt(url.searchParams.get('page') || '1', 10) || 1, 1, 10000);
    const pageSize = clamp(parseInt(url.searchParams.get('page_size') || '10', 10) || 10, 1, 50);
    const payload = data.listActiveExceptions({
      ruleId: url.searchParams.get('rule_id') || undefined,
      orgId: url.searchParams.get('org_id') || undefined,
      page,
      pageSize,
    });
    return send(res, 200, payload);
  }

  if (req.method === 'GET' && url.pathname === '/exceptions') {
    const list = data.listExceptions({
      ruleId: url.searchParams.get('rule_id') || undefined,
      subjectType: url.searchParams.get('subject_type') || undefined,
      subjectId: url.searchParams.get('subject_id') || undefined,
      status: url.searchParams.get('status') || undefined,
    });
    return send(res, 200, { exceptions: list });
  }

  // Shell execution endpoint (optional, guarded)
  if (req.method === 'POST' && url.pathname === '/api/exec') {
    if (!ensureAuth(req, res)) return;
    if (!ALLOW_SHELL) return send(res, 403, { error: 'shell disabled' });

    try {
      body = await parseBody(req);
    } catch {
      return send(res, 400, { error: 'invalid json' });
    }

    const cmd = String(body?.cmd || '').slice(0, 256);
    exec(cmd, { timeout: 5000 }, (err, stdout, stderr) => {
      send(res, 200, { ok: !err, stdout, stderr, error: err?.message || null });
    });
    return;
  }

  // Invalid JSON catch-all for POST requests
  if (req.method === 'POST') {
    try {
      await parseBody(req);
    } catch {
      return send(res, 400, { error: 'invalid json' });
    }
function issueToken(user, project) {
  return jwt.sign(
    { userId: user.id, projectId: project.id },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const existing = findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'user_exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const id = addUser(username, passwordHash);
  const project = ensureProjectForUser(id, username);
  const user = buildUserPayload({ id, email: username }, project);

  return res.status(200).json({ user });
});

app.post('/api/auth/login', (req, res) => {
  if (!username || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const userRow = findUserByUsername(username);
  if (!userRow) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const valid = bcrypt.compareSync(password, userRow.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const project = ensureProjectForUser(userRow.id, username);
  const token = issueToken(userRow, project);
  const user = buildUserPayload(userRow, project);

  return res.json({ token, user });
});

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_token' });
  }

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Backend listening on http://${HOST}:${PORT}`);
  });
  const token = header.slice('Bearer '.length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const userRow = getDb()
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(req.auth.userId);
  if (!userRow) {
    return res.status(404).json({ error: 'user_not_found' });
  }

  const project = ensureProjectForUser(userRow.id, userRow.email);
  return res.json({ user });
});

app.get('/api/tasks', authMiddleware, (req, res) => {
  const tasks = getTasks(req.auth.projectId);
  return res.json({ tasks });
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const { title, projectId } = req.body || {};
  const targetProject = projectId || req.auth.projectId;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'invalid_task' });
  }

  if (!targetProject || targetProject !== req.auth.projectId) {
    return res.status(403).json({ error: 'forbidden_project' });
  }

  const task = addTask(targetProject, title.trim());
  return res.status(201).json({ task });
});

app.patch('/api/tasks/:id', authMiddleware, (req, res) => {
  const task = getTask(req.params.id);
  if (!task || task.project_id !== req.auth.projectId) {
    return res.status(404).json({ error: 'task_not_found' });
  }

  const fields = {};
  if (typeof req.body?.title === 'string') {
    fields.title = req.body.title;
  }
  if (typeof req.body?.status === 'string') {
    fields.status = req.body.status;
  }

  const updated = updateTask(task.id, fields);
  return res.json({ task: updated });
});

app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

let runningServer = null;

function start(port = PORT, host = HOST) {
  if (!runningServer) {
    runningServer = app.listen(port, host, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend listening on http://${host}:${port}`);
    });
  }
  return runningServer;
}

function stop() {
  if (runningServer) {
    runningServer.close();
    runningServer = null;
  }
  closeDb();
}

const exportedServer = require.main === module ? start() : { close: stop };

module.exports = { app, server: exportedServer, start, stop };
// Prism backend server scaffold
app.use(express.json());

// TODO: JWT middleware placeholder
// app.use((req,res,next)=>{ /* verify token */ next(); });

// TODO: mount routes
app.get('/', (_req, res) => res.json({ ok: true }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
}

module.exports = app;
