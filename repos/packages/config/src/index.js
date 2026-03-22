function env(key, fallback) {
  const val = process.env[key];
  if (val === undefined && fallback === undefined) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return val !== undefined ? val : fallback;
}

function envInt(key, fallback) {
  return parseInt(env(key, String(fallback)), 10);
}

function loadConfig() {
  return {
    registry: {
      port: envInt('REGISTRY_PORT', 3101),
      dbPath: env('REGISTRY_DB_PATH', './data/roadcode.db'),
      registriesPath: env('REGISTRIES_PATH', './registries'),
    },
    search: {
      port: envInt('SEARCH_PORT', 3102),
      dbPath: env('SEARCH_DB_PATH', './data/search.db'),
      registryUrl: env('REGISTRY_URL', 'http://localhost:3101'),
    },
    audit: {
      port: envInt('AUDIT_PORT', 3103),
      dbPath: env('AUDIT_DB_PATH', './data/audit.db'),
      chainPath: env('AUDIT_CHAIN_PATH', './data/chain.log'),
    },
    gitea: {
      url: env('GITEA_URL', 'http://localhost:3100'),
      token: env('GITEA_TOKEN', ''),
    },
    github: {
      token: env('GITHUB_TOKEN', ''),
    },
    mirror: {
      syncInterval: envInt('SYNC_INTERVAL', 900),
    },
    policy: {
      checkInterval: envInt('CHECK_INTERVAL', 3600),
    },
    nats: {
      url: env('NATS_URL', 'nats://localhost:4222'),
    },
  };
}

module.exports = { env, envInt, loadConfig };
