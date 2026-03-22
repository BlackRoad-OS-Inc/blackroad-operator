"""Tests for BlackRoad IPFS Content Tracker."""
import json
import os
import pytest
from ipfs_content_tracker import (
    add_content, get_content, list_content, search, pin_content, unpin_content,
    export_manifest, bulk_import_from_json, delete_content, stats, get_db,
    _generate_id, cli_main,
)

FAKE_CID_1 = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
FAKE_CID_2 = "QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB"
FAKE_CID_3 = "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR"


@pytest.fixture
def tmp_db(tmp_path):
    return str(tmp_path / "test_ipfs.db")


def test_add_content_basic(tmp_db):
    c = add_content(FAKE_CID_1, name="test-file", db_path=tmp_db)
    assert c.cid == FAKE_CID_1
    assert c.name == "test-file"
    assert c.id == _generate_id(FAKE_CID_1)
    assert not c.pinned


def test_add_content_with_metadata(tmp_db):
    c = add_content(
        FAKE_CID_1, name="doc.pdf",
        content_type="application/pdf",
        description="A test document",
        tags=["archive", "important"],
        size_bytes=12345,
        db_path=tmp_db,
    )
    assert c.content_type == "application/pdf"
    assert c.description == "A test document"
    assert "archive" in c.tags
    assert c.size_bytes == 12345


def test_add_content_deduplication(tmp_db):
    c1 = add_content(FAKE_CID_1, name="file-a", db_path=tmp_db)
    c2 = add_content(FAKE_CID_1, name="file-b", db_path=tmp_db)
    assert c1.id == c2.id


def test_get_content(tmp_db):
    add_content(FAKE_CID_1, name="find-me", db_path=tmp_db)
    c = get_content(_generate_id(FAKE_CID_1), db_path=tmp_db)
    assert c is not None
    assert c.name == "find-me"


def test_get_content_missing(tmp_db):
    c = get_content("nonexistent", db_path=tmp_db)
    assert c is None


def test_list_content_empty(tmp_db):
    items = list_content(db_path=tmp_db)
    assert items == []


def test_list_content_multiple(tmp_db):
    add_content(FAKE_CID_1, db_path=tmp_db)
    add_content(FAKE_CID_2, db_path=tmp_db)
    items = list_content(db_path=tmp_db)
    assert len(items) == 2


def test_list_content_pinned_filter(tmp_db):
    conn = get_db(tmp_db)
    add_content(FAKE_CID_1, db_path=tmp_db)
    cid_id = _generate_id(FAKE_CID_1)
    conn.execute("UPDATE content SET pinned = 1 WHERE id = ?", (cid_id,))
    conn.commit()
    pinned = list_content(pinned_only=True, db_path=tmp_db)
    assert len(pinned) == 1
    assert pinned[0].cid == FAKE_CID_1


def test_list_content_tag_filter(tmp_db):
    add_content(FAKE_CID_1, tags=["red", "blue"], db_path=tmp_db)
    add_content(FAKE_CID_2, tags=["green"], db_path=tmp_db)
    assert len(list_content(tag="red", db_path=tmp_db)) == 1
    assert len(list_content(tag="green", db_path=tmp_db)) == 1
    assert len(list_content(tag="blue", db_path=tmp_db)) == 1


def test_search_by_name(tmp_db):
    add_content(FAKE_CID_1, name="annual-report-2024.pdf", db_path=tmp_db)
    add_content(FAKE_CID_2, name="photo-album.jpg", db_path=tmp_db)
    results = search("annual", db_path=tmp_db)
    assert len(results) == 1
    assert results[0].name == "annual-report-2024.pdf"


def test_search_by_description(tmp_db):
    add_content(FAKE_CID_1, description="quarterly earnings data", db_path=tmp_db)
    results = search("earnings", db_path=tmp_db)
    assert len(results) >= 1


def test_search_by_cid(tmp_db):
    add_content(FAKE_CID_1, name="file1", db_path=tmp_db)
    results = search(FAKE_CID_1[:10], db_path=tmp_db)
    assert any(r.cid == FAKE_CID_1 for r in results)


def test_search_no_results(tmp_db):
    add_content(FAKE_CID_1, name="document", db_path=tmp_db)
    assert search("xyznonexistent", db_path=tmp_db) == []


def test_delete_content(tmp_db):
    add_content(FAKE_CID_1, db_path=tmp_db)
    cid_id = _generate_id(FAKE_CID_1)
    assert delete_content(cid_id, unpin_first=False, db_path=tmp_db)
    assert get_content(cid_id, db_path=tmp_db) is None


def test_delete_content_missing(tmp_db):
    assert not delete_content("nonexistent", unpin_first=False, db_path=tmp_db)


def test_export_manifest(tmp_db, tmp_path):
    add_content(FAKE_CID_1, name="file1", tags=["a"], db_path=tmp_db)
    add_content(FAKE_CID_2, name="file2", tags=["b"], db_path=tmp_db)
    out = str(tmp_path / "manifest.json")
    path = export_manifest(output_path=out, db_path=tmp_db)
    assert os.path.exists(path)
    data = json.loads(open(path).read())
    assert data["total_items"] == 2
    assert isinstance(data["content"][0]["tags"], list)


def test_bulk_import_from_json(tmp_db, tmp_path):
    payload = [
        {"cid": FAKE_CID_1, "name": "doc1", "tags": ["imported"]},
        {"cid": FAKE_CID_2, "name": "doc2", "size_bytes": 500},
        {"cid": FAKE_CID_3, "name": "doc3", "tags": "foo,bar"},
    ]
    json_file = str(tmp_path / "import.json")
    with open(json_file, "w") as fh:
        json.dump(payload, fh)
    imported = bulk_import_from_json(json_file, auto_pin=False, db_path=tmp_db)
    assert len(imported) == 3
    assert any(c.cid == FAKE_CID_2 for c in imported)


def test_bulk_import_manifest_format(tmp_db, tmp_path):
    add_content(FAKE_CID_1, name="original", db_path=tmp_db)
    manifest_path = str(tmp_path / "manifest.json")
    export_manifest(output_path=manifest_path, db_path=tmp_db)
    new_db = str(tmp_path / "new.db")
    imported = bulk_import_from_json(manifest_path, db_path=new_db)
    assert len(imported) == 1


def test_bulk_import_missing_cid(tmp_db, tmp_path):
    payload = [{"name": "no-cid-entry"}]
    json_file = str(tmp_path / "bad.json")
    with open(json_file, "w") as fh:
        json.dump(payload, fh)
    assert bulk_import_from_json(json_file, db_path=tmp_db) == []


def test_stats(tmp_db):
    add_content(FAKE_CID_1, size_bytes=1000, db_path=tmp_db)
    add_content(FAKE_CID_2, size_bytes=2000, db_path=tmp_db)
    s = stats(db_path=tmp_db)
    assert s["total_items"] == 2
    assert s["total_size_bytes"] == 3000
    assert s["pinned_items"] == 0


def test_stats_empty(tmp_db):
    s = stats(db_path=tmp_db)
    assert s["total_items"] == 0


def test_content_to_dict_tags_as_list(tmp_db):
    c = add_content(FAKE_CID_1, tags=["alpha", "beta", "gamma"], db_path=tmp_db)
    d = c.to_dict()
    assert isinstance(d["tags"], list)
    assert "alpha" in d["tags"]


def test_pin_content_not_found(tmp_db):
    with pytest.raises(ValueError):
        pin_content("nonexistent_id", db_path=tmp_db)


def test_unpin_content_not_found(tmp_db):
    with pytest.raises(ValueError):
        unpin_content("nonexistent_id", db_path=tmp_db)


def test_gateway_url_set(tmp_db):
    c = add_content(FAKE_CID_1, db_path=tmp_db)
    assert FAKE_CID_1 in c.gateway_url
    assert c.gateway_url.startswith("https://")


def test_created_at_format(tmp_db):
    c = add_content(FAKE_CID_1, db_path=tmp_db)
    assert "T" in c.created_at
    assert c.created_at.endswith("Z")


def test_db_schema(tmp_path):
    db_path = str(tmp_path / "fresh.db")
    conn = get_db(db_path)
    tables = {r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()}
    assert "content" in tables
    assert "pin_events" in tables
    assert "availability_checks" in tables


def test_multiple_tags_filter(tmp_db):
    add_content(FAKE_CID_1, tags=["tag1", "tag2", "tag3"], db_path=tmp_db)
    add_content(FAKE_CID_2, tags=["tag2", "tag4"], db_path=tmp_db)
    add_content(FAKE_CID_3, tags=["tag5"], db_path=tmp_db)
    assert len(list_content(tag="tag2", db_path=tmp_db)) == 2
    assert len(list_content(tag="tag5", db_path=tmp_db)) == 1


def test_pinned_field_is_bool_when_read_from_db(tmp_db):
    """Content.pinned must be a Python bool (not int) when loaded from SQLite."""
    add_content(FAKE_CID_1, db_path=tmp_db)
    conn = get_db(tmp_db)
    conn.execute("UPDATE content SET pinned = 1 WHERE id = ?", (_generate_id(FAKE_CID_1),))
    conn.commit()
    c = list_content(db_path=tmp_db)[0]
    assert c.pinned is True
    assert c.to_dict()["pinned"] is True


def test_search_like_wildcard_not_expanded(tmp_db):
    """'%' and '_' in search query must not act as SQL wildcards."""
    add_content(FAKE_CID_1, name="annual-report", db_path=tmp_db)
    add_content(FAKE_CID_2, name="photo-album", db_path=tmp_db)
    assert search("%", db_path=tmp_db) == []
    assert search("_", db_path=tmp_db) == []
    # Normal text search should still work
    assert len(search("annual", db_path=tmp_db)) == 1


def test_cli_pin_not_found_returns_error(tmp_db, capsys):
    """CLI 'pin' with unknown ID should print an error and return exit code 1."""
    ret = cli_main(["pin", "nonexistent", "--db", tmp_db])
    assert ret == 1
    captured = capsys.readouterr()
    assert "nonexistent" in captured.err


def test_cli_unpin_not_found_returns_error(tmp_db, capsys):
    """CLI 'unpin' with unknown ID should print an error and return exit code 1."""
    ret = cli_main(["unpin", "nonexistent", "--db", tmp_db])
    assert ret == 1
    captured = capsys.readouterr()
    assert "nonexistent" in captured.err


def test_now_is_utc_isoformat():
    """_now() must return a UTC ISO-8601 string ending with 'Z'."""
    from ipfs_content_tracker import _now
    s = _now()
    assert s.endswith("Z")
    assert "T" in s
    # Must not contain timezone offset like +00:00
    assert "+00:00" not in s
