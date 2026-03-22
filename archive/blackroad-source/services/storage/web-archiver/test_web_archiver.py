"""Tests for BlackRoad Web Archiver."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

tmpdir = Path(tempfile.mkdtemp())
os.environ["ARCHIVER_DB"] = str(tmpdir / "test_archiver.db")
os.environ["ARCHIVE_DIR"] = str(tmpdir / "archive")
sys.path.insert(0, str(Path(__file__).parent))
from main import WebArchiver, Snapshot, Site, init_db


class TestWebArchiver(unittest.TestCase):
    def setUp(self):
        init_db()
        self.archiver = WebArchiver()

    def test_register_site(self):
        site = self.archiver.register_site("https://example.com", "Example Site")
        self.assertIsNotNone(site.id)
        self.assertEqual(site.name, "Example Site")

    def test_register_site_idempotent(self):
        s1 = self.archiver.register_site("https://dedupe.com", "Dedupe")
        s2 = self.archiver.register_site("https://dedupe.com", "Dedupe Again")
        self.assertEqual(s1.id, s2.id)

    def test_capture_mock(self):
        site = self.archiver.register_site("https://mock.test", "Mock")
        html_content = "<html><head><title>Mock Page</title></head><body>Hello</body></html>"

        class MockResp:
            status = 200
            headers = {}
            def read(self): return html_content.encode()
            def __enter__(self): return self
            def __exit__(self, *a): pass

        with patch("urllib.request.urlopen", return_value=MockResp()):
            snap = self.archiver.capture("https://mock.test", site_id=site.id)

        self.assertEqual(snap.status_code, 200)
        self.assertEqual(snap.title, "Mock Page")
        self.assertIsNotNone(snap.content_hash)

    def test_compare_identical(self):
        site = self.archiver.register_site("https://compare.test", "Compare")
        html_content = "<html><body>Same</body></html>"

        class MockResp:
            status = 200
            headers = {}
            def read(self): return html_content.encode()
            def __enter__(self): return self
            def __exit__(self, *a): pass

        with patch("urllib.request.urlopen", return_value=MockResp()):
            s1 = self.archiver.capture("https://compare.test", site_id=site.id)
        with patch("urllib.request.urlopen", return_value=MockResp()):
            s2 = self.archiver.capture("https://compare.test", site_id=site.id)

        result = self.archiver.compare_snapshots(s1.id, s2.id)
        self.assertFalse(result["changed"])

    def test_compare_changed(self):
        site = self.archiver.register_site("https://change.test", "Change")

        class MockRespA:
            status = 200
            headers = {}
            def read(self): return b"<html><body>Version A</body></html>"
            def __enter__(self): return self
            def __exit__(self, *a): pass

        class MockRespB:
            status = 200
            headers = {}
            def read(self): return b"<html><body>Version B - completely different</body></html>"
            def __enter__(self): return self
            def __exit__(self, *a): pass

        with patch("urllib.request.urlopen", return_value=MockRespA()):
            s1 = self.archiver.capture("https://change.test", site_id=site.id)
        with patch("urllib.request.urlopen", return_value=MockRespB()):
            s2 = self.archiver.capture("https://change.test", site_id=site.id)

        result = self.archiver.compare_snapshots(s1.id, s2.id)
        self.assertTrue(result["changed"])

    def test_list_sites(self):
        self.archiver.register_site("https://list1.test", "List 1")
        self.archiver.register_site("https://list2.test", "List 2")
        sites = self.archiver.list_sites()
        self.assertGreaterEqual(len(sites), 2)

    def test_stats(self):
        stats = self.archiver.stats()
        self.assertIn("sites", stats)
        self.assertIn("snapshots", stats)


if __name__ == "__main__":
    unittest.main()
