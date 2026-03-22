/**
 * Claude CLI Hook Registration
 * Read/write/register HTTP hooks from Claude CLI config file
 */

const path = require('path');
const os = require('os');
const fs = require('fs');

const HOOK_SERVER_PORT = 47821;

function getClaudeConfigPath() {
  return path.join(os.homedir(), '.claude', 'settings.json');
}

function readClaudeConfig(debugLog) {
  try {
    const configPath = getClaudeConfigPath();
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    debugLog(`[Hook] Failed to read Claude config: ${error.message}`);
  }
  return {};
}

function writeClaudeConfig(config, debugLog) {
  try {
    const configPath = getClaudeConfigPath();
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    debugLog('[Hook] Claude config file updated');
    return true;
  } catch (error) {
    debugLog(`[Hook] Failed to write Claude config: ${error.message}`);
    return false;
  }
}

const HOOK_EVENTS = [
  'SessionStart', 'SessionEnd', 'UserPromptSubmit',
  'PreToolUse', 'PostToolUse', 'PostToolUseFailure',
  'Stop', 'TaskCompleted', 'PermissionRequest', 'Notification',
  'SubagentStart', 'SubagentStop', 'TeammateIdle',
  'ConfigChange', 'WorktreeCreate', 'WorktreeRemove',
  'PreCompact'
];

function hasOurHookInEntry(entry, hookUrl) {
  return entry.hooks && entry.hooks.some(h => h.type === 'http' && h.url === hookUrl);
}

function isHookRegistered(debugLog) {
  const config = readClaudeConfig(debugLog);
  const HTTP_HOOK_URL = `http://localhost:${HOOK_SERVER_PORT}/hook`;

  if (!config.hooks) {
    return false;
  }

  // All events must be registered — a partial registration (e.g. from an older
  // version that only had 3 events) must trigger a full re-registration so that
  // new events like SubagentStart/SubagentStop/TeammateIdle/PreCompact get added.
  return HOOK_EVENTS.every(event =>
    Array.isArray(config.hooks[event]) &&
    config.hooks[event].some(entry => hasOurHookInEntry(entry, HTTP_HOOK_URL))
  );
}

function registerClaudeHooks(debugLog) {
  debugLog('[Hook] Checking Claude CLI hook registration status...');

  if (isHookRegistered(debugLog)) {
    debugLog('[Hook] Hooks are already registered.');
    return true;
  }

  debugLog('[Hook] Starting hook registration...');

  const config = readClaudeConfig(debugLog);

  config.hooks = config.hooks || {};

  const HTTP_HOOK_URL = `http://localhost:${HOOK_SERVER_PORT}/hook`;
  const hookEvents = HOOK_EVENTS;

  const ourEntry = {
    matcher: "*",
    hooks: [{ type: "http", url: HTTP_HOOK_URL }]
  };

  for (const event of hookEvents) {
    if (!Array.isArray(config.hooks[event])) {
      // No hook for this event yet — create a new entry
      config.hooks[event] = [ourEntry];
    } else if (!config.hooks[event].some(entry => hasOurHookInEntry(entry, HTTP_HOOK_URL))) {
      // Preserve existing hooks and append ours
      config.hooks[event].push(ourEntry);
    }
    // Already registered — leave it untouched
  }

  if (writeClaudeConfig(config, debugLog)) {
    debugLog('[Hook] Claude CLI hook registration complete');
    return true;
  }

  debugLog('[Hook] Hook registration failed');
  return false;
}

module.exports = { HOOK_SERVER_PORT, registerClaudeHooks };
