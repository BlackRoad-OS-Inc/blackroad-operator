const fs = require('fs');
const path = require('path');
const os = require('os');
const lockfile = require('proper-lockfile');

const CONFIG_DIR = path.join(os.homedir(), '.context-bridge');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const LOCK_OPTIONS = {
  retries: {
    retries: 5,
    minTimeout: 100,
    maxTimeout: 2000
  }
};

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Ensure config file exists (lockfile requires existing file)
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({}, null, 2));
}

async function readConfig() {
  let release;
  try {
    // Acquire read lock
    release = await lockfile.lock(CONFIG_FILE, { ...LOCK_OPTIONS, realpath: false });
    
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (error) {
    // If lock fails or file doesn't exist, return empty config
    return {};
  } finally {
    if (release) await release();
  }
}

async function writeConfig(data) {
  let release;
  try {
    // Acquire write lock
    release = await lockfile.lock(CONFIG_FILE, { ...LOCK_OPTIONS, realpath: false });
    
    // Atomic write: write to temp file, then rename
    const tempFile = CONFIG_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
    fs.renameSync(tempFile, CONFIG_FILE);
  } catch (error) {
    throw new Error(`Failed to write config: ${error.message}`);
  } finally {
    if (release) await release();
  }
}

async function getConfig() {
  const data = await readConfig();
  return {
    token: data.github_token,
    gistId: data.gist_id,
    gistUrl: data.gist_url,
    rawUrl: data.raw_url,
    lastUpdated: data.last_updated,
    template: data.template,
    name: data.name
  };
}

async function setConfig(key, value) {
  const data = await readConfig();
  data[key] = value;
  await writeConfig(data);
}

function clearConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
  }
}

module.exports = {
  getConfig,
  setConfig,
  clearConfig,
  CONFIG_DIR,
  CONFIG_FILE
};
