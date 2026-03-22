#!/usr/bin/env python3
"""
BlackRoad Studio – Design Token Manager
Manage, version, validate, diff, and export design tokens
across CSS custom properties, JavaScript ES modules, and Tailwind config.
SQLite persistence + JSON snapshot export.
"""
from __future__ import annotations

import json
import os
import re
import sqlite3
import sys
import uuid
import argparse
import datetime
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional, Tuple

# ── Constants ─────────────────────────────────────────────────────────────────
CATEGORIES = ("color", "spacing", "typography", "shadow", "radius",
              "opacity", "z-index", "breakpoint", "motion", "border")

DB_PATH = Path(os.environ.get("TOKEN_DB", Path.home() / ".blackroad" / "design-tokens.db"))

# ── Data models ───────────────────────────────────────────────────────────────
@dataclass
class Token:
    id: str
    name: str
    category: str
    value: str
    description: str = ""
    aliases: List[str] = field(default_factory=list)   # other names this token is known by
    deprecated: bool = False
    deprecated_reason: str = ""
    tags: List[str] = field(default_factory=list)
    created_at: str = ""
    updated_at: str = ""
    version: int = 1

    def to_css_var(self, prefix: str = "--br") -> str:
        slug = _slug(self.name)
        return f"{prefix}-{slug}"

    def to_js_key(self) -> str:
        return _camel(self.name)

    def validate(self) -> List[str]:
        """Return list of validation error strings (empty = valid)."""
        errors: List[str] = []
        if not self.name:
            errors.append("name is required")
        if not re.match(r"^[a-z0-9][a-z0-9\-./]*$", self.name.lower()):
            errors.append(f"name '{self.name}' must be lowercase, digits, hyphens, dots or slashes")
        if self.category not in CATEGORIES:
            errors.append(f"category '{self.category}' must be one of {CATEGORIES}")
        if not self.value:
            errors.append("value is required")
        # Category-specific validation
        if self.category == "color" and not _is_valid_color(self.value):
            errors.append(f"value '{self.value}' doesn't look like a valid color")
        if self.category == "spacing":
            if not re.match(r"^[\d.]+(?:px|rem|em|%|vw|vh)$", self.value.strip()):
                if not self.value.startswith("var("):
                    errors.append(f"spacing value '{self.value}' should include a unit (px/rem/em)")
        return errors


@dataclass
class TokenSet:
    """A versioned snapshot of all tokens."""
    version: str
    name: str
    tokens: List[Token]
    created_at: str
    description: str = ""

    def to_dict(self) -> dict:
        return {
            "version": self.version,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at,
            "tokens": [asdict(t) for t in self.tokens],
            "metadata": {
                "count": len(self.tokens),
                "categories": _count_categories(self.tokens),
                "deprecated_count": sum(1 for t in self.tokens if t.deprecated),
            },
        }


# ── Utility helpers ───────────────────────────────────────────────────────────
def _slug(name: str) -> str:
    return name.lower().replace("/", "-").replace(".", "-").replace(" ", "-")


def _camel(name: str) -> str:
    parts = re.split(r"[-/. ]+", name)
    return parts[0].lower() + "".join(p.title() for p in parts[1:])


def _is_valid_color(value: str) -> bool:
    patterns = [
        r"^#([0-9a-fA-F]{3}){1,2}$",
        r"^#[0-9a-fA-F]{8}$",
        r"^rgb\(", r"^rgba\(", r"^hsl\(", r"^hsla\(",
        r"^oklch\(", r"^color\(",
        r"^var\(--",
        r"^transparent$", r"^currentColor$", r"^inherit$",
    ]
    return any(re.match(p, value.strip(), re.IGNORECASE) for p in patterns)


def _count_categories(tokens: List[Token]) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for t in tokens:
        counts[t.category] = counts.get(t.category, 0) + 1
    return counts


def _now() -> str:
    return datetime.datetime.utcnow().isoformat()


# ── Token CRUD ────────────────────────────────────────────────────────────────
def _db(path: Path = DB_PATH) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS tokens (
            id           TEXT PRIMARY KEY,
            name         TEXT NOT NULL UNIQUE,
            category     TEXT NOT NULL,
            value        TEXT NOT NULL,
            description  TEXT DEFAULT '',
            aliases      TEXT DEFAULT '',
            deprecated   INTEGER DEFAULT 0,
            deprecated_reason TEXT DEFAULT '',
            tags         TEXT DEFAULT '',
            created_at   TEXT NOT NULL,
            updated_at   TEXT NOT NULL,
            version      INTEGER DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS token_snapshots (
            id           TEXT PRIMARY KEY,
            version      TEXT NOT NULL,
            name         TEXT NOT NULL,
            description  TEXT DEFAULT '',
            data         TEXT NOT NULL,
            created_at   TEXT NOT NULL
        );
    """)
    conn.commit()
    return conn


def _row_to_token(row: tuple) -> Token:
    (tid, name, cat, val, desc, aliases, deprecated,
     dep_reason, tags, created_at, updated_at, version) = row
    return Token(
        id=tid, name=name, category=cat, value=val,
        description=desc,
        aliases=aliases.split(",") if aliases else [],
        deprecated=bool(deprecated),
        deprecated_reason=dep_reason,
        tags=tags.split(",") if tags else [],
        created_at=created_at, updated_at=updated_at,
        version=version,
    )


def add_token(token: Token, db_path: Path = DB_PATH) -> Token:
    """Insert a new token. Raises ValueError if name already exists."""
    errors = token.validate()
    if errors:
        raise ValueError("Token validation failed: " + "; ".join(errors))
    conn = _db(db_path)
    now  = _now()
    token.created_at = token.created_at or now
    token.updated_at = now
    try:
        conn.execute(
            "INSERT INTO tokens VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            (token.id, token.name, token.category, token.value,
             token.description, ",".join(token.aliases),
             int(token.deprecated), token.deprecated_reason,
             ",".join(token.tags), token.created_at, token.updated_at,
             token.version),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise ValueError(f"Token with name '{token.name}' already exists")
    finally:
        conn.close()
    return token


def update_token(name_or_id: str, db_path: Path = DB_PATH, **fields) -> Token:
    """Update mutable fields on an existing token."""
    conn = _db(db_path)
    row  = conn.execute(
        "SELECT * FROM tokens WHERE id=? OR name=?", (name_or_id, name_or_id)
    ).fetchone()
    if not row:
        conn.close()
        raise KeyError(f"Token not found: {name_or_id!r}")
    token = _row_to_token(row)

    for k, v in fields.items():
        if hasattr(token, k):
            setattr(token, k, v)
    token.updated_at = _now()
    token.version   += 1

    errors = token.validate()
    if errors:
        conn.close()
        raise ValueError("Validation failed: " + "; ".join(errors))

    conn.execute(
        """UPDATE tokens SET
           category=?, value=?, description=?, aliases=?,
           deprecated=?, deprecated_reason=?, tags=?,
           updated_at=?, version=?
           WHERE id=?""",
        (token.category, token.value, token.description, ",".join(token.aliases),
         int(token.deprecated), token.deprecated_reason, ",".join(token.tags),
         token.updated_at, token.version, token.id),
    )
    conn.commit(); conn.close()
    return token


def get_token(name_or_id: str, db_path: Path = DB_PATH) -> Optional[Token]:
    conn = _db(db_path)
    row  = conn.execute(
        "SELECT * FROM tokens WHERE id=? OR name=?", (name_or_id, name_or_id)
    ).fetchone()
    conn.close()
    return _row_to_token(row) if row else None


def delete_token(name_or_id: str, db_path: Path = DB_PATH) -> bool:
    conn = _db(db_path)
    cur  = conn.execute("DELETE FROM tokens WHERE id=? OR name=?", (name_or_id, name_or_id))
    conn.commit(); conn.close()
    return cur.rowcount > 0


def list_tokens(
    category: Optional[str] = None,
    include_deprecated: bool = True,
    db_path: Path = DB_PATH,
) -> List[Token]:
    conn = _db(db_path)
    q    = "SELECT * FROM tokens"
    params: List[Any] = []
    clauses = []
    if category:
        clauses.append("category=?"); params.append(category)
    if not include_deprecated:
        clauses.append("deprecated=0")
    if clauses:
        q += " WHERE " + " AND ".join(clauses)
    q += " ORDER BY category, name"
    rows = conn.execute(q, params).fetchall()
    conn.close()
    return [_row_to_token(r) for r in rows]


# ── Bulk import ───────────────────────────────────────────────────────────────
def import_json(path: str, db_path: Path = DB_PATH) -> Tuple[int, int, List[str]]:
    """
    Import tokens from a JSON file (W3C Design Token format or flat object).
    Returns (added, skipped, errors).
    """
    with open(path) as f:
        data = json.load(f)

    tokens_data = data.get("tokens", data)  # support both wrapped and flat
    added, skipped = 0, 0
    errors: List[str] = []

    for name, spec in tokens_data.items():
        if not isinstance(spec, dict):
            continue
        value    = spec.get("$value", spec.get("value", ""))
        category = spec.get("$type", spec.get("category", "color"))
        if category not in CATEGORIES:
            category = "color"
        t = Token(
            id=str(uuid.uuid4()), name=name, category=category,
            value=str(value),
            description=spec.get("$description", spec.get("description", "")),
            tags=spec.get("tags", []),
            created_at=_now(), updated_at=_now(),
        )
        try:
            add_token(t, db_path)
            added += 1
        except ValueError as e:
            if "already exists" in str(e):
                skipped += 1
            else:
                errors.append(str(e))

    return added, skipped, errors


# ── Export functions ──────────────────────────────────────────────────────────
def export_css(
    prefix: str = "--br",
    category: Optional[str] = None,
    include_deprecated: bool = False,
    db_path: Path = DB_PATH,
) -> str:
    tokens = list_tokens(category, include_deprecated, db_path)
    if not tokens:
        return "/* No tokens found */"

    by_cat: Dict[str, List[Token]] = {}
    for t in tokens:
        by_cat.setdefault(t.category, []).append(t)

    lines = [":root {"]
    for cat in sorted(by_cat):
        lines.append(f"  /* {cat.upper()} */")
        for t in by_cat[cat]:
            var = t.to_css_var(prefix)
            dep = "  /* @deprecated */" if t.deprecated else ""
            comment = f"  /* {t.description} */" if t.description else ""
            if comment: lines.append(comment)
            lines.append(f"  {var}: {t.value};{dep}")
            for alias in t.aliases:
                lines.append(f"  {prefix}-{_slug(alias)}: var({var}); /* alias */")
        lines.append("")
    lines.append("}")
    return "\n".join(lines)


def export_js(
    module_name: str = "tokens",
    category: Optional[str] = None,
    db_path: Path = DB_PATH,
) -> str:
    tokens = list_tokens(category, include_deprecated=False, db_path=db_path)
    by_cat: Dict[str, List[Token]] = {}
    for t in tokens:
        by_cat.setdefault(t.category, []).append(t)

    lines = [
        f"// Design Tokens – generated {_now()}",
        f"// DO NOT EDIT – use design_token_manager.py export-js",
        "",
    ]
    for cat in sorted(by_cat):
        lines.append(f"// {cat.upper()}")
        for t in by_cat[cat]:
            key = t.to_js_key()
            if t.description:
                lines.append(f"/** {t.description} */")
            lines.append(f"export const {key} = {json.dumps(t.value)};")
        lines.append("")

    # Also export a grouped object
    lines += ["/** All tokens grouped by category */", "export const tokens = {"]
    for cat in sorted(by_cat):
        lines.append(f"  {cat}: {{")
        for t in by_cat[cat]:
            lines.append(f"    {t.to_js_key()}: {json.dumps(t.value)},")
        lines.append("  },")
    lines.append("};")
    return "\n".join(lines)


def export_tailwind_config(db_path: Path = DB_PATH) -> str:
    tokens = list_tokens(include_deprecated=False, db_path=db_path)

    tw: Dict[str, dict] = {
        "colors": {}, "spacing": {}, "fontSize": {},
        "borderRadius": {}, "boxShadow": {}, "opacity": {},
        "zIndex": {}, "screens": {}, "transitionDuration": {},
    }

    _CAT_MAP = {
        "color":      ("colors",             lambda t: t.value),
        "spacing":    ("spacing",            lambda t: t.value),
        "typography": ("fontSize",           lambda t: t.value),
        "radius":     ("borderRadius",       lambda t: t.value),
        "shadow":     ("boxShadow",          lambda t: t.value),
        "opacity":    ("opacity",            lambda t: t.value),
        "z-index":    ("zIndex",             lambda t: t.value),
        "breakpoint": ("screens",            lambda t: t.value),
        "motion":     ("transitionDuration", lambda t: t.value),
    }

    for t in tokens:
        if t.category in _CAT_MAP:
            tw_key, extractor = _CAT_MAP[t.category]
            slug = _slug(t.name).split("-")[-1]  # use last segment as Tailwind key
            tw[tw_key][slug] = extractor(t)

    # Remove empty sections
    tw = {k: v for k, v in tw.items() if v}

    lines = [
        "/** @type {import('tailwindcss').Config} */",
        "/** Generated by BlackRoad Studio Design Token Manager */",
        f"/** {_now()} */",
        "module.exports = {",
        "  theme: {",
        "    extend: {",
    ]
    for key, vals in tw.items():
        lines.append(f"      {key}: {{")
        for k, v in sorted(vals.items()):
            lines.append(f"        '{k}': '{v}',")
        lines.append("      },")
    lines += ["    },", "  },", "};"]
    return "\n".join(lines)


def export_json_snapshot(
    version: str = "",
    name: str = "snapshot",
    description: str = "",
    db_path: Path = DB_PATH,
) -> str:
    tokens  = list_tokens(db_path=db_path)
    version = version or datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
    ts = TokenSet(
        version=version, name=name, tokens=tokens,
        created_at=_now(), description=description,
    )
    return json.dumps(ts.to_dict(), indent=2)


def save_snapshot(version: str, name: str, description: str = "", db_path: Path = DB_PATH) -> str:
    data = export_json_snapshot(version, name, description, db_path)
    conn = _db(db_path)
    sid  = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO token_snapshots VALUES (?,?,?,?,?,?)",
        (sid, version, name, description, data, _now()),
    )
    conn.commit(); conn.close()
    return sid


def list_snapshots(db_path: Path = DB_PATH) -> List[dict]:
    conn = _db(db_path)
    rows = conn.execute(
        "SELECT id,version,name,description,created_at FROM token_snapshots ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [{"id": r[0],"version": r[1],"name": r[2],"description": r[3],"created_at": r[4]}
            for r in rows]


# ── Diff ──────────────────────────────────────────────────────────────────────
def _load_snapshot_tokens(snapshot_id: str, db_path: Path = DB_PATH) -> Dict[str, Token]:
    conn = _db(db_path)
    row  = conn.execute("SELECT data FROM token_snapshots WHERE id=? OR version=?",
                        (snapshot_id, snapshot_id)).fetchone()
    conn.close()
    if not row:
        raise KeyError(f"Snapshot not found: {snapshot_id!r}")
    data   = json.loads(row[0])
    return {t["name"]: Token(**{k: v for k, v in t.items()
                                if k in Token.__dataclass_fields__})
            for t in data.get("tokens", [])}


def diff(snapshot_id_a: str, snapshot_id_b: str, db_path: Path = DB_PATH) -> dict:
    """Diff two snapshots or a snapshot against current DB ('current' keyword)."""
    def _get(sid: str) -> Dict[str, Token]:
        if sid == "current":
            return {t.name: t for t in list_tokens(db_path=db_path)}
        return _load_snapshot_tokens(sid, db_path)

    a, b = _get(snapshot_id_a), _get(snapshot_id_b)
    added     = {n: asdict(b[n]) for n in b if n not in a}
    removed   = {n: asdict(a[n]) for n in a if n not in b}
    changed   = {}
    unchanged = 0
    for n in set(a) & set(b):
        ta, tb = a[n], b[n]
        if ta.value != tb.value or ta.category != tb.category or ta.deprecated != tb.deprecated:
            changed[n] = {
                "before": {"value": ta.value, "category": ta.category, "deprecated": ta.deprecated},
                "after":  {"value": tb.value, "category": tb.category, "deprecated": tb.deprecated},
            }
        else:
            unchanged += 1

    return {
        "a": snapshot_id_a,
        "b": snapshot_id_b,
        "summary": {
            "added": len(added), "removed": len(removed),
            "changed": len(changed), "unchanged": unchanged,
        },
        "added": added,
        "removed": removed,
        "changed": changed,
    }


# ── Validate all ─────────────────────────────────────────────────────────────
def validate_all(db_path: Path = DB_PATH) -> dict:
    tokens = list_tokens(db_path=db_path)
    results = {"valid": [], "invalid": [], "deprecated": []}
    for t in tokens:
        errors = t.validate()
        if t.deprecated:
            results["deprecated"].append({"name": t.name, "reason": t.deprecated_reason})
        if errors:
            results["invalid"].append({"name": t.name, "errors": errors})
        else:
            results["valid"].append(t.name)
    results["summary"] = {
        "total": len(tokens),
        "valid": len(results["valid"]),
        "invalid": len(results["invalid"]),
        "deprecated": len(results["deprecated"]),
    }
    return results


# ── Seed with BlackRoad design system defaults ────────────────────────────────
SEED_TOKENS: List[dict] = [
    # Colors — BlackRoad brand
    {"name": "color/brand/primary",    "category": "color",    "value": "#FF1D6C", "description": "Hot Pink – primary brand"},
    {"name": "color/brand/secondary",  "category": "color",    "value": "#2979FF", "description": "Electric Blue"},
    {"name": "color/brand/accent",     "category": "color",    "value": "#F5A623", "description": "Amber"},
    {"name": "color/brand/violet",     "category": "color",    "value": "#9C27B0", "description": "Violet"},
    {"name": "color/text/primary",     "category": "color",    "value": "#0F0F0F", "description": "Near-black body text"},
    {"name": "color/text/secondary",   "category": "color",    "value": "#4B5563", "description": "Muted text"},
    {"name": "color/bg/base",          "category": "color",    "value": "#FFFFFF", "description": "Page background"},
    {"name": "color/bg/surface",       "category": "color",    "value": "#F9FAFB", "description": "Card / panel background"},
    {"name": "color/semantic/success", "category": "color",    "value": "#16A34A", "description": "Success green"},
    {"name": "color/semantic/error",   "category": "color",    "value": "#DC2626", "description": "Error red"},
    {"name": "color/semantic/warning", "category": "color",    "value": "#D97706", "description": "Warning amber"},
    # Spacing — 8pt grid
    {"name": "spacing/1",  "category": "spacing", "value": "4px",   "description": "4px = half-unit"},
    {"name": "spacing/2",  "category": "spacing", "value": "8px",   "description": "8px = 1 unit"},
    {"name": "spacing/3",  "category": "spacing", "value": "12px",  "description": "12px"},
    {"name": "spacing/4",  "category": "spacing", "value": "16px",  "description": "16px = 2 units"},
    {"name": "spacing/6",  "category": "spacing", "value": "24px",  "description": "24px"},
    {"name": "spacing/8",  "category": "spacing", "value": "32px",  "description": "32px = 4 units"},
    {"name": "spacing/12", "category": "spacing", "value": "48px",  "description": "48px"},
    {"name": "spacing/16", "category": "spacing", "value": "64px",  "description": "64px"},
    # Radius
    {"name": "radius/sm",  "category": "radius",  "value": "4px",   "description": "Small radius"},
    {"name": "radius/md",  "category": "radius",  "value": "8px",   "description": "Medium radius"},
    {"name": "radius/lg",  "category": "radius",  "value": "12px",  "description": "Large radius"},
    {"name": "radius/xl",  "category": "radius",  "value": "16px",  "description": "XL radius"},
    {"name": "radius/full","category": "radius",  "value": "9999px","description": "Pill / full round"},
    # Typography
    {"name": "typography/size/xs",  "category": "typography", "value": "0.75rem",  "description": "12px"},
    {"name": "typography/size/sm",  "category": "typography", "value": "0.875rem", "description": "14px"},
    {"name": "typography/size/md",  "category": "typography", "value": "1rem",     "description": "16px base"},
    {"name": "typography/size/lg",  "category": "typography", "value": "1.125rem", "description": "18px"},
    {"name": "typography/size/xl",  "category": "typography", "value": "1.25rem",  "description": "20px"},
    {"name": "typography/size/2xl", "category": "typography", "value": "1.5rem",   "description": "24px"},
    {"name": "typography/size/4xl", "category": "typography", "value": "2.25rem",  "description": "36px"},
    # Shadow
    {"name": "shadow/sm",  "category": "shadow",  "value": "0 1px 2px rgba(0,0,0,0.05)", "description": "Subtle shadow"},
    {"name": "shadow/md",  "category": "shadow",  "value": "0 4px 6px -1px rgba(0,0,0,0.1)", "description": "Card shadow"},
    {"name": "shadow/lg",  "category": "shadow",  "value": "0 10px 15px -3px rgba(0,0,0,0.1)", "description": "Modal shadow"},
    {"name": "shadow/xl",  "category": "shadow",  "value": "0 20px 25px -5px rgba(0,0,0,0.1)", "description": "Overlay shadow"},
]


def seed_defaults(db_path: Path = DB_PATH) -> int:
    added = 0
    for spec in SEED_TOKENS:
        t = Token(
            id=str(uuid.uuid4()),
            name=spec["name"],
            category=spec["category"],
            value=spec["value"],
            description=spec.get("description", ""),
            created_at=_now(), updated_at=_now(),
        )
        try:
            add_token(t, db_path)
            added += 1
        except ValueError:
            pass  # already exists
    return added


# ── CLI ───────────────────────────────────────────────────────────────────────
def main(argv: Optional[List[str]] = None) -> None:
    ap = argparse.ArgumentParser(
        prog="tokens",
        description="BlackRoad Studio – Design Token Manager",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  tokens seed
  tokens add color/brand/blue '#3b82f6' color --desc 'Blue 500'
  tokens get color/brand/blue
  tokens list --category color
  tokens export-css --prefix '--ds'
  tokens export-js
  tokens export-tailwind
  tokens snapshot --version v1.0.0 --name 'Initial release'
  tokens diff <snap-id-a> current
  tokens validate
""",
    )
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("seed", help="Seed with BlackRoad default tokens")

    p_add = sub.add_parser("add", help="Add a new token")
    p_add.add_argument("name")
    p_add.add_argument("value")
    p_add.add_argument("category", choices=list(CATEGORIES))
    p_add.add_argument("--desc",  default="", dest="description")
    p_add.add_argument("--aliases", default="")
    p_add.add_argument("--tags",    default="")

    p_upd = sub.add_parser("update", help="Update a token by name or id")
    p_upd.add_argument("name_or_id")
    p_upd.add_argument("--value",    default=None)
    p_upd.add_argument("--desc",     default=None, dest="description")
    p_upd.add_argument("--deprecate",action="store_true")
    p_upd.add_argument("--dep-reason",default="", dest="deprecated_reason")

    p_get = sub.add_parser("get", help="Get a token by name or id")
    p_get.add_argument("name_or_id")

    p_del = sub.add_parser("delete", help="Delete a token")
    p_del.add_argument("name_or_id")

    p_ls = sub.add_parser("list", help="List tokens")
    p_ls.add_argument("--category", default=None, choices=list(CATEGORIES) + [None])
    p_ls.add_argument("--no-deprecated", action="store_true")

    p_css = sub.add_parser("export-css", help="Export as CSS custom properties")
    p_css.add_argument("--prefix",   default="--br")
    p_css.add_argument("--category", default=None)

    p_js = sub.add_parser("export-js",       help="Export as ES module")
    p_js.add_argument("--category", default=None)

    sub.add_parser("export-tailwind", help="Export as Tailwind config")

    p_snap = sub.add_parser("snapshot", help="Save a versioned snapshot")
    p_snap.add_argument("--version",     default="")
    p_snap.add_argument("--name",        default="snapshot")
    p_snap.add_argument("--description", default="")

    sub.add_parser("snapshots", help="List snapshots")

    p_diff = sub.add_parser("diff", help="Diff two snapshots (use 'current' for live DB)")
    p_diff.add_argument("a")
    p_diff.add_argument("b")

    sub.add_parser("validate", help="Validate all tokens")

    p_imp = sub.add_parser("import", help="Import tokens from JSON file")
    p_imp.add_argument("path", help="Path to JSON file")

    args = ap.parse_args(argv)

    if args.cmd == "seed":
        n = seed_defaults()
        print(f"✅ seeded {n} default tokens")

    elif args.cmd == "add":
        t = Token(
            id=str(uuid.uuid4()), name=args.name, value=args.value,
            category=args.category, description=args.description,
            aliases=[a.strip() for a in args.aliases.split(",") if a.strip()],
            tags=[t.strip() for t in args.tags.split(",") if t.strip()],
            created_at=_now(), updated_at=_now(),
        )
        add_token(t)
        print(f"✅ added token '{t.name}' → {t.id}")

    elif args.cmd == "update":
        fields = {}
        if args.value       is not None: fields["value"]      = args.value
        if args.description is not None: fields["description"]= args.description
        if args.deprecate:
            fields["deprecated"]        = True
            fields["deprecated_reason"] = args.deprecated_reason
        t = update_token(args.name_or_id, **fields)  # uses global DB_PATH
        print(f"✅ updated '{t.name}' (v{t.version})")

    elif args.cmd == "get":
        t = get_token(args.name_or_id)
        if not t: sys.exit(f"❌ not found: {args.name_or_id}")
        print(json.dumps(asdict(t), indent=2))

    elif args.cmd == "delete":
        ok = delete_token(args.name_or_id)
        print(f"✅ deleted" if ok else f"❌ not found: {args.name_or_id}")
        if not ok: sys.exit(1)

    elif args.cmd == "list":
        tokens = list_tokens(args.category, not args.no_deprecated)
        if not tokens: print("(no tokens)")
        else:
            print(f"{'name':<40} {'category':<14} {'value':<30} dep")
            print("-" * 90)
            for t in tokens:
                dep = "⚠️" if t.deprecated else ""
                print(f"{t.name:<40} {t.category:<14} {t.value:<30} {dep}")

    elif args.cmd == "export-css":
        print(export_css(args.prefix, args.category))

    elif args.cmd == "export-js":
        print(export_js(category=args.category))

    elif args.cmd == "export-tailwind":
        print(export_tailwind_config())

    elif args.cmd == "snapshot":
        sid = save_snapshot(args.version, args.name, args.description)
        print(f"✅ snapshot saved → {sid}")

    elif args.cmd == "snapshots":
        rows = list_snapshots()
        if not rows: print("(no snapshots)")
        else:
            print(f"{'id':<38} {'version':<16} name")
            print("-" * 75)
            for r in rows:
                print(f"{r['id']:<38} {r['version']:<16} {r['name']}")

    elif args.cmd == "diff":
        result = diff(args.a, args.b)
        print(json.dumps(result, indent=2))

    elif args.cmd == "validate":
        result = validate_all()
        print(json.dumps(result, indent=2))
        if result["summary"]["invalid"]:
            sys.exit(1)

    elif args.cmd == "import":
        added, skipped, errors = import_json(args.path)
        print(f"✅ imported {added} tokens, {skipped} skipped, {len(errors)} errors")
        for e in errors:
            print(f"  ❌ {e}")


if __name__ == "__main__":
    main()
