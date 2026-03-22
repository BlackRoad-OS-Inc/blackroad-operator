// bot/index.js

console.log("🤖 Emoji Bot Activated");

const event = process.env.GITHUB_EVENT_PATH;
const fs = require("fs");
const { updateProjectField, getIssueNodeId } = require("./handlers/project-graphql-updater");

// Mapping of reaction content to status updates
const REACTION_TO_STATUS = {
  eyes: "Done",
  hooray: "Done",
  rocket: "Done",
  "+1": "Done",
  "-1": "Blocked",
  confused: "Blocked",
  thinking_face: "Needs Review",
};

if (!event || !fs.existsSync(event)) {
  console.error("🚫 No GitHub event payload found.");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(event, "utf8"));
console.log("📦 Event Payload:", JSON.stringify(payload, null, 2));

const reaction = payload.reaction?.content || "";

/**
 * Updates the GitHub Project card status based on reaction.
 * Requires PROJECT_ID, STATUS_FIELD_ID, and status option IDs to be set.
 */
async function handleProjectUpdate(statusName) {
  const projectId = process.env.PROJECT_ID;
  const fieldId = process.env.STATUS_FIELD_ID;
  const statusOptions = process.env.STATUS_OPTIONS ? JSON.parse(process.env.STATUS_OPTIONS) : {};
  const valueId = statusOptions[statusName];

  if (!projectId || !fieldId || !valueId) {
    console.log("⚠️ Project update skipped: missing PROJECT_ID, STATUS_FIELD_ID, or STATUS_OPTIONS");
    return;
  }

  const issueNumber = payload.issue?.number;
  const owner = payload.repository?.owner?.login;
  const repo = payload.repository?.name;

  if (!issueNumber || !owner || !repo) {
    console.log("⚠️ Project update skipped: missing issue/repo information");
    return;
  }

  try {
    const issueNodeId = await getIssueNodeId(owner, repo, issueNumber);
    await updateProjectField({ issueNodeId, projectId, fieldId, valueId });
    console.log(`🎯 Project status updated to: ${statusName}`);
  } catch (error) {
    console.error("❌ Failed to update project:", error.message);
  }
}

if (reaction) {
  console.log(`🧠 Reaction received: ${reaction}`);

  const statusName = REACTION_TO_STATUS[reaction];

  switch (reaction) {
    case "eyes":
      console.log("👀 Mark as Done");
      break;
    case "hooray":
    case "rocket":
    case "+1":
      console.log("✅ Mark as Done");
      break;
    case "-1":
    case "confused":
      console.log("❌ Mark as Blocked");
      break;
    case "rotating_light":
      console.log("🛟 Escalation triggered");
      break;
    case "thinking_face":
      console.log("🤔 Needs Review assigned");
      break;
    default:
      console.log("🪞 No mapping for this reaction.");
  }

  // Trigger project update if status mapping exists
  if (statusName) {
    handleProjectUpdate(statusName).catch(console.error);
  }
} else {
  console.log("💬 Comment ignored — no emoji trigger detected.");
}
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const core = require('@actions/core');
const github = require('@actions/github');

function loadYaml(filePath) {
  const absolutePath = path.resolve(filePath);
  const fileContents = fs.readFileSync(absolutePath, 'utf8');
  return yaml.load(fileContents);
}

function resolveTemplate(config, templateKey) {
  const templateMap = config?.defaults?.templates || {};
  const resolvedPath = templateMap[templateKey] || templateKey;
  return path.resolve(resolvedPath);
}

function renderTemplate(content, context) {
  return content.replace(/{{(.*?)}}/g, (_, key) => {
    const trimmed = key.trim();
    return Object.prototype.hasOwnProperty.call(context, trimmed)
      ? context[trimmed]
      : '';
  });
}

function mapLabels(labelKeys, defaults) {
  const labelMap = defaults?.labels || {};
  return (labelKeys || []).map((key) => labelMap[key] || key);
}

function parseArgs(argv) {
  const args = { eventPath: null, dryRunOverride: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--event') {
      args.eventPath = argv[i + 1];
      i += 1;
    }
    if (arg === '--dry-run') {
      args.dryRunOverride = true;
    }
    if (arg === '--execute') {
      args.dryRunOverride = false;
    }
  }
  return args;
}

function loadEventPayload(eventPathFromArgs) {
  const explicitPath = eventPathFromArgs || process.env.GITHUB_EVENT_PATH;
  if (!explicitPath) {
    return github.context.payload;
  }
  const absolutePath = path.resolve(explicitPath);
  const payload = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(payload);
}

function resolveTargetNumber(payload) {
  if (payload.issue?.number) return payload.issue.number;
  if (payload.pull_request?.number) return payload.pull_request.number;
  if (payload.comment?.issue_url) {
    const parts = payload.comment.issue_url.split('/');
    return Number(parts[parts.length - 1]);
  }
  return null;
}

function buildContext(payload, config, reactionDefinition) {
  const labels = mapLabels(reactionDefinition.addLabels, config.defaults);
  const assignees = reactionDefinition.assign || [];
  const footer = config.defaults?.commentFooter || '';
  return {
    labels: labels.length ? labels.join(', ') : 'none',
    assignees: assignees.length ? assignees.join(', ') : 'none',
    footer,
  };
}

async function applyActions({
  octokit,
  owner,
  repo,
  issueNumber,
  reactionDefinition,
  labels,
  assignees,
  dryRun,
}) {
  if (labels.length) {
    if (dryRun) {
      core.info(`[dry-run] Would add labels ${labels.join(', ')} to ${owner}/${repo}#${issueNumber}`);
    } else {
      await octokit.rest.issues.addLabels({ owner, repo, issue_number: issueNumber, labels });
    }
  }

  if (assignees.length) {
    if (dryRun) {
      core.info(`[dry-run] Would assign ${assignees.join(', ')} to ${owner}/${repo}#${issueNumber}`);
    } else {
      await octokit.rest.issues.addAssignees({ owner, repo, issue_number: issueNumber, assignees });
    }
  }

  if (reactionDefinition.close) {
    if (dryRun) {
      core.info(`[dry-run] Would close ${owner}/${repo}#${issueNumber}`);
    } else {
      await octokit.rest.issues.update({ owner, repo, issue_number: issueNumber, state: 'closed' });
    }
  }
}

function buildCommentBody(templatePath, context) {
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  return renderTemplate(templateContent, context);
}

async function postComment({ octokit, owner, repo, issueNumber, body, dryRun }) {
  if (dryRun) {
    core.info(`[dry-run] Would post comment to ${owner}/${repo}#${issueNumber}:\n${body}`);
    return;
  }
  await octokit.rest.issues.createComment({ owner, repo, issue_number: issueNumber, body });
}

async function run() {
  const config = loadYaml('emoji-bot-config.yml');
  const args = parseArgs(process.argv.slice(2));
  const payload = loadEventPayload(args.eventPath);
  const reaction = payload.reaction?.content;

  if (!reaction) {
    core.info('No reaction found in payload. Exiting.');
    return;
  }

  const eventName = process.env.GITHUB_EVENT_NAME || 'local';
  const targetNumber = resolveTargetNumber(payload);
  if (!targetNumber) {
    core.info('Could not resolve target issue or pull request number. Exiting.');
    return;
  }

  const reactionDefinition = config.reactions?.[reaction];
  if (!reactionDefinition) {
    core.info(`Reaction ${reaction} is not configured. Exiting.`);
    return;
  }

  const owner = payload.repository?.owner?.login || github.context.repo.owner;
  const repo = payload.repository?.name || github.context.repo.repo;
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const octokit = token ? github.getOctokit(token) : null;

  const dryRunEnv = process.env.EMOJI_BOT_DRY_RUN;
  const configDefault = Boolean(config.defaults?.dryRun);
  const dryRun = typeof args.dryRunOverride === 'boolean'
    ? args.dryRunOverride
    : typeof dryRunEnv === 'string'
      ? dryRunEnv.toLowerCase() !== 'false'
      : configDefault;

  const templatePath = resolveTemplate(config, reactionDefinition.template);
  const labels = mapLabels(reactionDefinition.addLabels, config.defaults);
  const assignees = reactionDefinition.assign || [];
  const context = buildContext(payload, config, reactionDefinition);
  const renderedContext = {
    ...context,
    actor: payload.sender?.login || 'unknown',
    context: `${owner}/${repo}#${targetNumber} (${eventName})`,
  };
  const body = buildCommentBody(templatePath, renderedContext);

  if (!octokit) {
    core.warning('GITHUB_TOKEN was not provided; running in dry-run mode.');
  }

  const client = octokit || github.getOctokit('');
  await applyActions({
    octokit: client,
    owner,
    repo,
    issueNumber: targetNumber,
    reactionDefinition,
    labels,
    assignees,
    dryRun: dryRun || !token,
  });

  await postComment({
    octokit: client,
    owner,
    repo,
    issueNumber: targetNumber,
    body,
    dryRun: dryRun || !token,
  });
}

run().catch((error) => {
  core.setFailed(error.message);
});

const routeEmoji = require("./handlers/emoji-agent-router");

async function handleReaction(payload) {
  const reaction = payload?.reaction?.emoji?.name;

  if (reaction) {
    await routeEmoji({
      emoji: reaction,
      repo: "BlackRoad-OS/blackroad-os-api",
      issue: payload.issue,
    });
  }
}

module.exports = { handleReaction };
