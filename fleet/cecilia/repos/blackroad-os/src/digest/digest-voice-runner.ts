/**
 * Digest Voice Runner
 *
 * Main orchestrator for the Voice + Video Digest module.
 * Handles the full pipeline: PR metadata → Digest → Voice → Discord
 */

import type {
  PRMetadata,
  DigestContent,
  AudioResult,
  DigestResult,
  DigestRunnerConfig,
  VoiceConfig,
  DiscordWebhookConfig,
} from "./types";
import { generateDigest, validateMetadata } from "./digest-generator";
import {
  generateSpeech,
  createAudioResult,
  validateConfig as validateVoiceConfig,
  DEFAULT_VOICE_CONFIG,
} from "./elevenlabs";
import {
  postToWebhook,
  createDigestPayload,
  validateConfig as validateDiscordConfig,
  DEFAULT_DISCORD_CONFIG,
} from "./discord-webhook";

/**
 * Main digest runner that orchestrates the full pipeline
 */
export class DigestVoiceRunner {
  private config: DigestRunnerConfig;

  constructor(config: Partial<DigestRunnerConfig> = {}) {
    this.config = {
      enableVoice: config.enableVoice ?? false,
      enableDiscord: config.enableDiscord ?? false,
      voice: config.voice,
      discord: config.discord,
    };
  }

  /**
   * Runs the full digest pipeline for a PR
   *
   * @param metadata - PR metadata to process
   * @param audioUrlGenerator - Optional function to generate audio URL from buffer
   * @returns DigestResult with all outputs
   */
  async run(
    metadata: PRMetadata,
    audioUrlGenerator?: (buffer: Buffer) => Promise<string>
  ): Promise<DigestResult> {
    // Validate metadata
    validateMetadata(metadata);

    // Generate text digest
    const digest = generateDigest(metadata);

    let audio: AudioResult | undefined;
    let postedToDiscord = false;
    let discordMessageId: string | undefined;

    // Generate voice if enabled
    if (this.config.enableVoice && this.config.voice) {
      validateVoiceConfig(this.config.voice);
      const audioBuffer = await generateSpeech(digest.text, this.config.voice);

      // Generate audio URL (requires external storage handling)
      const audioUrl = audioUrlGenerator
        ? await audioUrlGenerator(audioBuffer)
        : `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;

      audio = createAudioResult(audioBuffer, audioUrl);
    }

    // Post to Discord if enabled
    if (this.config.enableDiscord && this.config.discord) {
      validateDiscordConfig(this.config.discord);
      const payload = createDigestPayload(digest, audio);
      const result = await postToWebhook(this.config.discord, payload);
      postedToDiscord = result.success;
      discordMessageId = result.id;
    }

    return {
      digest,
      audio,
      postedToDiscord,
      discordMessageId,
    };
  }

  /**
   * Generates only the text digest (no voice/posting)
   *
   * @param metadata - PR metadata
   * @returns Generated digest content
   */
  generateDigestOnly(metadata: PRMetadata): DigestContent {
    validateMetadata(metadata);
    return generateDigest(metadata);
  }

  /**
   * Updates runner configuration
   *
   * @param config - New configuration values
   */
  updateConfig(config: Partial<DigestRunnerConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Gets current configuration (without sensitive data)
   */
  getConfig(): Omit<DigestRunnerConfig, "voice" | "discord"> & {
    voice?: Omit<VoiceConfig, "apiKey">;
    discord?: Omit<DiscordWebhookConfig, "webhookUrl">;
  } {
    return {
      enableVoice: this.config.enableVoice,
      enableDiscord: this.config.enableDiscord,
      voice: this.config.voice
        ? {
            provider: this.config.voice.provider,
            voiceId: this.config.voice.voiceId,
            modelId: this.config.voice.modelId,
            stability: this.config.voice.stability,
            similarityBoost: this.config.voice.similarityBoost,
          }
        : undefined,
      discord: this.config.discord
        ? {
            username: this.config.discord.username,
            avatarUrl: this.config.discord.avatarUrl,
          }
        : undefined,
    };
  }
}

/**
 * Creates a DigestVoiceRunner from environment variables
 *
 * Environment variables:
 * - ELEVENLABS_API_KEY: ElevenLabs API key
 * - ELEVENLABS_VOICE_ID: Voice ID to use
 * - ELEVENLABS_MODEL_ID: Model ID (optional)
 * - DISCORD_WEBHOOK_URL: Discord webhook URL
 * - DISCORD_BOT_USERNAME: Bot display name (optional)
 * - DISCORD_BOT_AVATAR: Bot avatar URL (optional)
 * - ENABLE_VOICE: Enable voice generation (true/false)
 * - ENABLE_DISCORD: Enable Discord posting (true/false)
 *
 * @returns Configured DigestVoiceRunner
 */
export function createRunnerFromEnv(): DigestVoiceRunner {
  const enableVoice = process.env.ENABLE_VOICE === "true";
  const enableDiscord = process.env.ENABLE_DISCORD === "true";

  const voice: VoiceConfig | undefined = enableVoice
    ? {
        provider: "elevenlabs",
        apiKey: process.env.ELEVENLABS_API_KEY || "",
        voiceId:
          process.env.ELEVENLABS_VOICE_ID ||
          (DEFAULT_VOICE_CONFIG.voiceId as string),
        modelId:
          process.env.ELEVENLABS_MODEL_ID || DEFAULT_VOICE_CONFIG.modelId,
        stability: DEFAULT_VOICE_CONFIG.stability,
        similarityBoost: DEFAULT_VOICE_CONFIG.similarityBoost,
      }
    : undefined;

  const discord: DiscordWebhookConfig | undefined = enableDiscord
    ? {
        webhookUrl: process.env.DISCORD_WEBHOOK_URL || "",
        username:
          process.env.DISCORD_BOT_USERNAME || DEFAULT_DISCORD_CONFIG.username,
        avatarUrl: process.env.DISCORD_BOT_AVATAR,
      }
    : undefined;

  return new DigestVoiceRunner({
    enableVoice,
    enableDiscord,
    voice,
    discord,
  });
}

// Export default runner creation
export { DEFAULT_VOICE_CONFIG, DEFAULT_DISCORD_CONFIG };
