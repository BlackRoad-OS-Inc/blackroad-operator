import {
  type AppContext,
  type DeepLink,
  parseDeepLink,
  buildDeepLink,
} from "../src/context/contextTypes";

describe("Context Types", () => {
  describe("AppContext", () => {
    it("should create a valid app context", () => {
      const context: AppContext = {
        currentUser: {
          id: "pssha∞_user123",
          email: "test@example.com",
          displayName: "Test User",
          roles: ["admin", "editor"],
        },
        currentOrg: {
          id: "pssha∞_org123",
          name: "Test Org",
          slug: "test-org",
          plan: "pro",
          memberRole: "admin",
        },
        currentWorkspace: {
          id: "pssha∞_ws123",
          name: "Test Workspace",
          slug: "test-workspace",
          environment: "development",
          memberRole: "editor",
        },
        selectedAgent: {
          id: "pssha∞_agent123",
          name: "Test Agent",
          role: "researcher",
          status: "idle",
        },
        environment: {
          name: "development",
          apiBaseUrl: "https://api.dev.blackroad.dev",
          features: {
            beta: true,
            newDashboard: true,
          },
        },
      };

      expect(context.currentUser.roles).toContain("admin");
      expect(context.currentOrg.plan).toBe("pro");
      expect(context.environment.features.beta).toBe(true);
    });
  });

  describe("parseDeepLink", () => {
    it("should parse a valid deep link", () => {
      const link = parseDeepLink("blackroad://dashboard/analytics?timeRange=7d");

      expect(link).not.toBeNull();
      expect(link?.appId).toBe("dashboard");
      expect(link?.route).toBe("/analytics");
      expect(link?.params?.timeRange).toBe("7d");
    });

    it("should parse a deep link with no params", () => {
      const link = parseDeepLink("blackroad://settings/profile");

      expect(link).not.toBeNull();
      expect(link?.appId).toBe("settings");
      expect(link?.route).toBe("/profile");
      expect(link?.params).toBeUndefined();
    });

    it("should return null for invalid URLs", () => {
      const link = parseDeepLink("not-a-url");

      expect(link).toBeNull();
    });

    it("should handle empty path", () => {
      const link = parseDeepLink("blackroad://");

      expect(link).toBeNull();
    });
  });

  describe("buildDeepLink", () => {
    it("should build a deep link from object", () => {
      const link: DeepLink = {
        appId: "dashboard",
        route: "/analytics",
        params: { timeRange: "7d", view: "chart" },
      };

      const url = buildDeepLink(link);

      expect(url).toBe("blackroad://dashboard/analytics?timeRange=7d&view=chart");
    });

    it("should build a deep link without params", () => {
      const link: DeepLink = {
        appId: "settings",
        route: "/profile",
      };

      const url = buildDeepLink(link);

      expect(url).toBe("blackroad://settings/profile");
    });

    it("should use custom base URL", () => {
      const link: DeepLink = {
        appId: "app",
        route: "/test",
      };

      const url = buildDeepLink(link, "https://blackroad.dev/");

      expect(url).toBe("https://blackroad.dev/app/test");
    });
  });
});
