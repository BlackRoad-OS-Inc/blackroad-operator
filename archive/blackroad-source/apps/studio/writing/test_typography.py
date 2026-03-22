"""Tests for typography_analyzer.py"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

import pytest
from typography_analyzer import (
    _count_syllables, flesch_reading_ease, analyze_readability,
    scale_generator, line_height_recommendation, check_measure,
    WCAG_contrast_checker, relative_luminance,
    Font, save_font, load_font, list_fonts, delete_font,
    suggest_pairing, generate_font_stack, generate_css_imports,
)
import uuid, datetime


# ── Syllable counting ─────────────────────────────────────────────────────────
def test_syllables_simple():
    assert _count_syllables("cat")  == 1
    assert _count_syllables("hello") >= 2

def test_syllables_empty():
    assert _count_syllables("") == 0

def test_syllables_punctuation():
    assert _count_syllables("word.") >= 1


# ── Flesch reading ease ───────────────────────────────────────────────────────
def test_flesch_simple_text():
    text = "The cat sat. The dog ran. The bird flew."
    result = flesch_reading_ease(text)
    assert result["score"] >= 60
    assert result["word_count"] > 0
    assert result["sentence_count"] > 0

def test_flesch_empty():
    result = flesch_reading_ease("")
    assert result["score"] == 0
    assert result["grade"] == "N/A"

def test_flesch_complex_text():
    text = ("The epistemological implications of postmodernist discourse "
            "necessitate a comprehensive reconceptualization of hermeneutical frameworks.")
    result = flesch_reading_ease(text)
    assert result["score"] < 60

def test_flesch_fields_present():
    result = flesch_reading_ease("Hello world. How are you?")
    for key in ["score","grade","level","sentence_count","word_count","syllable_count"]:
        assert key in result


# ── Readability analysis ──────────────────────────────────────────────────────
def test_analyze_readability_structure():
    result = analyze_readability("Simple text.", 16.0, 1.5, 60)
    assert "readability" in result
    assert "recommendations" in result
    assert "wcag_1_4_12" in result

def test_analyze_readability_line_height_flag():
    good = analyze_readability("Text", line_height=1.6)
    bad  = analyze_readability("Text", line_height=1.2)
    assert good["line_height_ok"] is True
    assert bad["line_height_ok"]  is False


# ── Measure check ─────────────────────────────────────────────────────────────
def test_measure_optimal():
    result = check_measure(60)
    assert result["status"] == "optimal"

def test_measure_too_short():
    result = check_measure(30)
    assert result["status"] == "too-short"

def test_measure_too_long():
    result = check_measure(100)
    assert result["status"] == "too-long"


# ── Line height recommendation ────────────────────────────────────────────────
def test_lh_body_default():
    result = line_height_recommendation(16.0, "body")
    assert result["recommended_ratio"] >= 1.4

def test_lh_heading():
    result = line_height_recommendation(32.0, "heading")
    assert result["recommended_ratio"] < 1.5

def test_lh_wcag_pass():
    result = line_height_recommendation(16.0, "body")
    assert result["wcag_pass"] is True


# ── Type scale ────────────────────────────────────────────────────────────────
def test_scale_default():
    ts = scale_generator(1.0, 1.618)
    assert ts.base_size == 1.0
    assert ts.ratio    == 1.618
    assert len(ts.steps) >= 5

def test_scale_golden_ratio():
    ts = scale_generator(1.0, 1.618, 2, 6)
    # base step (index 2) should be 1.0
    assert abs(ts.steps[2] - 1.0) < 0.01

def test_scale_css_output():
    ts = scale_generator()
    css = ts.to_css_vars()
    assert ":root {" in css
    assert "--font-size-" in css

def test_scale_tailwind_output():
    ts = scale_generator()
    tw = ts.to_tailwind()
    assert "fontSize:" in tw
    assert "lineHeight" in tw

def test_scale_as_dict():
    ts = scale_generator(1.0, 1.333, 2, 4)
    d  = ts.as_dict()
    assert "steps" in d
    assert d["ratio"] == 1.333


# ── WCAG contrast ─────────────────────────────────────────────────────────────
def test_wcag_black_white():
    result = WCAG_contrast_checker("#000000", "#ffffff")
    assert result["ratio"] == 21.0
    assert result["grade"] == "AAA"
    assert result["aa_normal"] is True

def test_wcag_same_colour():
    result = WCAG_contrast_checker("#3b82f6", "#3b82f6")
    assert result["ratio"] == 1.0
    assert result["grade"] == "Fail"

def test_wcag_medium_contrast():
    result = WCAG_contrast_checker("#6b7280", "#ffffff")
    assert 3.0 <= result["ratio"] <= 10.0

def test_relative_luminance_white():
    assert abs(relative_luminance("#ffffff") - 1.0) < 0.001

def test_relative_luminance_black():
    assert abs(relative_luminance("#000000")) < 0.001

def test_relative_luminance_shorthand():
    # #fff should expand to #ffffff
    assert abs(relative_luminance("#fff") - 1.0) < 0.001

def test_relative_luminance_invalid_raises():
    with pytest.raises(ValueError):
        relative_luminance("#xyz123")

def test_relative_luminance_nonhex_chars():
    with pytest.raises(ValueError):
        relative_luminance("#gggggg")

def test_relative_luminance_wrong_length():
    with pytest.raises(ValueError):
        relative_luminance("#12345")


# ── Font category validation ──────────────────────────────────────────────────
def test_font_invalid_category_raises():
    with pytest.raises(ValueError):
        make_font(category="invalid-category")


# ── URL encoding in google_url ────────────────────────────────────────────────
def test_google_url_text_encoded():
    f = make_font()
    url = f.google_url(text="hello world & more")
    assert " " not in url
    assert "&text=" in url
    assert "hello%20world" in url

# ── Font dataclass ────────────────────────────────────────────────────────────
def make_font(**kw) -> Font:
    defaults = dict(
        id=str(uuid.uuid4()), name="Inter", category="sans-serif",
        weights=[400, 700], google_font_id="Inter",
        tags=["modern"], created_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )
    defaults.update(kw)
    return Font(**defaults)

def test_font_google_url():
    f = make_font(name="Inter", google_font_id="Inter")
    url = f.google_url()
    assert "fonts.googleapis.com" in url
    assert "Inter" in url

def test_font_css_import():
    f = make_font()
    imp = f.css_import()
    assert "@import url" in imp

def test_font_css_rule():
    f = make_font(name="Inter", category="sans-serif")
    rule = f.css_rule("p")
    assert "Inter" in rule
    assert "sans-serif" in rule

def test_font_stack():
    f = make_font(name="Inter", category="sans-serif")
    stack = generate_font_stack(f)
    assert "Inter" in stack
    assert "sans-serif" in stack


# ── Font persistence ──────────────────────────────────────────────────────────
@pytest.fixture
def tmp_db(tmp_path):
    return tmp_path / "test_typo.db"

def test_save_load_font(tmp_db):
    f = make_font(name="Roboto", category="sans-serif")
    save_font(f, tmp_db)
    loaded = load_font(f.id, tmp_db)
    assert loaded is not None
    assert loaded.name == "Roboto"

def test_load_missing(tmp_db):
    assert load_font("no-such-id", tmp_db) is None

def test_list_fonts(tmp_db):
    for name, cat in [("Playfair", "serif"), ("JetBrains Mono", "monospace")]:
        save_font(make_font(name=name, category=cat), tmp_db)
    rows = list_fonts(tmp_db)
    assert len(rows) == 2

def test_delete_font(tmp_db):
    f = make_font()
    save_font(f, tmp_db)
    assert delete_font(f.id, tmp_db)
    assert load_font(f.id, tmp_db) is None

def test_delete_missing(tmp_db):
    assert not delete_font("ghost", tmp_db)


# ── Pairing suggestions ───────────────────────────────────────────────────────
def test_pairing_sans_serif(tmp_db):
    f = make_font(category="sans-serif")
    result = suggest_pairing(f, tmp_db)
    assert "pairings" in result
    assert len(result["pairings"]) >= 1

def test_pairing_serif(tmp_db):
    f = make_font(name="Merriweather", category="serif")
    result = suggest_pairing(f, tmp_db)
    assert result["pairings"][0]["category"] in ("sans-serif", "monospace")

def test_css_import_multiple(tmp_db):
    f1 = make_font(name="Inter",    google_font_id="Inter",    category="sans-serif")
    f2 = make_font(name="Lora",     google_font_id="Lora",     category="serif")
    for f in (f1, f2): save_font(f, tmp_db)
    fonts = [load_font(f1.id, tmp_db), load_font(f2.id, tmp_db)]
    imp = generate_css_imports(fonts)
    assert "@import" in imp
    assert "Inter" in imp
    assert "Lora" in imp
