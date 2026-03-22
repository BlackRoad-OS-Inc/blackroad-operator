"""Tests for the Lucidia virtual filesystem."""

import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from components.virtual_fs import VirtualFS


@pytest.fixture
def vfs(tmp_path):
    """Create a VirtualFS rooted in a temp directory."""
    return VirtualFS(root=str(tmp_path))


class TestVirtualFS:
    def test_initial_directory(self, vfs):
        """VFS should start at /home/lucidia."""
        assert vfs.pwd() == "/home/lucidia"

    def test_default_structure(self, vfs):
        """Default dirs should be created on init."""
        for d in ["/home/lucidia", "/var/log", "/etc/lucidia", "/tmp"]:
            assert (vfs.root / d.lstrip("/")).is_dir()

    def test_mkdir(self, vfs):
        vfs.mkdir("testdir")
        # mkdir is relative to cwd (/home/lucidia)
        assert (vfs.root / "home/lucidia/testdir").is_dir()

    def test_ls_empty(self, vfs):
        result = vfs.ls()
        assert isinstance(result, list)
        # Default dirs under /home/lucidia exist
        assert "Documents/" in result
        assert "Projects/" in result

    def test_write_and_cat(self, vfs):
        vfs.write("test.txt", "hello world")
        content = vfs.cat("test.txt")
        assert content == "hello world"

    def test_cd_and_pwd(self, vfs):
        vfs.mkdir("subdir")
        vfs.cd("subdir")
        assert "subdir" in vfs.pwd()
        vfs.cd("..")
        assert vfs.pwd() == "/home/lucidia"

    def test_cd_absolute(self, vfs):
        vfs.cd("/tmp")
        assert vfs.pwd() == "/tmp"

    def test_cd_home(self, vfs):
        vfs.cd("/tmp")
        vfs.cd("~")
        assert vfs.pwd() == "/home/lucidia"

    def test_rm(self, vfs):
        vfs.write("delete_me.txt", "temp")
        vfs.rm("delete_me.txt")
        assert not vfs.exists("delete_me.txt")

    def test_exists(self, vfs):
        assert not vfs.exists("nope.txt")
        vfs.write("yes.txt", "here")
        assert vfs.exists("yes.txt")

    def test_stat(self, vfs):
        vfs.write("info.txt", "data")
        s = vfs.stat("info.txt")
        assert s is not None
        assert s["size"] == 4
        assert s["is_dir"] is False

    def test_append(self, vfs):
        vfs.write("log.txt", "line1\n")
        vfs.append("log.txt", "line2\n")
        content = vfs.cat("log.txt")
        assert "line1" in content
        assert "line2" in content

    def test_rmdir(self, vfs):
        vfs.mkdir("emptydir")
        result = vfs.rmdir("emptydir")
        assert "Removed" in result
