#!/usr/bin/env python3
"""BlackRoad Studio — Theme Generator.

Generates design tokens in multiple formats from the BlackRoad brand system.
Outputs: CSS custom properties, Tailwind config, Figma tokens, JSON.

Usage:
  python theme_generator.py --format css > theme.css
  python theme_generator.py --format tailwind > tailwind.config.js
  python theme_generator.py --format json > tokens.json
"""

from __future__ import annotations
import argparse
import json
import sys
from dataclasses import dataclass, field
from typing import Any


# === BRAND SYSTEM ===
# Primary colors (NEVER use forbidden colors below)
# FORBIDDEN: #FF9D00 #FF6B00 #FF0066 #FF006B #D600AA #7700FF #0066FF

COLORS = {
    "black": "#000000",
    "white": "#FFFFFF",
    "amber": "#F5A623",
    "hot-pink": "#FF1D6C",       # Primary brand color
    "electric-blue": "#2979FF",
    "violet": "#9C27B0",
    "deep-black": "#0a0a0a",
    "charcoal": "#1a1a1a",
    "dark-gray": "#2a2a2a",
    "mid-gray": "#444444",
    "silver": "#aaaaaa",
    "light-gray": "#e5e5e5",
}

GRADIENTS = {
    "brand": "linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%)",
    "brand-horizontal": "linear-gradient(90deg, #F5A623, #FF1D6C, #9C27B0, #2979FF)",
    "dark": "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    "card": "linear-gradient(135deg, rgba(255,29,108,0.05) 0%, rgba(41,121,255,0.05) 100%)",
}

SPACING = {
    "xs": "8px",
    "sm": "13px",   # 8 × φ
    "md": "21px",   # 13 × φ
    "lg": "34px",   # 21 × φ
    "xl": "55px",   # 34 × φ
    "2xl": "89px",  # 55 × φ
}

TYPOGRAPHY = {
    "font-family": "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
    "font-mono": "'SF Mono', 'Cascadia Code', 'Fira Code', 'Courier New', monospace",
    "line-height": "1.618",  # Golden ratio
    "letter-spacing": "-0.01em",
}

RADII = {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "full": "9999px",
}

SHADOWS = {
    "sm": "0 1px 4px rgba(0,0,0,0.4)",
    "md": "0 4px 16px rgba(0,0,0,0.5)",
    "lg": "0 8px 32px rgba(0,0,0,0.6)",
    "brand": "0 0 24px rgba(255,29,108,0.25)",
    "glow": "0 0 40px rgba(41,121,255,0.3)",
}


def to_css() -> str:
    lines = [":root {"]
    for k, v in COLORS.items():
        lines.append(f"  --br-{k}: {v};")
    lines.append("")
    for k, v in GRADIENTS.items():
        lines.append(f"  --br-gradient-{k}: {v};")
    lines.append("")
    for k, v in SPACING.items():
        lines.append(f"  --br-space-{k}: {v};")
    lines.append("")
    for k, v in TYPOGRAPHY.items():
        lines.append(f"  --br-{k}: {v};")
    lines.append("")
    for k, v in RADII.items():
        lines.append(f"  --br-radius-{k}: {v};")
    lines.append("")
    for k, v in SHADOWS.items():
        lines.append(f"  --br-shadow-{k}: {v};")
    lines.append("}")
    return "\n".join(lines)


def to_tailwind() -> str:
    cfg = {
        "theme": {
            "extend": {
                "colors": {
                    "br": {k.replace("-", "_"): v for k, v in COLORS.items()}
                },
                "spacing": {f"br-{k}": v for k, v in SPACING.items()},
                "borderRadius": {f"br-{k}": v for k, v in RADII.items()},
                "boxShadow": {f"br-{k}": v for k, v in SHADOWS.items()},
                "fontFamily": {
                    "br-sans": TYPOGRAPHY["font-family"].split(","),
                    "br-mono": TYPOGRAPHY["font-mono"].split(","),
                },
            }
        }
    }
    return "module.exports = " + json.dumps(cfg, indent=2)


def to_json() -> str:
    tokens: dict[str, Any] = {
        "$schema": "https://design-tokens.github.io/community-group/format/",
        "color": {k: {"$value": v, "$type": "color"} for k, v in COLORS.items()},
        "gradient": {k: {"$value": v, "$type": "custom-gradient"} for k, v in GRADIENTS.items()},
        "spacing": {k: {"$value": v, "$type": "dimension"} for k, v in SPACING.items()},
        "borderRadius": {k: {"$value": v, "$type": "borderRadius"} for k, v in RADII.items()},
        "shadow": {k: {"$value": v, "$type": "shadow"} for k, v in SHADOWS.items()},
    }
    return json.dumps(tokens, indent=2)


def main():
    parser = argparse.ArgumentParser(description="BlackRoad Theme Generator")
    parser.add_argument("--format", choices=["css", "tailwind", "json", "all"], default="css")
    parser.add_argument("--output", help="Output file (default: stdout)")
    args = parser.parse_args()

    outputs = {
        "css": to_css,
        "tailwind": to_tailwind,
        "json": to_json,
    }

    if args.format == "all":
        for fmt, fn in outputs.items():
            ext = "js" if fmt == "tailwind" else fmt
            filename = f"br-tokens.{ext}"
            with open(filename, "w") as f:
                f.write(fn())
            print(f"✓ Generated {filename}")
        return

    result = outputs[args.format]()
    if args.output:
        with open(args.output, "w") as f:
            f.write(result)
        print(f"✓ Written to {args.output}", file=sys.stderr)
    else:
        print(result)


if __name__ == "__main__":
    main()
