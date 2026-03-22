/**
 * Session & State Management Types
 * 🧭 Tracks what's open, where, and for whom in BlackRoad OS
 */

import type { PsShaInfinity } from "../identity/identityTypes";

/**
 * Session represents an active user session in BlackRoad OS
 */
export interface Session {
  id: PsShaInfinity;
  userId: PsShaInfinity;
  orgId: PsShaInfinity;
  workspaceId?: PsShaInfinity;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
  status: SessionStatus;
  deviceInfo?: DeviceInfo;
}

export type SessionStatus = "active" | "expired" | "revoked";

export interface DeviceInfo {
  userAgent?: string;
  ipAddress?: string;
  platform?: string;
  browser?: string;
}

/**
 * SessionContext captures the current user's active context
 * 🧳 Cross-app context passing - which org, env, project, agent is selected
 */
export interface SessionContext {
  sessionId: PsShaInfinity;
  userId: PsShaInfinity;
  currentOrgId: PsShaInfinity;
  currentWorkspaceId?: PsShaInfinity;
  currentEnvironment: ContextEnvironment;
  selectedAgentId?: PsShaInfinity;
  selectedProjectId?: PsShaInfinity;
  openWindows: WindowState[];
  focusedWindowId?: PsShaInfinity;
  preferences?: UserPreferences;
}

export type ContextEnvironment = "local" | "development" | "staging" | "production";

/**
 * WindowState tracks an open window/app in the OS desktop shell
 */
export interface WindowState {
  id: PsShaInfinity;
  appId: PsShaInfinity;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  state: WindowDisplayState;
  zIndex: number;
  route?: string;
  params?: Record<string, unknown>;
  openedAt: string;
}

export type WindowDisplayState = "normal" | "minimized" | "maximized" | "hidden";

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

/**
 * User preferences for session persistence
 */
export interface UserPreferences {
  theme: ThemePreference;
  language: string;
  timezone?: string;
  notifications: NotificationPreferences;
}

export type ThemePreference = "light" | "dark" | "system";

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

/**
 * State snapshot for session recovery
 */
export interface SessionSnapshot {
  id: PsShaInfinity;
  sessionId: PsShaInfinity;
  context: SessionContext;
  savedAt: string;
  autoSaved: boolean;
}
