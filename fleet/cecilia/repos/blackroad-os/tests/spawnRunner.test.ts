import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs";
import os from "os";

// Import the module functions
const spawnRunner = require("../bot/lucidia-spawn-runner.js");

describe("lucidia-spawn-runner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parseTTL", () => {
    it("parses days correctly", () => {
      expect(spawnRunner.parseTTL("14d")).toBe(14 * 24 * 60 * 60 * 1000);
      expect(spawnRunner.parseTTL("7d")).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it("parses hours correctly", () => {
      expect(spawnRunner.parseTTL("24h")).toBe(24 * 60 * 60 * 1000);
      expect(spawnRunner.parseTTL("1h")).toBe(60 * 60 * 1000);
    });

    it("parses minutes correctly", () => {
      expect(spawnRunner.parseTTL("30m")).toBe(30 * 60 * 1000);
    });

    it("parses seconds correctly", () => {
      expect(spawnRunner.parseTTL("60s")).toBe(60 * 1000);
    });

    it("returns null for invalid TTL", () => {
      expect(spawnRunner.parseTTL(null)).toBeNull();
      expect(spawnRunner.parseTTL("invalid")).toBeNull();
      expect(spawnRunner.parseTTL("")).toBeNull();
    });
  });

  describe("evaluateCondition", () => {
    it("evaluates > condition correctly", () => {
      expect(spawnRunner.evaluateCondition("> 10", 15)).toBe(true);
      expect(spawnRunner.evaluateCondition("> 10", 10)).toBe(false);
      expect(spawnRunner.evaluateCondition("> 10", 5)).toBe(false);
    });

    it("evaluates >= condition correctly", () => {
      expect(spawnRunner.evaluateCondition(">= 10", 15)).toBe(true);
      expect(spawnRunner.evaluateCondition(">= 10", 10)).toBe(true);
      expect(spawnRunner.evaluateCondition(">= 10", 5)).toBe(false);
    });

    it("evaluates < condition correctly", () => {
      expect(spawnRunner.evaluateCondition("< 10", 5)).toBe(true);
      expect(spawnRunner.evaluateCondition("< 10", 10)).toBe(false);
    });

    it("evaluates <= condition correctly", () => {
      expect(spawnRunner.evaluateCondition("<= 10", 5)).toBe(true);
      expect(spawnRunner.evaluateCondition("<= 10", 10)).toBe(true);
      expect(spawnRunner.evaluateCondition("<= 10", 15)).toBe(false);
    });

    it("evaluates = and == condition correctly", () => {
      expect(spawnRunner.evaluateCondition("= 10", 10)).toBe(true);
      expect(spawnRunner.evaluateCondition("== 10", 10)).toBe(true);
      expect(spawnRunner.evaluateCondition("= 10", 5)).toBe(false);
    });

    it("evaluates != condition correctly", () => {
      expect(spawnRunner.evaluateCondition("!= 10", 5)).toBe(true);
      expect(spawnRunner.evaluateCondition("!= 10", 10)).toBe(false);
    });

    it("handles percentage conditions", () => {
      expect(spawnRunner.evaluateCondition("> 20%", 25)).toBe(true);
      expect(spawnRunner.evaluateCondition("> 20%", 15)).toBe(false);
    });

    it("returns false for non-string condition", () => {
      expect(spawnRunner.evaluateCondition(null, 10)).toBe(false);
      expect(spawnRunner.evaluateCondition(123, 10)).toBe(false);
    });

    it("returns false for invalid condition format", () => {
      expect(spawnRunner.evaluateCondition("invalid", 10)).toBe(false);
    });
  });

  describe("evaluateRule", () => {
    it("returns true when all conditions are met", () => {
      const conditions = {
        escalations_last_7_days: "> 10",
      };
      const metrics = {
        escalations_last_7_days: 15,
      };
      expect(spawnRunner.evaluateRule(conditions, metrics)).toBe(true);
    });

    it("returns false when any condition is not met", () => {
      const conditions = {
        escalations_last_7_days: "> 10",
        digest_count: "> 5",
      };
      const metrics = {
        escalations_last_7_days: 15,
        digest_count: 3,
      };
      expect(spawnRunner.evaluateRule(conditions, metrics)).toBe(false);
    });

    it("returns true when multiple conditions are all met", () => {
      const conditions = {
        digest_count: "> 4",
        average_blocked_pct: "> 20%",
      };
      const metrics = {
        digest_count: 6,
        average_blocked_pct: 25,
      };
      expect(spawnRunner.evaluateRule(conditions, metrics)).toBe(true);
    });

    it("continues evaluation when metric is missing", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const conditions = {
        unknown_metric: "> 10",
        known_metric: "> 5",
      };
      const metrics = {
        known_metric: 10,
      };
      expect(spawnRunner.evaluateRule(conditions, metrics)).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  describe("spawnAgent", () => {
    it("creates an agent with correct properties", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const spawnConfig = {
        spawn: "guardian-clone-agent",
        config: {
          role: "sentinel",
          traits: ["incident-response", "human-routing"],
          parent: "guardian-agent",
          ttl: "14d",
          log_channel: "escalations.log",
        },
      };

      const agent = spawnRunner.spawnAgent(spawnConfig);

      expect(agent.type).toBe("guardian-clone-agent");
      expect(agent.role).toBe("sentinel");
      expect(agent.traits).toEqual(["incident-response", "human-routing"]);
      expect(agent.parent).toBe("guardian-agent");
      expect(agent.ttl).toBe(14 * 24 * 60 * 60 * 1000);
      expect(agent.log_channel).toBe("escalations.log");
      expect(agent.spawned_at).toBeDefined();
      expect(agent.id).toContain("guardian-clone-agent-");

      consoleSpy.mockRestore();
    });

    it("uses inherits_from when parent is not specified", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const spawnConfig = {
        spawn: "digest-auditor-agent",
        config: {
          role: "analyst",
          inherits_from: "codex-digest-agent",
        },
      };

      const agent = spawnRunner.spawnAgent(spawnConfig);
      expect(agent.parent).toBe("codex-digest-agent");

      consoleSpy.mockRestore();
    });

    it("handles missing config gracefully", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const spawnConfig = {
        spawn: "simple-agent",
      };

      const agent = spawnRunner.spawnAgent(spawnConfig);
      expect(agent.type).toBe("simple-agent");
      expect(agent.role).toBe("worker");
      expect(agent.traits).toEqual([]);
      expect(agent.parent).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe("parseSpawnRules", () => {
    it("parses a simple spawn rule", () => {
      const yaml = `
spawn_rules:
  - if:
      escalations_last_7_days: "> 10"
    then:
      spawn: guardian-clone-agent
      config:
        role: sentinel
        ttl: 14d
`;
      const result = spawnRunner.parseSpawnRules(yaml);

      expect(result.spawn_rules).toHaveLength(1);
      expect(result.spawn_rules[0].if.escalations_last_7_days).toBe("> 10");
      expect(result.spawn_rules[0].then.spawn).toBe("guardian-clone-agent");
      expect(result.spawn_rules[0].then.config.role).toBe("sentinel");
      expect(result.spawn_rules[0].then.config.ttl).toBe("14d");
    });

    it("parses multiple spawn rules", () => {
      const yaml = `
spawn_rules:
  - if:
      escalations_last_7_days: "> 10"
    then:
      spawn: guardian-clone-agent
  - if:
      digest_count: "> 4"
    then:
      spawn: digest-auditor-agent
`;
      const result = spawnRunner.parseSpawnRules(yaml);

      expect(result.spawn_rules).toHaveLength(2);
      expect(result.spawn_rules[0].then.spawn).toBe("guardian-clone-agent");
      expect(result.spawn_rules[1].then.spawn).toBe("digest-auditor-agent");
    });

    it("handles array values in config", () => {
      const yaml = `
spawn_rules:
  - if:
      created_repos_last_72h: "> 5"
    then:
      spawn: repo-mapper-agent
      config:
        outputs: ["org-registry.json", "repo-trees.mdx"]
`;
      const result = spawnRunner.parseSpawnRules(yaml);

      expect(result.spawn_rules[0].then.config.outputs).toEqual([
        "org-registry.json",
        "repo-trees.mdx",
      ]);
    });

    it("skips comments and empty lines", () => {
      const yaml = `
# This is a comment
spawn_rules:
  - if:
      escalations_last_7_days: "> 10"
    then:
      spawn: guardian-clone-agent
`;
      const result = spawnRunner.parseSpawnRules(yaml);

      expect(result.spawn_rules).toHaveLength(1);
    });
  });

  describe("runSpawnEvaluator", () => {
    it("returns empty array when rules file does not exist", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = spawnRunner.runSpawnEvaluator("/nonexistent/path.yml", {});

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "🚫 Spawn rules file not found: /nonexistent/path.yml"
      );

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it("spawns agents when conditions are met", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      
      // Create a temp file with test spawn rules using cross-platform temp directory
      const tempPath = path.join(os.tmpdir(), "test-spawn-rules.yml");
      fs.writeFileSync(tempPath, `
spawn_rules:
  - if:
      escalations_last_7_days: "> 10"
    then:
      spawn: guardian-clone-agent
      config:
        role: sentinel
`);

      const metrics = {
        escalations_last_7_days: 15,
      };

      const result = spawnRunner.runSpawnEvaluator(tempPath, metrics);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("guardian-clone-agent");
      expect(result[0].role).toBe("sentinel");

      // Cleanup
      fs.unlinkSync(tempPath);
      consoleSpy.mockRestore();
    });

    it("does not spawn agents when conditions are not met", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      
      // Create a temp file with test spawn rules using cross-platform temp directory
      const tempPath = path.join(os.tmpdir(), "test-spawn-rules-2.yml");
      fs.writeFileSync(tempPath, `
spawn_rules:
  - if:
      escalations_last_7_days: "> 10"
    then:
      spawn: guardian-clone-agent
`);

      const metrics = {
        escalations_last_7_days: 5,
      };

      const result = spawnRunner.runSpawnEvaluator(tempPath, metrics);

      expect(result).toHaveLength(0);

      // Cleanup
      fs.unlinkSync(tempPath);
      consoleSpy.mockRestore();
    });
  });

  describe("getDefaultMetrics", () => {
    it("returns metrics from environment variables", () => {
      const originalEnv = process.env;

      process.env = {
        ...originalEnv,
        ESCALATIONS_LAST_7_DAYS: "12",
        DIGEST_COUNT: "5",
        AVERAGE_BLOCKED_PCT: "25.5",
        CREATED_REPOS_LAST_72H: "8",
        OVERDUE_ISSUES_COUNT: "30",
        EMOJI_THRESHOLD: "60",
        EMOJI_TYPE: "🛟",
      };

      const metrics = spawnRunner.getDefaultMetrics();

      expect(metrics.escalations_last_7_days).toBe(12);
      expect(metrics.digest_count).toBe(5);
      expect(metrics.average_blocked_pct).toBe(25.5);
      expect(metrics.created_repos_last_72h).toBe(8);
      expect(metrics.overdue_issues_count).toBe(30);
      expect(metrics.emoji_threshold).toBe(60);
      expect(metrics.emoji_type).toBe("🛟");

      process.env = originalEnv;
    });

    it("returns default zero values when env vars are not set", () => {
      const originalEnv = process.env;

      process.env = { ...originalEnv };
      delete process.env.ESCALATIONS_LAST_7_DAYS;
      delete process.env.DIGEST_COUNT;
      delete process.env.AVERAGE_BLOCKED_PCT;
      delete process.env.CREATED_REPOS_LAST_72H;
      delete process.env.OVERDUE_ISSUES_COUNT;
      delete process.env.EMOJI_THRESHOLD;
      delete process.env.EMOJI_TYPE;

      const metrics = spawnRunner.getDefaultMetrics();

      expect(metrics.escalations_last_7_days).toBe(0);
      expect(metrics.digest_count).toBe(0);
      expect(metrics.average_blocked_pct).toBe(0);
      expect(metrics.created_repos_last_72h).toBe(0);
      expect(metrics.overdue_issues_count).toBe(0);
      expect(metrics.emoji_threshold).toBe(0);
      expect(metrics.emoji_type).toBe("");

      process.env = originalEnv;
    });
  });
});
