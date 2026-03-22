import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  DigestVoiceRunner,
  createRunnerFromEnv,
} from "../src/digest/digest-voice-runner";
import type { PRMetadata } from "../src/digest/types";

const sampleMetadata: PRMetadata = {
  number: 42,
  title: "Add voice digest feature",
  body: "This PR introduces a new voice digest module.",
  author: "test-user",
  owner: "test-org",
  repo: "test-repo",
  url: "https://github.com/test-org/test-repo/pull/42",
  createdAt: "2024-01-15T10:00:00Z",
  filesChanged: ["src/digest/index.ts"],
  labels: ["feature"],
};

describe("DigestVoiceRunner", () => {
  describe("constructor", () => {
    it("creates runner with default config", () => {
      const runner = new DigestVoiceRunner();
      const config = runner.getConfig();

      expect(config.enableVoice).toBe(false);
      expect(config.enableDiscord).toBe(false);
    });

    it("creates runner with custom config", () => {
      const runner = new DigestVoiceRunner({
        enableVoice: true,
        enableDiscord: true,
      });
      const config = runner.getConfig();

      expect(config.enableVoice).toBe(true);
      expect(config.enableDiscord).toBe(true);
    });
  });

  describe("generateDigestOnly", () => {
    it("generates digest without voice or discord", () => {
      const runner = new DigestVoiceRunner();
      const digest = runner.generateDigestOnly(sampleMetadata);

      expect(digest.text).toBeDefined();
      expect(digest.text).toContain("test-user");
      expect(digest.metadata).toEqual(sampleMetadata);
    });

    it("throws for invalid metadata", () => {
      const runner = new DigestVoiceRunner();
      const invalidMetadata = { ...sampleMetadata, number: 0 };

      expect(() => runner.generateDigestOnly(invalidMetadata)).toThrow(
        "PR number"
      );
    });
  });

  describe("run", () => {
    it("returns digest without voice when voice disabled", async () => {
      const runner = new DigestVoiceRunner({ enableVoice: false });
      const result = await runner.run(sampleMetadata);

      expect(result.digest).toBeDefined();
      expect(result.audio).toBeUndefined();
    });

    it("returns digest without discord when discord disabled", async () => {
      const runner = new DigestVoiceRunner({ enableDiscord: false });
      const result = await runner.run(sampleMetadata);

      expect(result.digest).toBeDefined();
      expect(result.postedToDiscord).toBeFalsy();
    });

    it("validates metadata before processing", async () => {
      const runner = new DigestVoiceRunner();
      const invalidMetadata = { ...sampleMetadata, title: "" };

      await expect(runner.run(invalidMetadata)).rejects.toThrow("title");
    });
  });

  describe("updateConfig", () => {
    it("updates configuration values", () => {
      const runner = new DigestVoiceRunner();

      runner.updateConfig({ enableVoice: true });
      expect(runner.getConfig().enableVoice).toBe(true);

      runner.updateConfig({ enableDiscord: true });
      expect(runner.getConfig().enableDiscord).toBe(true);
    });
  });

  describe("getConfig", () => {
    it("returns config without sensitive data", () => {
      const runner = new DigestVoiceRunner({
        enableVoice: true,
        voice: {
          provider: "elevenlabs",
          apiKey: "secret-key",
          voiceId: "voice-123",
        },
        enableDiscord: true,
        discord: {
          webhookUrl: "https://discord.com/api/webhooks/secret",
          username: "Bot",
        },
      });

      const config = runner.getConfig();

      // Voice config should not include apiKey
      expect(config.voice).toBeDefined();
      expect((config.voice as any).apiKey).toBeUndefined();
      expect(config.voice?.voiceId).toBe("voice-123");

      // Discord config should not include webhookUrl
      expect(config.discord).toBeDefined();
      expect((config.discord as any).webhookUrl).toBeUndefined();
      expect(config.discord?.username).toBe("Bot");
    });
  });
});

describe("createRunnerFromEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("creates runner with voice disabled by default", () => {
    delete process.env.ENABLE_VOICE;
    const runner = createRunnerFromEnv();
    expect(runner.getConfig().enableVoice).toBe(false);
  });

  it("creates runner with discord disabled by default", () => {
    delete process.env.ENABLE_DISCORD;
    const runner = createRunnerFromEnv();
    expect(runner.getConfig().enableDiscord).toBe(false);
  });

  it("enables voice when ENABLE_VOICE=true", () => {
    process.env.ENABLE_VOICE = "true";
    process.env.ELEVENLABS_API_KEY = "test-key";
    const runner = createRunnerFromEnv();
    expect(runner.getConfig().enableVoice).toBe(true);
  });

  it("enables discord when ENABLE_DISCORD=true", () => {
    process.env.ENABLE_DISCORD = "true";
    process.env.DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/123";
    const runner = createRunnerFromEnv();
    expect(runner.getConfig().enableDiscord).toBe(true);
  });

  it("uses custom voice ID from env", () => {
    process.env.ENABLE_VOICE = "true";
    process.env.ELEVENLABS_API_KEY = "test-key";
    process.env.ELEVENLABS_VOICE_ID = "custom-voice";
    const runner = createRunnerFromEnv();
    expect(runner.getConfig().voice?.voiceId).toBe("custom-voice");
  });

  it("uses custom bot username from env", () => {
    process.env.ENABLE_DISCORD = "true";
    process.env.DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/123";
    process.env.DISCORD_BOT_USERNAME = "CustomBot";
    const runner = createRunnerFromEnv();
    expect(runner.getConfig().discord?.username).toBe("CustomBot");
  });
});
