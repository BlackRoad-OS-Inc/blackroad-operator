#!/usr/bin/env python3
"""
BlackRoad Studio — Asset Pipeline
Generates brand-consistent SVG assets, icon sets, and design tokens.
"""
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

# Official BlackRoad brand palette
BRAND = {
    "black": "#000000",
    "white": "#FFFFFF",
    "amber": "#F5A623",
    "hot-pink": "#FF1D6C",
    "electric-blue": "#2979FF",
    "violet": "#9C27B0",
    "gradient": "linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%)",
}


@dataclass
class AssetSpec:
    name: str
    width: int
    height: int
    bg: str = "#000000"
    text: Optional[str] = None
    color: str = "#FF1D6C"


def render_svg(spec: AssetSpec) -> str:
    """Generate SVG asset from spec."""
    text_elem = ""
    if spec.text:
        text_elem = f"""
  <text x="{spec.width // 2}" y="{spec.height // 2 + 8}"
        font-family="SF Pro Display, sans-serif"
        font-size="24" font-weight="700"
        fill="{spec.color}" text-anchor="middle">{spec.text}</text>"""

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{spec.width}" height="{spec.height}" viewBox="0 0 {spec.width} {spec.height}">
  <defs>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F5A623;stop-opacity:1"/>
      <stop offset="38.2%" style="stop-color:#FF1D6C;stop-opacity:1"/>
      <stop offset="61.8%" style="stop-color:#9C27B0;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#2979FF;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect width="{spec.width}" height="{spec.height}" fill="{spec.bg}"/>
  <rect x="0" y="{spec.height - 4}" width="{spec.width}" height="4" fill="url(#brand)"/>{text_elem}
</svg>"""


def export_tokens(output: Path) -> None:
    """Export design tokens as CSS + JSON."""
    css = ":root {\n"
    css += "  /* BlackRoad OS Brand Colors */\n"
    for name, value in BRAND.items():
        if not name == "gradient":
            css += f"  --{name}: {value};\n"
    css += f"  --gradient-brand: {BRAND['gradient']};\n"

    # Spacing (golden ratio φ = 1.618)
    phi = 1.618
    base = 8
    for i, label in enumerate(["xs", "sm", "md", "lg", "xl"]):
        size = round(base * (phi ** i))
        css += f"  --space-{label}: {size}px;\n"
    css += "}\n"

    output.mkdir(parents=True, exist_ok=True)
    (output / "tokens.css").write_text(css)
    (output / "tokens.json").write_text(json.dumps(BRAND, indent=2))
    print(f"✅ Tokens exported to {output}/")


STANDARD_ASSETS = [
    AssetSpec("logo-dark", 200, 60, "#000000", "BLACKROAD", "#F5A623"),
    AssetSpec("logo-light", 200, 60, "#FFFFFF", "BLACKROAD", "#000000"),
    AssetSpec("icon-32", 32, 32, "#000000"),
    AssetSpec("icon-64", 64, 64, "#000000"),
    AssetSpec("og-image", 1200, 630, "#000000", "BlackRoad OS", "#FFFFFF"),
    AssetSpec("favicon", 16, 16, "#000000"),
]


def main():
    out = Path("dist/assets")
    out.mkdir(parents=True, exist_ok=True)

    for spec in STANDARD_ASSETS:
        svg = render_svg(spec)
        path = out / f"{spec.name}.svg"
        path.write_text(svg)
        print(f"  📄 {path}")

    export_tokens(Path("dist/tokens"))
    print(f"\n✅ Generated {len(STANDARD_ASSETS)} assets + design tokens")


if __name__ == "__main__":
    main()

