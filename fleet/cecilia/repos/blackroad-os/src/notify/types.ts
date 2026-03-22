/**
 * Types for Lucidia Agent PR Notification System
 */

export interface AgentPRPayload {
  /** The full URL to the PR */
  prURL: string;
  /** The agent name/identifier (e.g., "guardian-clone-vault") */
  agentName: string;
  /** Purpose of the spawned agent */
  purpose: string;
  /** Summary of why the agent was spawned */
  summary: string;
  /** Time-to-live for the agent (e.g., "96h") */
  ttl: string;
  /** User to await approval from */
  awaitingApproval: string;
}

export interface WebhookResponse {
  success: boolean;
  error?: string;
}

export interface NotifyOptions {
  /** The webhook URL for Discord or Slack */
  webhookURL: string;
  /** The payload containing PR information */
  payload: AgentPRPayload;
}
