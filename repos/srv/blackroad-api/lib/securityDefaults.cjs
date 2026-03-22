'use strict';

const DANGEROUS_SECRET_SENTINELS = new Set([
  '',
  'changeme',
  'change-me',
  'dev-secret-change-me',
  'dev-secret',
  'secret',
]);

function logFatal(logger, message, meta) {
  if (logger && typeof logger.fatal === 'function') {
    logger.fatal({ event: 'security_defaults_violation', message, ...meta });
  } else {
    // eslint-disable-next-line no-console
    console.error(`[security-defaults] ${message}`, meta || {});
  }
}

function parseAllowOrigins(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function enforceSecurityDefaults({ env = process.env, logger } = {}) {
  const violations = [];

  const sessionSecret = env.SESSION_SECRET || '';
  if (!sessionSecret) {
    violations.push({ message: 'SESSION_SECRET must be provided' });
  } else if (DANGEROUS_SECRET_SENTINELS.has(sessionSecret.toLowerCase())) {
    violations.push({ message: 'SESSION_SECRET uses a placeholder value' });
  }

  const internalToken = env.INTERNAL_TOKEN || '';
  if (!internalToken) {
    violations.push({ message: 'INTERNAL_TOKEN must be provided' });
  } else if (DANGEROUS_SECRET_SENTINELS.has(internalToken.toLowerCase())) {
    violations.push({ message: 'INTERNAL_TOKEN uses a placeholder value' });
  }

  const allowOrigins = parseAllowOrigins(env.ALLOW_ORIGINS);
  if (allowOrigins.length === 0) {
    violations.push({ message: 'ALLOW_ORIGINS must include at least one origin' });
  } else if (allowOrigins.some((origin) => origin.includes('*'))) {
    violations.push({ message: 'ALLOW_ORIGINS must not include wildcards' });
  }

  const allowShellRaw = String(env.ALLOW_SHELL || 'false').toLowerCase();
  const allowShellEnabled = allowShellRaw === 'true';
  if (allowShellEnabled) {
    const override = env.ALLOW_SHELL_OVERRIDE || '';
    if (override !== 'I_UNDERSTAND_THE_RISK') {
      violations.push({
        message: 'ALLOW_SHELL requires ALLOW_SHELL_OVERRIDE=I_UNDERSTAND_THE_RISK',
      });
    }
  }

  if (violations.length) {
    violations.forEach((violation) => logFatal(logger, violation.message));
    const error = new Error('Security defaults violated');
    error.code = 'SECURITY_DEFAULTS';
    error.violations = violations;
    throw error;
  }

  return {
    allowOrigins,
    allowShellEnabled,
    sessionSecret,
    internalToken,
  };
}

module.exports = {
  DANGEROUS_SECRET_SENTINELS,
  enforceSecurityDefaults,
  parseAllowOrigins,
};

