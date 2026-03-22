// tests/project-status-sync.test.js
import { describe, expect, it, vi } from "vitest";
import {
  STATUS_MAPPING,
  CATEGORY_TO_STATUS,
  emojiToStatus,
  reactionToStatus,
  findStatusFieldValue,
  createProjectStatusSync,
} from "../bot/project-status-sync";

describe("project-status-sync", () => {
  describe("STATUS_MAPPING", () => {
    it("should map ✅ to Done", () => {
      expect(STATUS_MAPPING["✅"]).toBe("Done");
    });

    it("should map ❌ to Blocked", () => {
      expect(STATUS_MAPPING["❌"]).toBe("Blocked");
    });

    it("should map 🟡 to In Progress", () => {
      expect(STATUS_MAPPING["🟡"]).toBe("In Progress");
    });

    it("should map 🛟 to Escalation", () => {
      expect(STATUS_MAPPING["🛟"]).toBe("Escalation");
    });

    it("should have all status mappings", () => {
      expect(Object.keys(STATUS_MAPPING)).toHaveLength(7);
    });
  });

  describe("CATEGORY_TO_STATUS", () => {
    it("should map completed to Done", () => {
      expect(CATEGORY_TO_STATUS.completed).toBe("Done");
    });

    it("should map blocked to Blocked", () => {
      expect(CATEGORY_TO_STATUS.blocked).toBe("Blocked");
    });

    it("should map review to Needs Review", () => {
      expect(CATEGORY_TO_STATUS.review).toBe("Needs Review");
    });
  });

  describe("emojiToStatus", () => {
    it("should convert ✅ to Done", () => {
      expect(emojiToStatus("✅")).toBe("Done");
    });

    it("should convert ❌ to Blocked", () => {
      expect(emojiToStatus("❌")).toBe("Blocked");
    });

    it("should return null for unknown emoji", () => {
      expect(emojiToStatus("🍕")).toBe(null);
    });
  });

  describe("reactionToStatus", () => {
    it("should convert rocket to Done", () => {
      expect(reactionToStatus("rocket")).toBe("Done");
    });

    it("should convert -1 to Blocked", () => {
      expect(reactionToStatus("-1")).toBe("Blocked");
    });

    it("should convert eyes to Done (completed category)", () => {
      // Eyes reaction maps to completed category which becomes Done status
      expect(reactionToStatus("eyes")).toBe("Done");
    });

    it("should return null for unknown reaction", () => {
      expect(reactionToStatus("unknown")).toBe(null);
    });
  });

  describe("findStatusFieldValue", () => {
    const mockFields = [
      {
        id: "field1",
        name: "Title",
      },
      {
        id: "field2",
        name: "Status",
        options: [
          { id: "opt1", name: "Done" },
          { id: "opt2", name: "In Progress" },
          { id: "opt3", name: "Blocked" },
        ],
      },
    ];

    it("should find status field and value", () => {
      const result = findStatusFieldValue(mockFields, "Done");
      expect(result).toEqual({
        fieldId: "field2",
        valueId: "opt1",
        fieldName: "Status",
        valueName: "Done",
      });
    });

    it("should find status case-insensitively", () => {
      const result = findStatusFieldValue(mockFields, "done");
      expect(result.valueId).toBe("opt1");
    });

    it("should return null if status not found", () => {
      const result = findStatusFieldValue(mockFields, "Unknown");
      expect(result).toBe(null);
    });

    it("should return null if no Status field", () => {
      const fields = [{ id: "field1", name: "Title" }];
      const result = findStatusFieldValue(fields, "Done");
      expect(result).toBe(null);
    });
  });

  describe("createProjectStatusSync", () => {
    it("should create sync handler with methods", () => {
      const mockOctokit = {
        graphql: vi.fn(),
      };

      const sync = createProjectStatusSync(mockOctokit);

      expect(sync).toHaveProperty("getProjectFields");
      expect(sync).toHaveProperty("getIssueProjectItemId");
      expect(sync).toHaveProperty("updateProjectItemStatus");
      expect(sync).toHaveProperty("syncIssueStatusFromEmoji");
      expect(sync).toHaveProperty("syncIssueStatusFromReaction");
      expect(sync).toHaveProperty("clearCache");
    });

    it("should cache project fields", async () => {
      const mockOctokit = {
        graphql: vi.fn().mockResolvedValue({
          node: {
            fields: {
              nodes: [
                { id: "f1", name: "Title" },
                {
                  id: "f2",
                  name: "Status",
                  options: [{ id: "o1", name: "Done" }],
                },
              ],
            },
          },
        }),
      };

      const sync = createProjectStatusSync(mockOctokit);

      // Call twice with same project ID
      await sync.getProjectFields("project1");
      await sync.getProjectFields("project1");

      // Should only call API once (cached)
      expect(mockOctokit.graphql).toHaveBeenCalledTimes(1);
    });

    it("should fetch new fields for different project", async () => {
      const mockOctokit = {
        graphql: vi.fn().mockResolvedValue({
          node: {
            fields: {
              nodes: [],
            },
          },
        }),
      };

      const sync = createProjectStatusSync(mockOctokit);

      await sync.getProjectFields("project1");
      await sync.getProjectFields("project2");

      expect(mockOctokit.graphql).toHaveBeenCalledTimes(2);
    });

    describe("syncIssueStatusFromEmoji", () => {
      it("should return failure if no status mapping", async () => {
        const mockOctokit = { graphql: vi.fn() };
        const sync = createProjectStatusSync(mockOctokit);

        const result = await sync.syncIssueStatusFromEmoji({
          owner: "test",
          repo: "repo",
          issueNumber: 1,
          emoji: "🍕",
          projectId: "proj1",
        });

        expect(result.success).toBe(false);
        expect(result.reason).toBe("No status mapping for emoji");
      });
    });

    describe("syncIssueStatusFromReaction", () => {
      it("should return failure if no status mapping", async () => {
        const mockOctokit = { graphql: vi.fn() };
        const sync = createProjectStatusSync(mockOctokit);

        const result = await sync.syncIssueStatusFromReaction({
          owner: "test",
          repo: "repo",
          issueNumber: 1,
          reaction: "unknown",
          projectId: "proj1",
        });

        expect(result.success).toBe(false);
        expect(result.reason).toBe("No status mapping for reaction");
      });
    });
  });
});
