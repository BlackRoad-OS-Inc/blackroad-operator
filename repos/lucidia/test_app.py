import importlib
import os
import pytest

from lucidia.app import app, reset_all_session_state


@pytest.fixture(autouse=True)
def clear_state():
    """Ensure each test has an isolated execution environment."""
    reset_all_session_state()
import subprocess
import sys

from lucidia.app import ALLOWLISTED_PACKAGES, app
import tempfile
from pathlib import Path

_GIT_IDENTITY_ENV = {
    "GIT_AUTHOR_NAME": "Lucidia Tests",
    "GIT_AUTHOR_EMAIL": "lucidia-tests@example.com",
    "GIT_COMMITTER_NAME": "Lucidia Tests",
    "GIT_COMMITTER_EMAIL": "lucidia-tests@example.com",
}


def _git(repo: Path, *args: str) -> None:
    """Run git commands with deterministic identity suitable for CI."""
    env = os.environ.copy()
    env.update(_GIT_IDENTITY_ENV)
    subprocess.run(
        ["git", *args],
        cwd=repo,
        check=True,
        capture_output=True,
        env=env,
    )

os.environ.setdefault("LUCIDIA_WORKSPACE", str(Path(__file__).resolve().parent))

app_module = importlib.import_module("lucidia.app")
app = app_module.app
WORKSPACE_ROOT = app_module.WORKSPACE_ROOT


def test_index():
    client = app.test_client()
    resp = client.get("/")
    assert resp.status_code == 200
    assert b"Lucidia Co Coding Portal" in resp.data


def test_run_code():
    client = app.test_client()
    resp = client.post("/run", json={"code": "print('hi')"})
    assert resp.status_code == 200
    assert "hi" in resp.get_json()["output"]


def test_state_and_builtins():
    client = app.test_client()
    client.post("/run", json={"code": "nums = list(range(3))"})
    resp = client.post("/run", json={"code": "print(len(nums))"})
    assert resp.status_code == 200
    assert resp.get_json()["output"].strip() == "3"


def test_safe_builtins_are_isolated_per_request():
    client = app.test_client()
    tamper_resp = client.post(
        "/run",
        json={"code": "__builtins__['len'] = lambda items: 999"},
    )
    assert tamper_resp.status_code == 200

    resp = client.post("/run", json={"code": "print(len([1, 2, 3]))"})
    assert resp.status_code == 200
    assert resp.get_json()["output"].strip() == "3"


def test_state_is_not_shared_across_sessions():
    client_a = app.test_client()
    client_b = app.test_client()

    resp_a = client_a.post("/run", json={"code": "secret = 123"})
    assert resp_a.status_code == 200

    resp_b = client_b.post("/run", json={"code": "print('secret' in globals())"})
    assert resp_b.status_code == 200
    assert resp_b.get_json()["output"].strip() == "False"


def test_state_mutations_do_not_persist_between_sessions():
    client_a = app.test_client()
    client_b = app.test_client()

    client_a.post("/run", json={"code": "__builtins__ = {}; value = 42"})

    resp_a = client_a.post("/run", json={"code": "print(value)"})
    assert resp_a.status_code == 200
    assert resp_a.get_json()["output"].strip() == "42"

    resp_b = client_b.post("/run", json={"code": "print('value' in globals())"})
    assert resp_b.status_code == 200
    assert resp_b.get_json()["output"].strip() == "False"
def test_run_code_math():
    client = app.test_client()
    resp = client.post("/run", json={"code": "print(math.sqrt(16))"})
    assert resp.status_code == 200
    assert "4.0" in resp.get_json()["output"]


def test_run_code_rejects_import():
    """The code runner should block obvious security issues like imports."""
    client = app.test_client()
    resp = client.post("/run", json={"code": "import os"})
    assert resp.status_code == 400


def test_install_package():
    client = app.test_client()
    resp = client.post("/run", json={"code": "import os"})
    assert resp.status_code == 400


def test_install_package_allowlisted(monkeypatch):
    client = app.test_client()

    called = {}

    def fake_run(cmd, capture_output, text, env):
        called["cmd"] = cmd
        called["env"] = env

        class Result:
            returncode = 0
            stdout = "installed"
            stderr = ""

        return Result()

    monkeypatch.setattr("lucidia.app.subprocess.run", fake_run)

    resp = client.post("/install", json={"package": "itsdangerous"})
    data = resp.get_json()

    assert resp.status_code == 200
    assert data["code"] == 0
    assert called["cmd"] == [
        sys.executable,
        "-m",
        "pip",
        "install",
        "--disable-pip-version-check",
        "--no-deps",
        "--no-build-isolation",
        ALLOWLISTED_PACKAGES["itsdangerous"],
    ]
    assert called["env"].get("PIP_NO_INPUT") == "1"
def test_install_package():
    client = app.test_client()
def test_install_package(monkeypatch):
    client = app.test_client()

    class FakeCompletedProcess:
        returncode = 0
        stdout = "installed"
        stderr = ""

    calls: list[list[str]] = []

    def fake_run(
        cmd, capture_output, text, **kwargs
    ):  # noqa: ANN001, ARG002 - match subprocess signature
        calls.append(cmd)
        return FakeCompletedProcess()

    monkeypatch.setattr("lucidia.app.subprocess.run", fake_run)

    resp = client.post("/install", json={"package": "itsdangerous==2.2.0"})
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["code"] == 0


def test_install_package_invalid():
    client = app.test_client()
    resp = client.post("/install", json={"package": "bad pkg"})
    assert resp.status_code == 400


def test_install_package_rejected():
    client = app.test_client()
    resp = client.post("/install", json={"package": "numpy"})
    data = resp.get_json()
    assert resp.status_code == 403
    assert data["error"] == "package not allowed"


    assert calls == [[sys.executable, "-m", "pip", "install", "itsdangerous==2.2.0"]]


def test_install_package_missing_value():
    client = app.test_client()
    resp = client.post("/install", json={})
    assert resp.status_code == 400


def test_git_clean(tmp_path):
def test_git_clean():
    with tempfile.TemporaryDirectory(dir=WORKSPACE_ROOT) as repo_dir:
        repo = Path(repo_dir)
        _git(repo, "init")
        (repo / "tracked.txt").write_text("tracked")
        _git(repo, "add", "tracked.txt")
        _git(repo, "commit", "-m", "init")
        (repo / "untracked.txt").write_text("temp")
        client = app.test_client()
        resp = client.post("/git/clean", json={"path": str(repo)})
        assert resp.status_code == 200
        assert not (repo / "untracked.txt").exists()


def test_git_clean_invalid_repo():
    with tempfile.TemporaryDirectory(dir=WORKSPACE_ROOT) as empty_dir:
        empty_path = Path(empty_dir)
        client = app.test_client()
        resp = client.post("/git/clean", json={"path": str(empty_path)})
        assert resp.status_code == 400


def test_git_clean_rejects_outside_workspace(tmp_path, monkeypatch):
    repo = tmp_path / "repo"
    repo.mkdir()
    _git(repo, "init")
    (repo / "tracked.txt").write_text("tracked")
    _git(repo, "add", "tracked.txt")
    _git(repo, "commit", "-m", "init")

    def _fail_run(*args, **kwargs):  # pragma: no cover - should not run
        raise AssertionError("subprocess.run should not be called for disallowed paths")

    monkeypatch.setattr(app_module.subprocess, "run", _fail_run)

    client = app.test_client()
    resp = client.post("/git/clean", json={"path": str(repo)})
    assert resp.status_code == 400


def test_git_clean_rejects_symlink_traversal():
    with tempfile.TemporaryDirectory(dir=WORKSPACE_ROOT) as repo_dir:
        repo = Path(repo_dir)
        _git(repo, "init")
        (repo / "tracked.txt").write_text("tracked")
        _git(repo, "add", "tracked.txt")
        _git(repo, "commit", "-m", "init")

        symlink_path = repo.parent / f"{repo.name}-link"
        symlink_path.symlink_to(repo, target_is_directory=True)
        try:
            client = app.test_client()
            resp = client.post("/git/clean", json={"path": str(symlink_path)})
            assert resp.status_code == 400
        finally:
            symlink_path.unlink(missing_ok=True)


def test_math_endpoint():
    client = app.test_client()
    resp = client.post("/math", json={"expression": "x**2", "curious": True})
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["result"] == "x**2"
    assert data["derivative"] == "2*x"

def test_git_clean_invalid_path():
    client = app.test_client()
    resp = client.post("/git/clean", json={"path": "/does/not/exist"})
    assert resp.status_code == 400


def test_git_clean_requires_git_repo(tmp_path):
    folder = tmp_path / "plain"
    folder.mkdir()
    client = app.test_client()
    resp = client.post("/git/clean", json={"path": str(folder)})
    assert resp.status_code == 400
