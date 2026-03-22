import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  validateConfig,
  createDigestEmbed,
  createDigestPayload,
  DISCORD_COLORS,
} from "../src/digest/discord-webhook";
import type {
  DiscordWebhookConfig,
  DigestContent,
  AudioResult,
} from "../src/digest/types";

const sampleDigest: DigestContent = {
  text: "A new PR has been opened by test-user",
  metadata: {
    number: 42,
    title: "Test PR Title",
    body: "Test body",
    author: "test-user",
    owner: "test-org",
    repo: "test-repo",
    url: "https://github.com/test-org/test-repo/pull/42",
    createdAt: "2024-01-15T10:00:00Z",
    labels: ["feature", "voice"],
  },
  generatedAt: "2024-01-15T10:05:00Z",
};

const sampleAudio: AudioResult = {
  audioUrl: "https://example.com/audio.mp3",
  format: "mp3",
  sizeBytes: 1024,
};

describe("validateConfig", () => {
  it("passes for valid webhook URL", () => {
    const config: DiscordWebhookConfig = {
      webhookUrl: "https://discord.com/api/webhooks/123/abc",
    };
    expect(() => validateConfig(config)).not.toThrow();
    expect(validateConfig(config)).toBe(true);
  });

  it("accepts discordapp.com URLs", () => {
    const config: DiscordWebhookConfig = {
      webhookUrl: "https://discordapp.com/api/webhooks/123/abc",
    };
    expect(() => validateConfig(config)).not.toThrow();
  });

  it("throws for missing webhook URL", () => {
    const config: DiscordWebhookConfig = {
      webhookUrl: "",
    };
    expect(() => validateConfig(config)).toThrow("webhook URL is required");
  });

  it("throws for invalid URL format", () => {
    const config: DiscordWebhookConfig = {
      webhookUrl: "not-a-url",
    };
    expect(() => validateConfig(config)).toThrow("Invalid Discord webhook URL");
  });

  it("throws for non-Discord URL", () => {
    const config: DiscordWebhookConfig = {
      webhookUrl: "https://example.com/webhook",
    };
    expect(() => validateConfig(config)).toThrow("Invalid Discord webhook URL");
  });
});

describe("DISCORD_COLORS", () => {
  it("has expected color values", () => {
    expect(DISCORD_COLORS.GREEN).toBe(0x2ecc71);
    expect(DISCORD_COLORS.BLUE).toBe(0x3498db);
    expect(DISCORD_COLORS.PURPLE).toBe(0x9b59b6);
    expect(DISCORD_COLORS.ORANGE).toBe(0xe67e22);
    expect(DISCORD_COLORS.RED).toBe(0xe74c3c);
    expect(DISCORD_COLORS.GOLD).toBe(0xf1c40f);
  });
});

describe("createDigestEmbed", () => {
  it("creates embed with correct title", () => {
    const embed = createDigestEmbed(sampleDigest);
    expect(embed.title).toBe("📋 Test PR Title");
  });

  it("creates embed with description from digest text", () => {
    const embed = createDigestEmbed(sampleDigest);
    expect(embed.description).toBe(sampleDigest.text);
  });

  it("creates embed with correct URL", () => {
    const embed = createDigestEmbed(sampleDigest);
    expect(embed.url).toBe("https://github.com/test-org/test-repo/pull/42");
  });

  it("creates embed with purple color", () => {
    const embed = createDigestEmbed(sampleDigest);
    expect(embed.color).toBe(DISCORD_COLORS.PURPLE);
  });

  it("includes author field", () => {
    const embed = createDigestEmbed(sampleDigest);
    const authorField = embed.fields?.find((f) => f.name === "Author");
    expect(authorField).toBeDefined();
    expect(authorField?.value).toContain("test-user");
  });

  it("includes repository field", () => {
    const embed = createDigestEmbed(sampleDigest);
    const repoField = embed.fields?.find((f) => f.name === "Repository");
    expect(repoField).toBeDefined();
    expect(repoField?.value).toContain("test-org/test-repo");
  });

  it("includes PR number field", () => {
    const embed = createDigestEmbed(sampleDigest);
    const prField = embed.fields?.find((f) => f.name === "PR Number");
    expect(prField).toBeDefined();
    expect(prField?.value).toContain("#42");
  });

  it("includes labels when present", () => {
    const embed = createDigestEmbed(sampleDigest);
    const labelsField = embed.fields?.find((f) => f.name === "Labels");
    expect(labelsField).toBeDefined();
    expect(labelsField?.value).toContain("feature");
    expect(labelsField?.value).toContain("voice");
  });

  it("excludes labels field when none present", () => {
    const digestNoLabels: DigestContent = {
      ...sampleDigest,
      metadata: { ...sampleDigest.metadata, labels: undefined },
    };
    const embed = createDigestEmbed(digestNoLabels);
    const labelsField = embed.fields?.find((f) => f.name === "Labels");
    expect(labelsField).toBeUndefined();
  });

  it("includes audio link when audio provided", () => {
    const embed = createDigestEmbed(sampleDigest, sampleAudio);
    const audioField = embed.fields?.find((f) =>
      f.name.includes("Audio Digest")
    );
    expect(audioField).toBeDefined();
    expect(audioField?.value).toContain(sampleAudio.audioUrl);
  });

  it("includes footer text", () => {
    const embed = createDigestEmbed(sampleDigest);
    expect(embed.footer?.text).toBe("Lucidia Voice Digest");
  });

  it("includes timestamp", () => {
    const embed = createDigestEmbed(sampleDigest);
    expect(embed.timestamp).toBe(sampleDigest.generatedAt);
  });

  it("includes author avatar thumbnail", () => {
    const embed = createDigestEmbed(sampleDigest);
    expect(embed.thumbnail?.url).toBe("https://github.com/test-user.png");
  });
});

describe("createDigestPayload", () => {
  it("creates payload with embeds", () => {
    const payload = createDigestPayload(sampleDigest);
    expect(payload.embeds).toBeDefined();
    expect(payload.embeds?.length).toBe(1);
  });

  it("includes PR digest message without audio", () => {
    const payload = createDigestPayload(sampleDigest);
    expect(payload.content).toContain("PR Digest");
  });

  it("includes voice digest message with audio", () => {
    const payload = createDigestPayload(sampleDigest, sampleAudio);
    expect(payload.content).toContain("Voice Digest");
  });
});

describe("postToWebhook", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("throws for missing webhook URL", async () => {
    const { postToWebhook } = await import("../src/digest/discord-webhook");
    const config: DiscordWebhookConfig = { webhookUrl: "" };
    const payload = createDigestPayload(sampleDigest);

    await expect(postToWebhook(config, payload)).rejects.toThrow(
      "webhook URL is required"
    );
  });

  it("calls fetch with correct URL and method", async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ id: "12345" }),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { postToWebhook } = await import("../src/digest/discord-webhook");
    const config: DiscordWebhookConfig = {
      webhookUrl: "https://discord.com/api/webhooks/123/abc",
    };
    const payload = createDigestPayload(sampleDigest);

    await postToWebhook(config, payload);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://discord.com/api/webhooks/123/abc?wait=true",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("returns success and message ID", async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ id: "msg-12345" }),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { postToWebhook } = await import("../src/digest/discord-webhook");
    const config: DiscordWebhookConfig = {
      webhookUrl: "https://discord.com/api/webhooks/123/abc",
    };
    const payload = createDigestPayload(sampleDigest);

    const result = await postToWebhook(config, payload);

    expect(result.success).toBe(true);
    expect(result.id).toBe("msg-12345");
  });

  it("uses config username when not in payload", async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ id: "12345" }),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { postToWebhook } = await import("../src/digest/discord-webhook");
    const config: DiscordWebhookConfig = {
      webhookUrl: "https://discord.com/api/webhooks/123/abc",
      username: "Custom Bot Name",
    };
    const payload = { content: "test" };

    await postToWebhook(config, payload);

    const [, options] = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.username).toBe("Custom Bot Name");
  });

  it("throws on API error", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      text: () => Promise.resolve("Bad Request"),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { postToWebhook } = await import("../src/digest/discord-webhook");
    const config: DiscordWebhookConfig = {
      webhookUrl: "https://discord.com/api/webhooks/123/abc",
    };
    const payload = createDigestPayload(sampleDigest);

    await expect(postToWebhook(config, payload)).rejects.toThrow(
      "Discord webhook error (400)"
    );
  });
});
