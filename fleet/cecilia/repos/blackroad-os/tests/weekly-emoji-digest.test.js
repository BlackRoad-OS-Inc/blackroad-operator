// tests/weekly-emoji-digest.test.js
import { describe, expect, it, vi } from "vitest";
import {
  REACTION_CONTENT_TO_EMOJI,
  AGENT_LABELS,
  countReactions,
  extractIssueEmojis,
  groupIssuesByAgent,
  generateAgentHeatmaps,
  generateDigestMarkdown,
  createWeeklyEmojiDigest,
} from "../bot/weekly-emoji-digest";

describe("weekly-emoji-digest", () => {
  describe("REACTION_CONTENT_TO_EMOJI", () => {
    it("should map THUMBS_UP to completed emoji", () => {
      expect(REACTION_CONTENT_TO_EMOJI.THUMBS_UP).toBe("✅");
    });

    it("should map THUMBS_DOWN to blocked emoji", () => {
      expect(REACTION_CONTENT_TO_EMOJI.THUMBS_DOWN).toBe("❌");
    });

    it("should map ROCKET to completed emoji", () => {
      expect(REACTION_CONTENT_TO_EMOJI.ROCKET).toBe("✅");
    });

    it("should map EYES to review emoji", () => {
      expect(REACTION_CONTENT_TO_EMOJI.EYES).toBe("🤔");
    });
  });

  describe("AGENT_LABELS", () => {
    it("should contain expected agent labels", () => {
      expect(AGENT_LABELS).toContain("builder-agent");
      expect(AGENT_LABELS).toContain("planner-agent");
      expect(AGENT_LABELS).toContain("guardian-agent");
      expect(AGENT_LABELS).toContain("observer-agent");
      expect(AGENT_LABELS).toContain("human");
    });
  });

  describe("countReactions", () => {
    it("should count THUMBS_UP as completed", () => {
      const reactions = [{ content: "THUMBS_UP" }, { content: "THUMBS_UP" }];
      const counts = countReactions(reactions);
      expect(counts.completed).toBe(2);
    });

    it("should count THUMBS_DOWN as blocked", () => {
      const reactions = [{ content: "THUMBS_DOWN" }];
      const counts = countReactions(reactions);
      expect(counts.blocked).toBe(1);
    });

    it("should count mixed reactions", () => {
      const reactions = [
        { content: "THUMBS_UP" },
        { content: "THUMBS_DOWN" },
        { content: "ROCKET" },
        { content: "EYES" },
      ];
      const counts = countReactions(reactions);
      expect(counts.completed).toBe(2); // THUMBS_UP + ROCKET
      expect(counts.blocked).toBe(1);
      expect(counts.review).toBe(1);
    });

    it("should handle empty reactions", () => {
      const counts = countReactions([]);
      expect(counts.total).toBe(0);
    });

    it("should ignore unknown reactions", () => {
      const reactions = [{ content: "UNKNOWN" }];
      const counts = countReactions(reactions);
      expect(counts.total).toBe(0);
    });
  });

  describe("extractIssueEmojis", () => {
    it("should count emojis in issue body", () => {
      const issue = {
        body: "✅ Task completed ✅ Another done",
      };
      const counts = extractIssueEmojis(issue);
      expect(counts.completed).toBe(2);
    });

    it("should count reactions on issue", () => {
      const issue = {
        body: "",
        reactions: {
          nodes: [{ content: "THUMBS_UP" }, { content: "ROCKET" }],
        },
      };
      const counts = extractIssueEmojis(issue);
      expect(counts.completed).toBe(2);
    });

    it("should count emojis in comments", () => {
      const issue = {
        body: "",
        comments: {
          nodes: [{ body: "✅ Done" }, { body: "❌ Blocked" }],
        },
      };
      const counts = extractIssueEmojis(issue);
      expect(counts.completed).toBe(1);
      expect(counts.blocked).toBe(1);
    });

    it("should count reactions on comments", () => {
      const issue = {
        body: "",
        comments: {
          nodes: [
            {
              body: "",
              reactions: {
                nodes: [{ content: "THUMBS_UP" }],
              },
            },
          ],
        },
      };
      const counts = extractIssueEmojis(issue);
      expect(counts.completed).toBe(1);
    });

    it("should aggregate all counts", () => {
      const issue = {
        body: "✅ Main task",
        reactions: {
          nodes: [{ content: "ROCKET" }],
        },
        comments: {
          nodes: [
            {
              body: "✅ Subtask done",
              reactions: {
                nodes: [{ content: "THUMBS_UP" }],
              },
            },
          ],
        },
      };
      const counts = extractIssueEmojis(issue);
      expect(counts.completed).toBe(4); // 1 in body + 1 rocket + 1 in comment + 1 thumbs up
    });
  });

  describe("groupIssuesByAgent", () => {
    it("should group issues by agent labels", () => {
      const issues = [
        { labels: { nodes: [{ name: "builder-agent" }] } },
        { labels: { nodes: [{ name: "builder-agent" }] } },
        { labels: { nodes: [{ name: "planner-agent" }] } },
      ];

      const groups = groupIssuesByAgent(issues);
      expect(groups["builder-agent"]).toHaveLength(2);
      expect(groups["planner-agent"]).toHaveLength(1);
    });

    it("should put unlabeled issues in unassigned", () => {
      const issues = [
        { labels: { nodes: [] } },
        { labels: { nodes: [{ name: "other-label" }] } },
      ];

      const groups = groupIssuesByAgent(issues);
      expect(groups.unassigned).toHaveLength(2);
    });

    it("should handle issues without labels", () => {
      const issues = [{}];
      const groups = groupIssuesByAgent(issues);
      expect(groups.unassigned).toHaveLength(1);
    });

    it("should initialize all agent groups", () => {
      const groups = groupIssuesByAgent([]);
      expect(groups["builder-agent"]).toEqual([]);
      expect(groups["planner-agent"]).toEqual([]);
      expect(groups["guardian-agent"]).toEqual([]);
      expect(groups["observer-agent"]).toEqual([]);
      expect(groups.human).toEqual([]);
    });
  });

  describe("generateAgentHeatmaps", () => {
    it("should generate heatmaps for agents with issues", () => {
      const groups = {
        "builder-agent": [{ body: "✅✅❌" }],
        "planner-agent": [],
      };

      const heatmaps = generateAgentHeatmaps(groups);
      expect(heatmaps["builder-agent"]).toBeDefined();
      expect(heatmaps["builder-agent"].issueCount).toBe(1);
      expect(heatmaps["planner-agent"]).toBeUndefined();
    });

    it("should calculate correct percentages", () => {
      const groups = {
        "builder-agent": [{ body: "✅✅✅✅❌" }],
      };

      const heatmaps = generateAgentHeatmaps(groups);
      expect(heatmaps["builder-agent"].heatmap.percentComplete).toBe(80);
      expect(heatmaps["builder-agent"].heatmap.percentBlocked).toBe(20);
    });
  });

  describe("generateDigestMarkdown", () => {
    it("should generate valid markdown report", () => {
      const data = {
        repoName: "test/repo",
        weekStart: new Date("2024-01-01"),
        weekEnd: new Date("2024-01-08"),
        totalIssues: 10,
        overallHeatmap: {
          percentComplete: 50,
          percentBlocked: 10,
          percentInProgress: 20,
          percentReview: 10,
          percentNotStarted: 10,
          escalations: 2,
          totalItems: 10,
        },
        agentHeatmaps: {
          "builder-agent": {
            issueCount: 5,
            heatmap: {
              percentComplete: 60,
              escalations: 1,
              percentBlocked: 10,
            },
          },
        },
        topEscalations: [
          {
            number: 123,
            title: "Critical bug",
            assignees: { nodes: [{ login: "user1" }] },
          },
        ],
      };

      const markdown = generateDigestMarkdown(data);

      expect(markdown).toContain("Weekly Emoji Digest");
      expect(markdown).toContain("test/repo");
      expect(markdown).toContain("2024-01-01");
      expect(markdown).toContain("**Total Issues Analyzed:** 10");
      expect(markdown).toContain("builder-agent");
      expect(markdown).toContain("#123");
      expect(markdown).toContain("Critical bug");
      expect(markdown).toContain("@user1");
    });

    it("should handle empty escalations", () => {
      const data = {
        repoName: "test/repo",
        weekStart: new Date("2024-01-01"),
        weekEnd: new Date("2024-01-08"),
        totalIssues: 5,
        overallHeatmap: {
          percentComplete: 100,
          percentBlocked: 0,
          percentInProgress: 0,
          percentReview: 0,
          percentNotStarted: 0,
          escalations: 0,
          totalItems: 5,
        },
        agentHeatmaps: {},
        topEscalations: [],
      };

      const markdown = generateDigestMarkdown(data);
      expect(markdown).not.toContain("Active Escalations");
    });

    it("should include emoji legend", () => {
      const data = {
        repoName: "test/repo",
        weekStart: new Date(),
        weekEnd: new Date(),
        totalIssues: 0,
        overallHeatmap: {
          percentComplete: 0,
          percentBlocked: 0,
          percentInProgress: 0,
          percentReview: 0,
          percentNotStarted: 0,
          escalations: 0,
          totalItems: 0,
        },
        agentHeatmaps: {},
        topEscalations: [],
      };

      const markdown = generateDigestMarkdown(data);
      expect(markdown).toContain("Emoji Legend");
      expect(markdown).toContain("Completed");
      expect(markdown).toContain("Blocked");
    });
  });

  describe("createWeeklyEmojiDigest", () => {
    it("should create digest handler with methods", () => {
      const mockOctokit = { graphql: vi.fn() };
      const digest = createWeeklyEmojiDigest(mockOctokit);

      expect(digest).toHaveProperty("fetchWeeklyIssues");
      expect(digest).toHaveProperty("findDigestIssue");
      expect(digest).toHaveProperty("postDigestComment");
      expect(digest).toHaveProperty("generateWeeklyDigest");
      expect(digest).toHaveProperty("generateAndPostDigest");
    });

    describe("fetchWeeklyIssues", () => {
      it("should fetch issues with pagination", async () => {
        const mockOctokit = {
          graphql: vi
            .fn()
            .mockResolvedValueOnce({
              repository: {
                issues: {
                  pageInfo: { hasNextPage: true, endCursor: "cursor1" },
                  nodes: [{ number: 1 }],
                },
              },
            })
            .mockResolvedValueOnce({
              repository: {
                issues: {
                  pageInfo: { hasNextPage: false, endCursor: null },
                  nodes: [{ number: 2 }],
                },
              },
            }),
        };

        const digest = createWeeklyEmojiDigest(mockOctokit);
        const issues = await digest.fetchWeeklyIssues("owner", "repo");

        expect(issues).toHaveLength(2);
        expect(mockOctokit.graphql).toHaveBeenCalledTimes(2);
      });
    });

    describe("generateAndPostDigest", () => {
      it("should return failure if no digest issue found", async () => {
        const mockOctokit = {
          graphql: vi.fn().mockResolvedValue({
            repository: {
              issues: {
                pageInfo: { hasNextPage: false },
                nodes: [],
              },
            },
          }),
        };

        const digest = createWeeklyEmojiDigest(mockOctokit);
        const result = await digest.generateAndPostDigest("owner", "repo");

        expect(result.success).toBe(false);
        expect(result.reason).toContain("No emoji-digest issue found");
      });
    });
  });
});
