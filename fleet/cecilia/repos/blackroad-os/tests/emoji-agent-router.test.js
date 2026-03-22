// tests/emoji-agent-router.test.js
import { describe, expect, it, vi } from "vitest";
import {
  ROUTE_TYPES,
  ESCALATION_EMOJIS,
  STATUS_EMOJIS,
  determineEmojiRoute,
  determineReactionRoute,
  createEmojiRouteContext,
  createReactionRouteContext,
  createEmojiAgentRouter,
} from "../bot/emoji-agent-router";

describe("emoji-agent-router", () => {
  describe("ROUTE_TYPES", () => {
    it("should have all required route types", () => {
      expect(ROUTE_TYPES.MATH).toBe("math");
      expect(ROUTE_TYPES.STATUS).toBe("status");
      expect(ROUTE_TYPES.ESCALATION).toBe("escalation");
      expect(ROUTE_TYPES.NOTIFICATION).toBe("notification");
      expect(ROUTE_TYPES.IGNORE).toBe("ignore");
    });
  });

  describe("ESCALATION_EMOJIS", () => {
    it("should contain escalation emojis", () => {
      expect(ESCALATION_EMOJIS).toContain("🛟");
      expect(ESCALATION_EMOJIS).toContain("🚨");
      expect(ESCALATION_EMOJIS).toContain("🔥");
    });
  });

  describe("STATUS_EMOJIS", () => {
    it("should contain status emojis", () => {
      expect(STATUS_EMOJIS).toContain("✅");
      expect(STATUS_EMOJIS).toContain("🟡");
      expect(STATUS_EMOJIS).toContain("❌");
      expect(STATUS_EMOJIS).toContain("🤔");
    });
  });

  describe("determineEmojiRoute", () => {
    it("should route escalation emojis", () => {
      expect(determineEmojiRoute("🛟")).toBe(ROUTE_TYPES.ESCALATION);
      expect(determineEmojiRoute("🚨")).toBe(ROUTE_TYPES.ESCALATION);
      expect(determineEmojiRoute("🔥")).toBe(ROUTE_TYPES.ESCALATION);
    });

    it("should route status emojis", () => {
      expect(determineEmojiRoute("✅")).toBe(ROUTE_TYPES.STATUS);
      expect(determineEmojiRoute("❌")).toBe(ROUTE_TYPES.STATUS);
      expect(determineEmojiRoute("🟡")).toBe(ROUTE_TYPES.STATUS);
    });

    it("should ignore unknown emojis", () => {
      expect(determineEmojiRoute("🍕")).toBe(ROUTE_TYPES.IGNORE);
      expect(determineEmojiRoute("🎈")).toBe(ROUTE_TYPES.IGNORE);
    });
  });

  describe("determineReactionRoute", () => {
    it("should route status reactions", () => {
      expect(determineReactionRoute("rocket")).toBe(ROUTE_TYPES.STATUS);
      expect(determineReactionRoute("hooray")).toBe(ROUTE_TYPES.STATUS);
      expect(determineReactionRoute("-1")).toBe(ROUTE_TYPES.STATUS);
    });

    it("should route escalation reactions", () => {
      expect(determineReactionRoute("rotating_light")).toBe(ROUTE_TYPES.ESCALATION);
    });

    it("should ignore unknown reactions", () => {
      expect(determineReactionRoute("unknown")).toBe(ROUTE_TYPES.IGNORE);
      expect(determineReactionRoute("+1")).toBe(ROUTE_TYPES.IGNORE);
    });
  });

  describe("createEmojiRouteContext", () => {
    it("should create context for status emoji", () => {
      const context = createEmojiRouteContext("✅");
      expect(context.type).toBe(ROUTE_TYPES.STATUS);
      expect(context.emoji).toBe("✅");
      expect(context.status).toBe("Done");
      expect(context.isEscalation).toBe(false);
    });

    it("should create context for escalation emoji", () => {
      const context = createEmojiRouteContext("🛟");
      expect(context.type).toBe(ROUTE_TYPES.ESCALATION);
      expect(context.isEscalation).toBe(true);
      expect(context.status).toBe("Escalation");
    });
  });

  describe("createReactionRouteContext", () => {
    it("should create context for status reaction", () => {
      const context = createReactionRouteContext("rocket");
      expect(context.type).toBe(ROUTE_TYPES.STATUS);
      expect(context.emoji).toBe("rocket");
      expect(context.status).toBe("Done");
      expect(context.category).toBe("completed");
    });

    it("should create context for blocked reaction", () => {
      const context = createReactionRouteContext("-1");
      expect(context.type).toBe(ROUTE_TYPES.STATUS);
      expect(context.status).toBe("Blocked");
      expect(context.category).toBe("blocked");
    });
  });

  describe("createEmojiAgentRouter", () => {
    it("should create router with all methods", () => {
      const router = createEmojiAgentRouter({});

      expect(router).toHaveProperty("routeEmoji");
      expect(router).toHaveProperty("routeReaction");
      expect(router).toHaveProperty("handleMathRequest");
      expect(router).toHaveProperty("processBatchMath");
    });

    describe("routeEmoji", () => {
      it("should route status emoji and call callback", async () => {
        const onStatusUpdate = vi.fn();
        const router = createEmojiAgentRouter({ onStatusUpdate });

        const result = await router.routeEmoji("✅", {
          owner: "test",
          repo: "repo",
          issueNumber: 1,
        });

        expect(result.handled).toBe(true);
        expect(result.action).toBe("status_update");
        expect(onStatusUpdate).toHaveBeenCalled();
      });

      it("should route escalation emoji and call callback", async () => {
        const onEscalation = vi.fn();
        const router = createEmojiAgentRouter({ onEscalation });

        const result = await router.routeEmoji("🛟", {
          owner: "test",
          repo: "repo",
          issueNumber: 1,
        });

        expect(result.handled).toBe(true);
        expect(result.action).toBe("escalation_triggered");
        expect(onEscalation).toHaveBeenCalled();
      });

      it("should ignore unknown emojis", async () => {
        const router = createEmojiAgentRouter({});

        const result = await router.routeEmoji("🍕", {
          owner: "test",
          repo: "repo",
          issueNumber: 1,
        });

        expect(result.handled).toBe(false);
        expect(result.action).toBe("ignored");
      });
    });

    describe("routeReaction", () => {
      it("should route status reaction", async () => {
        const router = createEmojiAgentRouter({});

        const result = await router.routeReaction("rocket", {
          owner: "test",
          repo: "repo",
          issueNumber: 1,
        });

        expect(result.handled).toBe(true);
        expect(result.action).toBe("status_update");
      });

      it("should ignore unknown reactions", async () => {
        const router = createEmojiAgentRouter({});

        const result = await router.routeReaction("unknown", {
          owner: "test",
          repo: "repo",
          issueNumber: 1,
        });

        expect(result.handled).toBe(false);
      });
    });

    describe("handleMathRequest", () => {
      it("should calculate emoji counts", () => {
        const router = createEmojiAgentRouter({});

        const result = router.handleMathRequest("✅✅❌🟡");

        expect(result.handled).toBe(true);
        expect(result.action).toBe("math_calculation");
        expect(result.data.counts.completed).toBe(2);
        expect(result.data.counts.blocked).toBe(1);
        expect(result.data.counts.inProgress).toBe(1);
      });

      it("should generate heatmap", () => {
        const router = createEmojiAgentRouter({});

        const result = router.handleMathRequest("✅✅✅✅❌");

        expect(result.data.heatmap.percentComplete).toBe(80);
        expect(result.data.heatmap.percentBlocked).toBe(20);
      });

      it("should generate markdown report when requested", () => {
        const router = createEmojiAgentRouter({});

        const result = router.handleMathRequest("✅❌", {
          generateReport: true,
          title: "Test Report",
        });

        expect(result.data.report).toContain("Test Report");
        expect(result.data.report).toContain("Complete");
      });

      it("should call onMathRequest callback", () => {
        const onMathRequest = vi.fn();
        const router = createEmojiAgentRouter({ onMathRequest });

        router.handleMathRequest("✅❌");

        expect(onMathRequest).toHaveBeenCalled();
      });
    });

    describe("processBatchMath", () => {
      it("should aggregate counts from multiple texts", () => {
        const router = createEmojiAgentRouter({});

        const result = router.processBatchMath(["✅✅", "❌❌", "🟡"]);

        expect(result.handled).toBe(true);
        expect(result.action).toBe("batch_math_calculation");
        expect(result.data.itemCount).toBe(3);
        expect(result.data.aggregatedCounts.completed).toBe(2);
        expect(result.data.aggregatedCounts.blocked).toBe(2);
        expect(result.data.aggregatedCounts.inProgress).toBe(1);
      });

      it("should generate batch report when requested", () => {
        const router = createEmojiAgentRouter({});

        const result = router.processBatchMath(["✅", "❌"], {
          generateReport: true,
          title: "Batch Report",
        });

        expect(result.data.report).toContain("Batch Report");
      });
    });
  });
});
