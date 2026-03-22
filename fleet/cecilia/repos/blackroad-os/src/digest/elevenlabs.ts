/**
 * ElevenLabs Text-to-Speech Client
 *
 * Integrates with ElevenLabs API for high-quality voice synthesis.
 * Documentation: https://docs.elevenlabs.io/api-reference
 */

import type { VoiceConfig, AudioResult } from "./types";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

export interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface ElevenLabsRequest {
  text: string;
  model_id: string;
  voice_settings: ElevenLabsVoiceSettings;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  labels?: Record<string, string>;
}

/**
 * Generate speech from text using ElevenLabs API
 *
 * @param text - The text to convert to speech
 * @param config - Voice configuration with API key and voice settings
 * @returns Buffer containing the audio data in MP3 format
 */
export async function generateSpeech(
  text: string,
  config: VoiceConfig
): Promise<Buffer> {
  if (config.provider !== "elevenlabs") {
    throw new Error(`Unsupported provider: ${config.provider}`);
  }

  if (!config.apiKey) {
    throw new Error("ElevenLabs API key is required");
  }

  if (!config.voiceId) {
    throw new Error("Voice ID is required");
  }

  const endpoint = `${ELEVENLABS_API_BASE}/text-to-speech/${config.voiceId}`;

  const requestBody: ElevenLabsRequest = {
    text,
    model_id: config.modelId || "eleven_multilingual_v2",
    voice_settings: {
      stability: config.stability ?? 0.5,
      similarity_boost: config.similarityBoost ?? 0.75,
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": config.apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ElevenLabs API error (${response.status}): ${errorText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * List available voices from ElevenLabs
 *
 * @param apiKey - ElevenLabs API key
 * @returns Array of available voices
 */
export async function listVoices(apiKey: string): Promise<ElevenLabsVoice[]> {
  const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ElevenLabs API error (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as { voices: ElevenLabsVoice[] };
  return data.voices;
}

/**
 * Create an AudioResult from generated speech buffer
 *
 * @param audioBuffer - The audio buffer from generateSpeech
 * @param audioUrl - URL where the audio will be accessible
 * @returns AudioResult object
 */
export function createAudioResult(
  audioBuffer: Buffer,
  audioUrl: string
): AudioResult {
  return {
    audioUrl,
    format: "mp3",
    sizeBytes: audioBuffer.length,
  };
}

/**
 * Validates ElevenLabs configuration
 *
 * @param config - Voice configuration to validate
 * @returns true if valid, throws error otherwise
 */
export function validateConfig(config: VoiceConfig): boolean {
  if (!config.apiKey) {
    throw new Error("ElevenLabs API key is required (ELEVENLABS_API_KEY)");
  }

  if (!config.voiceId) {
    throw new Error("Voice ID is required (ELEVENLABS_VOICE_ID)");
  }

  if (config.stability !== undefined && (config.stability < 0 || config.stability > 1)) {
    throw new Error("Stability must be between 0 and 1");
  }

  if (config.similarityBoost !== undefined && (config.similarityBoost < 0 || config.similarityBoost > 1)) {
    throw new Error("Similarity boost must be between 0 and 1");
  }

  return true;
}

/**
 * Default voice configuration for ElevenLabs
 * Uses the Rachel voice which is good for narration
 */
export const DEFAULT_VOICE_CONFIG: Partial<VoiceConfig> = {
  provider: "elevenlabs",
  voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - good for narration
  modelId: "eleven_multilingual_v2",
  stability: 0.5,
  similarityBoost: 0.75,
};
