import {
  type Session,
  type SessionContext,
  type WindowState,
  type UserPreferences,
} from "../src/session/sessionTypes";

describe("Session Types", () => {
  describe("Session", () => {
    it("should create a valid session object", () => {
      const session: Session = {
        id: "pssha∞_sess123",
        userId: "pssha∞_user123",
        orgId: "pssha∞_org123",
        workspaceId: "pssha∞_ws123",
        createdAt: "2024-01-01T00:00:00.000Z",
        expiresAt: "2024-01-02T00:00:00.000Z",
        lastActiveAt: "2024-01-01T12:00:00.000Z",
        status: "active",
        deviceInfo: {
          userAgent: "Mozilla/5.0",
          platform: "macOS",
          browser: "Chrome",
        },
      };

      expect(session.id).toBe("pssha∞_sess123");
      expect(session.status).toBe("active");
      expect(session.deviceInfo?.platform).toBe("macOS");
    });
  });

  describe("SessionContext", () => {
    it("should create a valid session context", () => {
      const windowState: WindowState = {
        id: "pssha∞_win123",
        appId: "pssha∞_app_dashboard",
        title: "Dashboard",
        position: { x: 100, y: 100 },
        size: { width: 800, height: 600 },
        state: "normal",
        zIndex: 1,
        route: "/",
        openedAt: "2024-01-01T12:00:00.000Z",
      };

      const context: SessionContext = {
        sessionId: "pssha∞_sess123",
        userId: "pssha∞_user123",
        currentOrgId: "pssha∞_org123",
        currentWorkspaceId: "pssha∞_ws123",
        currentEnvironment: "development",
        selectedAgentId: "pssha∞_agent123",
        openWindows: [windowState],
        focusedWindowId: "pssha∞_win123",
      };

      expect(context.currentEnvironment).toBe("development");
      expect(context.openWindows).toHaveLength(1);
      expect(context.openWindows[0].title).toBe("Dashboard");
    });
  });

  describe("WindowState", () => {
    it("should support all window states", () => {
      const states: WindowState["state"][] = ["normal", "minimized", "maximized", "hidden"];
      
      states.forEach((state) => {
        const window: WindowState = {
          id: "pssha∞_win123",
          appId: "pssha∞_app123",
          title: "Test Window",
          position: { x: 0, y: 0 },
          size: { width: 800, height: 600 },
          state,
          zIndex: 1,
          openedAt: "2024-01-01T00:00:00.000Z",
        };

        expect(window.state).toBe(state);
      });
    });
  });

  describe("UserPreferences", () => {
    it("should create valid user preferences", () => {
      const preferences: UserPreferences = {
        theme: "dark",
        language: "en",
        timezone: "America/New_York",
        notifications: {
          email: true,
          push: true,
          inApp: true,
        },
      };

      expect(preferences.theme).toBe("dark");
      expect(preferences.notifications.email).toBe(true);
    });
  });
});
