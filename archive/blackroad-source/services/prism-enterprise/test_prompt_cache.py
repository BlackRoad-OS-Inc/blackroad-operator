from qlm_lab.cache.prompt_cache import put, get


def test_cache_roundtrip(tmp_path, monkeypatch):
    import qlm_lab.cache.prompt_cache as pc

    pc.CACHE_PATH = tmp_path / "prompt_cache.jsonl"
    prompt = "show chsh violation"
    put(prompt, "<tool name='quantum_np.chsh_value_phi_plus' as='S'/>", artifacts=["artifacts/a.png"], source="rule")
    hits = get("show chsh violation")
    assert hits
    assert "chsh" in hits[0].plan_text.lower()
