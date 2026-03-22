import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { spawnAgent, saveAgent } from "../src/agents/spawn-agent";
import { AgentBuilder, AgentRegistry, createAgent } from "../src/agents/lucidia-agent-builder";
import type { Agent } from "../src/agents/types";

const TEST_AGENTS_DIR = path.join(__dirname, "../src/agents");
const TEST_OUTPUT_DIR = "/tmp/test-agents";
const TEST_AGENT_NAME = "test-agent-xyz";
const ROOT_DIR = path.join(__dirname, "..");

describe("spawn-agent utilities", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      const files = fs.readdirSync(TEST_OUTPUT_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(TEST_OUTPUT_DIR, file));
      }
      fs.rmdirSync(TEST_OUTPUT_DIR);
    }
  });

  describe("spawnAgent", () => {
    it("should create an agent with correct ID from name", () => {
      const agent = spawnAgent("Test Agent");
      expect(agent.id).toBe("test-agent");
      expect(agent.name).toBe("Test Agent");
    });

    it("should infer scribe role from name", () => {
      const agent = spawnAgent("scribe-support");
      expect(agent.role).toBe("scribe");
    });

    it("should infer qa role from name", () => {
      const agent = spawnAgent("qa-validator");
      expect(agent.role).toBe("qa");
    });

    it("should infer archive role from name", () => {
      const agent = spawnAgent("archive-manager");
      expect(agent.role).toBe("archive");
    });

    it("should use custom role when specified", () => {
      const agent = spawnAgent("my-agent", { role: "guardian" });
      expect(agent.role).toBe("guardian");
    });

    it("should use custom description when provided", () => {
      const agent = spawnAgent("my-agent", { description: "Custom description" });
      expect(agent.description).toBe("Custom description");
    });

    it("should include parent agent reference", () => {
      const agent = spawnAgent("child-agent", { parent: "parent-agent" });
      expect(agent.parentAgent).toBe("parent-agent");
      expect(agent.metadata?.createdBy).toContain("spawned-by");
    });

    it("should include custom traits", () => {
      const agent = spawnAgent("my-agent", { traits: ["fast", "reliable"] });
      expect(agent.traits).toContain("fast");
      expect(agent.traits).toContain("reliable");
    });

    it("should include base capabilities", () => {
      const agent = spawnAgent("my-agent");
      const capabilityNames = agent.capabilities?.map((c) => c.name) ?? [];
      expect(capabilityNames).toContain("self-describe");
      expect(capabilityNames).toContain("issue-link");
      expect(capabilityNames).toContain("pr-link");
    });

    it("should include role-specific triggers", () => {
      const agent = spawnAgent("scribe-agent");
      const triggerEmojis = (agent.triggers as any[]).map((t) => (typeof t === "string" ? t : t.emoji));
      expect(triggerEmojis).toContain("📝");
    });

    it("should include custom emoji trigger", () => {
      const agent = spawnAgent("my-agent", { emoji: "🔮" });
      const triggerEmojis = (agent.triggers as any[]).map((t) => (typeof t === "string" ? t : t.emoji));
      expect(triggerEmojis).toContain("🔮");
    });

    it("should include metadata with timestamp", () => {
      const agent = spawnAgent("my-agent");
      expect(agent.metadata?.createdAt).toBeDefined();
      expect(agent.metadata?.version).toBe("1.0.0");
    });
  });

  describe("saveAgent", () => {
    it("should save agent to JSON file", () => {
      const agent = spawnAgent("test-save-agent");
      const filePath = saveAgent(agent, TEST_OUTPUT_DIR);

      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, "utf-8");
      const savedAgent = JSON.parse(content) as Agent;
      expect(savedAgent.id).toBe("test-save-agent");
    });
  });
});

describe("AgentBuilder", () => {
  it("should build agent with fluent API", () => {
    const agent = createAgent("Custom Agent")
      .withRole("guardian")
      .withDescription("A custom guardian agent")
      .withTraits("vigilant", "protective")
      .withTrigger("🛡️", "protect")
      .withCapability("monitoring", "Monitors the system", true)
      .build();

    expect(agent.id).toBe("custom-agent");
    expect(agent.name).toBe("Custom Agent");
    expect(agent.role).toBe("guardian");
    expect(agent.description).toBe("A custom guardian agent");
    expect(agent.traits).toContain("vigilant");
    expect(agent.triggers.some((t) => (typeof t === "string" ? t === "🛡️" : t.emoji === "🛡️"))).toBe(
      true
    );
    expect(agent.capabilities?.some((c) => c.name === "monitoring")).toBe(true);
  });

  it("should set parent agent", () => {
    const agent = createAgent("Child Agent").withRole("support").withParent("parent-id").build();

    expect(agent.parentAgent).toBe("parent-id");
  });

  it("should add default capabilities if none provided", () => {
    const agent = createAgent("Simple Agent").withRole("custom").build();

    const capabilityNames = agent.capabilities?.map((c) => c.name) ?? [];
    expect(capabilityNames).toContain("self-describe");
  });
});

describe("AgentRegistry", () => {
  it("should load existing agents", () => {
    const registry = new AgentRegistry(TEST_AGENTS_DIR);
    const agents = registry.loadAll();

    expect(agents.length).toBeGreaterThan(0);

    const agentIds = agents.map((a) => a.id);
    expect(agentIds).toContain("scribe-agent");
    expect(agentIds).toContain("qa-agent");
    expect(agentIds).toContain("guardian-agent");
  });

  it("should get agent by ID", () => {
    const registry = new AgentRegistry(TEST_AGENTS_DIR);
    const agent = registry.get("scribe-agent");

    expect(agent).toBeDefined();
    expect(agent?.role).toBe("scribe");
  });

  it("should find agents by role", () => {
    const registry = new AgentRegistry(TEST_AGENTS_DIR);
    registry.loadAll();
    const qaAgents = registry.findByRole("qa");

    expect(qaAgents.length).toBeGreaterThan(0);
    expect(qaAgents[0].role).toBe("qa");
  });

  it("should find agents by trigger emoji", () => {
    const registry = new AgentRegistry(TEST_AGENTS_DIR);
    registry.loadAll();
    const agents = registry.findByTrigger("📝");

    expect(agents.length).toBeGreaterThan(0);
  });

  it("should list all agent IDs", () => {
    const registry = new AgentRegistry(TEST_AGENTS_DIR);
    const ids = registry.list();

    expect(ids.length).toBeGreaterThan(0);
    expect(ids).toContain("scribe-agent");
  });
});

describe("spawn-agent script", () => {
  const cleanupFiles = () => {
    const paths = [
      path.join(ROOT_DIR, "agents", `${TEST_AGENT_NAME}.agent.json`),
      path.join(ROOT_DIR, "agents", `${TEST_AGENT_NAME}.prompt.txt`),
      path.join(ROOT_DIR, ".github", "workflows", `${TEST_AGENT_NAME}.workflow.yml`),
      path.join(ROOT_DIR, "docs", "agents", `${TEST_AGENT_NAME}.mdx`),
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    }
    const dirs = [path.join(ROOT_DIR, "agents"), path.join(ROOT_DIR, "docs", "agents")];
    for (const d of dirs) {
      if (fs.existsSync(d) && fs.readdirSync(d).length === 0) {
        fs.rmSync(d, { recursive: true });
      }
    }
  };

  beforeEach(() => {
    cleanupFiles();
  });

  afterEach(() => {
    cleanupFiles();
  });

  it("should show error when no agent name provided", () => {
    let error: Error | null = null;
    try {
      execSync("node scripts/spawn-agent.js", { cwd: ROOT_DIR, encoding: "utf-8" });
    } catch (e: any) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(error!.message).toContain("Please provide an agent name");
  });

  it("should create all required files when agent name provided", () => {
    const output = execSync(`node scripts/spawn-agent.js ${TEST_AGENT_NAME}`, {
      cwd: ROOT_DIR,
      encoding: "utf-8",
    });

    expect(output).toContain(`Created agent: ${TEST_AGENT_NAME}`);

    const jsonPath = path.join(ROOT_DIR, "agents", `${TEST_AGENT_NAME}.agent.json`);
    expect(fs.existsSync(jsonPath)).toBe(true);
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    expect(jsonContent.id).toBe(TEST_AGENT_NAME);
    expect(jsonContent.name).toBe("Test Agent Xyz");
    expect(jsonContent.role).toBe("worker");
    expect(jsonContent.traits).toContain("emoji-native");
    expect(jsonContent.inherits_from).toBe("base-agent");

    const promptPath = path.join(ROOT_DIR, "agents", `${TEST_AGENT_NAME}.prompt.txt`);
    expect(fs.existsSync(promptPath)).toBe(true);
    const promptContent = fs.readFileSync(promptPath, "utf-8");
    expect(promptContent).toContain("SYSTEM:");
    expect(promptContent).toContain("Test Agent Xyz");

    const workflowPath = path.join(ROOT_DIR, ".github", "workflows", `${TEST_AGENT_NAME}.workflow.yml`);
    expect(fs.existsSync(workflowPath)).toBe(true);
    const workflowContent = fs.readFileSync(workflowPath, "utf-8");
    expect(workflowContent).toContain("name: Test Agent Xyz Workflow");
    expect(workflowContent).toContain("workflow_dispatch");

    const docPath = path.join(ROOT_DIR, "docs", "agents", `${TEST_AGENT_NAME}.mdx`);
    expect(fs.existsSync(docPath)).toBe(true);
    const docContent = fs.readFileSync(docPath, "utf-8");
    expect(docContent).toContain("# Test Agent Xyz Agent");
    expect(docContent).toContain("Auto-generated");
  });

  it("should convert spaces in agent name to hyphens for agent id", () => {
    const agentNameWithSpaces = "my cool agent";
    const expectedId = "my-cool-agent";

    try {
      const output = execSync(`node scripts/spawn-agent.js "${agentNameWithSpaces}"`, {
        cwd: ROOT_DIR,
        encoding: "utf-8",
      });
      expect(output).toContain(`Created agent: ${expectedId}`);

      const jsonPath = path.join(ROOT_DIR, "agents", `${expectedId}.agent.json`);
      expect(fs.existsSync(jsonPath)).toBe(true);
    } finally {
      const paths = [
        path.join(ROOT_DIR, "agents", `${expectedId}.agent.json`),
        path.join(ROOT_DIR, "agents", `${expectedId}.prompt.txt`),
        path.join(ROOT_DIR, ".github", "workflows", `${expectedId}.workflow.yml`),
        path.join(ROOT_DIR, "docs", "agents", `${expectedId}.mdx`),
      ];
      for (const p of paths) {
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      }
    }
  });
});
