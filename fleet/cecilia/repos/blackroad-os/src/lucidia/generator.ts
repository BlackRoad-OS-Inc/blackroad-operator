/**
 * 🧬 Lucidia Agent Generator
 * Generates agent files (JSON, prompt, workflow, docs) from spawn rules
 */

import type {
  SpawnRule,
  AgentSpec,
  GeneratedAgent,
  SpawnPRProposal,
} from "./types";

/** Generate agent JSON specification */
export function generateAgentSpec(rule: SpawnRule): AgentSpec {
  const { spawn, config } = rule.then;
  const now = new Date().toISOString();

  return {
    name: spawn,
    version: "1.0.0",
    role: config.role,
    inherits_from: config.inherits_from,
    ttl: config.ttl,
    description: config.description,
    created_at: now,
    created_by: "lucidia",
    capabilities: getCapabilitiesForRole(config.role),
    triggers: getTriggersForRole(config.role),
    outputs: getOutputsForRole(config.role),
  };
}

/** Get default capabilities based on agent role */
function getCapabilitiesForRole(role: string): string[] {
  const capabilities: Record<string, string[]> = {
    sentinel: [
      "monitor_escalations",
      "auto_triage",
      "priority_assignment",
      "alert_routing",
    ],
    reviewer: [
      "code_review",
      "pr_analysis",
      "merge_conflict_detection",
      "review_assignment",
    ],
    mapper: [
      "repo_discovery",
      "dependency_mapping",
      "owner_assignment",
      "documentation_generation",
    ],
    triage: [
      "issue_classification",
      "label_assignment",
      "duplicate_detection",
      "priority_scoring",
    ],
    maintainer: [
      "workflow_monitoring",
      "failure_recovery",
      "health_checks",
      "auto_remediation",
    ],
  };
  return capabilities[role] || ["general_processing"];
}

/** Get default triggers based on agent role */
function getTriggersForRole(role: string): string[] {
  const triggers: Record<string, string[]> = {
    sentinel: ["escalation_created", "high_priority_issue", "sla_breach"],
    reviewer: ["pr_opened", "review_requested", "merge_ready"],
    mapper: ["repo_created", "unmapped_activity", "ownership_change"],
    triage: ["issue_created", "stale_issue", "queue_overflow"],
    maintainer: ["workflow_failed", "health_check_failed", "orphan_detected"],
  };
  return triggers[role] || ["manual_trigger"];
}

/** Get default outputs based on agent role */
function getOutputsForRole(role: string): string[] {
  const outputs: Record<string, string[]> = {
    sentinel: ["escalation_resolved", "priority_updated", "agent_assigned"],
    reviewer: ["review_completed", "approval_granted", "changes_requested"],
    mapper: ["repo_mapped", "owner_assigned", "docs_generated"],
    triage: ["issue_labeled", "assignee_set", "priority_assigned"],
    maintainer: ["workflow_fixed", "alert_cleared", "owner_notified"],
  };
  return outputs[role] || ["task_completed"];
}

/** Generate agent prompt file content */
export function generateAgentPrompt(rule: SpawnRule): string {
  const { spawn, config } = rule.then;
  return `# 🤖 ${spawn}

## Role
${config.role.charAt(0).toUpperCase() + config.role.slice(1)} Agent

## Description
${config.description}

## Parent Agent
Inherits from: \`${config.inherits_from}\`

## Time to Live
This agent will automatically terminate after: ${config.ttl}

## Behavior Guidelines

1. **Primary Mission**: Execute the responsibilities inherited from ${config.inherits_from}
2. **Escalation Protocol**: Route complex issues to the parent agent when confidence is low
3. **Logging**: Document all actions taken for audit trail
4. **Self-Monitoring**: Track own performance metrics and report anomalies

## Interaction Rules

- Respond to assigned triggers within SLA thresholds
- Collaborate with sibling agents when tasks overlap
- Defer to human approval for high-impact decisions
- Report completion status to Lucidia for spawn lifecycle management

## Termination Conditions

- TTL expiration (${config.ttl})
- Manual termination by approver
- Parent agent takeover
- Mission completion with no pending tasks
`;
}

/** Generate workflow YAML content */
export function generateAgentWorkflow(rule: SpawnRule): string {
  const { spawn, config } = rule.then;
  const triggers = getTriggersForRole(config.role);

  return `name: 🤖 ${spawn} – ${config.role} workflow

on:
  workflow_dispatch:
    inputs:
      action:
        description: 'Action to perform'
        required: true
        type: choice
        options:
          - process
          - status
          - terminate
  schedule:
    - cron: '*/15 * * * *'  # Run every 15 minutes

permissions:
  contents: read

env:
  AGENT_NAME: ${spawn}
  AGENT_ROLE: ${config.role}
  AGENT_TTL: ${config.ttl}
  INHERITS_FROM: ${config.inherits_from}

jobs:
  agent-process:
    runs-on: ubuntu-latest
    steps:
      - name: 🧬 Checkout
        uses: actions/checkout@v4

      - name: 📊 Check Agent TTL
        id: ttl-check
        run: |
          echo "Checking TTL for ${spawn}..."
          echo "ttl_valid=true" >> $GITHUB_OUTPUT

      - name: 🤖 Execute Agent Logic
        if: steps.ttl-check.outputs.ttl_valid == 'true'
        run: |
          echo "🤖 ${spawn} activated"
          echo "Role: ${config.role}"
          echo "Processing triggers: ${triggers.join(", ")}"

      - name: 📝 Report Status
        run: |
          echo "✅ Agent ${spawn} completed processing cycle"
`;
}

/** Generate MDX documentation content */
export function generateAgentDocs(rule: SpawnRule): string {
  const { spawn, config } = rule.then;
  const capabilities = getCapabilitiesForRole(config.role);
  const triggers = getTriggersForRole(config.role);
  const outputs = getOutputsForRole(config.role);

  return `---
title: "${spawn}"
description: "${config.description}"
role: "${config.role}"
status: "spawned"
created_by: "lucidia"
---

# 🤖 ${spawn}

> ${config.description}

## Overview

| Property | Value |
|----------|-------|
| **Role** | ${config.role} |
| **TTL** | ${config.ttl} |
| **Parent** | \`${config.inherits_from}\` |
| **Created By** | Lucidia (auto-spawn) |

## Capabilities

${capabilities.map((c) => `- \`${c}\``).join("\n")}

## Triggers

${triggers.map((t) => `- \`${t}\``).join("\n")}

## Outputs

${outputs.map((o) => `- \`${o}\``).join("\n")}

## Spawn Condition

This agent was spawned by Lucidia when the following rule matched:

**Rule:** \`${rule.id}\` – ${rule.name}

\`\`\`yaml
${Object.entries(rule.if)
  .map(([k, v]) => `${k}: "${v}"`)
  .join("\n")}
\`\`\`

## Lifecycle

1. **Spawned**: Auto-created by Lucidia based on metrics
2. **Active**: Processing assigned triggers
3. **Monitored**: Performance tracked by parent agent
4. **Terminated**: TTL expiration or manual shutdown

## Related Agents

- [\`${config.inherits_from}\`](/docs/agents/${config.inherits_from}.mdx) – Parent agent
`;
}

/** Generate complete agent files */
export function generateAgent(rule: SpawnRule): GeneratedAgent {
  return {
    spec: generateAgentSpec(rule),
    prompt: generateAgentPrompt(rule),
    workflow: generateAgentWorkflow(rule),
    docs: generateAgentDocs(rule),
  };
}

/** Generate PR proposal for spawned agent */
export function generateSpawnPR(
  rule: SpawnRule,
  agent: GeneratedAgent
): SpawnPRProposal {
  const { spawn, config } = rule.then;
  const branch = `spawn/${spawn}`;

  return {
    title: `🧬 [spawn] ${spawn} – auto-scaled ${config.role} agent`,
    description: `## 🤖 Auto-Spawn Proposal

Lucidia has detected conditions requiring a new agent and proposes spawning:

### Agent Details

| Property | Value |
|----------|-------|
| **Name** | \`${spawn}\` |
| **Role** | ${config.role} |
| **TTL** | ${config.ttl} |
| **Parent** | \`${config.inherits_from}\` |

### Spawn Reason

**Rule:** \`${rule.id}\` – ${rule.name}

The following conditions were met:
${Object.entries(rule.if)
  .map(([k, v]) => `- \`${k}\`: ${v}`)
  .join("\n")}

### Files Created

- \`agents/${spawn}.agent.json\` – Agent specification
- \`agents/${spawn}.prompt.txt\` – Agent prompt
- \`.github/workflows/${spawn}.workflow.yml\` – Agent workflow
- \`docs/agents/${spawn}.mdx\` – Agent documentation

### Approval Required

cc @alexa – Please review and approve this auto-spawn proposal.

---

*This PR was automatically generated by Lucidia 🧬*
`,
    branch,
    files: [
      {
        path: `agents/${spawn}.agent.json`,
        content: JSON.stringify(agent.spec, null, 2),
      },
      {
        path: `agents/${spawn}.prompt.txt`,
        content: agent.prompt,
      },
      {
        path: `.github/workflows/${spawn}.workflow.yml`,
        content: agent.workflow,
      },
      {
        path: `docs/agents/${spawn}.mdx`,
        content: agent.docs,
      },
    ],
    labels: ["auto-spawn", "lucidia", config.role],
    assignee: "@alexa",
  };
}
