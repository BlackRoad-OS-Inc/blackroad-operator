/**
 * Discord Webhook Integration
 *
 * Posts digest notifications to Discord channels via webhooks.
 * Documentation: https://discord.com/developers/docs/resources/webhook
 */

import type {
  DiscordWebhookConfig,
  DiscordWebhookPayload,
  DiscordEmbed,
  DigestContent,
  AudioResult,
} from "./types";

/** Discord embed color codes */
export const DISCORD_COLORS = {
  GREEN: 0x2ecc71,
  BLUE: 0x3498db,
  PURPLE: 0x9b59b6,
  ORANGE: 0xe67e22,
  RED: 0xe74c3c,
  GOLD: 0xf1c40f,
} as const;

/**
 * Posts a message to Discord via webhook
 *
 * @param config - Discord webhook configuration
 * @param payload - Message payload to send
 * @returns Response from Discord API
 */
export async function postToWebhook(
  config: DiscordWebhookConfig,
  payload: DiscordWebhookPayload
): Promise<{ id?: string; success: boolean }> {
  if (!config.webhookUrl) {
    throw new Error("Discord webhook URL is required");
  }

  // Add config username/avatar if not in payload
  const finalPayload: DiscordWebhookPayload = {
    ...payload,
    username: payload.username || config.username || "Lucidia",
    avatar_url: payload.avatar_url || config.avatarUrl,
  };

  const response = await fetch(`${config.webhookUrl}?wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Discord webhook error (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as { id?: string };
  return { id: data.id, success: true };
}

/**
 * Creates a Discord embed for a PR digest
 *
 * @param digest - The generated digest content
 * @param audio - Optional audio result
 * @returns Discord embed object
 */
export function createDigestEmbed(
  digest: DigestContent,
  audio?: AudioResult
): DiscordEmbed {
  const { metadata } = digest;

  const fields: DiscordEmbed["fields"] = [
    {
      name: "Author",
      value: `[@${metadata.author}](https://github.com/${metadata.author})`,
      inline: true,
    },
    {
      name: "Repository",
      value: `[${metadata.owner}/${metadata.repo}](https://github.com/${metadata.owner}/${metadata.repo})`,
      inline: true,
    },
    {
      name: "PR Number",
      value: `[#${metadata.number}](${metadata.url})`,
      inline: true,
    },
  ];

  if (metadata.labels && metadata.labels.length > 0) {
    fields.push({
      name: "Labels",
      value: metadata.labels.map((l) => `\`${l}\``).join(" "),
      inline: false,
    });
  }

  if (audio) {
    fields.push({
      name: "🔊 Audio Digest",
      value: `[Listen to Summary (${audio.format.toUpperCase()})](${audio.audioUrl})`,
      inline: false,
    });
  }

  return {
    title: `📋 ${metadata.title}`,
    description: digest.text,
    url: metadata.url,
    color: DISCORD_COLORS.PURPLE,
    fields,
    footer: {
      text: "Lucidia Voice Digest",
    },
    timestamp: digest.generatedAt,
    thumbnail: {
      url: `https://github.com/${metadata.author}.png`,
    },
  };
}

/**
 * Creates a full Discord webhook payload for a digest
 *
 * @param digest - The generated digest content
 * @param audio - Optional audio result
 * @returns Complete Discord webhook payload
 */
export function createDigestPayload(
  digest: DigestContent,
  audio?: AudioResult
): DiscordWebhookPayload {
  const embed = createDigestEmbed(digest, audio);

  return {
    content: audio
      ? "🎙️ **New Voice Digest Available**"
      : "📋 **New PR Digest**",
    embeds: [embed],
  };
}

/**
 * Validates Discord webhook configuration
 *
 * @param config - Configuration to validate
 * @returns true if valid, throws error otherwise
 */
export function validateConfig(config: DiscordWebhookConfig): boolean {
  if (!config.webhookUrl) {
    throw new Error(
      "Discord webhook URL is required (DISCORD_WEBHOOK_URL)"
    );
  }

  // Basic URL validation
  try {
    const url = new URL(config.webhookUrl);
    if (!url.hostname.includes("discord.com") && !url.hostname.includes("discordapp.com")) {
      throw new Error("Invalid Discord webhook URL format");
    }
  } catch {
    throw new Error("Invalid Discord webhook URL format");
  }

  return true;
}

/**
 * Default Discord webhook configuration
 */
export const DEFAULT_DISCORD_CONFIG: Partial<DiscordWebhookConfig> = {
  username: "Lucidia",
};
