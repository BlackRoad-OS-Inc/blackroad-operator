#!/usr/bin/env python3
"""
BlackRoad Studio – Color Palette Generator
Generate harmonious, WCAG-accessible color palettes and export to CSS / Tailwind / JSON.
"""
from __future__ import annotations

import json
import math
import os
import sqlite3
import sys
import uuid
import argparse
import datetime
from colorsys import hls_to_rgb, rgb_to_hls
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Dict, List, Literal, Optional, Tuple

# ── Type aliases ──────────────────────────────────────────────────────────────
HarmonyType = Literal[
    "complementary", "triadic", "analogous",
    "monochromatic", "split-complementary", "tetradic",
]

DB_PATH = Path(os.environ.get("PALETTE_DB", Path.home() / ".blackroad" / "palettes.db"))

# ── Data models ───────────────────────────────────────────────────────────────
@dataclass
class ColorSwatch:
    hex: str
    name: str
    role: str
    hue: float = 0.0
    lightness: float = 0.0
    saturation: float = 0.0

    def __post_init__(self) -> None:
        r, g, b = hex_to_rgb(self.hex)
        h, l, s = rgb_to_hls(r / 255, g / 255, b / 255)
        self.hue = round(h * 360, 2)
        self.lightness = round(l, 4)
        self.saturation = round(s, 4)


@dataclass
class Palette:
    id: str
    name: str
    base_color: str
    harmony: str
    colors: List[ColorSwatch] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    created_at: str = ""
    description: str = ""

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "base_color": self.base_color,
            "harmony": self.harmony,
            "colors": [asdict(c) for c in self.colors],
            "tags": self.tags,
            "created_at": self.created_at,
            "description": self.description,
        }


# ── Low-level colour math ─────────────────────────────────────────────────────
def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Parse a #rrggbb or #rgb string into (r, g, b) ints 0-255."""
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = h[0]*2 + h[1]*2 + h[2]*2
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def rgb_to_hex(r: int, g: int, b: int) -> str:
    r, g, b = max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b))
    return f"#{r:02x}{g:02x}{b:02x}"


def hls_hex(h: float, l: float, s: float) -> str:
    """Build hex from HLS where h ∈ [0,360], l,s ∈ [0,1]."""
    r, g, b = hls_to_rgb(h / 360, l, s)
    return rgb_to_hex(int(r * 255), int(g * 255), int(b * 255))


def rotate_hue(hex_color: str, degrees: float) -> str:
    r, g, b = hex_to_rgb(hex_color)
    h, l, s = rgb_to_hls(r / 255, g / 255, b / 255)
    return hls_hex((h * 360 + degrees) % 360, l, s)


def adjust_lightness(hex_color: str, delta: float) -> str:
    r, g, b = hex_to_rgb(hex_color)
    h, l, s = rgb_to_hls(r / 255, g / 255, b / 255)
    return hls_hex(h * 360, max(0.0, min(1.0, l + delta)), s)


def adjust_saturation(hex_color: str, delta: float) -> str:
    r, g, b = hex_to_rgb(hex_color)
    h, l, s = rgb_to_hls(r / 255, g / 255, b / 255)
    return hls_hex(h * 360, l, max(0.0, min(1.0, s + delta)))


def blend_colors(hex1: str, hex2: str, ratio: float = 0.5) -> str:
    """Linear blend – ratio=0 → hex1, ratio=1 → hex2."""
    r1, g1, b1 = hex_to_rgb(hex1)
    r2, g2, b2 = hex_to_rgb(hex2)
    t = max(0.0, min(1.0, ratio))
    return rgb_to_hex(int(r1 + (r2 - r1) * t),
                      int(g1 + (g2 - g1) * t),
                      int(b1 + (b2 - b1) * t))


def generate_tints_shades(hex_color: str, steps: int = 9) -> List[str]:
    """Return a lightness scale from near-white to near-black at fixed hue."""
    r, g, b = hex_to_rgb(hex_color)
    h, _, s = rgb_to_hls(r / 255, g / 255, b / 255)
    return [hls_hex(h * 360, 0.95 - i * (0.90 / (steps - 1)), s) for i in range(steps)]


def generate_gradient_stops(hex1: str, hex2: str, stops: int = 5) -> List[str]:
    return [blend_colors(hex1, hex2, i / (stops - 1)) for i in range(stops)]


# ── WCAG accessibility ────────────────────────────────────────────────────────
def _linearize(c: float) -> float:
    c /= 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_color: str) -> float:
    r, g, b = hex_to_rgb(hex_color)
    return 0.2126 * _linearize(r) + 0.7152 * _linearize(g) + 0.0722 * _linearize(b)


def wcag_contrast_ratio(color1: str, color2: str) -> float:
    """Return WCAG 2.1 contrast ratio (1–21)."""
    l1, l2 = relative_luminance(color1), relative_luminance(color2)
    bright, dark = max(l1, l2), min(l1, l2)
    return round((bright + 0.05) / (dark + 0.05), 2)


def wcag_grade(ratio: float) -> str:
    if ratio >= 7.0:  return "AAA"
    if ratio >= 4.5:  return "AA"
    if ratio >= 3.0:  return "AA-Large"
    return "Fail"


def a11y_check(palette: Palette) -> dict:
    """Full WCAG audit for every fg/bg combination in a palette."""
    text_roles  = {"text", "primary", "secondary", "accent"}
    bg_roles    = {"background", "surface", "muted"}
    foregrounds = [s for s in palette.colors if s.role in text_roles] or palette.colors[:2]
    backgrounds = [s for s in palette.colors if s.role in bg_roles]   or palette.colors[2:]

    checks: List[dict] = []
    for fg in foregrounds:
        for bg in backgrounds:
            ratio = wcag_contrast_ratio(fg.hex, bg.hex)
            checks.append({
                "fg": {"name": fg.name, "hex": fg.hex},
                "bg": {"name": bg.name, "hex": bg.hex},
                "ratio": ratio,
                "grade": wcag_grade(ratio),
                "aa_normal": ratio >= 4.5,
                "aa_large":  ratio >= 3.0,
                "aaa_normal": ratio >= 7.0,
            })

    passed = sum(1 for c in checks if c["aa_normal"])
    return {
        "palette_id": palette.id,
        "palette_name": palette.name,
        "checks": checks,
        "summary": {
            "total": len(checks),
            "pass_aa": passed,
            "fail_aa": len(checks) - passed,
            "pass_rate": round(passed / max(1, len(checks)) * 100, 1),
        },
    }


# ── Harmony generators ────────────────────────────────────────────────────────
_HARMONY_ANGLES: Dict[str, List[float]] = {
    "complementary":       [0, 180],
    "triadic":             [0, 120, 240],
    "analogous":           [0, 30, 60],
    "monochromatic":       [],               # handled separately
    "split-complementary": [0, 150, 210],
    "tetradic":            [0, 90, 180, 270],
}
_ROLES = ["primary", "secondary", "accent", "quaternary",
          "background", "surface", "muted", "text"]


def generate(base_hex: str, harmony_type: str, name: str = "") -> Palette:
    """Main factory – returns a fully-populated Palette."""
    h_str = base_hex.lstrip("#")
    if len(h_str) == 3:
        h_str = h_str[0]*2 + h_str[1]*2 + h_str[2]*2
    if len(h_str) != 6:
        raise ValueError(f"Invalid hex color: {base_hex!r}")
    full = f"#{h_str}"

    if harmony_type not in _HARMONY_ANGLES:
        raise ValueError(f"Unknown harmony type: {harmony_type!r}")

    r, g, b = hex_to_rgb(full)
    _, l, s = rgb_to_hls(r / 255, g / 255, b / 255)

    swatches: List[ColorSwatch] = []

    if harmony_type == "monochromatic":
        steps = [(0.92, "background"), (0.75, "surface"), (0.55, "primary"),
                 (0.35, "secondary"), (0.15, "text")]
        for i, (lv, role) in enumerate(steps):
            c = adjust_lightness(full, lv - l)
            swatches.append(ColorSwatch(hex=c, name=f"{name or 'color'}-{i+1}", role=role))
    else:
        for i, angle in enumerate(_HARMONY_ANGLES[harmony_type]):
            c = rotate_hue(full, angle)
            role = _ROLES[i] if i < len(_ROLES) else f"color-{i+1}"
            swatches.append(ColorSwatch(hex=c, name=f"{name or 'color'}-{i+1}", role=role))
        swatches.append(ColorSwatch(adjust_lightness(full, 0.38), f"{name or 'color'}-light",  "background"))
        swatches.append(ColorSwatch(adjust_lightness(full, -0.38), f"{name or 'color'}-dark", "text"))

    return Palette(
        id=str(uuid.uuid4()),
        name=name or f"{harmony_type.title()} Palette",
        base_color=full,
        harmony=harmony_type,
        colors=swatches,
        tags=[harmony_type],
        created_at=datetime.datetime.utcnow().isoformat(),
    )


# ── Semantic colour suggestions ───────────────────────────────────────────────
def suggest_semantic(palette: Palette) -> Dict[str, str]:
    """Return success/warning/error/info hex values tuned to base hue's lightness."""
    r, g, b = hex_to_rgb(palette.base_color)
    _, l, s = rgb_to_hls(r / 255, g / 255, b / 255)
    adj = max(0.55, s)
    tgt = max(0.35, min(0.60, l))
    return {
        "success": hls_hex(120, tgt, adj),
        "warning": hls_hex(38,  tgt, adj),
        "error":   hls_hex(4,   tgt, adj),
        "info":    hls_hex(207, tgt, adj),
    }


def suggest_neutral(palette: Palette) -> str:
    r, g, b = hex_to_rgb(palette.base_color)
    h, l, _ = rgb_to_hls(r / 255, g / 255, b / 255)
    return hls_hex(h * 360, 0.5, 0.05)


# ── Export functions ──────────────────────────────────────────────────────────
def to_css_vars(palette: Palette, prefix: str = "palette") -> str:
    lines = [f":root {{", f"  /* {palette.name} – {palette.harmony} */"]
    for sw in palette.colors:
        slug = sw.name.lower().replace(" ", "-")
        r, g, b = hex_to_rgb(sw.hex)
        lines.append(f"  --{prefix}-{slug}: {sw.hex};")
        lines.append(f"  --{prefix}-{slug}-rgb: {r}, {g}, {b};")
    lines += ["}", "", f"/* {palette.name} tint/shade scale */", ":root {"]
    nums  = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
    scale = generate_tints_shades(palette.base_color, 9)
    for num, hex_val in zip(nums, scale):
        lines.append(f"  --{prefix}-{num}: {hex_val};")
    lines.append("}")
    sem = suggest_semantic(palette)
    lines += ["", "/* Semantic tokens */", ":root {"]
    for name, val in sem.items():
        lines.append(f"  --{prefix}-{name}: {val};")
    lines.append("}")
    return "\n".join(lines)


def to_tailwind(palette: Palette) -> str:
    scale = generate_tints_shades(palette.base_color, 9)
    pname = palette.name.lower().replace(" ", "-")
    nums  = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
    lines = [
        "/** @type {import('tailwindcss').Config} */",
        "module.exports = {", "  theme: {", "    extend: {", "      colors: {",
        f"        '{pname}': {{",
    ]
    for num, hex_val in zip(nums, scale):
        lines.append(f"          {num}: '{hex_val}',")
    lines.append("        },")
    lines.append(f"        '{pname}-roles': {{")
    for sw in palette.colors:
        lines.append(f"          '{sw.role}': '{sw.hex}',")
    lines += ["        },", "      },", "    },", "  },", "};"]
    return "\n".join(lines)


def export_json(palette: Palette) -> str:
    data = palette.to_dict()
    data["scale"] = generate_tints_shades(palette.base_color)
    data["semantic"] = suggest_semantic(palette)
    data["neutral"]  = suggest_neutral(palette)
    matrix: Dict[str, dict] = {}
    for s1 in palette.colors:
        matrix[s1.name] = {}
        for s2 in palette.colors:
            if s1.name != s2.name:
                ratio = wcag_contrast_ratio(s1.hex, s2.hex)
                matrix[s1.name][s2.name] = {"ratio": ratio, "grade": wcag_grade(ratio)}
    data["contrast_matrix"] = matrix
    return json.dumps(data, indent=2)


# ── SQLite persistence ────────────────────────────────────────────────────────
def _db(path: Path = DB_PATH) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS palettes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            base_color TEXT NOT NULL,
            harmony TEXT NOT NULL,
            data TEXT NOT NULL,
            tags TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )""")
    conn.commit()
    return conn


def save_palette(palette: Palette, db_path: Path = DB_PATH) -> None:
    conn = _db(db_path)
    conn.execute(
        "INSERT OR REPLACE INTO palettes VALUES (?,?,?,?,?,?,?)",
        (palette.id, palette.name, palette.base_color, palette.harmony,
         json.dumps([asdict(c) for c in palette.colors]),
         ",".join(palette.tags), palette.created_at),
    )
    conn.commit(); conn.close()


def load_palette(palette_id: str, db_path: Path = DB_PATH) -> Optional[Palette]:
    conn = _db(db_path)
    row = conn.execute(
        "SELECT id,name,base_color,harmony,data,tags,created_at FROM palettes WHERE id=?",
        (palette_id,),
    ).fetchone()
    conn.close()
    if not row:
        return None
    pid, name, base, harmony, data, tags, created_at = row
    return Palette(
        id=pid, name=name, base_color=base, harmony=harmony,
        colors=[ColorSwatch(**c) for c in json.loads(data)],
        tags=tags.split(",") if tags else [],
        created_at=created_at,
    )


def list_palettes(db_path: Path = DB_PATH) -> List[dict]:
    conn = _db(db_path)
    rows = conn.execute(
        "SELECT id,name,base_color,harmony,tags,created_at FROM palettes ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [{"id": r[0],"name": r[1],"base_color": r[2],"harmony": r[3],
             "tags": r[4],"created_at": r[5]} for r in rows]


def delete_palette(palette_id: str, db_path: Path = DB_PATH) -> bool:
    conn = _db(db_path)
    cur = conn.execute("DELETE FROM palettes WHERE id=?", (palette_id,))
    conn.commit(); conn.close()
    return cur.rowcount > 0


# ── CLI ───────────────────────────────────────────────────────────────────────
def _pretty(p: Palette) -> None:
    print(f"\n🎨  {p.name}  [{p.harmony}]  base={p.base_color}")
    print(f"    id: {p.id}")
    for sw in p.colors:
        print(f"    {sw.hex}  {sw.role:<14} {sw.name}")
    print("    semantic:", suggest_semantic(p))


def main(argv: Optional[List[str]] = None) -> None:
    ap = argparse.ArgumentParser(
        prog="palette",
        description="BlackRoad Studio – Color Palette Generator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  palette generate '#3b82f6' complementary --name 'Ocean' --save
  palette css <id>
  palette tailwind <id>
  palette a11y <id>
  palette contrast '#ffffff' '#1e293b'
  palette list
""",
    )
    sub = ap.add_subparsers(dest="cmd", required=True)

    p_gen = sub.add_parser("generate", help="Generate a new palette")
    p_gen.add_argument("base_color")
    p_gen.add_argument("harmony", choices=list(_HARMONY_ANGLES))
    p_gen.add_argument("--name", default="")
    p_gen.add_argument("--save", action="store_true")
    p_gen.add_argument("--json", dest="as_json", action="store_true")

    p_css = sub.add_parser("css",      help="Export as CSS variables")
    p_css.add_argument("palette_id")
    p_css.add_argument("--prefix", default="palette")

    p_tw  = sub.add_parser("tailwind", help="Export as Tailwind config")
    p_tw.add_argument("palette_id")

    p_ex  = sub.add_parser("export",   help="Export as JSON")
    p_ex.add_argument("palette_id")

    p_a11= sub.add_parser("a11y",      help="WCAG accessibility report")
    p_a11.add_argument("palette_id")

    sub.add_parser("list", help="List saved palettes")

    p_con = sub.add_parser("contrast", help="Contrast ratio between two colours")
    p_con.add_argument("color1")
    p_con.add_argument("color2")

    p_bl  = sub.add_parser("blend",    help="Blend / gradient between two colours")
    p_bl.add_argument("color1")
    p_bl.add_argument("color2")
    p_bl.add_argument("--ratio", type=float, default=0.5)
    p_bl.add_argument("--stops", type=int,   default=5)

    p_del = sub.add_parser("delete",   help="Delete a saved palette")
    p_del.add_argument("palette_id")

    args = ap.parse_args(argv)

    if args.cmd == "generate":
        pal = generate(args.base_color, args.harmony, args.name)
        print(export_json(pal)) if args.as_json else _pretty(pal)
        if args.save:
            save_palette(pal)
            print(f"\n✅ saved → {pal.id}")

    elif args.cmd == "css":
        p = load_palette(args.palette_id)
        if not p: sys.exit(f"❌ not found: {args.palette_id}")
        print(to_css_vars(p, args.prefix))

    elif args.cmd == "tailwind":
        p = load_palette(args.palette_id)
        if not p: sys.exit(f"❌ not found: {args.palette_id}")
        print(to_tailwind(p))

    elif args.cmd == "export":
        p = load_palette(args.palette_id)
        if not p: sys.exit(f"❌ not found: {args.palette_id}")
        print(export_json(p))

    elif args.cmd == "a11y":
        p = load_palette(args.palette_id)
        if not p: sys.exit(f"❌ not found: {args.palette_id}")
        print(json.dumps(a11y_check(p), indent=2))

    elif args.cmd == "list":
        rows = list_palettes()
        if not rows: print("(no palettes saved)")
        else:
            print(f"{'id':<38} {'name':<28} {'harmony':<20} base")
            print("-" * 95)
            for r in rows:
                print(f"{r['id']:<38} {r['name']:<28} {r['harmony']:<20} {r['base_color']}")

    elif args.cmd == "contrast":
        ratio = wcag_contrast_ratio(args.color1, args.color2)
        grade = wcag_grade(ratio)
        print(f"ratio {ratio}:1  grade={grade}")
        print(f"AA-normal  (≥4.5): {'✅' if ratio>=4.5 else '❌'}")
        print(f"AA-large   (≥3.0): {'✅' if ratio>=3.0 else '❌'}")
        print(f"AAA-normal (≥7.0): {'✅' if ratio>=7.0 else '❌'}")

    elif args.cmd == "blend":
        stops = generate_gradient_stops(args.color1, args.color2, args.stops)
        for i, s in enumerate(stops):
            print(f"  stop {i}: {s}")

    elif args.cmd == "delete":
        ok = delete_palette(args.palette_id)
        print(f"✅ deleted {args.palette_id}" if ok else f"❌ not found: {args.palette_id}")
        if not ok: sys.exit(1)


if __name__ == "__main__":
    main()
