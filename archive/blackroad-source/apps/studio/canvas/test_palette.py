"""Tests for palette_generator.py"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

import tempfile
from pathlib import Path
import pytest
from palette_generator import (
    hex_to_rgb, rgb_to_hex, hls_hex, rotate_hue, adjust_lightness,
    adjust_saturation, blend_colors, generate_tints_shades,
    generate_gradient_stops, relative_luminance, wcag_contrast_ratio,
    wcag_grade, a11y_check, generate, to_css_vars, to_tailwind, export_json,
    save_palette, load_palette, list_palettes, delete_palette,
    suggest_semantic, suggest_neutral,
)


# ── Colour math ───────────────────────────────────────────────────────────────
def test_hex_to_rgb_full():
    assert hex_to_rgb("#3b82f6") == (59, 130, 246)

def test_hex_to_rgb_short():
    assert hex_to_rgb("#fff") == (255, 255, 255)

def test_hex_to_rgb_no_hash():
    assert hex_to_rgb("000000") == (0, 0, 0)

def test_rgb_to_hex_roundtrip():
    assert rgb_to_hex(59, 130, 246) == "#3b82f6"

def test_rgb_to_hex_clamps():
    assert rgb_to_hex(-10, 300, 0) == "#00ff00"

def test_rotate_hue_180():
    original = "#ff0000"
    rotated  = rotate_hue(original, 180)
    r, g, b  = hex_to_rgb(rotated)
    from colorsys import rgb_to_hls
    h, _, _ = rgb_to_hls(r/255, g/255, b/255)
    assert abs(h * 360 - 180) < 2

def test_adjust_lightness_clamp():
    c = adjust_lightness("#ffffff", 0.5)
    assert hex_to_rgb(c) == (255, 255, 255)

def test_blend_midpoint():
    m = blend_colors("#000000", "#ffffff", 0.5)
    r, g, b = hex_to_rgb(m)
    assert 120 <= r <= 135  # ~128

def test_blend_extremes():
    assert blend_colors("#ff0000", "#0000ff", 0.0) == "#ff0000"
    assert blend_colors("#ff0000", "#0000ff", 1.0) == "#0000ff"

def test_tints_shades_length():
    scale = generate_tints_shades("#3b82f6", 9)
    assert len(scale) == 9

def test_gradient_stops():
    stops = generate_gradient_stops("#000000", "#ffffff", 3)
    assert stops[0] == "#000000"
    assert stops[-1] == "#ffffff"


# ── WCAG ─────────────────────────────────────────────────────────────────────
def test_black_white_contrast():
    ratio = wcag_contrast_ratio("#000000", "#ffffff")
    assert ratio == 21.0

def test_same_colour_contrast():
    ratio = wcag_contrast_ratio("#3b82f6", "#3b82f6")
    assert ratio == 1.0

def test_wcag_grades():
    assert wcag_grade(21.0) == "AAA"
    assert wcag_grade(4.5)  == "AA"
    assert wcag_grade(3.0)  == "AA-Large"
    assert wcag_grade(2.5)  == "Fail"

def test_relative_luminance_white():
    assert abs(relative_luminance("#ffffff") - 1.0) < 0.001

def test_relative_luminance_black():
    assert abs(relative_luminance("#000000")) < 0.001


# ── Palette generation ────────────────────────────────────────────────────────
@pytest.mark.parametrize("harmony", [
    "complementary","triadic","analogous",
    "monochromatic","split-complementary","tetradic",
])
def test_generate_all_harmonies(harmony):
    p = generate("#3b82f6", harmony, "Test")
    assert p.harmony == harmony
    assert len(p.colors) >= 2
    for sw in p.colors:
        assert sw.hex.startswith("#")
        assert len(sw.hex) == 7

def test_generate_invalid_hex():
    with pytest.raises(ValueError):
        generate("zzzzzz", "triadic")

def test_generate_short_hex():
    p = generate("#f00", "complementary")
    assert len(p.colors) >= 2

def test_generate_invalid_harmony():
    with pytest.raises(ValueError):
        generate("#3b82f6", "rainbow")

def test_generate_unique_ids():
    p1 = generate("#3b82f6", "triadic")
    p2 = generate("#3b82f6", "triadic")
    assert p1.id != p2.id


# ── Exports ───────────────────────────────────────────────────────────────────
def test_to_css_vars_contains_root():
    p = generate("#3b82f6", "complementary", "Ocean")
    css = to_css_vars(p)
    assert ":root {" in css
    assert "--palette-" in css

def test_to_tailwind_valid_js():
    p = generate("#e11d48", "triadic", "Red")
    tw = to_tailwind(p)
    assert "module.exports" in tw
    assert "colors" in tw

def test_export_json_valid():
    p = generate("#3b82f6", "analogous", "Blue")
    j = export_json(p)
    data = __import__("json").loads(j)
    assert "scale" in data
    assert "contrast_matrix" in data
    assert "semantic" in data


# ── a11y ─────────────────────────────────────────────────────────────────────
def test_a11y_check_structure():
    p = generate("#3b82f6", "complementary")
    result = a11y_check(p)
    assert "checks" in result
    assert "summary" in result
    assert result["summary"]["total"] >= 0


# ── Semantic / neutral ────────────────────────────────────────────────────────
def test_suggest_semantic_keys():
    p = generate("#3b82f6", "triadic")
    sem = suggest_semantic(p)
    assert set(sem.keys()) == {"success", "warning", "error", "info"}

def test_suggest_neutral_hex():
    p = generate("#3b82f6", "triadic")
    n = suggest_neutral(p)
    assert n.startswith("#") and len(n) == 7


# ── Persistence ───────────────────────────────────────────────────────────────
@pytest.fixture
def tmp_db(tmp_path):
    return tmp_path / "test_palettes.db"

def test_save_and_load(tmp_db):
    p = generate("#3b82f6", "triadic", "Persisted")
    save_palette(p, tmp_db)
    loaded = load_palette(p.id, tmp_db)
    assert loaded is not None
    assert loaded.name == "Persisted"
    assert loaded.harmony == "triadic"
    assert len(loaded.colors) == len(p.colors)

def test_load_nonexistent(tmp_db):
    assert load_palette("does-not-exist", tmp_db) is None

def test_list_palettes(tmp_db):
    for harmony in ("complementary", "triadic"):
        save_palette(generate("#ff0000", harmony), tmp_db)
    rows = list_palettes(tmp_db)
    assert len(rows) == 2

def test_delete_palette(tmp_db):
    p = generate("#00ff00", "analogous")
    save_palette(p, tmp_db)
    assert delete_palette(p.id, tmp_db)
    assert load_palette(p.id, tmp_db) is None

def test_delete_missing(tmp_db):
    assert not delete_palette("ghost-id", tmp_db)
