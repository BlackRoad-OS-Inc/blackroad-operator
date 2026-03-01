/**
 * roadbridge — .roadbridge.yml config parser
 *
 * Each GitHub repository can contain a .roadbridge.yml config at root.
 * This module parses and validates the config, applying org-level defaults
 * when a repo-level config is absent.
 *
 * Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
 */

/**
 * @typedef {Object} RoadbridgeConfig
 * @property {DriveConfig} drive
 * @property {GitHubConfig} github
 * @property {boolean} witness
 */

/**
 * @typedef {Object} DriveConfig
 * @property {string} target_folder_id - Google Drive folder ID
 * @property {boolean} on_release - Sync on GitHub Release published
 * @property {string|null} on_merge - Glob pattern for files to sync on PR merge
 * @property {string[]} exclude - Glob patterns to never sync
 */

/**
 * @typedef {Object} GitHubConfig
 * @property {boolean} on_drive_create - Open PR when new Doc appears in watched Drive folder
 * @property {string} target_branch - Branch to open Doc-to-Markdown PRs against
 */

/** Default config applied when no .roadbridge.yml exists */
const DEFAULT_CONFIG = {
  drive: {
    target_folder_id: '',
    on_release: true,
    on_merge: null,
    exclude: ['.git/', 'node_modules/', '*.env', '.env.*', '*.key', '*.pem'],
  },
  github: {
    on_drive_create: false,
    target_branch: 'main',
  },
  witness: true,
};

/**
 * Parse a .roadbridge.yml content string into a validated config.
 * This is a simple YAML subset parser — supports flat keys, arrays, and booleans.
 * For production, replace with a proper YAML parser.
 *
 * @param {string} yamlContent - Raw YAML content
 * @returns {RoadbridgeConfig}
 */
export function parseConfig(yamlContent) {
  if (!yamlContent || !yamlContent.trim()) {
    return structuredClone(DEFAULT_CONFIG);
  }

  const parsed = parseSimpleYaml(yamlContent);
  return mergeWithDefaults(parsed);
}

/**
 * Get the default config (used when no .roadbridge.yml exists).
 * @returns {RoadbridgeConfig}
 */
export function getDefaultConfig() {
  return structuredClone(DEFAULT_CONFIG);
}

/**
 * Validate that a config object has all required fields.
 * @param {object} config
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateConfig(config) {
  const errors = [];

  if (!config.drive) {
    errors.push('Missing "drive" section');
  } else {
    if (typeof config.drive.on_release !== 'boolean') {
      errors.push('drive.on_release must be a boolean');
    }
    if (
      config.drive.exclude &&
      !Array.isArray(config.drive.exclude)
    ) {
      errors.push('drive.exclude must be an array');
    }
  }

  if (!config.github) {
    errors.push('Missing "github" section');
  } else {
    if (typeof config.github.on_drive_create !== 'boolean') {
      errors.push('github.on_drive_create must be a boolean');
    }
  }

  if (typeof config.witness !== 'boolean') {
    errors.push('witness must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check if a file path should be excluded based on config patterns.
 * @param {string} filePath
 * @param {string[]} excludePatterns
 * @returns {boolean}
 */
export function isExcluded(filePath, excludePatterns) {
  if (!excludePatterns || excludePatterns.length === 0) return false;

  return excludePatterns.some((pattern) => {
    // Exact directory match
    if (pattern.endsWith('/') && filePath.startsWith(pattern)) return true;
    // Simple wildcard match
    if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      return filePath.endsWith(ext);
    }
    // Exact match
    if (filePath === pattern) return true;
    // Contains match for directory patterns
    if (pattern.endsWith('/') && filePath.includes(`/${pattern}`)) return true;
    return false;
  });
}

// --- Internal YAML parser (simple subset) ---

function parseSimpleYaml(content) {
  const result = {};
  let currentSection = null;
  let currentList = null;

  const lines = content.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, '').trimEnd(); // strip comments
    if (!line.trim()) continue;

    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();

    // Top-level key with value
    if (indent === 0 && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();
      currentList = null;

      if (value) {
        result[key.trim()] = parseValue(value);
        currentSection = null;
      } else {
        currentSection = key.trim();
        result[currentSection] = {};
      }
      continue;
    }

    // Nested key-value under a section
    if (indent > 0 && currentSection && trimmed.includes(':') && !trimmed.startsWith('-')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();

      if (value) {
        result[currentSection][key.trim()] = parseValue(value);
        currentList = null;
      } else {
        // Start of a list
        currentList = key.trim();
        result[currentSection][currentList] = [];
      }
      continue;
    }

    // List item
    if (trimmed.startsWith('- ') && currentSection && currentList) {
      const value = trimmed.slice(2).trim();
      result[currentSection][currentList].push(parseValue(value));
      continue;
    }
  }

  return result;
}

function parseValue(str) {
  if (!str) return '';
  // Remove quotes
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  if (str === 'true') return true;
  if (str === 'false') return false;
  if (str === 'null') return null;
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  return str;
}

function mergeWithDefaults(parsed) {
  return {
    drive: {
      target_folder_id: parsed.drive?.target_folder_id ?? DEFAULT_CONFIG.drive.target_folder_id,
      on_release: parsed.drive?.on_release ?? DEFAULT_CONFIG.drive.on_release,
      on_merge: parsed.drive?.on_merge ?? DEFAULT_CONFIG.drive.on_merge,
      exclude: parsed.drive?.exclude ?? [...DEFAULT_CONFIG.drive.exclude],
    },
    github: {
      on_drive_create: parsed.github?.on_drive_create ?? DEFAULT_CONFIG.github.on_drive_create,
      target_branch: parsed.github?.target_branch ?? DEFAULT_CONFIG.github.target_branch,
    },
    witness: parsed.witness ?? DEFAULT_CONFIG.witness,
  };
}
