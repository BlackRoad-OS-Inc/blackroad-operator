"""Tests for social_media_api."""

import json
import tempfile
import textwrap
from pathlib import Path

import pytest

import sys
sys.path.insert(0, str(Path(__file__).parent))

from social_media_api import (
    SocialPost,
    bulk_import,
    export_report,
    get_analytics,
    hashtag_suggestions,
    list_posts,
    publish_now,
    schedule_post,
    update_analytics,
)


@pytest.fixture
def tmp_db(tmp_path):
    return tmp_path / "test.db"


def test_schedule_post_sets_status(tmp_db):
    post = SocialPost(platform="twitter", content="Hello world")
    result = schedule_post(post, db=tmp_db)
    assert result.status == "draft"

    post2 = SocialPost(
        platform="instagram",
        content="Scheduled post",
        scheduled_at="2099-01-01T12:00:00Z",
    )
    result2 = schedule_post(post2, db=tmp_db)
    assert result2.status == "scheduled"


def test_publish_now(tmp_db):
    post = SocialPost(platform="linkedin", content="Live post")
    schedule_post(post, db=tmp_db)
    result = publish_now(post.id, db=tmp_db)
    assert result["ok"] is True
    assert result["post_id"] == post.id


def test_publish_now_missing(tmp_db):
    result = publish_now("nonexistent-id", db=tmp_db)
    assert result["ok"] is False


def test_get_analytics(tmp_db):
    post = SocialPost(platform="facebook", content="Analytics test")
    schedule_post(post, db=tmp_db)
    publish_now(post.id, db=tmp_db)
    update_analytics(post.id, impressions=500, likes=42, shares=7, db=tmp_db)
    stats = get_analytics(post.id, db=tmp_db)
    assert stats["impressions"] >= 500
    assert stats["likes"] >= 42


def test_hashtag_suggestions():
    content = "Python programming is great for data science and machine learning automation"
    tags = hashtag_suggestions(content, top_n=5)
    assert len(tags) <= 5
    for tag in tags:
        assert tag.startswith("#")


def test_bulk_import(tmp_db, tmp_path):
    csv_file = tmp_path / "posts.csv"
    csv_file.write_text(textwrap.dedent("""\
        platform,content,media_urls,scheduled_at,status
        twitter,First post,,2099-06-01T10:00:00Z,scheduled
        instagram,Second post,https://img.example.com,,draft
    """))
    result = bulk_import(str(csv_file), db=tmp_db)
    assert result["imported"] == 2
    assert result["errors"] == []


def test_export_report(tmp_db):
    for i in range(3):
        post = SocialPost(platform="twitter", content=f"Post {i}")
        schedule_post(post, db=tmp_db)
        publish_now(post.id, db=tmp_db)
    rows = export_report(days=1, db=tmp_db)
    assert len(rows) >= 3


def test_list_posts_filter(tmp_db):
    post = SocialPost(platform="twitter", content="Draft post")
    schedule_post(post, db=tmp_db)
    drafts = list_posts(status="draft", db=tmp_db)
    assert any(p["id"] == post.id for p in drafts)
