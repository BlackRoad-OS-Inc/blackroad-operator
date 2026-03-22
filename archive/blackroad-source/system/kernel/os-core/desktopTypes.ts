/**
 * Desktop Shell Types
 * 🪟 App/window registry - what apps exist in the OS
 * 🧱 Layout + navigation rules - how a user moves around the OS
 */

import type { PsShaInfinity } from "../identity/identityTypes";
import type { Capability } from "../permissions/permissionTypes";

/**
 * AppDefinition describes an application available in BlackRoad OS
 * 🪟 App registry entry
 */
export interface AppDefinition {
  id: PsShaInfinity;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: AppCategory;
  kind: AppKind;
  version: string;
  author?: string;
  defaultRoute?: string;
  routes?: AppRoute[];
  capabilities?: Capability[];
  permissions?: string[];
  status: AppStatus;
  visibility: AppVisibility;
  metadata?: Record<string, unknown>;
}

export type AppCategory =
  | "system"
  | "productivity"
  | "development"
  | "analytics"
  | "integration"
  | "agent"
  | "pack"
  | "utility";

export type AppKind =
  | "native"
  | "web"
  | "iframe"
  | "agent"
  | "pack";

export type AppStatus = "active" | "disabled" | "deprecated" | "beta";
export type AppVisibility = "public" | "private" | "internal";

/**
 * AppRoute defines a navigable route within an app
 */
export interface AppRoute {
  path: string;
  name: string;
  title: string;
  icon?: string;
  showInNav: boolean;
  permissions?: string[];
  children?: AppRoute[];
}

/**
 * AppRegistry holds all registered apps in the OS
 */
export interface AppRegistry {
  apps: Map<PsShaInfinity, AppDefinition>;
  categories: AppCategory[];
  defaultAppId?: PsShaInfinity;
}

/**
 * LayoutConfig defines the desktop shell layout
 * 🧱 Layout rules
 */
export interface LayoutConfig {
  id: PsShaInfinity;
  name: string;
  regions: LayoutRegion[];
  defaultWindowPosition: WindowDefaults;
  maxWindows: number;
  snapToGrid: boolean;
  gridSize?: number;
}

export interface LayoutRegion {
  id: string;
  name: string;
  type: RegionType;
  position: RegionPosition;
  allowResize: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export type RegionType = "sidebar" | "header" | "footer" | "dock" | "workspace" | "panel";

export interface RegionPosition {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  width?: number | string;
  height?: number | string;
}

export interface WindowDefaults {
  width: number;
  height: number;
  centerOnOpen: boolean;
  cascadeOffset: number;
}

/**
 * NavigationConfig defines navigation rules
 * 🧱 Navigation rules - how a user moves around the OS
 */
export interface NavigationConfig {
  mainMenu: NavMenuItem[];
  quickActions: NavQuickAction[];
  breadcrumbEnabled: boolean;
  historyEnabled: boolean;
  searchEnabled: boolean;
  keyboardShortcutsEnabled: boolean;
  shortcuts?: KeyboardShortcut[];
}

export interface NavMenuItem {
  id: string;
  label: string;
  icon?: string;
  appId?: PsShaInfinity;
  route?: string;
  children?: NavMenuItem[];
  visible: boolean;
  permissions?: string[];
  badge?: NavBadge;
}

export interface NavQuickAction {
  id: string;
  label: string;
  icon: string;
  action: QuickActionType;
  shortcut?: string;
  appId?: PsShaInfinity;
}

export type QuickActionType = "open_app" | "run_command" | "navigate" | "search" | "create";

export interface NavBadge {
  count?: number;
  type: BadgeType;
  label?: string;
}

export type BadgeType = "count" | "dot" | "new" | "warning" | "error";

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  action: string;
  description: string;
  scope: ShortcutScope;
}

export type ShortcutScope = "global" | "app" | "window";

/**
 * DockItem represents an app pinned to the dock
 */
export interface DockItem {
  id: string;
  appId: PsShaInfinity;
  position: number;
  pinned: boolean;
}

/**
 * Built-in system apps
 */
export const SystemApps = {
  DASHBOARD: "dashboard",
  SETTINGS: "settings",
  PRISM_CONSOLE: "prism-console",
  AGENT_STUDIO: "agent-studio",
  WORKSPACE: "workspace",
  NOTIFICATIONS: "notifications",
  HELP: "help",
} as const;

export type SystemAppId = (typeof SystemApps)[keyof typeof SystemApps];
