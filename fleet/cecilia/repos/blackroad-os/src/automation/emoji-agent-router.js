const { applyReactionUpdate, loadProjectConfig, resolveRepoConfig } = require("./project-status-sync");

const builtInAgents = {
  "planner-agent": async (context) => ({
    nextSteps: [
      "Gather acceptance criteria",
      "Estimate story points",
      "Update sprint field in project card",
    ],
    context,
  }),
  "builder-agent": async (context) => ({
    nextSteps: [
      "Kick off deployment pipeline",
      "Post ship log once complete",
    ],
    context,
  }),
  "scribe-agent": async (context) => ({
    nextSteps: [
      "Draft release notes",
      "Refresh docs with latest acceptance results",
    ],
    context,
  }),
  "guardian-agent": async (context) => ({
    nextSteps: [
      "Watch for regressions",
      "Escalate to humans if errors repeat",
    ],
    context,
  }),
  "broadcast-agent": async (context) => ({
    nextSteps: [
      "Post update to Slack/Discord",
      "Publish digest back to the issue thread",
    ],
    context,
  }),
};

function resolveEmojiAgents(emoji, repoConfig, config) {
  const action = repoConfig.emojiActions?.[emoji];
  const mappedAgents = action?.agents || [];

  const defaultRouting = config.defaultAgentRouting || {};
  const fromDefaults = Object.entries(defaultRouting)
    .filter(([, emojis]) => emojis.includes(emoji))
    .map(([agent]) => agent);

  const combined = new Set([...fromDefaults, ...mappedAgents]);
  return Array.from(combined);
}

async function routeReactionToAgents(payload, options = {}) {
  const { reaction, repository, issue, pull_request, comment } = payload;
  const emoji = reaction?.content;
  const repoFullName = repository?.full_name;
  const contentNodeId = issue?.node_id || pull_request?.node_id || comment?.node_id;
  const issueNumber = issue?.number || pull_request?.number;

  if (!emoji || !repoFullName || !contentNodeId) {
    return { dispatched: false, reason: "Missing required reaction data" };
  }

  const config = loadProjectConfig(options.configPath);
  const repoConfig = resolveRepoConfig(repoFullName, config);
  const agents = resolveEmojiAgents(emoji, repoConfig, config);

  const statusResult = await applyReactionUpdate({
    emoji,
    repoFullName,
    contentNodeId,
    issueNumber,
    configPath: options.configPath,
    fieldValues: options.fieldValues,
  });

  const agentResults = {};
  for (const agent of agents) {
    const handler = options.agentHandlers?.[agent] || builtInAgents[agent];
    if (!handler) {
      agentResults[agent] = { skipped: true, reason: "No handler registered" };
      continue;
    }

    agentResults[agent] = await handler({
      emoji,
      repoFullName,
      issueNumber,
      projectId: statusResult.projectId,
      projectItemId: statusResult.itemId,
      commentNodeId: comment?.node_id,
      escalate: statusResult.escalate,
    });
  }

  return {
    dispatched: true,
    agents,
    statusResult,
    agentResults,
  };
}

module.exports = {
  routeReactionToAgents,
  resolveEmojiAgents,
};
