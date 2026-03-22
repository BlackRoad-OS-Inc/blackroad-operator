"""Tests for BlackRoad Document Archive."""
import json
import os
import zipfile
import pytest
from document_archive import (
    add_doc, get_doc, extract_text, search, list_docs, list_collections,
    delete_doc, export_collection, bulk_import, stats, get_db,
    extract_text_from_bytes, _infer_title, _word_count, _sha256,
    _validate_collection, _fts_quote,
)


@pytest.fixture
def tmp_db(tmp_path):
    return str(tmp_path / "test_docs.db")


@pytest.fixture
def txt_file(tmp_path):
    f = tmp_path / "hello.txt"
    f.write_text("Hello World\nThis is a test document.\nWith multiple lines.")
    return str(f)


@pytest.fixture
def md_file(tmp_path):
    f = tmp_path / "readme.md"
    f.write_text("# My Project\n\nThis is the readme for my project.\n\n## Features\n- Fast\n- Reliable")
    return str(f)


@pytest.fixture
def html_file(tmp_path):
    f = tmp_path / "page.html"
    f.write_text("""<html><head><title>My HTML Page</title></head>
<body><h1>Content</h1><p>Some text here.</p>
<script>alert('skip this');</script>
<style>.hidden { display: none; }</style>
</body></html>""")
    return str(f)


@pytest.fixture
def json_file(tmp_path):
    f = tmp_path / "data.json"
    f.write_text(json.dumps({"key": "value", "items": [1, 2, 3]}))
    return str(f)


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

def test_extract_txt():
    data = b"Hello World\nLine two."
    assert extract_text_from_bytes(data, "txt") == "Hello World\nLine two."


def test_extract_md():
    data = b"# Title\n\nContent here."
    text = extract_text_from_bytes(data, "md")
    assert "Title" in text
    assert "Content here" in text


def test_extract_html_strips_tags():
    data = b"<html><body><h1>Hello</h1><p>World</p><script>skip</script></body></html>"
    text = extract_text_from_bytes(data, "html")
    assert "Hello" in text
    assert "World" in text
    assert "<h1>" not in text
    assert "skip" not in text


def test_extract_html_strips_style():
    data = b"<html><head><style>.x { color: red; }</style></head><body>Content</body></html>"
    text = extract_text_from_bytes(data, "html")
    assert "color" not in text
    assert "Content" in text


def test_extract_json():
    data = json.dumps({"name": "test", "value": 42}).encode()
    text = extract_text_from_bytes(data, "json")
    assert "test" in text
    assert "42" in text


def test_extract_xml():
    data = b"<root><item>value1</item><item>value2</item></root>"
    text = extract_text_from_bytes(data, "xml")
    assert "value1" in text
    assert "value2" in text
    assert "<item>" not in text


# ---------------------------------------------------------------------------
# Title inference
# ---------------------------------------------------------------------------

def test_infer_title_from_md_h1():
    text = "# My Great Document\n\nContent here."
    assert _infer_title(text, "doc.md", "md") == "My Great Document"


def test_infer_title_from_html():
    text = "<html><head><title>HTML Title</title></head></html>"
    assert _infer_title(text, "page.html", "html") == "HTML Title"


def test_infer_title_fallback_filename():
    title = _infer_title("", "my_document_file.txt", "txt")
    assert "My Document File" in title


# ---------------------------------------------------------------------------
# add_doc
# ---------------------------------------------------------------------------

def test_add_txt_doc(txt_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    doc = add_doc(txt_file, db_path=tmp_db)
    assert doc.id is not None
    assert doc.format == "txt"
    assert doc.size_bytes > 0
    assert len(doc.sha256) == 64
    assert doc.word_count > 0


def test_add_md_doc(md_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    doc = add_doc(md_file, db_path=tmp_db)
    assert doc.format == "md"
    assert "My Project" in doc.title


def test_add_html_doc(html_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    doc = add_doc(html_file, db_path=tmp_db)
    assert doc.format == "html"
    assert doc.title == "My HTML Page"


def test_add_doc_deduplication(txt_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    doc1 = add_doc(txt_file, db_path=tmp_db)
    doc2 = add_doc(txt_file, db_path=tmp_db)
    assert doc1.id == doc2.id


def test_add_doc_collection(txt_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    doc = add_doc(txt_file, collection="research", db_path=tmp_db)
    assert doc.collection == "research"


def test_add_doc_tags(txt_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    doc = add_doc(txt_file, tags=["important", "2024"], db_path=tmp_db)
    assert "important" in doc.tags


def test_add_doc_missing_file(tmp_db):
    with pytest.raises(FileNotFoundError):
        add_doc("/nonexistent/path/file.txt", db_path=tmp_db)


# ---------------------------------------------------------------------------
# get_doc / extract_text
# ---------------------------------------------------------------------------

def test_get_doc(txt_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    doc = add_doc(txt_file, db_path=tmp_db)
    fetched = get_doc(doc.id, db_path=tmp_db)
    assert fetched is not None
    assert fetched.id == doc.id


def test_get_doc_missing(tmp_db):
    assert get_doc("nonexistent", db_path=tmp_db) is None


def test_extract_text_content(txt_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    doc = add_doc(txt_file, db_path=tmp_db)
    text = extract_text(doc.id, db_path=tmp_db)
    assert "Hello World" in text


def test_extract_text_missing(tmp_db):
    with pytest.raises(ValueError):
        extract_text("nonexistent", db_path=tmp_db)


# ---------------------------------------------------------------------------
# search (FTS5)
# ---------------------------------------------------------------------------

def test_search_finds_content(txt_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    add_doc(txt_file, db_path=tmp_db)
    results = search("Hello", db_path=tmp_db)
    assert len(results) >= 1


def test_search_collection_filter(txt_file, md_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    add_doc(txt_file, collection="col-a", db_path=tmp_db)
    add_doc(md_file, collection="col-b", db_path=tmp_db)
    results = search("Project", collection="col-b", db_path=tmp_db)
    assert all(doc.collection == "col-b" for doc, _ in results)


def test_search_no_results(txt_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    add_doc(txt_file, db_path=tmp_db)
    results = search("xyznonexistent123456", db_path=tmp_db)
    assert results == []


# ---------------------------------------------------------------------------
# list_docs / list_collections
# ---------------------------------------------------------------------------

def test_list_docs_empty(tmp_db):
    assert list_docs(db_path=tmp_db) == []


def test_list_docs_multiple(txt_file, md_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    add_doc(txt_file, db_path=tmp_db)
    add_doc(md_file, db_path=tmp_db)
    docs = list_docs(db_path=tmp_db)
    assert len(docs) == 2


def test_list_docs_by_collection(txt_file, md_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    add_doc(txt_file, collection="alpha", db_path=tmp_db)
    add_doc(md_file, collection="beta", db_path=tmp_db)
    alpha = list_docs(collection="alpha", db_path=tmp_db)
    assert len(alpha) == 1
    assert alpha[0].collection == "alpha"


def test_list_docs_by_format(txt_file, md_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    add_doc(txt_file, db_path=tmp_db)
    add_doc(md_file, db_path=tmp_db)
    md_docs = list_docs(fmt="md", db_path=tmp_db)
    assert len(md_docs) == 1
    assert md_docs[0].format == "md"


def test_list_collections(txt_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    add_doc(txt_file, collection="mygroup", db_path=tmp_db)
    cols = list_collections(db_path=tmp_db)
    names = [c["name"] for c in cols]
    assert "mygroup" in names


# ---------------------------------------------------------------------------
# delete_doc
# ---------------------------------------------------------------------------

def test_delete_doc(txt_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    doc = add_doc(txt_file, db_path=tmp_db)
    assert delete_doc(doc.id, remove_file=True, db_path=tmp_db)
    assert get_doc(doc.id, db_path=tmp_db) is None


def test_delete_doc_missing(tmp_db):
    assert not delete_doc("nonexistent", db_path=tmp_db)


# ---------------------------------------------------------------------------
# export_collection
# ---------------------------------------------------------------------------

def test_export_collection_zip(txt_file, md_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    add_doc(txt_file, collection="export-test", db_path=tmp_db)
    add_doc(md_file, collection="export-test", db_path=tmp_db)
    out = str(tmp_path / "export.zip")
    path = export_collection("export-test", output_path=out, db_path=tmp_db)
    assert os.path.exists(path)
    with zipfile.ZipFile(path) as zf:
        names = zf.namelist()
    assert "manifest.json" in names
    data = json.loads(zipfile.ZipFile(path).read("manifest.json"))
    assert data["collection"] == "export-test"
    assert data["document_count"] == 2


def test_export_collection_empty(tmp_db):
    with pytest.raises(ValueError):
        export_collection("nonexistent-collection", db_path=tmp_db)


# ---------------------------------------------------------------------------
# bulk_import
# ---------------------------------------------------------------------------

def test_bulk_import_directory(tmp_path, tmp_db):
    store = tmp_path / "store"
    store.mkdir()
    os.environ["DOC_ARCHIVE_STORE"] = str(store)
    src = tmp_path / "docs"
    src.mkdir()
    (src / "a.txt").write_text("Document A content")
    (src / "b.md").write_text("# Document B\n\nContent B")
    (src / "c.txt").write_text("Document C content")
    docs = bulk_import(str(src), collection="bulk-test", db_path=tmp_db)
    assert len(docs) == 3


def test_bulk_import_recursive(tmp_path, tmp_db):
    store = tmp_path / "store"
    store.mkdir()
    os.environ["DOC_ARCHIVE_STORE"] = str(store)
    src = tmp_path / "docs"
    src.mkdir()
    (src / "root.txt").write_text("Root doc")
    subdir = src / "sub"
    subdir.mkdir()
    (subdir / "nested.txt").write_text("Nested doc")
    docs = bulk_import(str(src), recursive=True, db_path=tmp_db)
    assert len(docs) == 2


def test_bulk_import_nonrecursive(tmp_path, tmp_db):
    store = tmp_path / "store"
    store.mkdir()
    os.environ["DOC_ARCHIVE_STORE"] = str(store)
    src = tmp_path / "docs"
    src.mkdir()
    (src / "root.txt").write_text("Root doc")
    subdir = src / "sub"
    subdir.mkdir()
    (subdir / "nested.txt").write_text("Nested doc")
    docs = bulk_import(str(src), recursive=False, db_path=tmp_db)
    assert len(docs) == 1  # Only root-level file


# ---------------------------------------------------------------------------
# stats
# ---------------------------------------------------------------------------

def test_stats_empty(tmp_db):
    s = stats(db_path=tmp_db)
    assert s["total_documents"] == 0
    assert s["total_words"] == 0


def test_stats_populated(txt_file, md_file, tmp_db, tmp_path):
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    add_doc(txt_file, db_path=tmp_db)
    add_doc(md_file, db_path=tmp_db)
    s = stats(db_path=tmp_db)
    assert s["total_documents"] == 2
    assert s["total_size_bytes"] > 0
    assert s["total_words"] > 0


def test_word_count():
    assert _word_count("hello world foo bar") == 4
    assert _word_count("  spaces   around  ") == 2
    assert _word_count("") == 0


def test_sha256_consistency():
    h = _sha256(b"test")
    assert len(h) == 64
    assert _sha256(b"test") == h


def test_db_schema(tmp_path):
    db_path = str(tmp_path / "fresh.db")
    conn = get_db(db_path)
    tables = {r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()}
    assert "documents" in tables
    assert "documents_fts" in tables
    assert "collections" in tables


# ---------------------------------------------------------------------------
# Production-level: input validation
# ---------------------------------------------------------------------------

def test_validate_collection_valid():
    _validate_collection("default")
    _validate_collection("my-collection")
    _validate_collection("Col_2024")
    _validate_collection("a")


def test_validate_collection_invalid():
    with pytest.raises(ValueError):
        _validate_collection("../../etc/passwd")
    with pytest.raises(ValueError):
        _validate_collection("bad/name")
    with pytest.raises(ValueError):
        _validate_collection("bad name")
    with pytest.raises(ValueError):
        _validate_collection("")
    with pytest.raises(ValueError):
        _validate_collection("a" * 65)


def test_add_doc_invalid_collection(txt_file, tmp_db):
    with pytest.raises(ValueError):
        add_doc(txt_file, collection="../../etc", db_path=tmp_db)


def test_bulk_import_invalid_collection(tmp_path, tmp_db):
    src = tmp_path / "docs"
    src.mkdir()
    (src / "a.txt").write_text("content")
    with pytest.raises(ValueError):
        bulk_import(str(src), collection="../bad", db_path=tmp_db)


# ---------------------------------------------------------------------------
# Production-level: FTS5 quoting helper
# ---------------------------------------------------------------------------

def test_fts_quote_plain():
    assert _fts_quote("hello") == '"hello"'


def test_fts_quote_escapes_double_quotes():
    assert _fts_quote('say "hi"') == '"say ""hi"""'


def test_search_with_quoted_collection(txt_file, tmp_db, tmp_path):
    """Search with a collection name that contains FTS5 special chars falls back safely."""
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    add_doc(txt_file, collection="default", db_path=tmp_db)
    # A collection name with FTS5 special chars should not crash
    results = search("Hello", collection='col"injection', db_path=tmp_db)
    assert isinstance(results, list)


# ---------------------------------------------------------------------------
# Production-level: get_db with no parent directory
# ---------------------------------------------------------------------------

def test_get_db_no_parent_dir(tmp_path):
    """get_db should work when db path has no parent (bare filename in cwd)."""
    import os
    old_cwd = os.getcwd()
    try:
        os.chdir(tmp_path)
        conn = get_db("bare.db")
        assert conn is not None
        conn.close()
    finally:
        os.chdir(old_cwd)


# ---------------------------------------------------------------------------
# Production-level: add_doc returns full content (no truncation)
# ---------------------------------------------------------------------------

def test_add_doc_content_not_truncated(tmp_db, tmp_path):
    """add_doc must return the full extracted content, not a 200-char truncation."""
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    long_text = "word " * 100  # 500 chars
    f = tmp_path / "long.txt"
    f.write_text(long_text)
    doc = add_doc(str(f), db_path=tmp_db)
    assert len(doc.content) > 200


# ---------------------------------------------------------------------------
# Production-level: timestamps use UTC (no deprecation)
# ---------------------------------------------------------------------------

def test_timestamp_format(txt_file, tmp_db, tmp_path):
    """Timestamps must end with 'Z' and be ISO 8601."""
    os.environ["DOC_ARCHIVE_STORE"] = str(tmp_path / "store")
    doc = add_doc(txt_file, db_path=tmp_db)
    assert doc.created_at.endswith("Z")
    assert "T" in doc.created_at
    assert "+" not in doc.created_at

