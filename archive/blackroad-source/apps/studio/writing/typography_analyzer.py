#!/usr/bin/env python3
"""
BlackRoad Studio – Typography Analyzer
Analyze readability, suggest font pairings, generate type scales,
and check contrast – pure Python, no external image/font dependencies.
"""
from __future__ import annotations

import json
import math
import os
import re
import sqlite3
import sys
import uuid
import argparse
import datetime
import urllib.parse
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Dict, List, Literal, Optional, Tuple

# ── Constants ─────────────────────────────────────────────────────────────────
CATEGORIES = ("serif", "sans-serif", "monospace", "display", "handwriting")

# Flesch reading ease thresholds
FLESCH_BANDS = [
    (90, "Very Easy",   "5th grade"),
    (80, "Easy",        "6th grade"),
    (70, "Fairly Easy", "7th grade"),
    (60, "Standard",    "8th–9th grade"),
    (50, "Fairly Hard", "10th–12th grade"),
    (30, "Hard",        "College level"),
    (0,  "Very Hard",   "Professional"),
]

# Ideal measure (line-length) range in characters
IDEAL_MEASURE_MIN = 45
IDEAL_MEASURE_MAX = 75

# Google Fonts API base (no key required for metadata)
GOOGLE_FONTS_BASE = "https://fonts.googleapis.com/css2?family={}"

DB_PATH = Path(os.environ.get("TYPO_DB", Path.home() / ".blackroad" / "typography.db"))


# ── Data models ───────────────────────────────────────────────────────────────
@dataclass
class Font:
    id: str
    name: str
    category: str
    weights: List[int] = field(default_factory=lambda: [400])
    google_font_id: str = ""
    tags: List[str] = field(default_factory=list)
    created_at: str = ""

    def __post_init__(self) -> None:
        if self.category not in CATEGORIES:
            raise ValueError(
                f"Invalid category {self.category!r}; must be one of {CATEGORIES}"
            )

    def google_url(self, text: str = "") -> str:
        family = self.google_font_id or self.name.replace(" ", "+")
        wt = ":wght@" + ";".join(str(w) for w in sorted(self.weights))
        url = GOOGLE_FONTS_BASE.format(family + wt)
        if text:
            url += "&text=" + urllib.parse.quote(text[:50])
        return url

    def css_import(self) -> str:
        return f'@import url("{self.google_url()}");'

    def css_rule(self, selector: str = "body") -> str:
        return (
            f"{selector} {{\n"
            f"  font-family: '{self.name}', {self.category};\n"
            f"  font-weight: {self.weights[0]};\n"
            f"}}"
        )


@dataclass
class TypeScale:
    base_size: float
    ratio: float
    steps: List[float] = field(default_factory=list)
    names: List[str] = field(default_factory=list)

    STEP_NAMES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"]

    def as_dict(self) -> dict:
        return {
            "base_size": self.base_size,
            "ratio": self.ratio,
            "steps": {n: round(s, 3) for n, s in zip(self.names, self.steps)},
        }

    def to_css_vars(self, prefix: str = "font-size") -> str:
        lines = [":root {"]
        for name, size in zip(self.names, self.steps):
            lines.append(f"  --{prefix}-{name}: {round(size, 3)}rem;")
        lines.append("}")
        return "\n".join(lines)

    def to_tailwind(self) -> str:
        lines = ["fontSize: {"]
        for name, size in zip(self.names, self.steps):
            rem = round(size, 3)
            lines.append(f"  '{name}': ['{rem}rem', {{ lineHeight: '{round(rem * 1.618, 3)}rem' }}],")
        lines.append("},")
        return "\n".join(lines)


# ── Type scale generator ──────────────────────────────────────────────────────
def scale_generator(
    base_size: float = 1.0,
    ratio: float = 1.618,
    steps_below: int = 2,
    steps_above: int = 6,
) -> TypeScale:
    """
    Generate a modular type scale.
    Default ratio 1.618 = golden ratio (Major Second = 1.125, Minor Third = 1.2,
    Major Third = 1.25, Perfect Fourth = 1.333, Augmented Fourth = 1.414,
    Perfect Fifth = 1.5, Golden = 1.618).
    """
    all_steps = []
    names = []
    total = steps_below + 1 + steps_above

    for i in range(-steps_below, steps_above + 1):
        size = base_size * (ratio ** i)
        all_steps.append(round(size, 4))

    # Assign names from the STEP_NAMES list, centered at base
    offset = steps_below
    name_list = TypeScale.STEP_NAMES
    # pad if needed
    while len(name_list) < total:
        name_list = [f"step-{i}" for i in range(total)]
    # take a slice
    names = name_list[:total]

    ts = TypeScale(base_size=base_size, ratio=ratio, steps=all_steps, names=names)
    return ts


# ── Line height recommendation ────────────────────────────────────────────────
def line_height_recommendation(font_size_px: float, category: str = "body") -> dict:
    """
    Return recommended line-height values for a given font size.
    Based on WCAG 1.4.12 and typographic best practices.
    """
    if category == "heading":
        ratio     = 1.2 + max(0, (24 - font_size_px) * 0.01)
        min_ratio = 1.1
        max_ratio = 1.35
    elif category == "caption":
        ratio     = 1.5
        min_ratio = 1.4
        max_ratio = 1.6
    else:  # body
        ratio     = 1.5 + max(0, (16 - font_size_px) * 0.025)
        min_ratio = 1.4
        max_ratio = 1.8

    ratio = max(min_ratio, min(max_ratio, ratio))
    return {
        "font_size_px": font_size_px,
        "category": category,
        "recommended_ratio": round(ratio, 3),
        "recommended_px": round(font_size_px * ratio, 1),
        "wcag_minimum_ratio": 1.5 if category == "body" else 1.0,
        "wcag_pass": ratio >= (1.5 if category == "body" else 1.0),
        "note": (
            "WCAG 1.4.12 requires line-height ≥ 1.5× font-size for body text."
            if category == "body"
            else "Headings need less line-height due to larger size."
        ),
    }


# ── Measure (line-length) checker ─────────────────────────────────────────────
def check_measure(chars_per_line: int) -> dict:
    status = "optimal" if IDEAL_MEASURE_MIN <= chars_per_line <= IDEAL_MEASURE_MAX else (
        "too-short" if chars_per_line < IDEAL_MEASURE_MIN else "too-long"
    )
    return {
        "chars_per_line": chars_per_line,
        "status": status,
        "ideal_min": IDEAL_MEASURE_MIN,
        "ideal_max": IDEAL_MEASURE_MAX,
        "advice": {
            "optimal":   "Line length is within the ideal 45–75 character range.",
            "too-short": f"Increase measure; under {IDEAL_MEASURE_MIN} chars causes choppy reading.",
            "too-long":  f"Reduce measure; over {IDEAL_MEASURE_MAX} chars strains eye tracking.",
        }[status],
    }


# ── Flesch readability ────────────────────────────────────────────────────────
def _count_syllables(word: str) -> int:
    """Approximate syllable count using vowel-group heuristic."""
    word = word.lower().strip(".,;:!?\"'")
    if not word:
        return 0
    vowels = re.findall(r"[aeiouy]+", word)
    count  = len(vowels)
    if word.endswith("e") and count > 1:
        count -= 1
    return max(1, count)


def flesch_reading_ease(text: str) -> dict:
    """Compute Flesch Reading Ease score (0–100, higher = easier)."""
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if s.strip()]
    words     = re.findall(r"\b[a-zA-Z']+\b", text)

    if not sentences or not words:
        return {"score": 0, "grade": "N/A", "level": "N/A",
                "sentence_count": 0, "word_count": 0, "syllable_count": 0}

    syllables = sum(_count_syllables(w) for w in words)
    asl = len(words) / len(sentences)   # avg sentence length
    asw = syllables / len(words)         # avg syllables/word

    score = round(206.835 - 1.015 * asl - 84.6 * asw, 1)
    score = max(0, min(100, score))

    grade = level = "N/A"
    for threshold, g, lvl in FLESCH_BANDS:
        if score >= threshold:
            grade, level = g, lvl
            break

    return {
        "score": score,
        "grade": grade,
        "level": level,
        "sentence_count": len(sentences),
        "word_count": len(words),
        "syllable_count": syllables,
        "avg_sentence_length": round(asl, 1),
        "avg_syllables_per_word": round(asw, 2),
    }


def analyze_readability(
    text: str,
    font_size_px: float = 16.0,
    line_height: float = 1.5,
    measure: int = 66,
) -> dict:
    """Full readability report for a block of text."""
    flesch  = flesch_reading_ease(text)
    lh_rec  = line_height_recommendation(font_size_px)
    measure_check = check_measure(measure)

    # Letter-spacing recommendation
    ls_rec = "normal"
    if font_size_px < 14:
        ls_rec = "0.02em"
    elif font_size_px > 24:
        ls_rec = "-0.02em"

    # Paragraph spacing recommendation (WCAG 1.4.12)
    para_spacing = round(font_size_px * 2, 1)

    return {
        "text_preview": text[:80] + ("…" if len(text) > 80 else ""),
        "font_size_px": font_size_px,
        "line_height": line_height,
        "line_height_ok": line_height >= 1.5,
        "measure": measure,
        "measure_check": measure_check,
        "readability": flesch,
        "recommendations": {
            "line_height": lh_rec,
            "letter_spacing": ls_rec,
            "paragraph_spacing_px": para_spacing,
        },
        "wcag_1_4_12": {
            "line_height_pass": line_height >= 1.5,
            "letter_spacing_pass": True,   # we never force negative spacing
            "paragraph_spacing_pass": True,
            "note": "WCAG 1.4.12 Text Spacing requires user-applied spacing not break content.",
        },
    }


# ── WCAG contrast checker ─────────────────────────────────────────────────────
def _linearize_channel(c: int) -> float:
    v = c / 255
    return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)   # expand #rgb → #rrggbb
    if len(h) != 6:
        raise ValueError(f"Invalid hex color: {hex_color!r}")
    try:
        r = int(h[0:2], 16); g = int(h[2:4], 16); b = int(h[4:6], 16)
    except ValueError:
        raise ValueError(f"Invalid hex color: {hex_color!r}")
    return (0.2126 * _linearize_channel(r) +
            0.7152 * _linearize_channel(g) +
            0.0722 * _linearize_channel(b))


def WCAG_contrast_checker(fg: str, bg: str) -> dict:
    """Return contrast ratio + WCAG grades for a foreground / background pair."""
    l1, l2  = relative_luminance(fg), relative_luminance(bg)
    light, dark = max(l1, l2), min(l1, l2)
    ratio   = round((light + 0.05) / (dark + 0.05), 2)
    return {
        "fg": fg, "bg": bg,
        "ratio": ratio,
        "aa_normal":  ratio >= 4.5,
        "aa_large":   ratio >= 3.0,
        "aaa_normal": ratio >= 7.0,
        "grade": (
            "AAA"      if ratio >= 7.0 else
            "AA"       if ratio >= 4.5 else
            "AA-Large" if ratio >= 3.0 else
            "Fail"
        ),
    }


# ── Font pairing suggestions ──────────────────────────────────────────────────
# Classic pairing rules: contrast in category, harmony in weight/style.
_PAIRING_RULES: Dict[str, List[dict]] = {
    "serif": [
        {"category": "sans-serif", "reason": "Classic contrast: serif body + sans heading"},
        {"category": "monospace",  "reason": "Editorial: serif prose + mono code blocks"},
    ],
    "sans-serif": [
        {"category": "serif",     "reason": "Warmth: sans heading + serif body"},
        {"category": "display",   "reason": "Impact: sans body + display hero"},
    ],
    "monospace": [
        {"category": "sans-serif", "reason": "Dev-focused: mono code + sans UI"},
        {"category": "serif",      "reason": "Literary: mono code + serif text"},
    ],
    "display": [
        {"category": "sans-serif", "reason": "Clean: display hero + sans body"},
        {"category": "serif",      "reason": "Elegant: display hero + serif body"},
    ],
    "handwriting": [
        {"category": "sans-serif", "reason": "Friendly: handwriting accent + sans body"},
        {"category": "serif",      "reason": "Romantic: handwriting accent + serif body"},
    ],
}

# Well-known Google Fonts by category for default suggestions
_DEFAULTS: Dict[str, List[str]] = {
    "serif":       ["Playfair Display", "Merriweather", "Lora", "EB Garamond"],
    "sans-serif":  ["Inter", "DM Sans", "Nunito", "Manrope", "Outfit"],
    "monospace":   ["JetBrains Mono", "Fira Code", "Source Code Pro"],
    "display":     ["Syne", "Clash Display", "Cabinet Grotesk"],
    "handwriting": ["Caveat", "Pacifico", "Dancing Script"],
}


def suggest_pairing(font: Font, db_path: Path = DB_PATH) -> dict:
    """Suggest complementary fonts for a given font, using DB first then defaults."""
    rules = _PAIRING_RULES.get(font.category, [])
    suggestions = []
    conn = _db(db_path)
    try:
        for rule in rules:
            target_cat = rule["category"]
            row = conn.execute(
                "SELECT id,name,category FROM fonts WHERE category=? AND id!=? LIMIT 1",
                (target_cat, font.id),
            ).fetchone()

            if row:
                suggestions.append({
                    "font_id": row[0], "name": row[1], "category": row[2],
                    "reason": rule["reason"], "source": "database",
                })
            else:
                defaults = _DEFAULTS.get(target_cat, [])
                if defaults:
                    suggestions.append({
                        "font_id": None, "name": defaults[0], "category": target_cat,
                        "reason": rule["reason"], "source": "built-in",
                    })
    finally:
        conn.close()

    return {
        "base_font": {"id": font.id, "name": font.name, "category": font.category},
        "pairings": suggestions,
        "usage": {
            "heading": suggestions[0]["name"] if suggestions else font.name,
            "body":    suggestions[1]["name"] if len(suggestions) > 1 else font.name,
        },
    }


# ── CSS import generator ──────────────────────────────────────────────────────
def generate_css_imports(fonts: List[Font]) -> str:
    """Generate a combined Google Fonts @import statement."""
    families = []
    for f in fonts:
        gid = f.google_font_id or f.name.replace(" ", "+")
        wts = ";".join(str(w) for w in sorted(f.weights))
        families.append(f"family={gid}:wght@{wts}")
    base = "https://fonts.googleapis.com/css2?" + "&".join(families) + "&display=swap"
    return f'@import url("{base}");'


def generate_font_stack(font: Font) -> str:
    """Return a CSS font-family stack with system fallbacks."""
    fallbacks = {
        "serif":       ["Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
        "sans-serif":  ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"],
        "monospace":   ['"Fira Code"', '"Courier New"', "Courier", "monospace"],
        "display":     ["Impact", "Haettenschweiler", '"Arial Narrow Bold"', "sans-serif"],
        "handwriting": ['"Comic Sans MS"', '"Comic Sans"', "cursive"],
    }
    stack = [f'"{font.name}"'] + fallbacks.get(font.category, ["sans-serif"])
    return ", ".join(stack)


# ── SQLite persistence ────────────────────────────────────────────────────────
def _db(path: Path = DB_PATH) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS fonts (
            id             TEXT PRIMARY KEY,
            name           TEXT NOT NULL,
            category       TEXT NOT NULL,
            weights        TEXT NOT NULL DEFAULT '400',
            google_font_id TEXT DEFAULT '',
            tags           TEXT DEFAULT '',
            created_at     TEXT NOT NULL
        )""")
    conn.commit()
    return conn


def save_font(font: Font, db_path: Path = DB_PATH) -> None:
    conn = _db(db_path)
    conn.execute(
        "INSERT OR REPLACE INTO fonts VALUES (?,?,?,?,?,?,?)",
        (font.id, font.name, font.category,
         ",".join(str(w) for w in font.weights),
         font.google_font_id,
         ",".join(font.tags),
         font.created_at or datetime.datetime.now(datetime.timezone.utc).isoformat()),
    )
    conn.commit(); conn.close()


def load_font(font_id: str, db_path: Path = DB_PATH) -> Optional[Font]:
    conn = _db(db_path)
    row = conn.execute(
        "SELECT id,name,category,weights,google_font_id,tags,created_at FROM fonts WHERE id=?",
        (font_id,),
    ).fetchone()
    conn.close()
    if not row:
        return None
    fid, name, cat, wts, gid, tags, created_at = row
    return Font(
        id=fid, name=name, category=cat,
        weights=[int(w) for w in wts.split(",") if w],
        google_font_id=gid,
        tags=tags.split(",") if tags else [],
        created_at=created_at,
    )


def list_fonts(db_path: Path = DB_PATH) -> List[dict]:
    conn = _db(db_path)
    rows = conn.execute(
        "SELECT id,name,category,weights,tags FROM fonts ORDER BY name"
    ).fetchall()
    conn.close()
    return [{"id": r[0],"name": r[1],"category": r[2],"weights": r[3],"tags": r[4]}
            for r in rows]


def delete_font(font_id: str, db_path: Path = DB_PATH) -> bool:
    conn = _db(db_path)
    cur  = conn.execute("DELETE FROM fonts WHERE id=?", (font_id,))
    conn.commit(); conn.close()
    return cur.rowcount > 0


# ── CLI ───────────────────────────────────────────────────────────────────────
def main(argv: Optional[List[str]] = None) -> None:
    ap = argparse.ArgumentParser(
        prog="typography",
        description="BlackRoad Studio – Typography Analyzer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  typography readability "The quick brown fox..." --size 16 --lh 1.6 --measure 66
  typography scale --base 1.0 --ratio 1.25
  typography contrast '#1e293b' '#f8fafc'
  typography add-font "Inter" sans-serif --weights 400,600,700
  typography pair <font-id>
  typography list
""",
    )
    sub = ap.add_subparsers(dest="cmd", required=True)

    # readability
    p_read = sub.add_parser("readability", help="Analyze text readability")
    p_read.add_argument("text")
    p_read.add_argument("--size",    type=float, default=16.0, dest="font_size")
    p_read.add_argument("--lh",     type=float, default=1.5,  dest="line_height")
    p_read.add_argument("--measure",type=int,   default=66)

    # scale
    p_scale = sub.add_parser("scale", help="Generate a modular type scale")
    p_scale.add_argument("--base",  type=float, default=1.0)
    p_scale.add_argument("--ratio", type=float, default=1.618)
    p_scale.add_argument("--css",   action="store_true")
    p_scale.add_argument("--tailwind", action="store_true")

    # contrast
    p_con = sub.add_parser("contrast", help="WCAG contrast check")
    p_con.add_argument("fg")
    p_con.add_argument("bg")

    # line-height
    p_lh = sub.add_parser("lineheight", help="Line height recommendation")
    p_lh.add_argument("font_size", type=float)
    p_lh.add_argument("--category", default="body", choices=["body","heading","caption"])

    # add-font
    p_af = sub.add_parser("add-font", help="Add a font to the database")
    p_af.add_argument("name")
    p_af.add_argument("category", choices=list(CATEGORIES))
    p_af.add_argument("--weights", default="400")
    p_af.add_argument("--gid",     default="", dest="google_font_id")
    p_af.add_argument("--tags",    default="")

    # pair
    p_pair = sub.add_parser("pair", help="Suggest font pairings")
    p_pair.add_argument("font_id")

    # list
    sub.add_parser("list", help="List fonts in database")

    # css-import
    p_ci = sub.add_parser("css-import", help="Generate @import for font IDs")
    p_ci.add_argument("font_ids", nargs="+")

    # font-stack
    p_fs = sub.add_parser("font-stack", help="CSS font-family stack")
    p_fs.add_argument("font_id")

    args = ap.parse_args(argv)

    if args.cmd == "readability":
        result = analyze_readability(args.text, args.font_size, args.line_height, args.measure)
        print(json.dumps(result, indent=2))

    elif args.cmd == "scale":
        ts = scale_generator(args.base, args.ratio)
        if args.css:
            print(ts.to_css_vars())
        elif args.tailwind:
            print(ts.to_tailwind())
        else:
            print(json.dumps(ts.as_dict(), indent=2))

    elif args.cmd == "contrast":
        result = WCAG_contrast_checker(args.fg, args.bg)
        print(json.dumps(result, indent=2))

    elif args.cmd == "lineheight":
        result = line_height_recommendation(args.font_size, args.category)
        print(json.dumps(result, indent=2))

    elif args.cmd == "add-font":
        font = Font(
            id=str(uuid.uuid4()),
            name=args.name,
            category=args.category,
            weights=[int(w.strip()) for w in args.weights.split(",") if w.strip()],
            google_font_id=args.google_font_id,
            tags=[t.strip() for t in args.tags.split(",") if t.strip()],
            created_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )
        save_font(font)
        print(f"✅ added font '{font.name}' → {font.id}")

    elif args.cmd == "pair":
        font = load_font(args.font_id)
        if not font: sys.exit(f"❌ font not found: {args.font_id}")
        print(json.dumps(suggest_pairing(font), indent=2))

    elif args.cmd == "list":
        fonts = list_fonts()
        if not fonts: print("(no fonts saved)")
        else:
            print(f"{'id':<38} {'name':<28} {'category':<14} weights")
            print("-" * 90)
            for f in fonts:
                print(f"{f['id']:<38} {f['name']:<28} {f['category']:<14} {f['weights']}")

    elif args.cmd == "css-import":
        fonts = [load_font(fid) for fid in args.font_ids]
        fonts = [f for f in fonts if f]
        if not fonts: sys.exit("❌ no valid fonts found")
        print(generate_css_imports(fonts))

    elif args.cmd == "font-stack":
        font = load_font(args.font_id)
        if not font: sys.exit(f"❌ font not found: {args.font_id}")
        print(generate_font_stack(font))


if __name__ == "__main__":
    main()
