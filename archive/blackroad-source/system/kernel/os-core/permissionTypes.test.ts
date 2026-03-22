import {
  type Permission,
  type Role,
  type AccessPolicy,
  type PermissionCheck,
  SystemRoles,
} from "../src/permissions/permissionTypes";

describe("Permission Types", () => {
  describe("Permission", () => {
    it("should create a valid permission", () => {
      const permission: Permission = {
        id: "perm_read_workspace",
        name: "Read Workspace",
        description: "Allows reading workspace data",
        resource: "workspace",
        action: "read",
      };

      expect(permission.resource).toBe("workspace");
      expect(permission.action).toBe("read");
    });
  });

  describe("Role", () => {
    it("should create a valid role with permissions", () => {
      const role: Role = {
        id: "pssha∞_role123",
        name: "Workspace Editor",
        description: "Can edit workspace content",
        scope: "workspace",
        permissions: [
          {
            id: "perm_read",
            name: "Read",
            description: "Can read",
            resource: "workspace",
            action: "read",
          },
          {
            id: "perm_update",
            name: "Update",
            description: "Can update",
            resource: "workspace",
            action: "update",
          },
        ],
        isCustom: false,
        createdAt: "2024-01-01T00:00:00.000Z",
      };

      expect(role.scope).toBe("workspace");
      expect(role.permissions).toHaveLength(2);
    });
  });

  describe("AccessPolicy", () => {
    it("should create a valid access policy", () => {
      const policy: AccessPolicy = {
        id: "pssha∞_policy123",
        name: "Default Access Policy",
        description: "Default access rules",
        rules: [
          {
            id: "rule_1",
            effect: "allow",
            resources: ["workspace/*"],
            actions: ["read"],
            conditions: [
              {
                field: "org.plan",
                operator: "eq",
                value: "enterprise",
              },
            ],
          },
        ],
        priority: 100,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      expect(policy.rules).toHaveLength(1);
      expect(policy.rules[0].effect).toBe("allow");
      expect(policy.rules[0].conditions?.[0].operator).toBe("eq");
    });
  });

  describe("PermissionCheck", () => {
    it("should create a valid permission check", () => {
      const check: PermissionCheck = {
        userId: "pssha∞_user123",
        resource: "workspace",
        action: "update",
        resourceId: "pssha∞_ws123",
        context: { environment: "production" },
      };

      expect(check.action).toBe("update");
      expect(check.context?.environment).toBe("production");
    });
  });

  describe("SystemRoles", () => {
    it("should define all expected system roles", () => {
      expect(SystemRoles.SYSTEM_ADMIN).toBe("system_admin");
      expect(SystemRoles.ORG_OWNER).toBe("org_owner");
      expect(SystemRoles.ORG_ADMIN).toBe("org_admin");
      expect(SystemRoles.ORG_MEMBER).toBe("org_member");
      expect(SystemRoles.ORG_VIEWER).toBe("org_viewer");
      expect(SystemRoles.WORKSPACE_ADMIN).toBe("workspace_admin");
      expect(SystemRoles.WORKSPACE_EDITOR).toBe("workspace_editor");
      expect(SystemRoles.WORKSPACE_VIEWER).toBe("workspace_viewer");
    });
  });
});
