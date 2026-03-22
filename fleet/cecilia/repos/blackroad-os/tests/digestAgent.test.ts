import { describe, it, expect } from "vitest";

const { CodexDigestAgent } = require("../bot/digest.js");

describe("CodexDigestAgent", () => {
  it("should create an agent with correct id and role", () => {
    const agent = new CodexDigestAgent();
    expect(agent.agentId).toBe("codex-digest-agent");
    expect(agent.role).toBe("interpreter");
  });

  it("should generate markdown summary from emoji digest", () => {
    const agent = new CodexDigestAgent();
    const input = {
      emojiDigest: {
        "✅": { status: "Done", count: 10 },
        "🟡": { status: "In Progress", count: 5 },
      },
      weeklyStats: {
        totalTasks: 15,
        completed: 10,
      },
    };

    const result = agent.process(input);

    expect(result.markdownSummary).toContain("# 📊 Weekly Codex Digest Report");
    expect(result.markdownSummary).toContain("✅");
    expect(result.markdownSummary).toContain("Done");
    expect(result.markdownSummary).toContain("10");
  });

  it("should generate action recommendations for high escalations", () => {
    const agent = new CodexDigestAgent();
    const input = {
      emojiDigest: {},
      weeklyStats: {
        escalations: 15,
      },
    };

    const result = agent.process(input);

    expect(result.actionRecommendations).toContain(
      "🚨 High escalation count detected. Trigger planner-agent for resource reallocation."
    );
  });

  it("should generate healthy status when metrics are good", () => {
    const agent = new CodexDigestAgent();
    const input = {
      emojiDigest: {},
      weeklyStats: {
        escalations: 0,
        blocked: 0,
        completionRate: 85,
      },
    };

    const result = agent.process(input);

    expect(result.actionRecommendations).toContain(
      "✅ All metrics within healthy ranges. Continue current workflow."
    );
  });
});
