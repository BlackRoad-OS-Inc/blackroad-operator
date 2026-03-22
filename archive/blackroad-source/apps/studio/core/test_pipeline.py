"""Tests for BlackRoad Studio asset pipeline."""
import json
import tempfile
from pathlib import Path
from pipeline import AssetSpec, render_svg, export_tokens, BRAND


def test_render_svg_dimensions():
    spec = AssetSpec("test", 100, 50)
    svg = render_svg(spec)
    assert 'width="100"' in svg
    assert 'height="50"' in svg
    assert 'viewBox="0 0 100 50"' in svg


def test_render_svg_background_color():
    spec = AssetSpec("test", 100, 50, bg="#123456")
    svg = render_svg(spec)
    assert 'fill="#123456"' in svg


def test_render_svg_text_element():
    spec = AssetSpec("test", 200, 60, text="BLACKROAD", color="#F5A623")
    svg = render_svg(spec)
    assert "BLACKROAD" in svg
    assert '#F5A623' in svg


def test_render_svg_no_text():
    spec = AssetSpec("test", 32, 32)
    svg = render_svg(spec)
    assert "<text" not in svg


def test_render_svg_brand_gradient():
    spec = AssetSpec("test", 100, 50)
    svg = render_svg(spec)
    assert 'linearGradient' in svg
    assert '#F5A623' in svg
    assert '#FF1D6C' in svg
    assert '#9C27B0' in svg
    assert '#2979FF' in svg


def test_export_tokens_creates_files():
    with tempfile.TemporaryDirectory() as tmpdir:
        output = Path(tmpdir) / "tokens"
        export_tokens(output)
        assert (output / "tokens.css").exists()
        assert (output / "tokens.json").exists()


def test_export_tokens_css_contains_brand_colors():
    with tempfile.TemporaryDirectory() as tmpdir:
        output = Path(tmpdir) / "tokens"
        export_tokens(output)
        css = (output / "tokens.css").read_text()
        assert "--amber:" in css
        assert "--hot-pink:" in css
        assert "--electric-blue:" in css
        assert "--violet:" in css
        assert "--gradient-brand:" in css
        assert BRAND["gradient"] in css


def test_export_tokens_json_valid():
    with tempfile.TemporaryDirectory() as tmpdir:
        output = Path(tmpdir) / "tokens"
        export_tokens(output)
        data = json.loads((output / "tokens.json").read_text())
        assert data["black"] == "#000000"
        assert data["white"] == "#FFFFFF"
        assert data["hot-pink"] == "#FF1D6C"


def test_brand_palette_contains_required_colors():
    assert BRAND["amber"] == "#F5A623"
    assert BRAND["hot-pink"] == "#FF1D6C"
    assert BRAND["electric-blue"] == "#2979FF"
    assert BRAND["violet"] == "#9C27B0"
    assert BRAND["black"] == "#000000"
    assert BRAND["white"] == "#FFFFFF"


def test_brand_gradient_uses_golden_ratio_stops():
    gradient = BRAND["gradient"]
    assert "38.2%" in gradient
    assert "61.8%" in gradient
