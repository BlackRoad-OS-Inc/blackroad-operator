const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { Octokit } = require("@octokit/rest");

const configPath = path.resolve(__dirname, "../../project-config.yml");
let cachedConfig;

function loadConfig() {
  if (!cachedConfig) {
    const raw = fs.readFileSync(configPath, "utf8");
    cachedConfig = yaml.load(raw) || {};
  }

  return cachedConfig;
}

function resolveProjectSettings(config, repo) {
  const projects = config.projects || {};
  const keys = Object.keys(projects);
  if (keys.length === 0) {
    return null;
  }

  if (repo && projects[repo]) {
    return { key: repo, ...projects[repo] };
  }

  const repoName = repo?.split("/")[1] || repo;
  if (repoName && projects[repoName]) {
    return { key: repoName, ...projects[repoName] };
  }

  const fallbackKey = keys[0];
  return { key: fallbackKey, ...projects[fallbackKey] };
}

module.exports = async function syncStatus(reaction, issueNumber, repo) {
  const config = loadConfig();
  const projectSettings = resolveProjectSettings(config, repo);
  if (!projectSettings) {
    console.warn("No project configuration found. Skipping status sync.");
    return;
  }

  const status = projectSettings.emoji_map?.[reaction];
  if (!status) {
    return;
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const projectId = projectSettings.project_id || config.default_project_id;

  console.log(`🌀 Updating project status to ${status}`);
  console.log(
    `Project ID: ${projectId || "unknown"} | Status Field ID: ${
      projectSettings.status_field_id || "unknown"
    }`
  );

  // TODO: Update GitHub Project field via GraphQL API (requires project field ID)
  // Placeholder log only
  console.log(
    `Would update project card for issue #${issueNumber} in ${repo} to status ${status}`
  );
// bot/handlers/project-status-sync.js
// Handler for syncing project statuses based on emoji reactions

const STATUS_MAP = {
  "✅": "Done",
  "🟡": "In Progress",
  "⬜": "Not Started",
  "❌": "Blocked",
  "🔁": "Rework",
  "🤔": "Needs Review",
  "🛟": "Escalation"
};

/**
 * Map emoji to project status
 * @param {string} emoji - The emoji character
 * @returns {string|null} - The corresponding status or null if not found
 */
function mapEmojiToStatus(emoji) {
  return STATUS_MAP[emoji] || null;
}

/**
 * Map reaction name to project status
 * @param {string} reaction - The reaction name (e.g., "rocket", "eyes")
 * @returns {string|null} - The corresponding status or null if not found
 */
function mapReactionToStatus(reaction) {
  const REACTION_MAP = {
    hooray: "Done",
    rocket: "Done",
    eyes: "In Progress",
    "+1": "Done",
    "-1": "Blocked",
    confused: "Blocked",
    thinking_face: "Needs Review",
    rotating_light: "Escalation"
  };
  return REACTION_MAP[reaction] || null;
}

/**
 * Get all status mappings
 * @returns {Object} - All emoji to status mappings
 */
function getStatusMappings() {
  return { ...STATUS_MAP };
}

/**
 * Sync project status based on reaction
 * @param {Object} options - Sync options
 * @param {string} options.reaction - The reaction name
 * @param {string|number} options.issueId - The issue or PR ID
 * @param {string|number} options.projectId - The project ID
 * @returns {Object} - Sync result
 */
async function syncProjectStatus({ reaction, issueId, projectId }) {
  const status = mapReactionToStatus(reaction);
  
  if (!status) {
    return {
      success: false,
      message: `No status mapping for reaction: ${reaction}`
    };
  }

  // This would be implemented with actual GitHub GraphQL API calls
  // For now, return the intended status change
  return {
    success: true,
    issueId,
    projectId,
    newStatus: status,
    reaction,
    message: `Status would be updated to: ${status}`
  };
}

module.exports = {
  mapEmojiToStatus,
  mapReactionToStatus,
  getStatusMappings,
  syncProjectStatus
};
