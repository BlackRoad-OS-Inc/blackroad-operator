// tests/digest-bot.test.js
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("digest-bot", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, GITHUB_TOKEN: "test-token" };
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("calculateReactionStats", () => {
    it("should calculate statistics from issues with reactions", async () => {
      const { calculateReactionStats } = await import("../bot/handlers/digest-bot.js");

      const mockIssues = [
        {
          number: 1,
          title: "Test Issue 1",
          reactions: {
            nodes: [
              { content: "THUMBS_UP", user: { login: "agent-1" } },
              { content: "THUMBS_UP", user: { login: "agent-2" } },
              { content: "HEART", user: { login: "agent-1" } },
            ],
          },
          comments: { nodes: [] },
          labels: { nodes: [{ name: "bug" }] },
        },
        {
          number: 2,
          title: "Test Issue 2",
          reactions: {
            nodes: [
              { content: "THUMBS_DOWN", user: { login: "agent-1" } },
            ],
          },
          comments: { nodes: [] },
          labels: { nodes: [{ name: "bug" }] },
        },
      ];

      const stats = calculateReactionStats(mockIssues);

      expect(stats.total).toBe(4);
      expect(stats.byEmoji["👍"]).toBe(2);
      expect(stats.byEmoji["❤️"]).toBe(1);
      expect(stats.byEmoji["👎"]).toBe(1);
      expect(stats.mostActiveAgent).toBe("agent-1");
      expect(stats.blockedIssues).toContain(2);
    });

    it("should handle empty issues array", async () => {
      const { calculateReactionStats } = await import("../bot/handlers/digest-bot.js");

      const stats = calculateReactionStats([]);

      expect(stats.total).toBe(0);
      expect(stats.byEmoji).toEqual({});
    });

    it("should count comment reactions", async () => {
      const { calculateReactionStats } = await import("../bot/handlers/digest-bot.js");

      const mockIssues = [
        {
          number: 1,
          title: "Test Issue",
          reactions: { nodes: [] },
          comments: {
            nodes: [
              {
                author: { login: "commenter" },
                reactions: {
                  nodes: [
                    { content: "ROCKET", user: { login: "agent-1" } },
                    { content: "EYES", user: { login: "agent-2" } },
                  ],
                },
              },
            ],
          },
          labels: { nodes: [] },
        },
      ];

      const stats = calculateReactionStats(mockIssues);

      expect(stats.total).toBe(2);
      expect(stats.byEmoji["🚀"]).toBe(1);
      expect(stats.byEmoji["👀"]).toBe(1);

import { describe, it, expect, vi, beforeEach } from "vitest";

// We'll test the pure functions that don't require network access
const {
  calculateEmojiStats,
  generateDigestMarkdown,
} = require("../bot/digest-bot.js");

describe("digest-bot", () => {
  describe("calculateEmojiStats", () => {
    it("should calculate correct emoji counts and percentages", () => {
      const reactions = [
        { content: "+1", user: "agent-1", issue: "Issue A" },
        { content: "+1", user: "agent-2", issue: "Issue A" },
        { content: "+1", user: "agent-1", issue: "Issue B" },
        { content: "-1", user: "agent-3", issue: "Issue C" },
        { content: "confused", user: "agent-3", issue: "Issue D" },
        { content: "eyes", user: "agent-1", issue: "Issue E" },
      ];

      const stats = calculateEmojiStats(reactions);

      expect(stats.total).toBe(6);
      expect(stats.stats.length).toBe(4);

      // +1 should be most common with 50%
      const plusOne = stats.stats.find((s) => s.rawEmoji === "+1");
      expect(plusOne.count).toBe(3);
      expect(plusOne.percentage).toBe(50);
      expect(plusOne.emoji).toBe("✅");

      // -1 should have 1 count
      const minusOne = stats.stats.find((s) => s.rawEmoji === "-1");
      expect(minusOne.count).toBe(1);
      expect(minusOne.emoji).toBe("❌");
    });

    it("should identify most active agent", () => {
      const reactions = [
        { content: "+1", user: "scribe-agent", issue: "Issue A" },
        { content: "+1", user: "scribe-agent", issue: "Issue B" },
        { content: "+1", user: "scribe-agent", issue: "Issue C" },
        { content: "-1", user: "builder-agent", issue: "Issue D" },
      ];

      const stats = calculateEmojiStats(reactions);

      expect(stats.mostActiveAgent).toBe("scribe-agent");
    });

    it("should identify most blocked issue", () => {
      const reactions = [
        { content: "-1", user: "agent-1", issue: "blackroad-os-api" },
        { content: "-1", user: "agent-2", issue: "blackroad-os-api" },
        { content: "confused", user: "agent-3", issue: "blackroad-os-api" },
        { content: "-1", user: "agent-4", issue: "other-issue" },
      ];

      const stats = calculateEmojiStats(reactions);

      expect(stats.mostBlocked).toBe("blackroad-os-api");
      expect(stats.blockedCount).toBe(4);
    });

    it("should handle empty reactions array", () => {
      const stats = calculateEmojiStats([]);

      expect(stats.total).toBe(0);
      expect(stats.stats.length).toBe(0);
      expect(stats.mostActiveAgent).toBeNull();
      expect(stats.mostBlocked).toBeNull();
    });

    it("should count escalations and review requests", () => {
      const reactions = [
        { content: "rotating_light", user: "agent-1", issue: "Issue A" },
        { content: "rotating_light", user: "agent-2", issue: "Issue B" },
        { content: "thinking_face", user: "agent-3", issue: "Issue C" },
      ];

      const stats = calculateEmojiStats(reactions);

      expect(stats.escalationCount).toBe(2);
      expect(stats.reviewCount).toBe(1);
    });
  });

  describe("generateDigestMarkdown", () => {
    it("should generate valid markdown digest", async () => {
      const { generateDigestMarkdown } = await import("../bot/handlers/digest-bot.js");

      const stats = {
        total: 100,
        byEmoji: {
          "👍": 50,
          "❤️": 30,
          "🚀": 20,
        },
        byAgent: { "agent-1": 60, "agent-2": 40 },
        blockedIssues: [1, 2],
        escalations: [],
        reviewQueue: [],
        mostActiveAgent: "agent-1",
        mostBlockedRepo: "bug",
      };

      const markdown = generateDigestMarkdown(stats, "Nov 24, 2025");

      expect(markdown).toContain("# 📊 Weekly Agent Emoji Digest (Nov 24, 2025)");
      expect(markdown).toContain("| 👍 | 50 | 50% |");
      expect(markdown).toContain("| ❤️ | 30 | 30% |");
      expect(markdown).toContain("| 🚀 | 20 | 20% |");
      expect(markdown).toContain("**Total Reactions:** 🧮 100");
      expect(markdown).toContain("🔥 Most active agent: `@agent-1`");
      expect(markdown).toContain("❌ Blocked issues: 2");
    });

    it("should handle zero total reactions", async () => {
      const { generateDigestMarkdown } = await import("../bot/handlers/digest-bot.js");

      const stats = {
        total: 0,
        byEmoji: {},
        byAgent: {},
        blockedIssues: [],
        escalations: [],
        reviewQueue: [],
        mostActiveAgent: null,
        mostBlockedRepo: null,
      };

      const markdown = generateDigestMarkdown(stats, "Nov 24, 2025");

      expect(markdown).toContain("# 📊 Weekly Agent Emoji Digest (Nov 24, 2025)");
      expect(markdown).toContain("**Total Reactions:** 🧮 0");
    });
  });

  describe("REACTION_EMOJI_MAP", () => {
    it("should have all expected reaction mappings", async () => {
      const { REACTION_EMOJI_MAP } = await import("../bot/handlers/digest-bot.js");

      expect(REACTION_EMOJI_MAP.THUMBS_UP).toBe("👍");
      expect(REACTION_EMOJI_MAP.THUMBS_DOWN).toBe("👎");
      expect(REACTION_EMOJI_MAP.HEART).toBe("❤️");
      expect(REACTION_EMOJI_MAP.ROCKET).toBe("🚀");
      expect(REACTION_EMOJI_MAP.EYES).toBe("👀");
    });
  });

  describe("postDigestComment", () => {
    it("should post comment to GitHub issue", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 123,
          html_url: "https://github.com/test/test/issues/1#issuecomment-123",
        }),
      });

      const { postDigestComment } = await import("../bot/handlers/digest-bot.js");

      const result = await postDigestComment("owner", "repo", 1, "Test digest");

      expect(result.id).toBe(123);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/repos/owner/repo/issues/1/comments",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ body: "Test digest" }),
        })
      );
    });

    it("should throw error when GITHUB_TOKEN is not set", async () => {
      process.env.GITHUB_TOKEN = "";

      const { postDigestComment } = await import("../bot/handlers/digest-bot.js");

      await expect(
        postDigestComment("owner", "repo", 1, "Test digest")
      ).rejects.toThrow("GITHUB_TOKEN environment variable is not set");
    it("should generate valid markdown table", () => {
      const stats = {
        total: 10,
        stats: [
          { emoji: "✅", rawEmoji: "+1", count: 5, percentage: 50 },
          { emoji: "❌", rawEmoji: "-1", count: 3, percentage: 30 },
          { emoji: "🛟", rawEmoji: "rotating_light", count: 2, percentage: 20 },
        ],
        mostActiveAgent: "@scribe-agent",
        mostBlocked: "blackroad-os-api",
        blockedCount: 3,
        escalationCount: 2,
        reviewCount: 1,
      };

      const testDate = new Date("2025-11-24");
      const markdown = generateDigestMarkdown(stats, testDate);

      expect(markdown).toContain("# 📊 Weekly Agent Emoji Digest");
      expect(markdown).toContain("Nov 24, 2025");
      expect(markdown).toContain("| Emoji | Count | % |");
      expect(markdown).toContain("| ✅ | 5 | 50% |");
      expect(markdown).toContain("| ❌ | 3 | 30% |");
      expect(markdown).toContain("| 🛟 | 2 | 20% |");
      expect(markdown).toContain("🔥 Most active agent: `@scribe-agent`");
      expect(markdown).toContain("🛑 Most blocked: `blackroad-os-api`");
      expect(markdown).toContain("🛟 Escalations: 2 cases");
      expect(markdown).toContain("🤔 Review queue: 1 issues");
    });

    it("should handle empty stats gracefully", () => {
      const stats = {
        total: 0,
        stats: [],
        mostActiveAgent: null,
        mostBlocked: null,
        blockedCount: 0,
        escalationCount: 0,
        reviewCount: 0,
      };

      const testDate = new Date("2025-11-24");
      const markdown = generateDigestMarkdown(stats, testDate);

      expect(markdown).toContain("# 📊 Weekly Agent Emoji Digest");
      expect(markdown).toContain("| Emoji | Count | % |");
      // Should not contain agent/blocked info when null
      expect(markdown).not.toContain("Most active agent");
      expect(markdown).not.toContain("Most blocked");
    });
  });
});
