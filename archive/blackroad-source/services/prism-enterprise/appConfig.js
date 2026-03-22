import path from 'node:path';
import process from 'node:process';

const DEFAULT_PORT = 8000;
const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_JSON_LIMIT = '1mb';
const DEFAULT_RATE_LIMIT_WINDOW = 60_000; // 1 minute
const DEFAULT_RATE_LIMIT_MAX = 120;
const DEFAULT_MUSIC_DIR = '/opt/blackroad/data/outputs';
const DEFAULT_REPO_ROOT = '/var/www/blackroad';
const DEFAULT_AIDER_TIMEOUT = 5 * 60_000; // 5 minutes

function parseNumber(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function booleanFromEnv(value, fallback = false) {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

const resolvedRepoRoot = path.resolve(process.env.REPO_ROOT || DEFAULT_REPO_ROOT);

const config = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || DEFAULT_HOST,
  port: parseNumber(process.env.PORT, DEFAULT_PORT),
  trustProxy: parseNumber(process.env.TRUST_PROXY, 0),
  jsonLimit: process.env.JSON_LIMIT || DEFAULT_JSON_LIMIT,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  rateLimit: {
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, DEFAULT_RATE_LIMIT_WINDOW),
    max: parseNumber(process.env.RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX)
  },
  music: {
    directory: path.resolve(process.env.MUSIC_OUT || DEFAULT_MUSIC_DIR)
  },
  aider: {
    binary: process.env.AIDER_BIN || 'aider',
    repoRoot: resolvedRepoRoot,
    timeoutMs: parseNumber(process.env.AIDER_TIMEOUT_MS, DEFAULT_AIDER_TIMEOUT)
  },
  security: {
    enableCors: booleanFromEnv(process.env.ENABLE_CORS, true)
  }
});

export default config;
