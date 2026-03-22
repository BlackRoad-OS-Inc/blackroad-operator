import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";

const {
  spawnAgent,
  idToName,
  inferRole,
  inferTraits,
  inferTags,
  processTemplate
} = require("../scripts/spawn-agent.js");

// Test output directories
const TEST_AGENTS_DIR = path.join(__dirname, "..", "agents");
const TEST_WORKFLOWS_DIR = path.join(__dirname, "..", ".github", "workflows");
const TEST_DOCS_DIR = path.join(__dirname, "..", "docs", "agents");

describe("spawn-agent utilities", () => {
  describe("idToName", () => {
    it("converts hyphenated ID to title case", () => {
      expect(idToName("scribe-support")).toBe("Scribe Support");
      expect(idToName("code-reviewer")).toBe("Code Reviewer");
      expect(idToName("deploy-bot")).toBe("Deploy Bot");
    });

    it("handles single word IDs", () => {
      expect(idToName("monitor")).toBe("Monitor");
    });

    it("handles multiple hyphens", () => {
      expect(idToName("super-code-review-bot")).toBe("Super Code Review Bot");
    });
  });

  describe("inferRole", () => {
    it("infers role from known keywords", () => {
      expect(inferRole("scribe-support")).toContain("Documentation");
      expect(inferRole("code-reviewer")).toContain("Code review");
      expect(inferRole("deploy-bot")).toContain("Deployment");
      expect(inferRole("security-scanner")).toContain("Security");
    });

    it("provides default role for unknown keywords", () => {
      const role = inferRole("custom-agent");
      expect(role).toContain("Custom Agent");
    });
  });

  describe("inferTraits", () => {
    it("includes base traits for all agents", () => {
      const traits = inferTraits("any-agent");
      expect(traits).toContain("autonomous");
      expect(traits).toContain("reliable");
    });

    it("adds specific traits based on keywords", () => {
      const scribeTraits = inferTraits("scribe-support");
      expect(scribeTraits).toContain("detailed");
      expect(scribeTraits).toContain("organized");

      const reviewTraits = inferTraits("code-reviewer");
      expect(reviewTraits).toContain("thorough");
      expect(reviewTraits).toContain("analytical");
    });
  });

  describe("inferTags", () => {
    it("includes base tags", () => {
      const tags = inferTags("any-agent");
      expect(tags).toContain("agent");
      expect(tags).toContain("blackroad-os");
    });

    it("includes agent ID parts as tags", () => {
      const tags = inferTags("scribe-support");
      expect(tags).toContain("scribe");
      expect(tags).toContain("support");
    });
  });

  describe("processTemplate", () => {
    it("replaces placeholders with values", () => {
      const template = "Hello {{NAME}}, your role is {{ROLE}}.";
      const result = processTemplate(template, {
        NAME: "TestAgent",
        ROLE: "Tester"
      });
      expect(result).toBe("Hello TestAgent, your role is Tester.");
    });

    it("replaces multiple occurrences", () => {
      const template = "{{ID}} is {{ID}}";
      const result = processTemplate(template, { ID: "test" });
      expect(result).toBe("test is test");
    });
  });
});

describe("spawnAgent", () => {
  const testAgentId = "test-spawn-agent-" + Date.now();
  let createdFiles: string[] = [];

  afterEach(() => {
    // Clean up created files
    for (const file of createdFiles) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch {
        // Ignore cleanup errors
      }
    }
    createdFiles = [];
  });

  it("creates agent files successfully", () => {
    const result = spawnAgent(testAgentId);

    expect(result.agentId).toBe(testAgentId);
    expect(result.outputs).toHaveLength(4);

    // Track created files for cleanup
    createdFiles = [
      path.join(TEST_AGENTS_DIR, `${testAgentId}.agent.json`),
      path.join(TEST_AGENTS_DIR, `${testAgentId}.prompt.txt`),
      path.join(TEST_WORKFLOWS_DIR, `${testAgentId}.workflow.yml`),
      path.join(TEST_DOCS_DIR, `${testAgentId}.mdx`)
    ];

    // Verify files were created
    expect(fs.existsSync(createdFiles[0])).toBe(true);
    expect(fs.existsSync(createdFiles[1])).toBe(true);
    expect(fs.existsSync(createdFiles[2])).toBe(true);
    expect(fs.existsSync(createdFiles[3])).toBe(true);

    // Verify JSON content
    const agentJson = JSON.parse(fs.readFileSync(createdFiles[0], "utf8"));
    expect(agentJson.id).toBe(testAgentId);
    expect(agentJson.version).toBe("1.0.0");
    expect(agentJson.metadata.author).toBe("BlackRoad-OS");
  });

  it("skips docs when option is set", () => {
    const result = spawnAgent(testAgentId + "-nodocs", { skipDocs: true });

    expect(result.outputs).toHaveLength(3);
    expect(result.outputs.some((o: string) => o.includes(".mdx"))).toBe(false);

    // Track created files for cleanup
    createdFiles = [
      path.join(TEST_AGENTS_DIR, `${testAgentId}-nodocs.agent.json`),
      path.join(TEST_AGENTS_DIR, `${testAgentId}-nodocs.prompt.txt`),
      path.join(TEST_WORKFLOWS_DIR, `${testAgentId}-nodocs.workflow.yml`)
    ];
  });

  it("throws error if agent already exists", () => {
    // Create first agent
    spawnAgent(testAgentId + "-dup");

    // Track for cleanup
    createdFiles = [
      path.join(TEST_AGENTS_DIR, `${testAgentId}-dup.agent.json`),
      path.join(TEST_AGENTS_DIR, `${testAgentId}-dup.prompt.txt`),
      path.join(TEST_WORKFLOWS_DIR, `${testAgentId}-dup.workflow.yml`),
      path.join(TEST_DOCS_DIR, `${testAgentId}-dup.mdx`)
    ];

    // Try to create duplicate
    expect(() => spawnAgent(testAgentId + "-dup")).toThrow("already exists");
  });

  it("throws error if agent ID is missing", () => {
    expect(() => spawnAgent("")).toThrow("Agent ID is required");
    expect(() => spawnAgent(null as any)).toThrow("Agent ID is required");
  });

  it("normalizes agent ID", () => {
    const result = spawnAgent("Test_Agent.123");
    expect(result.agentId).toBe("test-agent-123");

    createdFiles = [
      path.join(TEST_AGENTS_DIR, "test-agent-123.agent.json"),
      path.join(TEST_AGENTS_DIR, "test-agent-123.prompt.txt"),
      path.join(TEST_WORKFLOWS_DIR, "test-agent-123.workflow.yml"),
      path.join(TEST_DOCS_DIR, "test-agent-123.mdx")
    ];
  });
});
