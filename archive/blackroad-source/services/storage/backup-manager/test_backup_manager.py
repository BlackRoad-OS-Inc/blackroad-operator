"""Tests for BlackRoad Backup Manager."""
import json
import os
import sys
import tarfile
import tempfile
import unittest
from pathlib import Path

tmpdir = Path(tempfile.mkdtemp())
os.environ["BACKUP_DB"] = str(tmpdir / "test_backups.db")
os.environ["BACKUP_STORE"] = str(tmpdir / "store")
sys.path.insert(0, str(Path(__file__).parent))
from main import BackupManager, init_db


class TestBackupManager(unittest.TestCase):
    def setUp(self):
        init_db()
        self.mgr = BackupManager()
        self.tmp = Path(tempfile.mkdtemp())

    def _make_source(self, files: dict[str, str]) -> Path:
        src = Path(tempfile.mkdtemp())
        for name, content in files.items():
            (src / name).write_text(content)
        return src

    def test_register_target(self):
        t = self.mgr.register_target("MyTarget", "/tmp")
        self.assertIsNotNone(t.id)
        self.assertEqual(t.name, "MyTarget")

    def test_backup_directory(self):
        src = self._make_source({"a.txt": "hello", "b.txt": "world"})
        t = self.mgr.register_target("TestBackup", str(src))
        b = self.mgr.run_backup(t.id)
        self.assertEqual(b.status, "success")
        self.assertGreater(b.file_size, 0)
        self.assertEqual(b.files_count, 2)

    def test_verify_backup(self):
        src = self._make_source({"test.txt": "verify me"})
        t = self.mgr.register_target("VerifyTarget", str(src))
        b = self.mgr.run_backup(t.id)
        result = self.mgr.verify_backup(b.id)
        self.assertTrue(result["valid"])

    def test_restore_backup(self):
        src = self._make_source({"restore.txt": "restore content"})
        t = self.mgr.register_target("RestoreTarget", str(src))
        b = self.mgr.run_backup(t.id)
        restore_dir = self.tmp / "restored"
        result = self.mgr.restore_backup(b.id, str(restore_dir))
        self.assertEqual(result["status"], "success")
        self.assertGreater(result["files_restored"], 0)

    def test_retention_enforcement(self):
        src = self._make_source({"f.txt": "x"})
        t = self.mgr.register_target("RetentionTest", str(src), retention_count=2)
        for _ in range(4):
            self.mgr.run_backup(t.id)
        result = self.mgr.enforce_retention(t.id)
        self.assertGreaterEqual(result["deleted"], 2)

    def test_list_backups(self):
        src = self._make_source({"g.txt": "y"})
        t = self.mgr.register_target("ListTest", str(src))
        self.mgr.run_backup(t.id)
        backups = self.mgr.list_backups(target_id=t.id)
        self.assertGreaterEqual(len(backups), 1)

    def test_storage_summary(self):
        stats = self.mgr.storage_summary()
        self.assertIn("total_backups", stats)
        self.assertIn("total_size_mb", stats)


if __name__ == "__main__":
    unittest.main()
