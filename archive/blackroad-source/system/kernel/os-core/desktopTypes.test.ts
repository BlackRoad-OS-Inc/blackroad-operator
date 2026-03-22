import {
  type AppDefinition,
  type LayoutConfig,
  type NavigationConfig,
  SystemApps,
} from "../src/desktop/desktopTypes";

describe("Desktop Types", () => {
  describe("AppDefinition", () => {
    it("should create a valid app definition", () => {
      const app: AppDefinition = {
        id: "pssha∞_app_dashboard",
        name: "Dashboard",
        slug: "dashboard",
        description: "Main dashboard application",
        icon: "📊",
        category: "system",
        kind: "native",
        version: "1.0.0",
        author: "BlackRoad OS",
        defaultRoute: "/",
        routes: [
          {
            path: "/",
            name: "home",
            title: "Home",
            icon: "🏠",
            showInNav: true,
          },
          {
            path: "/analytics",
            name: "analytics",
            title: "Analytics",
            icon: "📈",
            showInNav: true,
            permissions: ["analytics.read"],
          },
        ],
        status: "active",
        visibility: "public",
      };

      expect(app.category).toBe("system");
      expect(app.kind).toBe("native");
      expect(app.routes).toHaveLength(2);
    });
  });

  describe("LayoutConfig", () => {
    it("should create a valid layout config", () => {
      const layout: LayoutConfig = {
        id: "pssha∞_layout_default",
        name: "Default Layout",
        regions: [
          {
            id: "sidebar",
            name: "Sidebar",
            type: "sidebar",
            position: { left: 0, top: 0, width: 240, height: "100%" },
            allowResize: true,
            minWidth: 200,
            maxWidth: 400,
          },
          {
            id: "workspace",
            name: "Workspace",
            type: "workspace",
            position: { left: 240, top: 48, right: 0, bottom: 0 },
            allowResize: false,
          },
        ],
        defaultWindowPosition: {
          width: 800,
          height: 600,
          centerOnOpen: true,
          cascadeOffset: 24,
        },
        maxWindows: 20,
        snapToGrid: true,
        gridSize: 8,
      };

      expect(layout.regions).toHaveLength(2);
      expect(layout.defaultWindowPosition.centerOnOpen).toBe(true);
    });
  });

  describe("NavigationConfig", () => {
    it("should create a valid navigation config", () => {
      const nav: NavigationConfig = {
        mainMenu: [
          {
            id: "home",
            label: "Home",
            icon: "🏠",
            appId: "pssha∞_app_dashboard",
            route: "/",
            visible: true,
          },
          {
            id: "agents",
            label: "Agents",
            icon: "🤖",
            visible: true,
            children: [
              {
                id: "agent-studio",
                label: "Agent Studio",
                appId: "pssha∞_app_studio",
                route: "/studio",
                visible: true,
              },
            ],
          },
        ],
        quickActions: [
          {
            id: "new-agent",
            label: "New Agent",
            icon: "➕",
            action: "create",
            shortcut: "Cmd+N",
          },
        ],
        breadcrumbEnabled: true,
        historyEnabled: true,
        searchEnabled: true,
        keyboardShortcutsEnabled: true,
        shortcuts: [
          {
            id: "search",
            keys: ["Cmd", "K"],
            action: "openSearch",
            description: "Open search",
            scope: "global",
          },
        ],
      };

      expect(nav.mainMenu).toHaveLength(2);
      expect(nav.quickActions).toHaveLength(1);
      expect(nav.shortcuts?.[0].keys).toContain("Cmd");
    });
  });

  describe("SystemApps", () => {
    it("should define all expected system apps", () => {
      expect(SystemApps.DASHBOARD).toBe("dashboard");
      expect(SystemApps.SETTINGS).toBe("settings");
      expect(SystemApps.PRISM_CONSOLE).toBe("prism-console");
      expect(SystemApps.AGENT_STUDIO).toBe("agent-studio");
      expect(SystemApps.WORKSPACE).toBe("workspace");
      expect(SystemApps.NOTIFICATIONS).toBe("notifications");
      expect(SystemApps.HELP).toBe("help");
    });
  });
});
