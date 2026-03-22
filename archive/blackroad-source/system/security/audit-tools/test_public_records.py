"""Tests for public_records.py"""
import pytest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
from public_records import (
    create_document, publish, retract, update_document, get_document,
    search, list_documents, export_bundle, submit_foia, fulfill_foia,
    list_foia, VALID_CATEGORIES
)


@pytest.fixture
def tmp_db(tmp_path):
    return tmp_path / "test_records.db"


def test_create_document(tmp_db):
    doc = create_document("Test Doc", "budget", "Body text", "admin",
                          tags="finance,q1", db_path=tmp_db)
    assert doc.id
    assert doc.title == "Test Doc"
    assert doc.is_public is False
    assert doc.version == 1


def test_invalid_category(tmp_db):
    with pytest.raises(ValueError, match="Unknown category"):
        create_document("Bad", "secret_category", "body", "user", db_path=tmp_db)


def test_publish_document(tmp_db):
    doc = create_document("Minutes", "minutes", "Content", "clerk", db_path=tmp_db)
    assert doc.is_public is False
    published = publish(doc.id, db_path=tmp_db)
    assert published.is_public is True


def test_retract_document(tmp_db):
    doc = create_document("Report", "report", "Sensitive", "admin", db_path=tmp_db)
    publish(doc.id, db_path=tmp_db)
    retracted = retract(doc.id, db_path=tmp_db)
    assert retracted.is_public is False


def test_get_document(tmp_db):
    doc = create_document("Ordinance 42", "ordinance", "...", "council", db_path=tmp_db)
    fetched = get_document(doc.id, db_path=tmp_db)
    assert fetched.title == "Ordinance 42"


def test_get_document_not_found(tmp_db):
    result = get_document("nonexistent", db_path=tmp_db)
    assert result is None


def test_get_public_only_fails_for_private(tmp_db):
    doc = create_document("Private", "audit", "secret", "admin", db_path=tmp_db)
    result = get_document(doc.id, public_only=True, db_path=tmp_db)
    assert result is None


def test_update_document_bumps_version(tmp_db):
    doc = create_document("Original Title", "policy", "Old body", "author", db_path=tmp_db)
    updated = update_document(doc.id, title="Updated Title", body="New body", db_path=tmp_db)
    assert updated.version == 2
    assert updated.title == "Updated Title"
    assert updated.body == "New body"


def test_search_by_keyword(tmp_db):
    create_document("Budget 2025", "budget", "fiscal year allocation", "finance",
                    is_public=True, db_path=tmp_db)
    create_document("Meeting Agenda", "agenda", "quarterly board meeting", "clerk",
                    is_public=True, db_path=tmp_db)
    results = search("fiscal", db_path=tmp_db)
    assert len(results) == 1
    assert results[0].title == "Budget 2025"


def test_search_private_excluded_by_default(tmp_db):
    create_document("Public Doc", "notice", "public content", "user",
                    is_public=True, db_path=tmp_db)
    create_document("Private Doc", "notice", "public content here too", "user",
                    is_public=False, db_path=tmp_db)
    results = search("content", public_only=True, db_path=tmp_db)
    titles = [r.title for r in results]
    assert "Public Doc" in titles
    assert "Private Doc" not in titles


def test_list_by_category(tmp_db):
    create_document("Budget A", "budget", "...", "user", db_path=tmp_db)
    create_document("Budget B", "budget", "...", "user", db_path=tmp_db)
    create_document("Resolution", "resolution", "...", "user", db_path=tmp_db)
    budgets = list_documents(category="budget", db_path=tmp_db)
    assert len(budgets) == 2


def test_export_bundle(tmp_db, tmp_path):
    create_document("Contract A", "contract", "Terms and conditions", "legal",
                    is_public=True, db_path=tmp_db)
    create_document("Contract B", "contract", "Further terms", "legal",
                    is_public=True, db_path=tmp_db)
    out_path = str(tmp_path / "contracts.zip")
    export_bundle("contract", out_path, public_only=True, db_path=tmp_db)
    import zipfile
    assert Path(out_path).exists()
    with zipfile.ZipFile(out_path) as zf:
        names = zf.namelist()
        assert "index.csv" in names
        assert len([n for n in names if n.endswith(".json")]) == 2


def test_export_bundle_empty_raises(tmp_db, tmp_path):
    out_path = str(tmp_path / "empty.zip")
    with pytest.raises(ValueError, match="No documents"):
        export_bundle("audit", out_path, db_path=tmp_db)


def test_foia_submit(tmp_db):
    req = submit_foia("Jane Doe", "Request for 2024 budget documents", db_path=tmp_db)
    assert req.id
    assert req.status == "open"
    assert req.requester == "Jane Doe"


def test_foia_fulfill(tmp_db):
    req = submit_foia("John Smith", "Personnel records", db_path=tmp_db)
    doc = create_document("Personnel Summary", "report", "Staff overview", "hr",
                          db_path=tmp_db)
    fulfilled = fulfill_foia(req.id, "Records provided.", doc_ids=[doc.id], db_path=tmp_db)
    assert fulfilled.status == "fulfilled"
    assert "Records provided." in fulfilled.response


def test_foia_list(tmp_db):
    submit_foia("Req1", "First request", db_path=tmp_db)
    submit_foia("Req2", "Second request", db_path=tmp_db)
    all_reqs = list_foia(db_path=tmp_db)
    assert len(all_reqs) == 2
    open_reqs = list_foia(status="open", db_path=tmp_db)
    assert len(open_reqs) == 2


def test_tag_list(tmp_db):
    doc = create_document("Tagged Doc", "policy", "body", "admin",
                          tags="tag1, tag2, tag3", db_path=tmp_db)
    assert doc.tag_list() == ["tag1", "tag2", "tag3"]


def test_all_valid_categories_accepted(tmp_db):
    for cat in VALID_CATEGORIES:
        doc = create_document(f"Doc {cat}", cat, "body", "user", db_path=tmp_db)
        assert doc.category == cat
