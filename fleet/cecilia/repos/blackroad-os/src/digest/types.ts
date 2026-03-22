/**
 * Types for the Voice + Video Digest Module
 */

export interface PRMetadata {
  /** Pull request number */
  number: number;
  /** Pull request title */
  title: string;
  /** Pull request body/description */
  body: string | null;
  /** Author login */
  author: string;
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
  /** PR URL */
  url: string;
  /** Files changed in the PR */
  filesChanged?: string[];
  /** Labels applied to the PR */
  labels?: string[];
  /** Timestamp when PR was created */
  createdAt: string;
  /** Timestamp when PR was merged (if applicable) */
  mergedAt?: string | null;
}

export interface DigestContent {
  /** Plain text summary */
  text: string;
  /** Optional SSML-formatted text for better TTS */
  ssml?: string;
  /** PR metadata used to generate this digest */
  metadata: PRMetadata;
  /** When this digest was generated */
  generatedAt: string;
}

export interface VoiceConfig {
  /** Voice provider (elevenlabs, playht, aws-polly, google-tts) */
  provider: "elevenlabs" | "playht" | "aws-polly" | "google-tts";
  /** Voice ID or name */
  voiceId: string;
  /** API key for the provider */
  apiKey: string;
  /** Model ID (for providers that support multiple models) */
  modelId?: string;
  /** Voice stability (0-1 for ElevenLabs) */
  stability?: number;
  /** Voice similarity boost (0-1 for ElevenLabs) */
  similarityBoost?: number;
}

export interface AudioResult {
  /** URL to the generated audio file */
  audioUrl: string;
  /** Duration in seconds */
  durationSeconds?: number;
  /** Audio format */
  format: "mp3" | "m4a" | "wav";
  /** File size in bytes */
  sizeBytes?: number;
}

export interface DiscordWebhookConfig {
  /** Discord webhook URL */
  webhookUrl: string;
  /** Bot username to display */
  username?: string;
  /** Bot avatar URL */
  avatarUrl?: string;
}

export interface DiscordEmbed {
  /** Embed title */
  title?: string;
  /** Embed description */
  description?: string;
  /** Embed URL */
  url?: string;
  /** Embed color (decimal) */
  color?: number;
  /** Embed fields */
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  /** Embed footer */
  footer?: {
    text: string;
    icon_url?: string;
  };
  /** Embed timestamp (ISO 8601) */
  timestamp?: string;
  /** Embed thumbnail */
  thumbnail?: {
    url: string;
  };
}

export interface DiscordWebhookPayload {
  /** Message content */
  content?: string;
  /** Bot username */
  username?: string;
  /** Bot avatar URL */
  avatar_url?: string;
  /** Embeds array */
  embeds?: DiscordEmbed[];
  /** Thread name (for forum channels) */
  thread_name?: string;
}

export interface DigestResult {
  /** Generated digest content */
  digest: DigestContent;
  /** Generated audio (if voice enabled) */
  audio?: AudioResult;
  /** Whether successfully posted to Discord */
  postedToDiscord?: boolean;
  /** Discord message ID if posted */
  discordMessageId?: string;
}

export interface DigestRunnerConfig {
  /** Voice configuration */
  voice?: VoiceConfig;
  /** Discord webhook configuration */
  discord?: DiscordWebhookConfig;
  /** Whether to generate audio */
  enableVoice: boolean;
  /** Whether to post to Discord */
  enableDiscord: boolean;
}
