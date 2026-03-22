/**
 * Lucidia Agent PR Notification Module
 * 
 * Sends notifications to Discord or Slack when a new agent PR is spawned.
 */

import type { AgentPRPayload, WebhookResponse, NotifyOptions } from "./types";

/**
 * Formats the notification message for Discord/Slack
 */
export function formatNotificationMessage(payload: AgentPRPayload): string {
  return [
    `🚀 Lucidia has opened a new auto-generated PR:`,
    `🔗 ${payload.prURL}`,
    `🧬 Agent: ${payload.agentName}`,
    `📦 Purpose: ${payload.purpose}`,
    `💬 Summary: ${payload.summary}`,
    `⏱️ TTL: ${payload.ttl}`,
    `👁️ Awaiting approval from @${payload.awaitingApproval}`
  ].join("\n");
}

/**
 * Builds the webhook payload for Discord/Slack
 * Works with both Discord and Slack incoming webhooks
 */
export function buildWebhookPayload(payload: AgentPRPayload): { content: string; text?: string } {
  const content = formatNotificationMessage(payload);
  return {
    content, // Discord format
    text: content // Slack format (for compatibility)
  };
}

/**
 * Sends a notification to the configured Discord/Slack webhook
 */
export async function sendAgentPRNotification(options: NotifyOptions): Promise<WebhookResponse> {
  const { webhookURL, payload } = options;

  if (!webhookURL) {
    return {
      success: false,
      error: "No webhook URL provided. Set LUCIDIA_WEBHOOK environment variable."
    };
  }

  const webhookPayload = buildWebhookPayload(payload);

  try {
    const response = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload)
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Webhook request failed with status: ${response.status}`
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to send notification: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Convenience function to notify from environment configuration
 */
export async function notifyAgentPR(payload: AgentPRPayload): Promise<WebhookResponse> {
  const webhookURL = process.env.LUCIDIA_WEBHOOK || "";
  return sendAgentPRNotification({ webhookURL, payload });
}

export type { AgentPRPayload, WebhookResponse, NotifyOptions } from "./types";
