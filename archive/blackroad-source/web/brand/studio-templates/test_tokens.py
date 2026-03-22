"""Tests for design_token_manager.py"""
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
import pytest
from design_token_manager import (
    Token, _slug, _camel, _is_valid_color,
    add_token, update_token, get_token, delete_token, list_tokens,
    export_css, export_js, export_tailwind_config, export_json_snapshot,
    save_snapshot, list_snapshots, diff, validate_all, seed_defaults,
    import_json, _now,
)
import uuid, datetime


# ── Utilities ─────────────────────────────────────────────────────────────────
def test_slug_simple():
    assert _slug("color/brand") == "color-brand"

def test_slug_spaces():
    assert _slug("my token") == "my-token"

def test_camel_hyphen():
    assert _camel("font-size") == "fontSize"

def test_camel_slash():
    assert _camel("color/brand/primary") == "colorBrandPrimary"

def test_is_valid_color_hex():
    assert _is_valid_color("#3b82f6")
    assert _is_valid_color("#fff")
    assert _is_valid_color("#3b82f6ff")

def test_is_valid_color_rgb():
    assert _is_valid_color("rgb(59,130,246)")
    assert _is_valid_color("rgba(0,0,0,0.5)")

def test_is_valid_color_hsl():
    assert _is_valid_color("hsl(220, 90%, 60%)")

def test_is_valid_color_var():
    assert _is_valid_color("var(--color-primary)")

def test_is_valid_color_invalid():
    assert not _is_valid_color("blue")   # named colors are ambiguous
    assert not _is_valid_color("not-a-color")


# ── Token dataclass ───────────────────────────────────────────────────────────
def make_token(**kw) -> Token:
    d = dict(
        id=str(uuid.uuid4()), name="color/test", category="color",
        value="#3b82f6", description="Test",
        created_at=_now(), updated_at=_now(),
    )
    d.update(kw)
    return Token(**d)

def test_token_to_css_var():
    t = make_token(name="color/brand/primary")
    assert t.to_css_var() == "--br-color-brand-primary"

def test_token_to_css_var_custom_prefix():
    t = make_token(name="spacing/4")
    assert t.to_css_var("--ds") == "--ds-spacing-4"

def test_token_to_js_key():
    t = make_token(name="color/brand/primary")
    assert t.to_js_key() == "colorBrandPrimary"

def test_token_validate_valid():
    t = make_token(name="color/brand", category="color", value="#ff0000")
    assert t.validate() == []

def test_token_validate_missing_name():
    t = make_token(name="")
    errors = t.validate()
    assert any("name" in e for e in errors)

def test_token_validate_bad_category():
    t = make_token(category="weird")
    errors = t.validate()
    assert any("category" in e for e in errors)

def test_token_validate_bad_color():
    t = make_token(category="color", value="notacolor")
    errors = t.validate()
    assert any("color" in e for e in errors)

def test_token_validate_spacing_unit():
    t = make_token(category="spacing", value="16px")
    assert t.validate() == []

def test_token_validate_spacing_no_unit():
    t = make_token(category="spacing", value="16")
    errors = t.validate()
    assert any("unit" in e for e in errors)


# ── CRUD ──────────────────────────────────────────────────────────────────────
@pytest.fixture
def db(tmp_path):
    return tmp_path / "test_tokens.db"

def test_add_and_get(db):
    t = make_token(name="color/test-add", value="#ff0000")
    add_token(t, db)
    loaded = get_token(t.id, db)
    assert loaded is not None
    assert loaded.name == "color/test-add"

def test_add_duplicate_raises(db):
    t = make_token(name="color/dupe")
    add_token(t, db)
    t2 = make_token(name="color/dupe")
    with pytest.raises(ValueError, match="already exists"):
        add_token(t2, db)

def test_get_by_name(db):
    t = make_token(name="spacing/test-4", category="spacing", value="16px")
    add_token(t, db)
    loaded = get_token("spacing/test-4", db)
    assert loaded is not None

def test_get_missing(db):
    assert get_token("no-such", db) is None

def test_delete(db):
    t = make_token(name="color/del")
    add_token(t, db)
    assert delete_token(t.id, db)
    assert get_token(t.id, db) is None

def test_delete_missing(db):
    assert not delete_token("ghost", db)

def test_list_by_category(db):
    add_token(make_token(name="color/a",   category="color",   value="#ff0000"), db)
    add_token(make_token(name="spacing/a", category="spacing", value="8px"),     db)
    colors = list_tokens("color", db_path=db)
    assert all(t.category == "color" for t in colors)


# ── Update ────────────────────────────────────────────────────────────────────
def test_update_value(db):
    t = make_token(name="color/upd")
    add_token(t, db)
    updated = update_token(t.id, db_path=db, value="#000000")
    assert updated.value == "#000000"
    assert updated.version == 2

def test_update_deprecate(db):
    t = make_token(name="color/dep")
    add_token(t, db)
    updated = update_token(t.id, db_path=db, deprecated=True, deprecated_reason="Use new token")
    assert updated.deprecated is True


# ── Exports ───────────────────────────────────────────────────────────────────
def test_export_css_contains_root(db):
    add_token(make_token(name="color/css-test", value="#abc123"), db)
    css = export_css(db_path=db)
    assert ":root {" in css
    assert "--br-color-css-test" in css

def test_export_css_deprecated_excluded_by_default(db):
    t = make_token(name="color/old", value="#999")
    add_token(t, db)
    update_token(t.id, db_path=db, deprecated=True)
    css = export_css(include_deprecated=False, db_path=db)
    assert "color-old" not in css

def test_export_js_structure(db):
    add_token(make_token(name="color/js-test", value="#fff"), db)
    js = export_js(db_path=db)
    assert "export const" in js
    assert "tokens" in js

def test_export_tailwind_structure(db):
    add_token(make_token(name="color/tw-test", value="#ff0"), db)
    tw = export_tailwind_config(db_path=db)
    assert "module.exports" in tw
    assert "theme" in tw

def test_export_json_snapshot(db):
    add_token(make_token(name="color/snap", value="#f00"), db)
    data = json.loads(export_json_snapshot(db_path=db))
    assert "tokens" in data
    assert "metadata" in data


# ── Snapshot + diff ───────────────────────────────────────────────────────────
def test_save_and_list_snapshots(db):
    add_token(make_token(name="color/s1", value="#aaa"), db)
    sid = save_snapshot("v1", "snap1", db_path=db)
    snaps = list_snapshots(db)
    assert any(s["id"] == sid for s in snaps)

def test_diff_added(db):
    add_token(make_token(name="color/pre", value="#111"), db)
    sid = save_snapshot("v1", "before", db_path=db)
    add_token(make_token(name="color/new", value="#222"), db)
    result = diff(sid, "current", db_path=db)
    assert result["summary"]["added"] >= 1

def test_diff_changed(db):
    t = make_token(name="color/chg", value="#111")
    add_token(t, db)
    sid = save_snapshot("v1", "before-chg", db_path=db)
    update_token(t.id, db_path=db, value="#999")
    result = diff(sid, "current", db_path=db)
    assert result["summary"]["changed"] >= 1


# ── Validate ──────────────────────────────────────────────────────────────────
def test_validate_all_clean(db):
    add_token(make_token(name="color/clean", value="#fff"), db)
    result = validate_all(db)
    assert result["summary"]["invalid"] == 0

def test_validate_all_summary_fields(db):
    result = validate_all(db)
    for key in ("total","valid","invalid","deprecated"):
        assert key in result["summary"]


# ── Seed ─────────────────────────────────────────────────────────────────────
def test_seed_defaults(db):
    n = seed_defaults(db)
    assert n > 20
    tokens = list_tokens(db_path=db)
    assert any(t.category == "color" for t in tokens)
    assert any(t.category == "spacing" for t in tokens)

def test_seed_idempotent(db):
    n1 = seed_defaults(db)
    n2 = seed_defaults(db)
    assert n2 == 0  # nothing added second time


# ── Import ────────────────────────────────────────────────────────────────────
def test_import_json(db, tmp_path):
    data = {
        "color-primary": {"$value": "#3b82f6", "$type": "color", "$description": "Blue"},
        "spacing-4":     {"$value": "16px",    "$type": "spacing"},
    }
    f = tmp_path / "tokens.json"
    f.write_text(json.dumps(data))
    added, skipped, errors = import_json(str(f), db)
    assert added == 2
    assert skipped == 0
    assert errors == []

def test_import_json_skips_duplicates(db, tmp_path):
    data = {"color/imp-dup": {"$value": "#fff", "$type": "color"}}
    f = tmp_path / "t.json"
    f.write_text(json.dumps(data))
    import_json(str(f), db)
    added, skipped, _ = import_json(str(f), db)
    assert added   == 0
    assert skipped == 1
