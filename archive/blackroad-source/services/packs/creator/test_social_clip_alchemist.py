from agents.social_clip_alchemist import extract_clip_candidates, generate_social_captions


def test_extract_clip_candidates_limits_maximum():
    transcript = {
        "sentences": [
            {"start": 0, "end": 5, "text": "Welcome to the lab."},
            {"start": 5, "end": 12, "text": "Today we explore orchestration."},
            {"start": 12, "end": 18, "text": "Agents collaborate on content."},
        ]
    }
    clips = extract_clip_candidates(transcript, max_clips=2)
    assert len(clips) <= 2
    for clip in clips:
        assert "start" in clip and "end" in clip
        assert "summary" in clip and len(clip["summary"]) > 0


def test_generate_social_captions_returns_variants():
    clip = {"summary": "Agents orchestrate content drops"}
    brand_voice = {"adjectives": ["calm", "clever"], "avoid": ["hype"]}
    captions = generate_social_captions(clip, brand_voice)
    assert set(captions.keys()) == {"twitter", "tiktok", "linkedin"}
    assert "calm, clever" in captions["twitter"]
    assert "Hook" in captions["tiktok"]
    assert "Practical takeaway" in captions["linkedin"]
