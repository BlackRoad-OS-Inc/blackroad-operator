import { describe, expect, it } from "vitest";
import {
  parseDuration,
  parseCondition,
  evaluateCondition,
  evaluateRule,
  evaluateSpawnRules,
} from "../src/lucidia/evaluator";
import type { Metrics, SpawnRule } from "../src/lucidia/types";

describe("parseDuration", () => {
  it("parses hours correctly", () => {
    expect(parseDuration("48h")).toBe(48);
    expect(parseDuration("96h")).toBe(96);
  });

  it("parses days correctly", () => {
    expect(parseDuration("7d")).toBe(168);
    expect(parseDuration("3d")).toBe(72);
  });

  it("throws on invalid format", () => {
    expect(() => parseDuration("invalid")).toThrow();
    expect(() => parseDuration("48")).toThrow();
  });
});

describe("parseCondition", () => {
  it("parses greater than conditions", () => {
    expect(parseCondition("> 15")).toEqual({ op: ">", value: 15 });
    expect(parseCondition(">10")).toEqual({ op: ">", value: 10 });
  });

  it("parses less than conditions", () => {
    expect(parseCondition("< 5")).toEqual({ op: "<", value: 5 });
  });

  it("parses duration conditions", () => {
    expect(parseCondition("> 48h")).toEqual({ op: ">", value: 48 });
    expect(parseCondition("> 7d")).toEqual({ op: ">", value: 168 });
  });

  it("parses equals conditions", () => {
    expect(parseCondition("= 0")).toEqual({ op: "=", value: 0 });
  });
});

describe("evaluateCondition", () => {
  it("evaluates > correctly", () => {
    expect(evaluateCondition(20, "> 15")).toBe(true);
    expect(evaluateCondition(10, "> 15")).toBe(false);
    expect(evaluateCondition(15, "> 15")).toBe(false);
  });

  it("evaluates < correctly", () => {
    expect(evaluateCondition(5, "< 10")).toBe(true);
    expect(evaluateCondition(15, "< 10")).toBe(false);
  });

  it("evaluates >= correctly", () => {
    expect(evaluateCondition(15, ">= 15")).toBe(true);
    expect(evaluateCondition(20, ">= 15")).toBe(true);
    expect(evaluateCondition(10, ">= 15")).toBe(false);
  });

  it("evaluates = correctly", () => {
    expect(evaluateCondition(0, "= 0")).toBe(true);
    expect(evaluateCondition(1, "= 0")).toBe(false);
  });
});

describe("evaluateRule", () => {
  const testRule: SpawnRule = {
    id: "test-rule",
    name: "Test Rule",
    if: {
      escalations_last_3_days: "> 15",
      agent_load: "> 85",
    },
    then: {
      spawn: "test-agent",
      config: {
        role: "sentinel",
        ttl: "96h",
        inherits_from: "parent-agent",
        description: "Test agent",
      },
    },
  };

  const baseMetrics: Metrics = {
    escalations_last_3_days: 0,
    agent_load: 0,
    blocked_prs: 0,
    avg_review_time: 0,
    unmapped_repos: 0,
    repo_activity_score: 0,
    open_issues: 0,
    avg_issue_age: 0,
    unowned_workflows: 0,
  };

  it("returns true when all conditions match", () => {
    const metrics: Metrics = {
      ...baseMetrics,
      escalations_last_3_days: 18,
      agent_load: 89,
    };
    expect(evaluateRule(testRule, metrics)).toBe(true);
  });

  it("returns false when some conditions don't match", () => {
    const metrics: Metrics = {
      ...baseMetrics,
      escalations_last_3_days: 18,
      agent_load: 50, // Below threshold
    };
    expect(evaluateRule(testRule, metrics)).toBe(false);
  });

  it("returns false when no conditions match", () => {
    const metrics: Metrics = {
      ...baseMetrics,
      escalations_last_3_days: 5,
      agent_load: 50,
    };
    expect(evaluateRule(testRule, metrics)).toBe(false);
  });
});

describe("evaluateSpawnRules", () => {
  const rules: SpawnRule[] = [
    {
      id: "escalation-overflow",
      name: "Escalation Overflow Handler",
      if: {
        escalations_last_3_days: "> 15",
        agent_load: "> 85",
      },
      then: {
        spawn: "guardian-clone-vault",
        config: {
          role: "sentinel",
          ttl: "96h",
          inherits_from: "guardian-agent",
          description: "Temporary overflow clone",
        },
      },
    },
    {
      id: "blocked-pr-queue",
      name: "Blocked PR Queue Handler",
      if: {
        blocked_prs: "> 10",
      },
      then: {
        spawn: "reviewer-assist-agent",
        config: {
          role: "reviewer",
          ttl: "48h",
          inherits_from: "review-agent",
          description: "PR review accelerator",
        },
      },
    },
  ];

  const baseMetrics: Metrics = {
    escalations_last_3_days: 0,
    agent_load: 0,
    blocked_prs: 0,
    avg_review_time: 0,
    unmapped_repos: 0,
    repo_activity_score: 0,
    open_issues: 0,
    avg_issue_age: 0,
    unowned_workflows: 0,
  };

  it("returns first matching rule", () => {
    const metrics: Metrics = {
      ...baseMetrics,
      escalations_last_3_days: 18,
      agent_load: 89,
    };
    const result = evaluateSpawnRules(rules, metrics);
    expect(result.matched).toBe(true);
    expect(result.rule?.id).toBe("escalation-overflow");
  });

  it("returns second rule if first doesn't match", () => {
    const metrics: Metrics = {
      ...baseMetrics,
      blocked_prs: 15,
    };
    const result = evaluateSpawnRules(rules, metrics);
    expect(result.matched).toBe(true);
    expect(result.rule?.id).toBe("blocked-pr-queue");
  });

  it("returns no match when no rules apply", () => {
    const result = evaluateSpawnRules(rules, baseMetrics);
    expect(result.matched).toBe(false);
    expect(result.rule).toBeNull();
  });
});
