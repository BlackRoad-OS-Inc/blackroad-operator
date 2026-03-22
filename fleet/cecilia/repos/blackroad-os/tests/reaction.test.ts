import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Import bot modules - using require since they are CommonJS
const projectStatusSync = require("../bot/handlers/project-status-sync.js");
const emojiAgentRouter = require("../bot/emoji-agent-router.js");
const agentMathUtils = require("../bot/agent-math-utils.js");
const projectStatusService = require("../bot/project-status-service.js");

describe("project-status-sync", () => {
  describe("mapEmojiToStatus", () => {
    it("maps ✅ to Done", () => {
      expect(projectStatusSync.mapEmojiToStatus("✅")).toBe("Done");
    });

    it("maps 🟡 to In Progress", () => {
      expect(projectStatusSync.mapEmojiToStatus("🟡")).toBe("In Progress");
    });

    it("maps ⬜ to Not Started", () => {
      expect(projectStatusSync.mapEmojiToStatus("⬜")).toBe("Not Started");
    });

    it("maps ❌ to Blocked", () => {
      expect(projectStatusSync.mapEmojiToStatus("❌")).toBe("Blocked");
    });

    it("maps 🔁 to Rework", () => {
      expect(projectStatusSync.mapEmojiToStatus("🔁")).toBe("Rework");
    });

    it("maps 🤔 to Needs Review", () => {
      expect(projectStatusSync.mapEmojiToStatus("🤔")).toBe("Needs Review");
    });

    it("maps 🛟 to Escalation", () => {
      expect(projectStatusSync.mapEmojiToStatus("🛟")).toBe("Escalation");
    });

    it("returns null for unknown emoji", () => {
      expect(projectStatusSync.mapEmojiToStatus("🎉")).toBeNull();
    });
  });

  describe("mapReactionToStatus", () => {
    it("maps hooray to Done", () => {
      expect(projectStatusSync.mapReactionToStatus("hooray")).toBe("Done");
    });

    it("maps rocket to Done", () => {
      expect(projectStatusSync.mapReactionToStatus("rocket")).toBe("Done");
    });

    it("maps eyes to In Progress", () => {
      expect(projectStatusSync.mapReactionToStatus("eyes")).toBe("In Progress");
    });

    it("maps -1 to Blocked", () => {
      expect(projectStatusSync.mapReactionToStatus("-1")).toBe("Blocked");
    });

    it("maps confused to Blocked", () => {
      expect(projectStatusSync.mapReactionToStatus("confused")).toBe("Blocked");
    });

    it("maps thinking_face to Needs Review", () => {
      expect(projectStatusSync.mapReactionToStatus("thinking_face")).toBe(
        "Needs Review"
      );
    });

    it("maps rotating_light to Escalation", () => {
      expect(projectStatusSync.mapReactionToStatus("rotating_light")).toBe(
        "Escalation"
      );
    });

    it("returns null for unknown reaction", () => {
      expect(projectStatusSync.mapReactionToStatus("heart")).toBeNull();
    });
  });

  describe("syncProjectStatus", () => {
    it("returns success for valid reaction", async () => {
      const result = await projectStatusSync.syncProjectStatus({
        reaction: "rocket",
        issueId: 123,
        projectId: 456
      });

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe("Done");
      expect(result.issueId).toBe(123);
      expect(result.projectId).toBe(456);
    });

    it("returns failure for unknown reaction", async () => {
      const result = await projectStatusSync.syncProjectStatus({
        reaction: "unknown",
        issueId: 123,
        projectId: 456
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("No status mapping");
    });
  });
});

describe("emoji-agent-router", () => {
  describe("routeEmoji", () => {
    it("routes ✅ to status-agent with mark_done action", () => {
      const route = emojiAgentRouter.routeEmoji("✅");
      expect(route).toEqual({ agent: "status-agent", action: "mark_done" });
    });

    it("routes 🛟 to guardian-agent with escalate action", () => {
      const route = emojiAgentRouter.routeEmoji("🛟");
      expect(route).toEqual({ agent: "guardian-agent", action: "escalate" });
    });

    it("routes 🤖 to auto-assign-agent", () => {
      const route = emojiAgentRouter.routeEmoji("🤖");
      expect(route).toEqual({ agent: "auto-assign-agent", action: "auto_assign" });
    });

    it("returns null for unrouted emoji", () => {
      expect(emojiAgentRouter.routeEmoji("🎉")).toBeNull();
    });
  });

  describe("routeReaction", () => {
    it("routes rocket to status-agent with mark_done action", () => {
      const route = emojiAgentRouter.routeReaction("rocket");
      expect(route).toEqual({ agent: "status-agent", action: "mark_done" });
    });

    it("routes eyes to status-agent with mark_in_progress action", () => {
      const route = emojiAgentRouter.routeReaction("eyes");
      expect(route).toEqual({
        agent: "status-agent",
        action: "mark_in_progress"
      });
    });

    it("routes confused to status-agent with mark_blocked action", () => {
      const route = emojiAgentRouter.routeReaction("confused");
      expect(route).toEqual({ agent: "status-agent", action: "mark_blocked" });
    });

    it("returns null for unrouted reaction", () => {
      expect(emojiAgentRouter.routeReaction("heart")).toBeNull();
    });
  });

  describe("reactionToEmoji", () => {
    it("converts +1 to 👍", () => {
      expect(emojiAgentRouter.reactionToEmoji("+1")).toBe("👍");
    });

    it("converts rocket to 🚀", () => {
      expect(emojiAgentRouter.reactionToEmoji("rocket")).toBe("🚀");
    });

    it("returns null for unknown reaction", () => {
      expect(emojiAgentRouter.reactionToEmoji("unknown")).toBeNull();
    });
  });

  describe("processReaction", () => {
    it("processes valid reaction with payload", () => {
      const result = emojiAgentRouter.processReaction({
        reaction: "rocket",
        payload: {
          issue: { number: 42 },
          repository: { full_name: "org/repo" }
        }
      });

      expect(result.handled).toBe(true);
      expect(result.agent).toBe("status-agent");
      expect(result.action).toBe("mark_done");
      expect(result.issueNumber).toBe(42);
      expect(result.repository).toBe("org/repo");
    });

    it("returns unhandled for unknown reaction", () => {
      const result = emojiAgentRouter.processReaction({
        reaction: "unknown",
        payload: {}
      });

      expect(result.handled).toBe(false);
      expect(result.reason).toContain("No route");
    });

    it("returns unhandled for missing reaction parameter", () => {
      const result = emojiAgentRouter.processReaction({
        payload: {}
      });

      expect(result.handled).toBe(false);
      expect(result.reason).toContain("Invalid or missing reaction");
    });

    it("handles undefined options gracefully", () => {
      const result = emojiAgentRouter.processReaction();

      expect(result.handled).toBe(false);
      expect(result.reason).toContain("Invalid or missing reaction");
    });

    it("handles missing payload gracefully", () => {
      const result = emojiAgentRouter.processReaction({
        reaction: "rocket"
      });

      expect(result.handled).toBe(true);
      expect(result.agent).toBe("status-agent");
      expect(result.issueNumber).toBeUndefined();
    });
  });
});

describe("agent-math-utils", () => {
  describe("AgentTracker", () => {
    let tracker: InstanceType<typeof agentMathUtils.AgentTracker>;

    beforeEach(() => {
      tracker = new agentMathUtils.AgentTracker();
    });

    it("starts with zero triggers", () => {
      expect(tracker.getTriggerCount("test-agent")).toBe(0);
    });

    it("records and retrieves triggers", () => {
      tracker.recordTrigger("test-agent");
      tracker.recordTrigger("test-agent");
      tracker.recordTrigger("other-agent");

      expect(tracker.getTriggerCount("test-agent")).toBe(2);
      expect(tracker.getTriggerCount("other-agent")).toBe(1);
    });

    it("returns all triggers", () => {
      tracker.recordTrigger("agent-a");
      tracker.recordTrigger("agent-b");

      const all = tracker.getAllTriggers();
      expect(all).toEqual({ "agent-a": 1, "agent-b": 1 });
    });

    it("resets triggers", () => {
      tracker.recordTrigger("test-agent");
      tracker.reset();

      expect(tracker.getTriggerCount("test-agent")).toBe(0);
    });
  });

  describe("EmojiHeatmap", () => {
    let heatmap: InstanceType<typeof agentMathUtils.EmojiHeatmap>;

    beforeEach(() => {
      heatmap = new agentMathUtils.EmojiHeatmap();
    });

    it("starts with zero total", () => {
      expect(heatmap.getTotal()).toBe(0);
    });

    it("records emoji occurrences", () => {
      heatmap.record("✅");
      heatmap.record("✅", 2);
      heatmap.record("❌");

      expect(heatmap.getCount("✅")).toBe(3);
      expect(heatmap.getCount("❌")).toBe(1);
      expect(heatmap.getTotal()).toBe(4);
    });

    it("calculates percentages", () => {
      heatmap.record("✅", 75);
      heatmap.record("❌", 25);

      expect(heatmap.getPercentage("✅")).toBe(75);
      expect(heatmap.getPercentage("❌")).toBe(25);
    });

    it("returns 0 percentage when empty", () => {
      expect(heatmap.getPercentage("✅")).toBe(0);
    });

    it("returns percentage breakdown", () => {
      heatmap.record("✅", 50);
      heatmap.record("❌", 50);

      const breakdown = heatmap.getPercentageBreakdown();
      expect(breakdown["✅"]).toBe(50);
      expect(breakdown["❌"]).toBe(50);
    });

    it("resets heatmap", () => {
      heatmap.record("✅", 10);
      heatmap.reset();

      expect(heatmap.getTotal()).toBe(0);
      expect(heatmap.getCount("✅")).toBe(0);
    });
  });

  describe("generateProgressBar", () => {
    it("generates empty bar for zero total", () => {
      const bar = agentMathUtils.generateProgressBar({
        completed: 0,
        inProgress: 0,
        total: 0
      });
      expect(bar).toBe("⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜");
    });

    it("generates full completed bar", () => {
      const bar = agentMathUtils.generateProgressBar({
        completed: 10,
        inProgress: 0,
        total: 10
      });
      expect(bar).toBe("✅✅✅✅✅✅✅✅✅✅");
    });

    it("generates mixed progress bar", () => {
      const bar = agentMathUtils.generateProgressBar({
        completed: 5,
        inProgress: 2,
        total: 10
      });
      expect(bar).toBe("✅✅✅✅✅🟡🟡⬜⬜⬜");
    });

    it("respects custom width", () => {
      const bar = agentMathUtils.generateProgressBar({
        completed: 4,
        inProgress: 0,
        total: 8,
        width: 8
      });
      expect(bar).toBe("✅✅✅✅⬜⬜⬜⬜");
    });

    it("handles overflow when completed + inProgress > total", () => {
      const bar = agentMathUtils.generateProgressBar({
        completed: 8,
        inProgress: 5,
        total: 10,
        width: 10
      });
      // Should clamp values and produce a valid bar without invalid characters
      expect(bar).not.toContain("undefined");
      // The bar should contain only valid emoji characters
      expect(bar).toMatch(/^[✅🟡⬜]+$/);
    });

    it("clamps completed items that exceed total", () => {
      const bar = agentMathUtils.generateProgressBar({
        completed: 15,
        inProgress: 0,
        total: 10,
        width: 10
      });
      // Should show all completed since completed >= total
      expect(bar).toBe("✅✅✅✅✅✅✅✅✅✅");
    });
  });

  describe("calculateSprintProgress", () => {
    it("calculates progress for sprint items", () => {
      const items = [
        { status: "Done" },
        { status: "Done" },
        { status: "In Progress" },
        { status: "Blocked" },
        { status: "Not Started" }
      ];

      const stats = agentMathUtils.calculateSprintProgress(items);

      expect(stats.total).toBe(5);
      expect(stats.done).toBe(2);
      expect(stats.inProgress).toBe(1);
      expect(stats.blocked).toBe(1);
      expect(stats.notStarted).toBe(1);
      expect(stats.completionPercentage).toBe(40);
    });

    it("returns zero completion for empty sprint", () => {
      const stats = agentMathUtils.calculateSprintProgress([]);

      expect(stats.total).toBe(0);
      expect(stats.completionPercentage).toBe(0);
    });

    it("includes progress bar", () => {
      const items = [{ status: "Done" }, { status: "Done" }];
      const stats = agentMathUtils.calculateSprintProgress(items);

      expect(stats.progressBar).toContain("✅");
    });
  });

  describe("formatHeatmapReport", () => {
    it("formats heatmap as report", () => {
      const heatmap = new agentMathUtils.EmojiHeatmap();
      heatmap.record("✅", 45);
      heatmap.record("❌", 30);
      heatmap.record("🟡", 25);

      const report = agentMathUtils.formatHeatmapReport(heatmap);

      expect(report).toContain("📊 Emoji Heatmap Report");
      expect(report).toContain("✅ 45.0%");
      expect(report).toContain("Total: 100 emojis tracked");
    });
  });
});

describe("project-status-service", () => {
  describe("ProjectStatusService", () => {
    it("creates service with token", () => {
      const service = new projectStatusService.ProjectStatusService({
        token: "test-token"
      });
      expect(service).toBeDefined();
      expect(service.token).toBe("test-token");
    });

    it("uses custom API URL when provided", () => {
      const service = new projectStatusService.ProjectStatusService({
        token: "test-token",
        apiUrl: "https://custom.api/graphql"
      });
      expect(service.apiUrl).toBe("https://custom.api/graphql");
    });

    it("throws error for invalid query", async () => {
      const service = new projectStatusService.ProjectStatusService({
        token: "test-token"
      });

      await expect(service.graphql(null)).rejects.toThrow(
        "GraphQL query must be a non-empty string"
      );
      await expect(service.graphql("")).rejects.toThrow(
        "GraphQL query must be a non-empty string"
      );
      await expect(service.graphql(123 as any)).rejects.toThrow(
        "GraphQL query must be a non-empty string"
      );
    });
  });

  describe("createFromEnv", () => {
    const originalEnv = process.env.GITHUB_TOKEN;

    beforeEach(() => {
      delete process.env.GITHUB_TOKEN;
    });

    afterEach(() => {
      if (originalEnv) {
        process.env.GITHUB_TOKEN = originalEnv;
      } else {
        delete process.env.GITHUB_TOKEN;
      }
    });

    it("throws error when GITHUB_TOKEN is not set", () => {
      expect(() => projectStatusService.createFromEnv()).toThrow(
        "GITHUB_TOKEN environment variable is required"
      );
    });

    it("creates service when GITHUB_TOKEN is set", () => {
      process.env.GITHUB_TOKEN = "test-token";
      const service = projectStatusService.createFromEnv();
      expect(service).toBeDefined();
      expect(service.token).toBe("test-token");
    });
  });
});
