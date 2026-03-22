// Jobs • sandboxed (Docker-first), precise progress, hard cancel, weighted pipelines, SSE logs.
//
// Env knobs:
//   JOB_RUNNER=docker|host          (default: docker, auto-fallback to host if docker is missing)
//   DOCKER_DEFAULT_IMAGE=node:20-slim
//   DB_PATH=/srv/blackroad-api/blackroad.db
//   PROJECTS_DIR=/srv/projects
//   DEPLOY_ROOT=/var/www/blackroad/apps
//   ORIGIN_KEY_PATH=/srv/secrets/origin.key
//
// Endpoints (unchanged from v2):
//   POST /api/jobs/start  {project, kind:'test'|'build'|'deploy'|'custom'|'pipeline', script?, cmd?, args?, env?}
//   GET  /api/jobs/:id
//   GET  /api/jobs/:id/events   (SSE: log|progress|state|stage)
//   GET  /api/jobs?project=<id>
//   POST /api/jobs/:id/cancel
//
// Pipeline file (per project): /srv/projects/<id>/.blackroad/pipeline.yaml
// Step fields (all optional):
//   name, cmd, weight, image, binds[], env{}, user
//
// Progress markers inside step stdout/stderr:
//   [[PROGRESS 37]]  or [[PROGRESS 37%]]  or [[PROGRESS 0.37]]
//   {"progress":0.37}   (JSON line)
//   [[STAGE name=compile start]] / [[STAGE name=compile done]] / [[STAGE name=compile error]]
//
const { spawn, spawnSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { createDatabase } = require('../lib/sqlite');
const disableDbFlag = String(
  process.env.BR_TEST_DISABLE_DB || process.env.BRC_DISABLE_NATIVE_DB || ''
).toLowerCase();
const SHOULD_DISABLE_DB = disableDbFlag === '1' || disableDbFlag === 'true';

let Database;
if (!SHOULD_DISABLE_DB) {
  try {
    Database = require('better-sqlite3');
  } catch (err) {
    console.warn(
      '[jobs_locked] better-sqlite3 unavailable, using mock DB:',
      err
    );
  }
}

function createMockDb() {
  const noopStatement = {
    run: () => ({ changes: 0, lastInsertRowid: 0 }),
    all: () => [],
    get: () => undefined,
    iterate: function* iterate() {},
  };
  return {
    prepare() {
      return { ...noopStatement };
    },
    close: () => {},
  };
}
const YAML = require('yaml');

const DB_PATH = process.env.DB_PATH || '/srv/blackroad-api/blackroad.db';
const PROJECTS_DIR = process.env.PROJECTS_DIR || '/srv/projects';
const DEPLOY_ROOT = process.env.DEPLOY_ROOT || '/var/www/blackroad/apps';
const ORIGIN_KEY_PATH =
  process.env.ORIGIN_KEY_PATH || '/srv/secrets/origin.key';
const POLICY_PATH =
  process.env.JOB_POLICY_PATH || '/etc/blackroad/job_policy.yaml';
let POLICY = {};
try {
  POLICY = YAML.parse(fs.readFileSync(POLICY_PATH, 'utf8')) || {};
} catch {
  POLICY = {};
}
const DEFAULT_IMG =
  POLICY.default_image || process.env.DOCKER_DEFAULT_IMAGE || 'node:20-slim';

function filterEnv(env) {
  const allow = new Set(POLICY.env_allowlist || []);
  const out = {};
  for (const [k, v] of Object.entries(env || {})) {
    if (!allow.size || allow.has(k)) out[k] = v;
  }
  return out;
}

const whichContainer = (() => {
  const want = (POLICY.runner || 'docker').toLowerCase();
  function ok(bin, probe) {
    try {
      const r = spawnSync(
        'bash',
        ['-lc', probe || `${bin} info >/dev/null 2>&1`],
        { stdio: 'ignore' }
      );
      return r.status === 0;
    } catch {
      return false;
    }
  }
  if (want === 'podman' && ok('podman')) return 'podman';
  if (want === 'docker' && ok('docker')) return 'docker';
  if (ok('podman')) return 'podman';
  if (ok('docker')) return 'docker';
  return null; // host fallback
})();
function containerAvailable() {
  return !!whichContainer;
}

// Resolve an image tag to an immutable digest using skopeo/podman/docker (best available)
function resolveImageDigest(image) {
  if (!image || !POLICY.image_pinning) return image;
  try {
    const r = spawnSync('skopeo', ['inspect', `docker://${image}`], {
      encoding: 'utf8',
    });
    if (r.status === 0) {
      const digest = JSON.parse(r.stdout || '{}').Digest;
      if (digest) return `${image.split('@')[0].split(':')[0]}@${digest}`;
    }
  } catch {}
  try {
    const bin = whichContainer || 'docker';
    const pull = spawnSync(bin, ['pull', image], { stdio: 'ignore' });
    if (pull.status === 0) {
      const insp = spawnSync(
        bin,
        ['image', 'inspect', image, '--format', '{{.Digest}}'],
        { encoding: 'utf8' }
      );
      if (insp.status === 0)
        return `${image.split('@')[0].split(':')[0]}@${insp.stdout.trim()}`;
    }
  } catch {}
  return image; // last resort: unpinned
}

function db() {
  return createDatabase(DB_PATH);
  if (!Database) {
    return createMockDb();
  }
  return new Database(DB_PATH);
}
function run(db, sql, p = []) {
  return Promise.resolve(db.prepare(sql).run(p));
}
function all(db, sql, p = []) {
  return Promise.resolve(db.prepare(sql).all(p));
}
function get(db, sql, p = []) {
  return Promise.resolve(db.prepare(sql).get(p));
}
function now() {
  return Math.floor(Date.now() / 1000);
}
function orKey() {
  try {
    return fs.readFileSync(ORIGIN_KEY_PATH, 'utf8').trim();
  } catch {
    return '';
  }
}
async function led(payload) {
  try {
    await fetch('http://127.0.0.1:4000/api/devices/pi-01/command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BlackRoad-Key': orKey(),
      },
      body: JSON.stringify(payload),
    });
  } catch {}
}
const clamp01 = (x) => Math.max(0, Math.min(1, Number(x) || 0));

// progress/stage parsers
function parseProgressLine(line) {
  const m = line.match(/\[\[\s*PROGRESS\s+([0-9.]+)%?\s*\]\]/i);
  if (m) {
    const v = parseFloat(m[1]);
    return v > 1 ? v / 100 : v;
  }
  try {
    if (line[0] === '{' && line.includes('progress')) {
      const j = JSON.parse(line);
      if (typeof j.progress === 'number') {
        const v = j.progress;
        return v > 1 ? v / 100 : v;
      }
    }
  } catch {}
  return null;
}
function parseStageLine(line) {
  const m = line.match(/\[\[\s*STAGE\s+(.+?)\s*\]\]/i);
  if (!m) return null;
  const toks = Object.fromEntries(
    m[1]
      .split(/\s+/)
      .filter(Boolean)
      .map((kv) => {
        const p = kv.split('=');
        return [p[0], p[1] === undefined ? true : p[1]];
      })
  );
  return toks; // {name, weight?, start|done|error?}
}

// in-flight processes for cancel
const PROCS = new Map(); // job_id -> { child, pgid, dockerName? }

function spawnHostTracked(job_id, cmd, args, opts) {
  const child = spawn(cmd, args, { ...opts, detached: true });
  PROCS.set(job_id, { child, pgid: child.pid });
  return child;
}

function buildContainerArgs({
  name,
  image,
  workdir,
  cmdString,
  env = {},
  binds = [],
  step = {},
}) {
  const sec = POLICY.security || {};
  const bin = whichContainer || 'docker';
  const args = ['run', '--rm', '--name', name, '-w', '/workspace'];

  if (sec.read_only_root) args.push('--read-only');
  for (const t of sec.tmpfs || []) args.push('--tmpfs', t);
  for (const cap of sec.cap_drop || ['ALL']) args.push('--cap-drop', cap);
  if (sec.no_new_privileges) args.push('--security-opt', 'no-new-privileges');
  if (sec.pids_limit) args.push('--pids-limit', String(sec.pids_limit));
  if (sec.ulimit_nofile) args.push('--ulimit', `nofile=${sec.ulimit_nofile}`);
  if (sec.memory) args.push('--memory', String(step.memory || sec.memory));
  if (sec.cpus) args.push('--cpus', String(step.cpus || sec.cpus));
  if (sec.seccomp) {
    if (String(sec.seccomp).toLowerCase() === 'default')
      args.push('--security-opt', 'seccomp=default');
    else args.push('--security-opt', `seccomp=${sec.seccomp}`);
  }

  const net = step.net === true ? 'bridge' : sec.network || 'none';
  args.push('--network', net);

  const mergedBinds = new Set(binds || []);
  mergedBinds.add(`${workdir}:/workspace:rw`);
  (step.binds || []).forEach((b) => {
    if (POLICY.bind_presets && POLICY.bind_presets[b])
      mergedBinds.add(POLICY.bind_presets[b]);
// Jobs • LOCKED sandbox runner: Docker-first + security policy + allowed-writes gate.
// Replaces modules/jobs.js. Same endpoints & SSE as before.
//
// Install deps:  node tools/dep-scan.js --dir srv/blackroad-api   OR   bash ops/install.sh
//
const { spawn, spawnSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs'); const path = require('path');
const Database = require('better-sqlite3');
const YAML = require('yaml');
const minimatch = require('minimatch');

const DB_PATH      = process.env.DB_PATH      || '/srv/blackroad-api/blackroad.db';
const PROJECTS_DIR = process.env.PROJECTS_DIR || '/srv/projects';
const DEPLOY_ROOT  = process.env.DEPLOY_ROOT  || '/var/www/blackroad/apps';
const ORIGIN_KEY_PATH = process.env.ORIGIN_KEY_PATH || '/srv/secrets/origin.key';
const POLICY_PATH  = process.env.JOB_POLICY_PATH || '/etc/blackroad/job_policy.yaml';

function db(){ return new Database(DB_PATH); }
function run(db, sql, p=[]) { return Promise.resolve(db.prepare(sql).run(p)); }
function all(db, sql, p=[]) { return Promise.resolve(db.prepare(sql).all(p)); }
function get(db, sql, p=[]) { return Promise.resolve(db.prepare(sql).get(p)); }
function now(){ return Math.floor(Date.now()/1000); }
function orKey(){ try{ return fs.readFileSync(ORIGIN_KEY_PATH,'utf8').trim(); }catch{return ''} }
async function led(payload){
  try{
    await fetch('http://127.0.0.1:4000/api/devices/pi-01/command',{
      method:'POST', headers:{'Content-Type':'application/json','X-BlackRoad-Key': orKey()},
      body: JSON.stringify(payload)
    });
  }catch{}
}
const clamp01 = x => Math.max(0, Math.min(1, Number(x)||0));

// ---- policy ----
function loadPolicy(){
  try {
    const y = YAML.parse(fs.readFileSync(POLICY_PATH,'utf8'));
    return y || {};
  } catch { return {}; }
}
const POLICY = loadPolicy();
const DEFAULT_IMG   = POLICY.default_image || 'node:20-slim';
const RUNNER        = (POLICY.runner || 'docker').toLowerCase();

// ---- progress/stage parsing ----
function parseProgressLine(line){
  const m = line.match(/\[\[\s*PROGRESS\s+([0-9.]+)%?\s*\]\]/i);
  if (m){ const v = parseFloat(m[1]); return (v>1? v/100 : v); }
  try{ if (line[0]==='{' && line.includes('progress')){
    const j = JSON.parse(line); if (typeof j.progress==='number'){ const v=j.progress; return (v>1? v/100 : v); }
  } }catch{}
  return null;
}
function parseStageLine(line){
  const m = line.match(/\[\[\s*STAGE\s+(.+?)\s*\]\]/i);
  if (!m) return null;
  const toks = Object.fromEntries(
    m[1].split(/\s+/).filter(Boolean).map(kv=>{
      const p = kv.split('='); return [p[0], p[1]===undefined? true : p[1]];
    })
  ); return toks;
}

// ---- snapshots for allowed-writes gate ----
function snapshotTree(root){
  const out = new Map();
  (function walk(dir, base=''){
    let entries;
    try { entries = fs.readdirSync(dir, {withFileTypes:true}); } catch { return; }
    for (const ent of entries){
      const p = path.join(dir, ent.name);
      const rel = path.posix.join(base, ent.name);
      try{
        if (ent.isDirectory()){ walk(p, rel); }
        else if (ent.isFile()){
          const st = fs.statSync(p);
          out.set(rel, `${st.mtimeMs}|${st.size}`);
        }
      }catch{}
    }
  })(root, '');
  return out;
}
function diffChanged(before, after){
  const changed = new Set();

  // include removals + modifications
  for (const [k, beforeVal] of before.entries()){
    const afterVal = after.get(k);
    if (afterVal === undefined){
      changed.add(k);
    } else if (afterVal !== beforeVal){
      changed.add(k);
    }
  }

  // include new additions
  for (const k of after.keys()){
    if (!before.has(k)) changed.add(k);
  }

  return Array.from(changed);
}
function passesAllowedWrites(changed, patterns){
  if (!patterns || !patterns.length) return true;
  return changed.every(p => patterns.some(gl => minimatch(p, gl, {dot:true})));
}

// ---- env allow-list ----
function filterEnv(env){
  const allow = POLICY.env_allowlist || [];
  const out = {};
  for (const k of Object.keys(env||{})){
    if (allow.some(p => (p===k))) out[k] = String(env[k]);
  }
  // trim PATH to a safe baseline if present
  if (out.PATH){
    out.PATH = '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin';
  }
  return out;
}

// ---- docker helpers ----
function dockerAvailableSync(){
  try { spawnSync('bash',['-lc','docker info >/dev/null 2>&1'], {stdio:'ignore'}); return true; }
  catch { return false; }
}
function buildDockerArgs({ name, image, workdir, cmdString, env={}, binds=[], step = {} }){
  const sec = POLICY.security || {};
  const args = ['run','--rm','--name', name, '-w','/workspace'];

  // security
  if (sec.read_only_root) args.push('--read-only');
  for (const t of (sec.tmpfs||[])) args.push('--tmpfs', t);
  for (const cap of (sec.cap_drop||['ALL'])) args.push('--cap-drop', cap);
  if (sec.no_new_privileges) args.push('--security-opt','no-new-privileges');
  if (sec.pids_limit)        args.push('--pids-limit', String(sec.pids_limit));
  if (sec.ulimit_nofile)     args.push('--ulimit', `nofile=${sec.ulimit_nofile}`);
  if (sec.memory)            args.push('--memory', String(step.memory||sec.memory));
  if (sec.cpus)              args.push('--cpus',   String(step.cpus||sec.cpus));

  // network
  const net = step.net === true ? 'bridge' : (sec.network || 'none');
  args.push('--network', net);

  // binds: project always RW → /workspace
  const mergedBinds = new Set(binds || []);
  mergedBinds.add(`${workdir}:/workspace:rw`);
  // allow preset binds by key: "apps_rw"
  (step.binds || []).forEach(b => {
    if (POLICY.bind_presets && POLICY.bind_presets[b]) mergedBinds.add(POLICY.bind_presets[b]);
    else mergedBinds.add(b);
  });
  for (const b of mergedBinds) args.push('-v', b);

  const e = filterEnv({ ...(POLICY.env || {}), ...env, ...(step.env || {}) });
  for (const [k, v] of Object.entries(e)) args.push('-e', `${k}=${v}`);

  if (step.user) args.push('--user', String(step.user));

  const img = resolveImageDigest(
    image || POLICY.default_image || 'node:20-slim'
  );

  args.push(img, '/bin/bash', '-lc', cmdString);
  return { bin, args };
}

// core streaming/LED updates
function wireChild(job_id, child, onClose) {
  return new Promise((resolve) => {
    let lastPct = 0;
    const handleChunk = async (buf) => {
    const handleChunk = async (buf, _source) => {
      const s = buf.toString();
      await appendEvent(job_id, 'log', s);
      for (const line of s.split(/\r?\n/)) {
        const p = parseProgressLine(line);
        if (p != null && Math.abs(p - lastPct) >= 0.01) {
          lastPct = clamp01(p);
          await updateJob(job_id, { progress: lastPct });
          await led({
            type: 'led.progress',
            pct: Math.round(lastPct * 100),
            ttl_s: 90,
          });
        }
        const stage = parseStageLine(line);
        if (stage && stage.name) {
          await appendEvent(job_id, 'stage', {
            name: stage.name,
            status: stage.error ? 'error' : stage.done ? 'done' : 'start',
          });
        }
      }
    };
    child.stdout?.on('data', (buf) => handleChunk(buf));
    child.stderr?.on('data', (buf) => handleChunk(buf));
    child.on('close', async (code) => {
      PROCS.delete(job_id);
      try {
        await onClose(code, lastPct);
      } catch (err) {
        console.error('onClose error', err);
      } finally {
        resolve();
      }
  // env (allow-list)
  const e = filterEnv({...POLICY.env, ...env, ...(step.env||{})});
  for (const [k,v] of Object.entries(e)) args.push('-e', `${k}=${v}`);

  // user (optional)
  if (step.user) args.push('--user', String(step.user));

  args.push(image || POLICY.default_image || 'node:20-slim');
  args.push('/bin/bash','-lc', cmdString);
  return args;
}

// ---- in-flight processes, SSE plumbing, DB helpers ----
const d = db();
const clients = new Map(); // job_id -> Set(res)
const PROCS = new Map();   // job_id -> { child, pgid, dockerName? }

async function appendEvent(job_id, type, data){
  const row = await get(d, `SELECT max(seq)+1 AS n FROM job_events WHERE job_id=?`, [job_id]);
  const seq = row && row.n ? row.n : 1;
  await run(d, `INSERT INTO job_events (job_id,seq,ts,type,data) VALUES (?,?,?,?,?)`,
           [job_id, seq, now(), type, (typeof data==='string'?data:JSON.stringify(data))]);
  const set = clients.get(job_id); if (!set) return;
  const line = `event: ${type}\ndata: ${typeof data==='string'?data:JSON.stringify(data)}\n\n`;
  for (const res of set){ try{ res.write(line); }catch{} }
}
async function updateJob(job_id, patch){
  const j = await get(d, `SELECT * FROM jobs WHERE job_id=?`, [job_id]); if (!j) return;
  const status    = patch.status    ?? j.status;
  const progress  = (patch.progress!=null) ? clamp01(patch.progress) : j.progress;
  const exit_code = (patch.exit_code!=null)? patch.exit_code : j.exit_code;
  const finished  = (patch.finished_at!=null)? patch.finished_at : j.finished_at;
  const pid       = (patch.pid!=null)? patch.pid : j.pid;
  await run(d, `UPDATE jobs SET status=?, progress=?, exit_code=?, finished_at=?, pid=? WHERE job_id=?`,
           [status, progress, exit_code, finished, pid, job_id]);
  if (patch.progress!=null) await appendEvent(job_id, 'progress', {progress});
  if (patch.status)         await appendEvent(job_id, 'state', {status});
}

// ---- child wiring + LED ----
async function wireChild(job_id, child, onClose){
  return new Promise(resolve => {
    let lastPct = 0;
    const handler = async buf => {
      const s = buf.toString();
      await appendEvent(job_id, 'log', s);
      for (const line of s.split(/\r?\n/)){
        const p = parseProgressLine(line);
        if (p!=null && Math.abs(p-lastPct)>=0.01){
          lastPct = clamp01(p);
          await updateJob(job_id, {progress: lastPct});
          await led({type:'led.progress', pct: Math.round(lastPct*100), ttl_s:90});
        }
        const st = parseStageLine(line);
        if (st && st.name) await appendEvent(job_id,'stage',{name:st.name,status: st.error?'error':(st.done?'done':'start')});
      }
    };
    child.stdout?.on('data', handler);
    child.stderr?.on('data', handler);
    child.on('close', async code => {
      PROCS.delete(job_id);
      await onClose(code, lastPct);
      resolve();
    });
  });
}

// db + sse helpers
const d = db();
async function appendEvent(job_id, type, data) {
  const row = await get(
    d,
    `SELECT max(seq)+1 AS n FROM job_events WHERE job_id=?`,
    [job_id]
  );
  const seq = row && row.n ? row.n : 1;
  await run(
    d,
    `INSERT INTO job_events (job_id,seq,ts,type,data) VALUES (?,?,?,?,?)`,
    [
      job_id,
      seq,
      now(),
      type,
      typeof data === 'string' ? data : JSON.stringify(data),
    ]
  );
  const set = clients.get(job_id);
  if (!set) return;
  const line = `event: ${type}\ndata: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try {
      res.write(line);
    } catch {}
  }
}
async function updateJob(job_id, patch) {
  const j = await get(d, `SELECT * FROM jobs WHERE job_id=?`, [job_id]);
  if (!j) return;
  const status = patch.status ?? j.status;
  const progress =
    patch.progress != null ? clamp01(patch.progress) : j.progress;
  const exit_code = patch.exit_code != null ? patch.exit_code : j.exit_code;
  const finished =
    patch.finished_at != null ? patch.finished_at : j.finished_at;
  const pid = patch.pid != null ? patch.pid : j.pid;
  await run(
    d,
    `UPDATE jobs SET status=?, progress=?, exit_code=?, finished_at=?, pid=? WHERE job_id=?`,
    [status, progress, exit_code, finished, pid, job_id]
  );
  if (patch.progress != null)
    await appendEvent(job_id, 'progress', { progress });
  if (patch.status) await appendEvent(job_id, 'state', { status });
}

// single command (kind=test/build/deploy/custom)
async function runSingle(job_id, project, cmd, args, env) {
  const cwd = path.join(PROJECTS_DIR, project);
  const cmdString =
    Array.isArray(args) && args.length ? [cmd, ...args].join(' ') : cmd;
  let child;
  const name = `br_job_${job_id.replace(/[^a-zA-Z0-9_.-]/g, '').slice(-24)}`;
  if (containerAvailable()) {
    const c = buildContainerArgs({
      name,
      image: DEFAULT_IMG,
      workdir: cwd,
      cmdString,
      env,
      binds: [],
      step: {},
    });
    child = spawn(c.bin, c.args, { env: process.env, detached: true });
    PROCS.set(job_id, { child, pgid: child.pid, dockerName: name });
  } else {
    child = spawnHostTracked(job_id, cmd, args, {
      cwd,
      env: { ...process.env, ...env },
      shell: false,
    });
  }
  await run(d, `UPDATE jobs SET pid=? WHERE job_id=?`, [child.pid, job_id]);
  await wireChild(job_id, child, async (code, lastPct) => {
    const ok = code === 0;
    await updateJob(job_id, {
      status: ok ? 'ok' : 'error',
      progress: ok ? 1 : lastPct,
      exit_code: code,
      finished_at: now(),
    });
    await appendEvent(job_id, 'log', `\n[exit ${code}]\n`);
    if (ok) await led({ type: 'led.celebrate', ttl_s: 20 });
    else await led({ type: 'led.emotion', emotion: 'error', ttl_s: 20 });
  });
}

// pipeline
async function runPipeline(job_id, project, env) {
  const root = path.join(PROJECTS_DIR, project);
  const pfile = path.join(root, '.blackroad', 'pipeline.yaml');
  let pipe = { steps: [], on_error: 'stop', env: {} };
  if (fs.existsSync(pfile))
    pipe = YAML.parse(fs.readFileSync(pfile, 'utf8')) || pipe;
  else {
    pipe = {
      steps: [
        {
          name: 'build',
          cmd: 'npm run build || true',
          weight: 60,
          image: DEFAULT_IMG,
        },
        {
          name: 'deploy',
          cmd: `mkdir -p ${DEPLOY_ROOT}/${project} && rsync -a --delete public/ ${DEPLOY_ROOT}/${project}/`,
          weight: 40,
          image: DEFAULT_IMG,
        },
      ],
      on_error: 'stop',
    };
  }

  const steps = pipe.steps || [];
  let totalW = steps.reduce((s, x) => s + (Number(x.weight) || 0), 0);
  if (totalW <= 0) {
    const w = 100 / Math.max(1, steps.length);
    steps.forEach((s) => (s.weight = w));
    totalW = 100;
  }

  let base = 0;
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    await appendEvent(job_id, 'stage', {
      name: st.name || `step-${i + 1}`,
      index: i + 1,
      total: steps.length,
      status: 'start',
    });
    await updateJob(job_id, { progress: clamp01(base / 100) });
    await led({ type: 'led.progress', pct: Math.round(base), ttl_s: 180 });

    const image = st.image || DEFAULT_IMG;
    const binds = Array.isArray(st.binds) ? st.binds.slice() : [];
    const stepEnv = { ...pipe.env, ...env, ...(st.env || {}) };

    let child;
    const cmdString = st.cmd || 'true';
    const name = `br_job_${job_id}_${i}`;

    if (containerAvailable()) {
      const c = buildContainerArgs({
        name,
        image,
        workdir: root,
        cmdString,
        env: stepEnv,
        binds,
        step: st,
      });
      child = spawn(c.bin, c.args, { env: process.env, detached: true });
      PROCS.set(job_id, { child, pgid: child.pid, dockerName: name });
    } else {
      child = spawnHostTracked(job_id, '/bin/bash', ['-lc', cmdString], {
        cwd: root,
        env: { ...process.env, ...stepEnv },
        shell: false,
      });
    }

    await wireChild(job_id, child, async (code, lastPct) => {
      const w = Number(st.weight) || 0;
      if (code !== 0) {
        await appendEvent(job_id, 'stage', {
          name: st.name || `step-${i + 1}`,
          index: i + 1,
          total: steps.length,
          status: 'error',
          exit: code,
        });
        if ((pipe.on_error || 'stop') === 'stop') {
          PROCS.delete(job_id);
          await updateJob(job_id, {
            status: 'error',
            progress: clamp01((base + w * lastPct) / 100),
            exit_code: code,
            finished_at: now(),
          });
        }
      } else {
        base += w;
        await appendEvent(job_id, 'stage', {
          name: st.name || `step-${i + 1}`,
          index: i + 1,
          total: steps.length,
          status: 'ok',
        });
        await updateJob(job_id, { progress: clamp01(base / 100) });
      }
    });

    // if pipeline already marked error, stop loop
    const cur = await get(d, `SELECT status FROM jobs WHERE job_id=?`, [
      job_id,
    ]);
    if (cur && cur.status === 'error') return;
  }
  await updateJob(job_id, { status: 'ok', progress: 1, finished_at: now() });

  const SBOM = POLICY.sbom || {};
  if (SBOM.enable) {
    const name = `br_sbom_${job_id}`;
    const outPath = path.join(root, SBOM.output || '.blackroad/sbom.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const cmd = `syft -o json dir:/workspace > '${outPath.replace(/'/g, "'\\''")}'`;
    const img = SBOM.image || 'anchore/syft:latest';
    if (containerAvailable()) {
      const c = buildContainerArgs({
        name,
        image: img,
        workdir: root,
        cmdString: cmd,
        env: {},
        binds: [],
        step: { net: true, writes: ['.blackroad/**', '*.json', '*.log'] },
      });
      await new Promise((resolve) => {
        const proc = spawn(c.bin, c.args, { env: process.env, detached: true });
        proc.on('close', resolve);
      });
      await appendEvent(
        job_id,
        'log',
        `\n[SBOM] wrote ${path.relative(root, outPath)}\n`
      );
    }
  }

  await led({ type: 'led.celebrate', ttl_s: 20 });
}

// entrypoint: start job
async function startJob(body) {
  const project = (body.project || '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-');
  const kind = body.kind || 'custom';
  const id = 'job-' + uuidv4();
  const cwd = path.join(PROJECTS_DIR, project);
  const env = body.env || {};
  if (!fs.existsSync(cwd)) throw new Error('project not found');

  // resolve command for single kinds
  let cmd = body.cmd,
    args = body.args || [];
  if (!cmd && kind !== 'custom' && kind !== 'pipeline') {
    if (kind === 'deploy') {
      if (fs.existsSync(path.join(cwd, 'scripts/deploy.sh'))) {
        cmd = '/bin/bash';
        args = ['-lc', 'chmod +x scripts/deploy.sh && scripts/deploy.sh'];
      } else {
        cmd = '/bin/bash';
        args = [
          '-lc',
          `mkdir -p ${DEPLOY_ROOT}/${project} && rsync -a --delete public/ ${DEPLOY_ROOT}/${project}/`,
        ];
      }
    } else if (kind === 'test') {
      cmd = '/bin/bash';
      args = ['-lc', 'npm test || echo "no tests"'];
    } else if (kind === 'build') {
      cmd = '/bin/bash';
      args = ['-lc', 'npm run build || echo "no build"'];
    }
  }
  if (kind === 'custom' && !cmd && body.script) {
    cmd = '/bin/bash';
    args = ['-lc', body.script];
  }

  await run(
    d,
    `INSERT INTO jobs (job_id,project_id,kind,cmd,args_json,env_json,status,progress,started_at,pid)
                VALUES (?,?,?,?,?,?,?, ?,?, NULL)`,
    [
      id,
      project,
      kind,
      cmd || '',
      JSON.stringify(args),
      JSON.stringify(env),
      'running',
      0,
      now(),
    ]
  );
  await appendEvent(id, 'state', { status: 'running', project, kind });
  await led({ type: 'led.progress', pct: 5, ttl_s: 180 });

  if (kind === 'pipeline') {
    runPipeline(id, project, env).catch(async (e) => {
      await appendEvent(id, 'log', `\n[error] ${String(e)}\n`);
      await updateJob(id, { status: 'error', finished_at: now() });
      await led({ type: 'led.emotion', emotion: 'error', ttl_s: 20 });
    });
  } else {
    await runSingle(id, project, cmd, args, env);
  }
  return id;
}

// HTTP plumbing (unchanged surface)
const clients = new Map(); // job_id -> Set(res)
module.exports = function attachJobs({ app }) {
  app.post('/api/jobs/start', async (req, res) => {
    let raw = '';
    req.on('data', (d) => (raw += d));
    await new Promise((r) => req.on('end', r));
    let body = {};
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      return res.status(400).json({ error: 'bad json' });
    }
    try {
      const id = await startJob(body);
      res.json({ ok: true, job_id: id });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    const id = String(req.params.id);
    const j = await get(d, `SELECT * FROM jobs WHERE job_id=?`, [id]);
    if (!j) return res.status(404).json({ error: 'not found' });
    res.json(j);
  });

  app.get('/api/jobs', async (req, res) => {
    const pr = String(req.query.project || '');
    const rows = await all(
      d,
      `SELECT job_id,project_id,kind,status,progress,started_at,finished_at FROM jobs
                               ${pr ? 'WHERE project_id=?' : ''} ORDER BY started_at DESC LIMIT 50`,
      pr ? [pr] : []
    );
    res.json(rows);
  });

  app.post('/api/jobs/:id/cancel', async (req, res) => {
    const id = String(req.params.id);
    await updateJob(id, { status: 'canceled', finished_at: now() });
    await appendEvent(id, 'log', '\n[cancel requested]\n');
    const proc = PROCS.get(id);
    if (proc) {
      try {
        if (proc.dockerName) {
          spawn('docker', ['rm', '-f', proc.dockerName], { detached: false });
        } else if (proc.pgid) {
          process.kill(-proc.pgid, 'SIGTERM');
          setTimeout(() => {
            try {
              process.kill(-proc.pgid, 'SIGKILL');
            } catch {}
          }, 5000);
        }
      } catch {}
    }
    res.json({ ok: true });
  });

  app.get('/api/jobs/:id/events', async (req, res) => {
    const id = String(req.params.id);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    const rows = await all(
      d,
      `SELECT type,data FROM job_events WHERE job_id=? ORDER BY seq ASC`,
      [id]
    );
    for (const r of rows) {
      res.write(`event: ${r.type}\n`);
      res.write(`data: ${r.data}\n\n`);
    }
    if (!clients.has(id)) clients.set(id, new Set());
    clients.get(id).add(res);
    req.on('close', () => {
      const set = clients.get(id);
      if (set) {
        set.delete(res);
        if (!set.size) clients.delete(id);
      }
    });
  });

  console.log(
    `[jobs_locked] sandboxed runner online • runner=${whichContainer || 'host'}`
  );
// ---- ALLOWED-WRITES gate ----
function allowedWritesForStep(step){
  // step.writes overrides; else policy default
  if (Array.isArray(step.writes) && step.writes.length) return step.writes;
  return POLICY.default_allowed_writes || ['**'];
}
async function enforceWritesGate(root, beforeSnap, step, job_id){
  const after = snapshotTree(root);
  const changed = diffChanged(beforeSnap, after);
  const allowed = allowedWritesForStep(step);
  const ok = passesAllowedWrites(changed, allowed);
  if (!ok){
    const msg = `allowed-writes violation:\nchanged:\n${changed.map(x=>' - '+x).join('\n')}\nallowed:\n${allowed.map(x=>' - '+x).join('\n')}\n`;
    await appendEvent(job_id,'log',`\n[SECURITY] ${msg}\n`);
  }
  return ok;
}

// ---- run single command (kind != pipeline) ----
async function runSingle(job_id, project, cmd, args, env){
  const root = path.join(PROJECTS_DIR, project);
  const cmdString = Array.isArray(args) && args.length ? [cmd, ...args].join(' ') : cmd;
  const useDocker = (RUNNER==='docker' && dockerAvailableSync());
  const name = `br_job_${job_id.replace(/[^a-zA-Z0-9_.-]/g,'').slice(-20)}`;

  const before = snapshotTree(root);
  let child;
  if (useDocker){
    const argsD = buildDockerArgs({ name, image: DEFAULT_IMG, workdir: root, cmdString, env, binds: [] , step:{} });
    child = spawn('docker', argsD, { env: process.env, detached: true });
    PROCS.set(job_id, { child, pgid: child.pid, dockerName: name });
  } else {
    child = spawn(cmd, args, { cwd: root, env: { ...process.env, ...filterEnv(env) }, shell:false, detached:true });
    PROCS.set(job_id, { child, pgid: child.pid });
  }
  await run(d, `UPDATE jobs SET pid=? WHERE job_id=?`, [child.pid, job_id]);
  await wireChild(job_id, child, async (code, lastPct)=>{
    // writes gate (only on success)
    let okGate = true;
    if (code===0){ okGate = await enforceWritesGate(root, before, {}, job_id); }
    const ok = (code===0) && okGate;
    await updateJob(job_id, { status: ok?'ok':'error', progress: ok?1:lastPct, exit_code: code, finished_at: now() });
    await appendEvent(job_id,'log',`\n[exit ${code}]${okGate?'':' (writes-denied)'}\n`);
    if (ok) await led({type:'led.celebrate', ttl_s:20}); else await led({type:'led.emotion', emotion:'error', ttl_s:20});
  });
}

// ---- run pipeline (per-step policy) ----
async function runPipeline(job_id, project, env){
  const root = path.join(PROJECTS_DIR, project);
  const pfile = path.join(root, '.blackroad', 'pipeline.yaml');
  let pipe = { steps:[], on_error:'stop' };
  if (fs.existsSync(pfile)) pipe = YAML.parse(fs.readFileSync(pfile,'utf8')) || pipe;
  else {
    pipe = { steps:[
      { name:'build',  cmd:'npm run build || true', weight:60, writes:['dist/**','build/**','*.log'] },
      { name:'deploy', cmd:`mkdir -p ${DEPLOY_ROOT}/${project} && rsync -a --delete public/ ${DEPLOY_ROOT}/${project}/`, weight:40, binds:['apps_rw'], writes:['public/**','*.log'] }
    ], on_error:'stop' };
  }
  // weights
  if (pipe.steps.reduce((s,x)=> s + (+x.weight||0), 0) <= 0){
    const w = 100 / Math.max(1, pipe.steps.length);
    pipe.steps.forEach(s => s.weight = w);
  }
  let base=0;

  for (let i=0;i<pipe.steps.length;i++){
    const st = pipe.steps[i];
    await appendEvent(job_id,'stage',{name:st.name||`step-${i+1}`,index:i+1,total:pipe.steps.length,status:'start'});
    await updateJob(job_id,{progress: clamp01(base/100)});
    await led({type:'led.progress', pct: Math.round(base), ttl_s:180});

    const before = snapshotTree(root);
    const name = `br_job_${job_id}_${i}`;
    const cmdString = st.cmd || 'true';
    const image = st.image || DEFAULT_IMG;
    const binds = st.binds || [];
    const useDocker = (RUNNER==='docker' && dockerAvailableSync());

    let child;
    if (useDocker){
      const argsD = buildDockerArgs({ name, image, workdir: root, cmdString, env, binds, step: st });
      child = spawn('docker', argsD, { env: process.env, detached: true });
      PROCS.set(job_id, { child, pgid: child.pid, dockerName: name });
    } else {
      child = spawn('/bin/bash', ['-lc', cmdString], { cwd: root, env: { ...process.env, ...filterEnv({...env, ...(st.env||{})}) }, shell:false, detached:true });
      PROCS.set(job_id, { child, pgid: child.pid });
    }

    await wireChild(job_id, child, async (code, lastPct)=>{
      let okGate = true;
      if (code===0){ okGate = await enforceWritesGate(root, before, st, job_id); }
      if (code!==0 || !okGate){
        await appendEvent(job_id,'stage',{name:st.name||`step-${i+1}`,index:i+1,total:pipe.steps.length,status:'error',exit:code});
        await updateJob(job_id,{status:'error', progress: clamp01((base+(+st.weight||0)*lastPct)/100), exit_code: code, finished_at: now()});
      } else {
        await appendEvent(job_id,'stage',{name:st.name||`step-${i+1}`,index:i+1,total:pipe.steps.length,status:'ok'});
        base += (+st.weight||0);
        await updateJob(job_id,{progress: clamp01(base/100)});
      }
    });
    const cur = await get(d,`SELECT status FROM jobs WHERE job_id=?`, [job_id]);
    if (cur && cur.status==='error' && (pipe.on_error||'stop')==='stop'){ break; }
  }

  const j = await get(d,`SELECT status FROM jobs WHERE job_id=?`, [job_id]);
  if (j && j.status!=='error'){
    await updateJob(job_id,{status:'ok', progress:1, finished_at: now()});
    await led({type:'led.celebrate', ttl_s:20});
  }
}

// ---- entrypoint ----
async function startJob(body){
  const project = (body.project || '').toLowerCase().replace(/[^a-z0-9._-]+/g,'-');
  const kind = body.kind || 'custom';
  const id = 'job-'+uuidv4();
  const root = path.join(PROJECTS_DIR, project);
  if (!fs.existsSync(root)) throw new Error('project not found');

  // resolve command for single kinds
  let cmd = body.cmd, args = body.args || [];
  if (!cmd && kind!=='custom' && kind!=='pipeline'){
    if (kind==='deploy'){
      if (fs.existsSync(path.join(root,'scripts/deploy.sh'))){ cmd='/bin/bash'; args=['-lc','chmod +x scripts/deploy.sh && scripts/deploy.sh']; }
      else { cmd='/bin/bash'; args=['-lc', `mkdir -p ${DEPLOY_ROOT}/${project} && rsync -a --delete public/ ${DEPLOY_ROOT}/${project}/`]; }
    } else if (kind==='test'){  cmd='/bin/bash'; args=['-lc','npm test || echo "no tests"']; }
    else if (kind==='build'){   cmd='/bin/bash'; args=['-lc','npm run build || echo "no build"']; }
  }
  if (kind==='custom' && !cmd && body.script){ cmd='/bin/bash'; args=['-lc', body.script]; }

  await run(d, `INSERT INTO jobs (job_id,project_id,kind,cmd,args_json,env_json,status,progress,started_at,pid)
                VALUES (?,?,?,?,?,?,?, ?,?, NULL)`,
            [id, project, kind, (cmd||''), JSON.stringify(args), JSON.stringify(body.env||{}), 'running', 0, now()]);
  await appendEvent(id,'state',{status:'running', project, kind});
  await led({type:'led.progress', pct:5, ttl_s:180});

  if (kind==='pipeline'){ runPipeline(id, project, body.env||{}).catch(async e=>{
      await appendEvent(id,'log',`\n[error] ${String(e)}\n`); await updateJob(id,{status:'error', finished_at: now()});
      await led({type:'led.emotion', emotion:'error', ttl_s:20});
  }); }
  else { await runSingle(id, project, cmd, args, body.env||{}); }

  return id;
}

// ---- HTTP surface (same as before) ----
module.exports = function attachJobs({ app }){
  app.post('/api/jobs/start', async (req,res)=>{
    let raw=''; req.on('data',d=>raw+=d); await new Promise(r=>req.on('end',r));
    let body={}; try{ body=JSON.parse(raw||'{}'); }catch{ return res.status(400).json({error:'bad json'}) }
    try{ const id = await startJob(body); res.json({ok:true, job_id:id}); }
    catch(e){ res.status(500).json({error:String(e)}) }
  });

  app.get('/api/jobs/:id', async (req,res)=>{
    const j = await get(d, `SELECT * FROM jobs WHERE job_id=?`, [String(req.params.id)]);
    if (!j) return res.status(404).json({error:'not found'}); res.json(j);
  });

  app.get('/api/jobs', async (req,res)=>{
    const pr = String(req.query.project||'');
    const rows = await all(d, `SELECT job_id,project_id,kind,status,progress,started_at,finished_at FROM jobs
                               ${pr?'WHERE project_id=?':''} ORDER BY started_at DESC LIMIT 50`, pr?[pr]:[]);
    res.json(rows);
  });

  app.post('/api/jobs/:id/cancel', async (req,res)=>{
    const id = String(req.params.id);
    await updateJob(id, {status:'canceled', finished_at: now()});
    await appendEvent(id,'log','\n[cancel requested]\n');
    const p = PROCS.get(id);
    if (p){
      try{
        if (p.dockerName){ spawn('docker',['rm','-f',p.dockerName],{detached:false}); }
        else if (p.pgid){ process.kill(-p.pgid, 'SIGTERM'); setTimeout(()=>{ try{ process.kill(-p.pgid, 'SIGKILL'); }catch{} }, 5000); }
      }catch{}
    }
    res.json({ok:true});
  });

  app.get('/api/jobs/:id/events', async (req,res)=>{
    const id = String(req.params.id);
    res.writeHead(200, {'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive','X-Accel-Buffering':'no'});
    const rows = await all(d, `SELECT type,data FROM job_events WHERE job_id=? ORDER BY seq ASC`, [id]);
    for (const r of rows){ res.write(`event: ${r.type}\n`); res.write(`data: ${r.data}\n\n`); }
    if (!clients.has(id)) clients.set(id, new Set());
    clients.get(id).add(res);
    req.on('close', ()=>{ const set=clients.get(id); if(set){ set.delete(res); if(!set.size) clients.delete(id);} });
  });

  console.log(`[jobs] LOCKED runner online • policy=${POLICY_PATH} • runner=${RUNNER}${RUNNER==='docker' && !dockerAvailableSync() ? ' (fallback to host)': ''}`);
};
