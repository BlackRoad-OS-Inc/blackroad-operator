import {
  type User,
  type Org,
  type Workspace,
  type OrgMembership,
  type WorkspaceMembership,
} from "../src/identity/identityTypes";

describe("Identity Types", () => {
  describe("User", () => {
    it("should create a valid user object", () => {
      const user: User = {
        id: "pssha∞_user123",
        email: "test@example.com",
        displayName: "Test User",
        avatarUrl: "https://example.com/avatar.png",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: "active",
        metadata: { team: "engineering" },
      };

      expect(user.id).toBe("pssha∞_user123");
      expect(user.email).toBe("test@example.com");
      expect(user.status).toBe("active");
    });

    it("should support optional metadata", () => {
      const user: User = {
        id: "pssha∞_user456",
        email: "minimal@example.com",
        displayName: "Minimal User",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: "pending",
      };

      expect(user.avatarUrl).toBeUndefined();
      expect(user.metadata).toBeUndefined();
    });
  });

  describe("Org", () => {
    it("should create a valid org object", () => {
      const org: Org = {
        id: "pssha∞_org123",
        name: "Test Organization",
        slug: "test-org",
        ownerId: "pssha∞_user123",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: "active",
        plan: "pro",
      };

      expect(org.id).toBe("pssha∞_org123");
      expect(org.slug).toBe("test-org");
      expect(org.plan).toBe("pro");
    });
  });

  describe("Workspace", () => {
    it("should create a valid workspace object", () => {
      const workspace: Workspace = {
        id: "pssha∞_ws123",
        orgId: "pssha∞_org123",
        name: "Test Workspace",
        slug: "test-workspace",
        description: "A test workspace",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: "active",
        environment: "development",
      };

      expect(workspace.id).toBe("pssha∞_ws123");
      expect(workspace.environment).toBe("development");
    });
  });

  describe("OrgMembership", () => {
    it("should create a valid org membership", () => {
      const membership: OrgMembership = {
        userId: "pssha∞_user123",
        orgId: "pssha∞_org123",
        role: "admin",
        joinedAt: "2024-01-01T00:00:00.000Z",
        status: "active",
      };

      expect(membership.role).toBe("admin");
      expect(membership.status).toBe("active");
    });
  });

  describe("WorkspaceMembership", () => {
    it("should create a valid workspace membership", () => {
      const membership: WorkspaceMembership = {
        userId: "pssha∞_user123",
        workspaceId: "pssha∞_ws123",
        role: "editor",
        joinedAt: "2024-01-01T00:00:00.000Z",
        status: "active",
      };

      expect(membership.role).toBe("editor");
      expect(membership.status).toBe("active");
    });
  });
});
