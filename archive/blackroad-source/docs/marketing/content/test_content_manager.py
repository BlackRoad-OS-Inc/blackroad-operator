"""Tests for content_manager."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))

from content_manager import (
    Content,
    create_content,
    export_sitemap,
    get_by_tag,
    get_content,
    get_revisions,
    publish,
    reading_time,
    search,
    unpublish,
    update_content,
    word_count,
)


@pytest.fixture
def tmp_db(tmp_path):
    return tmp_path / "test.db"


def test_create_and_get(tmp_db):
    c = Content(title="Hello World", body="This is a test article.", author="alice")
    create_content(c, db=tmp_db)
    result = get_content(c.id, db=tmp_db)
    assert result["title"] == "Hello World"
    assert result["slug"] == "hello-world"


def test_slug_generation(tmp_db):
    c = Content(title="My Great Article!!", body="body")
    create_content(c, db=tmp_db)
    result = get_content(c.id, db=tmp_db)
    assert result["slug"] == "my-great-article"


def test_publish_unpublish(tmp_db):
    c = Content(title="Publish Test", body="content here")
    create_content(c, db=tmp_db)
    pub = publish(c.id, db=tmp_db)
    assert pub["ok"] is True
    upub = unpublish(c.id, db=tmp_db)
    assert upub["status"] == "draft"


def test_tags(tmp_db):
    c = Content(title="Tagged Content", body="body", tags=["python", "api"])
    create_content(c, db=tmp_db)
    results = get_by_tag("python", db=tmp_db)
    assert any(r["id"] == c.id for r in results)


def test_full_text_search(tmp_db):
    c1 = Content(title="Python Tutorial", body="Learn Python programming language basics")
    c2 = Content(title="JavaScript Guide", body="Learn JavaScript for web development")
    create_content(c1, db=tmp_db)
    create_content(c2, db=tmp_db)
    results = search("Python programming", db=tmp_db)
    ids = [r["id"] for r in results]
    assert c1.id in ids


def test_word_count(tmp_db):
    c = Content(title="WC Test", body="one two three four five six seven eight nine ten")
    create_content(c, db=tmp_db)
    result = word_count(c.id, db=tmp_db)
    assert result["word_count"] == 10


def test_reading_time(tmp_db):
    body = " ".join(["word"] * 400)
    c = Content(title="Long Article", body=body)
    create_content(c, db=tmp_db)
    result = reading_time(c.id, wpm=200, db=tmp_db)
    assert result["reading_time_minutes"] == 2


def test_sitemap(tmp_db):
    c = Content(title="Sitemap Page", body="content", slug="sitemap-page")
    create_content(c, db=tmp_db)
    publish(c.id, db=tmp_db)
    xml = export_sitemap("https://example.com", db=tmp_db)
    assert "sitemap-page" in xml
    assert "urlset" in xml


def test_revisions(tmp_db):
    c = Content(title="Original", body="v1")
    create_content(c, db=tmp_db)
    update_content(c.id, title="Updated", body="v2", db=tmp_db)
    revs = get_revisions(c.id, db=tmp_db)
    assert len(revs) >= 1
    assert revs[0]["title"] == "Original"
