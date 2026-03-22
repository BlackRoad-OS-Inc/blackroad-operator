/**
 * 🧬 Lucidia Spawn Types
 * Type definitions for the auto-spawn system
 */

/** Metrics tracked by Lucidia for spawn decisions */
export interface Metrics {
  /** Number of escalations in the last 3 days */
  escalations_last_3_days: number;
  /** Current agent load percentage (0-100) */
  agent_load: number;
  /** Number of blocked pull requests */
  blocked_prs: number;
  /** Average PR review time in hours */
  avg_review_time: number;
  /** Number of unmapped repositories */
  unmapped_repos: number;
  /** Repository activity score (0-100) */
  repo_activity_score: number;
  /** Number of open issues */
  open_issues: number;
  /** Average issue age in days */
  avg_issue_age: number;
  /** Number of unowned workflows */
  unowned_workflows: number;
}

/** Condition for triggering a spawn rule */
export interface SpawnCondition {
  escalations_last_3_days?: string;
  agent_load?: string;
  blocked_prs?: string;
  avg_review_time?: string;
  unmapped_repos?: string;
  repo_activity_score?: string;
  open_issues?: string;
  avg_issue_age?: string;
  unowned_workflows?: string;
}

/** Agent role types */
export type AgentRole = "sentinel" | "reviewer" | "mapper" | "triage" | "maintainer";

/** Configuration for a spawned agent */
export interface SpawnConfig {
  role: AgentRole;
  ttl: string;
  inherits_from: string;
  description: string;
}

/** Spawn action definition */
export interface SpawnAction {
  spawn: string;
  config: SpawnConfig;
}

/** A single spawn rule */
export interface SpawnRule {
  id: string;
  name: string;
  if: SpawnCondition;
  then: SpawnAction;
}

/** Global spawn settings */
export interface SpawnSettings {
  approval_required: boolean;
  approver: string;
  default_ttl: string;
  max_clones: number;
  cooldown_period: string;
}

/** Complete spawn rules configuration */
export interface SpawnRulesConfig {
  version: string;
  settings: SpawnSettings;
  rules: SpawnRule[];
}

/** Agent JSON specification */
export interface AgentSpec {
  name: string;
  version: string;
  role: AgentRole;
  inherits_from: string;
  ttl: string;
  description: string;
  created_at: string;
  created_by: string;
  capabilities: string[];
  triggers: string[];
  outputs: string[];
}

/** Result of a spawn rule evaluation */
export interface SpawnEvaluationResult {
  matched: boolean;
  rule: SpawnRule | null;
  reason: string;
}

/** Generated agent files */
export interface GeneratedAgent {
  spec: AgentSpec;
  prompt: string;
  workflow: string;
  docs: string;
}

/** PR proposal for a spawned agent */
export interface SpawnPRProposal {
  title: string;
  description: string;
  branch: string;
  files: {
    path: string;
    content: string;
  }[];
  labels: string[];
  assignee: string;
}
