// bot/project-status-sync.js
// 📊 Pushes emoji updates into GitHub Projects using GraphQL API

const {
  EMOJI_CATEGORIES,
  reactionToCategory,
} = require("./emoji-heatmap");

/**
 * Status field value mappings from emoji-bot-config.yml
 */
const STATUS_MAPPING = {
  "✅": "Done",
  "🟡": "In Progress",
  "⬜": "Not Started",
  "❌": "Blocked",
  "🔁": "Rework",
  "🤔": "Needs Review",
  "🛟": "Escalation",
};

/**
 * Reverse mapping from category to status
 */
const CATEGORY_TO_STATUS = {
  completed: "Done",
  inProgress: "In Progress",
  notStarted: "Not Started",
  blocked: "Blocked",
  review: "Needs Review",
  escalation: "Escalation",
};

/**
 * GraphQL mutation to update a project item field
 */
const UPDATE_PROJECT_FIELD_MUTATION = `
  mutation UpdateProjectV2ItemFieldValue(
    $projectId: ID!
    $itemId: ID!
    $fieldId: ID!
    $value: ProjectV2FieldValue!
  ) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: $value
      }
    ) {
      projectV2Item {
        id
      }
    }
  }
`;

/**
 * GraphQL query to get project details including field IDs
 */
const GET_PROJECT_FIELDS_QUERY = `
  query GetProjectFields($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        id
        title
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * GraphQL query to get issue's project item ID
 */
const GET_ISSUE_PROJECT_ITEM_QUERY = `
  query GetIssueProjectItem($owner: String!, $repo: String!, $issueNumber: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $issueNumber) {
        id
        projectItems(first: 10) {
          nodes {
            id
            project {
              id
            }
          }
        }
      }
    }
  }
`;

/**
 * Find the status field and value ID for a given status name
 * @param {Array} fields - Project fields array
 * @param {string} statusName - The status name to find (e.g., "Done")
 * @returns {Object|null} - Field and value IDs or null
 */
function findStatusFieldValue(fields, statusName) {
  const statusField = fields.find(
    (f) =>
      f.name === "Status" &&
      f.options // Single select field
  );

  if (!statusField) return null;

  const option = statusField.options.find(
    (o) => o.name.toLowerCase() === statusName.toLowerCase()
  );

  if (!option) return null;

  return {
    fieldId: statusField.id,
    valueId: option.id,
    fieldName: statusField.name,
    valueName: option.name,
  };
}

/**
 * Convert emoji to status name
 * @param {string} emoji - The emoji character
 * @returns {string|null} - Status name or null
 */
function emojiToStatus(emoji) {
  return STATUS_MAPPING[emoji] || null;
}

/**
 * Convert GitHub reaction to status name
 * @param {string} reaction - GitHub reaction name
 * @returns {string|null} - Status name or null
 */
function reactionToStatus(reaction) {
  const category = reactionToCategory(reaction);
  return category ? CATEGORY_TO_STATUS[category] : null;
}

/**
 * Create a project status sync handler
 * @param {Object} octokit - GitHub Octokit instance
 * @param {Object} options - Options
 * @param {number} options.cacheTTL - Cache TTL in milliseconds (default: 5 minutes)
 * @returns {Object} - Handler methods
 */
function createProjectStatusSync(octokit, options = {}) {
  const cacheTTL = options.cacheTTL || 5 * 60 * 1000; // Default 5 minutes
  let cachedProjectFields = null;
  let cachedProjectId = null;
  let cacheTimestamp = null;

  /**
   * Clear the project fields cache
   */
  function clearCache() {
    cachedProjectFields = null;
    cachedProjectId = null;
    cacheTimestamp = null;
  }

  /**
   * Fetch and cache project fields
   * @param {string} projectId - GitHub Project node ID
   * @param {boolean} forceRefresh - Force refresh the cache
   * @returns {Promise<Array>} - Project fields
   */
  async function getProjectFields(projectId, forceRefresh = false) {
    const now = Date.now();
    const cacheExpired = cacheTimestamp && (now - cacheTimestamp) > cacheTTL;

    if (!forceRefresh && !cacheExpired && cachedProjectId === projectId && cachedProjectFields) {
      return cachedProjectFields;
    }

    const result = await octokit.graphql(GET_PROJECT_FIELDS_QUERY, {
      projectId,
    });

    cachedProjectId = projectId;
    cachedProjectFields = result.node?.fields?.nodes || [];
    cacheTimestamp = now;
    return cachedProjectFields;
  }

  /**
   * Get issue's project item ID
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @param {string} projectId - Target project ID
   * @returns {Promise<string|null>} - Project item ID or null
   */
  async function getIssueProjectItemId(owner, repo, issueNumber, projectId) {
    const result = await octokit.graphql(GET_ISSUE_PROJECT_ITEM_QUERY, {
      owner,
      repo,
      issueNumber,
    });

    const items = result.repository?.issue?.projectItems?.nodes || [];
    const item = items.find((i) => i.project.id === projectId);

    return item?.id || null;
  }

  /**
   * Update project item status
   * @param {Object} options - Update options
   * @returns {Promise<Object>} - Update result
   */
  async function updateProjectItemStatus({
    projectId,
    itemId,
    statusName,
  }) {
    const fields = await getProjectFields(projectId);
    const fieldValue = findStatusFieldValue(fields, statusName);

    if (!fieldValue) {
      throw new Error(
        `Status "${statusName}" not found in project fields`
      );
    }

    const result = await octokit.graphql(UPDATE_PROJECT_FIELD_MUTATION, {
      projectId,
      itemId,
      fieldId: fieldValue.fieldId,
      value: { singleSelectOptionId: fieldValue.valueId },
    });

    return {
      success: true,
      itemId: result.updateProjectV2ItemFieldValue.projectV2Item.id,
      status: fieldValue.valueName,
    };
  }

  /**
   * Sync issue status based on emoji
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} - Sync result
   */
  async function syncIssueStatusFromEmoji({
    owner,
    repo,
    issueNumber,
    emoji,
    projectId,
  }) {
    const statusName = emojiToStatus(emoji);
    if (!statusName) {
      return { success: false, reason: "No status mapping for emoji" };
    }

    const itemId = await getIssueProjectItemId(
      owner,
      repo,
      issueNumber,
      projectId
    );

    if (!itemId) {
      return { success: false, reason: "Issue not in project" };
    }

    return updateProjectItemStatus({ projectId, itemId, statusName });
  }

  /**
   * Sync issue status based on reaction
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} - Sync result
   */
  async function syncIssueStatusFromReaction({
    owner,
    repo,
    issueNumber,
    reaction,
    projectId,
  }) {
    const statusName = reactionToStatus(reaction);
    if (!statusName) {
      return { success: false, reason: "No status mapping for reaction" };
    }

    const itemId = await getIssueProjectItemId(
      owner,
      repo,
      issueNumber,
      projectId
    );

    if (!itemId) {
      return { success: false, reason: "Issue not in project" };
    }

    return updateProjectItemStatus({ projectId, itemId, statusName });
  }

  return {
    getProjectFields,
    getIssueProjectItemId,
    updateProjectItemStatus,
    syncIssueStatusFromEmoji,
    syncIssueStatusFromReaction,
    findStatusFieldValue,
    clearCache,
  };
}

module.exports = {
  STATUS_MAPPING,
  CATEGORY_TO_STATUS,
  UPDATE_PROJECT_FIELD_MUTATION,
  GET_PROJECT_FIELDS_QUERY,
  GET_ISSUE_PROJECT_ITEM_QUERY,
  emojiToStatus,
  reactionToStatus,
  findStatusFieldValue,
  createProjectStatusSync,
};
