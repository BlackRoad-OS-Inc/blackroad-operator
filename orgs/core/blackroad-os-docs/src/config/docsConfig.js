/**
 * Centralized configuration for the docs site.
 * Reads environment variables at build/start time so links between services stay consistent.
 */

const DEFAULT_DOCS_URL = 'http://localhost:3000';

const env = process.env.NODE_ENV || 'development';
const isProdLike = env !== 'development';

function readEnv(name, fallback = '') {
  const value = process.env[name] || fallback;

  if (isProdLike && name === 'PUBLIC_DOCS_URL' && !value) {
    console.warn(
      'PUBLIC_DOCS_URL was not provided; falling back to default for production-like build'
    );
  }

  return value;
}

/**
 * @typedef {Object} DocsConfig
 * @property {string} env
 * @property {string} publicDocsUrl
 * @property {string|null} coreApiUrl
 * @property {string|null} webAppUrl
 * @property {string|null} consoleUrl
 * @property {string|null} agentsApiUrl
 * @property {string} serviceName
 */

/** @type {DocsConfig} */
const config = {
  env,
  publicDocsUrl: readEnv('PUBLIC_DOCS_URL', DEFAULT_DOCS_URL),
  coreApiUrl: process.env.CORE_API_URL || null,
  webAppUrl: process.env.WEB_APP_URL || null,
  consoleUrl: process.env.CONSOLE_URL || null,
  agentsApiUrl: process.env.AGENTS_API_URL || null,
  serviceName: 'docs-site',
};

module.exports = config;
