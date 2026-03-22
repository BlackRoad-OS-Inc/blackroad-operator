import { describe, expect, it } from "vitest";
import {
  validateAgent,
  loadAgent,
  loadAllAgents,
  getBaseTemplate,
  createAgentFromTemplate,
  getAgentById,
  listAgentIds,
} from "../src/agents";

describe("Agent Loader", () => {
  describe("validateAgent", () => {
    it("validates a correct agent", () => {
      const agent = {
        id: "test-agent",
        name: "Test Agent",
        role: "worker",
        traits: ["trait1"],
        inputs: ["input1"],
        outputs: ["output1"],
        description: "A test agent",
        triggers: ["trigger1"],
        inherits_from: null,
      };
      const result = validateAgent(agent);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects non-object agent", () => {
      const result = validateAgent(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Agent must be an object");
    });

    it("rejects agent with missing id", () => {
      const agent = {
        name: "Test",
        role: "worker",
        traits: [],
        inputs: [],
        outputs: [],
        description: "",
        triggers: [],
        inherits_from: null,
      };
      const result = validateAgent(agent);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Agent must have a non-empty string 'id'");
    });

    it("rejects agent with non-array traits", () => {
      const agent = {
        id: "test",
        name: "Test",
        role: "worker",
        traits: "not-an-array",
        inputs: [],
        outputs: [],
        description: "",
        triggers: [],
        inherits_from: null,
      };
      const result = validateAgent(agent);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Agent must have an array 'traits'");
    });
  });

  describe("loadAgent", () => {
    it("loads the base agent template", () => {
      const base = loadAgent("base-agent.template.json");
      expect(base.id).toBe("base-agent");
      expect(base.name).toBe("Unnamed Agent");
      expect(base.role).toBe("worker");
      expect(base.active).toBe(true);
    });

    it("loads scribe-agent", () => {
      const agent = loadAgent("scribe-agent.json");
      expect(agent.id).toBe("scribe-agent");
      expect(agent.role).toBe("documentation");
      expect(agent.inherits_from).toBe("base-agent");
    });

    it("loads planner-agent", () => {
      const agent = loadAgent("planner-agent.json");
      expect(agent.id).toBe("planner-agent");
      expect(agent.role).toBe("timeline-scope");
    });

    it("loads qa-agent", () => {
      const agent = loadAgent("qa-agent.json");
      expect(agent.id).toBe("qa-agent");
      expect(agent.role).toBe("verifier");
    });

    it("loads broadcast-agent", () => {
      const agent = loadAgent("broadcast-agent.json");
      expect(agent.id).toBe("broadcast-agent");
      expect(agent.role).toBe("notifier");
    });

    it("loads guardian-agent", () => {
      const agent = loadAgent("guardian-agent.json");
      expect(agent.id).toBe("guardian-agent");
      expect(agent.role).toBe("escalation-monitor");
    });
  });

  describe("loadAllAgents", () => {
    it("loads all agent definitions", () => {
      const agents = loadAllAgents();
      expect(agents.length).toBeGreaterThanOrEqual(6);
      const ids = agents.map((a) => a.id);
      expect(ids).toContain("base-agent");
      expect(ids).toContain("scribe-agent");
      expect(ids).toContain("planner-agent");
      expect(ids).toContain("qa-agent");
      expect(ids).toContain("broadcast-agent");
      expect(ids).toContain("guardian-agent");
    });
  });

  describe("getBaseTemplate", () => {
    it("returns the base template", () => {
      const base = getBaseTemplate();
      expect(base.id).toBe("base-agent");
      expect(base.inherits_from).toBeNull();
    });
  });

  describe("createAgentFromTemplate", () => {
    it("creates a new agent from base template", () => {
      const newAgent = createAgentFromTemplate(
        "custom-agent",
        "Custom Agent",
        "custom-role",
        { traits: ["custom-trait"], description: "A custom agent" }
      );
      expect(newAgent.id).toBe("custom-agent");
      expect(newAgent.name).toBe("Custom Agent");
      expect(newAgent.role).toBe("custom-role");
      expect(newAgent.traits).toEqual(["custom-trait"]);
      expect(newAgent.inherits_from).toBe("base-agent");
    });
  });

  describe("getAgentById", () => {
    it("finds agent by id", () => {
      const agent = getAgentById("scribe-agent");
      expect(agent).toBeDefined();
      expect(agent?.name).toBe("Scribe Agent");
    });

    it("returns undefined for unknown id", () => {
      const agent = getAgentById("unknown-agent");
      expect(agent).toBeUndefined();
    });
  });

  describe("listAgentIds", () => {
    it("lists all agent ids", () => {
      const ids = listAgentIds();
      expect(ids).toContain("base-agent");
      expect(ids).toContain("scribe-agent");
      expect(ids).toContain("guardian-agent");
    });
  });
});
