import { describe, expect, it } from "vitest";
import {
  generateAgentSpec,
  generateAgentPrompt,
  generateAgentWorkflow,
  generateAgentDocs,
  generateAgent,
  generateSpawnPR,
} from "../src/lucidia/generator";
import type { SpawnRule } from "../src/lucidia/types";

const testRule: SpawnRule = {
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
      description: "Temporary overflow clone of guardian-agent",
    },
  },
};

describe("generateAgentSpec", () => {
  it("generates correct agent specification", () => {
    const spec = generateAgentSpec(testRule);

    expect(spec.name).toBe("guardian-clone-vault");
    expect(spec.role).toBe("sentinel");
    expect(spec.inherits_from).toBe("guardian-agent");
    expect(spec.ttl).toBe("96h");
    expect(spec.created_by).toBe("lucidia");
    expect(spec.capabilities).toContain("monitor_escalations");
    expect(spec.triggers).toContain("escalation_created");
    expect(spec.outputs).toContain("escalation_resolved");
  });
});

describe("generateAgentPrompt", () => {
  it("generates prompt with correct content", () => {
    const prompt = generateAgentPrompt(testRule);

    expect(prompt).toContain("# 🤖 guardian-clone-vault");
    expect(prompt).toContain("Sentinel Agent");
    expect(prompt).toContain("guardian-agent");
    expect(prompt).toContain("96h");
  });
});

describe("generateAgentWorkflow", () => {
  it("generates workflow YAML with correct structure", () => {
    const workflow = generateAgentWorkflow(testRule);

    expect(workflow).toContain("name: 🤖 guardian-clone-vault");
    expect(workflow).toContain("AGENT_NAME: guardian-clone-vault");
    expect(workflow).toContain("AGENT_ROLE: sentinel");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("schedule:");
    expect(workflow).toContain("permissions:");
    expect(workflow).toContain("contents: read");
  });
});

describe("generateAgentDocs", () => {
  it("generates MDX documentation with frontmatter", () => {
    const docs = generateAgentDocs(testRule);

    expect(docs).toContain('title: "guardian-clone-vault"');
    expect(docs).toContain('role: "sentinel"');
    expect(docs).toContain("## Capabilities");
    expect(docs).toContain("## Triggers");
    expect(docs).toContain("## Outputs");
    expect(docs).toContain("## Spawn Condition");
  });
});

describe("generateAgent", () => {
  it("generates all agent files", () => {
    const agent = generateAgent(testRule);

    expect(agent.spec).toBeDefined();
    expect(agent.prompt).toBeDefined();
    expect(agent.workflow).toBeDefined();
    expect(agent.docs).toBeDefined();
  });
});

describe("generateSpawnPR", () => {
  it("generates PR proposal with correct structure", () => {
    const agent = generateAgent(testRule);
    const pr = generateSpawnPR(testRule, agent);

    expect(pr.title).toContain("[spawn]");
    expect(pr.title).toContain("guardian-clone-vault");
    expect(pr.branch).toBe("spawn/guardian-clone-vault");
    expect(pr.labels).toContain("auto-spawn");
    expect(pr.labels).toContain("lucidia");
    expect(pr.assignee).toBe("@alexa");
    expect(pr.files).toHaveLength(4);
  });

  it("generates correct file paths", () => {
    const agent = generateAgent(testRule);
    const pr = generateSpawnPR(testRule, agent);

    const filePaths = pr.files.map((f) => f.path);
    expect(filePaths).toContain("agents/guardian-clone-vault.agent.json");
    expect(filePaths).toContain("agents/guardian-clone-vault.prompt.txt");
    expect(filePaths).toContain(".github/workflows/guardian-clone-vault.workflow.yml");
    expect(filePaths).toContain("docs/agents/guardian-clone-vault.mdx");
  });

  it("includes approval request in description", () => {
    const agent = generateAgent(testRule);
    const pr = generateSpawnPR(testRule, agent);

    expect(pr.description).toContain("@alexa");
    expect(pr.description).toContain("Auto-Spawn Proposal");
    expect(pr.description).toContain("Lucidia");
  });
});
