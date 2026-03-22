import { execSync } from 'node:child_process';
import { AgentManager } from './agent_registry';

const autopilotUser = (process.env.AUTOPILOT_USER || 'blackboxprogramming').trim();
const prNumber = (process.env.PR_NUMBER || '').trim();
const commentAuthor = (process.env.COMMENT_AUTHOR || '').trim();
const actor = (process.env.GITHUB_ACTOR || '').trim();

if (!prNumber) {
  console.log('No pull request number supplied; skipping autopilot.');
  process.exit(0);
}

const triggeredByComment = commentAuthor.length > 0;
if (triggeredByComment) {
  if (commentAuthor === autopilotUser || commentAuthor === 'github-actions[bot]') {
    console.log(
      `Ignoring comment from automation user (${commentAuthor}); avoiding feedback loop.`,
    );
    process.exit(0);
  }

  console.log(
    `Autopilot triggered by comment from ${commentAuthor} on PR #${prNumber}.`,
  );
} else if (actor) {
  console.log(`Autopilot manually dispatched by ${actor} for PR #${prNumber}.`);
} else {
  console.log(`Autopilot triggered for PR #${prNumber}.`);
}

const agentManager = new AgentManager();
const agentMentions = agentManager.getAllMentions();

const autopilotMessage = [
  `${agentMentions}`,
  'review and test the feature branch, set up CI and preview deploy,',
  'run security and dependency scans, and apply comment fixes',
  '',
  '@copilot-cece-swe fix comments              # auto-fixes code review comments',
  '@copilot-codex-architect review design      # architecture review',
  '@copilot-sentinel-security scan             # security scan',
  '@copilot-qara-qa run tests                  # triggers test suite',
  '@copilot-atlas-devops deploy                # deployment',
  '@copilot-cece-swe ship when green           # queues auto-merge',
  '',
  'All agents work together in real-time, sharing state and context.',
  'Each agent can see what others are doing and adapt accordingly.',
  '',
  'Continuous loop: monitor → review → fix → test → deploy → merge',
  '',
  `${agentMentions}`,
  'Keep iterating until all checks pass and PR is merged.',
].join('\n');

const runGh = (command: string, allowFailure = false) => {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    if (!allowFailure) {
      console.error(`Command failed: ${command}`);
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }

    console.warn(`Command failed (continuing): ${command}`);
    console.warn(error instanceof Error ? error.message : error);
    return false;
  }
};

runGh(`gh pr comment ${prNumber} --body ${JSON.stringify(autopilotMessage)}`);

// Best-effort: ensure automerge label is present so merge queues once checks pass.
runGh(`gh pr edit ${prNumber} --add-label automerge`, true);

console.log('Autopilot sequence dispatched successfully.');
