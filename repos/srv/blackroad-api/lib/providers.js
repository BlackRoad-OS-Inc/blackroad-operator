const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const CONFIG_PATH =
  process.env.PROVIDERS_CONFIG ||
  path.join(__dirname, '../../config/providers.yaml');

let cache;
const FALLBACK_PROVIDERS = {
  lucidia: { display_name: 'Lucidia (self-hosted)', env_key: 'LLM_URL' },
  blackboxprogramming: { display_name: 'BlackBox Programming (self-hosted)', env_key: 'LLM_URL' },
};

function loadConfig() {
  if (cache) {
    return cache;
  }

  let file;
  try {
    file = fs.readFileSync(CONFIG_PATH, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      cache = { ...FALLBACK_PROVIDERS };
      return cache;
    }
    throw err;
  }

  let data = {};
  if (file && file.trim()) {
    data = yaml.parse(file) || {};
  }
  const providers = data.providers || {};
  cache = Object.keys(providers).length ? providers : { ...FALLBACK_PROVIDERS };
  return cache;
}

function listProviders() {
  const cfg = loadConfig();
  return Object.entries(cfg).map(([id, info]) => ({
    id,
    display_name: info.display_name,
    status: process.env[info.env_key] ? 'ready' : 'missing_key',
  }));
}

function providerHealth(name) {
  const cfg = loadConfig();
  const info = cfg[name];
  if (!info) return null;
  return {
    id: name,
    ok: Boolean(process.env[info.env_key]),
  };
}

module.exports = { listProviders, providerHealth };
