#!/usr/bin/env python3
"""
BlackRoad Studio – Motion & Animation Library
Easing functions, Timeline keyframes, CSS @keyframes serializer,
JS animation serializer, and a preset library of reusable animations.
Pure Python — no external dependencies.
"""
from __future__ import annotations

import json
import math
import sys
import argparse
import uuid
from dataclasses import dataclass, field, asdict
from typing import Any, Callable, Dict, List, Optional, Tuple

__all__ = [
    # Easing functions
    "linear",
    "ease_in_quad", "ease_out_quad", "ease_in_out_quad",
    "ease_in_cubic", "ease_out_cubic", "ease_in_out_cubic",
    "ease_in_quart", "ease_out_quart", "ease_in_out_quart",
    "ease_in_expo", "ease_out_expo", "ease_in_out_expo",
    "ease_in_sine", "ease_out_sine", "ease_in_out_sine",
    "ease_in_back", "ease_out_back", "ease_in_out_back",
    "ease_out_bounce", "ease_in_bounce", "ease_in_out_bounce",
    "ease_out_elastic", "ease_in_elastic", "ease_in_out_elastic",
    "spring",
    "cubic_bezier",
    # Named CSS bezier presets
    "EASE", "EASE_IN", "EASE_OUT", "EASE_IN_OUT",
    # Registry
    "EASINGS",
    # Data model
    "Keyframe", "Timeline",
    # Preset library
    "PRESETS", "get_preset", "list_presets",
    # Serializers
    "serialize_to_css", "serialize_to_js", "serialize_to_framer_motion",
    # Utilities
    "sample_easing", "easing_to_svg_path",
]

# ── Easing functions ──────────────────────────────────────────────────────────
# All easings accept t ∈ [0, 1] and return a value ∈ [0, 1]

def linear(t: float) -> float:
    return t

def ease_in_quad(t: float) -> float:
    return t * t

def ease_out_quad(t: float) -> float:
    return t * (2 - t)

def ease_in_out_quad(t: float) -> float:
    return 2 * t * t if t < 0.5 else -1 + (4 - 2 * t) * t

def ease_in_cubic(t: float) -> float:
    return t ** 3

def ease_out_cubic(t: float) -> float:
    return 1 - (1 - t) ** 3

def ease_in_out_cubic(t: float) -> float:
    return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2

def ease_in_quart(t: float) -> float:
    return t ** 4

def ease_out_quart(t: float) -> float:
    return 1 - (1 - t) ** 4

def ease_in_out_quart(t: float) -> float:
    return 8 * t ** 4 if t < 0.5 else 1 - (-2 * t + 2) ** 4 / 2

def ease_in_expo(t: float) -> float:
    return 0.0 if t == 0 else 2 ** (10 * t - 10)

def ease_out_expo(t: float) -> float:
    return 1.0 if t == 1 else 1 - 2 ** (-10 * t)

def ease_in_out_expo(t: float) -> float:
    if t == 0: return 0.0
    if t == 1: return 1.0
    return 2 ** (20 * t - 10) / 2 if t < 0.5 else (2 - 2 ** (-20 * t + 10)) / 2

def ease_in_sine(t: float) -> float:
    return 1 - math.cos(t * math.pi / 2)

def ease_out_sine(t: float) -> float:
    return math.sin(t * math.pi / 2)

def ease_in_out_sine(t: float) -> float:
    return -(math.cos(math.pi * t) - 1) / 2

def ease_in_back(t: float, overshoot: float = 1.70158) -> float:
    c3 = overshoot + 1
    return c3 * t ** 3 - overshoot * t ** 2

def ease_out_back(t: float, overshoot: float = 1.70158) -> float:
    c3 = overshoot + 1
    return 1 + c3 * (t - 1) ** 3 + overshoot * (t - 1) ** 2

def ease_in_out_back(t: float, overshoot: float = 1.70158) -> float:
    c2 = overshoot * 1.525
    if t < 0.5:
        return ((2 * t) ** 2 * ((c2 + 1) * 2 * t - c2)) / 2
    return ((2 * t - 2) ** 2 * ((c2 + 1) * (2 * t - 2) + c2) + 2) / 2

def ease_out_bounce(t: float) -> float:
    n1, d1 = 7.5625, 2.75
    if t < 1 / d1:
        return n1 * t * t
    elif t < 2 / d1:
        t -= 1.5 / d1;  return n1 * t * t + 0.75
    elif t < 2.5 / d1:
        t -= 2.25 / d1; return n1 * t * t + 0.9375
    else:
        t -= 2.625 / d1; return n1 * t * t + 0.984375

def ease_in_bounce(t: float) -> float:
    return 1 - ease_out_bounce(1 - t)

def ease_in_out_bounce(t: float) -> float:
    return (1 - ease_out_bounce(1 - 2 * t)) / 2 if t < 0.5 else (1 + ease_out_bounce(2 * t - 1)) / 2

def ease_in_elastic(t: float) -> float:
    if t in (0, 1): return t
    return -(2 ** (10 * t - 10)) * math.sin((t * 10 - 10.75) * (2 * math.pi) / 3)

def ease_out_elastic(t: float) -> float:
    if t in (0, 1): return t
    return 2 ** (-10 * t) * math.sin((t * 10 - 0.75) * (2 * math.pi) / 3) + 1

def ease_in_out_elastic(t: float) -> float:
    if t in (0, 1): return t
    t2 = 20 * t - 10
    s  = (2 * math.pi) / 4.5
    if t < 0.5:
        return -(2 ** t2) * math.sin(t2 * s) / 2
    return 2 ** (-t2) * math.sin(t2 * s) / 2 + 1


def spring(
    t: float,
    mass: float = 1.0,
    stiffness: float = 100.0,
    damping: float = 10.0,
    velocity: float = 0.0,
) -> float:
    """
    Physics-based spring easing.
    Critical damping: damping = 2 * sqrt(mass * stiffness)
    """
    w0     = math.sqrt(stiffness / mass)
    zeta   = damping / (2 * math.sqrt(mass * stiffness))
    if zeta < 1:  # underdamped
        wd  = w0 * math.sqrt(1 - zeta ** 2)
        A   = 1.0
        B   = (zeta * w0 + velocity) / wd
        val = 1 - math.exp(-zeta * w0 * t) * (A * math.cos(wd * t) + B * math.sin(wd * t))
    elif zeta == 1:  # critically damped
        val = 1 - math.exp(-w0 * t) * (1 + w0 * t)
    else:  # overdamped
        r1  = -w0 * (zeta - math.sqrt(zeta ** 2 - 1))
        r2  = -w0 * (zeta + math.sqrt(zeta ** 2 - 1))
        A   = r2 / (r2 - r1)
        B   = -r1 / (r2 - r1)
        val = 1 - A * math.exp(r1 * t) - B * math.exp(r2 * t)
    return max(0.0, min(1.5, val))  # allow slight overshoot


def cubic_bezier(x1: float, y1: float, x2: float, y2: float) -> Callable[[float], float]:
    """
    Return an easing function from cubic bezier control points (as in CSS).
    Uses Newton-Raphson for t-finding. All x values ∈ [0,1].
    """
    def _sample_x(t: float) -> float:
        return 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3

    def _sample_y(t: float) -> float:
        return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3

    def _find_t(x: float, eps: float = 1e-6) -> float:
        t = x
        for _ in range(8):
            dx = _sample_x(t) - x
            if abs(dx) < eps:
                break
            d  = 3 * (1 - t) ** 2 * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t ** 2 * (1 - x2)
            if abs(d) < eps:
                break
            t -= dx / d
        return max(0.0, min(1.0, t))

    def ease(t: float) -> float:
        if t <= 0: return 0.0
        if t >= 1: return 1.0
        return _sample_y(_find_t(t))

    return ease


# Named bezier presets matching CSS keywords
EASE          = cubic_bezier(0.25, 0.1,  0.25, 1.0)
EASE_IN       = cubic_bezier(0.42, 0.0,  1.0,  1.0)
EASE_OUT      = cubic_bezier(0.0,  0.0,  0.58, 1.0)
EASE_IN_OUT   = cubic_bezier(0.42, 0.0,  0.58, 1.0)


# ── Registry of named easings ─────────────────────────────────────────────────
EASINGS: Dict[str, Callable[[float], float]] = {
    "linear":           linear,
    "ease":             EASE,
    "ease-in":          EASE_IN,
    "ease-out":         EASE_OUT,
    "ease-in-out":      EASE_IN_OUT,
    "ease-in-quad":     ease_in_quad,
    "ease-out-quad":    ease_out_quad,
    "ease-in-out-quad": ease_in_out_quad,
    "ease-in-cubic":    ease_in_cubic,
    "ease-out-cubic":   ease_out_cubic,
    "ease-in-out-cubic":ease_in_out_cubic,
    "ease-in-expo":     ease_in_expo,
    "ease-out-expo":    ease_out_expo,
    "ease-in-out-expo": ease_in_out_expo,
    "ease-in-sine":     ease_in_sine,
    "ease-out-sine":    ease_out_sine,
    "ease-in-out-sine": ease_in_out_sine,
    "ease-in-back":     ease_in_back,
    "ease-out-back":    ease_out_back,
    "ease-in-out-back": ease_in_out_back,
    "ease-out-bounce":      ease_out_bounce,
    "ease-in-bounce":       ease_in_bounce,
    "ease-in-out-bounce":   ease_in_out_bounce,
    "ease-in-elastic":      ease_in_elastic,
    "ease-out-elastic":     ease_out_elastic,
    "ease-in-out-elastic":  ease_in_out_elastic,
    "ease-in-quart":        ease_in_quart,
    "ease-out-quart":       ease_out_quart,
    "ease-in-out-quart":    ease_in_out_quart,
    "spring":               spring,
}


# ── Keyframe model ────────────────────────────────────────────────────────────
@dataclass
class Keyframe:
    offset: float                        # 0.0 – 1.0 (progress)
    props: Dict[str, Any]                # CSS property: value  e.g. {"opacity": 0}
    easing: str = "ease"                 # easing *into* this keyframe


@dataclass
class Timeline:
    id: str
    name: str
    duration: float                      # ms
    keyframes: List[Keyframe] = field(default_factory=list)
    fill_mode: str = "both"              # none | forwards | backwards | both
    iterations: float = 1.0             # float or math.inf
    direction: str = "normal"           # normal | reverse | alternate | alternate-reverse
    delay: float = 0.0                  # ms
    description: str = ""
    tags: List[str] = field(default_factory=list)

    def add_keyframe(self, offset: float, props: Dict[str, Any], easing: str = "ease") -> "Timeline":
        if not 0.0 <= offset <= 1.0:
            raise ValueError(f"keyframe offset must be in [0, 1], got {offset}")
        if not props:
            raise ValueError("keyframe props must not be empty")
        self.keyframes.append(Keyframe(offset=offset, props=props, easing=easing))
        self.keyframes.sort(key=lambda kf: kf.offset)
        return self

    def __post_init__(self) -> None:
        if self.duration <= 0:
            raise ValueError(f"duration must be positive, got {self.duration}")
        if self.iterations <= 0:
            raise ValueError(f"iterations must be positive, got {self.iterations}")

    def sample(self, t: float) -> Dict[str, Any]:
        """Interpolate all properties at normalised time t ∈ [0,1]."""
        if not self.keyframes:
            return {}
        if t <= self.keyframes[0].offset:
            return dict(self.keyframes[0].props)
        if t >= self.keyframes[-1].offset:
            return dict(self.keyframes[-1].props)
        # find surrounding keyframes
        for i in range(len(self.keyframes) - 1):
            kf_a, kf_b = self.keyframes[i], self.keyframes[i + 1]
            if kf_a.offset <= t <= kf_b.offset:
                span  = kf_b.offset - kf_a.offset
                local = (t - kf_a.offset) / span if span else 0.0
                ease_fn = EASINGS.get(kf_b.easing, linear)
                p = ease_fn(local)
                result: Dict[str, Any] = {}
                for key in set(kf_a.props) | set(kf_b.props):
                    va = kf_a.props.get(key, kf_b.props.get(key))
                    vb = kf_b.props.get(key, kf_a.props.get(key))
                    if isinstance(va, (int, float)) and isinstance(vb, (int, float)):
                        result[key] = round(va + (vb - va) * p, 4)
                    else:
                        result[key] = vb if p >= 0.5 else va
                return result
        return {}


# ── CSS @keyframes serializer ─────────────────────────────────────────────────
def _format_value(prop: str, val: Any) -> str:
    """Format a property value for CSS output."""
    # unitless numeric properties
    UNITLESS = {"opacity", "scale", "order", "z-index", "zoom", "flex", "flex-grow"}
    PIXEL_PROPS = {"width", "height", "top", "left", "right", "bottom",
                   "margin", "padding", "border-radius", "font-size", "letter-spacing",
                   "border-width", "outline-offset", "gap", "row-gap", "column-gap"}
    if isinstance(val, str):
        return val
    if isinstance(val, (int, float)):
        if prop in UNITLESS:
            return str(round(val, 4))
        if prop in PIXEL_PROPS:
            return f"{round(val, 2)}px"
        return str(round(val, 4))
    return str(val)


def serialize_to_css(timeline: Timeline, name: Optional[str] = None) -> str:
    """Serialize a Timeline to valid CSS @keyframes + animation rule."""
    anim_name = (name or timeline.name).lower().replace(" ", "-").replace("_", "-")

    lines = [f"@keyframes {anim_name} {{"]
    for kf in timeline.keyframes:
        pct = f"{round(kf.offset * 100)}%"
        lines.append(f"  {pct} {{")
        for prop, val in kf.props.items():
            css_val = _format_value(prop, val)
            lines.append(f"    {prop}: {css_val};")
        if kf.easing and kf.easing != "ease":
            css_ease = _easing_to_css(kf.easing)
            lines.append(f"    animation-timing-function: {css_ease};")
        lines.append("  }")
    lines.append("}")

    # Animation shorthand
    iters   = "infinite" if timeline.iterations == float("inf") else str(timeline.iterations)
    fill    = timeline.fill_mode
    delay   = f" {timeline.delay}ms" if timeline.delay else ""
    lines += [
        "",
        f".{anim_name} {{",
        f"  animation: {anim_name} {timeline.duration}ms{delay} {timeline.direction} {iters} {fill};",
        "}",
    ]
    return "\n".join(lines)


def _easing_to_css(name: str) -> str:
    _CSS_MAP = {
        "linear":            "linear",
        "ease":              "ease",
        "ease-in":           "ease-in",
        "ease-out":          "ease-out",
        "ease-in-out":       "ease-in-out",
        # Quad
        "ease-in-quad":      "cubic-bezier(0.11, 0, 0.5, 0)",
        "ease-out-quad":     "cubic-bezier(0.5, 1, 0.89, 1)",
        "ease-in-out-quad":  "cubic-bezier(0.45, 0, 0.55, 1)",
        # Cubic
        "ease-in-cubic":     "cubic-bezier(0.32, 0, 0.67, 0)",
        "ease-out-cubic":    "cubic-bezier(0.33, 1, 0.68, 1)",
        "ease-in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
        # Quart
        "ease-in-quart":     "cubic-bezier(0.5, 0, 0.75, 0)",
        "ease-out-quart":    "cubic-bezier(0.25, 1, 0.5, 1)",
        "ease-in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
        # Expo
        "ease-in-expo":      "cubic-bezier(0.7, 0, 0.84, 0)",
        "ease-out-expo":     "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-out-expo":  "cubic-bezier(0.87, 0, 0.13, 1)",
        # Sine
        "ease-in-sine":      "cubic-bezier(0.12, 0, 0.39, 0)",
        "ease-out-sine":     "cubic-bezier(0.61, 1, 0.88, 1)",
        "ease-in-out-sine":  "cubic-bezier(0.37, 0, 0.63, 1)",
        # Back
        "ease-in-back":      "cubic-bezier(0.36, 0, 0.66, -0.56)",
        "ease-out-back":     "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-in-out-back":  "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
        # Bounce (best cubic-bezier approximations)
        "ease-in-bounce":    "cubic-bezier(0.36, 0, 0.66, -0.56)",
        "ease-out-bounce":   "cubic-bezier(0.22, 1.2, 0.36, 1)",
        "ease-in-out-bounce":"cubic-bezier(0.68, -0.6, 0.32, 1.6)",
        # Elastic (best cubic-bezier approximations)
        "ease-in-elastic":   "cubic-bezier(0.36, 0, 0.66, -0.56)",
        "ease-out-elastic":  "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-in-out-elastic":"cubic-bezier(0.68, -0.6, 0.32, 1.6)",
        # Spring
        "spring":            "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    }
    return _CSS_MAP.get(name, "ease")


def serialize_to_js(timeline: Timeline) -> str:
    """Serialize to Web Animations API keyframes array."""
    kf_list = []
    for kf in timeline.keyframes:
        obj: Dict[str, Any] = dict(kf.props)
        obj["offset"] = kf.offset
        if kf.easing:
            obj["easing"] = _easing_to_css(kf.easing)
        kf_list.append(obj)

    iters  = "Infinity" if timeline.iterations == float("inf") else timeline.iterations
    js = (
        f"// {timeline.name}\n"
        f"const {_js_ident(timeline.name)}Keyframes = {json.dumps(kf_list, indent=2)};\n\n"
        f"const {_js_ident(timeline.name)}Options = {{\n"
        f"  duration: {timeline.duration},\n"
        f"  delay: {timeline.delay},\n"
        f"  iterations: {iters},\n"
        f"  direction: '{timeline.direction}',\n"
        f"  fill: '{timeline.fill_mode}',\n"
        f"}};\n\n"
        f"// Usage: element.animate({_js_ident(timeline.name)}Keyframes, "
        f"{_js_ident(timeline.name)}Options);"
    )
    return js


def _js_ident(name: str) -> str:
    parts = name.replace("-", " ").replace("_", " ").split()
    return parts[0].lower() + "".join(p.title() for p in parts[1:])


def serialize_to_framer_motion(timeline: Timeline) -> str:
    """Serialize to Framer Motion variants (React)."""
    comp_name = "".join(p.title() for p in timeline.name.replace("-"," ").split())
    if not timeline.keyframes:
        return f"const {comp_name}Variants = {{}};"

    initial = timeline.keyframes[0].props
    animate = timeline.keyframes[-1].props
    trans   = {
        "duration": timeline.duration / 1000,
        "ease": _easing_to_css(timeline.keyframes[-1].easing if timeline.keyframes else "ease"),
        "delay": timeline.delay / 1000,
        "repeat": "Infinity" if timeline.iterations == float("inf") else (timeline.iterations - 1),
        "repeatType": timeline.direction if "alternate" in timeline.direction else "loop",
    }

    lines = [
        f"const {comp_name}Variants = {{",
        f"  initial: {json.dumps(initial)},",
        f"  animate: {json.dumps(animate)},",
        f"  transition: {json.dumps(trans, indent=4).replace('\"Infinity\"', 'Infinity')},",
        "};",
    ]
    return "\n".join(lines)


# ── Preset animations ─────────────────────────────────────────────────────────
def _make(name: str, duration: float, keyframes: list, **kw) -> Timeline:
    tl = Timeline(
        id=str(uuid.uuid4()), name=name, duration=duration,
        description=kw.pop("description", ""), tags=kw.pop("tags", []), **kw
    )
    for offset, props, easing in keyframes:
        tl.add_keyframe(offset, props, easing)
    return tl


PRESETS: Dict[str, Callable[[], Timeline]] = {
    "fade-in": lambda: _make("fade-in", 300, [
        (0.0, {"opacity": 0}, "linear"),
        (1.0, {"opacity": 1}, "ease-out"),
    ], description="Simple opacity fade in"),

    "fade-out": lambda: _make("fade-out", 300, [
        (0.0, {"opacity": 1}, "linear"),
        (1.0, {"opacity": 0}, "ease-in"),
    ], description="Simple opacity fade out"),

    "slide-up": lambda: _make("slide-up", 400, [
        (0.0, {"opacity": 0, "transform": "translateY(20px)"}, "ease-out-cubic"),
        (1.0, {"opacity": 1, "transform": "translateY(0px)"}, "ease-out"),
    ], description="Slide up from below with fade"),

    "slide-down": lambda: _make("slide-down", 400, [
        (0.0, {"opacity": 0, "transform": "translateY(-20px)"}, "ease-out"),
        (1.0, {"opacity": 1, "transform": "translateY(0px)"}, "ease-out"),
    ], description="Slide down from above"),

    "slide-in-left": lambda: _make("slide-in-left", 350, [
        (0.0, {"opacity": 0, "transform": "translateX(-30px)"}, "ease-out"),
        (1.0, {"opacity": 1, "transform": "translateX(0px)"}, "ease-out"),
    ], description="Slide in from the left"),

    "slide-in-right": lambda: _make("slide-in-right", 350, [
        (0.0, {"opacity": 0, "transform": "translateX(30px)"}, "ease-out"),
        (1.0, {"opacity": 1, "transform": "translateX(0px)"}, "ease-out"),
    ], description="Slide in from the right"),

    "pop": lambda: _make("pop", 300, [
        (0.0, {"opacity": 0, "transform": "scale(0.8)"}, "ease-out-back"),
        (0.7, {"opacity": 1, "transform": "scale(1.05)"}, "ease-out-back"),
        (1.0, {"opacity": 1, "transform": "scale(1.0)"}, "ease-in-out"),
    ], description="Pop in with slight overshoot"),

    "shake": lambda: _make("shake", 500, [
        (0.00, {"transform": "translateX(0px)"},   "ease-in-out"),
        (0.14, {"transform": "translateX(-8px)"},  "ease-in-out"),
        (0.28, {"transform": "translateX(8px)"},   "ease-in-out"),
        (0.42, {"transform": "translateX(-8px)"},  "ease-in-out"),
        (0.57, {"transform": "translateX(8px)"},   "ease-in-out"),
        (0.71, {"transform": "translateX(-4px)"},  "ease-in-out"),
        (0.85, {"transform": "translateX(4px)"},   "ease-in-out"),
        (1.00, {"transform": "translateX(0px)"},   "ease-in-out"),
    ], description="Horizontal error shake"),

    "bounce": lambda: _make("bounce", 800, [
        (0.00, {"transform": "translateY(0px)"},    "ease-in"),
        (0.36, {"transform": "translateY(-24px)"},  "ease-out-bounce"),
        (0.45, {"transform": "translateY(-24px)"},  "ease-in"),
        (0.72, {"transform": "translateY(-12px)"},  "ease-out-bounce"),
        (0.81, {"transform": "translateY(-12px)"},  "ease-in"),
        (0.90, {"transform": "translateY(-4px)"},   "ease-out-bounce"),
        (1.00, {"transform": "translateY(0px)"},    "ease-out"),
    ], description="Multi-bounce drop"),

    "pulse": lambda: _make("pulse", 1000, [
        (0.0, {"transform": "scale(1.0)", "opacity": 1}, "ease-in-out"),
        (0.5, {"transform": "scale(1.08)","opacity": 0.85},"ease-in-out"),
        (1.0, {"transform": "scale(1.0)", "opacity": 1}, "ease-in-out"),
    ], iterations=float("inf"), description="Infinite pulse (attention-grabber)"),

    "spin": lambda: _make("spin", 1000, [
        (0.0, {"transform": "rotate(0deg)"},   "linear"),
        (1.0, {"transform": "rotate(360deg)"}, "linear"),
    ], iterations=float("inf"), description="Continuous spin"),

    "wiggle": lambda: _make("wiggle", 600, [
        (0.00, {"transform": "rotate(0deg)"},  "ease-in-out"),
        (0.15, {"transform": "rotate(-6deg)"}, "ease-in-out"),
        (0.30, {"transform": "rotate(6deg)"},  "ease-in-out"),
        (0.45, {"transform": "rotate(-6deg)"}, "ease-in-out"),
        (0.60, {"transform": "rotate(6deg)"},  "ease-in-out"),
        (0.75, {"transform": "rotate(-3deg)"}, "ease-in-out"),
        (0.90, {"transform": "rotate(3deg)"},  "ease-in-out"),
        (1.00, {"transform": "rotate(0deg)"},  "ease-in-out"),
    ], description="Playful rotation wiggle"),

    "flip": lambda: _make("flip", 600, [
        (0.0, {"transform": "perspective(400px) rotateY(0deg)",   "opacity": 1}, "ease-in"),
        (0.4, {"transform": "perspective(400px) rotateY(-90deg)", "opacity": 0.5},"ease-in"),
        (0.6, {"transform": "perspective(400px) rotateY(-90deg)", "opacity": 0.5},"ease-out"),
        (1.0, {"transform": "perspective(400px) rotateY(0deg)",   "opacity": 1}, "ease-out"),
    ], description="3D Y-axis flip"),

    "blur-in": lambda: _make("blur-in", 400, [
        (0.0, {"opacity": 0, "filter": "blur(12px)", "transform": "scale(1.05)"}, "ease-out"),
        (1.0, {"opacity": 1, "filter": "blur(0px)",  "transform": "scale(1.0)"},  "ease-out"),
    ], description="Blur-to-focus entrance"),

    "typewriter": lambda: _make("typewriter", 2000, [
        (0.0, {"width": "0%",   "opacity": 1}, "steps(40, end)"),
        (1.0, {"width": "100%", "opacity": 1}, "steps(40, end)"),
    ], description="Typewriter text reveal (apply to overflow:hidden element)"),
}


def get_preset(name: str) -> Optional[Timeline]:
    factory = PRESETS.get(name)
    return factory() if factory else None


def list_presets() -> List[dict]:
    return [
        {"name": name, "description": PRESETS[name]().description}
        for name in sorted(PRESETS)
    ]


# ── Easing sampler (for visualization / debugging) ───────────────────────────
def sample_easing(name: str, steps: int = 10) -> List[Tuple[float, float]]:
    """Return (t, eased) pairs for visualizing an easing curve."""
    fn = EASINGS.get(name, linear)
    return [(round(i / (steps - 1), 3), round(fn(i / (steps - 1)), 4))
            for i in range(steps)]


def easing_to_svg_path(name: str, w: int = 100, h: int = 100) -> str:
    """Generate an SVG path element for the easing curve."""
    fn    = EASINGS.get(name, linear)
    pts   = [(i * w // 99, h - int(fn(i / 99) * h)) for i in range(100)]
    d     = "M " + " L ".join(f"{x},{y}" for x, y in pts)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'width="{w}" height="{h}">\n'
        f'  <path d="{d}" fill="none" stroke="#3b82f6" stroke-width="2"/>\n'
        f'</svg>'
    )


# ── CLI ───────────────────────────────────────────────────────────────────────
def main(argv: Optional[List[str]] = None) -> None:
    ap = argparse.ArgumentParser(
        prog="motion",
        description="BlackRoad Studio – Motion & Animation Library",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  motion presets
  motion preset fade-in --css
  motion preset slide-up --js
  motion preset bounce --framer
  motion easing ease-out-back --steps 8
  motion easing spring --svg
""",
    )
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("presets", help="List all built-in presets")

    p_pre = sub.add_parser("preset", help="Output a preset animation")
    p_pre.add_argument("name", choices=list(PRESETS))
    grp = p_pre.add_mutually_exclusive_group()
    grp.add_argument("--css",    action="store_true", help="CSS @keyframes output")
    grp.add_argument("--js",     action="store_true", help="Web Animations API output")
    grp.add_argument("--framer", action="store_true", help="Framer Motion variants")
    grp.add_argument("--json",   action="store_true", help="Raw JSON")

    p_ease = sub.add_parser("easing", help="Sample or visualize an easing function")
    p_ease.add_argument("name", choices=list(EASINGS))
    p_ease.add_argument("--steps", type=int, default=10)
    p_ease.add_argument("--svg",   action="store_true")

    p_ls = sub.add_parser("easings", help="List all easing functions")

    args = ap.parse_args(argv)

    if args.cmd == "presets":
        print(f"{'name':<22} description")
        print("-" * 70)
        for p in list_presets():
            print(f"{p['name']:<22} {p['description']}")

    elif args.cmd == "preset":
        tl = get_preset(args.name)
        if args.css:
            print(serialize_to_css(tl))
        elif args.js:
            print(serialize_to_js(tl))
        elif args.framer:
            print(serialize_to_framer_motion(tl))
        elif args.json:
            print(json.dumps({
                "id": tl.id, "name": tl.name, "duration": tl.duration,
                "fill_mode": tl.fill_mode, "iterations": (
                    "Infinity" if tl.iterations == float("inf") else tl.iterations),
                "keyframes": [asdict(kf) for kf in tl.keyframes],
            }, indent=2))
        else:
            print(serialize_to_css(tl))

    elif args.cmd == "easing":
        if args.svg:
            print(easing_to_svg_path(args.name))
        else:
            samples = sample_easing(args.name, args.steps)
            print(f"{'t':>8}  {'eased':>10}")
            print("-" * 22)
            for t, v in samples:
                bar = "█" * int(v * 20)
                print(f"{t:8.3f}  {v:10.4f}  {bar}")

    elif args.cmd == "easings":
        for name in sorted(EASINGS):
            print(f"  {name}")


if __name__ == "__main__":
    main()
