import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { parse } from "yaml";
import { join } from "path";
import { Lucidia, createLucidia } from "../src/lucidia";
import type { SpawnRulesConfig, Metrics } from "../src/lucidia/types";

describe("lucidia.yml", () => {
  const lucidiaPath = join(__dirname, "..", "lucidia.yml");
  const lucidiaContent = readFileSync(lucidiaPath, "utf8");
  const lucidia = parse(lucidiaContent);

  it("has required version and meta fields", () => {
    expect(lucidia.version).toBe("1.0");
    expect(lucidia.meta).toBeDefined();
    expect(lucidia.meta.name).toBe("Lucidia");
    expect(lucidia.meta.description).toBeDefined();
  });

  it("defines emoji registry with status and reactions", () => {
    expect(lucidia.emoji_registry).toBeDefined();
    expect(lucidia.emoji_registry.status).toBeDefined();
    expect(lucidia.emoji_registry.reactions).toBeDefined();

    // Verify key emoji mappings
    expect(lucidia.emoji_registry.status["✅"]).toBe("Done");
    expect(lucidia.emoji_registry.status["❌"]).toBe("Blocked");
    expect(lucidia.emoji_registry.status["🛟"]).toBe("Escalation");
    expect(lucidia.emoji_registry.status["🤔"]).toBe("Needs Review");
    expect(lucidia.emoji_registry.status["📊"]).toBe("Metrics");
  });

  it("defines codex-digest-agent with required properties", () => {
    const agent = lucidia.agents["codex-digest-agent"];
    expect(agent).toBeDefined();
    expect(agent.role).toBe("interpreter");
    expect(agent.description).toContain("emoji-based agent performance");
    expect(agent.triggers).toBeInstanceOf(Array);
    expect(agent.traits).toBeInstanceOf(Array);
    expect(agent.outputs).toBeInstanceOf(Array);
    expect(agent.outputs).toContain("markdown-summary");
    expect(agent.outputs).toContain("actionable-recommendations");
    expect(agent.outputs).toContain("escalation-alerts");
  });

  it("defines guardian-agent with sentinel role", () => {
    const agent = lucidia.agents["guardian-agent"];
    expect(agent).toBeDefined();
    expect(agent.role).toBe("sentinel");
    expect(agent.responds_to).toContain("🛟");
    expect(agent.responds_to).toContain("❌");
    expect(agent.alerts).toContain("security-team");
    expect(agent.alerts).toContain("planner-agent");
  });

  it("defines planner-agent for orchestration", () => {
    const agent = lucidia.agents["planner-agent"];
    expect(agent).toBeDefined();
    expect(agent.role).toBe("orchestrator");
    expect(agent.responds_to).toContain("📊");
    expect(agent.responds_to).toContain("🤔");
  });

  it("has routing rules for agent orchestration", () => {
    expect(lucidia.routing).toBeDefined();
    expect(lucidia.routing["digest-to-escalation"]).toBeDefined();
    expect(lucidia.routing["digest-to-escalation"].from).toBe("codex-digest-agent");
    expect(lucidia.routing["escalation-to-guardian"]).toBeDefined();
    expect(lucidia.routing["escalation-to-guardian"].to).toBe("guardian-agent");
  });

  it("has output configuration for different formats", () => {
    expect(lucidia.outputs).toBeDefined();
    expect(lucidia.outputs["markdown-summary"]).toBeDefined();
    expect(lucidia.outputs["markdown-summary"].format).toBe("markdown");
    expect(lucidia.outputs["actionable-recommendations"]).toBeDefined();
    expect(lucidia.outputs["escalation-alerts"]).toBeDefined();
  });
});

const testConfig: SpawnRulesConfig = {
  version: "1.0.0",
  settings: {
    approval_required: true,
    approver: "@alexa",
    default_ttl: "72h",
    max_clones: 3,
    cooldown_period: "24h",
  },
  rules: [
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
  ],
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

describe("Lucidia", () => {
  describe("createLucidia", () => {
    it("creates Lucidia instance from config", () => {
      const lucidia = createLucidia(testConfig);
      expect(lucidia).toBeInstanceOf(Lucidia);
    });
  });

  describe("getSettings", () => {
    it("returns configured settings", () => {
      const lucidia = new Lucidia(testConfig);
      const settings = lucidia.getSettings();

      expect(settings.approval_required).toBe(true);
      expect(settings.approver).toBe("@alexa");
      expect(settings.max_clones).toBe(3);
    });
  });

  describe("getRules", () => {
    it("returns configured rules", () => {
      const lucidia = new Lucidia(testConfig);
      const rules = lucidia.getRules();

      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe("escalation-overflow");
    });
  });

  describe("detect", () => {
    it("detects matching conditions", () => {
      const lucidia = new Lucidia(testConfig);
      const metrics: Metrics = {
        ...baseMetrics,
        escalations_last_3_days: 18,
        agent_load: 89,
      };

      const result = lucidia.detect(metrics);

      expect(result.matched).toBe(true);
      expect(result.rule?.id).toBe("escalation-overflow");
    });

    it("returns no match for normal conditions", () => {
      const lucidia = new Lucidia(testConfig);
      const result = lucidia.detect(baseMetrics);

      expect(result.matched).toBe(false);
      expect(result.rule).toBeNull();
    });
  });

  describe("write", () => {
    it("generates agent files", () => {
      const lucidia = new Lucidia(testConfig);
      const agent = lucidia.write(testConfig.rules[0]);

      expect(agent.spec.name).toBe("guardian-clone-vault");
      expect(agent.prompt).toBeDefined();
      expect(agent.workflow).toBeDefined();
      expect(agent.docs).toBeDefined();
    });
  });

  describe("propose", () => {
    it("creates PR proposal", () => {
      const lucidia = new Lucidia(testConfig);
      const agent = lucidia.write(testConfig.rules[0]);
      const pr = lucidia.propose(testConfig.rules[0], agent);

      expect(pr.title).toContain("guardian-clone-vault");
      expect(pr.files).toHaveLength(4);
    });
  });

  describe("spawn", () => {
    it("executes full spawn pipeline when conditions match", () => {
      const lucidia = new Lucidia(testConfig);
      const metrics: Metrics = {
        ...baseMetrics,
        escalations_last_3_days: 18,
        agent_load: 89,
      };

      const { result, agent, pr } = lucidia.spawn(metrics);

      expect(result.matched).toBe(true);
      expect(agent).toBeDefined();
      expect(agent?.spec.name).toBe("guardian-clone-vault");
      expect(pr).toBeDefined();
      expect(pr?.title).toContain("[spawn]");
    });

    it("returns only result when no match", () => {
      const lucidia = new Lucidia(testConfig);
      const { result, agent, pr } = lucidia.spawn(baseMetrics);

      expect(result.matched).toBe(false);
      expect(agent).toBeUndefined();
      expect(pr).toBeUndefined();
    });
  });
});
