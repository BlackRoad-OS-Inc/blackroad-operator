"""Tests for compliance_scanner.py"""
import json
import pytest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
from compliance_scanner import (
    scan, generate_report, fix_report, list_scan_history,
    ALL_FRAMEWORKS, GDPR_RULES, HIPAA_RULES, SOC2_RULES
)


@pytest.fixture
def tmp_db(tmp_path):
    return tmp_path / "test_scanner.db"


@pytest.fixture
def dummy_project(tmp_path):
    """Create a minimal project with some compliance signals."""
    src = tmp_path / "src"
    src.mkdir()
    (src / "auth.py").write_text("""
import jwt
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        return f(*args, **kwargs)
    return decorated

def hash_password(pw):
    import bcrypt
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt())
""")
    (src / "config.py").write_text("""
import ssl
import logging

SSL_CONTEXT = ssl.create_default_context()
TLS_VERSION = "TLS 1.3"
LOG_LEVEL = logging.INFO

# audit trail
audit_logger = logging.getLogger('audit')
""")
    (tmp_path / "SECURITY.md").write_text("# Security Policy\nReport vulnerabilities here.")
    gh_dir = tmp_path / ".github"
    gh_dir.mkdir(exist_ok=True)
    (gh_dir / "dependabot.yml").write_text("version: 2\nupdates: []")
    return tmp_path


@pytest.fixture
def empty_project(tmp_path):
    """Project with no compliance signals."""
    (tmp_path / "main.py").write_text("print('hello')\n")
    return tmp_path


def test_scan_gdpr(dummy_project, tmp_db):
    result = scan(str(dummy_project), framework="gdpr", db_path=tmp_db)
    assert result.framework == "gdpr"
    assert result.scan_id
    assert result.passed + result.failed == len(GDPR_RULES)
    assert 0 <= result.score <= 100


def test_scan_hipaa(dummy_project, tmp_db):
    result = scan(str(dummy_project), framework="hipaa", db_path=tmp_db)
    assert result.framework == "hipaa"
    assert result.passed + result.failed == len(HIPAA_RULES)


def test_scan_soc2(dummy_project, tmp_db):
    result = scan(str(dummy_project), framework="soc2", db_path=tmp_db)
    assert result.framework == "soc2"
    assert result.passed + result.failed == len(SOC2_RULES)


def test_empty_project_scores_low(empty_project, tmp_db):
    result = scan(str(empty_project), framework="gdpr", db_path=tmp_db)
    assert result.passed == 0
    assert result.score == 0.0


def test_dummy_project_detects_encryption(dummy_project, tmp_db):
    result = scan(str(dummy_project), framework="gdpr", db_path=tmp_db)
    enc_finding = next(f for f in result.findings if f.rule_id == "GDPR-ART5-1F")
    assert enc_finding.status == "PASS"
    assert len(enc_finding.matched_files) > 0


def test_dummy_project_detects_access_control(dummy_project, tmp_db):
    result = scan(str(dummy_project), framework="gdpr", db_path=tmp_db)
    ac_finding = next(f for f in result.findings if f.rule_id == "GDPR-ART32")
    assert ac_finding.status == "PASS"


def test_generate_report_text(dummy_project, tmp_db):
    result = scan(str(dummy_project), framework="gdpr", db_path=tmp_db)
    report = generate_report(result, fmt="text")
    assert "COMPLIANCE REPORT" in report
    assert "GDPR" in report
    assert "Score:" in report
    assert "✅" in report or "❌" in report


def test_generate_report_json(dummy_project, tmp_db):
    result = scan(str(dummy_project), framework="gdpr", db_path=tmp_db)
    report = generate_report(result, fmt="json")
    data = json.loads(report)
    assert "scan_id" in data
    assert "findings" in data
    assert isinstance(data["findings"], list)


def test_fix_report_all_pass(dummy_project, tmp_db):
    # Simulate all passing
    result = scan(str(dummy_project), framework="soc2", db_path=tmp_db)
    for f in result.findings:
        f.status = "PASS"
    plan = fix_report(result)
    assert "Nothing to fix" in plan


def test_fix_report_has_actions(empty_project, tmp_db):
    result = scan(str(empty_project), framework="gdpr", db_path=tmp_db)
    plan = fix_report(result)
    assert "REMEDIATION PLAN" in plan
    assert "action(s) required" in plan
    assert "Fix:" in plan


def test_invalid_framework(dummy_project, tmp_db):
    with pytest.raises(ValueError, match="Unknown framework"):
        scan(str(dummy_project), framework="pci_dss", db_path=tmp_db)


def test_invalid_path(tmp_db):
    with pytest.raises(ValueError, match="does not exist"):
        scan("/nonexistent/path/xyz", framework="gdpr", db_path=tmp_db)


def test_scan_history_persisted(dummy_project, tmp_db):
    scan(str(dummy_project), framework="gdpr", db_path=tmp_db)
    scan(str(dummy_project), framework="hipaa", db_path=tmp_db)
    history = list_scan_history(db_path=tmp_db)
    assert len(history) == 2


def test_scan_history_filtered(dummy_project, tmp_db):
    scan(str(dummy_project), framework="gdpr", db_path=tmp_db)
    scan(str(dummy_project), framework="soc2", db_path=tmp_db)
    gdpr_history = list_scan_history(framework="gdpr", db_path=tmp_db)
    assert all(h["framework"] == "gdpr" for h in gdpr_history)
    assert len(gdpr_history) == 1


def test_all_frameworks_have_rules():
    for fw, rules in ALL_FRAMEWORKS.items():
        assert len(rules) >= 6, f"Framework {fw} has too few rules"
        for rule_id, rule in rules.items():
            assert "description" in rule
            assert "severity" in rule
            assert "remediation" in rule
            assert "check" in rule
