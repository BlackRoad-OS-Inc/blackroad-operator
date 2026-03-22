export interface ScriptOutline {
  title: string;
  keyPoints: string[];
  audience: string;
}

export interface BrandVoiceProfile {
  id: string;
  adjectives: string[];
  avoid?: string[];
  emoji_usage?: string;
}

export interface ScriptDraft {
  title: string;
  segments: string[];
  durationMinutes: number;
  toneNotes: string;
}

export function draftScript(
  outline: ScriptOutline,
  brandVoice: BrandVoiceProfile
): ScriptDraft {
  const tone = brandVoice.adjectives.join(", ");
  const segments = outline.keyPoints.map((point, index) => `Segment ${index + 1}: ${point}`);
  return {
    title: outline.title,
    segments,
    durationMinutes: Math.max(segments.length * 2, 5),
    toneNotes: `Voice: ${tone}. Avoid: ${(brandVoice.avoid ?? []).join(", ")}`,
  };
}

export function tightenForRuntime(
  draft: ScriptDraft,
  targetMinutes: number
): ScriptDraft {
  const maxSegments = Math.max(1, Math.floor(targetMinutes / 2));
  const trimmedSegments = draft.segments.slice(0, maxSegments);
  return {
    ...draft,
    segments: trimmedSegments,
    durationMinutes: targetMinutes,
  };
}
