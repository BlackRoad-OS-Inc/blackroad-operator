/**
 * Voice + Video Digest Module
 *
 * Provides functionality for:
 * - Generating PR digests using Codex logic
 * - Converting text to speech via ElevenLabs
 * - Posting notifications to Discord
 *
 * @example
 * ```typescript
 * import { DigestVoiceRunner, createRunnerFromEnv } from './digest';
 *
 * // Create runner from environment variables
 * const runner = createRunnerFromEnv();
 *
 * // Generate digest for a PR
 * const result = await runner.run({
 *   number: 42,
 *   title: 'Add voice digest feature',
 *   author: 'developer',
 *   owner: 'org',
 *   repo: 'repo',
 *   url: 'https://github.com/org/repo/pull/42',
 *   createdAt: new Date().toISOString(),
 *   body: 'This PR adds voice digest functionality.'
 * });
 *
 * console.log(result.digest.text);
 * ```
 */

// Types
export type {
  PRMetadata,
  DigestContent,
  VoiceConfig,
  AudioResult,
  DiscordWebhookConfig,
  DiscordWebhookPayload,
  DiscordEmbed,
  DigestResult,
  DigestRunnerConfig,
} from "./types";

// Main runner
export {
  DigestVoiceRunner,
  createRunnerFromEnv,
  DEFAULT_VOICE_CONFIG,
  DEFAULT_DISCORD_CONFIG,
} from "./digest-voice-runner";

// Digest generation
export {
  generateDigest,
  createDigestText,
  summarizeBody,
  validateMetadata,
  loadPromptTemplate,
  fillTemplate,
} from "./digest-generator";

// ElevenLabs TTS
export {
  generateSpeech,
  listVoices,
  createAudioResult,
  validateConfig as validateVoiceConfig,
} from "./elevenlabs";

// Discord webhook
export {
  postToWebhook,
  createDigestEmbed,
  createDigestPayload,
  validateConfig as validateDiscordConfig,
  DISCORD_COLORS,
} from "./discord-webhook";
