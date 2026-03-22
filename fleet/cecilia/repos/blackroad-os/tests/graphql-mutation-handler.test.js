// tests/graphql-mutation-handler.test.js
import { describe, expect, it, vi } from "vitest";
import {
  UPDATE_PROJECT_ITEM_FIELD,
  ADD_ITEM_TO_PROJECT,
  GET_PROJECT_BY_NUMBER,
  GET_USER_PROJECT_BY_NUMBER,
  GET_ISSUE_WITH_PROJECT_ITEMS,
  GET_ISSUE_REACTIONS,
  ADD_ISSUE_COMMENT,
  createGraphQLMutationHandler,
} from "../bot/graphql-mutation-handler";

describe("graphql-mutation-handler", () => {
  describe("GraphQL queries and mutations", () => {
    it("should export UPDATE_PROJECT_ITEM_FIELD mutation", () => {
      expect(UPDATE_PROJECT_ITEM_FIELD).toContain("mutation");
      expect(UPDATE_PROJECT_ITEM_FIELD).toContain("updateProjectV2ItemFieldValue");
    });

    it("should export ADD_ITEM_TO_PROJECT mutation", () => {
      expect(ADD_ITEM_TO_PROJECT).toContain("mutation");
      expect(ADD_ITEM_TO_PROJECT).toContain("addProjectV2ItemById");
    });

    it("should export GET_PROJECT_BY_NUMBER query", () => {
      expect(GET_PROJECT_BY_NUMBER).toContain("query");
      expect(GET_PROJECT_BY_NUMBER).toContain("organization");
      expect(GET_PROJECT_BY_NUMBER).toContain("projectV2");
    });

    it("should export GET_USER_PROJECT_BY_NUMBER query", () => {
      expect(GET_USER_PROJECT_BY_NUMBER).toContain("query");
      expect(GET_USER_PROJECT_BY_NUMBER).toContain("user");
    });

    it("should export GET_ISSUE_WITH_PROJECT_ITEMS query", () => {
      expect(GET_ISSUE_WITH_PROJECT_ITEMS).toContain("query");
      expect(GET_ISSUE_WITH_PROJECT_ITEMS).toContain("projectItems");
    });

    it("should export GET_ISSUE_REACTIONS query", () => {
      expect(GET_ISSUE_REACTIONS).toContain("query");
      expect(GET_ISSUE_REACTIONS).toContain("reactions");
    });

    it("should export ADD_ISSUE_COMMENT mutation", () => {
      expect(ADD_ISSUE_COMMENT).toContain("mutation");
      expect(ADD_ISSUE_COMMENT).toContain("addComment");
    });
  });

  describe("createGraphQLMutationHandler", () => {
    it("should create handler with all methods", () => {
      const mockOctokit = { graphql: vi.fn() };
      const handler = createGraphQLMutationHandler(mockOctokit);

      expect(handler).toHaveProperty("getProject");
      expect(handler).toHaveProperty("findStatusOption");
      expect(handler).toHaveProperty("getIssueWithProjects");
      expect(handler).toHaveProperty("getIssueReactions");
      expect(handler).toHaveProperty("updateProjectItemStatus");
      expect(handler).toHaveProperty("addIssueToProject");
      expect(handler).toHaveProperty("addIssueComment");
      expect(handler).toHaveProperty("updateIssueStatusByEmoji");
    });

    describe("getProject", () => {
      it("should fetch organization project", async () => {
        const mockOctokit = {
          graphql: vi.fn().mockResolvedValue({
            organization: {
              projectV2: {
                id: "proj1",
                title: "Test Project",
                fields: { nodes: [] },
              },
            },
          }),
        };

        const handler = createGraphQLMutationHandler(mockOctokit);
        const project = await handler.getProject("org", 1, true);

        expect(project.id).toBe("proj1");
        expect(project.title).toBe("Test Project");
      });

      it("should fetch user project", async () => {
        const mockOctokit = {
          graphql: vi.fn().mockResolvedValue({
            user: {
              projectV2: {
                id: "proj2",
                title: "User Project",
                fields: { nodes: [] },
              },
            },
          }),
        };

        const handler = createGraphQLMutationHandler(mockOctokit);
        const project = await handler.getProject("user", 1, false);

        expect(project.id).toBe("proj2");
        expect(project.title).toBe("User Project");
      });

      it("should throw error if project not found", async () => {
        const mockOctokit = {
          graphql: vi.fn().mockResolvedValue({
            organization: { projectV2: null },
          }),
        };

        const handler = createGraphQLMutationHandler(mockOctokit);

        await expect(handler.getProject("org", 999, true)).rejects.toThrow(
          "Project #999 not found"
        );
      });
    });

    describe("findStatusOption", () => {
      it("should find status field and option", () => {
        const mockOctokit = { graphql: vi.fn() };
        const handler = createGraphQLMutationHandler(mockOctokit);

        const project = {
          fields: {
            nodes: [
              {
                id: "f1",
                name: "Status",
                options: [
                  { id: "o1", name: "Done" },
                  { id: "o2", name: "In Progress" },
                ],
              },
            ],
          },
        };

        const result = handler.findStatusOption(project, "Done");
        expect(result.fieldId).toBe("f1");
        expect(result.optionId).toBe("o1");
        expect(result.optionName).toBe("Done");
      });

      it("should return null if no Status field", () => {
        const mockOctokit = { graphql: vi.fn() };
        const handler = createGraphQLMutationHandler(mockOctokit);

        const project = {
          fields: { nodes: [{ id: "f1", name: "Title" }] },
        };

        expect(handler.findStatusOption(project, "Done")).toBe(null);
      });

      it("should find status case-insensitively", () => {
        const mockOctokit = { graphql: vi.fn() };
        const handler = createGraphQLMutationHandler(mockOctokit);

        const project = {
          fields: {
            nodes: [
              {
                id: "f1",
                name: "Status",
                options: [{ id: "o1", name: "Done" }],
              },
            ],
          },
        };

        const result = handler.findStatusOption(project, "done");
        expect(result.optionId).toBe("o1");
      });
    });

    describe("getIssueWithProjects", () => {
      it("should fetch issue with project items", async () => {
        const mockOctokit = {
          graphql: vi.fn().mockResolvedValue({
            repository: {
              issue: {
                id: "issue1",
                title: "Test Issue",
                projectItems: { nodes: [] },
              },
            },
          }),
        };

        const handler = createGraphQLMutationHandler(mockOctokit);
        const issue = await handler.getIssueWithProjects("owner", "repo", 1);

        expect(issue.id).toBe("issue1");
        expect(issue.title).toBe("Test Issue");
      });
    });

    describe("getIssueReactions", () => {
      it("should fetch issue reactions", async () => {
        const mockOctokit = {
          graphql: vi.fn().mockResolvedValue({
            repository: {
              issue: {
                id: "issue1",
                reactions: {
                  nodes: [
                    { content: "THUMBS_UP", user: { login: "user1" } },
                    { content: "ROCKET", user: { login: "user2" } },
                  ],
                },
              },
            },
          }),
        };

        const handler = createGraphQLMutationHandler(mockOctokit);
        const reactions = await handler.getIssueReactions("owner", "repo", 1);

        expect(reactions).toHaveLength(2);
        expect(reactions[0].content).toBe("THUMBS_UP");
      });
    });

    describe("updateProjectItemStatus", () => {
      it("should update project item status", async () => {
        const mockOctokit = {
          graphql: vi.fn().mockResolvedValue({
            updateProjectV2ItemFieldValue: {
              projectV2Item: { id: "item1" },
            },
          }),
        };

        const handler = createGraphQLMutationHandler(mockOctokit);
        const result = await handler.updateProjectItemStatus({
          projectId: "proj1",
          itemId: "item1",
          fieldId: "field1",
          optionId: "opt1",
        });

        expect(result.success).toBe(true);
        expect(result.itemId).toBe("item1");
      });
    });

    describe("addIssueToProject", () => {
      it("should add issue to project", async () => {
        const mockOctokit = {
          graphql: vi.fn().mockResolvedValue({
            addProjectV2ItemById: {
              item: { id: "newItem1" },
            },
          }),
        };

        const handler = createGraphQLMutationHandler(mockOctokit);
        const result = await handler.addIssueToProject("proj1", "issue1");

        expect(result.success).toBe(true);
        expect(result.itemId).toBe("newItem1");
      });
    });

    describe("addIssueComment", () => {
      it("should add comment to issue", async () => {
        const mockOctokit = {
          graphql: vi.fn().mockResolvedValue({
            addComment: {
              commentEdge: {
                node: {
                  id: "comment1",
                  body: "Test comment",
                  createdAt: "2024-01-01T00:00:00Z",
                },
              },
            },
          }),
        };

        const handler = createGraphQLMutationHandler(mockOctokit);
        const result = await handler.addIssueComment("issue1", "Test comment");

        expect(result.success).toBe(true);
        expect(result.comment.id).toBe("comment1");
        expect(result.comment.body).toBe("Test comment");
      });
    });

    describe("updateIssueStatusByEmoji", () => {
      it("should update issue status in project", async () => {
        const mockOctokit = {
          graphql: vi
            .fn()
            .mockResolvedValueOnce({
              // getProject
              organization: {
                projectV2: {
                  id: "proj1",
                  title: "Test Project",
                  fields: {
                    nodes: [
                      {
                        id: "f1",
                        name: "Status",
                        options: [
                          { id: "o1", name: "Done" },
                          { id: "o2", name: "In Progress" },
                        ],
                      },
                    ],
                  },
                },
              },
            })
            .mockResolvedValueOnce({
              // getIssueWithProjects
              repository: {
                issue: {
                  id: "issue1",
                  title: "Test Issue",
                  projectItems: {
                    nodes: [
                      {
                        id: "item1",
                        project: { id: "proj1" },
                      },
                    ],
                  },
                },
              },
            })
            .mockResolvedValueOnce({
              // updateProjectItemStatus
              updateProjectV2ItemFieldValue: {
                projectV2Item: { id: "item1" },
              },
            }),
        };

        const handler = createGraphQLMutationHandler(mockOctokit);
        const result = await handler.updateIssueStatusByEmoji({
          owner: "org",
          repo: "repo",
          issueNumber: 1,
          statusName: "Done",
          projectNumber: 1,
          isOrg: true,
        });

        expect(result.success).toBe(true);
        expect(result.status).toBe("Done");
        expect(result.issueNumber).toBe(1);
      });

      it("should throw error if status not found in project", async () => {
        const mockOctokit = {
          graphql: vi.fn().mockResolvedValue({
            organization: {
              projectV2: {
                id: "proj1",
                title: "Test Project",
                fields: {
                  nodes: [
                    {
                      id: "f1",
                      name: "Status",
                      options: [{ id: "o1", name: "Done" }],
                    },
                  ],
                },
              },
            },
          }),
        };

        const handler = createGraphQLMutationHandler(mockOctokit);

        await expect(
          handler.updateIssueStatusByEmoji({
            owner: "org",
            repo: "repo",
            issueNumber: 1,
            statusName: "Unknown Status",
            projectNumber: 1,
            isOrg: true,
          })
        ).rejects.toThrow('Status "Unknown Status" not found in project');
      });
    });
  });
});
