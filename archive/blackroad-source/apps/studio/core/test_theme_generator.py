"""Tests for BlackRoad Studio theme generator."""
import json
from theme_generator import to_css, to_tailwind, to_json, COLORS, GRADIENTS, SPACING


def test_to_css_returns_root_block():
    css = to_css()
    assert css.startswith(":root {")
    assert css.strip().endswith("}")


def test_to_css_contains_brand_colors():
    css = to_css()
    assert "--br-hot-pink: #FF1D6C" in css
    assert "--br-amber: #F5A623" in css
    assert "--br-electric-blue: #2979FF" in css
    assert "--br-violet: #9C27B0" in css
    assert "--br-black: #000000" in css
    assert "--br-white: #FFFFFF" in css


def test_to_css_contains_spacing():
    css = to_css()
    for key in SPACING:
        assert f"--br-space-{key}:" in css


def test_to_css_contains_gradients():
    css = to_css()
    for key in GRADIENTS:
        assert f"--br-gradient-{key}:" in css


def test_to_tailwind_valid_js():
    result = to_tailwind()
    assert result.startswith("module.exports = ")
    # Strip the JS prefix and parse as JSON
    json_part = result[len("module.exports = "):]
    data = json.loads(json_part)
    assert "theme" in data
    assert "extend" in data["theme"]
    assert "colors" in data["theme"]["extend"]


def test_to_tailwind_contains_brand_colors():
    result = to_tailwind()
    assert "hot_pink" in result
    assert "FF1D6C" in result


def test_to_json_valid():
    result = to_json()
    data = json.loads(result)
    assert "color" in data
    assert "spacing" in data
    assert "gradient" in data


def test_to_json_colors_have_value_and_type():
    data = json.loads(to_json())
    for name, token in data["color"].items():
        assert "$value" in token, f"Color '{name}' missing $value"
        assert "$type" in token, f"Color '{name}' missing $type"
        assert token["$type"] == "color"


def test_to_json_spacing_matches_constants():
    data = json.loads(to_json())
    for key, val in SPACING.items():
        assert data["spacing"][key]["$value"] == val


def test_forbidden_colors_not_in_brand():
    forbidden = {"#FF9D00", "#FF6B00", "#FF0066", "#FF006B", "#D600AA", "#7700FF", "#0066FF"}
    for color in COLORS.values():
        assert color.upper() not in forbidden, f"Forbidden color {color} found in brand palette"


def test_golden_ratio_stops_in_brand_gradient():
    gradient = GRADIENTS["brand"]
    assert "38.2%" in gradient
    assert "61.8%" in gradient
