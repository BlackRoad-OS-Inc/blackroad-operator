const test = require('node:test');
const assert = require('node:assert/strict');

const { enforceSecurityDefaults, parseAllowOrigins } = require('./securityDefaults.cjs');

test('parseAllowOrigins trims and filters values', () => {
  assert.deepEqual(parseAllowOrigins(' https://a.com , ,https://b.com '), [
    'https://a.com',
    'https://b.com',
  ]);
});

test('enforceSecurityDefaults returns sanitized configuration', () => {
  const env = {
    SESSION_SECRET: 'super-secret',
    INTERNAL_TOKEN: 'internal-123',
    ALLOW_ORIGINS: 'https://a.com,https://b.com',
    ALLOW_SHELL: 'false',
  };

  const result = enforceSecurityDefaults({ env });

  assert.equal(result.sessionSecret, 'super-secret');
  assert.equal(result.internalToken, 'internal-123');
  assert.deepEqual(result.allowOrigins, ['https://a.com', 'https://b.com']);
  assert.equal(result.allowShellEnabled, false);
});

test('enforceSecurityDefaults rejects wildcard origins', () => {
  assert.throws(
    () =>
      enforceSecurityDefaults({
        env: {
          SESSION_SECRET: 'super-secret',
          INTERNAL_TOKEN: 'internal-123',
          ALLOW_ORIGINS: 'https://a.com,*',
        },
      }),
    { code: 'SECURITY_DEFAULTS' }
  );

  assert.throws(
    () =>
      enforceSecurityDefaults({
        env: {
          SESSION_SECRET: 'super-secret',
          INTERNAL_TOKEN: 'internal-123',
          ALLOW_ORIGINS: 'https://*.example.com',
        },
      }),
    { code: 'SECURITY_DEFAULTS' }
  );
});

test('enforceSecurityDefaults requires override when enabling shell access', () => {
  assert.throws(
    () =>
      enforceSecurityDefaults({
        env: {
          SESSION_SECRET: 'super-secret',
          INTERNAL_TOKEN: 'internal-123',
          ALLOW_ORIGINS: 'https://a.com',
          ALLOW_SHELL: 'true',
        },
      }),
    { code: 'SECURITY_DEFAULTS' }
  );

  assert.doesNotThrow(() =>
    enforceSecurityDefaults({
      env: {
        SESSION_SECRET: 'super-secret',
        INTERNAL_TOKEN: 'internal-123',
        ALLOW_ORIGINS: 'https://a.com',
        ALLOW_SHELL: 'true',
        ALLOW_SHELL_OVERRIDE: 'I_UNDERSTAND_THE_RISK',
      },
    })
  );
});

