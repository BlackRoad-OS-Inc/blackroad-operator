const { execSync } = require('node:child_process');
const { writeFileSync, mkdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { SERVICE_ID, SERVICE_NAME, SERVICE_BASE_URL, OS_ROOT } = require('../src/config/serviceConfig');
const docsConfig = require('../src/config/docsConfig');

const BUILD_TIME = process.env.RAILWAY_BUILD_TIME || process.env.BUILD_TIME || new Date().toISOString();

function getCommitSha() {
  if (process.env.RAILWAY_GIT_COMMIT_SHA) {
    return process.env.RAILWAY_GIT_COMMIT_SHA;
  }
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (error) {
    return 'unknown';
  }
}

function getVersion() {
  try {
    const pkgRaw = readFileSync(join(process.cwd(), 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgRaw);
    return pkg.version || '0.0.0';
  } catch (error) {
    return '0.0.0';
  }
}

function buildMeta() {
  const timestamp = new Date().toISOString();
  const commit = getCommitSha();
  const version = getVersion();

  const healthPayload = {
    ok: true,
    service: SERVICE_ID,
    ts: timestamp,
    baseUrl: SERVICE_BASE_URL,
    osRoot: OS_ROOT,
  };

  const infoPayload = {
    name: SERVICE_NAME,
    id: SERVICE_ID,
    baseUrl: SERVICE_BASE_URL,
    osRoot: OS_ROOT,
    ts: timestamp,
  };

  const versionPayload = {
    service: SERVICE_NAME,
    appVersion: version,
    commit,
    buildTime: BUILD_TIME,
    environment: docsConfig.env,
    docsUrl: docsConfig.publicDocsUrl,
  };

  const debugEnvPayload = {
    env: docsConfig.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    SERVICE_BASE_URL,
    OS_ROOT,
    PUBLIC_DOCS_URL: process.env.PUBLIC_DOCS_URL || null,
  };

  const staticDir = join(process.cwd(), 'static');
  mkdirSync(staticDir, { recursive: true });

  writeFileSync(join(staticDir, 'health.json'), JSON.stringify(healthPayload, null, 2));
  writeFileSync(join(staticDir, 'version.json'), JSON.stringify(versionPayload, null, 2));
  writeFileSync(join(staticDir, 'info.json'), JSON.stringify(infoPayload, null, 2));
  writeFileSync(join(staticDir, 'debug-env.json'), JSON.stringify(debugEnvPayload, null, 2));

  const apiDir = join(staticDir, 'api');
  mkdirSync(apiDir, { recursive: true });

  const healthDir = join(apiDir, 'health');
  const infoDir = join(apiDir, 'info');
  const versionDir = join(apiDir, 'version');
  const debugEnvDir = join(apiDir, 'debug-env');

  [healthDir, infoDir, versionDir, debugEnvDir].forEach((dir) => mkdirSync(dir, { recursive: true }));

  writeFileSync(join(healthDir, 'index.json'), JSON.stringify(healthPayload, null, 2));
  writeFileSync(join(infoDir, 'index.json'), JSON.stringify(infoPayload, null, 2));
  writeFileSync(join(versionDir, 'index.json'), JSON.stringify(versionPayload, null, 2));
  writeFileSync(join(debugEnvDir, 'index.json'), JSON.stringify(debugEnvPayload, null, 2));
}

buildMeta();
