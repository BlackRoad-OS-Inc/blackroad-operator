// tests/project-graphql-updater.test.js
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("project-graphql-updater", () => {
  const originalEnv = process.env;

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const {
  updateProjectField,
  fetchProjectMetadata,
} = require("../bot/handlers/project-graphql-updater.js");

describe("project-graphql-updater", () => {
  const originalEnv = process.env;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, GITHUB_TOKEN: "test-token" };
    global.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("updateProjectField", () => {
    it("should update project field successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            updateProjectV2ItemFieldValue: {
              projectV2Item: { id: "item-123" },
            },
          },
        }),
      });

      const { updateProjectField } = await import("../bot/handlers/project-graphql-updater.js");

      const result = await updateProjectField({
        issueNodeId: "issue-node-id",
        projectId: "project-123",
        fieldId: "field-456",
        valueId: "value-789",
      });

      expect(result).toEqual({ id: "item-123" });
    it("should throw error when GITHUB_TOKEN is not set", async () => {
      delete process.env.GITHUB_TOKEN;

      await expect(
        updateProjectField({
          issueNodeId: "issue-123",
          projectId: "project-456",
          fieldId: "field-789",
          valueId: "value-abc",
        })
      ).rejects.toThrow("GITHUB_TOKEN environment variable is required");
    });

    it("should make GraphQL mutation request with correct parameters", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              updateProjectV2ItemFieldValue: {
                projectV2Item: { id: "item-123" },
              },
            },
          }),
      });

      const result = await updateProjectField({
        issueNodeId: "issue-123",
        projectId: "project-456",
        fieldId: "field-789",
        valueId: "value-abc",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/graphql",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });

    it("should throw error when GITHUB_TOKEN is not set", async () => {
      process.env.GITHUB_TOKEN = "";

      const { updateProjectField } = await import("../bot/handlers/project-graphql-updater.js");

      await expect(
        updateProjectField({
          issueNodeId: "issue-node-id",
          projectId: "project-123",
          fieldId: "field-456",
          valueId: "value-789",
        })
      ).rejects.toThrow("GITHUB_TOKEN environment variable is not set");
    });

    it("should throw error on GraphQL errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [{ message: "Test error" }],
        }),
      });

      const { updateProjectField } = await import("../bot/handlers/project-graphql-updater.js");

      await expect(
        updateProjectField({
          issueNodeId: "issue-node-id",
          projectId: "project-123",
          fieldId: "field-456",
          valueId: "value-789",
        })
      ).rejects.toThrow("GraphQL errors");
    });
  });

  describe("getIssueNodeId", () => {
    it("should fetch issue node ID successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            repository: {
              issue: { id: "issue-node-123" },
            },
          },
        }),
      });

      const { getIssueNodeId } = await import("../bot/handlers/project-graphql-updater.js");

      const result = await getIssueNodeId("BlackRoad-OS", "blackroad-os", 1);

      expect(result).toBe("issue-node-123");
    });
  });

  describe("getProjectFields", () => {
    it("should fetch project fields for user successfully", async () => {
      const mockProject = {
        id: "project-123",
        fields: {
          nodes: [
            { id: "field-1", name: "Status", options: [{ id: "opt-1", name: "Done" }] },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: {
              projectV2: mockProject,
            },
          },
        }),
      });

      const { getProjectFields } = await import("../bot/handlers/project-graphql-updater.js");

      const result = await getProjectFields("BlackRoad-OS", 1, false);

      expect(result).toEqual(mockProject);
    });

    it("should fetch project fields for organization successfully", async () => {
      const mockProject = {
        id: "org-project-123",
        fields: {
          nodes: [
            { id: "field-1", name: "Status", options: [{ id: "opt-1", name: "Done" }] },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            organization: {
              projectV2: mockProject,
            },
          },
        }),
      });

      const { getProjectFields } = await import("../bot/handlers/project-graphql-updater.js");

      const result = await getProjectFields("BlackRoad-OS", 1, true);

      expect(result).toEqual(mockProject);
          headers: {
            Authorization: "bearer test-token",
            "Content-Type": "application/json",
          },
        })
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.variables.input).toEqual({
        projectId: "project-456",
        itemId: "issue-123",
        fieldId: "field-789",
        value: { singleSelectOptionId: "value-abc" },
      });

      expect(result.updateProjectV2ItemFieldValue.projectV2Item.id).toBe(
        "item-123"
      );
    });

    it("should throw error on HTTP failure", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      });

      await expect(
        updateProjectField({
          issueNodeId: "issue-123",
          projectId: "project-456",
          fieldId: "field-789",
          valueId: "value-abc",
        })
      ).rejects.toThrow("GraphQL request failed: 401 - Unauthorized");
    });

    it("should throw error on GraphQL errors", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            errors: [{ message: "Field not found" }],
          }),
      });

      await expect(
        updateProjectField({
          issueNodeId: "issue-123",
          projectId: "project-456",
          fieldId: "field-789",
          valueId: "value-abc",
        })
      ).rejects.toThrow("GraphQL errors:");
    });
  });

  describe("fetchProjectMetadata", () => {
    it("should throw error when GITHUB_TOKEN is not set", async () => {
      delete process.env.GITHUB_TOKEN;

      await expect(
        fetchProjectMetadata({
          owner: "BlackRoad-OS",
          repo: "blackroad-os",
          issueNumber: 1,
          projectNumber: 1,
        })
      ).rejects.toThrow("GITHUB_TOKEN environment variable is required");
    });

    it("should fetch project metadata with correct query", async () => {
      const mockResponse = {
        repository: {
          issue: { id: "issue-node-id-123" },
        },
        user: {
          projectV2: {
            id: "project-id-456",
            fields: {
              nodes: [
                {
                  id: "field-id-789",
                  name: "Status",
                  options: [
                    { id: "opt-done", name: "Done" },
                    { id: "opt-blocked", name: "Blocked" },
                  ],
                },
              ],
            },
          },
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockResponse }),
      });

      const result = await fetchProjectMetadata({
        owner: "BlackRoad-OS",
        repo: "blackroad-os",
        issueNumber: 1,
        projectNumber: 1,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/graphql",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "bearer test-token",
            "Content-Type": "application/json",
          },
        })
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.variables).toEqual({
        owner: "BlackRoad-OS",
        repo: "blackroad-os",
        issueNumber: 1,
        projectNumber: 1,
      });

      expect(result.repository.issue.id).toBe("issue-node-id-123");
      expect(result.user.projectV2.id).toBe("project-id-456");
    });
  });
});
