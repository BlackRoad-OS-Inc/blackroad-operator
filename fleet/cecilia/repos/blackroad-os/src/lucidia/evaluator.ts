/**
 * 🧬 Lucidia Spawn Evaluator
 * Evaluates metrics against spawn rules to determine agent spawning
 */

import type {
  Metrics,
  SpawnCondition,
  SpawnRule,
  SpawnEvaluationResult,
} from "./types";

/** Parse duration string to hours (e.g., "48h" -> 48, "7d" -> 168) */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(h|d)$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  return unit === "d" ? value * 24 : value;
}

/** Parse comparison operator and value from condition string */
export function parseCondition(condition: string): { op: string; value: number } {
  const match = condition.match(/^(>|<|>=|<=|=)\s*(\d+)(h|d)?$/);
  if (!match) {
    throw new Error(`Invalid condition format: ${condition}`);
  }
  let value = parseInt(match[2], 10);
  const unit = match[3];
  // Convert duration units to hours
  if (unit === "d") {
    value = value * 24;
  }
  return { op: match[1], value };
}

/** Evaluate a single condition against a metric value */
export function evaluateCondition(metricValue: number, condition: string): boolean {
  const { op, value } = parseCondition(condition);
  switch (op) {
    case ">":
      return metricValue > value;
    case "<":
      return metricValue < value;
    case ">=":
      return metricValue >= value;
    case "<=":
      return metricValue <= value;
    case "=":
      return metricValue === value;
    default:
      return false;
  }
}

/** Map condition key to metrics property */
function getMetricValue(metrics: Metrics, key: keyof SpawnCondition): number | undefined {
  const mapping: Record<keyof SpawnCondition, keyof Metrics> = {
    escalations_last_3_days: "escalations_last_3_days",
    agent_load: "agent_load",
    blocked_prs: "blocked_prs",
    avg_review_time: "avg_review_time",
    unmapped_repos: "unmapped_repos",
    repo_activity_score: "repo_activity_score",
    open_issues: "open_issues",
    avg_issue_age: "avg_issue_age",
    unowned_workflows: "unowned_workflows",
  };
  const metricKey = mapping[key];
  return metricKey ? metrics[metricKey] : undefined;
}

/** Evaluate all conditions in a spawn rule against current metrics */
export function evaluateRule(rule: SpawnRule, metrics: Metrics): boolean {
  const conditions = rule.if;
  for (const [key, condition] of Object.entries(conditions)) {
    if (!condition) continue;
    const metricValue = getMetricValue(metrics, key as keyof SpawnCondition);
    if (metricValue === undefined) {
      return false;
    }
    if (!evaluateCondition(metricValue, condition)) {
      return false;
    }
  }
  return true;
}

/** Evaluate all spawn rules against current metrics and return first match */
export function evaluateSpawnRules(
  rules: SpawnRule[],
  metrics: Metrics
): SpawnEvaluationResult {
  for (const rule of rules) {
    if (evaluateRule(rule, metrics)) {
      return {
        matched: true,
        rule,
        reason: `Rule "${rule.name}" matched: metrics exceeded thresholds`,
      };
    }
  }
  return {
    matched: false,
    rule: null,
    reason: "No spawn rules matched current metrics",
  };
}
