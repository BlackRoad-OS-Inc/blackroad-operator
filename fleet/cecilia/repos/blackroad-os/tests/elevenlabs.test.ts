import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  validateConfig,
  DEFAULT_VOICE_CONFIG,
} from "../src/digest/elevenlabs";
import type { VoiceConfig } from "../src/digest/types";

describe("ElevenLabs validateConfig", () => {
  const validConfig: VoiceConfig = {
    provider: "elevenlabs",
    apiKey: "test-api-key",
    voiceId: "test-voice-id",
    modelId: "eleven_multilingual_v2",
    stability: 0.5,
    similarityBoost: 0.75,
  };

  it("passes for valid configuration", () => {
    expect(() => validateConfig(validConfig)).not.toThrow();
    expect(validateConfig(validConfig)).toBe(true);
  });

  it("throws for missing API key", () => {
    const config = { ...validConfig, apiKey: "" };
    expect(() => validateConfig(config)).toThrow("API key");
  });

  it("throws for missing voice ID", () => {
    const config = { ...validConfig, voiceId: "" };
    expect(() => validateConfig(config)).toThrow("Voice ID");
  });

  it("throws for invalid stability value (too low)", () => {
    const config = { ...validConfig, stability: -0.1 };
    expect(() => validateConfig(config)).toThrow("Stability");
  });

  it("throws for invalid stability value (too high)", () => {
    const config = { ...validConfig, stability: 1.5 };
    expect(() => validateConfig(config)).toThrow("Stability");
  });

  it("throws for invalid similarity boost (too low)", () => {
    const config = { ...validConfig, similarityBoost: -0.1 };
    expect(() => validateConfig(config)).toThrow("Similarity boost");
  });

  it("throws for invalid similarity boost (too high)", () => {
    const config = { ...validConfig, similarityBoost: 1.5 };
    expect(() => validateConfig(config)).toThrow("Similarity boost");
  });

  it("allows undefined stability and similarity", () => {
    const config: VoiceConfig = {
      provider: "elevenlabs",
      apiKey: "test-api-key",
      voiceId: "test-voice-id",
    };
    expect(() => validateConfig(config)).not.toThrow();
  });
});

describe("DEFAULT_VOICE_CONFIG", () => {
  it("has expected default values", () => {
    expect(DEFAULT_VOICE_CONFIG.provider).toBe("elevenlabs");
    expect(DEFAULT_VOICE_CONFIG.voiceId).toBeDefined();
    expect(DEFAULT_VOICE_CONFIG.modelId).toBe("eleven_multilingual_v2");
    expect(DEFAULT_VOICE_CONFIG.stability).toBe(0.5);
    expect(DEFAULT_VOICE_CONFIG.similarityBoost).toBe(0.75);
  });
});

// Mock fetch for generateSpeech tests
describe("generateSpeech", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("throws for unsupported provider", async () => {
    const { generateSpeech } = await import("../src/digest/elevenlabs");
    const config: VoiceConfig = {
      provider: "playht" as any,
      apiKey: "test-key",
      voiceId: "test-voice",
    };

    await expect(generateSpeech("Hello", config)).rejects.toThrow(
      "Unsupported provider"
    );
  });

  it("throws for missing API key", async () => {
    const { generateSpeech } = await import("../src/digest/elevenlabs");
    const config: VoiceConfig = {
      provider: "elevenlabs",
      apiKey: "",
      voiceId: "test-voice",
    };

    await expect(generateSpeech("Hello", config)).rejects.toThrow(
      "API key is required"
    );
  });

  it("throws for missing voice ID", async () => {
    const { generateSpeech } = await import("../src/digest/elevenlabs");
    const config: VoiceConfig = {
      provider: "elevenlabs",
      apiKey: "test-key",
      voiceId: "",
    };

    await expect(generateSpeech("Hello", config)).rejects.toThrow(
      "Voice ID is required"
    );
  });

  it("calls fetch with correct parameters", async () => {
    const mockResponse = {
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { generateSpeech } = await import("../src/digest/elevenlabs");
    const config: VoiceConfig = {
      provider: "elevenlabs",
      apiKey: "test-api-key",
      voiceId: "test-voice-id",
      modelId: "eleven_multilingual_v2",
      stability: 0.5,
      similarityBoost: 0.75,
    };

    await generateSpeech("Hello world", config);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.elevenlabs.io/v1/text-to-speech/test-voice-id",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "xi-api-key": "test-api-key",
        }),
      })
    );
  });

  it("throws on API error", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { generateSpeech } = await import("../src/digest/elevenlabs");
    const config: VoiceConfig = {
      provider: "elevenlabs",
      apiKey: "invalid-key",
      voiceId: "test-voice-id",
    };

    await expect(generateSpeech("Hello", config)).rejects.toThrow(
      "ElevenLabs API error (401)"
    );
  });
});

describe("createAudioResult", () => {
  it("creates correct audio result object", async () => {
    const { createAudioResult } = await import("../src/digest/elevenlabs");
    const buffer = Buffer.from("test audio data");
    const url = "https://example.com/audio.mp3";

    const result = createAudioResult(buffer, url);

    expect(result.audioUrl).toBe(url);
    expect(result.format).toBe("mp3");
    expect(result.sizeBytes).toBe(buffer.length);
  });
});
