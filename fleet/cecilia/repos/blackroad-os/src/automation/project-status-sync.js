const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const DEFAULT_CONFIG_PATH = path.resolve(__dirname, "../../config/project-config.yml");

function loadProjectConfig(configPath = DEFAULT_CONFIG_PATH) {
  const resolvedPath = configPath || DEFAULT_CONFIG_PATH;
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Project config not found at ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, "utf8");
  return YAML.parse(raw) || {};
}

function mergeConfig(defaults, override = {}) {
  return {
    ...defaults,
    fields: { ...(defaults.fields || {}), ...(override.fields || {}) },
    statusOptions: {
      ...(defaults.statusOptions || {}),
      ...(override.statusOptions || {}),
    },
    emojiActions: { ...(defaults.emojiActions || {}), ...(override.emojiActions || {}) },
    defaultFieldValues: {
      ...(defaults.defaultFieldValues || {}),
      ...(override.defaultFieldValues || {}),
    },
  };
}

function resolveRepoConfig(repoFullName, config) {
  const defaults = config?.defaults || {};
  const repoOverrides = config?.repos?.[repoFullName] || {};
  return mergeConfig(defaults, repoOverrides);
}

async function callGitHubGraphQL(token, query, variables = {}) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub GraphQL error: ${response.status} ${text}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    const messages = payload.errors.map((e) => e.message).join("; ");
    throw new Error(`GitHub GraphQL errors: ${messages}`);
  }

  return payload.data;
}

async function closeGitHubContent(token, repoFullName, issueNumber) {
  const response = await fetch(`https://api.github.com/repos/${repoFullName}/issues/${issueNumber}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "emoji-automation-bot",
    },
    body: JSON.stringify({ state: "closed" }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to close ${repoFullName}#${issueNumber}: ${response.status} ${text}`);
  }
}

async function getProjectItemForContent(token, projectId, contentId) {
  const query = `
    query($contentId: ID!) {
      node(id: $contentId) {
        ... on Issue {
          projectItems(first: 20) {
            nodes {
              id
              project { id }
            }
          }
        }
        ... on PullRequest {
          projectItems(first: 20) {
            nodes {
              id
              project { id }
            }
          }
        }
      }
    }
  `;

  const data = await callGitHubGraphQL(token, query, { contentId });
  const items = data?.node?.projectItems?.nodes || [];
  const match = items.find((item) => item.project?.id === projectId);
  return match?.id;
}

async function addContentToProject(token, projectId, contentId) {
  const mutation = `
    mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item { id }
      }
    }
  `;

  const data = await callGitHubGraphQL(token, mutation, { projectId, contentId });
  return data?.addProjectV2ItemById?.item?.id;
}

async function ensureProjectItem(token, projectId, contentId) {
  const existing = await getProjectItemForContent(token, projectId, contentId);
  if (existing) return existing;

  return addContentToProject(token, projectId, contentId);
}

async function updateSingleSelectField(token, projectId, itemId, fieldId, optionId) {
  if (!fieldId || !optionId) return null;

  const mutation = `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item { id }
      }
    }
  `;

  await callGitHubGraphQL(token, mutation, {
    projectId,
    itemId,
    fieldId,
    optionId,
  });

  return { fieldId, optionId };
}

async function updateTextField(token, projectId, itemId, fieldId, value) {
  if (!fieldId || typeof value !== "string" || !value.length) return null;

  const mutation = `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $text: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { text: $text }
        }
      ) {
        projectV2Item { id }
      }
    }
  `;

  await callGitHubGraphQL(token, mutation, {
    projectId,
    itemId,
    fieldId,
    text: value,
  });

  return { fieldId, value };
}

async function syncProjectFields({
  token,
  projectId,
  itemId,
  repoConfig,
  action,
  fieldValues = {},
}) {
  const updates = [];
  const statusOptionId = action.statusOption
    ? repoConfig.statusOptions?.[action.statusOption]
    : undefined;

  if (statusOptionId && repoConfig.fields?.status) {
    const update = await updateSingleSelectField(
      token,
      projectId,
      itemId,
      repoConfig.fields.status,
      statusOptionId,
    );
    if (update) updates.push(update);
  }

  const textFields = { ...repoConfig.defaultFieldValues, ...(action.fields || {}), ...fieldValues };
  const textTargets = [
    { key: "team", fieldId: repoConfig.fields?.team },
    { key: "owner", fieldId: repoConfig.fields?.owner },
    { key: "sprint", fieldId: repoConfig.fields?.sprint },
  ];

  for (const target of textTargets) {
    const value = textFields[target.key];
    if (!value) continue;
    const update = await updateTextField(token, projectId, itemId, target.fieldId, value);
    if (update) updates.push(update);
  }

  return updates;
}

async function applyReactionUpdate({
  emoji,
  repoFullName,
  contentNodeId,
  issueNumber,
  configPath,
  fieldValues,
}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN must be set for GitHub automation");
  }

  const config = loadProjectConfig(configPath);
  const repoConfig = resolveRepoConfig(repoFullName, config);
  const action = repoConfig.emojiActions?.[emoji];

  if (!action) {
    return { applied: false, reason: `No emoji logic for ${emoji}` };
  }

  const projectId = action.projectId || repoConfig.projectId;
  if (!projectId) {
    throw new Error(`Missing projectId for ${repoFullName}`);
  }

  const itemId = await ensureProjectItem(token, projectId, contentNodeId);
  const updates = await syncProjectFields({
    token,
    projectId,
    itemId,
    repoConfig,
    action,
    fieldValues,
  });

  if (action.close && issueNumber) {
    await closeGitHubContent(token, repoFullName, issueNumber);
  }

  return {
    applied: true,
    projectId,
    itemId,
    updates,
    agents: action.agents || [],
    closed: Boolean(action.close && issueNumber),
    escalate: Boolean(action.escalate),
  };
}

module.exports = {
  applyReactionUpdate,
  ensureProjectItem,
  loadProjectConfig,
  resolveRepoConfig,
  syncProjectFields,
};
