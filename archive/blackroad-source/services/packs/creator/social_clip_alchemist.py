from typing import Dict, List


def extract_clip_candidates(transcript: Dict, max_clips: int = 10) -> List[Dict]:
    sentences = transcript.get("sentences", [])
    clips: List[Dict] = []
    for index, sentence in enumerate(sentences[:max_clips]):
        clip = {
            "id": f"clip-{index+1}",
            "start": sentence.get("start", index * 10),
            "end": sentence.get("end", (index + 1) * 10),
            "summary": sentence.get("text", "").strip()[:120],
        }
        clips.append(clip)
    return clips


def generate_social_captions(clip: Dict, brand_voice: Dict) -> Dict:
    adjectives = brand_voice.get("adjectives", [])
    avoid = brand_voice.get("avoid", [])
    base_tone = ", ".join(adjectives) if adjectives else "steady"
    caution = f" Avoid: {', '.join(avoid)}" if avoid else ""

    headline = clip.get("summary", "").strip() or "Fresh drop"
    return {
        "twitter": f"{headline} — {base_tone} take.{caution}",
        "tiktok": f"Hook: {headline}. Keep it punchy.{caution}",
        "linkedin": f"{headline} | Practical takeaway | {base_tone} voice.{caution}",
    }
