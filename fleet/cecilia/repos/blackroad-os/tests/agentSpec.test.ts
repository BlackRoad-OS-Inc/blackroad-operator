import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("lucidia.agent-spec.json", () => {
  const specPath = path.resolve(__dirname, "../lucidia.agent-spec.json");
  const spec = JSON.parse(fs.readFileSync(specPath, "utf-8"));

  it("should have a valid version", () => {
    expect(spec.version).toBe("1.0.0");
  });

  it("should have an agents array", () => {
    expect(Array.isArray(spec.agents)).toBe(true);
    expect(spec.agents.length).toBeGreaterThan(0);
  });

  it("should include codex-digest-agent", () => {
    const codexAgent = spec.agents.find((a: any) => a.id === "codex-digest-agent");
    expect(codexAgent).toBeDefined();
    expect(codexAgent.role).toBe("interpreter");
    expect(codexAgent.source).toBe("bot/digest.js");
    expect(codexAgent.traits).toContain("emoji-native");
    expect(codexAgent.triggers).toContain("cron::weekly");
  });

  it("should include guardian-agent", () => {
    const guardianAgent = spec.agents.find((a: any) => a.id === "guardian-agent");
    expect(guardianAgent).toBeDefined();
    expect(guardianAgent.role).toBe("sentinel");
    expect(guardianAgent.triggers).toContain("reaction::🛟");
    expect(guardianAgent.alerts).toContain("planner-agent");
  });

  it("should include planner-agent referenced by guardian-agent", () => {
    const plannerAgent = spec.agents.find((a: any) => a.id === "planner-agent");
    expect(plannerAgent).toBeDefined();
    expect(plannerAgent.role).toBe("orchestrator");
  });

  it("all agents should have required fields", () => {
    spec.agents.forEach((agent: any) => {
      expect(agent.id).toBeDefined();
      expect(agent.role).toBeDefined();
      expect(agent.triggers).toBeDefined();
      expect(Array.isArray(agent.triggers)).toBe(true);
    });
  });
});

describe("base-agent.template.json", () => {
  const templatePath = path.resolve(__dirname, "../base-agent.template.json");
  const template = JSON.parse(fs.readFileSync(templatePath, "utf-8"));

  it("should have a template object", () => {
    expect(template.template).toBeDefined();
    expect(template.template.id).toBeDefined();
    expect(template.template.role).toBeDefined();
  });

  it("should have available roles", () => {
    expect(Array.isArray(template.available_roles)).toBe(true);
    const roleNames = template.available_roles.map((r: any) => r.role);
    expect(roleNames).toContain("interpreter");
    expect(roleNames).toContain("sentinel");
    expect(roleNames).toContain("orchestrator");
  });

  it("should have trigger types documentation", () => {
    expect(Array.isArray(template.available_trigger_types)).toBe(true);
    const triggerTypes = template.available_trigger_types.map((t: any) => t.type);
    expect(triggerTypes).toContain("cron");
    expect(triggerTypes).toContain("reaction");
    expect(triggerTypes).toContain("command");
  });
});
