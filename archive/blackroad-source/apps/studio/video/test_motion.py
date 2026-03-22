"""Tests for motion_library.py"""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
import pytest
from motion_library import (
    linear, ease_in_quad, ease_out_quad, ease_in_out_quad,
    ease_in_cubic, ease_out_cubic, ease_in_out_cubic,
    ease_in_expo, ease_out_expo,
    ease_in_sine, ease_out_sine,
    ease_in_back, ease_out_back,
    ease_out_bounce, ease_in_bounce, ease_in_out_bounce,
    ease_out_elastic, ease_in_elastic, ease_in_out_elastic,
    ease_in_quart, ease_out_quart, ease_in_out_quart,
    spring, cubic_bezier, EASE, EASE_IN, EASE_OUT, EASE_IN_OUT,
    EASINGS, Keyframe, Timeline, PRESETS,
    serialize_to_css, serialize_to_js, serialize_to_framer_motion,
    sample_easing, easing_to_svg_path, get_preset, list_presets,
    _js_ident,
    _easing_to_css,
)


# ── Easing boundary conditions ────────────────────────────────────────────────
ALL_STANDARD_EASINGS = [
    linear, ease_in_quad, ease_out_quad, ease_in_out_quad,
    ease_in_cubic, ease_out_cubic, ease_in_out_cubic,
    ease_in_sine, ease_out_sine,
    ease_out_bounce, ease_in_bounce,
]

@pytest.mark.parametrize("fn", ALL_STANDARD_EASINGS)
def test_easing_at_zero(fn):
    assert abs(fn(0.0)) < 0.01

@pytest.mark.parametrize("fn", ALL_STANDARD_EASINGS)
def test_easing_at_one(fn):
    assert abs(fn(1.0) - 1.0) < 0.01

@pytest.mark.parametrize("fn", ALL_STANDARD_EASINGS)
def test_easing_midpoint_between_bounds(fn):
    v = fn(0.5)
    assert 0.0 <= v <= 1.0

def test_linear_midpoint():
    assert linear(0.5) == 0.5

def test_ease_in_quad_concave():
    # Should be slower than linear at start
    assert ease_in_quad(0.25) < 0.25

def test_ease_out_quad_convex():
    # Should be faster than linear at start
    assert ease_out_quad(0.25) > 0.25

def test_ease_in_out_quad_symmetry():
    a = ease_in_out_quad(0.25)
    b = ease_in_out_quad(0.75)
    assert abs(a + b - 1.0) < 0.001


# ── Back / elastic – allow overshoot ─────────────────────────────────────────
def test_ease_out_back_overshoots():
    peak = max(ease_out_back(t) for t in [i/100 for i in range(101)])
    assert peak > 1.0

def test_ease_in_back_undershoots():
    trough = min(ease_in_back(t) for t in [i/100 for i in range(101)])
    assert trough < 0.0

def test_ease_out_elastic_at_boundaries():
    assert abs(ease_out_elastic(0.0)) < 0.01
    assert abs(ease_out_elastic(1.0) - 1.0) < 0.01


# ── Spring ────────────────────────────────────────────────────────────────────
def test_spring_at_zero():
    assert abs(spring(0.0)) < 0.01

def test_spring_reaches_one():
    # By t=10 a typical spring should be near 1
    val = spring(10.0, mass=1, stiffness=100, damping=10)
    assert abs(val - 1.0) < 0.1

def test_spring_overdamped():
    val = spring(1.0, mass=1, stiffness=100, damping=100)
    assert 0.0 <= val <= 1.5


# ── Cubic bezier ──────────────────────────────────────────────────────────────
def test_cubic_bezier_boundaries():
    fn = cubic_bezier(0.25, 0.1, 0.25, 1.0)
    assert abs(fn(0)) < 0.01
    assert abs(fn(1) - 1.0) < 0.01

def test_cubic_bezier_css_ease():
    fn = EASE
    # CSS ease is roughly ease-in-out — midpoint ≠ 0.5 exactly
    v = fn(0.5)
    assert 0.4 < v < 0.9


# ── EASINGS registry ──────────────────────────────────────────────────────────
def test_easings_registry_has_keys():
    for name in ["linear","ease","ease-in","ease-out","ease-in-out","spring"]:
        assert name in EASINGS

def test_easings_all_callable():
    for name, fn in EASINGS.items():
        assert callable(fn), f"{name} not callable"


# ── Keyframe / Timeline ───────────────────────────────────────────────────────
def test_timeline_add_keyframe_sorted():
    tl = Timeline(id="t1", name="test", duration=300)
    tl.add_keyframe(1.0, {"opacity": 1})
    tl.add_keyframe(0.0, {"opacity": 0})
    assert tl.keyframes[0].offset == 0.0
    assert tl.keyframes[1].offset == 1.0

def test_timeline_sample_at_edges():
    tl = Timeline(id="t1", name="test", duration=300)
    tl.add_keyframe(0.0, {"opacity": 0})
    tl.add_keyframe(1.0, {"opacity": 1})
    assert tl.sample(0.0)["opacity"] == 0
    assert tl.sample(1.0)["opacity"] == 1

def test_timeline_sample_midpoint():
    tl = Timeline(id="t1", name="test", duration=300)
    tl.add_keyframe(0.0, {"opacity": 0.0}, "linear")
    tl.add_keyframe(1.0, {"opacity": 1.0}, "linear")
    mid = tl.sample(0.5)
    assert 0.49 < mid["opacity"] < 0.51

def test_timeline_sample_empty():
    tl = Timeline(id="t1", name="test", duration=300)
    assert tl.sample(0.5) == {}


# ── CSS serializer ────────────────────────────────────────────────────────────
def test_css_keyframes_contains_at_keyframes():
    tl = get_preset("fade-in")
    css = serialize_to_css(tl)
    assert "@keyframes" in css
    assert "0%" in css
    assert "100%" in css
    assert "opacity" in css

def test_css_animation_class():
    tl = get_preset("slide-up")
    css = serialize_to_css(tl)
    assert "animation:" in css
    assert "slide-up" in css

def test_css_duration_present():
    tl = get_preset("pop")
    css = serialize_to_css(tl)
    assert str(int(tl.duration)) in css


# ── JS serializer ─────────────────────────────────────────────────────────────
def test_js_output_valid():
    tl  = get_preset("bounce")
    js  = serialize_to_js(tl)
    assert "Keyframes" in js
    assert "Options"   in js
    assert "duration"  in js
    assert "animate("  in js

def test_js_ident_camel_case():
    assert _js_ident("slide-up")  == "slideUp"
    assert _js_ident("fade_in")   == "fadeIn"
    assert _js_ident("pop")       == "pop"


# ── Framer Motion serializer ──────────────────────────────────────────────────
def test_framer_motion_output():
    tl = get_preset("fade-in")
    fm = serialize_to_framer_motion(tl)
    assert "Variants" in fm
    assert "initial"  in fm
    assert "animate"  in fm
    assert "transition" in fm


# ── Presets ───────────────────────────────────────────────────────────────────
EXPECTED_PRESETS = [
    "fade-in","fade-out","slide-up","slide-down",
    "slide-in-left","slide-in-right","pop","shake",
    "bounce","pulse","spin","wiggle","flip","blur-in","typewriter",
]

@pytest.mark.parametrize("name", EXPECTED_PRESETS)
def test_preset_exists(name):
    tl = get_preset(name)
    assert tl is not None
    assert len(tl.keyframes) >= 2

@pytest.mark.parametrize("name", EXPECTED_PRESETS)
def test_preset_produces_valid_css(name):
    tl  = get_preset(name)
    css = serialize_to_css(tl)
    assert "@keyframes" in css
    assert "animation:" in css

def test_list_presets_returns_all():
    names = {p["name"] for p in list_presets()}
    for name in EXPECTED_PRESETS:
        assert name in names

def test_pulse_infinite_iterations():
    tl = get_preset("pulse")
    assert tl.iterations == float("inf")


# ── Easing sampler ────────────────────────────────────────────────────────────
def test_sample_easing_length():
    samples = sample_easing("ease-out-cubic", 10)
    assert len(samples) == 10

def test_sample_easing_boundaries():
    samples = sample_easing("linear", 10)
    assert samples[0]  == (0.0, 0.0)
    assert samples[-1] == (1.0, 1.0)

def test_svg_path_output():
    svg = easing_to_svg_path("ease-out-bounce")
    assert "<svg" in svg
    assert "<path" in svg
    assert 'fill="none"' in svg


# ── Production-level regression tests ────────────────────────────────────────

def test_js_infinite_iterations_is_not_quoted_string():
    """serialize_to_js must output JS numeric Infinity, not the string "Infinity"."""
    tl = get_preset("pulse")  # iterations == inf
    js = serialize_to_js(tl)
    assert "iterations: Infinity" in js
    assert 'iterations: "Infinity"' not in js


def test_framer_motion_infinite_repeat_is_not_quoted_string():
    """serialize_to_framer_motion must output Infinity literal, not JSON string."""
    tl = get_preset("spin")  # iterations == inf
    fm = serialize_to_framer_motion(tl)
    assert '"Infinity"' not in fm
    assert "Infinity" in fm


def test_easings_registry_no_missing_entries():
    """All implemented easing functions must be reachable by name."""
    expected = [
        "ease-in-out-bounce", "ease-in-out-elastic",
        "ease-in-quart", "ease-out-quart", "ease-in-out-quart",
    ]
    for name in expected:
        assert name in EASINGS, f"'{name}' missing from EASINGS registry"


def test_easings_registry_no_duplicate_keys():
    """EASINGS must not silently discard any entry via a duplicate key."""
    seen: set = set()
    # Reconstruct from source to catch any duplicates Python would collapse
    import ast, inspect, motion_library as ml
    src = inspect.getsource(ml)
    # Find the EASINGS dict literal block and count how many times each key appears
    import re
    keys_in_src = re.findall(r'"(ease-[^"]+|linear|spring)":\s+\w', src)
    from collections import Counter
    dupes = [k for k, v in Counter(keys_in_src).items() if v > 1]
    assert dupes == [], f"Duplicate EASINGS source keys: {dupes}"


def test_easing_to_css_returns_valid_css_for_all_easings():
    """_easing_to_css must never return a raw non-CSS easing name."""
    VALID_CSS_KEYWORDS = {"linear", "ease", "ease-in", "ease-out", "ease-in-out"}
    for name in EASINGS:
        css_val = _easing_to_css(name)
        is_keyword = css_val in VALID_CSS_KEYWORDS
        is_cubic_bezier = css_val.startswith("cubic-bezier(")
        is_steps = css_val.startswith("steps(")
        assert is_keyword or is_cubic_bezier or is_steps, (
            f"_easing_to_css('{name}') returned invalid CSS: '{css_val}'"
        )


def test_timeline_invalid_duration_raises():
    with pytest.raises(ValueError, match="duration"):
        Timeline(id="x", name="x", duration=0)


def test_timeline_invalid_iterations_raises():
    with pytest.raises(ValueError, match="iterations"):
        Timeline(id="x", name="x", duration=100, iterations=-1)


def test_add_keyframe_offset_out_of_range_raises():
    tl = Timeline(id="x", name="x", duration=100)
    with pytest.raises(ValueError, match="offset"):
        tl.add_keyframe(1.5, {"opacity": 1})


def test_add_keyframe_empty_props_raises():
    tl = Timeline(id="x", name="x", duration=100)
    with pytest.raises(ValueError, match="props"):
        tl.add_keyframe(0.0, {})


def test_ease_in_out_bounce_at_boundaries():
    assert abs(ease_in_out_bounce(0.0)) < 0.01
    assert abs(ease_in_out_bounce(1.0) - 1.0) < 0.01


def test_ease_in_out_elastic_at_boundaries():
    assert abs(ease_in_out_elastic(0.0)) < 0.01
    assert abs(ease_in_out_elastic(1.0) - 1.0) < 0.01


def test_ease_in_quart_concave():
    assert ease_in_quart(0.25) < ease_in_cubic(0.25)  # quart slower than cubic


def test_ease_out_quart_at_boundaries():
    assert abs(ease_out_quart(0.0)) < 0.01
    assert abs(ease_out_quart(1.0) - 1.0) < 0.01
